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

export default function FranchisePage() {
  const [offices, setOffices] = useState<FranchiseOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/franchise")
      .then((res) => setOffices(res.data))
      .catch((err) => console.error("Bayi veri hatasi:", err))
      .finally(() => setLoading(false));
  }, []);

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
        <button className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700">
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
    </div>
  );
}
