"""Authentication endpoints (architecture component: backend / Notes API).

Single-owner login: checks the submitted password against the one seeded
`users` row's bcrypt hash and, on success, issues a JWT the owner then sends
as `Authorization: Bearer <token>` on every other request. Logout is
stateless (see `docs/sdlc/architecture/api/openapi.yaml`): it only confirms
the caller is authenticated before the frontend discards its token.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_owner
from app.models import User
from app.schemas import LoginRequest, TokenResponse
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

# Deliberately generic (AC-002): never reveals whether the email or the
# password was the part that was wrong.
_INVALID_CREDENTIALS_DETAIL = "Credentials not accepted"


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest, db: Session = Depends(get_db)  # noqa: B008
) -> TokenResponse:
    user = db.query(User).filter(User.email == credentials.email).first()
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=_INVALID_CREDENTIALS_DETAIL
        )
    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(owner: str = Depends(get_current_owner)) -> None:  # noqa: B008
    del owner  # the dependency's only job here is to require a valid session
    return None
