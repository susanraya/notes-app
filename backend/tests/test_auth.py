"""Auth test suite (US-001-3): login, logout, the 401 guard on /notes, and the
password-storage NFR. Runs against the real app and the real database
configured for this environment -- nothing here is mocked.
"""

import time

import jwt
import pytest
from passlib.context import CryptContext

from app.config import JWT_SECRET_KEY

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _login(client, email, password):
    return client.post("/auth/login", json={"email": email, "password": password})


# ---------------------------------------------------------------------------
# AC-001: correct credentials return a usable JWT
# ---------------------------------------------------------------------------


def test_ac001_correct_credentials_return_a_usable_jwt(client, owner_credentials):
    response = _login(client, owner_credentials["email"], owner_credentials["password"])

    assert response.status_code == 200
    body = response.json()
    assert body.get("access_token")
    assert isinstance(body["access_token"], str)
    assert body.get("token_type", "").lower() == "bearer"

    # "Usable" means a guarded endpoint accepts it.
    guarded = client.get("/notes", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert guarded.status_code != 401


# ---------------------------------------------------------------------------
# AC-002: wrong email and wrong password each return 401 with no token
# ---------------------------------------------------------------------------


def test_ac002_wrong_email_returns_401_with_no_token(client, owner_credentials):
    response = _login(client, "not-the-owner@example.com", owner_credentials["password"])

    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_ac002_wrong_password_returns_401_with_no_token(client, owner_credentials):
    response = _login(client, owner_credentials["email"], "definitely-the-wrong-password")

    assert response.status_code == 401
    assert "access_token" not in response.json()


# ---------------------------------------------------------------------------
# AC-003: the OpenAPI document exposes no sign-up endpoint
# ---------------------------------------------------------------------------


def test_ac003_openapi_document_exposes_no_sign_up_endpoint(client):
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]

    for suspect in (
        "/auth/signup",
        "/auth/sign-up",
        "/auth/register",
        "/auth/users",
        "/users",
        "/auth/signup/",
    ):
        assert suspect not in paths, f"found an unexpected sign-up-shaped route: {suspect}"

    assert "/auth/login" in paths
    assert "/auth/logout" in paths


# ---------------------------------------------------------------------------
# AC-004: /notes with no token, a malformed token, and an expired token each
# return 401
# ---------------------------------------------------------------------------


def test_ac004_notes_with_no_token_returns_401(client):
    response = client.get("/notes")

    assert response.status_code == 401


def test_ac004_notes_with_malformed_token_returns_401(client):
    response = client.get("/notes", headers={"Authorization": "Bearer not-a-valid-jwt"})

    assert response.status_code == 401


def test_ac004_notes_with_expired_token_returns_401(client, owner_credentials):
    expired_token = jwt.encode(
        {"sub": str(owner_credentials["id"]), "exp": int(time.time()) - 60},
        JWT_SECRET_KEY,
        algorithm="HS256",
    )

    response = client.get("/notes", headers={"Authorization": f"Bearer {expired_token}"})

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# AC-005: logout succeeds for an authenticated caller
# ---------------------------------------------------------------------------


def test_ac005_logout_succeeds_for_an_authenticated_caller(client, owner_credentials):
    login_response = _login(client, owner_credentials["email"], owner_credentials["password"])
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code in (200, 204)


# ---------------------------------------------------------------------------
# NFR-001: the owner's password is stored only as a bcrypt hash, never
# plaintext
# ---------------------------------------------------------------------------


def test_nfr001_owner_password_is_stored_only_as_a_bcrypt_hash(owner_credentials):
    stored_hash = owner_credentials["password_hash"]

    assert stored_hash != owner_credentials["password"]
    assert owner_credentials["password"] not in stored_hash
    assert stored_hash.startswith(("$2a$", "$2b$", "$2y$")), "expected a bcrypt hash prefix"
    assert _pwd_context.verify(owner_credentials["password"], stored_hash)
