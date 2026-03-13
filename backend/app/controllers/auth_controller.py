from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    return AuthService(db).register(payload)


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).login(LoginRequest(email=form_data.username, password=form_data.password))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
