from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class FranchiseOffice(Base, TimestampMixin):
    __tablename__ = "crm_franchise_offices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    # Lokasyon
    il: Mapped[str] = mapped_column(String(100), nullable=False)
    ilce: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8))

    # Iletisim
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(255))

    # Bolge
    territory_ilceler: Mapped[dict] = mapped_column(JSONB, server_default="[]")

    # Durum
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    contract_start_date: Mapped[Optional[date]] = mapped_column(Date)
    contract_end_date: Mapped[Optional[date]] = mapped_column(Date)

    # Yonetici
    manager_id: Mapped[Optional[int]] = mapped_column(Integer)
