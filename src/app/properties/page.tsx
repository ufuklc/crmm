import type React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { 
  Building2, 
  Plus, 
  Eye, 
  Trash2,
  ChevronDown,
  Check,
  Filter
} from "lucide-react";
import { PropertyFilters } from "@/components/filters/PropertyFilters";
import { Pagination } from "@/components/ui/Pagination";
import { MobileFilters } from "@/components/filters/MobileFilters";
import { SortDropdown } from "@/components/filters/SortDropdown";

type PropertyRow = {
  id: string;
  type: string;
  listing_type: string;
  city: string;
  district: string;
  neighborhood: string;
  price: number;
  gross_m2: number;
  net_m2: number | null;
  rooms: number | null;
  room_plan?: string | null;
  building_floors?: number | null;
  building_age?: number | null;
  heating?: string | null;
  portfolio_owner?: { id: string; first_name: string; last_name: string } | null;
};

async function fetchProperties(searchParams?: Record<string, string | string[] | undefined>): Promise<{ properties: PropertyRow[]; total: number; page: number; pageSize: number }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  
  try {
    const qs = new URLSearchParams();
    const ua = h.get("user-agent") ?? "";
    const isMobile = /Mobi|Android|iPhone/i.test(ua);
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) {
          if (Array.isArray(v)) {
            v.forEach(item => qs.append(k, item));
          } else {
            qs.set(k, v);
          }
        }
      });
    }
    
    if (!qs.has("pageSize")) qs.set("pageSize", "15");
    
    const url = qs.toString() ? `${baseUrl}/api/properties?${qs}` : `${baseUrl}/api/properties`;
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Cookie': h.get('cookie') ?? ''
      }
    });
    
    if (!res.ok) {
      redirect("/sign-in");
    }
    
    const json = await res.json();
    return { 
      properties: (json.properties as PropertyRow[]) ?? [], 
      total: Number(json.total ?? 0), 
      page: Number(json.page ?? 1), 
      pageSize: Number(json.pageSize ?? 25) 
    };
  } catch (error) {
    console.error("Properties fetch error:", error);
    redirect("/sign-in");
  }
}

export default async function PropertiesPage({ 
  searchParams 
}: { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}): Promise<React.ReactElement> {
  const sp = await searchParams;
  const { properties, total, page, pageSize } = await fetchProperties(sp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Varlıklar</h1>
            <p className="text-slate-600 mt-1">Emlak portföyünüzü yönetin</p>
          </div>
          <Link 
            href="/properties/new" 
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Varlık</span>
          </Link>
        </div>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4">
          <MobileFilters initialSearchParams={sp as Record<string, string | undefined>} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Filters Panel - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtreler</h2>
              <PropertyFilters initialSearchParams={sp as Record<string, string | undefined>} />
            </div>
          </aside>

          {/* Assets Table */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              {/* Table Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Varlık Listesi</h2>
                  <div className="flex items-center space-x-4">
                    <SortDropdown currentSort={Array.isArray(sp.sort) ? sp.sort[0] : sp.sort} />
                    <span className="text-sm text-slate-500">{total} varlık</span>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto flex-1">
                {properties.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Henüz varlık bulunmuyor</p>
                    <p className="text-sm mt-1">Filtreleri temizleyerek daha fazla sonuç görebilirsiniz</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      <table className="w-full table-fixed">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="w-20 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tür</th>
                            <th className="w-20 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">İlan</th>
                            <th className="w-48 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Konum</th>
                            <th className="w-16 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Oda</th>
                            <th className="w-20 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">m²</th>
                            <th className="w-32 px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fiyat</th>
                            <th className="w-40 px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksiyonlar</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {properties.map((p) => (
                            <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                              <td className="px-3 py-4 text-sm">
                                <Link 
                                  href={`/properties/${p.id}`} 
                                  className="text-blue-600 hover:text-blue-700 font-medium truncate block"
                                  title={p.type}
                                >
                                  {p.type}
                                </Link>
                              </td>
                              <td className="px-3 py-4 text-sm text-slate-900 truncate" title={p.listing_type}>
                                {p.listing_type}
                              </td>
                              <td className="px-3 py-4 text-sm text-slate-900 truncate" title={`${p.city} / ${p.district} / ${p.neighborhood || "Tümü"}`}>
                                {p.city} / {p.district} / {p.neighborhood || "Tümü"}
                              </td>
                              <td className="px-3 py-4 text-sm text-slate-900 text-center">
                                {p.room_plan || "-"}
                              </td>
                              <td className="px-3 py-4 text-sm text-slate-900 text-center">
                                {p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}
                              </td>
                              <td className="px-3 py-4 text-sm font-medium text-slate-900 text-right">
                                {new Intl.NumberFormat("tr-TR").format(p.price)} ₺
                              </td>
                              <td className="px-3 py-4 text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-1">
                                  <Link 
                                    href={`/properties/${p.id}`}
                                    className="inline-flex items-center px-2 py-1 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 transition-colors text-xs"
                                    title="Detay"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Link>
                                  <form action={`/api/properties/${p.id}`} method="post" className="inline">
                                    <input type="hidden" name="_method" value="delete" />
                                    <button 
                                      type="submit"
                                      className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-red-700 bg-white hover:bg-red-50 transition-colors text-xs"
                                      title="Sil"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden">
                      <div className="p-4 space-y-4">
                        {properties.map((p) => (
                          <div key={p.id} className="border border-slate-200 rounded-xl p-4 hover:bg-blue-50/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link 
                                  href={`/properties/${p.id}`} 
                                  className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                                >
                                  {p.type}
                                </Link>
                                <p className="text-sm text-slate-600 mt-1">{p.listing_type}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Link 
                                  href={`/properties/${p.id}`}
                                  className="inline-flex items-center px-2 py-1 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 transition-colors text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Detay
                                </Link>
                                <form action={`/api/properties/${p.id}`} method="post" className="inline">
                                  <input type="hidden" name="_method" value="delete" />
                                  <button 
                                    type="submit"
                                    className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-red-700 bg-white hover:bg-red-50 transition-colors text-xs"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Sil
                                  </button>
                                </form>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Konum:</span>
                                <span className="text-slate-900">{p.city} / {p.district} / {p.neighborhood || "Tümü"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Oda:</span>
                                <span className="text-slate-900">{p.room_plan || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">m²:</span>
                                <span className="text-slate-900">{p.gross_m2}{p.net_m2 ? ` / ${p.net_m2}` : ""}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Fiyat:</span>
                                <span className="text-slate-900 font-medium">{new Intl.NumberFormat("tr-TR").format(p.price)} ₺</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Pagination */}
              {properties.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / pageSize)}
                    baseUrl="/properties"
                    searchParams={sp}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Emlak CRM · Assets Page
          </p>
        </div>
      </footer>
    </div>
  );
}