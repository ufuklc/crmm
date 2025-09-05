import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params): Promise<Response> {
  const body = await req.json();
  const { id } = params;
  const { data, error } = await supabaseAdmin
    .from("meeting_notes")
    .update(body)
    .eq("id", id)
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(_req: Request, { params }: Params): Promise<Response> {
  const { id } = params;
  const { error } = await supabaseAdmin.from("meeting_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}


