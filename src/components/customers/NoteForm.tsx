"use client";

import type React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";

interface NoteFormProps {
  onAddNote: (content: string) => void;
}

export function NoteForm({ onAddNote }: NoteFormProps): React.ReactElement {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    try {
      await onAddNote(content.trim());
      setContent("");
    } catch (error) {
      console.error('Not eklenirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Yeni Görüşme Notu
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Notunuzu yazın..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 resize-none"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{submitting ? "Kaydediliyor..." : "Kaydet"}</span>
        </button>
      </div>
    </form>
  );
}
