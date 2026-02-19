from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CRMActivity(Base):
    __tablename__ = "crm_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_leads.id", ondelete="CASCADE")
    )
    franchise_office_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id")
    )
    actor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id"), nullable=False
    )

    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text)
    extra_data: Mapped[Optional[dict]] = mapped_column("metadata", JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    actor = relationship("CRMUser", lazy="selectin")
