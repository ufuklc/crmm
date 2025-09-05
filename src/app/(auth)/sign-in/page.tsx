"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/auth";

export default function SignInPage(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    const { error } = await signInWithEmail({ email, password });
    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }
    
    // Başarılı giriş
    router.push("/dashboard");
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Giriş Yap</h1>
      <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div>
          <label className="block text-sm text-gray-700">E-posta</label>
          <input
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Şifre</label>
          <input
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </div>
      </form>
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
        <p className="font-medium">Supabase Kullanıcıları:</p>
        <p>Veritabanındaki auth.users tablosundaki kullanıcılar ile giriş yapabilirsiniz.</p>
      </div>
      <p className="text-xs text-gray-500">
        Not: Supabase authentication sistemi kullanılmaktadır.
      </p>
    </div>
  );
}


