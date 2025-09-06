import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";

async function fetchRequest(id: string): Promise<{ id: string; type: string; listing_type: string; city: string; district: string; neighborhood: string; min_price: number; max_price: number; min_size: number; max_size: number; rooms: string; cash_or_loan: string; customer_id: string; created_at: string; fulfilled: boolean } | null> {
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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">İstek Detayı</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/requests" className="btn btn-primary text-center">Liste</Link>
          <Link href={`/requests/${id}/edit`} className="btn btn-primary text-center">Düzenle</Link>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="space-y-4">
        {/* Temel Bilgiler */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Tür</span>
              <span className="text-gray-900 font-medium text-lg">{r.type || "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">İlan Türü</span>
              <span className="text-gray-900 font-medium text-lg">{r.listing_type || "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Durum</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                r.fulfilled 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"
              }`}>
                {r.fulfilled ? "Karşılandı" : "Aktif"}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Oluşturulma Tarihi</span>
              <span className="text-gray-900 font-medium text-lg">
                {r.created_at ? new Date(r.created_at).toLocaleDateString("tr-TR") : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Konum Bilgileri */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Konum Bilgileri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-base">
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Şehir</span>
              <span className="text-gray-900 font-medium text-lg">{r.city || "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">İlçe</span>
              <span className="text-gray-900 font-medium text-lg">{r.district || "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Mahalle</span>
              <span className="text-gray-900 font-medium text-lg">{r.neighborhood || "-"}</span>
            </div>
          </div>
        </div>

        {/* Bütçe ve Boyut Bilgileri */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bütçe ve Boyut Bilgileri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Minimum Fiyat</span>
              <span className="text-gray-900 font-medium text-lg">
                {r.min_price ? new Intl.NumberFormat("tr-TR").format(r.min_price) + " ₺" : "-"}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Maksimum Fiyat</span>
              <span className="text-gray-900 font-medium text-lg">
                {r.max_price ? new Intl.NumberFormat("tr-TR").format(r.max_price) + " ₺" : "-"}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Minimum Metrekare</span>
              <span className="text-gray-900 font-medium text-lg">{r.min_size ? r.min_size + " m²" : "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Maksimum Metrekare</span>
              <span className="text-gray-900 font-medium text-lg">{r.max_size ? r.max_size + " m²" : "-"}</span>
            </div>
          </div>
        </div>

        {/* Diğer Bilgiler */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Diğer Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Oda Sayısı</span>
              <span className="text-gray-900 font-medium text-lg">{r.rooms || "-"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600 block font-bold text-base uppercase tracking-wide">Ödeme Şekli</span>
              <span className="text-gray-900 font-medium text-lg">{r.cash_or_loan || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


