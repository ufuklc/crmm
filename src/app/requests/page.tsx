"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ListChecks, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Search,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { MatchesModal } from "@/components/modals/MatchesModal";

interface Request {
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
  rooms: string | null;
  fulfilled: boolean;
  customers?: { 
    id: string; 
    first_name: string; 
    last_name: string; 
  } | null;
}

interface MatchCounts {
  [key: string]: number;
}

export default function RequestsPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [matchCounts, setMatchCounts] = useState<MatchCounts>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showMatchesModal, setShowMatchesModal] = useState<string | null>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      
      const response = await fetch(`/api/requests?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        
        // Fetch match counts
        if (data.requests?.length > 0) {
          const ids = data.requests.map((r: Request) => r.id);
          const countsResponse = await fetch("/api/requests/match-counts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
          });
          if (countsResponse.ok) {
            const countsData = await countsResponse.json();
            setMatchCounts(countsData.counts || {});
          }
        }
      }
    } catch (error) {
      console.error("İstekler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    router.replace(`/requests?${params.toString()}`);
  }, [debouncedSearch, router, searchParams]);

  const handleStatusToggle = async (requestId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfilled: !currentStatus })
      });

      if (response.ok) {
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, fulfilled: !currentStatus }
              : req
          )
        );
      } else {
        console.error("Durum güncellenemedi");
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        setShowDeleteConfirm(null);
      } else {
        console.error("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Silme işlemi hatası:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
  };

  const formatLocation = (city: string | null, district: string | null, neighborhood: string | null) => {
    const parts = [city, district, neighborhood].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : "-";
  };

  const formatBudget = (minPrice: number | null, maxPrice: number | null) => {
    const min = minPrice ? formatPrice(minPrice) : "-";
    const max = maxPrice ? formatPrice(maxPrice) : "-";
    return `${min} - ${max}`;
  };

  const formatSize = (minSize: number | null, maxSize: number | null) => {
    const min = minSize ? minSize.toString() : "-";
    const max = maxSize ? maxSize.toString() : "-";
    return `${min} - ${max} m²`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ListChecks className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">İstekler</h1>
          </div>
          <Link
            href="/requests/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni İstek</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Müşteri adına göre ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
              role="searchbox"
              aria-label="Müşteri adına göre ara"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Yükleniyor...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <ListChecks className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Kayıt bulunamadı</h3>
            <p className="text-slate-500 mb-6">Arama kriterlerinize uygun istek bulunamadı</p>
            <Link
              href="/requests/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni İstek Ekle</span>
            </Link>
      </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-32">Müşteri</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-24">Eşleşme</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-20">Tür</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-20">İlan</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-48">Konum</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-40">Bütçe</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-32">Metrekare</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-24">Durum</th>
                      <th className="px-4 py-4 text-right text-sm font-medium text-slate-600 w-40">Aksiyonlar</th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-slate-200">
                    {requests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          {request.customers ? (
                            <Link
                              href={`/customers/${request.customers.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {request.customers.first_name} {request.customers.last_name}
                            </Link>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setShowMatchesModal(request.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <span className="text-xs">Eşleşme</span>
                            <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                              {matchCounts[request.id] || 0}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-700">{request.type}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-700">{request.listing_type}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-700 text-sm">
                            {formatLocation(request.city, request.district, request.neighborhood)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-700 text-sm">
                            {formatBudget(request.min_price, request.max_price)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-700 text-sm">
                            {formatSize(request.min_size, request.max_size)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleStatusToggle(request.id, request.fulfilled)}
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              request.fulfilled
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                            title="Durumu değiştir"
                            aria-pressed={request.fulfilled}
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>{request.fulfilled ? "Karşılandı" : "Aktif"}</span>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Link
                              href={`/requests/${request.id}`}
                              className="flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-xs">Detay</span>
                            </Link>
                            <Link
                              href={`/requests/${request.id}/edit`}
                              className="flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="text-xs">Düzenle</span>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(request.id)}
                              className="flex items-center space-x-1 px-2 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-xs">Sil</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-semibold text-slate-800">
                          {request.type} · {request.listing_type}
                        </span>
                        <button
                          onClick={() => handleStatusToggle(request.id, request.fulfilled)}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            request.fulfilled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                          title="Durumu değiştir"
                          aria-pressed={request.fulfilled}
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>{request.fulfilled ? "Karşılandı" : "Aktif"}</span>
                        </button>
                      </div>
                      
                      {request.customers && (
                        <div className="text-sm text-slate-600 mb-2">
                          <Link
                            href={`/customers/${request.customers.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {request.customers.first_name} {request.customers.last_name}
                          </Link>
                        </div>
                      )}
                      
                      <div className="text-sm text-slate-600 mb-3">
                        <div className="mb-1">
                          <span className="font-medium">Konum:</span> {formatLocation(request.city, request.district, request.neighborhood)}
                        </div>
                        <div className="mb-1">
                          <span className="font-medium">Bütçe:</span> {formatBudget(request.min_price, request.max_price)}
                        </div>
                        <div>
                          <span className="font-medium">Metrekare:</span> {formatSize(request.min_size, request.max_size)}
          </div>
                  </div>
                </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/requests/${request.id}`}
                        className="flex items-center space-x-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Detay</span>
                      </Link>
                      <button
                        onClick={() => setShowMatchesModal(request.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="text-sm">Eşleşme</span>
                        <span className="bg-blue-200 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                          {matchCounts[request.id] || 0}
                        </span>
                      </button>
                      <div className="flex space-x-2">
                        <Link
                          href={`/requests/${request.id}/edit`}
                          className="flex items-center space-x-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-sm">Düzenle</span>
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(request.id)}
                          className="flex items-center space-x-1 px-3 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Sil</span>
                        </button>
                  </div>
                </div>
              </div>
                </motion.div>
            ))}
          </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">İsteği Sil</h3>
            <p className="text-slate-600 mb-6">
              Bu isteği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  handleDelete(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches Modal */}
      <MatchesModal
        requestId={showMatchesModal || ""}
        count={showMatchesModal ? (matchCounts[showMatchesModal] || 0) : 0}
        isOpen={!!showMatchesModal}
        onClose={() => setShowMatchesModal(null)}
      />
    </div>
  );
}