"""Integration tests for /notes CRUD, owner scoping and persistence (US-003-3).

Runs against the real PostgreSQL service (DATABASE_URL); `conftest.py` in
this package applies the Alembic migrations, including the seeded owner
row, before these run. Nothing here mocks the database or the app.
"""

import os
import uuid

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
# AC-006 / AC-007: CRUD behaviour
# ---------------------------------------------------------------------------


def test_ac007_post_notes_creates_a_note(created_note_ids):
    headers = _auth_headers()

    response = client.post(
        "/notes", json={"title": "QA Title", "body": "<p>QA body</p>"}, headers=headers
    )

    assert response.status_code == 201
    body = response.json()
    created_note_ids.append(body["id"])
    assert body["title"] == "QA Title"
    assert body["body"] == "<p>QA body</p>"
    assert "id" in body and "created_at" in body and "updated_at" in body


def test_ac007_get_notes_lists_the_created_note(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "List Me", "body": "body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    response = client.get("/notes", headers=headers)

    assert response.status_code == 200
    ids = [n["id"] for n in response.json()]
    assert created["id"] in ids


def test_ac007_get_note_by_id_returns_it(created_note_ids):
    headers = _auth_headers()
    created = client.post("/notes", json={"title": "Get Me", "body": "b"}, headers=headers).json()
    created_note_ids.append(created["id"])

    response = client.get(f"/notes/{created['id']}", headers=headers)

    assert response.status_code == 200
    assert response.json()["title"] == "Get Me"


def test_ac007_put_note_updates_title_and_body(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Old", "body": "old body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    response = client.put(
        f"/notes/{created['id']}", json={"title": "New", "body": "new body"}, headers=headers
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "New"
    assert body["body"] == "new body"


def test_ac007_delete_note_removes_it():
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Delete Me", "body": "b"}, headers=headers
    ).json()

    response = client.delete(f"/notes/{created['id']}", headers=headers)

    assert response.status_code == 204
    follow_up = client.get(f"/notes/{created['id']}", headers=headers)
    assert follow_up.status_code == 404


def test_ac007_get_unknown_note_id_returns_404():
    headers = _auth_headers()

    response = client.get(f"/notes/{uuid.uuid4()}", headers=headers)

    assert response.status_code == 404


def test_ac007_put_unknown_note_id_returns_404():
    headers = _auth_headers()

    response = client.put(
        f"/notes/{uuid.uuid4()}", json={"title": "x", "body": "y"}, headers=headers
    )

    assert response.status_code == 404


def test_ac007_delete_unknown_note_id_returns_404():
    headers = _auth_headers()

    response = client.delete(f"/notes/{uuid.uuid4()}", headers=headers)

    assert response.status_code == 404


def test_ac007_get_note_with_malformed_id_returns_404():
    headers = _auth_headers()

    response = client.get("/notes/not-a-uuid", headers=headers)

    assert response.status_code == 404


# ---------------------------------------------------------------------------
# AC-004: every /notes endpoint requires a valid JWT
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "method,path_suffix,json_body",
    [
        ("get", "", None),
        ("post", "", {"title": "x", "body": "y"}),
        ("get", "/" + str(uuid.uuid4()), None),
        ("put", "/" + str(uuid.uuid4()), {"title": "x", "body": "y"}),
        ("delete", "/" + str(uuid.uuid4()), None),
    ],
)
def test_ac004_notes_endpoints_reject_requests_without_a_token(method, path_suffix, json_body):
    fn = getattr(client, method)
    kwargs = {"json": json_body} if json_body is not None else {}

    response = fn(f"/notes{path_suffix}", **kwargs)

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# AC-024 / NFR-006: a note persists in PostgreSQL across a fresh login session
# ---------------------------------------------------------------------------


def test_ac024_note_created_in_one_session_is_read_back_unchanged_by_a_fresh_session(
    created_note_ids,
):
    token_a = _login_token()
    created = client.post(
        "/notes",
        json={"title": "Persisted Title", "body": "<p>Persisted Body</p>"},
        headers=_auth_headers(token_a),
    ).json()
    created_note_ids.append(created["id"])

    token_b = _login_token()  # a new login, a fresh session/token

    response = client.get(f"/notes/{created['id']}", headers=_auth_headers(token_b))

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Persisted Title"
    assert body["body"] == "<p>Persisted Body</p>"


# ---------------------------------------------------------------------------
# AC-025: no external sync/import/export endpoint exists
# ---------------------------------------------------------------------------


def test_ac025_openapi_document_exposes_no_sync_import_or_export_endpoint():
    paths = client.get("/openapi.json").json()["paths"]

    for path in paths:
        lowered = path.lower()
        assert "sync" not in lowered
        assert "import" not in lowered
        assert "export" not in lowered


# ---------------------------------------------------------------------------
# Rich-text body round-trips unaltered through POST then GET
# ---------------------------------------------------------------------------


def test_rich_text_html_body_round_trips_through_post_then_get(created_note_ids):
    headers = _auth_headers()
    html = (
        "<h3>Heading</h3><p>Some <strong>bold</strong> text and a "
        '<a href="https://example.com">link</a></p><ul><li>one</li><li>two</li></ul>'
    )

    created = client.post("/notes", json={"title": "Rich", "body": html}, headers=headers).json()
    created_note_ids.append(created["id"])

    assert created["body"] == html

    fetched = client.get(f"/notes/{created['id']}", headers=headers).json()
    assert fetched["body"] == html
