"""Integration tests for note edit timestamps, permanent deletion and
newest-first ordering (US-006-3).

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
# AC-011 / AC-012: PUT changes title and body and raises updated_at
# ---------------------------------------------------------------------------


def test_ac011_ac012_put_changes_title_and_body_and_raises_updated_at(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Lifecycle Before", "body": "before body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])
    original_updated_at = _parse_timestamp(created["updated_at"])

    time.sleep(1.1)

    response = client.put(
        f"/notes/{created['id']}",
        json={"title": "Lifecycle After", "body": "after body"},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Lifecycle After"
    assert body["body"] == "after body"
    assert _parse_timestamp(body["updated_at"]) > original_updated_at
    assert body["created_at"] == created["created_at"]


# ---------------------------------------------------------------------------
# AC-015 / AC-016: DELETE removes the note from GET /notes, from search, and
# a subsequent GET by id returns 404; no recovery route exists.
# ---------------------------------------------------------------------------


def test_ac015_ac016_delete_removes_note_from_list_and_get_returns_404():
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Doomed Note", "body": "will be deleted"}, headers=headers
    ).json()
    note_id = created["id"]

    delete_response = client.delete(f"/notes/{note_id}", headers=headers)
    assert delete_response.status_code == 204

    list_response = client.get("/notes", headers=headers)
    assert note_id not in [n["id"] for n in list_response.json()]

    get_response = client.get(f"/notes/{note_id}", headers=headers)
    assert get_response.status_code == 404

    second_get_response = client.get(f"/notes/{note_id}", headers=headers)
    assert second_get_response.status_code == 404


def test_ac016_no_recovery_route_in_openapi_document():
    paths = client.get("/openapi.json").json()["paths"]

    for path in paths:
        lowered = path.lower()
        assert "restore" not in lowered
        assert "undelete" not in lowered
        assert "recover" not in lowered
        assert "trash" not in lowered


# ---------------------------------------------------------------------------
# AC-017 / AC-018: GET /notes is ordered updated_at descending, and an
# edited note moves to the head of the list.
# ---------------------------------------------------------------------------


def test_ac017_ac018_list_is_newest_updated_first_and_edit_moves_note_to_head(created_note_ids):
    headers = _auth_headers()

    first = client.post("/notes", json={"title": "First", "body": "a"}, headers=headers).json()
    created_note_ids.append(first["id"])
    time.sleep(1.1)
    second = client.post("/notes", json={"title": "Second", "body": "b"}, headers=headers).json()
    created_note_ids.append(second["id"])
    time.sleep(1.1)
    third = client.post("/notes", json={"title": "Third", "body": "c"}, headers=headers).json()
    created_note_ids.append(third["id"])

    listing = client.get("/notes", headers=headers).json()
    ids_in_order = [n["id"] for n in listing]
    # Among these three, the most recently created/updated appears first.
    assert ids_in_order.index(third["id"]) < ids_in_order.index(second["id"])
    assert ids_in_order.index(second["id"]) < ids_in_order.index(first["id"])

    # Confirm strict descending order of updated_at across the whole list.
    updated_at_values = [_parse_timestamp(n["updated_at"]) for n in listing]
    assert updated_at_values == sorted(updated_at_values, reverse=True)

    time.sleep(1.1)
    client.put(f"/notes/{first['id']}", json={"title": "First, edited"}, headers=headers)

    after_edit = client.get("/notes", headers=headers).json()
    assert after_edit[0]["id"] == first["id"]


# ---------------------------------------------------------------------------
# JWT required: GET/PUT/DELETE without a token return 401
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method,json_body",
    [
        ("get", None),
        ("put", {"title": "x", "body": "y"}),
        ("delete", None),
    ],
)
def test_ac004_notes_id_endpoints_reject_requests_without_a_token(method, json_body):
    fn = getattr(client, method)
    kwargs = {"json": json_body} if json_body is not None else {}

    response = fn(f"/notes/{uuid.uuid4()}", **kwargs)

    assert response.status_code == 401
