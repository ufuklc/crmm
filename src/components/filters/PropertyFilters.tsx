"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronDown, 
  Check, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyFiltersProps {
  initialSearchParams?: Record<string, string | undefined>;
  onFilterApplied?: () => void;
}

const typeOptions = [
  { value: "Daire", label: "Daire" },
  { value: "Arsa", label: "Arsa" },
  { value: "İş Yeri", label: "İş Yeri" }
];

const listingTypeOptions = [
  { value: "Satılık", label: "Satılık" },
  { value: "Kiralık", label: "Kiralık" }
];

const roomPlanOptions = [
  "Stüdyo(1+0)", "1+1", "1.5+1", "2+0", "2+1", "2.5+1", "2+2", "3+0", "3+1", "3.5+1", "3+2", "3+3",
  "4+0", "4+1", "4.5+1", "4.5+2", "4+2", "4+3", "4+4", "5+1", "5.5 + 1", "5+2", "5+3", "5+4",
  "6+1", "6+2", "6.5 + 1", "6+3", "6+4", "7+1", "7+2", "7+3", "8+1", "8+2", "8+3", "8+4",
  "9+1", "9+3", "9+4", "9+5", "9+6", "10+1", "10+2", "10 Üzeri"
];

const heatingOptions = [
  "Klima", "Doğalgaz", "Merkezi"
];

const insideSiteOptions = [
  { value: "all", label: "Tümü" },
  { value: "yes", label: "Evet" },
  { value: "no", label: "Hayır" }
];

