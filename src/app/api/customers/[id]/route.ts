import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, first_name, last_name, phone, cash_or_loan, profession_id, created_at")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ customer: data });
}

export async function PATCH(req: Request, { params }: Params): Promise<Response> {
  const body = await req.json();
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("customers")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// HTML form method override: POST + _method=put/delete
export async function POST(req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json({ error: "Use PATCH or DELETE" }, { status: 405 });
  }
  const form = await req.formData();
  const method = String(form.get("_method") ?? "").toLowerCase();
  if (method === "delete") {
    const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/customers`, req.url);
    return NextResponse.redirect(url, 303);
  }
  if (method === "put") {
    const body: Record<string, unknown> = {};
    for (const [k, v] of form.entries()) if (k !== "_method") body[k] = v;
    // Boş stringleri null'a çevir
    for (const k of ["phone", "profession_id"]) if (Object.prototype.hasOwnProperty.call(body, k) && body[k] === "") body[k] = null;
    const { error } = await supabaseAdmin.from("customers").update(body).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/customers/${id}`, req.url);
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}


