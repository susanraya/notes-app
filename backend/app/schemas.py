"""Pydantic request and response models.

One pair per entity the approved API spec declares, plus the placeholder
every generated route still returns until it has been implemented.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StubResponse(BaseModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


class LoginRequest(BaseModel):
    """Body of `POST /auth/login`."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """Success body of `POST /auth/login`."""

    access_token: str
    token_type: str = "bearer"


class NoteCreate(BaseModel):
    """Body of `POST /notes`."""

    title: str
    body: str


class NoteUpdate(BaseModel):
    """Body of `PUT /notes/{id}`: auto-save sends whichever field changed."""

    title: str | None = None
    body: str | None = None


class NoteOut(BaseModel):
    """Response body shared by every endpoint that returns a note."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str | None = None
    body: str | None = None
    created_at: datetime
    updated_at: datetime
