"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SortDropdownProps {
  currentSort?: string;
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-slate-600">Sırala:</label>
      <select 
        value={currentSort || ''} 
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm border border-slate-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
      >
        <option value="">Varsayılan</option>
        <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
        <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
      </select>
    </div>
  );
}
