import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const cash = searchParams.get("cash_or_loan");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "25")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("customers")
    .select("id, first_name, last_name, phone, cash_or_loan, preferred_listing_type", { count: "exact" });
  if (cash) query = query.eq("cash_or_loan", cash);
  if (q) query = query.or([`first_name.ilike.%${q}%`,`last_name.ilike.%${q}%`,`phone.ilike.%${q}%`].join(","));
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ customers: data, total: count ?? 0, page, pageSize });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("customers").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


