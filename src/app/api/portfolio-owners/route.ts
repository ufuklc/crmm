import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(): Promise<Response> {
  const { data, error } = await supabaseAdmin
    .from("portfolio_owners")
    .select("id, first_name, last_name, phone")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ portfolioOwners: data });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("portfolio_owners").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


