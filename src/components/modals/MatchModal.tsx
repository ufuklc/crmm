"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { useEffect, useState } from "react";

type PropertyRow = { id: string; type: string; listing_type: string; city: string; district: string; neighborhood: string; price: number; gross_m2: number; net_m2: number | null; rooms: number | null };

export function MatchModal({ requestId, count }: { requestId: string; count?: number }): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<PropertyRow[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/requests/${requestId}/matches`)
      .then((r) => r.json())
      .then((j) => setItems(j.properties as PropertyRow[]))
      .finally(() => setLoading(false));
  }, [open, requestId]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 text-sm">
          {typeof count === "number" ? `Eşleşme: ${count}` : "Eşleşmeleri Gör"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <Dialog.Title className="text-sm font-semibold text-gray-900">Eşleşen Varlıklar</Dialog.Title>
            <Dialog.Close className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50">Kapat</Dialog.Close>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="text-sm text-gray-600">Yükleniyor...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-600">Eşleşme bulunamadı.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="py-2">Tür</th>
                      <th className="py-2">İlan</th>
                      <th className="py-2">Konum</th>
                      <th className="py-2">Brüt/Net</th>
                      <th className="py-2">Oda</th>
                      <th className="py-2">Fiyat</th>
                      <th className="py-2 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-2">{p.type}</td>
                        <td className="py-2">{p.listing_type}</td>
                        <td className="py-2">{p.city} / {p.district}</td>
                        <td className="py-2">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</td>
                        <td className="py-2">{p.rooms ?? "-"}</td>
                        <td className="py-2">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</td>
                        <td className="py-2 text-right">
                          <a href={`/properties/${p.id}`} className="btn btn-primary text-xs">Detay</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


