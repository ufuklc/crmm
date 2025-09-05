import type React from "react";
import Link from "next/link";
import { ConfirmButton } from "@/components/forms/ConfirmButton";
import { headers } from "next/headers";

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
  const p = await fetchProperty(id);
  if (!p) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  // İsimleri yükle
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  let customerName: string | null = null;
  let portfolioOwnerName: string | null = null;
  if (p.customer_id) {
    try {
      const r = await fetch(`${baseUrl}/api/customers/${p.customer_id}`, { cache: "no-store" });
      const j = await r.json();
      if (j.customer) customerName = `${j.customer.first_name ?? ""} ${j.customer.last_name ?? ""}`.trim();
    } catch {}
  }
  if (p.portfolio_owner_id) {
    try {
      const r = await fetch(`${baseUrl}/api/portfolio-owners/${p.portfolio_owner_id}`, { cache: "no-store" });
      const j = await r.json();
      if (j.portfolioOwner) portfolioOwnerName = `${j.portfolioOwner.first_name ?? ""} ${j.portfolioOwner.last_name ?? ""}`.trim();
    } catch {}
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Varlık Detayı</h1>
        <div className="flex gap-2">
          <Link href={`/properties/${p.id}/edit`} className="btn btn-primary">Düzenle</Link>
          <form action={`/api/properties/${p.id}`} method="post">
            <input type="hidden" name="_method" value="delete" />
            <ConfirmButton className="btn btn-primary">Sil</ConfirmButton>
          </form>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><span className="text-gray-500">Tür:</span> <span className="text-gray-900 font-medium">{p.type}</span></div>
          <div><span className="text-gray-500">İlan:</span> <span className="text-gray-900 font-medium">{p.listing_type}</span></div>
          <div><span className="text-gray-500">Konum:</span> <span className="text-gray-900 font-medium">{p.city} / {p.district} / {p.neighborhood}</span></div>
          <div><span className="text-gray-500">Brüt/Net m²:</span> <span className="text-gray-900 font-medium">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</span></div>
          <div><span className="text-gray-500">Oda:</span> <span className="text-gray-900 font-medium">{p.room_plan ?? (p.rooms ?? "-")}</span></div>
          <div><span className="text-gray-500">Bina Yaşı:</span> <span className="text-gray-900 font-medium">{p.building_age ?? "-"}</span></div>
          <div><span className="text-gray-500">Kat Sayısı:</span> <span className="text-gray-900 font-medium">{p.building_floors ?? "-"}</span></div>
          <div><span className="text-gray-500">Bulunduğu Kat:</span> <span className="text-gray-900 font-medium">{p.floor ?? "-"}</span></div>
          <div><span className="text-gray-500">Isıtma:</span> <span className="text-gray-900 font-medium">{p.heating ?? "-"}</span></div>
          <div><span className="text-gray-500">Mülk Sahibi:</span> <span className="text-gray-900 font-medium">{p.customer_id ? <Link href={`/customers/${p.customer_id}`} className="text-indigo-600 hover:underline">{customerName ?? "Müşteri"}</Link> : "-"}</span></div>
          <div><span className="text-gray-500">Portföy Sahibi:</span> <span className="text-gray-900 font-medium">{portfolioOwnerName ?? "-"}</span></div>
          <div><span className="text-gray-500">Banyo Sayısı:</span> <span className="text-gray-900 font-medium">{p.bathroom_count ?? "-"}</span></div>
          <div><span className="text-gray-500">Balkon:</span> <span className="text-gray-900 font-medium">{p.balcony == null ? "-" : p.balcony ? "Evet" : "Hayır"}</span></div>
          <div><span className="text-gray-500">E. Banyosu:</span> <span className="text-gray-900 font-medium">{p.ensuite_bath == null ? "-" : p.ensuite_bath ? "Evet" : "Hayır"}</span></div>
          <div><span className="text-gray-500">Havuz:</span> <span className="text-gray-900 font-medium">{p.pool == null ? "-" : p.pool ? "Evet" : "Hayır"}</span></div>
          <div><span className="text-gray-500">Giyinme Odası:</span> <span className="text-gray-900 font-medium">{p.dressing_room == null ? "-" : p.dressing_room ? "Evet" : "Hayır"}</span></div>
          <div><span className="text-gray-500">Eşyalı:</span> <span className="text-gray-900 font-medium">{p.furnished == null ? "-" : p.furnished ? "Evet" : "Hayır"}</span></div>
          <div><span className="text-gray-500">Site İçinde:</span> <span className="text-gray-900 font-medium">{p.in_site == null ? "-" : p.in_site ? "Evet" : "Hayır"}</span></div>
          <div className="md:col-span-3"><span className="text-gray-500">Cephe:</span> <span className="text-gray-900 font-medium">{p.aspect && p.aspect.length > 0 ? p.aspect.join(", ") : "-"}</span></div>
          <div className="md:col-span-3"><span className="text-gray-500">Fiyat:</span> <span className="text-gray-900 font-semibold">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</span></div>
        </div>
      </div>
    </div>
  );
}

