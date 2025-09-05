"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { useEffect } from "react";
import { ProfessionSelect } from "@/components/forms/controls/ProfessionSelect";

export function CustomerForm(): React.ReactElement {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [cashOrLoan, setCashOrLoan] = useState<"Nakit" | "Kredi">("Nakit");
  const [preferredListing, setPreferredListing] = useState<"Satılık" | "Kiralık" | "">("");
  const [professionId, setProfessionId] = useState<string>("");
  // const [professions, setProfessions] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone,
        cash_or_loan: cashOrLoan,
        profession_id: professionId || null,
        preferred_listing_type: preferredListing || null,
      }),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Kayıt başarısız");
      return;
    }
    router.push("/customers");
  }

  // useEffect(() => {
  //   fetch("/api/professions")
  //     .then((r) => r.json())
  //     .then((j) => setProfessions((j.professions as Array<{ id: string; name: string }>) ?? []))
  //     .catch(() => setProfessions([]));
  // }, []);

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Ad</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Tercih (Satılık/Kiralık)</label>
          <select value={preferredListing} onChange={(e) => setPreferredListing(e.target.value as "Satılık" | "Kiralık" | "")} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option value="">Seçiniz</option>
            <option value="Satılık">Satılık</option>
            <option value="Kiralık">Kiralık</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Soyad</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm" />
        </div>
        <ProfessionSelect initialId={professionId} onChange={setProfessionId} />
        <div>
          <label className="block text-sm text-gray-700">Nakit/Kredi</label>
          <select value={cashOrLoan} onChange={(e) => setCashOrLoan(e.target.value as "Nakit" | "Kredi")} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
            <option value="Nakit">Nakit</option>
            <option value="Kredi">Kredi</option>
          </select>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}


