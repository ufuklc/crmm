"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Save } from "lucide-react";

export default function NewPortfolioOwnerPage(): React.ReactElement {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/portfolio-owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName }),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Kayıt başarısız");
      return;
    }
    router.push("/portfolio-owners");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 sm:mb-8">
          <Link
            href="/portfolio-owners"
            className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Geri</span>
          </Link>
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Yeni Portföy Sahibi</h1>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Ad *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Adını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Soyadını girin"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <Link
                href="/portfolio-owners"
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium">İptal</span>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}


