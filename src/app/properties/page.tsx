import type React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";
import { PropertyFiltersMobile } from "@/components/filters/PropertyFiltersMobile";

type PropertyRow = {
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
  room_plan?: string | null;
  building_floors?: number | null;
  building_age?: number | null;
  heating?: string | null;
};

async function fetchProperties(searchParams?: Record<string, string | undefined>): Promise<{ properties: PropertyRow[]; total: number; page: number; pageSize: number }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const qs = new URLSearchParams();
  const ua = h.get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  if (searchParams) Object.entries(searchParams).forEach(([k, v]) => v && qs.set(k, v));
  if (!qs.has("pageSize") && isMobile) qs.set("pageSize", "10");
  const url = qs.toString() ? `${baseUrl}/api/properties?${qs}` : `${baseUrl}/api/properties`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { properties: [], total: 0, page: 1, pageSize: 25 };
  let json: any = {};
  try { json = await res.json(); } catch { json = {}; }
  return { properties: (json.properties as PropertyRow[]) ?? [], total: Number(json.total ?? 0), page: Number(json.page ?? 1), pageSize: Number(json.pageSize ?? 25) };
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { properties, total, page, pageSize } = await fetchProperties(sp);
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Varlıklar</h1>
        <Link href="/properties/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Yeni Varlık Ekle
        </Link>
      </div>
      <div className="md:grid md:grid-cols-12 md:gap-4">
        <aside className="md:col-span-3 mb-4 md:mb-0">
          <div className="hidden md:block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
            <PropertyFiltersBar initialSearchParams={sp as any} />
          </div>
          <PropertyFiltersMobile initialSearchParams={sp as any} />
        </aside>
        <section className="md:col-span-9">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
            {properties.length === 0 ? (
              <div>Henüz varlık yok.</div>
            ) : (
              <>
              <div className="hidden md:block overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="py-2">Tür</th>
                      <th className="py-2">İlan</th>
                      <th className="py-2">İl/İlçe/Mahalle</th>
                      <th className="py-2">Oda Sayısı</th>
                      <th className="py-2">Brüt/Net m²</th>
                      <th className="py-2">Fiyat</th>
                      <th className="py-2 text-right">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-2">
                          <Link href={`/properties/${p.id}`} className="text-indigo-600 hover:underline">
                            {p.type}
                          </Link>
                        </td>
                        <td className="py-2">{p.listing_type}</td>
                        <td className="py-2">{p.city} / {p.district} / {p.neighborhood}</td>
                        <td className="py-2">{p.room_plan ?? "-"}</td>
                        <td className="py-2">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</td>
                        <td className="py-2">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</td>
                        <td className="py-2 text-right">
                          <Link href={`/properties/${p.id}`} className="btn btn-primary">Detay</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-3">
                {properties.map((p) => (
                  <div key={p.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{p.type} • {p.listing_type}</div>
                      <Link href={`/properties/${p.id}`} className="btn btn-primary text-xs">Detay</Link>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{p.city} / {p.district}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">Brüt/Net:</span> <span className="text-gray-900">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</span></div>
                      <div><span className="text-gray-500">Oda Sayısı:</span> <span className="text-gray-900">{p.room_plan ?? "-"}</span></div>
                      <div><span className="text-gray-500">Kat:</span> <span className="text-gray-900">{p.building_floors ?? "-"}</span></div>
                      <div><span className="text-gray-500">Bina Yaşı:</span> <span className="text-gray-900">{p.building_age ?? "-"}</span></div>
                      <div><span className="text-gray-500">Isıtma:</span> <span className="text-gray-900">{p.heating ?? "-"}</span></div>
                      <div><span className="text-gray-500">Fiyat:</span> <span className="text-gray-900">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</span></div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
            {total > pageSize && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  if (sp) Object.entries(sp).forEach(([k, v]) => { if (typeof v === "string" && v) params.set(k, v); });
                  params.set("page", String(p));
                  params.set("pageSize", String(pageSize));
                  const qs = params.toString();
                  return (
                    <a key={p} href={`/properties?${qs}`} className={`rounded-md px-3 py-1 text-sm ${p === page ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{p}</a>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


