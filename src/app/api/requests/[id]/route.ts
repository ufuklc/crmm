import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("customer_requests")
    .select("id, customer_id, type, listing_type, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms, fulfilled, created_at")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ request: data });
}

export async function PATCH(req: Request, { params }: Params): Promise<Response> {
  const body = await req.json();
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("customer_requests")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("customer_requests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// HTML form method override: POST + _method=patch/delete
export async function POST(req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json({ error: "Use PATCH or DELETE" }, { status: 405 });
  }
  const form = await req.formData();
  const method = String(form.get("_method") ?? "").toLowerCase();
  if (method === "patch") {
    const bodyRaw: Record<string, FormDataEntryValue> = {};
    for (const [k, v] of form.entries()) if (k !== "_method") bodyRaw[k] = v;
    const toNum = (v: FormDataEntryValue | undefined): number | null => {
      if (v == null) return null;
      const s = String(v);
      if (s.trim() === "") return null;
      const n = Number(s.replace(/\./g, "").replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    };
    const toBool = (v: FormDataEntryValue | undefined): boolean | null => {
      if (v == null) return null;
      const s = String(v).toLowerCase();
      if (["true", "evet", "1", "on"].includes(s)) return true;
      if (["false", "hayır", "hayir", "0", "off"].includes(s)) return false;
      return null;
    };
    const toStr = (v: FormDataEntryValue | undefined): string | null => {
      if (v == null) return null;
      const s = String(v).trim();
      return s === "" ? null : s;
    };
    const body: Record<string, unknown> = {
      type: toStr(bodyRaw.type),
      listing_type: toStr(bodyRaw.listing_type),
      cash_or_loan: toStr(bodyRaw.cash_or_loan),
      customer_id: toStr(bodyRaw.customer_id),
      city: toStr(bodyRaw.city),
      district: toStr(bodyRaw.district),
      neighborhood: toStr(bodyRaw.neighborhood),
      min_price: toNum(bodyRaw.min_price),
      max_price: toNum(bodyRaw.max_price),
      min_size: toNum(bodyRaw.min_size),
      max_size: toNum(bodyRaw.max_size),
      rooms: toStr(bodyRaw.rooms),
      heating: toStr(bodyRaw.heating),
      ensuite_bath: toBool(bodyRaw.ensuite_bath),
      pool: toBool(bodyRaw.pool),
      dressing_room: toBool(bodyRaw.dressing_room),
      furnished: toBool(bodyRaw.furnished),
      bathroom_count: toNum(bodyRaw.bathroom_count),
      balcony: toBool(bodyRaw.balcony),
      in_site: toBool(bodyRaw.in_site),
      floor: toNum(bodyRaw.floor),
      building_floors: toNum(bodyRaw.building_floors),
      building_age: toNum(bodyRaw.building_age),
      fulfilled: toBool(bodyRaw.fulfilled) ?? undefined,
    };
    // null değerler haricinde undefined alanları at
    Object.keys(body).forEach((k) => { if (body[k] === undefined) delete body[k]; });
    const { error } = await supabaseAdmin.from("customer_requests").update(body).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/requests`, req.url);
    return NextResponse.redirect(url, 303);
  }
  if (method === "delete") {
    const { error } = await supabaseAdmin.from("customer_requests").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/requests`, req.url);
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}


