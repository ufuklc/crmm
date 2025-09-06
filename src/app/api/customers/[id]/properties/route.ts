import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select(`
      id,
      type,
      listing_type,
      city,
      district,
      neighborhood,
      price,
      gross_m2,
      room_plan
    `)
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ properties: data || [] });
}
