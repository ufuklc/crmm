import type React from "react";
import { headers } from "next/headers";

export default async function Home(): Promise<React.ReactElement> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });
  const json = await res.json();
  const kpi = json.kpi as { totalProperties: number; activeCustomers: number; activeRequests: number };
  const todayNotes = (json.todayNotes as Array<{ id: string; customer: { id: string; first_name: string; last_name: string } | null; created_at: string }>) ?? [];
  const todayTotal = Number(json.todayNotesTotal ?? 0);
  const todayProps = (json.todayProps as Array<{ id: string; type: string; created_at: string; portfolio_owner: { id: string; first_name: string; last_name: string } | null }>) ?? [];
  const todayPropsTotal = Number(json.todayPropsTotal ?? 0);
  const activityPage = Number(json.activityPage ?? 1);
  const activityPageSize = Number(json.activityPageSize ?? 10);
  const notifications = (json.notifications as Array<{ id: string; customer: { id: string; first_name: string; last_name: string } | null; requestCreatedAt: string }>) ?? [];
  const notificationsTotal = Number(json.notificationsTotal ?? 0);
  const notifPage = Number(json.notifPage ?? 1);
  const notifPageSize = Number(json.notifPageSize ?? 10);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">Ana Sayfa</h1>
        <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 overflow-x-auto pb-1 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Toplam Varlık", value: kpi?.totalProperties ?? 0 },
            { label: "Aktif Müşteri", value: kpi?.activeCustomers ?? 0 },
            { label: "Aktif İstek", value: kpi?.activeRequests ?? 0 },
            { label: "Bugünkü Etkinlikler", value: todayTotal },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-500">{k.label}</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Bugünkü Son Etkinlikler</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm space-y-3">
            {todayNotes.length === 0 && todayProps.length === 0 ? (
              <div className="text-gray-500">Henüz etkinlik yok.</div>
            ) : (
              <>
                {todayNotes.length > 0 && (
                  <ul className="space-y-2">
                    {todayNotes.map((n) => (
                      <li key={n.id} className="flex items-center justify-between">
                        <div className="text-gray-700">
                          <a href={`/customers/${n.customer?.id ?? ""}`} className="text-indigo-600 hover:underline">
                            {n.customer ? `${n.customer.first_name} ${n.customer.last_name}` : "Müşteri"}
                          </a>
                          {" "}ile görüşüldü.
                        </div>
                        <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                      </li>
                    ))}
                  </ul>
                )}
                {todayProps.length > 0 && (
                  <ul className="space-y-2">
                    {todayProps.map((p) => (
                      <li key={p.id} className="flex items-center justify-between">
                        <div className="text-gray-700">
                          {(p.portfolio_owner ? `${p.portfolio_owner.first_name} ${p.portfolio_owner.last_name}` : "Portföy Sahibi")} tarafından yeni bir {" "}
                          <a href={`/properties/${p.id}`} className="text-indigo-600 hover:underline">{p.type}</a> eklendi.
                        </div>
                        <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {todayTotal > activityPageSize && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: Math.ceil(todayTotal / activityPageSize) }, (_, i) => i + 1).map((p) => (
                  <a key={p} href={`/?activityPage=${p}`} className={`rounded-md px-3 py-1 text-sm ${p === activityPage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{p}</a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Bildirim Kutusu</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
            {notifications.length === 0 ? (
              <div className="text-gray-500">Takip gerektiren müşteri bulunmuyor.</div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-center justify-between">
                    <div className="text-gray-700">
                      <a href={`/customers/${n.customer?.id ?? ""}`} className="text-indigo-600 hover:underline">
                        {n.customer ? `${n.customer.first_name} ${n.customer.last_name}` : "Müşteri"}
                      </a>
                      {" "}ile görüşülmeli. İstek tarihi {new Date(n.requestCreatedAt).toLocaleDateString("tr-TR")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {notificationsTotal > notifPageSize && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {Array.from({ length: Math.ceil(notificationsTotal / notifPageSize) }, (_, i) => i + 1).map((p) => (
                  <a key={p} href={`/?notifPage=${p}`} className={`rounded-md px-3 py-1 text-sm ${p === notifPage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{p}</a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Hızlı Aksiyonlar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Yeni Müşteri", href: "/customers/new" },
            { label: "Yeni Varlık", href: "/properties/new" },
            { label: "Yeni İstek", href: "/requests" },
          ].map((a) => (
            <a
              key={a.label}
              href={a.href}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:bg-gray-50"
            >
              {a.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
