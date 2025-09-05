"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";

export function MultiCheckDropdown({
  label,
  options,
  selected,
  onChange,
  placeholder,
  single = false,
  defaultValue,
  value,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  single?: boolean; // true ise tek seçim yapılır (checkbox görünümünde)
  defaultValue?: string[];
  value?: string[];
}): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // selected prop'unu kullan, internal state yok
  const currentSelected = selected;

  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggleValue = useCallback((value: string): void => {
    if (single) {
      const newSelected = currentSelected.includes(value) ? [] : [value];
      onChange(newSelected);
      setOpen(false); // Single seçimde dropdown kapat
    } else {
      const newSelected = currentSelected.includes(value) 
        ? currentSelected.filter((v) => v !== value)
        : [...currentSelected, value];
      onChange(newSelected);
      // Multi seçimde dropdown açık kalsın
    }
  }, [single, currentSelected, onChange]);

  const displayText = currentSelected.length === 0 ? (placeholder ?? "Seçiniz") : currentSelected.join(", ");

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="block text-sm text-gray-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-left text-sm"
        >
          {displayText}
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg max-h-64 overflow-auto">
            <div className="flex justify-end">
              <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">✕</button>
            </div>
            <ul className="divide-y divide-gray-100">
              {options.map((opt) => (
                <li key={opt}>
                  <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-indigo-50">
                    <input
                      type="checkbox"
                      checked={currentSelected.includes(opt)}
                      onChange={() => toggleValue(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


