import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("activityPage") ?? "1"));
  const pageSize = Math.min(10, Math.max(1, Number(url.searchParams.get("activityPageSize") ?? "10")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const notifPage = Math.max(1, Number(url.searchParams.get("notifPage") ?? "1"));
  const notifPageSize = Math.min(10, Math.max(1, Number(url.searchParams.get("notifPageSize") ?? "10")));

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [propCount, activeCustomers, activeRequests, todayNotes, todayProps] = await Promise.all([
    supabaseAdmin.from("properties").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("customers").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("customer_requests").select("id", { count: "exact", head: true }).eq("fulfilled", false),
    supabaseAdmin
      .from("meeting_notes")
      .select("id, customer_id, created_at, customer:customers(id, first_name, last_name)", { count: "exact" })
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false })
      .range(from, to),
    supabaseAdmin
      .from("properties")
      .select("id, type, created_at, portfolio_owner:portfolio_owners(id, first_name, last_name)", { count: "exact" })
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  if (propCount.error || activeCustomers.error || activeRequests.error || todayNotes.error || todayProps.error) {
    return NextResponse.json({ error: "KPI hesaplanamadı" }, { status: 500 });
  }
  const todayNotesData = ((todayNotes.data as unknown[]) ?? []).map((n: unknown) => {
    const note = n as { customer?: { id: string; first_name: string; last_name: string } | null; customers?: Array<{ id: string; first_name: string; last_name: string }>; [key: string]: unknown };
    return {
      ...note,
      customer: note.customer ?? (Array.isArray(note.customers) ? note.customers[0] : null) ?? null,
    };
  });
  const todayPropsData = ((todayProps.data as unknown[]) ?? []).map((p: unknown) => {
    const prop = p as { portfolio_owner?: { id: string; first_name: string; last_name: string } | null; portfolio_owners?: Array<{ id: string; first_name: string; last_name: string }>; [key: string]: unknown };
    return {
      ...prop,
      portfolio_owner: prop.portfolio_owner ?? (Array.isArray(prop.portfolio_owners) ? prop.portfolio_owners[0] : null) ?? null,
    };
  });

  // Bildirimler: Son 7 günde istek girilmiş ve hiç görüşme notu eklenmemiş müşteriler
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentReq = await supabaseAdmin
    .from("customer_requests")
    .select("id, customer_id, created_at, customer:customers(id, first_name, last_name)")
    .lte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });
  if (recentReq.error) {
    return NextResponse.json({ error: "Bildirimler getirilemedi" }, { status: 500 });
  }
  const reqs = ((recentReq.data as unknown[]) ?? []).map((r: unknown) => {
    const req = r as { id: string; customer_id: string; created_at: string; customer?: { id: string; first_name: string; last_name: string } | null; customers?: Array<{ id: string; first_name: string; last_name: string }> };
    return {
      id: req.id as string,
      customer_id: req.customer_id as string,
      created_at: req.created_at as string,
      customer: req.customer ?? (Array.isArray(req.customers) ? req.customers[0] : null) ?? null,
    };
  }) as Array<{ id: string; customer_id: string; created_at: string; customer: { id: string; first_name: string; last_name: string } | null }>;
  const customerIds = Array.from(new Set(reqs.map((r) => r.customer_id)));
  // İstekten SONRA görüşme notu eklenmişse bildirim gösterme
  let notesByCustomer = new Map<string, Array<string>>();
  if (customerIds.length > 0) {
    const minReqAt = reqs.reduce((min, r) => (r.created_at < min ? r.created_at : min), reqs[0]?.created_at ?? sevenDaysAgo);
    const notes = await supabaseAdmin
      .from("meeting_notes")
      .select("customer_id, created_at")
      .in("customer_id", customerIds)
      .gte("created_at", minReqAt);
    if (notes.error) {
      return NextResponse.json({ error: "Bildirimler getirilemedi" }, { status: 500 });
    }
    notesByCustomer = new Map<string, Array<string>>();
    (notes.data ?? []).forEach((n: { customer_id: string; created_at: string }) => {
      const key = String(n.customer_id);
      const arr = notesByCustomer.get(key) ?? [];
      arr.push(String(n.created_at));
      notesByCustomer.set(key, arr);
    });
  }
  const notificationsAll = reqs
    .filter((r) => {
      const arr = notesByCustomer.get(r.customer_id) ?? [];
      // Kural: istek tarihi 7 günü geçtiyse VE ilk 7 günde hiç not girilmediyse bildir
      const sevenDaysAfterReq = new Date(new Date(r.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = new Date().toISOString();
      const isOlderThan7Days = nowIso >= sevenDaysAfterReq;
      const hasNoteWithin7Days = arr.some((t) => t >= r.created_at && t < sevenDaysAfterReq);
      return isOlderThan7Days && !hasNoteWithin7Days;
    })
    .map((r) => ({
      id: r.id,
      customer: r.customer,
      requestCreatedAt: r.created_at,
    }));
  const notificationsTotal = notificationsAll.length;
  const notifFrom = (notifPage - 1) * notifPageSize;
  const notifTo = notifFrom + notifPageSize;
  const notifications = notificationsAll.slice(notifFrom, notifTo);

  return NextResponse.json({
    kpi: {
      totalProperties: propCount.count ?? 0,
      activeCustomers: activeCustomers.count ?? 0,
      activeRequests: activeRequests.count ?? 0,
    },
    todayNotes: todayNotesData,
    todayNotesTotal: todayNotes.count ?? 0,
    todayProps: todayPropsData,
    todayPropsTotal: todayProps.count ?? 0,
    activityPage: page,
    activityPageSize: pageSize,
    notifications,
    notificationsTotal,
    notifPage,
    notifPageSize,
  });
}


