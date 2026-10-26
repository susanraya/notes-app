"""Reusable auth dependency guarding every authenticated route (US-001, NFR-002).

`get_current_owner` is attached at router level to every `/notes` route (see
`app/routers/notes.py`) and used directly by `POST /auth/logout`. It fails
closed: any missing, malformed or expired bearer token raises 401 before the
route body runs.
"""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.security import decode_access_token

_bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTHORIZED = status.HTTP_401_UNAUTHORIZED


def get_current_owner(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),  # noqa: B008
) -> str:
    """Validate the bearer JWT and return its subject (the owner's email).

    Raises 401 on a missing, malformed or expired token (NFR-002, AC-004).
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=_UNAUTHORIZED, detail="Token expired") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=_UNAUTHORIZED, detail="Invalid token") from None

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=_UNAUTHORIZED, detail="Invalid token")
    return subject


__all__ = ["get_current_owner"]
