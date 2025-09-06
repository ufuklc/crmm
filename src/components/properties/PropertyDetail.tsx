"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  MapPin, 
  Ruler, 
  Bed, 
  Bath, 
  DoorOpen, 
  LayoutGrid, 
  Thermometer, 
  Home, 
  Check
} from "lucide-react";

interface Property {
  id: string;
  type: string;
  listing_type: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  gross_m2: number;
  net_m2: number | null;
  room_plan: string | null;
  heating?: string | null;
  floor?: number | null;
  building_floors?: number | null;
  building_age?: number | null;
  ensuite_bath?: boolean | null;
  pool?: boolean | null;
  dressing_room?: boolean | null;
  furnished?: boolean | null;
  bathroom_count?: number | null;
  balcony?: boolean | null;
  in_site?: boolean | null;
  aspect?: string[] | null;
  credit?: boolean | null;
  customer_id?: string | null;
  portfolio_owner_id?: string | null;
}

interface PropertyDetailProps {
  property: Property;
  customerName?: string | null;
  portfolioOwnerName?: string | null;
}

export function PropertyDetail({ property, customerName, portfolioOwnerName }: PropertyDetailProps): React.ReactElement {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
  };

  const formatBoolean = (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return "-";
    return value ? "Evet" : "Hayır";
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        router.push("/properties");
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              href={`/properties/${property.id}/edit`}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-medium">Düzenle</span>
            </Link>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Sil</span>
            </button>
          </div>
        </div>

        {/* Property Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {property.listing_type} {property.type}
                {property.room_plan && ` · ${property.room_plan}`}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {property.listing_type}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm rounded-full">
                  {property.type}
                </span>
                {property.credit === true && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Krediye Uygun
                  </span>
                )}
                {property.in_site === true && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    Site İçinde
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-3xl font-bold text-blue-600">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 mb-6 p-4 bg-slate-50 rounded-xl">
            <MapPin className="h-5 w-5 text-slate-500" />
            <span className="text-slate-700">
              {property.city} / {property.district} / {property.neighborhood}
            </span>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Area & Rooms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Alan & Oda Bilgileri</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Ruler className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Brüt m²:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.gross_m2.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Ruler className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Net m²:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {property.net_m2 ? property.net_m2.toLocaleString('tr-TR') : "-"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Bed className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Oda Sayısı:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.room_plan || "-"}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Bath className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Banyo Sayısı:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.bathroom_count || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Building Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Bina Bilgileri</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <DoorOpen className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Kat No:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.floor || "-"}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <LayoutGrid className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Kat Sayısı:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.building_floors || "-"}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Bina Yaşı:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.building_age || "-"}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Isıtma:</span>
                    <span className="ml-2 font-medium text-slate-800">{property.heating || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Özellikler</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ebeveyn Banyosu:</span>
                  <span className="font-medium text-slate-800">{formatBoolean(property.ensuite_bath)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Havuz:</span>
                  <span className="font-medium text-slate-800">{formatBoolean(property.pool)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Giyinme Odası:</span>
                  <span className="font-medium text-slate-800">{formatBoolean(property.dressing_room)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Eşyalı:</span>
                  <span className="font-medium text-slate-800">{formatBoolean(property.furnished)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Balkon:</span>
                  <span className="font-medium text-slate-800">{formatBoolean(property.balcony)}</span>
                </div>
              </div>
            </div>

            {/* Ownership */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Mülkiyet</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mülk Sahibi:</span>
                  <div>
                    {property.customer_id && customerName ? (
                      <Link 
                        href={`/customers/${property.customer_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {customerName}
                      </Link>
                    ) : (
                      <span className="text-slate-800">-</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Portföy Sahibi:</span>
                  <span className="text-slate-800">{portfolioOwnerName || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cephe */}
          {property.aspect && property.aspect.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Cephe</h3>
              <div className="flex flex-wrap gap-2">
                {property.aspect.map((aspect) => (
                  <div key={aspect} className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">{aspect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Varlığı Sil</h3>
            <p className="text-slate-600 mb-6">
              Bu varlığı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
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
