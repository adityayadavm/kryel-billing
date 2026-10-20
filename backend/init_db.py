"""
Quick table creation for local dev. Phase 1+: replace with proper
Alembic migrations (alembic/ is already scaffolded) once the schema
needs versioned changes in production.
"""
from app.database import engine, Base
from app import models  # noqa: F401 — import so models register on Base.metadata

Base.metadata.create_all(bind=engine)
print("Tables created.")
