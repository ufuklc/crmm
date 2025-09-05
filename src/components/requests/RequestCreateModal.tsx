"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { useEffect, useState } from "react";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";
import { PriceInput } from "@/components/forms/controls/PriceInput";

type Item = { id: string; name: string };

const ROOM_PLANS: string[] = [
  "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
  "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
  "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
  "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
];

export function RequestCreateModal({ defaultCustomerId }: { defaultCustomerId?: string }): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string>(defaultCustomerId ?? "");
  const [type, setType] = useState<string>("Daire");
  const [listing, setListing] = useState<string>("Satılık");
  const [cashOrLoan, setCashOrLoan] = useState<"Nakit" | "Kredi">("Nakit");

  const [city, setCity] = useState<Item | null>(null);
  const [districts, setDistricts] = useState<Item[]>([]);
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Item[]>([]);
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);

  const [roomPlans, setRoomPlans] = useState<string[]>([]);
  const [minSize, setMinSize] = useState<string>("");
  const [maxSize, setMaxSize] = useState<string>("");
  // Extra property-like fields (display only)
  const [heatingPref, setHeatingPref] = useState<string>("");
  const [ensuite, setEnsuite] = useState<string>("");
  const [pool, setPool] = useState<string>("");
  const [dressing, setDressing] = useState<string>("");
  const [furnished, setFurnished] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [balcony, setBalcony] = useState<string>("");
  const [inSite, setInSite] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [buildingFloors, setBuildingFloors] = useState<string>("");
  const [buildingAge, setBuildingAge] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    // Reset when opened without default
    setError(null);
  }, [open]);

  // Fetch districts when city changes
  useEffect(() => {
    setDistricts([]);
    setSelectedDistrictIds([]);
    setNeighborhoods([]);
    setSelectedNeighborhoodIds([]);
    if (!city) return;
    fetch(`/api/locations/districts?cityId=${city.id}`)
      .then((r) => r.json())
      .then((j) => setDistricts((j.items as Item[]) ?? []))
      .catch(() => setDistricts([]));
  }, [city]);

  // Fetch neighborhoods when selected districts change
  useEffect(() => {
    setNeighborhoods([]);
    setSelectedNeighborhoodIds([]);
    async function load(): Promise<void> {
      const lists: Item[] = [];
      for (const dId of selectedDistrictIds) {
        try {
          const r = await fetch(`/api/locations/neighborhoods?districtId=${encodeURIComponent(dId)}`);
          const j = await r.json();
          lists.push(...((j.items as Item[]) ?? []));
        } catch {}
      }
      // dedupe by id
      const byId = new Map(lists.map((x) => [x.id, x] as const));
      setNeighborhoods(Array.from(byId.values()));
    }
    if (selectedDistrictIds.length > 0) void load();
  }, [selectedDistrictIds]);

  function toggleSelection(current: string[], id: string, set: (v: string[]) => void): void {
    if (current.includes(id)) set(current.filter((x) => x !== id));
    else set([...current, id]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget as HTMLFormElement;

    if (!customerId) {
      setSubmitting(false);
      setError("Lütfen müşteri seçin.");
      return;
    }

    const getNameById = (items: Item[], ids: string[]): string[] => {
      const map = new Map(items.map((i) => [i.id, i.name] as const));
      return ids.map((id) => map.get(id)).filter(Boolean) as string[];
    };

    const payload: Record<string, unknown> = {
      customer_id: customerId,
      type,
      listing_type: listing,
      cash_or_loan: cashOrLoan,
      city: city?.name ?? null,
      district: selectedDistrictIds.length ? getNameById(districts, selectedDistrictIds).join(", ") : null,
      neighborhood: selectedNeighborhoodIds.length ? getNameById(neighborhoods, selectedNeighborhoodIds).join(", ") : null,
      min_price: (form.querySelector('input[name="min_price"]') as HTMLInputElement | null)?.value || null,
      max_price: (form.querySelector('input[name="max_price"]') as HTMLInputElement | null)?.value || null,
      min_size: minSize ? Number(minSize) : null,
      max_size: maxSize ? Number(maxSize) : null,
      // Not: Çoklu oda planı (ROOM_PLANS) UI sağlanıyor, ancak tablo desteği olmadığından şimdilik gönderilmiyor
      heating: heatingPref || null,
      ensuite_bath: ensuite ? (ensuite === "Evet") : null,
      pool: pool ? (pool === "Evet") : null,
      dressing_room: dressing ? (dressing === "Evet") : null,
      furnished: furnished ? (furnished === "Evet") : null,
      bathroom_count: bathrooms ? Number(bathrooms) : null,
      balcony: balcony ? (balcony === "Evet") : null,
      in_site: inSite ? (inSite === "Evet") : null,
      floor: floor ? Number(floor) : null,
      building_floors: buildingFloors ? Number(buildingFloors) : null,
      building_age: buildingAge ? Number(buildingAge) : null,
    };

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(j.error ?? "Kayıt başarısız");
      return;
    }
    setOpen(false);
    // Basit yenileme
    window.location.reload();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="btn btn-primary">Yeni İstek</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <Dialog.Title className="text-sm font-semibold text-gray-900">Yeni İstek</Dialog.Title>
            <Dialog.Close className="btn btn-primary">Kapat</Dialog.Close>
          </div>

          <form onSubmit={onSubmit} className="mt-3 space-y-3 text-sm">
            <div>
              <label className="block text-sm text-gray-700">Müşteri</label>
              <SearchableSelect label="Müşteri" fetchUrl="/api/lookup/customers" onChange={(v) => setCustomerId(v?.id ?? "")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Tür</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option>Daire</option>
                  <option>İş Yeri</option>
                  <option>Arsa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">İlan Tipi</label>
                <select value={listing} onChange={(e) => setListing(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option>Satılık</option>
                  <option>Kiralık</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">Ödeme Tercihi</label>
              <select value={cashOrLoan} onChange={(e) => setCashOrLoan(e.target.value as "Nakit" | "Kredi")} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                <option value="Nakit">Nakit</option>
                <option value="Kredi">Kredi</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SearchableSelect label="İl" fetchUrl="/api/locations/cities" autoFetch onChange={(v) => setCity(v)} />

              <div>
                <label className="block text-sm text-gray-700">İlçeler</label>
                <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-gray-200 p-2">
                  {districts.length === 0 ? (
                    <div className="text-xs text-gray-500">Önce il seçin</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {districts.map((d) => (
                        <label key={d.id} className="inline-flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={selectedDistrictIds.includes(d.id)} onChange={() => toggleSelection(selectedDistrictIds, d.id, setSelectedDistrictIds)} />
                          <span>{d.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Mahalleler</label>
                <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-gray-200 p-2">
                  {neighborhoods.length === 0 ? (
                    <div className="text-xs text-gray-500">Önce ilçe seçin</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {neighborhoods.map((n) => (
                        <label key={n.id} className="inline-flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={selectedNeighborhoodIds.includes(n.id)} onChange={() => toggleSelection(selectedNeighborhoodIds, n.id, setSelectedNeighborhoodIds)} />
                          <span>{n.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PriceInput name="min_price" label="Min Fiyat" />
              <PriceInput name="max_price" label="Max Fiyat" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Min m²</label>
                <input value={minSize} onChange={(e) => setMinSize(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Max m²</label>
                <input value={maxSize} onChange={(e) => setMaxSize(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">Oda Sayısı</label>
              <div className="mt-1">
                <details className="rounded-lg border border-gray-300">
                  <summary className="cursor-pointer select-none rounded-lg px-3 py-2 text-sm">{roomPlans.length ? `${roomPlans.length} seçenek` : "Seçiniz"}</summary>
                  <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-auto">
                    {ROOM_PLANS.map((rp) => (
                      <label key={rp} className="inline-flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={roomPlans.includes(rp)} onChange={() => toggleSelection(roomPlans, rp, setRoomPlans)} />
                        <span>{rp}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            {/* Extra preferences (display only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Isıtma</label>
                <select value={heatingPref} onChange={(e) => setHeatingPref(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Klima</option>
                  <option>Doğalgaz</option>
                  <option>Merkezi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
                <select value={ensuite} onChange={(e) => setEnsuite(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Havuz</label>
                <select value={pool} onChange={(e) => setPool(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Giyinme Odası</label>
                <select value={dressing} onChange={(e) => setDressing(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Eşyalı</label>
                <select value={furnished} onChange={(e) => setFurnished(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Banyo Sayısı</label>
                <input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Balkon</label>
                <select value={balcony} onChange={(e) => setBalcony(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Site İçinde</label>
                <select value={inSite} onChange={(e) => setInSite(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
                  <option value="">Farketmez</option>
                  <option>Evet</option>
                  <option>Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Bulunduğu Kat</label>
                <input value={floor} onChange={(e) => setFloor(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Bina Kat Sayısı</label>
                <input value={buildingFloors} onChange={(e) => setBuildingFloors(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Bina Yaşı</label>
                <input value={buildingAge} onChange={(e) => setBuildingAge(e.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex justify-end gap-2">
              <Dialog.Close className="btn btn-primary">İptal</Dialog.Close>
              <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">{submitting ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


