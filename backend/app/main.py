from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, invoices, customers, products, company

app = FastAPI(title="KRYEL Billing API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before production
    allow_credentials=True,
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
