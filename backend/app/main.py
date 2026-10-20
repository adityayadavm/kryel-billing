import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, invoices, customers, products, company

app = FastAPI(title="KRYEL Billing API", version="0.1.0")

# CORS_ORIGINS: comma-separated list, e.g. "https://kryel-billing.vercel.app".
# Falls back to "*" for local dev. Browsers reject "*" together with
# allow_credentials, so credentials are only enabled once real origins are set.
_origins_env = os.getenv("CORS_ORIGINS", "*")
_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(invoices.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(company.router)


@app.get("/health")
def health():
    return {"status": "ok"}