export function PropertyFilters({ initialSearchParams, onFilterApplied }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedListingType, setSelectedListingType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedRoomPlans, setSelectedRoomPlans] = useState<string[]>([]);
  const [selectedHeating, setSelectedHeating] = useState<string[]>([]);
  const [selectedPortfolioOwners, setSelectedPortfolioOwners] = useState<string[]>([]);
  const [selectedInsideSite, setSelectedInsideSite] = useState<string>("all");
  
  // Price and area ranges
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // Format number with thousands separator
  const formatNumber = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('tr-TR');
  };

  // Format price with TL symbol
  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue).toLocaleString('tr-TR') + ' ₺';
  };

  // Parse formatted number back to numeric string
  const parseNumber = (value: string): string => {
    return value.replace(/\D/g, '');
  };
  const [minGrossM2, setMinGrossM2] = useState<string>("");
  const [maxGrossM2, setMaxGrossM2] = useState<string>("");
  const [minFloor, setMinFloor] = useState<string>("");
  const [maxFloor, setMaxFloor] = useState<string>("");
  
  // Options
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ id: string; name: string }[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<{ id: string; name: string }[]>([]);
  const [portfolioOwnerOptions, setPortfolioOwnerOptions] = useState<string[]>([]);
  
  // Dropdown states
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load cities
        const citiesRes = await fetch('/api/locations/cities');
        if (citiesRes.ok) {
          const response = await citiesRes.json();
          setCityOptions(Array.isArray(response.items) ? response.items : []);
        }

        // Load portfolio owners
        const ownersRes = await fetch('/api/lookup/portfolio-owners');
        if (ownersRes.ok) {
          const response = await ownersRes.json();
          setPortfolioOwnerOptions(Array.isArray(response.items) ? response.items : []);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadDistricts = async () => {
        try {
          const res = await fetch(`/api/locations/districts?cityId=${selectedCity.id}`);
          if (res.ok) {
            const response = await res.json();
            setDistrictOptions(Array.isArray(response.items) ? response.items : []);
            setSelectedDistrict(null);
            setSelectedNeighborhoods([]);
            setNeighborhoodOptions([]);
          }
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      };
      loadDistricts();
    } else {
      setDistrictOptions([]);
      setSelectedDistrict(null);
      setSelectedNeighborhoods([]);
      setNeighborhoodOptions([]);
    }
  }, [selectedCity]);

  // Load neighborhoods when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadNeighborhoods = async () => {
        try {
          const res = await fetch(`/api/locations/neighborhoods?districtId=${selectedDistrict.id}`);
          if (res.ok) {
            const response = await res.json();
            setNeighborhoodOptions(Array.isArray(response.items) ? response.items : []);
            setSelectedNeighborhoods([]);
          }
        } catch (error) {
          console.error('Error loading neighborhoods:', error);
        }
      };
      loadNeighborhoods();
    } else {
      setNeighborhoodOptions([]);
      setSelectedNeighborhoods([]);
    }
  }, [selectedDistrict]);

  // Initialize from URL params
  useEffect(() => {
    if (initialSearchParams) {
      setSelectedType(initialSearchParams.type || "");
      setSelectedListingType(initialSearchParams.listing_type || "");
      setMinPrice(initialSearchParams.min_price || "");
      setMaxPrice(initialSearchParams.max_price || "");
      setMinGrossM2(initialSearchParams.min_gross_m2 || "");
      setMaxGrossM2(initialSearchParams.max_gross_m2 || "");
      setMinFloor(initialSearchParams.min_floor || "");
      setMaxFloor(initialSearchParams.max_floor || "");
      setSelectedInsideSite(initialSearchParams.inside_site || "all");
      
      if (initialSearchParams.room_plan) {
        const plans = Array.isArray(initialSearchParams.room_plan) 
          ? initialSearchParams.room_plan 
          : [initialSearchParams.room_plan];
        setSelectedRoomPlans(plans);
      }
      
      if (initialSearchParams.heating) {
        const heating = Array.isArray(initialSearchParams.heating) 
          ? initialSearchParams.heating 
          : [initialSearchParams.heating];
        setSelectedHeating(heating);
      }
      
      if (initialSearchParams.portfolio_owner) {
        const owners = Array.isArray(initialSearchParams.portfolio_owner) 
          ? initialSearchParams.portfolio_owner 
          : [initialSearchParams.portfolio_owner];
        setSelectedPortfolioOwners(owners);
      }
    }
  }, [initialSearchParams]);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleMultiSelect = (value: string, selected: string[], setSelected: (value: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (selectedType) params.set('type', selectedType);
    if (selectedListingType) params.set('listing_type', selectedListingType);
    if (selectedCity) params.set('city', selectedCity.name);
    if (selectedDistrict) params.set('district', selectedDistrict.name);
    if (selectedNeighborhoods.length > 0) {
      selectedNeighborhoods.forEach(neighborhood => params.append('neighborhood', neighborhood));
    }
    if (selectedRoomPlans.length > 0) {
      selectedRoomPlans.forEach(plan => params.append('room_plan', plan));
    }
    if (selectedHeating.length > 0) {
      selectedHeating.forEach(heating => params.append('heating', heating));
    }
    if (selectedPortfolioOwners.length > 0) {
      selectedPortfolioOwners.forEach(owner => params.append('portfolio_owner', owner));
    }
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minGrossM2) params.set('min_gross_m2', minGrossM2);
    if (maxGrossM2) params.set('max_gross_m2', maxGrossM2);
    if (minFloor) params.set('min_floor', minFloor);
    if (maxFloor) params.set('max_floor', maxFloor);
    if (selectedInsideSite !== 'all') params.set('inside_site', selectedInsideSite);
    
    router.push(`/properties?${params.toString()}`);
    
    // Call callback to close mobile filters
    if (onFilterApplied) {
      onFilterApplied();
    }
  };

  const handleClear = () => {
    setSelectedType("");
    setSelectedListingType("");
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedNeighborhoods([]);
    setSelectedRoomPlans([]);
    setSelectedHeating([]);
    setSelectedPortfolioOwners([]);
    setSelectedInsideSite("all");
    setMinPrice("");
    setMaxPrice("");
    setMinGrossM2("");
    setMaxGrossM2("");
    setMinFloor("");
    setMaxFloor("");
    router.push('/properties');
  };

  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selected, 
    onChange, 
    dropdownKey 
  }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
    dropdownKey: string;
  }) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggleDropdown(dropdownKey)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
      >
        <span className={selected.length > 0 ? "text-slate-900" : "text-slate-500"}>
          {selected.length > 0 ? `${selected.length} seçili` : label}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${openDropdowns[dropdownKey] ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {openDropdowns[dropdownKey] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                    selected.includes(option) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-slate-300'
                  }`}>
                    {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-slate-900">{option}</span>
                </div>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          <option value="">Tümü</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">İlan Türü</label>
        <select
          value={selectedListingType}
          onChange={(e) => setSelectedListingType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          <option value="">Tümü</option>
          {listingTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
        <select
          value={selectedCity?.id || ""}
          onChange={(e) => {
            const city = cityOptions.find(c => c.id === e.target.value);
            setSelectedCity(city || null);
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          <option value="">Tümü</option>
          {cityOptions.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
        <select
          value={selectedDistrict?.id || ""}
          onChange={(e) => {
            const district = districtOptions.find(d => d.id === e.target.value);
            setSelectedDistrict(district || null);
          }}
          disabled={!selectedCity}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50 disabled:text-slate-500"
        >
          <option value="">Tümü</option>
          {districtOptions.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mahalle</label>
        <MultiSelectDropdown
          label="Mahalle seçin"
          options={neighborhoodOptions.map(n => n.name)}
          selected={selectedNeighborhoods}
          onChange={(value) => handleMultiSelect(value, selectedNeighborhoods, setSelectedNeighborhoods)}
          dropdownKey="neighborhood"
        />
      </div>

      {/* Room Plan */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Oda Planı</label>
        <MultiSelectDropdown
          label="Oda planı seçin"
          options={roomPlanOptions}
          selected={selectedRoomPlans}
          onChange={(value) => handleMultiSelect(value, selectedRoomPlans, setSelectedRoomPlans)}
          dropdownKey="roomPlan"
        />
      </div>

      {/* Heating */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Isıtma</label>
        <MultiSelectDropdown
          label="Isıtma türü seçin"
          options={heatingOptions}
          selected={selectedHeating}
          onChange={(value) => handleMultiSelect(value, selectedHeating, setSelectedHeating)}
          dropdownKey="heating"
        />
      </div>

      {/* Portfolio Owner */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Portföy Sahibi</label>
        <MultiSelectDropdown
          label="Portföy sahibi seçin"
          options={portfolioOwnerOptions}
          selected={selectedPortfolioOwners}
          onChange={(value) => handleMultiSelect(value, selectedPortfolioOwners, setSelectedPortfolioOwners)}
          dropdownKey="portfolioOwner"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat Aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              placeholder="Min"
              value={formatPrice(minPrice)}
              onChange={(e) => setMinPrice(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Max"
              value={formatPrice(maxPrice)}
              onChange={(e) => setMaxPrice(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Gross m² Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Brüt m² Aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              placeholder="Min"
              value={formatNumber(minGrossM2)}
              onChange={(e) => setMinGrossM2(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Max"
              value={formatNumber(maxGrossM2)}
              onChange={(e) => setMaxGrossM2(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
        </div>

      </div>

      {/* Floor Range */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Kat Aralığı</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="text"
              placeholder="Min"
              value={formatNumber(minFloor)}
              onChange={(e) => setMinFloor(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Max"
              value={formatNumber(maxFloor)}
              onChange={(e) => setMaxFloor(parseNumber(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
        </div>
      </div>

      {/* Inside Site */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Site İçerisinde</label>
        <select
          value={selectedInsideSite}
          onChange={(e) => setSelectedInsideSite(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        >
          {insideSiteOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2">
        <button
          onClick={handleFilter}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Filtrele
        </button>
        <button
          onClick={handleClear}
          className="w-full border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Temizle
        </button>
      </div>
    </div>
  );
}
