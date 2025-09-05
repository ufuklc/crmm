import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteParams): Promise<Response> {
  const body = await req.json();
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("meeting_notes")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { error } = await supabaseAdmin.from("meeting_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}


