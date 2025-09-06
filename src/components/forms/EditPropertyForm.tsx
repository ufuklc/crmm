"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Check
} from "lucide-react";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";

const ROOM_PLANS: string[] = [
  "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
  "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
  "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
  "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
];

const HEATING_OPTIONS = ["Doğalgaz", "Merkezi", "Soba", "Klima"];

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Neighborhood {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface PortfolioOwner {
  id: string;
  first_name: string;
  last_name: string;
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
  net_m2: number | null;
  room_plan: string | null;
  heating: string | null;
  floor: number | null;
  building_floors: number | null;
  building_age: number | null;
  ensuite_bath: boolean | null;
  pool: boolean | null;
  dressing_room: boolean | null;
  furnished: boolean | null;
  bathroom_count: number | null;
  balcony: boolean | null;
  in_site: boolean | null;
  aspect: string[] | null;
  credit: boolean | null;
  customer_id: string | null;
  portfolio_owner_id: string | null;
}

interface EditPropertyFormProps {
  property: Property;
}

export function EditPropertyForm({ property }: EditPropertyFormProps): React.ReactElement {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(property.customer_id || "");
  const [selectedPortfolioOwnerId, setSelectedPortfolioOwnerId] = useState<string>(property.portfolio_owner_id || "");
  const [selectedAspects, setSelectedAspects] = useState<string[]>(property.aspect || []);
  
  // Form values for radio buttons
  const [creditValue, setCreditValue] = useState<string>(property.credit === true ? "Evet" : property.credit === false ? "Hayır" : "");
  const [inSiteValue, setInSiteValue] = useState<string>(property.in_site === true ? "Evet" : property.in_site === false ? "Hayır" : "");
  const [ensuiteBathValue, setEnsuiteBathValue] = useState<string>(property.ensuite_bath === true ? "Evet" : property.ensuite_bath === false ? "Hayır" : "");
  const [poolValue, setPoolValue] = useState<string>(property.pool === true ? "Evet" : property.pool === false ? "Hayır" : "");
  const [dressingRoomValue, setDressingRoomValue] = useState<string>(property.dressing_room === true ? "Evet" : property.dressing_room === false ? "Hayır" : "");
  const [furnishedValue, setFurnishedValue] = useState<string>(property.furnished === true ? "Evet" : property.furnished === false ? "Hayır" : "");
  const [balconyValue, setBalconyValue] = useState<string>(property.balcony === true ? "Evet" : property.balcony === false ? "Hayır" : "");
  
  // Price formatting
  const [priceValue, setPriceValue] = useState<string>(property.price.toString());
  
  // API data
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [portfolioOwners, setPortfolioOwners] = useState<PortfolioOwner[]>([]);

  // Fetch cities
  useEffect(() => {
    fetch('/api/locations/cities')
      .then(res => res.json())
      .then(data => setCities(Array.isArray(data.items) ? data.items : []))
      .catch(console.error);
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (selectedCity) {
      fetch(`/api/locations/districts?cityId=${selectedCity.id}`)
        .then(res => res.json())
        .then(data => setDistricts(Array.isArray(data.items) ? data.items : []))
        .catch(console.error);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict(null);
    setSelectedNeighborhood(null);
  }, [selectedCity]);

  // Fetch neighborhoods when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/locations/neighborhoods?districtId=${selectedDistrict.id}`)
        .then(res => res.json())
        .then(data => setNeighborhoods(Array.isArray(data.items) ? data.items : []))
        .catch(console.error);
    } else {
      setNeighborhoods([]);
    }
    setSelectedNeighborhood(null);
  }, [selectedDistrict]);

  // Fetch customers
  useEffect(() => {
    fetch('/api/lookup/customers')
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data.items) ? data.items : []))
      .catch(console.error);
  }, []);

  // Fetch portfolio owners
  useEffect(() => {
    fetch('/api/lookup/portfolio-owners')
      .then(res => res.json())
      .then(data => setPortfolioOwners(Array.isArray(data.items) ? data.items : []))
      .catch(console.error);
  }, []);

  // Initialize city, district, neighborhood from property data
  useEffect(() => {
    if (property.city && cities.length > 0) {
      const city = cities.find(c => c.name === property.city);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [property.city, cities]);

  useEffect(() => {
    if (property.district && selectedCity && districts.length > 0) {
      const district = districts.find(d => d.name === property.district);
      if (district) {
        setSelectedDistrict(district);
      }
    }
  }, [property.district, selectedCity, districts]);

  useEffect(() => {
    if (property.neighborhood && selectedDistrict && neighborhoods.length > 0) {
      const neighborhood = neighborhoods.find(n => n.name === property.neighborhood);
      if (neighborhood) {
        setSelectedNeighborhood(neighborhood);
      }
    }
  }, [property.neighborhood, selectedDistrict, neighborhoods]);

  // Create display values for SearchableSelect components
  const cityDisplayValue = selectedCity || (property.city ? { id: "", name: property.city } : null);
  const districtDisplayValue = selectedDistrict || (property.district ? { id: "", name: property.district } : null);
  const neighborhoodDisplayValue = selectedNeighborhood || (property.neighborhood ? { id: "", name: property.neighborhood } : null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    
    const toNum = (v: FormDataEntryValue | undefined): number | null => {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const body = {
      type: payload.type,
      listing_type: payload.listing_type,
      city: selectedCity?.name || property.city,
      district: selectedDistrict?.name || property.district,
      neighborhood: selectedNeighborhood?.name || property.neighborhood,
      price: toNum(payload.price) ?? property.price,
      gross_m2: toNum(payload.gross_m2) ?? property.gross_m2,
      net_m2: toNum(payload.net_m2),
      rooms: undefined,
      room_plan: payload.room_plan || null,
      heating: payload.heating || null,
      floor: toNum(payload.floor),
      building_floors: toNum(payload.building_floors),
      customer_id: selectedCustomerId || null,
      portfolio_owner_id: selectedPortfolioOwnerId || null,
      credit: payload.credit === "Evet" ? true : payload.credit === "Hayır" ? false : null,
      ensuite_bath: payload.ensuite_bath === "Evet" ? true : payload.ensuite_bath === "Hayır" ? false : null,
      pool: payload.pool === "Evet" ? true : payload.pool === "Hayır" ? false : null,
      dressing_room: payload.dressing_room === "Evet" ? true : payload.dressing_room === "Hayır" ? false : null,
      furnished: payload.furnished === "Evet" ? true : payload.furnished === "Hayır" ? false : null,
      bathroom_count: toNum(payload.bathroom_count),
      balcony: payload.balcony === "Evet" ? true : payload.balcony === "Hayır" ? false : null,
      aspect: selectedAspects.length > 0 ? selectedAspects : null,
      in_site: payload.in_site === "Evet" ? true : payload.in_site === "Hayır" ? false : null,
    } as Record<string, unknown>;

    const res = await fetch(`/api/properties/${property.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Güncelleme başarısız");
      return;
    }
    router.push("/properties");
  }

  const toggleAspect = (aspect: string) => {
    setSelectedAspects(prev => 
      prev.includes(aspect) 
        ? prev.filter(a => a !== aspect)
        : [...prev, aspect]
    );
  };

  // Format number with thousands separator
  const formatNumber = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('tr-TR');
  };

  // Parse formatted number back to numeric string
  const parseNumber = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  // Format price with TL symbol
  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('tr-TR') + ' ₺';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Varlık Düzenle</h1>
          <p className="text-slate-600">Varlık bilgilerini güncelleyin</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6"
        >
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Temel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tür</label>
                  <select name="type" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200" defaultValue={property.type}>
                    <option value="">Seçiniz</option>
                    <option value="Daire">Daire</option>
                    <option value="Arsa">Arsa</option>
                    <option value="İş Yeri">İş Yeri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İlan Tipi</label>
                  <select name="listing_type" required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200" defaultValue={property.listing_type}>
                    <option value="">Seçiniz</option>
                    <option value="Satılık">Satılık</option>
                    <option value="Kiralık">Kiralık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat</label>
                  <input
                    name="price"
                    type="text"
                    required
                    value={formatPrice(priceValue)}
                    onChange={(e) => setPriceValue(parseNumber(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="0 ₺"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Oda Sayısı</label>
                  <select name="room_plan" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200" defaultValue={property.room_plan || ""}>
                    <option value="">Seçiniz</option>
                    {ROOM_PLANS.map(plan => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Konum */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Konum</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                  <SearchableSelect
                    label=""
                    fetchUrl="/api/locations/cities"
                    autoFetch
                    onChange={(city) => {
                      setSelectedCity(city);
                      setSelectedDistrict(null);
                      setSelectedNeighborhood(null);
                    }}
                    value={cityDisplayValue}
                    placeholder="Şehir seçiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İlçe</label>
                  <SearchableSelect
                    label=""
                    fetchUrl="/api/locations/districts"
                    query={{ cityId: selectedCity?.id }}
                    disabled={!selectedCity}
                    autoFetch={Boolean(selectedCity)}
                    onChange={(district) => {
                      setSelectedDistrict(district);
                      setSelectedNeighborhood(null);
                    }}
                    value={districtDisplayValue}
                    placeholder="İlçe seçiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mahalle</label>
                  <SearchableSelect
                    label=""
                    fetchUrl="/api/locations/neighborhoods"
                    query={{ districtId: selectedDistrict?.id }}
                    disabled={!selectedDistrict}
                    autoFetch={Boolean(selectedDistrict)}
                    onChange={(neighborhood) => setSelectedNeighborhood(neighborhood)}
                    value={neighborhoodDisplayValue}
                    placeholder="Mahalle seçiniz"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Metrekare & Kat */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Metrekare & Kat</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Brüt m²</label>
                  <div className="flex">
                    <input
                      name="gross_m2"
                      type="number"
                      required
                      defaultValue={property.gross_m2}
                      className="flex-1 rounded-l-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      placeholder="0"
                    />
                    <span className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-500 rounded-r-xl">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Net m²</label>
                  <div className="flex">
                    <input
                      name="net_m2"
                      type="number"
                      defaultValue={property.net_m2 || ""}
                      className="flex-1 rounded-l-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      placeholder="0"
                    />
                    <span className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-500 rounded-r-xl">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kat No</label>
                  <input
                    name="floor"
                    type="number"
                    defaultValue={property.floor || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kat Sayısı (Daire için)</label>
                  <input
                    name="building_floors"
                    type="number"
                    defaultValue={property.building_floors || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Isıtma & Yapı */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Isıtma & Yapı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Isıtma</label>
                  <select name="heating" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200" defaultValue={property.heating || ""}>
                    <option value="">Seçiniz</option>
                    {HEATING_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bina Yaşı</label>
                  <input
                    name="building_age"
                    type="number"
                    defaultValue={property.building_age || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Krediye Uygun</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      creditValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="credit" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setCreditValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      creditValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="credit" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setCreditValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Site İçinde</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      inSiteValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="in_site" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setInSiteValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      inSiteValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="in_site" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setInSiteValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Mülkiyet */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Mülkiyet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mülk Sahibi</label>
                  <SearchableSelect
                    label=""
                    fetchUrl="/api/lookup/customers"
                    onChange={(customer) => setSelectedCustomerId(customer?.id || "")}
                    value={property.customer_id ? { id: property.customer_id, name: "" } : null}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Portföy Sahibi</label>
                  <SearchableSelect
                    label=""
                    fetchUrl="/api/lookup/portfolio-owners"
                    onChange={(owner) => setSelectedPortfolioOwnerId(owner?.id || "")}
                    value={property.portfolio_owner_id ? { id: property.portfolio_owner_id, name: "" } : null}
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Özellikler */}
            <section>
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Özellikler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ebeveyn Banyosu</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      ensuiteBathValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="ensuite_bath" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setEnsuiteBathValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      ensuiteBathValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="ensuite_bath" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setEnsuiteBathValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Havuz</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      poolValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="pool" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setPoolValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      poolValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="pool" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setPoolValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Giyinme Odası</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      dressingRoomValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="dressing_room" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setDressingRoomValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      dressingRoomValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="dressing_room" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setDressingRoomValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Eşyalı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      furnishedValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="furnished" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setFurnishedValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      furnishedValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="furnished" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setFurnishedValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banyo Sayısı</label>
                  <input
                    name="bathroom_count"
                    type="number"
                    defaultValue={property.bathroom_count || ""}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Balkon</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      balconyValue === 'Evet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="balcony" 
                        value="Evet" 
                        className="sr-only" 
                        onChange={(e) => setBalconyValue(e.target.value)}
                      />
                      Evet
                    </label>
                    <label className={`rounded-xl border px-3 py-2 text-center cursor-pointer ${
                      balconyValue === 'Hayır' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="balcony" 
                        value="Hayır" 
                        className="sr-only" 
                        onChange={(e) => setBalconyValue(e.target.value)}
                      />
                      Hayır
                    </label>
                  </div>
                </div>
              </div>

              {/* Cephe */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Cephe</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Kuzey", "Güney", "Doğu", "Batı"].map((aspect) => (
                    <label key={aspect} className="rounded-xl border border-slate-200 px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedAspects.includes(aspect)}
                          onChange={() => toggleAspect(aspect)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          selectedAspects.includes(aspect)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-300'
                        }`}>
                          {selectedAspects.includes(aspect) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-slate-700 text-sm">{aspect}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Link
                href="/properties"
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Güncelleniyor..." : "Güncelle"}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
