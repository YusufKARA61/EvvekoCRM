"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { Lead, PaginatedResponse } from "@/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get<PaginatedResponse<Lead>>("/leads", { params });
      setLeads(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const statuses = [
    "", "talep_geldi", "merkez_arandi", "besleme", "toplanti_planlandi",
    "toplanti_yapildi", "takip_aramasi", "teklif_asamasi",
    "kapanis_basarili", "kapanis_basarisiz",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leadler</h1>
          <p className="text-gray-500">{total} lead bulundu</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Isim, telefon, ilce ara..."
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Ara
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="">Tum Durumlar</option>
          {statuses.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Musteri</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Lokasyon</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kaynak</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Sinif</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Yukleniyor...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Lead bulunamadi
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">#{lead.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/merkez/leads/${lead.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-800"
                    >
                      {lead.customer_name || "Isimsiz"}
                    </Link>
                    {lead.customer_phone && (
                      <p className="text-xs text-gray-500">{lead.customer_phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lead.ilce}
                    {lead.mahalle && ` / ${lead.mahalle}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.lead_sinif ? (
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                          lead.lead_sinif === "A"
                            ? "bg-green-500"
                            : lead.lead_sinif === "B"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {lead.lead_sinif}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDateTime(lead.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Onceki
            </button>
            <span className="text-sm text-gray-500">
              Sayfa {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
