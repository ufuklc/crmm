import type React from "react";
import { headers } from "next/headers";
import { MatchModal } from "@/components/modals/MatchModal";
import { RequestCreateModal } from "@/components/requests/RequestCreateModal";
import { RequestFiltersBar } from "@/components/filters/RequestFiltersBar";

type RequestRow = {
  id: string;
  customer_id: string;
  type: string;
  listing_type: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  rooms: number | null;
  fulfilled: boolean;
  customer?: { id: string; first_name: string; last_name: string } | null;
};

async function fetchRequests(searchParams?: Record<string, string | undefined>): Promise<{ requests: RequestRow[]; total: number; page: number; pageSize: number }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const qs = new URLSearchParams();
  const ua = h.get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  if (searchParams) Object.entries(searchParams).forEach(([k, v]) => v && qs.set(k, v));
  if (!qs.has("pageSize") && isMobile) qs.set("pageSize", "10");
  const url = qs.toString() ? `${baseUrl}/api/requests?${qs}` : `${baseUrl}/api/requests`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { requests: [], total: 0, page: 1, pageSize: 25 };
  let json: { requests?: RequestRow[]; total?: number; page?: number; pageSize?: number } = {};
  try { json = await res.json(); } catch { json = {}; }
  return { requests: (json.requests as RequestRow[]) ?? [], total: Number(json.total ?? 0), page: Number(json.page ?? 1), pageSize: Number(json.pageSize ?? 25) };
}

