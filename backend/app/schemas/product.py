from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    hsn_sac_code: str | None = None
    unit_price: Decimal = Decimal("0")
    gst_rate: Decimal = Decimal("0")
    track_inventory: bool = False
    stock_qty: int | None = None


class ProductOut(ProductCreate):
    id: UUID

    class Config:
        from_attributes = True
