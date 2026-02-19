from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CRMMeetingReport(Base):
    __tablename__ = "crm_meeting_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    appointment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_appointments.id", ondelete="CASCADE"), nullable=False
    )
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_leads.id"), nullable=False
    )
    franchise_office_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id"), nullable=False
    )
    submitted_by_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id"), nullable=False
    )

    # Rapor icerigi
    meeting_type: Mapped[Optional[str]] = mapped_column(String(30))
    katilimcilar: Mapped[dict] = mapped_column(JSONB, server_default="[]")
    katilimci_sayisi: Mapped[Optional[int]] = mapped_column(Integer)

    # Karar durumu
    karar_durumu: Mapped[Optional[str]] = mapped_column(String(30))
    sonraki_adimlar: Mapped[Optional[str]] = mapped_column(Text)
    sunum_yapildi: Mapped[bool] = mapped_column(Boolean, default=False)

    # Saha ziyareti
    saha_ziyareti_yapildi: Mapped[bool] = mapped_column(Boolean, default=False)
    bina_durumu: Mapped[Optional[str]] = mapped_column(String(30))
    bina_verileri: Mapped[Optional[dict]] = mapped_column(JSONB)

    # Medya
    fotograflar: Mapped[dict] = mapped_column(JSONB, server_default="[]")
    videolar: Mapped[dict] = mapped_column(JSONB, server_default="[]")
    belgeler: Mapped[dict] = mapped_column(JSONB, server_default="[]")

    # Zamanlama
    rapor_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    gec_mi: Mapped[bool] = mapped_column(Boolean, default=False)
    tamlik_puani: Mapped[int] = mapped_column(Integer, default=0)

    # Notlar
    ozet: Mapped[str] = mapped_column(Text, nullable=False)
    dahili_notlar: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    appointment = relationship("CRMAppointment", back_populates="report")
    lead = relationship("CRMLead", lazy="selectin")
    franchise_office = relationship("FranchiseOffice", lazy="selectin")
    submitted_by = relationship("CRMUser", lazy="selectin")
