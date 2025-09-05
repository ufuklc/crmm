"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";
// import { MultiCheckDropdown } from "@/components/forms/controls/MultiCheckDropdown";
import { PriceInput } from "@/components/forms/controls/PriceInput";

const ROOM_PLANS: string[] = [
  "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
  "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
  "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
  "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
];

export function PropertyForm(): React.ReactElement {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<{ id: string; name: string } | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedPortfolioOwnerId, setSelectedPortfolioOwnerId] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    // Tip uyumu: sayısal alanları dönüştür
    const toNum = (v: FormDataEntryValue | undefined): number | null => {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const body = {
      type: payload.type,
      listing_type: payload.listing_type,
      city: payload.city as string,
      district: payload.district as string,
      neighborhood: payload.neighborhood as string,
      price: toNum(payload.price) ?? 0,
      gross_m2: toNum(payload.gross_m2) ?? 0,
      net_m2: toNum(payload.net_m2),
      rooms: undefined,
      room_plan: Array.isArray(payload.room_plan)
        ? String((payload.room_plan as unknown as string[])[0] ?? "")
        : payload.room_plan
        ? String(payload.room_plan)
        : null,
      heating: payload.heating || null,
      floor: toNum(payload.floor),
      building_floors: toNum(payload.building_floors),
      customer_id: selectedCustomerId || null,
      portfolio_owner_id: selectedPortfolioOwnerId || null,
      credit: payload.credit === "Evet" ? true : payload.credit === "Hayır" ? false : null,
      ensuite_bath: payload.ensuite_bath === "Evet" ? true : payload.ensuite_bath === "Hayır" ? false : null,
      pool: payload.pool === "Evet" ? true : payload.pool === "Hayır" ? false : null,
      dressing_room: payload.dressing_room === "Evet" ? true : payload.dressing_room === "Hayır" ? false : null,
      furnished: payload.furnished === "Evet" ? true : payload.furnished === "Hayır" ? false : null,
      bathroom_count: toNum(payload.bathroom_count),
      balcony: payload.balcony === "Evet" ? true : payload.balcony === "Hayır" ? false : null,
      aspect: Array.isArray(payload.aspect)
        ? (payload.aspect as unknown as string[])
        : payload.aspect
        ? [String(payload.aspect)]
        : null,
      in_site: payload.in_site === "Evet" ? true : payload.in_site === "Hayır" ? false : null,
    } as Record<string, unknown>;

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Kayıt başarısız");
      return;
    }
    router.push("/properties");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      {/* Gizli alanlar: seçimleri form verisine yazar */}
      <input type="hidden" name="city" value={selectedCity?.name ?? ""} />
      <input type="hidden" name="district" value={selectedDistrict?.name ?? ""} />
      <input type="hidden" name="neighborhood" value={selectedNeighborhood?.name ?? ""} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Tür</label>
          <select name="type" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option>Daire</option>
            <option>İş Yeri</option>
            <option>Arsa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">İlan Tipi</label>
          <select name="listing_type" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option>Satılık</option>
            <option>Kiralık</option>
          </select>
        </div>
        <SearchableSelect
          label="Şehir"
          fetchUrl="/api/locations/cities"
          autoFetch
          onChange={(v) => {
            setSelectedCity(v);
            // Üst seçim değişince alt seçimleri temizle
            setSelectedDistrict(null);
            setSelectedNeighborhood(null);
          }}
        />
        <SearchableSelect
          key={selectedCity?.id ?? "no-city"}
          label="İlçe"
          fetchUrl="/api/locations/districts"
          query={{ cityId: selectedCity?.id }}
          disabled={!selectedCity}
          autoFetch={Boolean(selectedCity)}
          onChange={(v) => {
            setSelectedDistrict(v);
            setSelectedNeighborhood(null);
          }}
        />
        <SearchableSelect
          key={selectedDistrict?.id ?? "no-district"}
          label="Mahalle"
          fetchUrl="/api/locations/neighborhoods"
          query={{ districtId: selectedDistrict?.id }}
          disabled={!selectedDistrict}
          autoFetch={Boolean(selectedDistrict)}
          onChange={(v) => setSelectedNeighborhood(v)}
        />
        <PriceInput name="price" label="Fiyat" />
        <div>
          <label className="block text-sm text-gray-700">Oda Sayısı</label>
          <select name="room_plan" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue="">
            <option value="">Seçiniz</option>
            {ROOM_PLANS.map((rp) => (
              <option key={rp} value={rp}>{rp}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Brüt m²</label>
          <input name="gross_m2" type="number" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Net m²</label>
          <input name="net_m2" type="number" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-700">Isıtma</label>
          <select name="heating" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option value="">Seçiniz</option>
            <option>Klima</option>
            <option>Doğalgaz</option>
            <option>Merkezi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Bina Yaşı</label>
          <input name="building_age" type="number" min={0} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Mülk Sahibi</label>
          <SearchableSelect label="" fetchUrl="/api/lookup/customers" onChange={(v) => setSelectedCustomerId(v?.id ?? "")} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Portföy Sahibi</label>
          <SearchableSelect label="" fetchUrl="/api/lookup/portfolio-owners" onChange={(v) => setSelectedPortfolioOwnerId(v?.id ?? "")} />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Kat No</label>
          <input name="floor" type="number" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Kat Sayısı (Daire için)</label>
          <input name="building_floors" type="number" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Krediye Uygun</label>
          <select name="credit" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
            <select name="ensuite_bath" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Havuz</label>
            <select name="pool" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Giyinme Odası</label>
            <select name="dressing_room" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Eşyalı</label>
            <select name="furnished" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Banyo Sayısı</label>
            <input name="bathroom_count" type="number" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Balkon</label>
            <select name="balcony" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Cephe (çoklu seçim)</label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
              {(["Kuzey","Güney","Doğu","Batı"] as const).map((dir) => (
                <label key={dir} className="inline-flex items-center gap-2">
                  <input type="checkbox" name="aspect" value={dir} />
                  <span>{dir}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Site İçinde</label>
            <select name="in_site" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option>Hayır</option>
              <option>Evet</option>
            </select>
          </div>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex justify-end gap-2">
                  <Link href="/properties" className="btn btn-primary">İptal</Link>
        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}


