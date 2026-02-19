from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class CRMAppointment(Base, TimestampMixin):
    __tablename__ = "crm_appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_leads.id", ondelete="CASCADE"), nullable=False
    )
    franchise_office_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id"), nullable=False
    )

    # Zamanlama
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    scheduled_end_time: Mapped[Optional[time]] = mapped_column(Time)
    location_type: Mapped[str] = mapped_column(String(30), default="ofis")
    location_address: Mapped[Optional[str]] = mapped_column(Text)

    # Olusturan
    created_by_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id"), nullable=False
    )

    # Ofis onay penceresi (2 saat)
    confirmation_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    confirmed_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_users.id")
    )

    # Saha ekibi atamasi
    assigned_to_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_users.id")
    )

    # Durum
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="beklemede")
    cancel_reason: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    lead = relationship("CRMLead", back_populates="appointments")
    franchise_office = relationship("FranchiseOffice", lazy="selectin")
    created_by = relationship(
        "CRMUser", foreign_keys=[created_by_id], lazy="selectin"
    )
    confirmed_by = relationship(
        "CRMUser", foreign_keys=[confirmed_by_id], lazy="selectin"
    )
    assigned_to = relationship(
        "CRMUser", foreign_keys=[assigned_to_id], lazy="selectin"
    )
    report = relationship("CRMMeetingReport", back_populates="appointment", uselist=False)
