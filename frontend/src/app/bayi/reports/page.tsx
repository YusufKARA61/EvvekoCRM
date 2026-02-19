"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Report {
  id: number;
  appointment_id: number;
  lead_id: number;
  meeting_type: string | null;
  karar_durumu: string | null;
  katilimci_sayisi: number | null;
  tamlik_puani: number;
  gec_mi: boolean;
  ozet: string;
  submitted_at: string;
}

const KARAR_LABELS: Record<string, string> = {
  olumlu: "Olumlu",
  dusunuyor: "Dusunuyor",
  olumsuz: "Olumsuz",
};

const KARAR_COLORS: Record<string, string> = {
  olumlu: "bg-green-100 text-green-700",
  dusunuyor: "bg-yellow-100 text-yellow-700",
  olumsuz: "bg-red-100 text-red-700",
};

export default function BayiReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reports")
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Rapor hatasi:", err))
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Raporlarim</h1>
        <p className="text-gray-500">Toplanti raporlarini goruntule ve olustur</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Lead</th>
                <th className="px-6 py-3">Tur</th>
                <th className="px-6 py-3">Karar</th>
                <th className="px-6 py-3">Katilimci</th>
                <th className="px-6 py-3">Tamlik</th>
                <th className="px-6 py-3">Ozet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-500">Henuz rapor girilmemis</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tamamlanan randevular icin rapor girebilirsiniz
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {new Date(report.submitted_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-3 text-sm text-primary-600">#{report.lead_id}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {report.meeting_type || "-"}
                    </td>
                    <td className="px-6 py-3">
                      {report.karar_durumu && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KARAR_COLORS[report.karar_durumu] || "bg-gray-100 text-gray-700"}`}>
                          {KARAR_LABELS[report.karar_durumu] || report.karar_durumu}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {report.katilimci_sayisi || "-"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${
                              report.tamlik_puani >= 80
                                ? "bg-green-500"
                                : report.tamlik_puani >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${report.tamlik_puani}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">%{report.tamlik_puani}</span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-6 py-3 text-sm text-gray-500">
                      {report.ozet}
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
