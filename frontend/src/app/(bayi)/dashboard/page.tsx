"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface BayiStats {
  bekleyen_randevular: number;
  onay_bekleyen: number;
  teslim_edilecek_raporlar: number;
  bu_ayki_toplanti: number;
  bu_ayki_hakedis: number;
  memnuniyet_ortalama: number;
}

export default function BayiDashboardPage() {
  const [stats, setStats] = useState<BayiStats | null>(null);

  useEffect(() => {
    api.get("/dashboard/bayi").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bayi Dashboard</h1>
        <p className="text-gray-500">Ofisinizin gunluk ozeti</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Bekleyen Randevular</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.bekleyen_randevular || 0}
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm font-medium text-orange-600">Onay Bekleyen</p>
          <p className="mt-1 text-3xl font-bold text-orange-700">
            {stats?.onay_bekleyen || 0}
          </p>
          {(stats?.onay_bekleyen || 0) > 0 && (
            <p className="mt-1 text-xs text-orange-500">
              2 saat icinde onaylayin!
            </p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Teslim Edilecek Rapor</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.teslim_edilecek_raporlar || 0}
          </p>
        </div>
      </div>

      {/* Hizli Aksiyonlar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Hizli Aksiyonlar</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href="/bayi/appointments"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="rounded-lg bg-primary-100 p-2 text-primary-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Randevulari Gor</p>
              <p className="text-sm text-gray-500">Onay bekleyen ve yaklasan randevular</p>
            </div>
          </a>
          <a
            href="/bayi/reports"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Rapor Gir</p>
              <p className="text-sm text-gray-500">Toplanti raporlarini goruntule ve olustur</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
