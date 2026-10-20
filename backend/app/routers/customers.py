from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_company
from app.database import get_db
from app.models import Company, Customer
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerOut)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    customer = Customer(company_id=company.id, **payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerOut])
def list_customers(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return (
        db.query(Customer)
        .filter(Customer.company_id == company.id)
        .order_by(Customer.name)
        .all()
    )


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.company_id == company.id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: UUID,
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.company_id == company.id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in payload.model_dump().items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.company_id == company.id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
