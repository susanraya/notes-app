"""Unit tests for password hashing and JWT helpers (NFR-001, NFR-002)."""

import time

import jwt
import pytest

from app.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_password_never_stores_plaintext() -> None:
    hashed = hash_password("s3cret!")

    assert hashed != "s3cret!"
    assert hashed.startswith("$2")  # bcrypt hash prefix


def test_verify_password_accepts_correct_and_rejects_wrong() -> None:
    hashed = hash_password("s3cret!")

    assert verify_password("s3cret!", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_create_and_decode_access_token_round_trips() -> None:
    token = create_access_token(subject="owner@example.com")

    payload = decode_access_token(token)

    assert payload["sub"] == "owner@example.com"


def test_ac004_decode_access_token_rejects_expired_token() -> None:
    from app.config import JWT_SECRET_KEY

    expired = jwt.encode(
        {"sub": "owner@example.com", "exp": int(time.time()) - 60},
        JWT_SECRET_KEY,
        algorithm="HS256",
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired)


def test_ac004_decode_access_token_rejects_malformed_token() -> None:
    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token("not-a-jwt")
