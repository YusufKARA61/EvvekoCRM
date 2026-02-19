from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class RoleResponse(BaseModel):
    id: int
    name: str
    display_name: str

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    franchise_office_id: Optional[int] = None
    roles: list[RoleResponse] = []
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    franchise_office_id: Optional[int] = None
    role_ids: list[int] = []


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    franchise_office_id: Optional[int] = None
    role_ids: Optional[list[int]] = None
