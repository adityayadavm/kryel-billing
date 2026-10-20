from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class Company(TenantScopedMixin, Base):
    """
    The tenant itself. One row per business using KRYEL Billing —
    whether hosted (many rows, one DB) or self-hosted (usually just one row).
    """
    __tablename__ = "companies"

    name = Column(String, nullable=False)
    legal_name = Column(String, nullable=True)
    gstin = Column(String, nullable=True)          # GST Identification Number
    pan = Column(String, nullable=True)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    country = Column(String, nullable=False, default="IN")
    default_currency = Column(String, nullable=False, default="INR")
    logo_url = Column(String, nullable=True)
    is_self_hosted = Column(Boolean, nullable=False, default=False)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="company", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="company", cascade="all, delete-orphan")
