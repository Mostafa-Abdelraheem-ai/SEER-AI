from __future__ import annotations

from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    ANALYST = "analyst"


class ChannelType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    CHAT = "chat"
