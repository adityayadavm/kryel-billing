from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.invoice import InvoiceType, InvoiceStatus


class LineItemIn(BaseModel):
    product_id: UUID | None = None
    description: str
    hsn_sac_code: str | None = None
    quantity: Decimal = Decimal("1")
    unit_price: Decimal
    gst_rate: Decimal = Decimal("0")


class LineItemOut(LineItemIn):
    id: UUID
    line_total: Decimal

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    customer_id: UUID
    invoice_type: InvoiceType = InvoiceType.gst_service
    issue_date: date
    due_date: date | None = None
    currency: str = "INR"
    notes: str | None = None
    line_items: list[LineItemIn]


class InvoiceOut(BaseModel):
    id: UUID
    invoice_number: str
    invoice_type: InvoiceType
    status: InvoiceStatus
    issue_date: date
    due_date: date | None
    currency: str
    subtotal: Decimal
    cgst_total: Decimal
    sgst_total: Decimal
    igst_total: Decimal
    grand_total: Decimal
    amount_paid: Decimal
    line_items: list[LineItemOut]

    class Config:
        from_attributes = True
