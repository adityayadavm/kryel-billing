from uuid import UUID

from pydantic import BaseModel


class CompanyOut(BaseModel):
    id: UUID
    name: str
    state: str | None
    country: str
    default_currency: str
    gstin: str | None

    class Config:
        from_attributes = True
