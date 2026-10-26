"""Authentication endpoints (architecture component: backend / Notes API).

Stub routes, same placeholder convention as every other generated route (see
`app/main.py`): each reserves the path, method and request shape the
approved API spec declares, and returns a typed `StubResponse` rather than
failing, so the OpenAPI document is complete before a line of business logic
exists. Checking the password hash, issuing a JWT and validating it on every
`/notes` call (US-001, US-002) is the development sprint's work.
"""

from fastapi import APIRouter

from app.schemas import LoginRequest, StubResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=StubResponse)
async def login(credentials: LoginRequest) -> StubResponse:
    del credentials  # unused in the stub; accepted only to shape the OpenAPI body
    return StubResponse(endpoint="POST /auth/login")


@router.post("/logout", response_model=StubResponse)
async def logout() -> StubResponse:
    return StubResponse(endpoint="POST /auth/logout")
