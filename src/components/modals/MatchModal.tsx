"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { useEffect, useState } from "react";

type PropertyRow = { id: string; type: string; listing_type: string; city: string; district: string; neighborhood: string; price: number; gross_m2: number; net_m2: number | null; rooms: number | null };

export function MatchModal({ requestId, count }: { requestId: string; count?: number }): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<PropertyRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setCurrentPage(1);
    fetch(`/api/requests/${requestId}/matches`)
      .then((r) => r.json())
      .then((j) => {
        const properties = j.properties as PropertyRow[];
        setItems(properties);
        setTotalCount(properties.length);
        setTotalPages(Math.ceil(properties.length / itemsPerPage));
      })
      .finally(() => setLoading(false));
  }, [open, requestId]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 text-sm">
          {typeof count === "number" ? `Eşleşme: ${count}` : "Eşleşmeleri Gör"}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-4xl h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 flex-shrink-0">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              Eşleşen Varlıklar ({totalCount})
            </Dialog.Title>
            <Dialog.Close className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              Kapat
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-lg text-gray-600">Yükleniyor...</div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-lg text-gray-600">Eşleşme bulunamadı.</div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Desktop Table */}
                <div className="hidden md:block flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-xs text-gray-500 border-b border-gray-200">
                        <th className="py-3 font-semibold">Tür</th>
                        <th className="py-3 font-semibold">İlan</th>
                        <th className="py-3 font-semibold">Konum</th>
                        <th className="py-3 font-semibold">Brüt/Net</th>
                        <th className="py-3 font-semibold">Oda</th>
                        <th className="py-3 font-semibold">Fiyat</th>
                        <th className="py-3 font-semibold text-right">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((p) => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 font-medium">{p.type}</td>
                          <td className="py-3">{p.listing_type}</td>
                          <td className="py-3">{p.city} / {p.district} / {p.neighborhood}</td>
                          <td className="py-3">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</td>
                          <td className="py-3">{p.rooms ?? "-"}</td>
                          <td className="py-3 font-medium">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</td>
                          <td className="py-3 text-right">
                            <a href={`/properties/${p.id}`} className="btn btn-primary text-xs">Detay</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex-1 overflow-auto space-y-3">
                  {currentItems.map((p) => (
                    <div key={p.id} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-bold text-gray-900">{p.type}</div>
                        <a href={`/properties/${p.id}`} className="btn btn-primary text-xs">Detay</a>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{p.listing_type}</div>
                      <div className="text-sm text-gray-600 mb-2">{p.city} / {p.district} / {p.neighborhood}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Brüt/Net:</span>
                          <span className="text-gray-900 font-medium ml-1">
                            {p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Oda:</span>
                          <span className="text-gray-900 font-medium ml-1">{p.rooms ?? "-"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Fiyat:</span>
                          <span className="text-gray-900 font-bold ml-1">
                            {new Intl.NumberFormat("tr-TR").format(p.price)} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex-shrink-0 mt-4 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${
                              currentPage === page
                                ? "bg-emerald-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


