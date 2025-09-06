import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, FileText, MapPin, Ruler, Bed, Bath, DoorOpen, LayoutGrid, Thermometer, Home, Check, Pencil, Trash2 } from "lucide-react";

interface Request {
  id: string;
  customer_id: string;
  type: string;
  listing_type: string;
  cash_or_loan: string;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  rooms: string | null;
  heating: string | null;
  ensuite_bath: boolean | null;
  pool: boolean | null;
  dressing_room: boolean | null;
  furnished: boolean | null;
  bathroom_count: number | null;
  balcony: boolean | null;
  in_site: boolean | null;
  floor: number | null;
  building_floors: number | null;
  building_age: number | null;
  fulfilled: boolean;
  created_at: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  } | null;
}

async function fetchRequest(id: string): Promise<Request | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  
  try {
  const res = await fetch(`${baseUrl}/api/requests/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
    const data = await res.json();
    const request = data.request;
    
    // Müşteri bilgisini getir
    if (request.customer_id) {
      try {
        const customerRes = await fetch(`${baseUrl}/api/customers/${request.customer_id}`, { cache: "no-store" });
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          request.customer = customerData.customer;
        }
      } catch (error) {
        console.error("Müşteri bilgisi yükleme hatası:", error);
      }
    }
    
    return request;
  } catch (error) {
    console.error("İstek yükleme hatası:", error);
    return null;
  }
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const { id } = await params;
  const request = await fetchRequest(id);
  
  if (!request) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Kayıt bulunamadı</h1>
          <Link
            href="/requests"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>İstek Listesine Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR").format(price) + " ₺";
  };

  const formatLocation = (city: string | null, district: string | null, neighborhood: string | null) => {
    const parts = [city, district, neighborhood].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : "-";
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "Farketmez";
    return value ? "Evet" : "Hayır";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/requests"
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Geri</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link
              href={`/requests/${request.id}/edit`}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-medium">Düzenle</span>
            </Link>
          </div>
        </div>

        {/* Request Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {request.listing_type} {request.type}
                {request.rooms && ` · ${request.rooms}`}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {request.listing_type}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm rounded-full">
                  {request.type}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  request.fulfilled 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {request.fulfilled ? "Karşılandı" : "Aktif"}
                </span>
                {request.cash_or_loan && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {request.cash_or_loan}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-3xl font-bold text-blue-600">
                {request.min_price ? formatPrice(request.min_price) : "-"} - {request.max_price ? formatPrice(request.max_price) : "-"}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {request.customer && (
            <div className="flex items-center space-x-2 mb-6 p-4 bg-slate-50 rounded-xl">
              <FileText className="h-5 w-5 text-slate-500" />
              <div className="flex-1">
                <span className="text-slate-700 font-medium">
                  {request.customer.first_name} {request.customer.last_name}
                </span>
                <div className="text-sm text-slate-500">
                  {request.customer.phone} • {request.customer.email}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center space-x-2 mb-6 p-4 bg-slate-50 rounded-xl">
            <MapPin className="h-5 w-5 text-slate-500" />
            <span className="text-slate-700">
              {request.city || "-"} / {request.district || "-"} / {request.neighborhood || "-"}
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
                    <span className="text-slate-600">m² Aralığı:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {request.min_size || "-"} - {request.max_size || "-"} m²
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Bed className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-slate-600">Oda Sayısı:</span>
                    <span className="ml-2 font-medium text-slate-800">{request.rooms || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Özellikler</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Isıtma:</span>
                  <span className="text-sm font-medium text-slate-800">{request.heating || "-"}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Bath className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Banyo:</span>
                  <span className="text-sm font-medium text-slate-800">{request.bathroom_count || "-"}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Ebeveyn Banyosu:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.ensuite_bath)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Havuz:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.pool)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <LayoutGrid className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Giyinme Odası:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.dressing_room)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DoorOpen className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Eşyalı:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.furnished)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Balkon:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.balcony)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Site İçinde:</span>
                  <span className="text-sm font-medium text-slate-800">{formatBoolean(request.in_site)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Building Info */}
          {(request.floor || request.building_floors || request.building_age) && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Bina Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {request.floor && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Bulunduğu Kat:</span>
                    <span className="text-sm font-medium text-slate-800">{request.floor}</span>
                  </div>
                )}
                
                {request.building_floors && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Bina Kat Sayısı:</span>
                    <span className="text-sm font-medium text-slate-800">{request.building_floors}</span>
                  </div>
                )}
                
                {request.building_age && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">Bina Yaşı:</span>
                    <span className="text-sm font-medium text-slate-800">{request.building_age}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="text-sm">Oluşturulma Tarihi:</span>
              <span className="text-sm font-medium text-slate-800">{formatDate(request.created_at)}</span>
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}