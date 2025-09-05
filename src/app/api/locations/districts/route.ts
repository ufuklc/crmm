import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");
  const q = searchParams.get("q");
  if (!cityId) return NextResponse.json({ items: [] });
  const query = supabaseAdmin
    .from("districts")
    .select("id, name")
    .eq("city_id", cityId)
    .order("name", { ascending: true })
    .limit(100);
  if (q) query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const etag = `W/"d:${cityId}:${data?.length ?? 0}"`;
  const inm = req.headers.get("if-none-match");
  if (inm && inm === etag) {
    return new NextResponse(null, { status: 304, headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400", ETag: etag } });
  }
  return NextResponse.json({ items: data }, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400", ETag: etag, Vary: "Accept-Encoding" } });
}


