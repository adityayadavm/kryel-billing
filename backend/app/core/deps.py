"""
Shared FastAPI dependencies: current user + the tenant guard.

get_current_company is the single choke point every tenant-scoped query
must go through — it's what makes company_id isolation real instead of
just a column that's easy to forget to filter on.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models import User, Company

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_error

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if user is None or not user.is_active:
        raise credentials_error
    return user


def get_current_company(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Company:
    company = db.query(Company).filter(Company.id == user.company_id).first()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
