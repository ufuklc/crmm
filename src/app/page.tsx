import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import {
  Building2,
  Users,
  ListChecks,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { StatCard, AnimatedCard } from "@/components/layout/AnimatedCard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type DashboardData = {
  kpi: { totalProperties: number; activeCustomers: number; activeRequests: number };
  todayNotes: Array<{ id: string; customer: { id: string; first_name: string; last_name: string } | null; created_at: string }>;
  todayNotesTotal: number;
  todayProps: Array<{ id: string; type: string; created_at: string; portfolio_owner: { id: string; first_name: string; last_name: string } | null }>;
  activityPage: number;
  activityPageSize: number;
  notifications: Array<{ id: string; customer: { id: string; first_name: string; last_name: string } | null; requestCreatedAt: string }>;
  notificationsTotal: number;
  notifPage: number;
  notifPageSize: number;
};

export default async function Dashboard(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 1) Sadece oturum yoksa yönlendir
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    redirect("/sign-in");
  }

  // 2) Tarih / sayfalama
  const page = 1;
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const notifPage = 1;
  const notifPageSize = 10;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // 3) Verileri çek — HATA OLURSA redirect ETME, logla ve güvenli defaultlarla devam et
  const [propCount, activeCustomers, activeRequests, todayNotes, todayProps] =
    await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase
        .from("customer_requests")
        .select("id", { count: "exact", head: true })
        .eq("fulfilled", false),
      supabase
        .from("meeting_notes")
        .select("id, customer_id, created_at, customer:customers(id, first_name, last_name)", { count: "exact" })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("properties")
        .select(
          "id, type, created_at, portfolio_owner:portfolio_owners(id, first_name, last_name)",
          { count: "exact" }
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: false })
        .range(from, to),
    ]);

  if (
    propCount.error ||
    activeCustomers.error ||
    activeRequests.error ||
    todayNotes.error ||
    todayProps.error
  ) {
    console.error("Dashboard data error:", {
      propCount: propCount.error,
      activeCustomers: activeCustomers.error,
      activeRequests: activeRequests.error,
      todayNotes: todayNotes.error,
      todayProps: todayProps.error,
    });
  }

  const todayNotesData = ((todayNotes.data as unknown[]) ?? []).map((n: unknown) => {
    const note = n as {
      id: string;
      created_at: string;
      customer?: { id: string; first_name: string; last_name: string } | null;
      customers?: Array<{ id: string; first_name: string; last_name: string }>;
      [key: string]: unknown;
    };
    return {
      id: note.id,
      created_at: note.created_at,
      customer:
        note.customer ??
        (Array.isArray(note.customers) ? note.customers[0] : null) ??
        null,
    };
  });

  const todayPropsData = ((todayProps.data as unknown[]) ?? []).map((p: unknown) => {
    const prop = p as {
      id: string;
      type: string;
      created_at: string;
      portfolio_owner?: { id: string; first_name: string; last_name: string } | null;
      portfolio_owners?: Array<{ id: string; first_name: string; last_name: string }>;
      [key: string]: unknown;
    };
    return {
      id: prop.id,
      type: prop.type,
      created_at: prop.created_at,
      portfolio_owner:
        prop.portfolio_owner ??
        (Array.isArray(prop.portfolio_owners) ? prop.portfolio_owners[0] : null) ??
        null,
    };
  });

  // Bildirimler: 7 günden eski istek ve ilk 7 gün içinde hiç not yoksa
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentReq = await supabase
    .from("customer_requests")
    .select("id, customer_id, created_at, customer:customers(id, first_name, last_name)")
    .lte("created_at", sevenDaysAgo) // 7+ gün önce oluşturulanlar
    .order("created_at", { ascending: false });

  if (recentReq.error) {
    console.error("Notifications error:", recentReq.error);
  }

  const reqs = ((recentReq.data as unknown[]) ?? []).map((r: unknown) => {
    const req = r as {
      id: string;
      customer_id: string;
      created_at: string;
      customer?: { id: string; first_name: string; last_name: string } | null;
      customers?: Array<{ id: string; first_name: string; last_name: string }>;
    };
    return {
      id: req.id as string,
      customer_id: req.customer_id as string,
      created_at: req.created_at as string,
      customer:
        req.customer ??
        (Array.isArray(req.customers) ? req.customers[0] : null) ??
        null,
    };
  }) as Array<{
    id: string;
    customer_id: string;
    created_at: string;
    customer: { id: string; first_name: string; last_name: string } | null;
  }>;

  const customerIds = Array.from(new Set(reqs.map((r) => r.customer_id)));
  let notesByCustomer = new Map<string, Array<string>>();

  if (customerIds.length > 0) {
    const minReqAt = reqs.reduce(
      (min, r) => (r.created_at < min ? r.created_at : min),
      reqs[0]?.created_at ?? sevenDaysAgo
    );
    const notes = await supabase
      .from("meeting_notes")
      .select("customer_id, created_at")
      .in("customer_id", customerIds)
      .gte("created_at", minReqAt);

    if (notes.error) {
      console.error("Notes error:", notes.error);
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
      const sevenDaysAfterReq = new Date(
        new Date(r.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const nowIso = new Date().toISOString();
      const isOlderThan7Days = nowIso >= sevenDaysAfterReq;
      const hasNoteWithin7Days = arr.some(
        (t) => t >= r.created_at && t < sevenDaysAfterReq
      );
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

  const data: DashboardData = {
    kpi: {
      totalProperties: propCount.count ?? 0,
      activeCustomers: activeCustomers.count ?? 0,
      activeRequests: activeRequests.count ?? 0,
    },
    todayNotes: todayNotesData,
    todayNotesTotal: todayNotes.count ?? 0,
    todayProps: todayPropsData,
    activityPage: page,
    activityPageSize: pageSize,
    notifications,
    notificationsTotal,
    notifPage,
    notifPageSize,
  };

  const stats = [
    { label: "Toplam Varlık", value: data.kpi?.totalProperties ?? 0, icon: "Building2" },
    { label: "Aktif Müşteri", value: data.kpi?.activeCustomers ?? 0, icon: "Users" },
    { label: "Aktif İstekler", value: data.kpi?.activeRequests ?? 0, icon: "ListChecks" },
    { label: "Bugünkü Etkinlikler", value: data.todayNotesTotal, icon: "CalendarDays" },
  ];

  const quickActions = [
    { label: "Yeni Müşteri", href: "/customers/new", icon: "Users" },
    { label: "Yeni Varlık", href: "/properties/new", icon: "Building2" },
    { label: "Yeni İstek", href: "/requests/new", icon: "ListChecks" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-800">Ana Sayfa</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Two Column Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <AnimatedCard delay={0.2} className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Bugünkü Son Etkinlikler</h2>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm flex-1">
              <div className="space-y-4">
                {data.todayNotes.length === 0 && data.todayProps.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">Henüz etkinlik yok.</div>
                ) : (
                  <>
                    {data.todayNotes.length > 0 &&
                      data.todayNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-700">
                                <Link
                                  href={`/customers/${note.customer?.id ?? ""}`}
                                  className="font-medium text-blue-700 hover:underline"
                                >
                                  {note.customer
                                    ? `${note.customer.first_name} ${note.customer.last_name}`
                                    : "Müşteri"}
                                </Link>{" "}
                                ile görüşüldü.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(note.created_at).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}

                    {data.todayProps.length > 0 &&
                      data.todayProps.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Building2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-700">
                                {(prop.portfolio_owner
                                  ? `${prop.portfolio_owner.first_name} ${prop.portfolio_owner.last_name}`
                                  : "Portföy Sahibi")}{" "}
                                tarafından yeni bir{" "}
                                <Link
                                  href={`/properties/${prop.id}`}
                                  className="font-medium text-blue-700 hover:underline"
                                >
                                  {prop.type}
                                </Link>{" "}
                                eklendi.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(prop.created_at).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                  </>
                )}

                {/* (Opsiyonel) Sayfalama: todayNotes için */}
                {data.todayNotesTotal > data.activityPageSize && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {Array.from(
                      { length: Math.ceil(data.todayNotesTotal / data.activityPageSize) },
                      (_, i) => i + 1
                    ).map((p) => (
                      <Link
                        key={p}
                        href={`/?activityPage=${p}`}
                        className={`rounded-md px-3 py-1 text-sm ${
                          p === data.activityPage
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>

          {/* Notifications */}
          <AnimatedCard delay={0.3} className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Bildirim Kutusu</h2>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm flex-1">
              <div className="space-y-4">
                {data.notifications.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">
                    Takip gerektiren müşteri bulunmuyor.
                  </div>
                ) : (
                  <>
                    {data.notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-xl border bg-white border-blue-100 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-700">
                                <Link
                                  href={`/customers/${notification.customer?.id ?? ""}`}
                                  className="font-medium text-blue-700 hover:underline"
                                >
                                  {notification.customer
                                    ? `${notification.customer.first_name} ${notification.customer.last_name}`
                                    : "Müşteri"}
                                </Link>{" "}
                                ile görüşülmeli. İstek tarihi{" "}
                                {new Date(notification.requestCreatedAt).toLocaleDateString(
                                  "tr-TR"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* (Opsiyonel) Sayfalama: notifications için */}
                {data.notificationsTotal > data.notifPageSize && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {Array.from(
                      { length: Math.ceil(data.notificationsTotal / data.notifPageSize) },
                      (_, i) => i + 1
                    ).map((p) => (
                      <Link
                        key={p}
                        href={`/?notifPage=${p}`}
                        className={`rounded-md px-3 py-1 text-sm ${
                          p === data.notifPage
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* Quick Actions */}
        <AnimatedCard delay={0.5} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Hızlı Aksiyonlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Yeni Müşteri", href: "/customers/new", icon: Users },
              { label: "Yeni Varlık", href: "/properties/new", icon: Building2 },
              { label: "Yeni İstek", href: "/requests/new", icon: ListChecks },
            ].map((action) => {
              const IconComp = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 text-center hover:scale-105"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                      <IconComp className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {action.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </AnimatedCard>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Emlak CRM · Minimal dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}
