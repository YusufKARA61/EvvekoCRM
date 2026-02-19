from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel


class AppointmentResponse(BaseModel):
    id: int
    lead_id: int
    franchise_office_id: int
    scheduled_date: date
    scheduled_time: time
    scheduled_end_time: Optional[time] = None
    location_type: str
    location_address: Optional[str] = None
    created_by_id: int
    confirmation_deadline: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    confirmed_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    status: str
    cancel_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppointmentCreateRequest(BaseModel):
    lead_id: int
    franchise_office_id: int
    scheduled_date: date
    scheduled_time: time
    scheduled_end_time: Optional[time] = None
    location_type: str = "ofis"
    location_address: Optional[str] = None
    assigned_to_id: Optional[int] = None
    notes: Optional[str] = None


class AppointmentConfirmRequest(BaseModel):
    alternative_date: Optional[date] = None
    alternative_time: Optional[time] = None
    notes: Optional[str] = None
