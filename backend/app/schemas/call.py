from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CallLogResponse(BaseModel):
    id: int
    lead_id: int
    caller_id: int
    call_type: str
    call_direction: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    result_code: str
    script_data: Optional[dict] = None
    lead_sinif_cikti: Optional[str] = None
    toplanti_uygunluk_skoru: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CallLogCreateRequest(BaseModel):
    lead_id: int
    call_type: str
    call_direction: str = "outbound"
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    result_code: str
    script_data: Optional[dict] = None
    lead_sinif_cikti: Optional[str] = None
    toplanti_uygunluk_skoru: Optional[int] = None
    notes: Optional[str] = None
