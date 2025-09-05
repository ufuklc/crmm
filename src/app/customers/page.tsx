import type React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Pagination } from "@/components/ui/Pagination";

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  cash_or_loan: string;
  preferred_listing_type?: string | null;
};

async function fetchCustomers(searchParams?: Record<string, string | undefined>): Promise<{ customers: CustomerRow[]; total: number; page: number; pageSize: number }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const qs = new URLSearchParams();
  const ua = h.get("user-agent") ?? "";
  const isMobile = /Mobi|Android|iPhone/i.test(ua);
  if (searchParams) Object.entries(searchParams).forEach(([k, v]) => v && qs.set(k, v));
  if (!qs.has("pageSize") && isMobile) qs.set("pageSize", "10");
  const url = qs.toString() ? `${baseUrl}/api/customers?${qs}` : `${baseUrl}/api/customers`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { customers: [], total: 0, page: 1, pageSize: 25 };
  let json: { customers?: CustomerRow[]; total?: number; page?: number; pageSize?: number } = {};
  try { json = await res.json(); } catch { json = {}; }
  return { customers: (json.customers as CustomerRow[]) ?? [], total: Number(json.total ?? 0), page: Number(json.page ?? 1), pageSize: Number(json.pageSize ?? 25) };
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { customers, total, page, pageSize } = await fetchCustomers(sp);
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Müşteri Listesi</h1>
        <Link href="/customers/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Yeni Müşteri Ekle
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
        <form className="mb-3 flex flex-wrap gap-2">
          <input name="q" placeholder="Ara (ad/soyad/telefon)" className="rounded-lg border border-gray-300 p-2 text-sm" defaultValue={sp?.q ?? ""} />
          <select name="cash_or_loan" className="rounded-lg border border-gray-300 p-2 text-sm" defaultValue={sp?.cash_or_loan ?? ""}>
            <option value="">Nakit/Kredi (hepsi)</option>
            <option value="Nakit">Nakit</option>
            <option value="Kredi">Kredi</option>
          </select>
          <button className="btn btn-primary" type="submit">Filtrele</button>
        </form>
        {customers.length === 0 ? (
          <div>Henüz müşteri yok.</div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Ad Soyad</th>
                  <th className="py-2">Telefon</th>
                  <th className="py-2">Nakit/Kredi</th>
                  <th className="py-2">Tercih</th>
                  <th className="py-2">Durum</th>
                  <th className="py-2 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2">
                      <Link href={`/customers/${c.id}`} className="text-indigo-600 hover:underline">
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="py-2">{c.phone}</td>
                    <td className="py-2">{c.cash_or_loan}</td>
                    <td className="py-2">{c.preferred_listing_type ?? "-"}</td>
                    <td className="py-2">
                      <form action={`/api/customers/${c.id}`} method="post" className="inline">
                        <input type="hidden" name="_method" value="put" />
                        <input type="hidden" name="cash_or_loan" value={c.cash_or_loan === "Nakit" ? "Kredi" : "Nakit"} />
                        <button className={`btn text-xs ${c.cash_or_loan === "Nakit" ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                          {c.cash_or_loan === "Nakit" ? "Nakit" : "Kredi"}
                        </button>
                      </form>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/customers/${c.id}`} className="btn btn-primary">Detay</Link>
                        <form action={`/api/customers/${c.id}`} method="post" className="inline">
                          <input type="hidden" name="_method" value="delete" />
                          <button type="submit" aria-label="Sil" title="Sil" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                              <path fillRule="evenodd" d="M9 3.75A2.25 2.25 0 0111.25 1.5h1.5A2.25 2.25 0 0115 3.75V4.5h3.75a.75.75 0 010 1.5h-.69l-1.03 13.088A2.25 2.25 0 0114.79 21.75H9.21a2.25 2.25 0 01-2.24-2.662L5.94 6H5.25a.75.75 0 010-1.5H9V3.75zm1.5.75h3V3.75a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V4.5zm-2.78 1.5l1.02 12.938a.75.75 0 00.75.662h5.58a.75.75 0 00.75-.662L17.28 6H7.72z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="md:hidden space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                  <Link href={`/customers/${c.id}`} className="btn btn-primary text-xs">Detay</Link>
                </div>
                <div className="mt-1 text-xs text-gray-600">{c.phone}</div>
                <div className="mt-1 text-xs text-gray-600">{c.cash_or_loan}</div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            baseUrl="/customers"
            searchParams={sp}
          />
          </>
        )}
      </div>
    </div>
  );
}


