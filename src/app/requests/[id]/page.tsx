import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";

async function fetchRequest(id: string): Promise<any | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/requests/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return j.request;
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const r = await fetchRequest(id);
  if (!r) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">İstek Detayı</h1>
        <div className="flex gap-2">
          <Link href="/requests" className="btn btn-primary">Liste</Link>
          <Link href={`/requests/${id}/edit`} className="btn btn-primary">Düzenle</Link>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><span className="text-gray-500">Tür:</span> <span className="text-gray-900 font-medium">{r.type ?? "-"}</span></div>
          <div><span className="text-gray-500">İlan:</span> <span className="text-gray-900 font-medium">{r.listing_type ?? "-"}</span></div>
          <div className="sm:col-span-2"><span className="text-gray-500">Konum:</span> <span className="text-gray-900 font-medium">{r.city ?? "-"} / {r.district ?? "-"} / {r.neighborhood ?? "-"}</span></div>
          <div><span className="text-gray-500">Bütçe:</span> <span className="text-gray-900 font-medium">{r.min_price ?? "-"} - {r.max_price ?? "-"}</span></div>
          <div><span className="text-gray-500">m²:</span> <span className="text-gray-900 font-medium">{r.min_size ?? "-"} - {r.max_size ?? "-"}</span></div>
          <div><span className="text-gray-500">Oda Sayısı:</span> <span className="text-gray-900 font-medium">{r.rooms ?? "-"}</span></div>
          <div><span className="text-gray-500">Isıtma:</span> <span className="text-gray-900 font-medium">{r.heating ?? "-"}</span></div>
          <div><span className="text-gray-500">Ebeveyn Banyosu:</span> <span className="text-gray-900 font-medium">{r.ensuite_bath ? "Evet" : r.ensuite_bath === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Havuz:</span> <span className="text-gray-900 font-medium">{r.pool ? "Evet" : r.pool === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Giyinme Odası:</span> <span className="text-gray-900 font-medium">{r.dressing_room ? "Evet" : r.dressing_room === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Eşyalı:</span> <span className="text-gray-900 font-medium">{r.furnished ? "Evet" : r.furnished === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Banyo Sayısı:</span> <span className="text-gray-900 font-medium">{r.bathroom_count ?? "-"}</span></div>
          <div><span className="text-gray-500">Balkon:</span> <span className="text-gray-900 font-medium">{r.balcony ? "Evet" : r.balcony === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Site İçinde:</span> <span className="text-gray-900 font-medium">{r.in_site ? "Evet" : r.in_site === false ? "Hayır" : "-"}</span></div>
          <div><span className="text-gray-500">Bulunduğu Kat:</span> <span className="text-gray-900 font-medium">{r.floor ?? "-"}</span></div>
          <div><span className="text-gray-500">Bina Kat Sayısı:</span> <span className="text-gray-900 font-medium">{r.building_floors ?? "-"}</span></div>
          <div><span className="text-gray-500">Bina Yaşı:</span> <span className="text-gray-900 font-medium">{r.building_age ?? "-"}</span></div>
          <div><span className="text-gray-500">Durum:</span> <span className="text-gray-900 font-medium">{r.fulfilled ? "Karşılandı" : "Aktif"}</span></div>
        </div>
      </div>
    </div>
  );
}


