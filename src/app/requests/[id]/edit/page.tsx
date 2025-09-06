"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Save, ChevronDown } from "lucide-react";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";
import { MultiCheckDropdown } from "@/components/forms/controls/MultiCheckDropdown";

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
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface Location {
  id: string;
  name: string;
}

const ROOM_PLANS = [
  "Stüdyo(1+0)", "1+1", "1.5+1", "2+0", "2+1", "2.5+1", "2+2", "3+0", "3+1", "3.5+1", "3+2", "3+3",
  "4+0", "4+1", "4.5+1", "4.5+2", "4+2", "4+3", "4+4", "5+1", "5.5 + 1", "5+2", "5+3", "5+4",
  "6+1", "6+2", "6.5 + 1", "6+3", "6+4", "7+1", "7+2", "7+3", "8+1", "8+2", "8+3", "8+4",
  "9+1", "9+3", "9+4", "9+5", "9+6", "10+1", "10+2", "10 Üzeri"
];

const HEATING_OPTIONS = [
  "Farketmez", "Doğalgaz", "Klima", "Soba", "Merkezi", "Kombi", "Elektrik"
];

export default function EditRequestPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerId, setCustomerId] = useState<{ id: string; name: string } | null>(null);
  const [type, setType] = useState("Daire");
  const [listingType, setListingType] = useState("Satılık");
  const [cashOrLoan, setCashOrLoan] = useState("Nakit");
  
  // Location state
  const [city, setCity] = useState<Location | null>(null);
  const [district, setDistrict] = useState<Location | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Location[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  
  // Budget and size
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  
  // Features
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedHeating, setSelectedHeating] = useState<string[]>([]);
  const [ensuiteBath, setEnsuiteBath] = useState("");
  const [pool, setPool] = useState("");
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/requests/${id}`);
        if (response.ok) {
          const data = await response.json();
          const req = data.request as Request;
          setRequest(req);
          
          // Set form values
          setType(req.type || "Daire");
          setListingType(req.listing_type || "Satılık");
          setCashOrLoan(req.cash_or_loan || "Nakit");
          setMinPrice(req.min_price?.toString() || "");
          setMaxPrice(req.max_price?.toString() || "");
          setMinSize(req.min_size?.toString() || "");
          setMaxSize(req.max_size?.toString() || "");
          setEnsuiteBath(req.ensuite_bath === null ? "" : (req.ensuite_bath ? "Evet" : "Hayır"));
          setPool(req.pool === null ? "" : (req.pool ? "Evet" : "Hayır"));
          
          // Set multi-select values
          if (req.rooms) {
            setSelectedRooms(req.rooms.split(", ").filter(Boolean));
          }
          if (req.heating) {
            setSelectedHeating(req.heating.split(", ").filter(Boolean));
          }
          if (req.neighborhood) {
            setSelectedNeighborhoods(req.neighborhood.split(", ").filter(Boolean));
          }
          
          // Load city and district
          if (req.city) {
            try {
              const cityResponse = await fetch("/api/locations/cities");
              if (cityResponse.ok) {
                const cityData = await cityResponse.json();
                const foundCity = cityData.items?.find((c: Location) => c.name === req.city);
                if (foundCity) {
                  setCity(foundCity);
                  
                  // Load district
                  if (req.district) {
                    const districtResponse = await fetch(`/api/locations/districts?cityId=${foundCity.id}`);
                    if (districtResponse.ok) {
                      const districtData = await districtResponse.json();
                      const foundDistrict = districtData.items?.find((d: Location) => d.name === req.district);
                      if (foundDistrict) {
                        setDistrict(foundDistrict);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Konum yükleme hatası:", error);
            }
          }
        }
      } catch (error) {
        console.error("İstek yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [params]);

  // Load neighborhoods when district changes
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!district?.id) {
        setNeighborhoods([]);
        return;
      }

      try {
        const response = await fetch(`/api/locations/neighborhoods?districtId=${district.id}`);
        if (response.ok) {
          const data = await response.json();
          setNeighborhoods(data.items || []);
        }
      } catch (error) {
        console.error("Mahalle yükleme hatası:", error);
        setNeighborhoods([]);
      }
    };

    fetchNeighborhoods();
  }, [district]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!request) return;

    // Validation
    if (!city || !district) {
      setError("Lütfen il ve ilçe seçin");
      setSubmitting(false);
      return;
    }

    // Min/Max validation
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setError("Minimum fiyat maksimum fiyattan büyük olamaz");
      setSubmitting(false);
      return;
    }

    if (minSize && maxSize && Number(minSize) > Number(maxSize)) {
      setError("Minimum metrekare maksimum metrekareden büyük olamaz");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        type,
        listing_type: listingType,
        cash_or_loan: cashOrLoan,
        city: city.name,
        district: district.name,
        neighborhood: selectedNeighborhoods.join(", ") || null,
        min_price: minPrice ? Number(minPrice) : null,
        max_price: maxPrice ? Number(maxPrice) : null,
        min_size: minSize ? Number(minSize) : null,
        max_size: maxSize ? Number(maxSize) : null,
        rooms: selectedRooms.join(", ") || null,
        heating: selectedHeating.join(", ") || null,
        ensuite_bath: ensuiteBath ? (ensuiteBath === "Evet") : null,
        pool: pool ? (pool === "Evet") : null,
      };

      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/requests/${request.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "İstek güncellenemedi");
      }
    } catch (error) {
      console.error("İstek güncelleme hatası:", error);
      setError("İstek güncellenirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Kayıt bulunamadı</h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Geri Dön</span>
          </button>
        </div>
      </div>
    );
  }

  const isValid = city && district;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="flex items-center space-x-3">
            <Pencil className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">İsteği Düzenle</h1>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Müşteri & Temel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Müşteri *
                </label>
                <SearchableSelect
                  label="Müşteri"
                  fetchUrl="/api/lookup/customers"
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Müşteri seçin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Tür *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="Daire">Daire</option>
                  <option value="İş Yeri">İş Yeri</option>
                  <option value="Arsa">Arsa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  İlan Tipi *
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="Satılık">Satılık</option>
                  <option value="Kiralık">Kiralık</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Ödeme Tercihi *
                </label>
                <select
                  value={cashOrLoan}
                  onChange={(e) => setCashOrLoan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="Nakit">Nakit</option>
                  <option value="Kredi">Kredi</option>
                  <option value="İkisi de">İkisi de</option>
                </select>
              </div>
            </div>

            {/* Konum */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Konum</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    İl *
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="İl seçin"
                    fetchUrl="/api/locations/cities"
                    onChange={(city) => {
                      setCity(city);
                      setDistrict(null);
                      setSelectedNeighborhoods([]);
                    }}
                    value={city}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    İlçe *
                  </label>
                  <SearchableSelect
                    label=""
                    placeholder="İlçe seçin"
                    fetchUrl="/api/locations/districts"
                    query={{ cityId: city?.id }}
                    onChange={(district) => {
                      setDistrict(district);
                      setSelectedNeighborhoods([]);
                    }}
                    value={district}
                    disabled={!city}
                    autoFetch={true}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Mahalleler
                  </label>
                  <MultiCheckDropdown
                    label=""
                    placeholder="Mahalle seçin"
                    options={neighborhoods.map(n => n.name)}
                    selected={selectedNeighborhoods}
                    onChange={setSelectedNeighborhoods}
                  />
                </div>
              </div>
            </div>

            {/* Bütçe & m² */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Bütçe & m²</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Min Fiyat
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">
                        TL
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Max Fiyat
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">
                        TL
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Min m²
                    </label>
                    <input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Max m²
                    </label>
                    <input
                      type="number"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Özellikler */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Oda Sayısı
                  </label>
                  <MultiCheckDropdown
                    label=""
                    placeholder="Oda sayısı seçin"
                    options={ROOM_PLANS}
                    selected={selectedRooms}
                    onChange={setSelectedRooms}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Isıtma
                  </label>
                  <MultiCheckDropdown
                    label=""
                    placeholder="Isıtma türü seçin"
                    options={HEATING_OPTIONS}
                    selected={selectedHeating}
                    onChange={setSelectedHeating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Ebeveyn Banyosu
                  </label>
                  <select
                    value={ensuiteBath}
                    onChange={(e) => setEnsuiteBath(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Farketmez</option>
                    <option value="Evet">Evet</option>
                    <option value="Hayır">Hayır</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Havuz
                  </label>
                  <select
                    value={pool}
                    onChange={(e) => setPool(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Farketmez</option>
                    <option value="Evet">Evet</option>
                    <option value="Hayır">Hayır</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{submitting ? "Güncelleniyor..." : "Güncelle"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}