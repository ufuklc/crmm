"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Eye, 
  Phone,
  Trash2
} from "lucide-react";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  cash_or_loan: string;
  preferred_listing_type?: string | null;
  profession?: string | null;
}

interface CustomerListProps {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}

export function CustomerList({ customers, total, page, pageSize, searchParams }: CustomerListProps): React.ReactElement {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        console.error("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Silme işlemi hatası:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Müşteriler</h1>
          </div>
          <Link
            href="/customers/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span>Yeni Müşteri</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <form className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                name="q"
                placeholder="Ara (ad/soyad/telefon)"
                defaultValue={searchParams?.q ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="min-w-48">
              <select
                name="cash_or_loan"
                defaultValue={searchParams?.cash_or_loan ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Tümü</option>
                <option value="Nakit">Nakit</option>
                <option value="Kredi">Kredi</option>
                <option value="İkisi de">İkisi de</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Filtrele
            </button>
          </form>
        </div>

        {/* Content */}
        {customers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Henüz müşteri yok</h3>
            <p className="text-slate-500 mb-6">İlk müşterinizi ekleyerek başlayın</p>
            <Link
              href="/customers/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>Yeni Müşteri Ekle</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Ad Soyad</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Telefon</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Nakit/Kredi</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Tercih</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Meslek</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-slate-600">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {customers.map((customer) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {customer.first_name} {customer.last_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.cash_or_loan === 'Nakit' 
                              ? 'bg-green-100 text-green-800'
                              : customer.cash_or_loan === 'Kredi'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customer.cash_or_loan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{customer.preferred_listing_type || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700">{customer.profession || "-"}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="flex items-center space-x-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">Detay</span>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(customer.id)}
                              className="flex items-center space-x-1 px-3 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-sm">Sil</span>
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
              {customers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {customer.first_name} {customer.last_name}
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{customer.phone}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="flex items-center space-x-1 px-3 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">Detay</span>
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(customer.id)}
                        className="flex items-center space-x-1 px-3 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Sil</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Nakit/Kredi:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.cash_or_loan === 'Nakit' 
                          ? 'bg-green-100 text-green-800'
                          : customer.cash_or_loan === 'Kredi'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.cash_or_loan}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tercih:</span>
                      <span className="ml-2 text-slate-700">{customer.preferred_listing_type || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Meslek:</span>
                      <span className="ml-2 text-slate-700">{customer.profession || "-"}</span>
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Müşteriyi Sil</h3>
            <p className="text-slate-600 mb-6">
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
    </div>
  );
}
