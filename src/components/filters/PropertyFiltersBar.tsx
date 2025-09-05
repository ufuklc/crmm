"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PriceInput } from "@/components/forms/controls/PriceInput";
import { MultiCheckDropdown } from "@/components/forms/controls/MultiCheckDropdown";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";

const ROOM_PLANS = [
  "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
  "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
  "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
  "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
];

export function PropertyFiltersBar({
  initialSearchParams,
}: {
  initialSearchParams?: Record<string, string | string[] | undefined>;
}): React.ReactElement {
  const [selectedRoomPlans, setSelectedRoomPlans] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<string[]>([]);
  const [selectedHeating, setSelectedHeating] = useState<string[]>([]); 
  const [selectedPortfolioOwners, setSelectedPortfolioOwners] = useState<string[]>([]);
  const [portfolioOwnerOptions, setPortfolioOwnerOptions] = useState<string[]>([]);

  const current = useMemo(() => {
    const sp: Record<string, string | string[] | undefined> = initialSearchParams ?? {};
    return sp;
  }, [initialSearchParams]);

  // İlçe seçildiğinde mahalle listesini çek
  useEffect(() => {
    async function load(): Promise<void> {
      if (!selectedDistrict?.id) { setNeighborhoodOptions([]); setSelectedNeighborhoods([]); return; }
      try {
        const r = await fetch(`/api/locations/neighborhoods?districtId=${encodeURIComponent(selectedDistrict.id)}`);
        const j = await r.json();
        const items = (j.items as { id: string; name: string }[]) ?? [];
        setNeighborhoodOptions(items.map((x) => x.name));
      } catch {
        setNeighborhoodOptions([]);
      }
    }
    void load();
  }, [selectedDistrict?.id]);

  // Portföy sahiplerini yükle (ilk açılışta)
  useEffect(() => {
    async function loadOwners(): Promise<void> {
      try {
        const r = await fetch(`/api/lookup/portfolio-owners`);
        const j = await r.json();
        const items = (j.items as { id: string; name: string }[]) ?? [];
        setPortfolioOwnerOptions(items.map((x) => x.name));
      } catch {
        setPortfolioOwnerOptions([]);
      }
    }
    void loadOwners();
  }, []);

  return (
    <form className="space-y-3" method="get">
      <select name="type" defaultValue={(current.type as string) ?? ""} className="w-full rounded-lg border border-gray-300 p-2 text-sm">
        <option value="">Tür (hepsi)</option>
        <option>Daire</option>
        <option>İş Yeri</option>
        <option>Arsa</option>
      </select>
      <select name="listing_type" defaultValue={(current.listing_type as string) ?? ""} className="w-full rounded-lg border border-gray-300 p-2 text-sm">
        <option value="">İlan (hepsi)</option>
        <option>Satılık</option>
        <option>Kiralık</option>
      </select>

      <SearchableSelect
        label="İl"
        fetchUrl="/api/locations/cities"
        autoFetch
        onChange={(v) => {
          setSelectedCity(v);
          setSelectedDistrict(null);
          setSelectedNeighborhoods([]);
        }}
      />
      <input type="hidden" name="city" value={selectedCity?.name ?? ""} />
      <SearchableSelect
        key={selectedCity?.id ?? "no-city"}
        label="İlçe"
        fetchUrl="/api/locations/districts"
        query={{ cityId: selectedCity?.id }}
        disabled={!selectedCity}
        autoFetch={Boolean(selectedCity)}
        onChange={(v) => {
          setSelectedDistrict(v);
          setSelectedNeighborhoods([]);
        }}
      />
      <input type="hidden" name="district" value={selectedDistrict?.name ?? ""} />
      <MultiCheckDropdown label="Mahalle" options={neighborhoodOptions} selected={selectedNeighborhoods} onChange={setSelectedNeighborhoods} placeholder="Mahalle seç" />
      {selectedNeighborhoods.map((n, i) => (
        <input key={`nh-${i}-${n}`} type="hidden" name="neighborhood" value={n} />
      ))}

      <div className="grid grid-cols-2 gap-2">
        <PriceInput name="min_price" label="Min Fiyat" />
        <PriceInput name="max_price" label="Max Fiyat" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-700">Min Brüt m²</label>
          <input name="min_gross_m2" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Max Brüt m²</label>
          <input name="max_gross_m2" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
      </div>

      <MultiCheckDropdown label="Oda Sayısı" options={ROOM_PLANS} selected={selectedRoomPlans} onChange={(v) => setSelectedRoomPlans(v)} />
      {selectedRoomPlans.map((r, idx) => (
        <input key={`room_plan-${idx}-${r}`} type="hidden" name="room_plan" value={r} />
      ))}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-700">Min Kat Sayısı</label>
          <input name="min_building_floors" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Max Kat Sayısı</label>
          <input name="max_building_floors" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
      </div>

      <MultiCheckDropdown label="Isıtma" options={["Klima","Doğalgaz","Merkezi"]} selected={selectedHeating} onChange={setSelectedHeating} />
      {selectedHeating.map((h, i) => (
        <input key={`heat-${i}-${h}`} type="hidden" name="heating" value={h} />
      ))}

      <MultiCheckDropdown label="Portföy Sahibi" options={portfolioOwnerOptions} selected={selectedPortfolioOwners} onChange={setSelectedPortfolioOwners} placeholder="Portföy sahibi seç" />
      {selectedPortfolioOwners.map((n, i) => (
        <input key={`po-${i}-${n}`} type="hidden" name="portfolio_owner_name" value={n} />
      ))}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-700">Havuz</label>
          <select name="pool" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.pool as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
          <select name="ensuite_bath" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.ensuite_bath as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Giyinme Odası</label>
          <select name="dressing_room" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.dressing_room as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Eşyalı</label>
          <select name="furnished" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.furnished as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Balkon</label>
          <select name="balcony" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.balcony as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Site İçinde</label>
          <select name="in_site" className="w-full rounded-lg border border-gray-300 p-2 text-sm" defaultValue={(current.in_site as string) ?? ""}>
            <option value="">Tümü</option>
            <option>Evet</option>
            <option>Hayır</option>
          </select>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <button className="btn btn-primary w-full" type="submit">Filtrele</button>
        <Link href="/properties" className="btn btn-primary w-full text-center">Temizle</Link>
      </div>
    </form>
  );
}


