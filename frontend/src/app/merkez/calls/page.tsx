"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";

interface CallLog {
  id: number;
  lead_id: number;
  caller_id: number;
  call_type: string;
  call_direction: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  result_code: string;
  lead_sinif_cikti: string | null;
  notes: string | null;
  created_at: string;
}

interface Lead {
  id: number;
  customer_name: string | null;
  customer_phone: string | null;
  ilce: string;
  status: string;
  ilk_arama_deadline: string | null;
}

const RESULT_LABELS: Record<string, string> = {
  baglanti_kuruldu: "Baglanti Kuruldu",
  ulasilamadi: "Ulasilamadi",
  mesgul: "Mesgul",
  yanlis_numara: "Yanlis Numara",
  reddetti: "Reddetti",
};

const CALL_TYPE_LABELS: Record<string, string> = {
  ilk_arama: "Ilk Arama",
  takip: "Takip",
  memnuniyet: "Memnuniyet",
  bilgilendirme: "Bilgilendirme",
};

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [pendingLeads, setPendingLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [callsRes, leadsRes] = await Promise.all([
          api.get("/calls"),
          api.get("/leads", { params: { status: "talep_geldi", limit: 20 } }),
        ]);
        setCalls(callsRes.data);
        setPendingLeads(leadsRes.data.items || []);
      } catch (err) {
        console.error("Veri hatasi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cagri Merkezi</h1>
        <p className="text-gray-500">Arama kuyrugu ve gecmis aramalar</p>
      </div>

      {/* Bekleyen Leadler - Arama Kuyrugu */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Arama Kuyrugu ({pendingLeads.length})
        </h3>
        {pendingLeads.length === 0 ? (
          <p className="text-sm text-gray-500">Bekleyen arama yok</p>
        ) : (
          <div className="space-y-3">
            {pendingLeads.map((lead) => {
              const deadline = lead.ilk_arama_deadline
                ? new Date(lead.ilk_arama_deadline)
                : null;
              const now = new Date();
              const isOverdue = deadline && deadline < now;
              const minutesLeft = deadline
                ? Math.round((deadline.getTime() - now.getTime()) / 60000)
                : null;

              return (
                <div
                  key={lead.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    isOverdue
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        {lead.customer_name || "Isim Belirtilmemis"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {lead.customer_phone}
                      </span>
                      <span className="text-sm text-gray-400">{lead.ilce}</span>
                    </div>
                    {deadline && (
                      <p
                        className={`mt-1 text-xs ${
                          isOverdue ? "font-semibold text-red-600" : "text-orange-500"
                        }`}
                      >
                        {isOverdue
                          ? `SLA asildi! (${Math.abs(minutesLeft!)} dk gecikme)`
                          : `SLA: ${minutesLeft} dk kaldi`}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/merkez/leads/${lead.id}`}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                  >
                    Aramayi Baslat
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gecmis Aramalar */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Gecmis Aramalar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Lead ID</th>
                <th className="px-6 py-3">Tur</th>
                <th className="px-6 py-3">Sonuc</th>
                <th className="px-6 py-3">Sinif</th>
                <th className="px-6 py-3">Sure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Henuz arama yapilmamis
                  </td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {new Date(call.started_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-3">
                      <a
                        href={`/merkez/leads/${call.lead_id}`}
                        className="text-sm font-medium text-primary-600 hover:underline"
                      >
                        #{call.lead_id}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {CALL_TYPE_LABELS[call.call_type] || call.call_type}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {RESULT_LABELS[call.result_code] || call.result_code}
                    </td>
                    <td className="px-6 py-3">
                      {call.lead_sinif_cikti && (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            call.lead_sinif_cikti === "A"
                              ? "bg-green-100 text-green-700"
                              : call.lead_sinif_cikti === "B"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {call.lead_sinif_cikti}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {call.duration_seconds
                        ? `${Math.floor(call.duration_seconds / 60)}:${String(
                            call.duration_seconds % 60
                          ).padStart(2, "0")}`
                        : "-"}
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
