import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(): Promise<Response> {
  const { data, error } = await supabaseAdmin
    .from("professions")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ professions: data });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("professions").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


