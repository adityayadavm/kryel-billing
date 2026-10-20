from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_company
from app.core.gst import compute_invoice_totals
from app.database import get_db
from app.models import Company, Customer, Invoice, InvoiceLineItem
from app.schemas.invoice import InvoiceCreate, InvoiceOut

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _next_invoice_number(db: Session, company_id: UUID) -> str:
    """
    Simple per-company sequential numbering: KRYEL-2026-000123.
    Good enough for Phase 1; swap for a configurable prefix/format later.
    """
    count = db.query(func.count(Invoice.id)).filter(Invoice.company_id == company_id).scalar()
    year = datetime.utcnow().year
    return f"INV-{year}-{(count or 0) + 1:06d}"


@router.post("", response_model=InvoiceOut)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == payload.customer_id, Customer.company_id == company.id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    is_international = customer.country != company.country or customer.currency != company.default_currency

    totals = compute_invoice_totals(
        line_items=[li.model_dump() for li in payload.line_items],
        company_state=company.state,
        customer_state=customer.state,
        is_international=is_international,
    )

    invoice = Invoice(
        company_id=company.id,
        customer_id=customer.id,
        invoice_number=_next_invoice_number(db, company.id),
        invoice_type=payload.invoice_type,
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        currency=payload.currency,
        notes=payload.notes,
        subtotal=totals["subtotal"],
        cgst_total=totals["cgst_total"],
        sgst_total=totals["sgst_total"],
        igst_total=totals["igst_total"],
        grand_total=totals["grand_total"],
    )
    db.add(invoice)
    db.flush()

    for line in totals["line_items"]:
        db.add(
            InvoiceLineItem(
                company_id=company.id,
                invoice_id=invoice.id,
                product_id=line.get("product_id"),
                description=line["description"],
                hsn_sac_code=line.get("hsn_sac_code"),
                quantity=line["quantity"],
                unit_price=line["unit_price"],
                gst_rate=line["gst_rate"],
                line_total=line["line_total"],
            )
        )

    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("", response_model=list[InvoiceOut])
def list_invoices(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return db.query(Invoice).filter(Invoice.company_id == company.id).order_by(Invoice.created_at.desc()).all()


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.company_id == company.id)
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
