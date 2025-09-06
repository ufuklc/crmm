import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );
  
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const cash = searchParams.get("cash_or_loan");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "25")));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Session kontrolü
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Eğer session yoksa admin client kullan
  if (sessionError || !session) {
    const { data, error, count } = await supabaseAdmin
      .from("customers")
      .select(`
        id, 
        first_name, 
        last_name, 
        phone, 
        cash_or_loan, 
        preferred_listing_type,
        profession_id
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      customers: data || [], 
      total: count ?? 0, 
      page, 
      pageSize 
    });
  }

  let query = supabase
    .from("customers")
    .select(`
      id, 
      first_name, 
      last_name, 
      phone, 
      cash_or_loan, 
      preferred_listing_type,
      profession_id
    `, { count: "exact" });
  if (cash) {
    if (cash === "İkisi de") {
      query = query.in("cash_or_loan", ["Nakit", "Kredi"]);
    } else {
      query = query.eq("cash_or_loan", cash);
    }
  }
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Profession isimlerini ayrı olarak al
  const professionMap = new Map();
  if (data && data.length > 0) {
    const professionIds = [...new Set(data.map(c => c.profession_id).filter(Boolean))];
    if (professionIds.length > 0) {
      const { data: professions } = await supabase
        .from("professions")
        .select("id, name")
        .in("id", professionIds);
      if (professions) {
        professions.forEach(p => professionMap.set(p.id, p.name));
      }
    }
  }
  
  // Müşteri verilerini profession isimleriyle birleştir
  const customers = data?.map(customer => ({
    ...customer,
    profession: customer.profession_id ? professionMap.get(customer.profession_id) : null
  })) || [];
  
  return NextResponse.json({ 
    customers, 
    total: count ?? 0, 
    page, 
    pageSize
  });
}

export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );
  
  const body = await req.json();
  const { data, error } = await supabase.from("customers").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}


