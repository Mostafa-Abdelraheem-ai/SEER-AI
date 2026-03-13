from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime
    updated_at: datetime
