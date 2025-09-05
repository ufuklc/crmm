"use client";

import type React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps): React.ReactElement {
  if (totalPages <= 1) return <></>;

  const createPageUrl = (page: number): string => {
    const params = new URLSearchParams();
    
    // Mevcut search parametrelerini ekle
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    
    // Sayfa numarasını ekle
    params.set("page", String(page));
    
    return `${baseUrl}?${params.toString()}`;
  };

  const getVisiblePages = (): number[] => {
    const delta = 2; // Her iki tarafta gösterilecek sayfa sayısı
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1); // -1 dots için
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages); // -1 dots için
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Önceki sayfa */}
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center justify-center w-8 h-8 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Önceki sayfa"
        >
          ‹
        </Link>
      )}

      {/* Sayfa numaraları */}
      {visiblePages.map((page, index) => {
        if (page === -1) {
          return (
            <span key={`dots-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          );
        }

        const isCurrentPage = page === currentPage;
        
        return (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`flex items-center justify-center w-8 h-8 text-sm rounded-md transition-colors ${
              isCurrentPage
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            }`}
            aria-label={`Sayfa ${page}`}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            {page}
          </Link>
        );
      })}

      {/* Sonraki sayfa */}
      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center justify-center w-8 h-8 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Sonraki sayfa"
        >
          ›
        </Link>
      )}
    </div>
  );
}
