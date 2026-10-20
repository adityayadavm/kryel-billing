from uuid import UUID

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    gstin: str | None = None
    billing_address: str | None = None
    shipping_address: str | None = None
    state: str | None = None
    country: str = "IN"
    currency: str = "INR"


class CustomerOut(CustomerCreate):
    id: UUID

    class Config:
        from_attributes = True
