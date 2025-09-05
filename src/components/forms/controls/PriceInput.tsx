"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { formatNumberGroups } from "@/lib/utils/formatters";

export function PriceInput({ name, defaultValue, label, value, onChange }: { 
  name: string; 
  defaultValue?: number; 
  label: string;
  value?: string;
  onChange?: (value: string) => void;
}): React.ReactElement {
  const [display, setDisplay] = useState<string>(() => {
    if (value !== undefined) return value;
    if (defaultValue != null) return formatNumberGroups(defaultValue);
    return "";
  });

  useEffect(() => {
    if (value !== undefined) {
      setDisplay(value);
    } else if (defaultValue != null) {
      setDisplay(formatNumberGroups(defaultValue));
    }
  }, [defaultValue, value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatNumberGroups(raw);
    setDisplay(formatted);
    onChange?.(formatted);
  }

  const numeric = display.replace(/\./g, "").replace(/\s/g, "");

  return (
    <div>
      <label className="block text-sm text-gray-700">{label}</label>
      <div className="mt-1 relative">
        <input value={display} onChange={handleChange} inputMode="numeric" className="w-full rounded-lg border border-gray-300 p-2 text-sm pr-10" />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">TL</span>
      </div>
      <input type="hidden" name={name} value={numeric} />
    </div>
  );
}


