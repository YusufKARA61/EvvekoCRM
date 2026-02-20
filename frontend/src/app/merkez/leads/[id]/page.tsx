"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime, STATUS_LABELS } from "@/lib/utils";
import type { Lead, FranchiseOffice } from "@/types";

interface CallLog {
  id: number;
  call_type: string;
  result_code: string;
  lead_sinif_cikti: string | null;
  notes: string | null;
  started_at: string;
  duration_seconds: number | null;
}

const RESULT_LABELS: Record<string, string> = {
  baglanti_kuruldu: "Baglanti Kuruldu",
  ulasilamadi: "Ulasilamadi",
  mesgul: "Mesgul",
  yanlis_numara: "Yanlis Numara",
  reddetti: "Reddetti",
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [franchises, setFranchises] = useState<FranchiseOffice[]>([]);
  const [loading, setLoading] = useState(true);

  // Arama formu
  const [showCallForm, setShowCallForm] = useState(false);
  const [callResult, setCallResult] = useState("baglanti_kuruldu");
  const [callNotes, setCallNotes] = useState("");
  const [leadSinif, setLeadSinif] = useState("");
  const [callSaving, setCallSaving] = useState(false);

  // Bayiye yonlendirme
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<number | "">("");
  const [assignSaving, setAssignSaving] = useState(false);

  // Durum degistirme
  const [statusSaving, setStatusSaving] = useState(false);

  async function fetchData() {
    try {
      const [leadRes, callsRes, franchiseRes] = await Promise.all([
        api.get(`/leads/${params.id}`),
        api.get("/calls", { params: { lead_id: params.id } }),
        api.get("/franchise"),
      ]);
      setLead(leadRes.data);
      setCalls(callsRes.data);
      setFranchises(franchiseRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Arama kaydet
  async function handleSaveCall() {
    if (!lead) return;
    setCallSaving(true);
    try {
      await api.post("/calls", {
        lead_id: lead.id,
        call_type: "ilk_arama",
        call_direction: "outbound",
        started_at: new Date().toISOString(),
        result_code: callResult,
        lead_sinif_cikti: leadSinif || null,
        notes: callNotes || null,
      });
      setShowCallForm(false);
      setCallNotes("");
      setLeadSinif("");
      await fetchData();
    } catch (err) {
      console.error("Arama kayit hatasi:", err);
      alert("Arama kaydedilemedi");
    } finally {
      setCallSaving(false);
    }
  }

  // Bayiye yonlendir
  async function handleAssignFranchise() {
    if (!lead || !selectedFranchise) return;
    setAssignSaving(true);
    try {
      await api.put(`/leads/${lead.id}`, {
        assigned_franchise_id: selectedFranchise,
        status: "toplanti_planlandi",
      });
      setShowAssignForm(false);
      setSelectedFranchise("");
      await fetchData();
    } catch (err) {
      console.error("Atama hatasi:", err);
      alert("Bayiye yonlendirilemedi");
    } finally {
      setAssignSaving(false);
    }
  }

  // Durum degistir
  async function handleStatusChange(newStatus: string) {
    if (!lead) return;
    setStatusSaving(true);
    try {
      await api.post(`/leads/${lead.id}/status`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error("Durum degistirme hatasi:", err);
      alert("Durum degistirilemedi");
    } finally {
      setStatusSaving(false);
    }
  }

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const deadline = lead.ilk_arama_deadline ? new Date(lead.ilk_arama_deadline) : null;
  const isOverdue = deadline && deadline < new Date() && !lead.ilk_arama_yapildi_at;
  const canCall = ["talep_geldi", "besleme"].includes(lead.status);
  const canAssign = ["merkez_arandi", "besleme"].includes(lead.status);
  const canCancel = !["kapanis_basarili", "kapanis_basarisiz", "iptal", "sahte_bos"].includes(lead.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{lead.customer_name || `Lead #${lead.id}`}</h1>
            <StatusBadge status={lead.status} />
            {lead.lead_sinif && (
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${lead.lead_sinif === "A" ? "bg-green-500" : lead.lead_sinif === "B" ? "bg-yellow-500" : "bg-red-500"}`}>
                {lead.lead_sinif}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {lead.customer_phone || "Telefon yok"} &middot; {lead.ilce?.trim()} &middot; {formatDateTime(lead.created_at)}
          </p>
        </div>
        {isOverdue && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2">
            <p className="text-sm font-semibold text-red-700">SLA Asildi!</p>
            <p className="text-xs text-red-500">Deadline: {formatDateTime(lead.ilk_arama_deadline!)}</p>
          </div>
        )}
      </div>

      {/* Aksiyon Butonlari */}
      <div className="flex flex-wrap gap-3">
        {canCall && (
          <button onClick={() => { setShowCallForm(!showCallForm); setShowAssignForm(false); }} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Aramayi Kaydet
          </button>
        )}
        {canAssign && (
          <button onClick={() => { setShowAssignForm(!showAssignForm); setShowCallForm(false); }} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Bayiye Yonlendir
          </button>
        )}
        {lead.status === "talep_geldi" && (
          <button onClick={() => handleStatusChange("besleme")} disabled={statusSaving} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50">
            Beslemeye Al
          </button>
        )}
        {canCancel && (
          <>
            <button onClick={() => handleStatusChange("iptal")} disabled={statusSaving} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50">
              Iptal Et
            </button>
            <button onClick={() => handleStatusChange("sahte_bos")} disabled={statusSaving} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:opacity-50">
              Sahte/Bos
            </button>
          </>
        )}
      </div>

      {/* Arama Formu */}
      {showCallForm && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Arama Sonucu Kaydet</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Arama Sonucu</label>
              <select value={callResult} onChange={(e) => setCallResult(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="baglanti_kuruldu">Baglanti Kuruldu</option>
                <option value="ulasilamadi">Ulasilamadi</option>
                <option value="mesgul">Mesgul</option>
                <option value="yanlis_numara">Yanlis Numara</option>
                <option value="reddetti">Reddetti</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Lead Sinifi</label>
              <select value={leadSinif} onChange={(e) => setLeadSinif(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">Siniflandirma Yap</option>
                <option value="A">A - Sicak (Toplantiya Uygun)</option>
                <option value="B">B - Ilik (Besleme Gerekli)</option>
                <option value="C">C - Soguk (Dusuk Potansiyel)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Notlar</label>
              <textarea value={callNotes} onChange={(e) => setCallNotes(e.target.value)} rows={3} placeholder="Arama ile ilgili notlar..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleSaveCall} disabled={callSaving} className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50">
              {callSaving ? "Kaydediliyor..." : "Aramayi Kaydet"}
            </button>
            <button onClick={() => setShowCallForm(false)} className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Vazgec
            </button>
          </div>
        </div>
      )}

      {/* Bayiye Yonlendirme Formu */}
      {showAssignForm && (
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Bayiye Yonlendir</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Franchise Ofis</label>
            <select value={selectedFranchise} onChange={(e) => setSelectedFranchise(e.target.value ? Number(e.target.value) : "")} className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">Ofis Secin...</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.ilce})</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAssignFranchise} disabled={assignSaving || !selectedFranchise} className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50">
              {assignSaving ? "Yonlendiriliyor..." : "Yonlendir"}
            </button>
            <button onClick={() => setShowAssignForm(false)} className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              Vazgec
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol: Bilgiler + Arama Gecmisi */}
        <div className="space-y-6 lg:col-span-2">
          {/* Musteri Bilgileri */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Musteri Bilgileri</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Ad Soyad</dt>
                <dd className="font-medium text-gray-900">{lead.customer_name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Telefon</dt>
                <dd className="font-medium text-gray-900">
                  {lead.customer_phone ? (
                    <a href={`tel:${lead.customer_phone}`} className="text-primary-600 hover:underline">{lead.customer_phone}</a>
                  ) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{lead.customer_email || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Karar Verici</dt>
                <dd className="font-medium text-gray-900">{lead.karar_verici || "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Lokasyon + Bina */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Lokasyon & Bina</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Il / Ilce</dt>
                <dd className="font-medium text-gray-900">{lead.il || "-"} / {lead.ilce?.trim()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Mahalle</dt>
                <dd className="font-medium text-gray-900">{lead.mahalle?.trim() || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Sokak / Kapi No</dt>
                <dd className="font-medium text-gray-900">{lead.sokak || "-"} {lead.kapi_no || ""}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Ada / Parsel</dt>
                <dd className="font-medium text-gray-900">{lead.ada || "-"} / {lead.parsel || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bina Alani</dt>
                <dd className="font-medium text-gray-900">{lead.bina_alani ? `${lead.bina_alani} m²` : "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Bagimsiz Bolum</dt>
                <dd className="font-medium text-gray-900">{lead.bagimsiz_bolum_sayisi || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Donusum Tipi</dt>
                <dd className="font-medium text-gray-900">{lead.donusum_tipi || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Riskli Yapi</dt>
                <dd className="font-medium text-gray-900">{lead.riskli_yapi_durumu || "-"}</dd>
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

          {/* Arama Gecmisi */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Arama Gecmisi ({calls.length})</h3>
            </div>
            {calls.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">Henuz arama yapilmamis</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {calls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {RESULT_LABELS[call.result_code] || call.result_code}
                        {call.lead_sinif_cikti && (
                          <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${call.lead_sinif_cikti === "A" ? "bg-green-100 text-green-700" : call.lead_sinif_cikti === "B" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {call.lead_sinif_cikti}
                          </span>
                        )}
                      </p>
                      {call.notes && <p className="mt-0.5 text-xs text-gray-500">{call.notes}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{formatDateTime(call.started_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sag: Pipeline + Atama + SLA */}
        <div className="space-y-6">
          {/* Pipeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Pipeline</h3>
            <div className="space-y-2">
              {["talep_geldi", "merkez_arandi", "besleme", "toplanti_planlandi", "toplanti_yapildi", "teklif_asamasi", "kapanis_basarili"].map((s) => (
                <div key={s} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${lead.status === s ? "bg-primary-100 font-semibold text-primary-800 ring-2 ring-primary-500" : "text-gray-500"}`}>
                  <span className={`h-2 w-2 rounded-full ${lead.status === s ? "bg-primary-500" : "bg-gray-300"}`} />
                  {STATUS_LABELS[s] || s}
                </div>
              ))}
            </div>
          </div>

          {/* Atama */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Atama</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Franchise Ofis</span>
                <p className="mt-1 font-medium text-gray-900">
                  {lead.assigned_franchise_id ? franchises.find(f => f.id === lead.assigned_franchise_id)?.name || `#${lead.assigned_franchise_id}` : "Atanmadi"}
                </p>
              </div>
            </div>
          </div>

          {/* SLA */}
          <div className={`rounded-xl border p-6 ${isOverdue ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">SLA</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Ilk Arama Deadline</span>
                <p className={`mt-1 text-sm font-medium ${isOverdue ? "text-red-700" : "text-gray-900"}`}>
                  {lead.ilk_arama_deadline ? formatDateTime(lead.ilk_arama_deadline) : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Ilk Arama Yapildi</span>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {lead.ilk_arama_yapildi_at ? formatDateTime(lead.ilk_arama_yapildi_at) : "Henuz aranmadi"}
                </p>
              </div>
            </div>
          </div>

          {/* Diger Bilgiler */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Diger</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Sinif</span>
                <p className="mt-1 font-medium text-gray-900">{lead.lead_sinif || "Siniflandirilmadi"}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Uygunluk Skoru</span>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-primary-500" style={{ width: `${lead.toplanti_uygunluk_skoru}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{lead.toplanti_uygunluk_skoru}%</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Kaynak</span>
                <p className="mt-1 font-medium text-gray-900">{lead.source}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
