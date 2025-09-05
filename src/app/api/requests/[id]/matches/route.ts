import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  // İstek ayrıntılarını getir
  const { data: req, error: reqErr } = await supabaseAdmin
    .from("customer_requests")
    .select("id, type, listing_type, cash_or_loan, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms")
    .eq("id", id)
    .single();
  if (reqErr || !req) return NextResponse.json({ error: reqErr?.message ?? "İstek bulunamadı" }, { status: 404 });

  // Eşleşen varlıkları filtrele (metrekare için gross_m2 kullanılır)
  const parseList = (v: string | null): string[] =>
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  const districtList = parseList((req as any).district ?? null);
  const neighborhoodList = parseList((req as any).neighborhood ?? null);
  let query = supabaseAdmin
    .from("properties")
    .select(
      "id, type, listing_type, city, district, neighborhood, price, gross_m2, net_m2, rooms",
    )
    .eq("type", req.type)
    .eq("listing_type", req.listing_type)
    .order("created_at", { ascending: false })
    .limit(200);

  if (req.city) query = query.eq("city", req.city);
  if (districtList.length > 0) query = query.in("district", districtList);
  if (neighborhoodList.length > 0) query = query.in("neighborhood", neighborhoodList);
  if (req.min_price != null) query = query.gte("price", req.min_price);
  if (req.max_price != null) query = query.lte("price", req.max_price);
  if (req.min_size != null) query = query.gte("gross_m2", req.min_size);
  if (req.max_size != null) query = query.lte("gross_m2", req.max_size);
  // İstek gereksiniminde oda/ödemeye göre kısıtlama yok
  // Ödeme tercihi bilgi amaçlıdır; eşleşmede opsiyonel kullanabiliriz (örnek: kredi=Satılık uyumsuzluğu). Gerekiyorsa ek kurallar eklenir.

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ properties: data });
}

