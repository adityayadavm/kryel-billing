from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class Customer(TenantScopedMixin, Base):
    __tablename__ = "customers"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    gstin = Column(String, nullable=True)
    billing_address = Column(String, nullable=True)
    shipping_address = Column(String, nullable=True)
    state = Column(String, nullable=True)        # used for CGST+SGST vs IGST determination
    country = Column(String, nullable=False, default="IN")
    currency = Column(String, nullable=False, default="INR")  # non-INR => international invoice

    company = relationship("Company", back_populates="customers")
    invoices = relationship("Invoice", back_populates="customer")
