FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway (and most PaaS) inject $PORT at runtime; create tables on boot
# since there are no Alembic migrations yet (noted as a Phase 2 TODO).
CMD python init_db.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
