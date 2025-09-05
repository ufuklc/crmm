import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  // Enrich with owner names
  let customer: any = null;
  let portfolioOwner: any = null;
  try {
    if (data?.customer_id) {
      const c = await supabaseAdmin
        .from("customers")
        .select("id, first_name, last_name")
        .eq("id", data.customer_id)
        .single();
      if (!c.error) customer = c.data;
    }
  } catch {}
  try {
    if (data?.portfolio_owner_id) {
      const o = await supabaseAdmin
        .from("portfolio_owners")
        .select("id, first_name, last_name")
        .eq("id", data.portfolio_owner_id)
        .single();
      if (!o.error) portfolioOwner = o.data;
    }
  } catch {}
  return NextResponse.json({ property: { ...data, customer, portfolio_owner: portfolioOwner } });
}

export async function PUT(req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const payload = await req.json();
  const body = {
    ...payload,
    building_age: payload.building_age == null || payload.building_age === "" ? null : Number(payload.building_age),
  };
  const { data, error } = await supabaseAdmin
    .from("properties")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Method override desteği: HTML form POST ile _method=put/delete
export async function POST(req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    // JSON ise normal insert gibi davranma; izin verme
    return NextResponse.json({ error: "Use PUT or DELETE" }, { status: 405 });
  }
  const form = await req.formData();
  const method = String(form.get("_method") ?? "").toLowerCase();
  if (method === "delete") {
    const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/properties`, req.url);
    return NextResponse.redirect(url, 303);
  }
  if (method === "put") {
    const raw: Record<string, FormDataEntryValue> = {};
    for (const [k, v] of form.entries()) if (k !== "_method") raw[k] = v;

    const toNum = (v: FormDataEntryValue | undefined): number | null => {
      if (v == null) return null;
      const s = String(v).trim();
      if (s === "") return null;
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };
    const toBool = (v: FormDataEntryValue | undefined): boolean | null => {
      const s = String(v ?? "");
      return s === "Evet" ? true : s === "Hayır" ? false : null;
    };

    const aspectValues: string[] | null = (() => {
      const values = form.getAll("aspect").map((x) => String(x));
      return values.length > 0 ? values : null;
    })();

    const body: Record<string, unknown> = {
      type: raw.type ?? undefined,
      listing_type: raw.listing_type ?? undefined,
      city: raw.city ?? undefined,
      district: raw.district ?? undefined,
      neighborhood: raw.neighborhood ?? undefined,
      price: toNum(raw.price) ?? undefined,
      gross_m2: toNum(raw.gross_m2) ?? undefined,
      net_m2: toNum(raw.net_m2),
      room_plan: String(raw.room_plan ?? "").trim() || null,
      heating: String(raw.heating ?? "").trim() || null,
      floor: toNum(raw.floor),
      building_floors: toNum(raw.building_floors),
      building_age: toNum(raw.building_age),
      ensuite_bath: toBool(raw.ensuite_bath),
      pool: toBool(raw.pool),
      dressing_room: toBool(raw.dressing_room),
      furnished: toBool(raw.furnished),
      bathroom_count: toNum(raw.bathroom_count),
      balcony: toBool(raw.balcony),
      in_site: toBool(raw.in_site),
      aspect: aspectValues,
      credit: toBool(raw.credit),
      customer_id: String(raw.customer_id ?? "").trim() || null,
      portfolio_owner_id: String(raw.portfolio_owner_id ?? "").trim() || null,
    };

    const { error } = await supabaseAdmin.from("properties").update(body).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/properties/${id}`, req.url);
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}

