from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.base import TimestampMixin


class CRMRole(Base):
    __tablename__ = "crm_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500))
    permissions: Mapped[dict] = mapped_column(JSONB, server_default="[]")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    users: Mapped[list["CRMUser"]] = relationship(
        "CRMUser", secondary="crm_user_roles", back_populates="roles"
    )


class CRMUserRole(Base):
    __tablename__ = "crm_user_roles"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("crm_roles.id", ondelete="CASCADE"), primary_key=True
    )


class CRMUser(Base, TimestampMixin):
    __tablename__ = "crm_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    franchise_office_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("crm_franchise_offices.id", ondelete="SET NULL")
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    roles: Mapped[list["CRMRole"]] = relationship(
        "CRMRole", secondary="crm_user_roles", back_populates="users", lazy="selectin"
    )
    franchise_office: Mapped[Optional["FranchiseOffice"]] = relationship(
        "FranchiseOffice", foreign_keys=[franchise_office_id], lazy="selectin"
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def role_names(self) -> list[str]:
        return [role.name for role in self.roles]

    @property
    def is_merkez(self) -> bool:
        return any(r.name.startswith("merkez_") for r in self.roles)

    @property
    def is_franchise(self) -> bool:
        return any(r.name.startswith("franchise_") for r in self.roles)


# Avoid circular import
from app.models.franchise import FranchiseOffice  # noqa: E402
