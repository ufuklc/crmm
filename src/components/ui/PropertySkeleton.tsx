"use client";

import type React from "react";

export function PropertySkeleton(): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="w-20 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-32 h-8 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4">
          <div className="w-full h-12 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Filters Panel Skeleton */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
              <div className="w-20 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
              
              {/* Filter Items */}
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-full h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2 mt-6">
                <div className="flex-1 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </aside>

          {/* Assets Table Skeleton */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
              {/* Table Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="w-32 h-6 bg-slate-200 rounded animate-pulse"></div>
                  <div className="flex items-center space-x-4">
                    <div className="w-40 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto flex-1">
                {/* Desktop Table Skeleton */}
                <div className="hidden lg:block">
                  <table className="w-full table-fixed">
                    <thead className="bg-slate-50">
                      <tr>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <th key={i} className="px-3 py-3">
                            <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-3 py-4">
                              <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards Skeleton */}
                <div className="lg:hidden p-4 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                          <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-40 h-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="w-28 h-4 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                          <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Skeleton */}
              <div className="p-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="flex space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
