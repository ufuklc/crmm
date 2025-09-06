"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropertyFilters } from "./PropertyFilters";

interface MobileFiltersProps {
  initialSearchParams?: Record<string, string | undefined>;
}

export function MobileFilters({ initialSearchParams }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterApplied = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Filter and Clear Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={toggleFilters}
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtreler</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-4 w-4" />
          </motion.div>
        </button>
        <button
          onClick={() => {
            // Clear all filters by navigating to clean URL and refresh
            window.location.href = '/properties';
            window.location.reload();
          }}
          className="flex items-center justify-center space-x-2 border border-slate-300 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <X className="h-4 w-4" />
          <span className="font-medium">Temizle</span>
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Filtreler</h3>
                <p className="text-sm text-slate-500">Arama kriterlerinizi seçin</p>
              </div>
              <PropertyFilters 
                initialSearchParams={initialSearchParams} 
                onFilterApplied={handleFilterApplied}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleFilters}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
