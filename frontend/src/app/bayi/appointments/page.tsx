"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Appointment {
  id: number;
  lead_id: number;
  scheduled_date: string;
  scheduled_time: string;
  location_type: string;
  location_address: string | null;
  status: string;
  confirmation_deadline: string | null;
  confirmed_at: string | null;
  notes: string | null;
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

export default function BayiAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Randevu hatasi:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/appointments/${id}/confirm`, {});
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "onaylandi" } : a))
      );
    } catch (err) {
      console.error("Onay hatasi:", err);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.post(`/appointments/${id}/complete`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "tamamlandi" } : a))
      );
    } catch (err) {
      console.error("Tamamlama hatasi:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const pendingConfirm = appointments.filter((a) => a.status === "beklemede");
  const upcoming = appointments.filter((a) => a.status === "onaylandi");
  const past = appointments.filter((a) => !["beklemede", "onaylandi"].includes(a.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Randevularim</h1>
        <p className="text-gray-500">Randevulari onayla ve yonet</p>
      </div>

      {/* Onay Bekleyen */}
      {pendingConfirm.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-orange-700">
            Onay Bekleyen ({pendingConfirm.length})
          </h3>
          <div className="space-y-3">
            {pendingConfirm.map((apt) => {
              const deadline = apt.confirmation_deadline
                ? new Date(apt.confirmation_deadline)
                : null;
              const minutesLeft = deadline
                ? Math.round((deadline.getTime() - Date.now()) / 60000)
                : null;

              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {apt.scheduled_date} - {apt.scheduled_time}
                    </p>
                    <p className="text-sm text-gray-500">
                      Lead #{apt.lead_id} |{" "}
                      {apt.location_type === "ofis" ? "Ofis" : apt.location_type === "saha" ? "Saha" : "Online"}
                    </p>
                    {minutesLeft !== null && minutesLeft > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Onay icin {minutesLeft} dk kaldi
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleConfirm(apt.id)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Onayla
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yaklasan Randevular */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Yaklasan Randevular ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">Yaklasan randevu yok</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {apt.scheduled_date} - {apt.scheduled_time}
                  </p>
                  <p className="text-sm text-gray-500">Lead #{apt.lead_id}</p>
                </div>
                <button
                  onClick={() => handleComplete(apt.id)}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  Tamamlandi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gecmis */}
      {past.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Gecmis ({past.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {past.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {apt.scheduled_date} - {apt.scheduled_time}
                  </p>
                  <p className="text-xs text-gray-500">Lead #{apt.lead_id}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[apt.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABELS[apt.status] || apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
