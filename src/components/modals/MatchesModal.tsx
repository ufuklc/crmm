"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  type: string;
  listing_type: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  gross_m2: number;
  net_m2: number;
  rooms: string;
  room_plan: string | null;
}

interface MatchesModalProps {
  requestId: string;
  count: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchesModal({ requestId, count, isOpen, onClose }: MatchesModalProps): React.ReactElement {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 15;

  // Fetch matches
  const fetchMatches = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/requests/${requestId}/matches?page=${page}&pageSize=${pageSize}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
        setTotalCount(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
        setCurrentPage(page);
      } else {
        setError("Eşleşmeler yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Eşleşme yükleme hatası:", error);
      setError("Eşleşmeler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Load matches when modal opens
  useEffect(() => {
    if (isOpen && requestId) {
      fetchMatches(1);
    }
  }, [isOpen, requestId]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchMatches(page);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
  };

  const formatLocation = (city: string, district: string, neighborhood: string) => {
    return `${city} / ${district} / ${neighborhood}`;
  };

  const formatSize = (gross: number, net: number) => {
    return `${gross} / ${net}`;
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl p-4 sm:p-6 max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Eşleşen Varlıklar ({totalCount})
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-80 sm:max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 text-sm">Kayıt bulunamadı</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tür</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">İlan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Konum</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Brüt/Net</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Oda</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Fiyat</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {properties.map((property) => (
                      <motion.tr
                        key={property.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <span className="text-slate-700 text-sm">{property.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700 text-sm">{property.listing_type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700 text-sm">
                            {formatLocation(property.city, property.district, property.neighborhood)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700 text-sm">
                            {formatSize(property.gross_m2, property.net_m2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700 text-sm">{property.room_plan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-700 font-medium text-sm">
                            {formatPrice(property.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/properties/${property.id}`}
                            className="inline-flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">Detay</span>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{property.type}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-sm text-slate-600">{property.listing_type}</span>
                        </div>
                        <div className="text-xs text-slate-600 mb-2">
                          {formatLocation(property.city, property.district, property.neighborhood)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="font-medium">Brüt/Net:</span> {formatSize(property.gross_m2, property.net_m2)}
                          </div>
                          <div>
                            <span className="font-medium">Oda:</span> {property.room_plan}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-800 mt-2">
                          {formatPrice(property.price)}
                        </div>
                      </div>
                      <Link
                        href={`/properties/${property.id}`}
                        className="flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">Detay</span>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {properties.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Önceki</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-slate-600">
                {currentPage} / {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-xs sm:text-sm">Sonraki</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
