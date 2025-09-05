"use client";

import type React from "react";
import { useState } from "react";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";

export function RequestFiltersBar({ initialCustomerId }: { initialCustomerId?: string }): React.ReactElement {
  const [customerId, setCustomerId] = useState<string>(initialCustomerId ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const params = new URLSearchParams();
    if (customerId) params.set("customer_id", customerId);
    // sayfa her filtrede 1'e dönsün
    params.set("page", "1");
    const qs = params.toString();
    window.location.href = qs ? `/requests?${qs}` : "/requests";
  }

  return (
    <form onSubmit={onSubmit} className="mb-3 flex flex-wrap items-end gap-2">
      <div className="min-w-64">
        <SearchableSelect label="Müşteri" fetchUrl="/api/lookup/customers" onChange={(v) => setCustomerId(v?.id ?? "")} />
      </div>
      <button className="btn btn-primary" type="submit">Filtrele</button>
      <a className="btn btn-primary" href="/requests">Temizle</a>
    </form>
  );
}