export default async function RequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { requests, total, page, pageSize } = await fetchRequests(sp);
  const h2 = await headers();
  const host2 = h2.get("x-forwarded-host") ?? h2.get("host") ?? "localhost:3000";
  const proto2 = h2.get("x-forwarded-proto") ?? (host2.startsWith("localhost") ? "http" : "https");
  const baseUrl2 = `${proto2}://${host2}`;
  const ids = requests.map((r) => r.id);
  const resCounts = await fetch(`${baseUrl2}/api/requests/match-counts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
  let jCounts: { counts?: Record<string, number> } = {};
  try { jCounts = await resCounts.json(); } catch { jCounts = {}; }
  const countById = jCounts.counts ?? {};
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">İstek Listesi</h1>
        <RequestCreateModal />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
        <RequestFiltersBar initialCustomerId={sp?.customer_id} />
        {requests.length === 0 ? (
          <div>Henüz istek yok.</div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Müşteri</th>
                  <th className="py-2">Tür</th>
                  <th className="py-2">İlan</th>
                  <th className="py-2">Konum</th>
                  <th className="py-2">Bütçe</th>
                  <th className="py-2">Metrekare</th>
                  <th className="py-2">Durum</th>
                  <th className="py-2">Detay</th>
                  <th className="py-2">Sil</th>
                  <th className="py-2 text-right">Eşleşme</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2">
                      {r.customer ? (
                        <a href={`/customers/${r.customer.id}`} className="text-indigo-600 hover:underline">{r.customer.first_name} {r.customer.last_name}</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2">{r.type}</td>
                    <td className="py-2">{r.listing_type}</td>
                    <td className="py-2">{r.city ?? "-"} / {r.district ?? "-"}</td>
                    <td className="py-2">{r.min_price ?? "-"} - {r.max_price ?? "-"}</td>
                    <td className="py-2">{r.min_size ?? "-"} - {r.max_size ?? "-"}</td>
                    <td className="py-2">
                      <form action={`/api/requests/${r.id}`} method="post" className="inline">
                        <input type="hidden" name="_method" value="patch" />
                        <input type="hidden" name="fulfilled" value={r.fulfilled ? "false" : "true"} />
                        <button
                          className={`btn text-xs flex items-center gap-1 ${r.fulfilled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}`}
                          type="submit"
                          aria-label="Durumu değiştir"
                          title="Durumu değiştir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M4.5 7.5a6 6 0 0110.606-3.682.75.75 0 001.146-.966A7.5 7.5 0 103.75 12H6a.75.75 0 000-1.5H4.5v-3z"/>
                            <path d="M19.5 16.5a6 6 0 01-10.606 3.682.75.75 0 00-1.146.966A7.5 7.5 0 1020.25 12H18a.75.75 0 000 1.5h1.5v3z"/>
                          </svg>
                          {r.fulfilled ? "Karşılandı" : "Aktif"}
                        </button>
                      </form>
                    </td>
                    <td className="py-2">
                      <a href={`/requests/${r.id}`} className="btn btn-primary text-xs">Detay</a>
                    </td>
                    <td className="py-2">
                      <MatchModal requestId={r.id} count={countById[r.id] ?? 0} />
                    </td>
                    <td className="py-2 text-right">
                      <form action={`/api/requests/${r.id}`} method="post" className="inline">
                        <input type="hidden" name="_method" value="delete" />
                        <button type="submit" aria-label="Sil" title="Sil" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M9 3.75A2.25 2.25 0 0111.25 1.5h1.5A2.25 2.25 0 0115 3.75V4.5h3.75a.75.75 0 010 1.5h-.69l-1.03 13.088A2.25 2.25 0 0114.79 21.75H9.21a2.25 2.25 0 01-2.24-2.662L5.94 6H5.25a.75.75 0 010-1.5H9V3.75zm1.5.75h3V3.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V4.5zm-2.78 1.5l1.02 12.938a.75.75 0 00.75.662h5.58a.75.75 0 00.75-.662L17.28 6H7.72z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{r.type} • {r.listing_type}</div>
                  <div className="flex items-center gap-2">
                    <a href={`/requests/${r.id}`} className="btn btn-primary text-xs">Detay</a>
                    <MatchModal requestId={r.id} count={countById[r.id] ?? 0} />
                    <form action={`/api/requests/${r.id}`} method="post" className="inline">
                      <input type="hidden" name="_method" value="delete" />
                      <button type="submit" aria-label="Sil" title="Sil" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path fillRule="evenodd" d="M9 3.75A2.25 2.25 0 0111.25 1.5h1.5A2.25 2.25 0 0115 3.75V4.5h3.75a.75.75 0 010 1.5h-.69l-1.03 13.088A2.25 2.25 0 0114.79 21.75H9.21a2.25 2.25 0 01-2.24-2.662L5.94 6H5.25a.75.75 0 010-1.5H9V3.75zm1.5.75h3V3.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V4.5zm-2.78 1.5l1.02 12.938a.75.75 0 00.75.662h5.58a.75.75 0 00.75-.662L17.28 6H7.72z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600">{r.city ?? "-"} / {r.district ?? "-"}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-500">Bütçe:</span> <span className="text-gray-900">{r.min_price ?? "-"} - {r.max_price ?? "-"}</span></div>
                  <div><span className="text-gray-500">m²:</span> <span className="text-gray-900">{r.min_size ?? "-"} - {r.max_size ?? "-"}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Durum:</span>
                    <form action={`/api/requests/${r.id}`} method="post" className="inline">
                      <input type="hidden" name="_method" value="patch" />
                      <input type="hidden" name="fulfilled" value={r.fulfilled ? "false" : "true"} />
                      <button
                        className={`btn text-xs flex items-center gap-1 ${r.fulfilled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}`}
                        type="submit"
                        aria-label="Durumu değiştir"
                        title="Durumu değiştir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M4.5 7.5a6 6 0 0110.606-3.682.75.75 0 001.146-.966A7.5 7.5 0 103.75 12H6a.75.75 0 000-1.5H4.5v-3z"/>
                          <path d="M19.5 16.5a6 6 0 01-10.606 3.682.75.75 0 00-1.146.966A7.5 7.5 0 1020.25 12H18a.75.75 0 000 1.5h1.5v3z"/>
                        </svg>
                        {r.fulfilled ? "Karşılandı" : "Aktif"}
                      </button>
                    </form>
                  </div>
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
                <a key={p} href={`/requests?${qs}`} className={`rounded-md px-3 py-1 text-sm ${p === page ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{p}</a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


