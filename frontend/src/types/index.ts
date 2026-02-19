export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  franchise_office_id: number | null;
  roles: Role[];
  created_at: string;
  last_login_at: string | null;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
}

export interface Lead {
  id: number;
  yevveko_talep_id: number | null;
  source: string;
  source_detail: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  il: string | null;
  ilce: string;
  mahalle: string | null;
  sokak: string | null;
  kapi_no: string | null;
  ada: string | null;
  parsel: string | null;
  bina_alani: number | null;
  bagimsiz_bolum_sayisi: number | null;
  bina_yasi: number | null;
  riskli_yapi_durumu: string | null;
  donusum_tipi: string | null;
  karar_verici: string | null;
  whatsapp_grubu_var: boolean | null;
  niyet: string | null;
  lead_sinif: string | null;
  toplanti_uygunluk_skoru: number;
  status: string;
  sub_status: string | null;
  assigned_franchise_id: number | null;
  assigned_agent_id: number | null;
  ilk_arama_deadline: string | null;
  ilk_arama_yapildi_at: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface FranchiseOffice {
  id: number;
  name: string;
  code: string;
  il: string;
  ilce: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  territory_ilceler: string[];
  is_active: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  manager_id: number | null;
  created_at: string;
}

export interface Appointment {
  id: number;
  lead_id: number;
  franchise_office_id: number;
  scheduled_date: string;
  scheduled_time: string;
  location_type: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  toplam_lead: number;
  bugunun_leadleri: number;
  bekleyen_aramalar: number;
  sla_ihlali: number;
  bugunun_randevulari: number;
  bekleyen_raporlar: number;
  toplantiya_donusum_orani: number;
  aylik_kapanis: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
