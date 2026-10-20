from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class InvoiceTemplate(TenantScopedMixin, Base):
    """
    Phase 1: a handful of built-in rows (company_id NULL) seeded as presets.
    Phase 2: customer-owned rows (company_id set) created in the drag-drop
    builder — `layout` is the JSON schema the canvas editor and the
    Puppeteer-based renderer both read from (see architecture doc).
    """
    __tablename__ = "templates"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String, nullable=False)
    is_preset = Column(Boolean, nullable=False, default=False)
    layout = Column(JSONB, nullable=False, default=dict)

    company = relationship("Company")
