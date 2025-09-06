"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  UserPlus, 
  Phone, 
  Save, 
  X,
  Plus
} from "lucide-react";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  cash_or_loan: string;
  preferred_listing_type?: string | null;
  profession?: string | null;
}

interface Profession {
  id: string;
  name: string;
}

interface EditCustomerFormProps {
  customer: Customer;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps): React.ReactElement {
  const router = useRouter();
  const [firstName, setFirstName] = useState(customer.first_name);
  const [lastName, setLastName] = useState(customer.last_name);
  const [phone, setPhone] = useState(customer.phone);
  const [preferredListingType, setPreferredListingType] = useState(customer.preferred_listing_type || "");
  const [professionId, setProfessionId] = useState<string>("");
  const [cashOrLoan, setCashOrLoan] = useState(customer.cash_or_loan);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddProfession, setShowAddProfession] = useState(false);
  const [newProfessionName, setNewProfessionName] = useState("");
  const [addingProfession, setAddingProfession] = useState(false);

  // Profesyonları yükle
  useEffect(() => {
    fetch('/api/professions')
      .then(res => res.json())
      .then(data => {
        setProfessions(Array.isArray(data.items) ? data.items : []);
        // Mevcut müşterinin mesleğini bul ve seç
        if (customer.profession) {
          const currentProfession = data.items?.find((p: Profession) => p.name === customer.profession);
          if (currentProfession) {
            setProfessionId(currentProfession.id);
          }
        }
      })
      .catch(console.error);
  }, [customer.profession]);

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

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          preferred_listing_type: preferredListingType || null,
          profession_id: professionId || null,
          cash_or_loan: cashOrLoan
        })
      });

      if (response.ok) {
        router.push(`/customers/${customer.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Müşteri güncellenemedi');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      setError('Müşteri güncellenirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = firstName.trim() && lastName.trim() && phone.trim() && preferredListingType && professionId && cashOrLoan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Geri</span>
          </button>
          <div className="flex items-center space-x-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">Müşteri Düzenle</h1>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Ad Soyad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Ad"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Soyad
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Soyad"
                  required
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="Telefon numarası"
                  required
                />
              </div>
            </div>

            {/* Tercih */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Tercih
              </label>
              <select
                value={preferredListingType}
                onChange={(e) => setPreferredListingType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="">Seçiniz</option>
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
              </select>
            </div>

            {/* Meslek */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Meslek
              </label>
              {!showAddProfession ? (
                <div className="space-y-2">
                  <select
                    value={professionId}
                    onChange={(e) => setProfessionId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    required
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
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Yeni meslek ekle</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newProfessionName}
                      onChange={(e) => setNewProfessionName(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      placeholder="Yeni meslek adı"
                    />
                    <button
                      type="button"
                      onClick={handleAddProfession}
                      disabled={addingProfession || !newProfessionName.trim()}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nakit/Kredi */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Nakit/Kredi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCashOrLoan("Nakit")}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    cashOrLoan === "Nakit"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  Nakit
                </button>
                <button
                  type="button"
                  onClick={() => setCashOrLoan("Kredi")}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    cashOrLoan === "Kredi"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  Kredi
                </button>
                <button
                  type="button"
                  onClick={() => setCashOrLoan("İkisi de")}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    cashOrLoan === "İkisi de"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  İkisi de
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{submitting ? "Güncelleniyor..." : "Güncelle"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
