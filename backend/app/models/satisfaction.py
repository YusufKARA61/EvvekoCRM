from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CRMSatisfactionCall(Base):
    __tablename__ = "crm_satisfaction_calls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_leads.id"), nullable=False
    )
    appointment_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_appointments.id")
    )
    caller_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id"), nullable=False
    )

    # Puanlar (1-5)
    genel_puan: Mapped[Optional[int]] = mapped_column(Integer)
    profesyonellik_puani: Mapped[Optional[int]] = mapped_column(Integer)
    bilgi_netlik_puani: Mapped[Optional[int]] = mapped_column(Integer)

    # Sonraki aksiyon
    sonraki_aksiyon: Mapped[Optional[str]] = mapped_column(String(50))

    notes: Mapped[Optional[str]] = mapped_column(Text)
    called_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    lead = relationship("CRMLead", lazy="selectin")
    appointment = relationship("CRMAppointment", lazy="selectin")
    caller = relationship("CRMUser", lazy="selectin")
