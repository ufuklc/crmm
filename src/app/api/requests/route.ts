import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customer_id");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "25")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from("customer_requests")
    .select(
      "id, customer_id, type, listing_type, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms, fulfilled, customer:customers(id, first_name, last_name)",
      { count: "exact" }
    );
  if (customerId) query = query.eq("customer_id", customerId);

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const response = { 
    requests: data, 
    total: count ?? 0, 
    page, 
    pageSize,
    _metadata: {
      timestamp: new Date().toISOString(),
      endpoint: 'requests',
      method: req.method,
      url: req.url
    }
  };
  
  return NextResponse.json(response);
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("customer_requests").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


