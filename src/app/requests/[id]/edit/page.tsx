"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MultiCheckDropdown } from "@/components/forms/controls/MultiCheckDropdown";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";

type Req = {
  id: string;
  customer_id: string | null;
  type: string | null;
  listing_type: string | null;
  cash_or_loan?: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  min_price: number | null;
  max_price: number | null;
  min_size: number | null;
  max_size: number | null;
  rooms?: string | null;
  heating?: string | null;
  ensuite_bath?: boolean | null;
  pool?: boolean | null;
  dressing_room?: boolean | null;
  furnished?: boolean | null;
  bathroom_count?: number | null;
  balcony?: boolean | null;
  in_site?: boolean | null;
  floor?: number | null;
  building_floors?: number | null;
  building_age?: number | null;
};

export default function RequestEditPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const [request, setRequest] = useState<Req | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [neighborhoodOptions, setNeighborhoodOptions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/requests/${id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const req = data.request as Req;
          setRequest(req);
          
          // Mahalle verilerini ayarla
          if (req.neighborhood) {
            setSelectedNeighborhoods(req.neighborhood.split(',').map(n => n.trim()));
          }
          // İl ve ilçe bilgilerini ayarla (text olarak geldiği için ID'leri bulmamız gerekiyor)
          if (req.city) {
            // İl ID'sini bul
            try {
              const cityRes = await fetch('/api/locations/cities');
              if (cityRes.ok) {
                const cityData = await cityRes.json();
                const city = cityData.items?.find((c: any) => c.name === req.city);
                if (city) {
                  setSelectedCity({ id: city.id, name: city.name });
                  
                  // İlçe ID'sini bul
                  if (req.district) {
                    const districtRes = await fetch(`/api/locations/districts?cityId=${city.id}`);
                    if (districtRes.ok) {
                      const districtData = await districtRes.json();
                      const district = districtData.items?.find((d: any) => d.name === req.district);
                      if (district) {
                        setSelectedDistrict({ id: district.id, name: district.name });
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error('İl/İlçe ID bulma hatası:', error);
              // Fallback: sadece isimleri ayarla
              setSelectedCity({ id: "", name: req.city });
              if (req.district) {
                setSelectedDistrict({ id: "", name: req.district });
              }
            }
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  // Mahalle seçeneklerini yükle
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (selectedDistrict?.id) {
        try {
          const response = await fetch(`/api/locations/neighborhoods?districtId=${selectedDistrict.id}`);
          if (response.ok) {
            const data = await response.json();
            setNeighborhoodOptions(data.items?.map((n: any) => n.name) || []);
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
  }, [selectedDistrict]);

  if (loading) return <div className="max-w-3xl mx-auto p-4">Yükleniyor...</div>;
  if (!request) return <div className="max-w-3xl mx-auto p-4">Kayıt bulunamadı.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">İstek Düzenle</h1>
        <div className="flex gap-2">
          <Link href={`/requests/${request.id}`} className="btn btn-primary">İptal</Link>
        </div>
      </div>

      <form action={`/api/requests/${request.id}`} method="post" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm space-y-3">
        <input type="hidden" name="_method" value="patch" />
        <input type="hidden" name="customer_id" value={request.customer_id || ""} />
        <input type="hidden" name="neighborhood" value={selectedNeighborhoods.join(',')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Tür</label>
            <select name="type" defaultValue={request.type ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Daire</option>
              <option>İş Yeri</option>
              <option>Arsa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">İlan Tipi</label>
            <select name="listing_type" defaultValue={request.listing_type ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Satılık</option>
              <option>Kiralık</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700">Ödeme Tercihi</label>
          <select name="cash_or_loan" defaultValue={request.cash_or_loan ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option value="">Seçiniz</option>
            <option value="Nakit">Nakit</option>
            <option value="Kredi">Kredi</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">İl</label>
            <SearchableSelect
              label=""
              placeholder="İl seçin"
              fetchUrl="/api/locations/cities"
              onChange={(city) => {
                setSelectedCity(city);
                setSelectedDistrict(null);
                setSelectedNeighborhoods([]);
              }}
              value={selectedCity}
            />
            <input type="hidden" name="city" value={selectedCity?.name || ""} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">İlçe</label>
            <SearchableSelect
              label=""
              placeholder="İlçe seçin"
              fetchUrl="/api/locations/districts"
              query={{ cityId: selectedCity?.id }}
              onChange={(district) => {
                setSelectedDistrict(district);
                setSelectedNeighborhoods([]);
              }}
              value={selectedDistrict}
              disabled={!selectedCity}
              autoFetch={true}
            />
            <input type="hidden" name="district" value={selectedDistrict?.name || ""} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Mahalle(ler)</label>
            <MultiCheckDropdown
              label=""
              placeholder="Mahalle seçin"
              options={neighborhoodOptions}
              selected={selectedNeighborhoods}
              onChange={setSelectedNeighborhoods}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700">Min Fiyat</label>
              <input name="min_price" defaultValue={request.min_price ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Max Fiyat</label>
              <input name="max_price" defaultValue={request.max_price ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700">Min m²</label>
              <input name="min_size" defaultValue={request.min_size ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Max m²</label>
              <input name="max_size" defaultValue={request.max_size ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Oda Sayısı</label>
            <select name="rooms" defaultValue={request.rooms ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              {[
                "Stüdyo(1+0)","1+1","1.5+1","2+0","2+1","2.5+1","2+2","3+0","3+1","3.5+1","3+2","3+3",
                "4+0","4+1","4.5+1","4.5+2","4+2","4+3","4+4","5+1","5.5 + 1","5+2","5+3","5+4",
                "6+1","6+2","6.5 + 1","6+3","6+4","7+1","7+2","7+3","8+1","8+2","8+3","8+4",
                "9+1","9+3","9+4","9+5","9+6","10+1","10+2","10 Üzeri"
              ].map((rp) => (
                <option key={rp} value={rp}>{rp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Isıtma</label>
            <select name="heating" defaultValue={request.heating ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Seçiniz</option>
              <option>Klima</option>
              <option>Doğalgaz</option>
              <option>Merkezi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Ebeveyn Banyosu</label>
            <select name="ensuite_bath" defaultValue={request.ensuite_bath == null ? "" : request.ensuite_bath ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Havuz</label>
            <select name="pool" defaultValue={request.pool == null ? "" : request.pool ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Giyinme Odası</label>
            <select name="dressing_room" defaultValue={request.dressing_room == null ? "" : request.dressing_room ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Eşyalı</label>
            <select name="furnished" defaultValue={request.furnished == null ? "" : request.furnished ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Banyo Sayısı</label>
            <input name="bathroom_count" defaultValue={request.bathroom_count ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Balkon</label>
            <select name="balcony" defaultValue={request.balcony == null ? "" : request.balcony ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Site İçinde</label>
            <select name="in_site" defaultValue={request.in_site == null ? "" : request.in_site ? "Evet" : "Hayır"} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
              <option value="">Farketmez</option>
              <option>Evet</option>
              <option>Hayır</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Bulunduğu Kat</label>
            <input name="floor" defaultValue={request.floor ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bina Kat Sayısı</label>
            <input name="building_floors" defaultValue={request.building_floors ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bina Yaşı</label>
            <input name="building_age" defaultValue={request.building_age ?? undefined} inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link href={`/requests/${request.id}`} className="btn btn-primary">İptal</Link>
          <button type="submit" className="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  );
}