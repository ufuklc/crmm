import type React from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { headers } from "next/headers";
import Link from "next/link";
import { ConfirmButton } from "@/components/forms/ConfirmButton";
import { CustomerNotesForm } from "@/components/customers/CustomerNotesForm";
import { RequestCreateModal } from "@/components/requests/RequestCreateModal";
import { MatchModal } from "@/components/modals/MatchModal";

type PageParams = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: PageParams): Promise<React.ReactElement> {
  const { id: customerId } = await params;

  const [{ data: customer }, { data: requests }, { data: notes }, { data: properties }] = await Promise.all([
    supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, phone, cash_or_loan, profession_id, created_at")
      .eq("id", customerId)
      .single(),
    supabaseAdmin
      .from("customer_requests")
      .select("id, type, listing_type, city, district, neighborhood, min_price, max_price, min_size, max_size, rooms, fulfilled, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("meeting_notes")
      .select("id, content, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("properties")
      .select("id, type, listing_type, city, district, neighborhood, price, gross_m2, net_m2, rooms, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        Kayıt bulunamadı.
      </div>
    );
  }

  // Eşleşme sayıları (toplu)
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const reqIds = (requests ?? []).map((r) => r.id as string);
  const resCounts = await fetch(`${baseUrl}/api/requests/match-counts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: reqIds }) });
  let jCounts: any = {};
  try { jCounts = await resCounts.json(); } catch { jCounts = {}; }
  const countById = (jCounts.counts as Record<string, number>) ?? {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Müşteri Detayı</h1>
        <div className="flex gap-2">
          <Link href={`/customers/${customerId}/edit`} className="btn btn-primary">Düzenle</Link>
          <form action={`/api/customers/${customerId}`} method="post">
            <input type="hidden" name="_method" value="delete" />
            <ConfirmButton className="btn btn-primary">Sil</ConfirmButton>
          </form>
        </div>
      </div>

      {/* Genel Bilgiler */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Genel Bilgiler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><span className="text-gray-500">Ad Soyad:</span> <span className="text-gray-900 font-medium">{customer.first_name} {customer.last_name}</span></div>
          <div><span className="text-gray-500">Telefon:</span> <span className="text-gray-900 font-medium">{customer.phone}</span></div>
          <div><span className="text-gray-500">Nakit/Kredi:</span> <span className="text-gray-900 font-medium">{customer.cash_or_loan}</span></div>
        </div>
      </section>

      {/* İstekler */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">İstekler</h2>
          <RequestCreateModal defaultCustomerId={customerId} />
        </div>
        {(requests ?? []).length === 0 ? (
          <div className="text-gray-600">İstek bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Tür</th>
                  <th className="py-2">İlan</th>
                  <th className="py-2">Konum</th>
                  <th className="py-2">Bütçe</th>
                  <th className="py-2">Metrekare</th>
                  <th className="py-2">Durum</th>
                  <th className="py-2 text-right">Eşleşme</th>
                </tr>
              </thead>
              <tbody>
                {(requests ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2">{r.type}</td>
                    <td className="py-2">{r.listing_type}</td>
                    <td className="py-2">{r.city ?? "-"} / {r.district ?? "-"}</td>
                    <td className="py-2">{r.min_price ?? "-"} - {r.max_price ?? "-"}</td>
                    <td className="py-2">{r.min_size ?? "-"} - {r.max_size ?? "-"}</td>
                    <td className="py-2">{r.fulfilled ? "Tamamlandı" : "Aktif"}</td>
                    <td className="py-2 text-right"><MatchModal requestId={r.id} count={countById[r.id as string] ?? 0} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Notlar */}
      <section>
        <CustomerNotesForm customerId={customerId} initialNotes={(notes ?? []) as any} />
      </section>

      {/* Mülkler */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Mülkler</h2>
        {(properties ?? []).length === 0 ? (
          <div className="text-gray-600">Mülk bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Tür</th>
                  <th className="py-2">İlan</th>
                  <th className="py-2">Konum</th>
                  <th className="py-2">Brüt/Net</th>
                  <th className="py-2">Oda</th>
                  <th className="py-2">Fiyat</th>
                  <th className="py-2 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {(properties ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2">{p.type}</td>
                    <td className="py-2">{p.listing_type}</td>
                    <td className="py-2">{p.city} / {p.district}</td>
                    <td className="py-2">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</td>
                    <td className="py-2">{p.rooms ?? "-"}</td>
                    <td className="py-2">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</td>
                    <td className="py-2 text-right"><Link href={`/properties/${p.id}`} className="btn btn-primary">Detay</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


