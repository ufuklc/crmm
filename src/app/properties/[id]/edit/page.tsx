import type React from "react";
import { headers } from "next/headers";
import { EditPropertyForm } from "@/components/forms/EditPropertyForm";

async function fetchProperty(id: string): Promise<{ id: string; type: string; listing_type: string; city: string; district: string; neighborhood: string; price: number; gross_m2: number; net_m2: number | null; room_plan: string | null; heating: string | null; floor: number | null; building_floors: number | null; building_age: number | null; ensuite_bath: boolean | null; pool: boolean | null; dressing_room: boolean | null; furnished: boolean | null; bathroom_count: number | null; balcony: boolean | null; in_site: boolean | null; aspect: string[] | null; credit: boolean | null; customer_id: string | null; portfolio_owner_id: string | null } | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/properties/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return j.property;
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return <EditPropertyForm property={property} />;
}


