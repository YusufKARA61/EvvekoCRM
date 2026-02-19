import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  talep_geldi: "Talep Geldi",
  merkez_arandi: "Merkez Arandi",
  besleme: "Besleme",
  toplanti_planlandi: "Toplanti Planlandi",
  toplanti_yapildi: "Toplanti Yapildi",
  takip_aramasi: "Takip Aramasi",
  teklif_asamasi: "Teklif Asamasi",
  kapanis_basarili: "Kapanis (Basarili)",
  kapanis_basarisiz: "Kapanis (Basarisiz)",
  iptal: "Iptal",
  sahte_bos: "Sahte/Bos",
};

export const STATUS_COLORS: Record<string, string> = {
  talep_geldi: "bg-blue-100 text-blue-800",
  merkez_arandi: "bg-yellow-100 text-yellow-800",
  besleme: "bg-orange-100 text-orange-800",
  toplanti_planlandi: "bg-purple-100 text-purple-800",
  toplanti_yapildi: "bg-indigo-100 text-indigo-800",
  takip_aramasi: "bg-cyan-100 text-cyan-800",
  teklif_asamasi: "bg-teal-100 text-teal-800",
  kapanis_basarili: "bg-green-100 text-green-800",
  kapanis_basarisiz: "bg-red-100 text-red-800",
  iptal: "bg-gray-100 text-gray-800",
  sahte_bos: "bg-red-50 text-red-600",
};
