from __future__ import annotations

from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.database import SessionLocal


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication")
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise unauthorized
    except JWTError as exc:
        raise unauthorized from exc

    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise unauthorized
    return user
