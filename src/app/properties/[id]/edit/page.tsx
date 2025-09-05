import type React from "react";
import { headers } from "next/headers";
import { PriceInput } from "@/components/forms/controls/PriceInput";
import { OwnersSelectors } from "@/components/forms/OwnersSelectors";

async function fetchProperty(id: string): Promise<any | null> {
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
  const p = await fetchProperty(id);
  if (!p) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Varlık Düzenle</h1>
      <form action={`/api/properties/${p.id}`} method="post" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <input type="hidden" name="_method" value="put" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PriceInput name="price" label="Fiyat" defaultValue={p.price} />
          <div>
            <label className="block text-sm text-gray-700">Brüt m²</label>
            <input name="gross_m2" type="number" defaultValue={p.gross_m2 ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Net m²</label>
            <input name="net_m2" type="number" defaultValue={p.net_m2 ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Oda Sayısı</label>
            <select name="room_plan" defaultValue={p.room_plan ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Stüdyo(1+0)</option>
              <option>1+1</option>
              <option>1.5+1</option>
              <option>2+0</option>
              <option>2+1</option>
              <option>2.5+1</option>
              <option>2+2</option>
              <option>3+0</option>
              <option>3+1</option>
              <option>3.5+1</option>
              <option>3+2</option>
              <option>3+3</option>
              <option>4+0</option>
              <option>4+1</option>
              <option>4.5+1</option>
              <option>4.5+2</option>
              <option>4+2</option>
              <option>4+3</option>
              <option>4+4</option>
              <option>5+1</option>
              <option>5.5 + 1</option>
              <option>5+2</option>
              <option>5+3</option>
              <option>5+4</option>
              <option>6+1</option>
              <option>6+2</option>
              <option>6.5 + 1</option>
              <option>6+3</option>
              <option>6+4</option>
              <option>7+1</option>
              <option>7+2</option>
              <option>7+3</option>
              <option>8+1</option>
              <option>8+2</option>
              <option>8+3</option>
              <option>8+4</option>
              <option>9+1</option>
              <option>9+3</option>
              <option>9+4</option>
              <option>9+5</option>
              <option>9+6</option>
              <option>10+1</option>
              <option>10+2</option>
              <option>10 Üzeri</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bina Yaşı</label>
            <input name="building_age" type="number" defaultValue={p.building_age ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Kat Sayısı</label>
            <input name="building_floors" type="number" defaultValue={p.building_floors ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bulunduğu Kat</label>
            <input name="floor" type="number" defaultValue={p.floor ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Isıtma</label>
            <select name="heating" defaultValue={p.heating ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Klima</option>
              <option>Doğalgaz</option>
              <option>Merkezi</option>
            </select>
          </div>
          <OwnersSelectors initialCustomerId={p.customer_id} initialPortfolioOwnerId={p.portfolio_owner_id} />
          <div>
            <label className="block text-sm text-gray-700">Banyo Sayısı</label>
            <input name="bathroom_count" type="number" defaultValue={p.bathroom_count ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Balkon</label>
            <select name="balcony" defaultValue={p.balcony == null ? "" : p.balcony ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
            <select name="ensuite_bath" defaultValue={p.ensuite_bath == null ? "" : p.ensuite_bath ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Havuz</label>
            <select name="pool" defaultValue={p.pool == null ? "" : p.pool ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Giyinme Odası</label>
            <select name="dressing_room" defaultValue={p.dressing_room == null ? "" : p.dressing_room ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Eşyalı</label>
            <select name="furnished" defaultValue={p.furnished == null ? "" : p.furnished ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Site İçinde</label>
            <select name="in_site" defaultValue={p.in_site == null ? "" : p.in_site ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <a href="/properties" className="btn btn-primary">İptal</a>
          <button type="submit" className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}


