"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { DashboardStats } from "@/types";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function MerkezDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [funnel, setFunnel] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, funnelRes] = await Promise.all([
          api.get("/dashboard/merkez"),
          api.get("/leads/stats/funnel"),
        ]);
        setStats(statsRes.data);
        setFunnel(funnelRes.data);
      } catch (err) {
        console.error("Dashboard veri hatasi:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Merkez Dashboard</h1>
        <p className="text-gray-500">Gunluk operasyon ozeti</p>
      </div>

      {/* Istatistik Kartlari */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Lead"
          value={stats?.toplam_lead || 0}
          color="bg-blue-100 text-blue-600"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Bekleyen Arama"
          value={stats?.bekleyen_aramalar || 0}
          color="bg-yellow-100 text-yellow-600"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
        <StatCard
          label="SLA Ihlali"
          value={stats?.sla_ihlali || 0}
          color="bg-red-100 text-red-600"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Bugunun Randevulari"
          value={stats?.bugunun_randevulari || 0}
          color="bg-green-100 text-green-600"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Lead Hunisi */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Lead Hunisi</h3>
        <div className="space-y-3">
          {[
            { key: "talep_geldi", label: "Talep Geldi", color: "bg-blue-500" },
            { key: "merkez_arandi", label: "Merkez Arandi", color: "bg-yellow-500" },
            { key: "toplanti_planlandi", label: "Toplanti Planlandi", color: "bg-purple-500" },
            { key: "toplanti_yapildi", label: "Toplanti Yapildi", color: "bg-indigo-500" },
            { key: "teklif_asamasi", label: "Teklif Asamasi", color: "bg-teal-500" },
            { key: "kapanis_basarili", label: "Kapanis (Basarili)", color: "bg-green-500" },
          ].map((step) => {
            const count = funnel[step.key] || 0;
            const maxCount = Math.max(...Object.values(funnel), 1);
            const width = Math.max((count / maxCount) * 100, 2);
            return (
              <div key={step.key} className="flex items-center gap-4">
                <span className="w-40 text-sm text-gray-600">{step.label}</span>
                <div className="flex-1">
                  <div
                    className={`h-8 rounded ${step.color} flex items-center px-3 transition-all`}
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
