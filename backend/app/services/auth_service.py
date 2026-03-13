from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.audit_service import AuditService


class AuthService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    def register(self, payload: RegisterRequest) -> UserResponse:
        if self.users.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
        role = "admin" if self.users.count() == 0 else "user"
        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=role,
        )
        created = self.users.create(user)
        self.audit.log(created.id, "user.register", f"Registered {created.email} as {role}")
        return UserResponse.model_validate(created)

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.users.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        self.audit.log(user.id, "user.login", f"User {user.email} logged in")
        return TokenResponse(access_token=create_access_token(user.id))
