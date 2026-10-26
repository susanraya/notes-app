"""Password hashing and JWT helpers for the single-owner login (US-001).

`passlib[bcrypt]` hashes and verifies the owner's password; `PyJWT` issues and
decodes the session token `get_current_owner` (app/dependencies.py) checks on
every guarded request. Signed with `JWT_SECRET_KEY` (app/config.py), never
with the shared frontend bearer `SECRET_KEY`.
"""

from datetime import UTC, datetime, timedelta

import jwt
from passlib.context import CryptContext

from app.config import JWT_SECRET_KEY

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def hash_password(plain_password: str) -> str:
    """Return the bcrypt hash stored in `users.password_hash`; never store plaintext."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Check a login attempt's password against the stored bcrypt hash."""
    return _pwd_context.verify(plain_password, password_hash)


def create_access_token(subject: str) -> str:
    """Issue a short-lived JWT identifying the owner by email (the `sub` claim)."""
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Verify signature and expiry; raises `jwt.InvalidTokenError` (or a subclass) on failure."""
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])


__all__ = ["hash_password", "verify_password", "create_access_token", "decode_access_token"]
