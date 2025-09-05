"use client";

import type React from "react";
import { useState } from "react";

type Customer = { id: string; first_name: string; last_name: string; phone: string; cash_or_loan: string };
type RequestRow = { id: string; type: string; listing_type: string; city: string | null; district: string | null; neighborhood: string | null; min_price: number | null; max_price: number | null; min_size: number | null; max_size: number | null; rooms: number | null; fulfilled: boolean };
type Note = { id: string; content: string; created_at: string };
type PropertyRow = { id: string; type: string; listing_type: string; city: string; district: string; neighborhood: string; price: number; gross_m2: number; net_m2: number | null; rooms: number | null };

export function CustomerDetailTabs(props: { customer: Customer; requests: RequestRow[]; notes: Note[]; properties: PropertyRow[]; customerId: string }): React.ReactElement {
  const { customer, requests, notes, properties, customerId } = props;
  const [active, setActive] = useState<"details" | "requests" | "notes" | "properties">("details");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { key: "details", label: "Detaylar" },
          { key: "requests", label: "İstekler" },
          { key: "notes", label: "Görüşme Notları" },
          { key: "properties", label: "Mülkler" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`btn ${active === tab.key ? "bg-indigo-700 text-white hover:bg-indigo-800" : "btn-primary opacity-70 hover:opacity-100"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "details" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><span className="text-gray-500">Ad Soyad:</span> <span className="text-gray-900 font-medium">{customer.first_name} {customer.last_name}</span></div>
            <div><span className="text-gray-500">Telefon:</span> <span className="text-gray-900 font-medium">{customer.phone}</span></div>
            <div><span className="text-gray-500">Nakit/Kredi:</span> <span className="text-gray-900 font-medium">{customer.cash_or_loan}</span></div>
          </div>
        </div>
      )}

      {active === "requests" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
          {requests.length === 0 ? (
            <div className="text-gray-600">İstek bulunmuyor.</div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-2">Tür</th>
                    <th className="py-2">İlan</th>
                    <th className="py-2">Konum</th>
                    <th className="py-2">Bütçe</th>
                    <th className="py-2">Metrekare</th>
                    <th className="py-2">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2">{r.type}</td>
                      <td className="py-2">{r.listing_type}</td>
                      <td className="py-2">{r.city ?? "-"} / {r.district ?? "-"}</td>
                      <td className="py-2">{r.min_price ?? "-"} - {r.max_price ?? "-"}</td>
                      <td className="py-2">{r.min_size ?? "-"} - {r.max_size ?? "-"}</td>
                      <td className="py-2">{r.fulfilled ? "Tamamlandı" : "Aktif"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === "notes" && (
        <CustomerNotes customerId={customerId} notes={notes} />
      )}

      {active === "properties" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
          {properties.length === 0 ? (
            <div className="text-gray-600">Mülk bulunmuyor.</div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-2">Tür</th>
                    <th className="py-2">İlan</th>
                    <th className="py-2">Konum</th>
                    <th className="py-2">Brüt/Net</th>
                    <th className="py-2">Oda</th>
                    <th className="py-2">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2">{p.type}</td>
                      <td className="py-2">{p.listing_type}</td>
                      <td className="py-2">{p.city} / {p.district}</td>
                      <td className="py-2">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</td>
                      <td className="py-2">{p.rooms ?? "-"}</td>
                      <td className="py-2">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CustomerNotes({ customerId, notes }: { customerId: string; notes: Note[] }): React.ReactElement {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [list, setList] = useState<Note[]>(notes);

  async function onAdd(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/meeting-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, content }),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Kayıt başarısız");
      return;
    }
    setList([{ id: json.id as string, content, created_at: new Date().toISOString() }, ...list]);
    setContent("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onAdd} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <label className="block text-sm text-gray-700">Yeni Görüşme Notu</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={3} className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
        {list.length === 0 ? (
          <div className="text-gray-600">Not yok.</div>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => (
              <li key={n.id} className="border-b border-gray-100 pb-2">
                <div className="text-gray-900">{n.content}</div>
                <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString("tr-TR")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


