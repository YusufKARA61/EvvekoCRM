"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Appointment {
  id: number;
  lead_id: number;
  franchise_office_id: number;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_end_time: string | null;
  location_type: string;
  location_address: string | null;
  status: string;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandi",
  tamamlandi: "Tamamlandi",
  gelmedi: "Gelmedi",
  iptal: "Iptal",
  ertelendi: "Ertelendi",
};

const STATUS_COLORS: Record<string, string> = {
  beklemede: "bg-yellow-100 text-yellow-700",
  onaylandi: "bg-blue-100 text-blue-700",
  tamamlandi: "bg-green-100 text-green-700",
  gelmedi: "bg-red-100 text-red-700",
  iptal: "bg-gray-100 text-gray-700",
  ertelendi: "bg-orange-100 text-orange-700",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const params: Record<string, string> = {};
        if (filter) params.status = filter;
        const res = await api.get("/appointments", { params });
        setAppointments(res.data);
      } catch (err) {
        console.error("Randevu veri hatasi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

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
          <h1 className="text-2xl font-bold text-gray-900">Randevular</h1>
          <p className="text-gray-500">Tum randevulari yonetin</p>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {["", "beklemede", "onaylandi", "tamamlandi", "gelmedi"].map((s) => (
          <button
            key={s}
            onClick={() => { setLoading(true); setFilter(s); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "" ? "Tumu" : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Saat</th>
                <th className="px-6 py-3">Lead</th>
                <th className="px-6 py-3">Ofis</th>
                <th className="px-6 py-3">Konum</th>
                <th className="px-6 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Randevu bulunamadi
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">#{apt.id}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{apt.scheduled_date}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{apt.scheduled_time}</td>
                    <td className="px-6 py-3">
                      <a href={`/merkez/leads/${apt.lead_id}`} className="text-sm text-primary-600 hover:underline">
                        #{apt.lead_id}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">Ofis #{apt.franchise_office_id}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {apt.location_type === "ofis" ? "Ofis" : apt.location_type === "saha" ? "Saha" : "Online"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[apt.status] || "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[apt.status] || apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
