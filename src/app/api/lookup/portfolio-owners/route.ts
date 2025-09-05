import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  let query = supabaseAdmin
    .from("portfolio_owners")
    .select("id, first_name, last_name")
    .order("first_name", { ascending: true })
    .limit(50);
  if (q) {
    query = query.or([
      `first_name.ilike.%${q}%`,
      `last_name.ilike.%${q}%`,
    ].join(","));
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const items = (data ?? []).map((r) => ({ id: r.id as string, name: `${r.first_name} ${r.last_name}` }));
  return NextResponse.json({ items });
}


