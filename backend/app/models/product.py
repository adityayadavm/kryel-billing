from sqlalchemy import Column, String, Numeric, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TenantScopedMixin


class Product(TenantScopedMixin, Base):
    """
    A product or service line a company sells. Also doubles as the
    inventory record for retail/POS (Phase 3) — stock_qty is nullable so
    service-only companies in Phase 1 can ignore it entirely.
    """
    __tablename__ = "products"

    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    hsn_sac_code = Column(String, nullable=True)
    unit_price = Column(Numeric(14, 2), nullable=False, default=0)
    gst_rate = Column(Numeric(5, 2), nullable=False, default=0)   # e.g. 18.00 for 18%
    track_inventory = Column(Boolean, nullable=False, default=False)
    stock_qty = Column(Integer, nullable=True)

    company = relationship("Company", back_populates="products")
