"""Integration tests for note search via GET /notes?q= (US-010-3).

Runs against the real PostgreSQL service (DATABASE_URL); `conftest.py` in
this package applies the Alembic migrations before these run. Nothing here
mocks the database or the app.
"""

import os
import time
import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_OWNER_EMAIL = os.environ["OWNER_EMAIL"]
_OWNER_PASSWORD = os.environ["OWNER_PASSWORD"]


def _login_token() -> str:
    response = client.post("/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD})
    assert response.status_code == 200
    return response.json()["access_token"]


def _auth_headers(token: str | None = None) -> dict:
    return {"Authorization": f"Bearer {token or _login_token()}"}


def _parse_timestamp(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


@pytest.fixture()
def created_note_ids():
    """Collects ids created in a test and deletes them afterwards, so repeated
    runs against the real, persistent database stay repeatable."""
    ids: list[str] = []
    yield ids
    if ids:
        headers = _auth_headers()
        for note_id in ids:
            client.delete(f"/notes/{note_id}", headers=headers)


# ---------------------------------------------------------------------------
# AC-020: GET /notes?q= returns only notes whose title matches, only whose
# body matches, and is case-insensitive
# ---------------------------------------------------------------------------


def test_ac020_q_matches_notes_by_title_only(created_note_ids):
    headers = _auth_headers()
    stamp = uuid.uuid4().hex[:8]
    title_match = client.post(
        "/notes",
        json={"title": f"Zephyr-{stamp} planning doc", "body": "unrelated content"},
        headers=headers,
    ).json()
    created_note_ids.append(title_match["id"])
    no_match = client.post(
        "/notes", json={"title": "Something else", "body": "also unrelated"}, headers=headers
    ).json()
    created_note_ids.append(no_match["id"])

    response = client.get(f"/notes?q=Zephyr-{stamp}", headers=headers)

    assert response.status_code == 200
    ids = [n["id"] for n in response.json()]
    assert title_match["id"] in ids
    assert no_match["id"] not in ids


def test_ac020_q_matches_notes_by_body_only(created_note_ids):
    headers = _auth_headers()
    stamp = uuid.uuid4().hex[:8]
    body_match = client.post(
        "/notes",
        json={"title": "Untitled", "body": f"<p>contains Quasar-{stamp} inside the text</p>"},
        headers=headers,
    ).json()
    created_note_ids.append(body_match["id"])
    no_match = client.post(
        "/notes", json={"title": "Another untitled", "body": "<p>nothing special here</p>"}, headers=headers
    ).json()
    created_note_ids.append(no_match["id"])

    response = client.get(f"/notes?q=Quasar-{stamp}", headers=headers)

    assert response.status_code == 200
    ids = [n["id"] for n in response.json()]
    assert body_match["id"] in ids
    assert no_match["id"] not in ids


def test_ac020_q_is_case_insensitive(created_note_ids):
    headers = _auth_headers()
    stamp = uuid.uuid4().hex[:8]
    created = client.post(
        "/notes",
        json={"title": f"MixedCase-{stamp}-Title", "body": "body"},
        headers=headers,
    ).json()
    created_note_ids.append(created["id"])

    lower = client.get(f"/notes?q=mixedcase-{stamp}-title", headers=headers)
    upper = client.get(f"/notes?q=MIXEDCASE-{stamp}-TITLE", headers=headers)

    assert lower.status_code == 200
    assert upper.status_code == 200
    assert created["id"] in [n["id"] for n in lower.json()]
    assert created["id"] in [n["id"] for n in upper.json()]


def test_ac020_q_with_no_matches_returns_empty_list(created_note_ids):
    headers = _auth_headers()
    stamp = uuid.uuid4().hex[:8]
    created = client.post(
        "/notes", json={"title": "Real note", "body": "real body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    response = client.get(f"/notes?q=no-such-term-{stamp}-xyz", headers=headers)

    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# AC-021: GET /notes with absent or empty q returns the full list in
# newest-updated-first order
# ---------------------------------------------------------------------------


def test_ac021_absent_q_returns_full_list_newest_updated_first(created_note_ids):
    headers = _auth_headers()

    first = client.post("/notes", json={"title": "Search A", "body": "a"}, headers=headers).json()
    created_note_ids.append(first["id"])
    time.sleep(1.1)
    second = client.post("/notes", json={"title": "Search B", "body": "b"}, headers=headers).json()
    created_note_ids.append(second["id"])

    response = client.get("/notes", headers=headers)

    assert response.status_code == 200
    ids_in_order = [n["id"] for n in response.json()]
    assert ids_in_order.index(second["id"]) < ids_in_order.index(first["id"])

    updated_at_values = [_parse_timestamp(n["updated_at"]) for n in response.json()]
    assert updated_at_values == sorted(updated_at_values, reverse=True)


def test_ac021_empty_q_returns_full_list_newest_updated_first(created_note_ids):
    headers = _auth_headers()

    first = client.post("/notes", json={"title": "Empty Q A", "body": "a"}, headers=headers).json()
    created_note_ids.append(first["id"])
    time.sleep(1.1)
    second = client.post("/notes", json={"title": "Empty Q B", "body": "b"}, headers=headers).json()
    created_note_ids.append(second["id"])

    response = client.get("/notes?q=", headers=headers)

    assert response.status_code == 200
    ids_in_order = [n["id"] for n in response.json()]
    assert ids_in_order.index(second["id"]) < ids_in_order.index(first["id"])


def test_ac021_whitespace_only_q_is_treated_as_empty(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Whitespace Q", "body": "body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    response = client.get("/notes?q=%20%20", headers=headers)

    assert response.status_code == 200
    assert created["id"] in [n["id"] for n in response.json()]


# ---------------------------------------------------------------------------
# AC: GET /notes?q= without a JWT returns 401
# ---------------------------------------------------------------------------


def test_ac_q_search_without_token_returns_401():
    response = client.get("/notes?q=anything")

    assert response.status_code == 401
