from fastapi import APIRouter, Depends

from app.core.deps import get_current_company
from app.models import Company
from app.schemas.company import CompanyOut

router = APIRouter(prefix="/company", tags=["company"])


@router.get("/me", response_model=CompanyOut)
def get_my_company(company: Company = Depends(get_current_company)):
    return company
