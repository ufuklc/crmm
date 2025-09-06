"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  UserCircle2, 
  Phone, 
  Trash2,
  Pencil,
  Home,
  MapPin,
  Ruler,
  Eye,
  MessageSquare,
  Plus,
  Edit,
  CheckCircle,
  Clock
} from "lucide-react";
import { NoteForm } from "./NoteForm";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  cash_or_loan: string;
  preferred_listing_type?: string | null;
  profession?: string | null;
}

interface Property {
  id: string;
  type: string;
  listing_type: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  gross_m2: number;
  room_plan: string | null;
}

interface Request {
  id: string;
  type: string;
  listing_type: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  rooms: number | null;
  fulfilled: boolean;
  created_at: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps): React.ReactElement {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "properties" | "requests" | "notes">("details");

  // Mülkleri yükle
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/customers/${customer.id}/properties`);
        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties || []);
        }
      } catch (error) {
        console.error('Mülkler yüklenirken hata:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [customer.id]);

  // İstekleri yükle
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/requests?customer_id=${customer.id}`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data.requests || []);
        }
      } catch (error) {
        console.error('İstekler yüklenirken hata:', error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [customer.id]);

  // Notları yükle
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/meeting-notes?customer_id=${customer.id}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (error) {
        console.error('Notlar yüklenirken hata:', error);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [customer.id]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddNote = async (content: string) => {
    try {
      const response = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id, content })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newNote = {
          id: data.id,
          content,
          created_at: new Date().toISOString()
        };
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Not eklenirken hata:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        router.push("/customers");
      } else {
        console.error("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Silme işlemi hatası:", error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Geri</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-medium">Düzenle</span>
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Sil</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <UserCircle2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Müşteri Detayı</h1>
              <p className="text-slate-600">{customer.first_name} {customer.last_name}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl mb-6">
            {[
              { key: "details", label: "Detaylar", icon: UserCircle2 },
              { key: "properties", label: "Mülkler", icon: Home, count: properties.length },
              { key: "requests", label: "İstekler", icon: Clock, count: requests.length },
              { key: "notes", label: "Notlar", icon: MessageSquare, count: notes.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'details' | 'properties' | 'requests' | 'notes')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    activeTab === tab.key
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className="bg-slate-200 text-slate-600 text-xs px-1 sm:px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Ad</span>
                  <span className="text-sm font-medium text-slate-800">{customer.first_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Soyad</span>
                  <span className="text-sm font-medium text-slate-800">{customer.last_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Telefon</span>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{customer.phone}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tercih</span>
                  <span className="text-sm font-medium text-slate-800">{customer.preferred_listing_type || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Meslek</span>
                  <span className="text-sm font-medium text-slate-800">{customer.profession || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Nakit/Kredi</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.cash_or_loan === "Nakit" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {customer.cash_or_loan}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {loadingProperties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Bu müşteriye ait mülk bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-semibold text-slate-800">
                              {property.type} · {property.room_plan || 'N/A'}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              {property.listing_type}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-slate-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                              {property.city} / {property.district} / {property.neighborhood}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Ruler className="h-4 w-4" />
                              <span>{property.gross_m2} m²</span>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {formatPrice(property.price)}
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          href={`/properties/${property.id}`}
                          className="flex items-center space-x-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Detay</span>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="max-h-96 overflow-y-auto">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">Bu müşteriye ait istek bulunmuyor</p>
                  <Link
                    href={`/requests/new?customer_id=${customer.id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Yeni İstek Ekle</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  <div className="flex justify-end mb-4">
                    <Link
                      href={`/requests/new?customer_id=${customer.id}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Yeni İstek Ekle</span>
                    </Link>
                  </div>
                  {requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-semibold text-slate-800">
                              {request.type} · {request.listing_type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              request.fulfilled 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {request.fulfilled ? "Tamamlandı" : "Aktif"}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-slate-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                              {request.city || "-"} / {request.district || "-"} / {request.neighborhood || "-"}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Bütçe:</span> {request.min_price ? formatPrice(request.min_price) : "-"} - {request.max_price ? formatPrice(request.max_price) : "-"}
                            </div>
                            <div>
                              <span className="font-medium">Metrekare:</span> {request.min_size || "-"} - {request.max_size || "-"} m²
                            </div>
                            <div>
                              <span className="font-medium">Oda:</span> {request.rooms || "-"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/requests/${request.id}`}
                            className="flex items-center space-x-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">Detay</span>
                          </Link>
                          <Link
                            href={`/requests/${request.id}/edit`}
                            className="flex items-center space-x-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-sm">Düzenle</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="max-h-96 overflow-y-auto">
              <div className="mb-6">
                <NoteForm onAddNote={handleAddNote} />
              </div>
              
              {loadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Henüz not eklenmemiş</p>
                </div>
              ) : (
                <div className="space-y-4 pr-2">
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                    >
                      <p className="text-slate-800 mb-2 break-words">{note.content}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(note.created_at).toLocaleString('tr-TR')}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
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
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteConfirm(false);
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