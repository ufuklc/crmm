import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: RouteParams): Promise<Response> {
  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "15")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // İstek ayrıntılarını getir
  const { data: requestData, error: reqErr } = await supabaseAdmin
    .from("customer_requests")
    .select("id, type, listing_type, cash_or_loan, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms")
    .eq("id", id)
    .single();
  if (reqErr || !requestData) return NextResponse.json({ error: reqErr?.message ?? "İstek bulunamadı" }, { status: 404 });

  // Eşleşen varlıkları filtrele (metrekare için gross_m2 kullanılır)
  const parseList = (v: string | null): string[] =>
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  const districtList = parseList((requestData as { district?: string }).district ?? null);
  const neighborhoodList = parseList((requestData as { neighborhood?: string }).neighborhood ?? null);
  let query = supabaseAdmin
    .from("properties")
    .select(
      "id, type, listing_type, city, district, neighborhood, price, gross_m2, net_m2, room_plan",
      { count: "exact" }
    )
    .eq("type", requestData.type)
    .eq("listing_type", requestData.listing_type)
    .order("created_at", { ascending: false });

  if (requestData.city) query = query.eq("city", requestData.city);
  if (districtList.length > 0) query = query.in("district", districtList);
  if (neighborhoodList.length > 0) query = query.in("neighborhood", neighborhoodList);
  if (requestData.min_price != null) query = query.gte("price", requestData.min_price);
  if (requestData.max_price != null) query = query.lte("price", requestData.max_price);
  if (requestData.min_size != null) query = query.gte("gross_m2", requestData.min_size);
  if (requestData.max_size != null) query = query.lte("gross_m2", requestData.max_size);
  // İstek gereksiniminde oda/ödemeye göre kısıtlama yok
  // Ödeme tercihi bilgi amaçlıdır; eşleşmede opsiyonel kullanabiliriz (örnek: kredi=Satılık uyumsuzluğu). Gerekiyorsa ek kurallar eklenir.

  const { data, error, count } = await query.range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ 
    properties: data || [], 
    total: count ?? 0,
    page,
    pageSize
  });
}