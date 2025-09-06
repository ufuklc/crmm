"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, User } from "lucide-react";

type Row = { id: string; first_name: string; last_name: string };

export default function PortfolioOwnersPage(): React.ReactElement {
  const router = useRouter();
  const [owners, setOwners] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch owners
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio-owners");
      const j = await res.json();
      setOwners(j.portfolioOwners || []);
    } catch (error) {
      console.error("Portföy sahipleri yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Delete owner
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio-owners/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setOwners(owners.filter(owner => owner.id !== id));
        setShowDeleteConfirm(null);
      } else {
        console.error("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Silme işlemi hatası:", error);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Geri</span>
            </Link>
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Portföy Sahipleri</h1>
            </div>
          </div>
          
          <Link
            href="/portfolio-owners/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Yeni Portföy Sahibi</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Yükleniyor...</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Henüz kayıt yok</h3>
            <p className="text-slate-500 mb-6">İlk portföy sahibini ekleyerek başlayın</p>
            <Link
              href="/portfolio-owners/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yeni Portföy Sahibi Ekle</span>
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
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-32">Ad</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-slate-600 w-32">Soyad</th>
                      <th className="px-4 py-4 text-right text-sm font-medium text-slate-600 w-32">Aksiyonlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {owners.map((owner) => (
                      <tr key={owner.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <span className="text-slate-800 font-medium">{owner.first_name}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-slate-800 font-medium">{owner.last_name}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/portfolio-owners/${owner.id}/edit`}
                              className="flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="text-xs">Düzenle</span>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(owner.id)}
                              className="flex items-center space-x-1 px-2 py-1 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-xs">Sil</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {owners.map((owner) => (
                <div key={owner.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            {owner.first_name} {owner.last_name}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/portfolio-owners/${owner.id}/edit`}
                        className="flex items-center space-x-1 px-2 py-1 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="text-xs">Düzenle</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Portföy Sahibini Sil</h3>
              <p className="text-slate-600 mb-6">
                Bu portföy sahibini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


