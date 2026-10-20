import enum

from sqlalchemy import Column, String, ForeignKey, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class UserRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    staff = "staff"


class User(TenantScopedMixin, Base):
    __tablename__ = "users"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.staff)
    is_active = Column(Boolean, nullable=False, default=True)
    email_verified = Column(Boolean, nullable=False, default=False)

    company = relationship("Company", back_populates="users")

    __table_args__ = ()
