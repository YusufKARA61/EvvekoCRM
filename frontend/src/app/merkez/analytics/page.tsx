"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AnalyticsPage() {
  const [funnel, setFunnel] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leads/stats/funnel")
      .then((res) => setFunnel(res.data))
      .catch((err) => console.error("Analitik veri hatasi:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const funnelSteps = [
    { key: "talep_geldi", label: "Talep Geldi", color: "bg-blue-500" },
    { key: "merkez_arandi", label: "Merkez Arandi", color: "bg-yellow-500" },
    { key: "besleme", label: "Besleme", color: "bg-orange-500" },
    { key: "toplanti_planlandi", label: "Toplanti Planlandi", color: "bg-purple-500" },
    { key: "toplanti_yapildi", label: "Toplanti Yapildi", color: "bg-indigo-500" },
    { key: "takip_aramasi", label: "Takip Aramasi", color: "bg-cyan-500" },
    { key: "teklif_asamasi", label: "Teklif Asamasi", color: "bg-teal-500" },
    { key: "kapanis_basarili", label: "Kapanis (Basarili)", color: "bg-green-500" },
    { key: "kapanis_basarisiz", label: "Kapanis (Basarisiz)", color: "bg-red-500" },
    { key: "iptal", label: "Iptal", color: "bg-gray-400" },
    { key: "sahte_bos", label: "Sahte/Bos", color: "bg-gray-300" },
  ];

  const maxCount = Math.max(...Object.values(funnel), 1);
  const totalLeads = Object.values(funnel).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
        <p className="text-gray-500">Lead donusum hunisi ve performans metrikleri</p>
      </div>

      {/* Ozet Kartlari */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Toplam Lead</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <p className="text-sm font-medium text-green-600">Basarili Kapanis</p>
          <p className="mt-1 text-3xl font-bold text-green-700">
            {funnel["kapanis_basarili"] || 0}
          </p>
          {totalLeads > 0 && (
            <p className="mt-1 text-xs text-green-500">
              %{((funnel["kapanis_basarili"] || 0) / totalLeads * 100).toFixed(1)} donusum
            </p>
          )}
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
          <p className="text-sm font-medium text-purple-600">Aktif Toplanti</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">
            {(funnel["toplanti_planlandi"] || 0) + (funnel["toplanti_yapildi"] || 0)}
          </p>
        </div>
      </div>

      {/* Lead Hunisi */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Lead Donusum Hunisi</h3>
        <div className="space-y-3">
          {funnelSteps.map((step) => {
            const count = funnel[step.key] || 0;
            const width = Math.max((count / maxCount) * 100, 2);
            const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : "0";
            return (
              <div key={step.key} className="flex items-center gap-4">
                <span className="w-44 text-sm text-gray-600">{step.label}</span>
                <div className="flex-1">
                  <div
                    className={`h-9 rounded ${step.color} flex items-center justify-between px-3 transition-all`}
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                </div>
                <span className="w-14 text-right text-sm text-gray-400">%{percentage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
