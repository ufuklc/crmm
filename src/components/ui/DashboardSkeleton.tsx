"use client";

import type React from "react";

export function DashboardSkeleton(): React.ReactElement {
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
        <div className="mb-8">
          <div className="w-48 h-8 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
          <div className="w-64 h-4 bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-6 bg-slate-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="flex-1 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-1/2 h-3 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full flex flex-col">
            <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="w-2/3 h-3 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="w-48 h-4 bg-slate-200 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
