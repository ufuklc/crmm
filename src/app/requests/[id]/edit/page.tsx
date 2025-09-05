import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";

type Req = {
  id: string;
  customer_id: string | null;
  type: string | null;
  listing_type: string | null;
  cash_or_loan?: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  rooms?: string | null;
  heating?: string | null;
  ensuite_bath?: boolean | null;
  pool?: boolean | null;
  dressing_room?: boolean | null;
  furnished?: boolean | null;
  bathroom_count?: number | null;
  balcony?: boolean | null;
  in_site?: boolean | null;
  floor?: number | null;
  building_floors?: number | null;
  building_age?: number | null;
};

async function fetchRequestBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchRequestData(id: string): Promise<Req | null> {
  const base = await fetchRequestBaseUrl();
  const res = await fetch(`${base}/api/requests/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return (j.request as Req) ?? null;
}

export default async function RequestEditPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const r = await fetchRequestData(id);
  if (!r) return <div className="max-w-3xl mx-auto p-4">Kayıt bulunamadı.</div>;
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">İstek Düzenle</h1>
        <div className="flex gap-2">
          <Link href={`/requests/${id}`} className="btn btn-primary">İptal</Link>
        </div>
      </div>

      <form action={`/api/requests/${id}`} method="post" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm space-y-3">
        <input type="hidden" name="_method" value="patch" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Tür</label>
            <select name="type" defaultValue={r.type ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Daire</option>
              <option>İş Yeri</option>
              <option>Arsa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">İlan Tipi</label>
            <select name="listing_type" defaultValue={r.listing_type ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Satılık</option>
              <option>Kiralık</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700">Ödeme Tercihi</label>
          <select name="cash_or_loan" defaultValue={r.cash_or_loan ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option value="">Seçiniz</option>
            <option value="Nakit">Nakit</option>
            <option value="Kredi">Kredi</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">İl</label>
            <input name="city" defaultValue={r.city ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">İlçe(ler)</label>
            <input name="district" defaultValue={r.district ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" placeholder="Virgülle ayırabilirsiniz" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Mahalle(ler)</label>
            <input name="neighborhood" defaultValue={r.neighborhood ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" placeholder="Virgülle ayırabilirsiniz" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700">Min Fiyat</label>
              <input name="min_price" defaultValue={r.min_price ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Max Fiyat</label>
              <input name="max_price" defaultValue={r.max_price ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700">Min m²</label>
              <input name="min_size" defaultValue={r.min_size ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Max m²</label>
              <input name="max_size" defaultValue={r.max_size ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Oda Sayısı</label>
            <select name="rooms" defaultValue={r.rooms ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              {[
                "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
                "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
                "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
                "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
              ].map((rp) => (
                <option key={rp} value={rp}>{rp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Isıtma</label>
            <select name="heating" defaultValue={r.heating ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Klima</option>
              <option>Doğalgaz</option>
              <option>Merkezi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
            <select name="ensuite_bath" defaultValue={r.ensuite_bath == null ? "" : r.ensuite_bath ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Havuz</label>
            <select name="pool" defaultValue={r.pool == null ? "" : r.pool ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Giyinme Odası</label>
            <select name="dressing_room" defaultValue={r.dressing_room == null ? "" : r.dressing_room ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Eşyalı</label>
            <select name="furnished" defaultValue={r.furnished == null ? "" : r.furnished ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Banyo Sayısı</label>
            <input name="bathroom_count" defaultValue={r.bathroom_count ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Balkon</label>
            <select name="balcony" defaultValue={r.balcony == null ? "" : r.balcony ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Site İçinde</label>
            <select name="in_site" defaultValue={r.in_site == null ? "" : r.in_site ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Bulunduğu Kat</label>
            <input name="floor" defaultValue={r.floor ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bina Kat Sayısı</label>
            <input name="building_floors" defaultValue={r.building_floors ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bina Yaşı</label>
            <input name="building_age" defaultValue={r.building_age ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link href={`/requests/${id}`} className="btn btn-primary">İptal</Link>
          <button type="submit" className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}


