"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { Lead } from "@/types";

export default function LeadDetailPage() {
  const params = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await api.get(`/leads/${params.id}`);
        setLead(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLead();
  }, [params.id]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Lead #{lead.id}
            </h1>
            <StatusBadge status={lead.status} />
            {lead.lead_sinif && (
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${
                  lead.lead_sinif === "A"
                    ? "bg-green-500"
                    : lead.lead_sinif === "B"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {lead.lead_sinif}
              </span>
            )}
          </div>
          <p className="mt-1 text-gray-500">
            {lead.source} - {formatDateTime(lead.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Musteri + Bina Bilgileri */}
        <div className="space-y-6 lg:col-span-2">
          {/* Musteri Bilgileri */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Musteri Bilgileri
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Ad Soyad</dt>
                <dd className="font-medium text-gray-900">
                  {lead.customer_name || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Telefon</dt>
                <dd className="font-medium text-gray-900">
                  {lead.customer_phone || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">
                  {lead.customer_email || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Karar Verici</dt>
                <dd className="font-medium text-gray-900">
                  {lead.karar_verici || "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Lokasyon */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Lokasyon & Bina
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Il / Ilce</dt>
                <dd className="font-medium text-gray-900">
                  {lead.il || "-"} / {lead.ilce}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Mahalle</dt>
                <dd className="font-medium text-gray-900">
                  {lead.mahalle || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Sokak / Kapi No</dt>
                <dd className="font-medium text-gray-900">
                  {lead.sokak || "-"} {lead.kapi_no || ""}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Ada / Parsel</dt>
                <dd className="font-medium text-gray-900">
                  {lead.ada || "-"} / {lead.parsel || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bina Alani</dt>
                <dd className="font-medium text-gray-900">
                  {lead.bina_alani ? `${lead.bina_alani} m2` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bagimsiz Bolum</dt>
                <dd className="font-medium text-gray-900">
                  {lead.bagimsiz_bolum_sayisi || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bina Yasi</dt>
                <dd className="font-medium text-gray-900">
                  {lead.bina_yasi ? `${lead.bina_yasi} yil` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Riskli Yapi</dt>
                <dd className="font-medium text-gray-900">
                  {lead.riskli_yapi_durumu || "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notlar */}
          {lead.ek_notlar && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Notlar</h3>
              <p className="text-gray-700">{lead.ek_notlar}</p>
            </div>
          )}
        </div>

        {/* Sag: Durum + SLA + Atama */}
        <div className="space-y-6">
          {/* Durum */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Durum</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Pipeline</span>
                <div className="mt-1">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Uygunluk Skoru</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${lead.toplanti_uygunluk_skoru}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {lead.toplanti_uygunluk_skoru}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">WhatsApp Grubu</span>
                <p className="mt-1 font-medium text-gray-900">
                  {lead.whatsapp_grubu_var === true
                    ? "Var"
                    : lead.whatsapp_grubu_var === false
                    ? "Yok"
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Niyet</span>
                <p className="mt-1 font-medium text-gray-900">
                  {lead.niyet || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* SLA */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">SLA</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Ilk Arama Deadline</span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {lead.ilk_arama_deadline
                    ? formatDateTime(lead.ilk_arama_deadline)
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Ilk Arama Yapildi</span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {lead.ilk_arama_yapildi_at
                    ? formatDateTime(lead.ilk_arama_yapildi_at)
                    : "Henuz aranmadi"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
