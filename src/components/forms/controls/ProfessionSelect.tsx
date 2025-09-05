"use client";

import type React from "react";
import { useEffect, useState } from "react";

type Profession = { id: string; name: string };

export function ProfessionSelect({
  initialId = "",
  label = "Meslek",
  onChange,
}: {
  initialId?: string;
  label?: string;
  onChange?: (id: string) => void;
}): React.ReactElement {
  const [items, setItems] = useState<Profession[]>([]);
  const [selected, setSelected] = useState<string>(initialId);
  const NEW_VALUE = "__new__";
  const [adding, setAdding] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");

  useEffect(() => {
    fetch("/api/professions")
      .then((r) => r.json())
      .then((j) => setItems((j.professions as Profession[]) ?? []))
      .catch(() => setItems([]));
  }, []);

  async function addNewInline(): Promise<void> {
    const name = newName.trim();
    if (!name) return;
    const res = await fetch("/api/professions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json: { id?: string } = await res.json();
    if (res.ok && json.id) {
      const next: Profession = { id: json.id, name };
      setItems((prev) => [...prev, next].sort((a, b) => a.name.localeCompare(b.name, "tr")));
      setSelected(json.id);
      onChange?.(json.id);
      setAdding(false);
      setNewName("");
    }
  }

  function onSelect(e: React.ChangeEvent<HTMLSelectElement>): void {
    const v = e.target.value;
    if (v === NEW_VALUE) { setAdding(true); return; }
    setSelected(v);
    onChange?.(v);
  }

  return (
    <div>
      <label className="block text-sm text-gray-700">{label}</label>
      <select value={selected} onChange={onSelect} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm">
        <option value="">Seçiniz</option>
        <option value={NEW_VALUE}>+ Yeni meslek ekle…</option>
        {items.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      {adding && (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            placeholder="Meslek adı"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 p-2 text-sm"
          />
          <button type="button" onClick={addNewInline} className="btn btn-primary text-sm">Ekle</button>
          <button type="button" onClick={() => { setAdding(false); setNewName(""); }} className="btn btn-primary text-sm">İptal</button>
        </div>
      )}
      <input type="hidden" name="profession_id" value={selected} />
    </div>
  );
}


