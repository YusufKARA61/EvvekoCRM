from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CRMRevenueEvent(Base):
    __tablename__ = "crm_revenue_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    franchise_office_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id"), nullable=False
    )
    lead_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_leads.id")
    )
    appointment_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_appointments.id")
    )

    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="beklemede")

    approved_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_users.id")
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    franchise_office = relationship("FranchiseOffice", lazy="selectin")
    lead = relationship("CRMLead", lazy="selectin")
    approved_by = relationship("CRMUser", lazy="selectin")


class CRMRevenueRate(Base):
    __tablename__ = "crm_revenue_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
