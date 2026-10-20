import enum

from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class InvoiceType(str, enum.Enum):
    gst_service = "gst_service"
    retail_pos = "retail_pos"
    recurring = "recurring"
    international = "international"
    estimate = "estimate"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    partially_paid = "partially_paid"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"


class Invoice(TenantScopedMixin, Base):
    __tablename__ = "invoices"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=True)

    invoice_number = Column(String, nullable=False)   # unique per company, generated server-side
    invoice_type = Column(Enum(InvoiceType), nullable=False, default=InvoiceType.gst_service)
    status = Column(Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.draft)

    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)

    currency = Column(String, nullable=False, default="INR")
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    cgst_total = Column(Numeric(14, 2), nullable=False, default=0)
    sgst_total = Column(Numeric(14, 2), nullable=False, default=0)
    igst_total = Column(Numeric(14, 2), nullable=False, default=0)
    grand_total = Column(Numeric(14, 2), nullable=False, default=0)
    amount_paid = Column(Numeric(14, 2), nullable=False, default=0)

    # Phase 2+: recurring billing schedule, stored as plain fields for now
    recurrence_rule = Column(String, nullable=True)   # e.g. "monthly", "weekly" — cron-style later
    notes = Column(Text, nullable=True)

    company = relationship("Company", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    line_items = relationship(
        "InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan"
    )


class InvoiceLineItem(TenantScopedMixin, Base):
    __tablename__ = "invoice_line_items"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)

    description = Column(String, nullable=False)
    hsn_sac_code = Column(String, nullable=True)
    quantity = Column(Numeric(12, 2), nullable=False, default=1)
    unit_price = Column(Numeric(14, 2), nullable=False, default=0)
    gst_rate = Column(Numeric(5, 2), nullable=False, default=0)
    line_total = Column(Numeric(14, 2), nullable=False, default=0)   # qty * unit_price, pre-tax

    invoice = relationship("Invoice", back_populates="line_items")
