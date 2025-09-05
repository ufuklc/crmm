"use client";

import type React from "react";
import { useState } from "react";

type Note = { id: string; content: string; created_at: string };

export function CustomerNotesForm({ customerId, initialNotes }: { customerId: string; initialNotes: Note[] }): React.ReactElement {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [list, setList] = useState<Note[]>(initialNotes);

  async function onAdd(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/meeting-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, content }),
    });
    const json: { id?: string; error?: string } = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Kayıt başarısız");
      return;
    }
    setList([{ id: json.id as string, content, created_at: new Date().toISOString() }, ...list]);
    setContent("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onAdd} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <label className="block text-sm text-gray-700">Yeni Görüşme Notu</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={3} className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Notlar</h3>
        {list.length === 0 ? (
          <div className="text-gray-600">Not yok.</div>
        ) : (
          <ul className="space-y-2">
            {list.map((n) => (
              <li key={n.id} className="border-b border-gray-100 pb-2">
                <div className="text-gray-900">{n.content}</div>
                <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString("tr-TR")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


