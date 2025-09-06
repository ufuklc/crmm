import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customer_id");
  
  let query = supabaseAdmin
    .from("meeting_notes")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });
  
  if (customerId) {
    query = query.eq("customer_id", customerId).limit(50);
  } else {
    query = query.limit(200);
  }
  
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("meeting_notes").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


