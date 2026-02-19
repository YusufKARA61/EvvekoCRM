from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class FranchiseOfficeResponse(BaseModel):
    id: int
    name: str
    code: str
    il: str
    ilce: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    territory_ilceler: list = []
    is_active: bool
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    manager_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FranchiseOfficeCreateRequest(BaseModel):
    name: str
    code: str
    il: str
    ilce: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    territory_ilceler: list = []
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    manager_id: Optional[int] = None


class FranchiseOfficeUpdateRequest(BaseModel):
    name: Optional[str] = None
    il: Optional[str] = None
    ilce: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    territory_ilceler: Optional[list] = None
    is_active: Optional[bool] = None
    contract_start_date: Optional[date] = None
    contract_end_date: Optional[date] = None
    manager_id: Optional[int] = None
