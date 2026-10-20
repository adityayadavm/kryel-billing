import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class TenantScopedMixin:
    """
    Every table that holds a single company's data mixes this in.
    company_id is indexed and is the single source of row-level isolation
    between hosted customers (KRYEL Billing is multi-tenant by default;
    self-host builds just run with one company row).
    """

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
