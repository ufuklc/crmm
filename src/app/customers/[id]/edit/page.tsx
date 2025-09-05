import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ProfessionSelect } from "@/components/forms/controls/ProfessionSelect";

async function fetchCustomer(id: string): Promise<{ id: string; first_name: string; last_name: string; phone?: string; profession_id?: string } | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/customers/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  return j.customer;
}

async function fetchProfessions(): Promise<Array<{ id: string; name: string }>> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/professions`, { cache: "no-store" });
  if (!res.ok) return [];
  const j = await res.json();
  return (j.professions as Array<{ id: string; name: string }>) ?? [];
}

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const [c] = await Promise.all([
    fetchCustomer(id),
    fetchProfessions(),
  ]);
  if (!c) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Müşteri Düzenle</h1>
      <form action={`/api/customers/${c.id}`} method="post" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <input type="hidden" name="_method" value="put" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Ad</label>
            <input name="first_name" defaultValue={c.first_name} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Soyad</label>
            <input name="last_name" defaultValue={c.last_name} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Telefon</label>
            <input name="phone" defaultValue={c.phone ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <ProfessionSelect initialId={c.profession_id ?? ""} />
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/customers" className="btn btn-primary">İptal</Link>
          <button type="submit" className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}


