import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json().catch(() => null) as { ids?: string[] } | null;
  const ids = Array.isArray(payload?.ids) ? payload!.ids.filter((v) => typeof v === "string" && v.length > 0) : [];
  if (ids.length === 0) return NextResponse.json({ counts: {} });

  // Her istek için sayımı paralel yap (tek HTTP çağrısı, çoklu DB sorgusu)
  const results = await Promise.all(ids.map(async (id) => {
    const { data: req } = await supabaseAdmin
      .from("customer_requests")
      .select("id, type, listing_type, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms")
      .eq("id", id)
      .single();
    if (!req) return [id, 0] as const;
    let q = supabaseAdmin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("type", req.type)
      .eq("listing_type", req.listing_type);
    if (req.city) q = q.eq("city", req.city);
    if (req.district) q = q.eq("district", req.district);
    if (req.neighborhood) q = q.eq("neighborhood", req.neighborhood);
    if (req.min_price != null) q = q.gte("price", req.min_price);
    if (req.max_price != null) q = q.lte("price", req.max_price);
    if (req.min_size != null) q = q.gte("gross_m2", req.min_size);
    if (req.max_size != null) q = q.lte("gross_m2", req.max_size);
    if (req.rooms != null) q = q.eq("rooms", req.rooms);
    const { count } = await q;
    return [id, count ?? 0] as const;
  }));

  return NextResponse.json({ counts: Object.fromEntries(results) });
}


