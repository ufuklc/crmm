"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ensureCache, upsertCities, upsertDistricts } from "@/lib/cache/locationsCache";
import { Header } from "./Header";

export function ShowHeader(): JSX.Element | null {
  const pathname = usePathname();
  const hideOn = ["/sign-in", "/sign-up"];
  useEffect(() => {
    async function warm(): Promise<void> {
      ensureCache();
      try {
        const cities = await fetch("/api/locations/cities").then((r) => r.json()).then((j) => (j.items ?? []));
        upsertCities(cities);
        for (const c of cities.slice(0, 10)) {
          const districts = await fetch(`/api/locations/districts?cityId=${encodeURIComponent(c.id)}`).then((r) => r.json()).then((j) => (j.items ?? []));
          upsertDistricts(c.id, districts);
        }
      } catch { /* ignore */ }
    }
    void warm();
  }, []);
  if (hideOn.some((p) => pathname?.startsWith(p))) return null;
  return <Header />;
}



