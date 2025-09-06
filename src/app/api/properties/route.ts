import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");
  const listing = searchParams.get("listing_type");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const minGross = searchParams.get("min_gross_m2");
  const maxGross = searchParams.get("max_gross_m2");
  const minNet = searchParams.get("min_net_m2");
  const maxNet = searchParams.get("max_net_m2");
  const roomPlans = searchParams.getAll("room_plan"); // çoklu (1+1, 2+1 ...)
  const minFloors = searchParams.get("min_building_floors");
  const maxFloors = searchParams.get("max_building_floors");
  const minFloor = searchParams.get("min_floor");
  const maxFloor = searchParams.get("max_floor");
  const minAge = searchParams.get("min_building_age");
  const maxAge = searchParams.get("max_building_age");
  const heating = searchParams.get("heating");
  const city = searchParams.get("city");
  const district = searchParams.get("district");
  // ESKİ
// const neighborhoods = searchParams.getAll("neighborhood");

// YENİ: hem tekrar eden parametreleri hem "A,B" formatını destekle
const splitCSV = (s: string) =>
  s.split(",").map(v => decodeURIComponent(v).trim()).filter(Boolean);

const neighborhoods = searchParams
  .getAll("neighborhood")
  .flatMap(v => splitCSV(v));

  const portfolioOwnerNames = searchParams.getAll("portfolio_owner_name");
  const aspectValues = searchParams.getAll("aspect");
  const credit = searchParams.get("credit");
  const ensuiteBath = searchParams.get("ensuite_bath");
  const pool = searchParams.get("pool");
  const dressingRoom = searchParams.get("dressing_room");
  const furnished = searchParams.get("furnished");
  const balcony = searchParams.get("balcony");
  const inSite = searchParams.get("in_site");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "25")));
  const sort = searchParams.get("sort");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabaseAdmin.from("properties").select("id, type, listing_type, city, district, neighborhood, price, gross_m2, net_m2, room_plan", { count: "exact" });
  if (type) query = query.eq("type", type);
  if (listing) query = query.eq("listing_type", listing);
  if (city) query = query.eq("city", city);
  if (district) query = query.eq("district", district);
  // ESKİ
// if (neighborhoods && neighborhoods.length > 0) {
//   const orConditions = neighborhoods.map(n => `neighborhood.eq.${n}`).join(',');
//   query = query.or(orConditions);
// }

// YENİ
if (neighborhoods.length > 0) {
  query = query.in("neighborhood", neighborhoods);
}

  
  if (portfolioOwnerNames && portfolioOwnerNames.length > 0) {
    // map names to ids first
    const ownersRes = await supabaseAdmin.from("portfolio_owners").select("id, first_name, last_name");
    if (!ownersRes.error) {
      const fullToId = new Map<string, string>();
      (ownersRes.data ?? []).forEach((o: { id: string; first_name: string; last_name: string }) => {
        const full = `${o.first_name ?? ""} ${o.last_name ?? ""}`.trim();
        if (full) fullToId.set(full, o.id as string);
      });
      const ids = portfolioOwnerNames.map((n) => fullToId.get(n)).filter(Boolean) as string[];
      if (ids.length > 0) query = query.in("portfolio_owner_id", ids);
    }
  }
  if (q) {
    query = query.or(
      [
        `city.ilike.%${q}%`,
        `district.ilike.%${q}%`,
        `neighborhood.ilike.%${q}%`,
      ].join(","),
    );
  }
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (minGross) query = query.gte("gross_m2", Number(minGross));
  if (maxGross) query = query.lte("gross_m2", Number(maxGross));
  if (minNet) query = query.gte("net_m2", Number(minNet));
  if (maxNet) query = query.lte("net_m2", Number(maxNet));
  if (roomPlans && roomPlans.length > 0) query = query.in("room_plan", roomPlans);
  if (minFloors) query = query.gte("building_floors", Number(minFloors));
  if (maxFloors) query = query.lte("building_floors", Number(maxFloors));
  if (minFloor) query = query.gte("floor", Number(minFloor));
  if (maxFloor) query = query.lte("floor", Number(maxFloor));
  if (minAge) query = query.gte("building_age", Number(minAge));
  if (maxAge) query = query.lte("building_age", Number(maxAge));
  if (heating) query = query.eq("heating", heating);
  if (aspectValues && aspectValues.length > 0) query = query.contains("aspect", aspectValues);

  const parseYesNo = (v: string | null): boolean | null => {
    if (v === "Evet") return true;
    if (v === "Hayır") return false;
    return null;
  };
  const setBool = (col: string, v: string | null): void => {
    const b = parseYesNo(v);
    if (b !== null) query = query.eq(col, b);
  };
  setBool("credit", credit);
  setBool("ensuite_bath", ensuiteBath);
  setBool("pool", pool);
  setBool("dressing_room", dressingRoom);
  setBool("furnished", furnished);
  setBool("balcony", balcony);
  setBool("in_site", inSite);
  
  // Apply sorting
  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  
  const { data, error, count } = await query.range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const response = { 
    properties: data, 
    total: count ?? 0, 
    page, 
    pageSize,
    // Network tab'ında daha iyi görünmesi için metadata ekle
    _metadata: {
      timestamp: new Date().toISOString(),
      endpoint: 'properties',
      method: req.method,
      url: req.url
    }
  };
  
  return NextResponse.json(response);
}

export async function POST(req: Request): Promise<Response> {
  const payload = await req.json();
  const body = {
    ...payload,
    // Formdan building_age string/number gelebilir; tamsayıya çevir
    building_age: payload.building_age == null || payload.building_age === "" ? null : Number(payload.building_age),
    // room_plan da string olabilir, olduğu gibi bırakıyoruz
  };
  const { data, error } = await supabaseAdmin.from("properties").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


