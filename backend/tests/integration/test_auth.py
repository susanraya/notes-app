"""Integration tests for login, logout and the auth guard (US-001-1).

Run against the real PostgreSQL service (DATABASE_URL); `conftest.py` applies
the Alembic migrations, including the seeded owner row, before these run.
"""

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.config import JWT_SECRET_KEY
from app.main import app

client = TestClient(app)

_OWNER_EMAIL = os.environ["OWNER_EMAIL"]
_OWNER_PASSWORD = os.environ["OWNER_PASSWORD"]


def test_ac001_login_with_correct_credentials_returns_token() -> None:
    response = client.post(
        "/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert isinstance(body["access_token"], str) and body["access_token"]


def test_ac002_login_with_wrong_password_returns_generic_401() -> None:
    response = client.post(
        "/auth/login", json={"email": _OWNER_EMAIL, "password": "definitely-wrong"}
    )

    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_ac002_login_with_wrong_email_returns_generic_401() -> None:
    response = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": _OWNER_PASSWORD}
    )

    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_ac002_error_body_does_not_reveal_which_field_was_wrong() -> None:
    wrong_email = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": _OWNER_PASSWORD}
    )
    wrong_password = client.post(
        "/auth/login", json={"email": _OWNER_EMAIL, "password": "nope"}
    )

    assert wrong_email.json() == wrong_password.json()


def test_ac003_no_signup_endpoint_in_openapi_document() -> None:
    paths = client.get("/openapi.json").json()["paths"]

    for path in paths:
        assert "signup" not in path.lower()
        assert "register" not in path.lower()
        assert "sign-up" not in path.lower()


def test_ac004_notes_endpoint_rejects_missing_token() -> None:
    response = client.get("/notes")

    assert response.status_code == 401


def test_ac004_notes_endpoint_rejects_malformed_token() -> None:
    response = client.get("/notes", headers={"Authorization": "Bearer not-a-jwt"})

    assert response.status_code == 401


def test_ac004_notes_endpoint_rejects_expired_token() -> None:
    expired = jwt.encode(
        {"sub": _OWNER_EMAIL, "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        JWT_SECRET_KEY,
        algorithm="HS256",
    )

    response = client.get("/notes", headers={"Authorization": f"Bearer {expired}"})

    assert response.status_code == 401


def test_ac005_logout_with_valid_token_returns_204() -> None:
    login = client.post(
        "/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD}
    )
    token = login.json()["access_token"]

    response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 204


def test_ac005_logout_without_token_returns_401() -> None:
    response = client.post("/auth/logout")

    assert response.status_code == 401


def test_notes_endpoint_accepts_valid_token() -> None:
    login = client.post(
        "/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD}
    )
    token = login.json()["access_token"]

    response = client.get("/notes", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
