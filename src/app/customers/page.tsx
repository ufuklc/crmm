import type React from "react";
import { headers } from "next/headers";
import { CustomerList } from "@/components/customers/CustomerList";

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  cash_or_loan: string;
  preferred_listing_type?: string | null;
  profession?: string | null;
};

async function fetchCustomers(searchParams?: Record<string, string | undefined>): Promise<{ customers: CustomerRow[]; total: number; page: number; pageSize: number }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const qs = new URLSearchParams();
  const ua = h.get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  if (searchParams) Object.entries(searchParams).forEach(([k, v]) => v && qs.set(k, v));
  if (!qs.has("pageSize") && isMobile) qs.set("pageSize", "10");
  const url = qs.toString() ? `${baseUrl}/api/customers?${qs}` : `${baseUrl}/api/customers`;
  const res = await fetch(url, { 
    cache: "no-store",
    headers: {
      'Cookie': h.get('cookie') ?? ''
    }
  });
  if (!res.ok) return { customers: [], total: 0, page: 1, pageSize: 25 };
  let json: { customers?: any[]; total?: number; page?: number; pageSize?: number } = {};
  try { json = await res.json(); } catch { json = {}; }
  
  const customers = json.customers ?? [];
  
  return { customers, total: Number(json.total ?? 0), page: Number(json.page ?? 1), pageSize: Number(json.pageSize ?? 25) };
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { customers, total, page, pageSize } = await fetchCustomers(sp);
  return <CustomerList customers={customers} total={total} page={page} pageSize={pageSize} searchParams={sp} />;
}


