import type React from "react";
import { headers } from "next/headers";
import { PropertyDetail } from "@/components/properties/PropertyDetail";

type Property = {
  id: string;
  type: string;
  listing_type: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  gross_m2: number;
  net_m2: number | null;
  rooms: number | null;
  building_age: number | null;
  room_plan: string | null;
  floor?: number | null;
  heating?: string | null;
  credit?: boolean | null;
  ensuite_bath?: boolean | null;
  pool?: boolean | null;
  dressing_room?: boolean | null;
  furnished?: boolean | null;
  bathroom_count?: number | null;
  balcony?: boolean | null;
  in_site?: boolean | null;
  aspect?: string[] | null;
  building_floors?: number | null;
  customer_id?: string | null;
  portfolio_owner_id?: string | null;
};

async function fetchProperty(id: string): Promise<Property | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/properties/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return j.property as Property;
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  
  // İsimleri yükle
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  let customerName: string | null = null;
  let portfolioOwnerName: string | null = null;
  
  if (property.customer_id) {
    try {
      const r = await fetch(`${baseUrl}/api/customers/${property.customer_id}`, { cache: "no-store" });
      const j = await r.json();
      if (j.customer) customerName = `${j.customer.first_name ?? ""} ${j.customer.last_name ?? ""}`.trim();
    } catch {}
  }
  
  if (property.portfolio_owner_id) {
    try {
      const r = await fetch(`${baseUrl}/api/portfolio-owners/${property.portfolio_owner_id}`, { cache: "no-store" });
      const j = await r.json();
      if (j.portfolioOwner) portfolioOwnerName = `${j.portfolioOwner.first_name ?? ""} ${j.portfolioOwner.last_name ?? ""}`.trim();
    } catch {}
  }
  
  return <PropertyDetail property={property} customerName={customerName} portfolioOwnerName={portfolioOwnerName} />;
}

