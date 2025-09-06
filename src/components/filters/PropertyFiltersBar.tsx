"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { SearchableSelect } from "../forms/controls/SearchableSelect";
import { MultiCheckDropdown } from "../forms/controls/MultiCheckDropdown";
import { PriceInput } from "../forms/controls/PriceInput";

const roomPlanOptions = [
  "1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1", "7+1", "8+1", "9+1", "10+1"
];

const heatingOptions = [
  "Doğalgaz", "Kombi", "Merkezi", "Soba", "Elektrik", "Klima", "Yok"
];

export const PropertyFiltersBar = forwardRef<
  { handleFilter: () => void },
  {
    initialSearchParams?: Record<string, string | string[] | undefined>;
  }
>(({ }, ref) => {
  // Tüm state'leri boş başlat
  const [selectedRoomPlans, setSelectedRoomPlans] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<{ id: string; name: string }[]>([]);
  const [selectedHeating, setSelectedHeating] = useState<string[]>([]);
  const [selectedPortfolioOwners, setSelectedPortfolioOwners] = useState<string[]>([]);
  const [portfolioOwnerOptions, setPortfolioOwnerOptions] = useState<string[]>([]);
  
  // Fiyat filtreleri
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minGrossM2, setMinGrossM2] = useState<string>("");
  const [maxGrossM2, setMaxGrossM2] = useState<string>("");
  const [minBuildingFloors, setMinBuildingFloors] = useState<string>("");
  const [maxBuildingFloors, setMaxBuildingFloors] = useState<string>("");

  // State'leri boş başlat
  const [current, setCurrent] = useState({
    type: '',
    listing_type: '',
    in_site: ''
  });

  // Portfolio owner'ları yükle
  useEffect(() => {
    const fetchPortfolioOwners = async () => {
      try {
        const response = await fetch('/api/lookup/portfolio-owners');
        if (response.ok) {
          const data = await response.json();
          setPortfolioOwnerOptions(data.items || []);
        }
      } catch (error) {
        console.error('Portfolio owner yükleme hatası:', error);
      }
    };
    fetchPortfolioOwners();
  }, []);

  // Mahalle seçeneklerini yükle
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (selectedDistrict?.id) {
        try {
          const response = await fetch(`/api/locations/neighborhoods?districtId=${selectedDistrict.id}`);
          if (response.ok) {
            const data = await response.json();
            setNeighborhoodOptions(data.items || []);
          }
        } catch (error) {
          console.error('Mahalle yükleme hatası:', error);
        }
      } else {
        setNeighborhoodOptions([]);
        setSelectedNeighborhoods([]);
      }
    };
    fetchNeighborhoods();
  }, [selectedDistrict?.id]);

  // İlçe query'sini memoize et
  const districtQuery = useMemo(() => ({ cityId: selectedCity?.id }), [selectedCity?.id]);

  // Ref için handleFilter fonksiyonunu expose et
  useImperativeHandle(ref, () => ({
    handleFilter
  }));

  const handleFilter = () => {
    // URL'yi güncelle ve sayfayı yenile
    const params = new URLSearchParams();
    
    // Temel filtreler
    if (current.type) params.set('type', current.type);
    if (current.listing_type) params.set('listing_type', current.listing_type);
    if (current.in_site) params.set('in_site', current.in_site);
    
    // Oda planı
    if (selectedRoomPlans.length > 0) {
      selectedRoomPlans.forEach(plan => params.append('room_plan', plan));
    }
    
    // Lokasyon
    if (selectedCity) {
      params.set('city', selectedCity.name);
    }
    if (selectedDistrict) {
      params.set('district', selectedDistrict.name);
    }
    if (selectedNeighborhoods.length > 0) {
      selectedNeighborhoods.forEach(neighborhood => params.append('neighborhood', neighborhood));
    }
    
    // Diğer filtreler
    if (selectedHeating.length > 0) {
      selectedHeating.forEach(heating => params.append('heating', heating));
    }
    if (selectedPortfolioOwners.length > 0) {
      selectedPortfolioOwners.forEach(owner => params.append('portfolio_owner_name', owner));
    }
    
    // Fiyat ve m²
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minGrossM2) params.set('min_gross_m2', minGrossM2);
    if (maxGrossM2) params.set('max_gross_m2', maxGrossM2);
    if (minBuildingFloors) params.set('min_building_floors', minBuildingFloors);
    if (maxBuildingFloors) params.set('max_building_floors', maxBuildingFloors);
    
    // URL'yi güncelle ve sayfayı yenile
    const newUrl = `/properties?${params.toString()}`;
    window.location.href = newUrl;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Tür</div>
        <select 
          value={current.type as string ?? ""} 
          onChange={(e) => setCurrent(prev => ({ ...prev, type: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 p-3 text-base"
        >
          <option value="">Tümü</option>
          <option>Daire</option>
          <option>İş Yeri</option>
          <option>Arsa</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">İlan Türü</div>
        <select 
          value={current.listing_type as string ?? ""} 
          onChange={(e) => setCurrent(prev => ({ ...prev, listing_type: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 p-3 text-base"
        >
          <option value="">Tümü</option>
          <option>Satılık</option>
          <option>Kiralık</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Şehir</div>
        <SearchableSelect
          label=""
          placeholder="Şehir seçin"
          fetchUrl="/api/locations/cities"
          onChange={(city) => {
            setSelectedCity(city);
            setSelectedDistrict(null);
            setSelectedNeighborhoods([]);
          }}
          value={selectedCity}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">İlçe</div>
        <SearchableSelect
          label=""
          placeholder="İlçe seçin"
          fetchUrl="/api/locations/districts"
          query={districtQuery}
          onChange={(district) => {
            setSelectedDistrict(district);
            setSelectedNeighborhoods([]);
          }}
          value={selectedDistrict}
          disabled={!selectedCity}
          autoFetch={true}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Mahalle</div>
        <MultiCheckDropdown
          label=""
          placeholder="Mahalle seçin"
          options={neighborhoodOptions.map(n => n.name)}
          selected={selectedNeighborhoods}
          onChange={(neighborhoods) => {
            setSelectedNeighborhoods(neighborhoods);
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Oda Planı</div>
        <MultiCheckDropdown
          label=""
          placeholder="Oda Planı"
          options={roomPlanOptions}
          selected={selectedRoomPlans}
          onChange={setSelectedRoomPlans}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Isıtma</div>
        <MultiCheckDropdown
          label=""
          placeholder="Isıtma"
          options={heatingOptions}
          selected={selectedHeating}
          onChange={setSelectedHeating}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Portföy Sahibi</div>
        <MultiCheckDropdown
          label=""
          placeholder="Portföy Sahibi"
          options={portfolioOwnerOptions}
          selected={selectedPortfolioOwners}
          onChange={setSelectedPortfolioOwners}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Fiyat</div>
        <div className="grid grid-cols-2 gap-2">
          <PriceInput
            name="min_price"
            label="Min Fiyat"
            value={minPrice}
            onChange={setMinPrice}
          />
          <PriceInput
            name="max_price"
            label="Max Fiyat"
            value={maxPrice}
            onChange={setMaxPrice}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Brüt m²</div>
        <div className="grid grid-cols-2 gap-2">
          <PriceInput
            name="min_gross_m2"
            label="Min Brüt m²"
            value={minGrossM2}
            onChange={setMinGrossM2}
          />
          <PriceInput
            name="max_gross_m2"
            label="Max Brüt m²"
            value={maxGrossM2}
            onChange={setMaxGrossM2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Kat Sayısı</div>
        <div className="grid grid-cols-2 gap-2">
          <PriceInput
            name="min_building_floors"
            label="Min Kat"
            value={minBuildingFloors}
            onChange={setMinBuildingFloors}
          />
          <PriceInput
            name="max_building_floors"
            label="Max Kat"
            value={maxBuildingFloors}
            onChange={setMaxBuildingFloors}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Site İçinde</div>
        <select 
          value={current.in_site as string ?? ""} 
          onChange={(e) => setCurrent(prev => ({ ...prev, in_site: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 p-3 text-base"
        >
          <option value="">Tümü</option>
          <option>Evet</option>
          <option>Hayır</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
        <button 
          type="button" 
          onClick={handleFilter}
          className="btn btn-primary w-full py-3 text-base font-medium"
        >
          Filtrele
        </button>
        <button 
          type="button" 
          onClick={() => {
            window.location.href = '/properties';
          }}
          className="btn btn-secondary w-full py-3 text-base font-medium"
        >
          Temizle
        </button>
      </div>
    </div>
  );
});

PropertyFiltersBar.displayName = 'PropertyFiltersBar';