from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MeetingReportResponse(BaseModel):
    id: int
    appointment_id: int
    lead_id: int
    franchise_office_id: int
    submitted_by_id: int
    meeting_type: Optional[str] = None
    katilimcilar: list = []
    katilimci_sayisi: Optional[int] = None
    karar_durumu: Optional[str] = None
    sonraki_adimlar: Optional[str] = None
    sunum_yapildi: bool = False
    saha_ziyareti_yapildi: bool = False
    bina_durumu: Optional[str] = None
    bina_verileri: Optional[dict] = None
    fotograflar: list = []
    videolar: list = []
    belgeler: list = []
    rapor_deadline: Optional[datetime] = None
    submitted_at: datetime
    gec_mi: bool = False
    tamlik_puani: int = 0
    ozet: str
    dahili_notlar: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingReportCreateRequest(BaseModel):
    appointment_id: int
    meeting_type: Optional[str] = None
    katilimcilar: list = []
    katilimci_sayisi: Optional[int] = None
    karar_durumu: Optional[str] = None
    sonraki_adimlar: Optional[str] = None
    sunum_yapildi: bool = False
    saha_ziyareti_yapildi: bool = False
    bina_durumu: Optional[str] = None
    bina_verileri: Optional[dict] = None
    ozet: str
    dahili_notlar: Optional[str] = None
