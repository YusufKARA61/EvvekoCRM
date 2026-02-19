from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LeadResponse(BaseModel):
    id: int
    yevveko_talep_id: Optional[int] = None
    source: str
    source_detail: Optional[str] = None

    # Musteri
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None

    # Lokasyon
    il: Optional[str] = None
    ilce: str
    mahalle: Optional[str] = None
    sokak: Optional[str] = None
    kapi_no: Optional[str] = None
    ada: Optional[str] = None
    parsel: Optional[str] = None

    # Bina
    bina_alani: Optional[float] = None
    bagimsiz_bolum_sayisi: Optional[int] = None
    bina_yasi: Optional[int] = None
    riskli_yapi_durumu: Optional[str] = None
    donusum_tipi: Optional[str] = None

    # Script verileri
    karar_verici: Optional[str] = None
    karar_verici_tipi: Optional[str] = None
    whatsapp_grubu_var: Optional[bool] = None
    toplanti_yapilabilir: Optional[bool] = None
    niyet: Optional[str] = None
    ek_notlar: Optional[str] = None

    # Siniflandirma
    lead_sinif: Optional[str] = None
    toplanti_uygunluk_skoru: int = 0

    # Durum
    status: str
    sub_status: Optional[str] = None

    # Atama
    assigned_franchise_id: Optional[int] = None
    assigned_agent_id: Optional[int] = None

    # SLA
    ilk_arama_deadline: Optional[datetime] = None
    ilk_arama_yapildi_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class LeadCreateRequest(BaseModel):
    source: str = "manual"
    source_detail: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    il: Optional[str] = None
    ilce: str
    mahalle: Optional[str] = None
    sokak: Optional[str] = None
    kapi_no: Optional[str] = None
    ada: Optional[str] = None
    parsel: Optional[str] = None
    bina_alani: Optional[float] = None
    bagimsiz_bolum_sayisi: Optional[int] = None
    bina_yasi: Optional[int] = None
    riskli_yapi_durumu: Optional[str] = None
    donusum_tipi: Optional[str] = None
    ek_notlar: Optional[str] = None


class LeadUpdateRequest(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    il: Optional[str] = None
    ilce: Optional[str] = None
    mahalle: Optional[str] = None
    sokak: Optional[str] = None
    kapi_no: Optional[str] = None
    bina_yasi: Optional[int] = None
    riskli_yapi_durumu: Optional[str] = None
    karar_verici: Optional[str] = None
    karar_verici_tipi: Optional[str] = None
    whatsapp_grubu_var: Optional[bool] = None
    toplanti_yapilabilir: Optional[bool] = None
    niyet: Optional[str] = None
    ek_notlar: Optional[str] = None
    lead_sinif: Optional[str] = None
    toplanti_uygunluk_skoru: Optional[int] = None
    status: Optional[str] = None
    sub_status: Optional[str] = None
    assigned_franchise_id: Optional[int] = None
    assigned_agent_id: Optional[int] = None


class LeadStatusUpdate(BaseModel):
    status: str
    sub_status: Optional[str] = None
    note: Optional[str] = None
