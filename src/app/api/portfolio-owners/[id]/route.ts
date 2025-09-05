import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("portfolio_owners")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ portfolioOwner: data });
}

export async function PATCH(req: Request, ctx: RouteParams): Promise<Response> {
  const body = await req.json();
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("portfolio_owners")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { error } = await supabaseAdmin.from("portfolio_owners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Method override: HTML form POST + _method=put/delete
export async function POST(req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return NextResponse.json({ error: "Use PATCH or DELETE" }, { status: 405 });
  }
  const form = await req.formData();
  const method = String(form.get("_method") ?? "").toLowerCase();
  if (method === "delete") {
    const { error } = await supabaseAdmin.from("portfolio_owners").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/portfolio-owners`, req.url);
    return NextResponse.redirect(url, 303);
  }
  if (method === "put") {
    const body: Record<string, unknown> = {};
    for (const [k, v] of form.entries()) if (k !== "_method") body[k] = v;
    const { error } = await supabaseAdmin.from("portfolio_owners").update(body).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const url = new URL(`/portfolio-owners`, req.url);
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}


