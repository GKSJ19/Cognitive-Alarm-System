from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class APIKeyCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["mobile-client-prod"])
    owner: str = Field(..., min_length=1, max_length=100, examples=["nivedhitha"])


class APIKeyCreateResponse(BaseModel):
    """
    Returned ONLY at creation time. `api_key` is the one and only moment the
    raw secret is ever shown — the server stores just its hash, so if it's
    lost, the only fix is revoking this key and creating a new one.
    """
    id: str
    name: str
    owner: str
    prefix: str
    api_key: str
    created_at: datetime


class APIKeyPublic(BaseModel):
    """Safe-to-list view — never includes the raw key or its hash."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    owner: str
    prefix: str
    is_active: bool
    created_at: datetime
    last_used_at: datetime | None = None
    revoked_at: datetime | None = None
