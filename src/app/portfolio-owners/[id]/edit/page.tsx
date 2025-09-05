import type React from "react";
import { headers } from "next/headers";

async function fetchOwner(id: string): Promise<any | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/portfolio-owners/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return j.portfolioOwner;
}

export default async function EditPortfolioOwnerPage({ params }: { params: { id: string } }): Promise<React.ReactElement> {
  const o = await fetchOwner(params.id);
  if (!o) return <div className="max-w-4xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Portföy Sahibi Düzenle</h1>
      <form action={`/api/portfolio-owners/${o.id}`} method="post" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <input type="hidden" name="_method" value="put" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Ad</label>
            <input name="first_name" defaultValue={o.first_name} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Soyad</label>
            <input name="last_name" defaultValue={o.last_name} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <a href="/portfolio-owners" className="btn btn-primary">İptal</a>
          <button type="submit" className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}


