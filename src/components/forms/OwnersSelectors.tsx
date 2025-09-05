"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { SearchableSelect } from "@/components/forms/controls/SearchableSelect";

export function OwnersSelectors({
  initialCustomerId,
  initialPortfolioOwnerId,
}: {
  initialCustomerId?: string | null;
  initialPortfolioOwnerId?: string | null;
}): React.ReactElement {
  const [customerId, setCustomerId] = useState<string>(initialCustomerId ?? "");
  const [portfolioOwnerId, setPortfolioOwnerId] = useState<string>(initialPortfolioOwnerId ?? "");
  const [customerName, setCustomerName] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    async function load(): Promise<void> {
      if (customerId) {
        try {
          const r = await fetch(`/api/customers/${customerId}`);
          const j = await r.json();
          const c = j.customer as { first_name?: string; last_name?: string };
          if (c) setCustomerName(`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim());
        } catch {}
      }
      if (portfolioOwnerId) {
        try {
          const r = await fetch(`/api/portfolio-owners/${portfolioOwnerId}`);
          const j = await r.json();
          const o = j.portfolioOwner as { first_name?: string; last_name?: string };
          if (o) setOwnerName(`${o.first_name ?? ""} ${o.last_name ?? ""}`.trim());
        } catch {}
      }
    }
    load();
  }, [customerId, portfolioOwnerId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <SearchableSelect
          label="Mülk Sahibi"
          fetchUrl="/api/lookup/customers"
          placeholder={customerName || undefined}
          onChange={(v) => setCustomerId(v?.id ?? "")}
        />
        <input type="hidden" name="customer_id" value={customerId} />
      </div>
      <div>
        <SearchableSelect
          label="Portföy Sahibi"
          fetchUrl="/api/lookup/portfolio-owners"
          placeholder={ownerName || undefined}
          onChange={(v) => setPortfolioOwnerId(v?.id ?? "")}
        />
        <input type="hidden" name="portfolio_owner_id" value={portfolioOwnerId} />
      </div>
    </div>
  );
}


