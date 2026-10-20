# KRYEL Billing — Phase 1 (MVP)

GST-compliant invoicing, hosted multi-tenant by default with a self-hosted
export path. See the project docs for full architecture and roadmap.

## Stack
- Backend: FastAPI + SQLAlchemy + PostgreSQL (`backend/`)
- Frontend: Next.js (App Router) + Tailwind (`frontend/`)

## Local dev setup

### 1. Database
```bash
# Via Docker (preferred):
docker compose up -d db

# Or a local Postgres install:
sudo -u postgres psql -c "CREATE USER kryel WITH PASSWORD 'kryel';"
sudo -u postgres psql -c "CREATE DATABASE kryel_billing OWNER kryel;"
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python init_db.py          # creates tables (swap for Alembic migrations later)
uvicorn app.main:app --reload --port 8000
```
API docs at `http://localhost:8000/docs`.

**Known version pins** (worked around compatibility issues hit during setup):
- `psycopg[binary]` (v3), not `psycopg2-binary` — no prebuilt wheel for newer
  Python versions, and building from source needs `libpq-dev`.
- `bcrypt==4.0.1` — passlib 1.7.4's bcrypt backend breaks on bcrypt 5.x.
- `email-validator` is required explicitly for Pydantic's `EmailStr`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
App at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` if the API isn't
on `localhost:8000`.

## Verified working (2026-10-20)
Signup → login → create invoice end-to-end, including GST split logic
(CGST+SGST for intra-state, IGST for inter-state). Customers currently
need to be created directly in the DB — the customers CRUD endpoints and
UI are next.

## Security note
`npm audit` flags Next.js 14.x advisories with no 14.x patch — only
`next@16` resolves them, which is a breaking major-version jump. Pinned
to the latest 14.2.x patch (`14.2.35`) for now; budget time for the v16
migration before this goes to production.
