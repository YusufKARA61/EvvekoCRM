from pydantic import BaseModel


class DashboardStats(BaseModel):
    toplam_lead: int = 0
    bugunun_leadleri: int = 0
    bekleyen_aramalar: int = 0
    sla_ihlali: int = 0
    bugunun_randevulari: int = 0
    bekleyen_raporlar: int = 0
    toplantiya_donusum_orani: float = 0.0
    aylik_kapanis: int = 0


class FranchiseDashboardStats(BaseModel):
    bekleyen_randevular: int = 0
    onay_bekleyen: int = 0
    teslim_edilecek_raporlar: int = 0
    bu_ayki_toplanti: int = 0
    bu_ayki_hakedis: float = 0.0
    memnuniyet_ortalama: float = 0.0


class FunnelData(BaseModel):
    talep_geldi: int = 0
    merkez_arandi: int = 0
    toplanti_planlandi: int = 0
    toplanti_yapildi: int = 0
    teklif_asamasi: int = 0
    kapanis_basarili: int = 0
