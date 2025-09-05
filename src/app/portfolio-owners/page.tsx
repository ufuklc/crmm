import type React from "react";
import Link from "next/link";
import { headers } from "next/headers";

type Row = { id: string; first_name: string; last_name: string };

async function fetchOwners(): Promise<Row[]> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/portfolio-owners`, { cache: "no-store" });
  const j = await res.json();
  return (j.portfolioOwners as Row[]) ?? [];
}

export default async function PortfolioOwnersPage(): Promise<React.ReactElement> {
  const owners = await fetchOwners();
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Portföy Sahipleri</h1>
        <Link href="/portfolio-owners/new" className="btn btn-primary">Yeni Portföy Sahibi</Link>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
        {owners.length === 0 ? (
          <div>Henüz kayıt yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Ad</th>
                  <th className="py-2">Soyad</th>
                  <th className="py-2 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2">{o.first_name}</td>
                    <td className="py-2">{o.last_name}</td>
                    <td className="py-2 text-right">
                      <Link href={`/portfolio-owners/${o.id}/edit`} className="btn btn-primary">Düzenle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


