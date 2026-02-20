"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface FranchiseOffice {
  id: number;
  name: string;
  code: string;
  il: string;
  ilce: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  territory_ilceler: string[];
  is_active: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  created_at: string;
}

const ISTANBUL_ILCELER = [
  "Adalar", "Arnavutkoy", "Atasehir", "Avcilar", "Bagcilar", "Bahcelievler",
  "Bakirkoy", "Basaksehir", "Bayrampasa", "Besiktas", "Beykoz", "Beylikduzu",
  "Beyoglu", "Buyukcekmece", "Catalca", "Cekmekoy", "Esenler", "Esenyurt",
  "Eyupsultan", "Fatih", "Gaziosmanpasa", "Gungoren", "Kadikoy", "Kagithane",
  "Kartal", "Kucukcekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
  "Silivri", "Sultanbeyli", "Sultangazi", "Sile", "Sisli", "Tuzla",
  "Umraniye", "Uskudar", "Zeytinburnu",
];

export default function FranchisePage() {
  const [offices, setOffices] = useState<FranchiseOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    il: "Istanbul",
    ilce: "",
    address: "",
    phone: "",
    email: "",
    territory_ilceler: [] as string[],
    contract_start_date: "",
    contract_end_date: "",
  });

  const fetchOffices = () => {
    api
      .get("/franchise")
      .then((res) => setOffices(res.data))
      .catch((err) => console.error("Bayi veri hatasi:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const openModal = () => {
    setError("");
    setForm({
      name: "",
      code: "",
      il: "Istanbul",
      ilce: "",
      address: "",
      phone: "",
      email: "",
      territory_ilceler: [],
      contract_start_date: "",
      contract_end_date: "",
    });
    setShowModal(true);
  };

  const handleTerritoryToggle = (ilce: string) => {
    setForm((prev) => ({
      ...prev,
      territory_ilceler: prev.territory_ilceler.includes(ilce)
        ? prev.territory_ilceler.filter((i) => i !== ilce)
        : [...prev.territory_ilceler, ilce],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/franchise", {
        name: form.name,
        code: form.code,
        il: form.il,
        ilce: form.ilce,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        territory_ilceler: form.territory_ilceler,
        contract_start_date: form.contract_start_date || null,
        contract_end_date: form.contract_end_date || null,
      });
      setShowModal(false);
      fetchOffices();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Bayi eklenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bayiler</h1>
          <p className="text-gray-500">Franchise ofislerini yonetin</p>
        </div>
        <button
          onClick={openModal}
          className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          + Yeni Bayi Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offices.length === 0 ? (
          <p className="col-span-full text-center text-sm text-gray-500 py-8">
            Henuz bayi eklenmemis
          </p>
        ) : (
          offices.map((office) => (
            <div
              key={office.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{office.name}</h3>
                  <p className="text-sm text-gray-500">{office.code}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    office.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {office.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {office.il} / {office.ilce}
                </div>
                {office.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {office.phone}
                  </div>
                )}
              </div>

              {office.territory_ilceler.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Bolge:</p>
                  <div className="flex flex-wrap gap-1">
                    {office.territory_ilceler.map((ilce) => (
                      <span
                        key={ilce}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {ilce}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Yeni Bayi Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Yeni Bayi Ekle</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ofis Adi *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Evveko Kadikoy Ofisi"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ofis Kodu *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="FO-IST-01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Il *</label>
                  <input
                    type="text"
                    required
                    value={form.il}
                    onChange={(e) => setForm({ ...form, il: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ilce *</label>
                  <select
                    required
                    value={form.ilce}
                    onChange={(e) => setForm({ ...form, ilce: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Ilce secin</option>
                    {ISTANBUL_ILCELER.map((ilce) => (
                      <option key={ilce} value={ilce}>{ilce}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Adres</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0216 XXX XX XX"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sozlesme Baslangic</label>
                  <input
                    type="date"
                    value={form.contract_start_date}
                    onChange={(e) => setForm({ ...form, contract_start_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sozlesme Bitis</label>
                  <input
                    type="date"
                    value={form.contract_end_date}
                    onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bolge (Ilceler)
                </label>
                <p className="mb-2 text-xs text-gray-500">Ofis&apos;in sorumluluk bolgesindeki ilceleri secin</p>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 p-3 max-h-40 overflow-y-auto">
                  {ISTANBUL_ILCELER.map((ilce) => (
                    <label
                      key={ilce}
                      className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition ${
                        form.territory_ilceler.includes(ilce)
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={form.territory_ilceler.includes(ilce)}
                        onChange={() => handleTerritoryToggle(ilce)}
                      />
                      {ilce}
                    </label>
                  ))}
                </div>
                {form.territory_ilceler.length > 0 && (
                  <p className="mt-1 text-xs text-primary-600">
                    {form.territory_ilceler.length} ilce secildi
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Iptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Bayi Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
