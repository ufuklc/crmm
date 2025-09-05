"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { readCities, readDistricts, readNeighborhoods, upsertCities, upsertDistricts, upsertNeighborhoods } from "@/lib/cache/locationsCache";

type Item = { id: string; name: string };

export function SearchableSelect({
  label,
  fetchUrl,
  query,
  onChange,
  disabled,
  placeholder,
  autoFetch,
}: {
  label: string;
  fetchUrl: string;
  query?: Record<string, string | undefined>;
  onChange: (value: { id: string; name: string } | null) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFetch?: boolean;
}): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Item | null>(null);

  const url = useMemo(() => {
    const u = new URL(fetchUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (query) Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
    u.search = params.toString();
    return u.toString();
  }, [fetchUrl, search, query]);

  useEffect(() => {
    if (!open && !autoFetch) return;
    // Try cache first for known endpoints
    if (fetchUrl.includes("/api/locations/cities")) {
      const cached = readCities();
      if (cached.length) setItems(cached as Array<{ id: string; name: string }>);
    } else if (fetchUrl.includes("/api/locations/districts")) {
      const cached = readDistricts((query as { cityId?: string })?.cityId);
      if (cached.length) setItems(cached as Array<{ id: string; name: string }>);
    } else if (fetchUrl.includes("/api/locations/neighborhoods")) {
      const cached = readNeighborhoods((query as { districtId?: string })?.districtId);
      if (cached.length) setItems(cached as Array<{ id: string; name: string }>);
    }
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const arr = (j.items as Item[]) ?? [];
        setItems(arr);
        // Update cache
        if (fetchUrl.includes("/api/locations/cities")) upsertCities(arr as Array<{ id: string; name: string }>);
        else if (fetchUrl.includes("/api/locations/districts")) upsertDistricts((query as { cityId?: string })?.cityId ?? "", arr as Array<{ id: string; name: string }>);
        else if (fetchUrl.includes("/api/locations/neighborhoods")) upsertNeighborhoods((query as { districtId?: string })?.districtId ?? "", arr as Array<{ id: string; name: string }>);
      })
      .catch(() => setItems([]));
  }, [url, open, autoFetch, fetchUrl, query]);

  function selectItem(item: Item): void {
    setSelected(item);
    onChange(item);
    setOpen(false);
  }

  return (
    <div className="space-y-1 searchable-select">
      <label className="block text-sm text-gray-700">{label}</label>
      <div className="relative">
        <button type="button" disabled={disabled} onClick={() => setOpen((v) => !v)} className="w-full rounded-lg border border-gray-300 bg-white p-2 text-left text-sm disabled:opacity-60">
          {selected?.name ?? placeholder ?? "Seçiniz"}
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..."
              className="mb-2 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />
            <div className="max-h-64 overflow-auto">
              {items.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">Sonuç bulunamadı</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <li key={it.id}>
                      <button type="button" onClick={() => selectItem(it)} className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50">
                        {it.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


