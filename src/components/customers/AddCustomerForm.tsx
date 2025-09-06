"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  UserPlus, 
  Phone, 
  Save,
  Check
} from "lucide-react";

interface Profession {
  id: string;
  name: string;
}

export function AddCustomerForm(): React.ReactElement {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [preferredListingType, setPreferredListingType] = useState<string>("");
  const [professionId, setProfessionId] = useState<string>("");
  const [cashOrLoan, setCashOrLoan] = useState<string>("");
  
  // Profession states
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [showAddProfession, setShowAddProfession] = useState<boolean>(false);
  const [newProfessionName, setNewProfessionName] = useState<string>("");
  const [addingProfession, setAddingProfession] = useState<boolean>(false);

  // Fetch professions
  useEffect(() => {
    fetch('/api/professions')
      .then(res => res.json())
      .then(data => setProfessions(Array.isArray(data.items) ? data.items : []))
      .catch(console.error);
  }, []);

  const handleAddProfession = async () => {
    if (!newProfessionName.trim()) return;
    
    setAddingProfession(true);
    try {
      const response = await fetch('/api/professions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProfessionName.trim() })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Yeni meslek bilgisini al
        const newProfession = { id: result.id, name: newProfessionName.trim() };
        setProfessions(prev => [...prev, newProfession]);
        setProfessionId(newProfession.id);
        setNewProfessionName("");
        setShowAddProfession(false);
      } else {
        const errorData = await response.json();
        console.error('Meslek eklenemedi:', errorData.error);
        setError(errorData.error || 'Meslek eklenemedi');
      }
    } catch (error) {
      console.error('Meslek ekleme hatası:', error);
      setError('Meslek eklenirken bir hata oluştu');
    } finally {
      setAddingProfession(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone,
          preferred_listing_type: payload.preferred_listing_type || null,
          profession_id: payload.profession_id || null,
          cash_or_loan: payload.cash_or_loan
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        router.push(`/customers/${result.id}`);
      } else {
        setError(result.error || 'Müşteri eklenemedi');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && phone.trim() && preferredListingType && professionId && cashOrLoan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Geri</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">Yeni Müşteri</h1>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ad *</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Adınızı girin"
                />
              </div>

              {/* Soyad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Soyad *</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Soyadınızı girin"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    placeholder="Telefon numarası girin"
                  />
                </div>
              </div>

              {/* Tercih */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tercih (Satılık/Kiralık) *</label>
                <select
                  name="preferred_listing_type"
                  required
                  value={preferredListingType}
                  onChange={(e) => setPreferredListingType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Seçiniz</option>
                  <option value="Satılık">Satılık</option>
                  <option value="Kiralık">Kiralık</option>
                </select>
              </div>

              {/* Meslek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meslek *</label>
                {!showAddProfession ? (
                  <div className="space-y-2">
                    <select
                      name="profession_id"
                      required
                      value={professionId}
                      onChange={(e) => setProfessionId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Seçiniz</option>
                      {professions.map((profession) => (
                        <option key={profession.id} value={profession.id}>
                          {profession.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddProfession(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      + Yeni meslek ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newProfessionName}
                        onChange={(e) => setNewProfessionName(e.target.value)}
                        placeholder="Yeni meslek adı"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        type="button"
                        onClick={handleAddProfession}
                        disabled={!newProfessionName.trim() || addingProfession}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {addingProfession ? "Ekleniyor..." : "Ekle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProfession(false);
                          setNewProfessionName("");
                        }}
                        className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Nakit/Kredi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nakit/Kredi *</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`rounded-xl border px-4 py-3 text-center cursor-pointer ${
                    cashOrLoan === 'Nakit' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="cash_or_loan"
                      value="Nakit"
                      className="sr-only"
                      onChange={(e) => setCashOrLoan(e.target.value)}
                    />
                    Nakit
                  </label>
                  <label className={`rounded-xl border px-4 py-3 text-center cursor-pointer ${
                    cashOrLoan === 'Kredi' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="cash_or_loan"
                      value="Kredi"
                      className="sr-only"
                      onChange={(e) => setCashOrLoan(e.target.value)}
                    />
                    Kredi
                  </label>
                  <label className={`rounded-xl border px-4 py-3 text-center cursor-pointer ${
                    cashOrLoan === 'İkisi de' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-blue-50'
                  }`}>
                    <input
                      type="radio"
                      name="cash_or_loan"
                      value="İkisi de"
                      className="sr-only"
                      onChange={(e) => setCashOrLoan(e.target.value)}
                    />
                    İkisi de
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Link
                href="/customers"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{submitting ? "Kaydediliyor..." : "Kaydet"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
