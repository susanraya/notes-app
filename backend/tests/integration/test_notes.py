"""Integration tests for /notes CRUD, owner scoping and persistence (US-003-3).

Runs against the real PostgreSQL service (DATABASE_URL); `conftest.py` in
this package applies the Alembic migrations, including the seeded owner
row, before these run. Nothing here mocks the database or the app.
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
    """Parses an ISO timestamp from the API into an aware, UTC datetime."""
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


# ---------------------------------------------------------------------------
# US-004 -- AC-008: the four rich-text formats this story adds -- bold,
# heading, bulleted list and link -- all round-trip byte-for-byte through
# PUT (the auto-save call the editor makes) then GET (reopening the note).
# ---------------------------------------------------------------------------


def test_ac008_bold_heading_list_and_link_markup_round_trips_through_put_then_get(
    created_note_ids,
):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Formatted", "body": "<p>plain</p>"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    formatted_html = (
        "<h3>A heading</h3>"
        "<p>Some <strong>bold</strong> words and a "
        '<a href="https://example.com">link</a>.</p>'
        "<ul><li><p>first item</p></li><li><p>second item</p></li></ul>"
    )

    put_response = client.put(
        f"/notes/{created['id']}",
        json={"title": "Formatted", "body": formatted_html},
        headers=headers,
    )
    assert put_response.status_code == 200
    assert put_response.json()["body"] == formatted_html

    reopened = client.get(f"/notes/{created['id']}", headers=headers)
    assert reopened.status_code == 200
    body = reopened.json()["body"]
    assert body == formatted_html
    assert "<strong>bold</strong>" in body
    assert "<h3>A heading</h3>" in body
    assert "<ul>" in body and "<li>" in body
    assert '<a href="https://example.com">link</a>' in body


# ---------------------------------------------------------------------------
# US-004 -- AC-009: the understanding excludes attachments -- no endpoint
# for uploading or attaching a file or image exists in the approved API.
# ---------------------------------------------------------------------------


def test_ac009_openapi_document_exposes_no_attachment_or_upload_endpoint():
    paths = client.get("/openapi.json").json()["paths"]

    for path in paths:
        lowered = path.lower()
        assert "attach" not in lowered
        assert "upload" not in lowered
        assert "file" not in lowered
        assert "image" not in lowered


def test_ac009_note_schema_has_no_attachment_or_file_field():
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "No attachments here", "body": "plain text"}, headers=headers
    )

    assert created.status_code == 201
    keys = {key.lower() for key in created.json()}
    for forbidden in ("attachment", "attachments", "file", "files", "image", "images"):
        assert forbidden not in keys


# ---------------------------------------------------------------------------
# US-006 -- AC-011: editing a note stores the change and shows it on reopen
# ---------------------------------------------------------------------------


def test_ac011_put_changing_only_the_title_is_shown_on_reopen(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Original title", "body": "Original body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    put_response = client.put(
        f"/notes/{created['id']}", json={"title": "Edited title"}, headers=headers
    )
    assert put_response.status_code == 200
    assert put_response.json()["title"] == "Edited title"
    # The body was not part of this edit's payload and must survive unchanged.
    assert put_response.json()["body"] == "Original body"

    # "Reopening" the note is a fresh GET, independent of the PUT response.
    reopened = client.get(f"/notes/{created['id']}", headers=headers)
    assert reopened.status_code == 200
    body = reopened.json()
    assert body["title"] == "Edited title"
    assert body["body"] == "Original body"


def test_ac011_put_changing_only_the_body_is_shown_on_reopen(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Keep this title", "body": "Original body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    put_response = client.put(
        f"/notes/{created['id']}", json={"body": "<p>Edited body</p>"}, headers=headers
    )
    assert put_response.status_code == 200
    assert put_response.json()["title"] == "Keep this title"
    assert put_response.json()["body"] == "<p>Edited body</p>"

    reopened = client.get(f"/notes/{created['id']}", headers=headers).json()
    assert reopened["title"] == "Keep this title"
    assert reopened["body"] == "<p>Edited body</p>"


def test_ac011_put_changing_title_and_body_together_is_shown_on_reopen(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Before", "body": "Before body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])

    client.put(
        f"/notes/{created['id']}",
        json={"title": "After", "body": "After body"},
        headers=headers,
    )

    reopened = client.get(f"/notes/{created['id']}", headers=headers).json()
    assert reopened["title"] == "After"
    assert reopened["body"] == "After body"


def test_ac011_a_second_edit_overwrites_the_first_and_is_what_reopening_shows(created_note_ids):
    headers = _auth_headers()
    created = client.post("/notes", json={"title": "v1", "body": "v1 body"}, headers=headers).json()
    created_note_ids.append(created["id"])

    client.put(f"/notes/{created['id']}", json={"title": "v2", "body": "v2 body"}, headers=headers)
    client.put(f"/notes/{created['id']}", json={"title": "v3", "body": "v3 body"}, headers=headers)

    reopened = client.get(f"/notes/{created['id']}", headers=headers).json()
    assert reopened["title"] == "v3"
    assert reopened["body"] == "v3 body"


# ---------------------------------------------------------------------------
# US-006 -- AC-012: saving an edit sets updated_at to the time of that change
# ---------------------------------------------------------------------------


def test_ac012_put_advances_updated_at_but_leaves_created_at_unchanged(created_note_ids):
    headers = _auth_headers()
    created = client.post(
        "/notes", json={"title": "Stamped", "body": "body"}, headers=headers
    ).json()
    created_note_ids.append(created["id"])
    original_created_at = created["created_at"]
    original_updated_at = _parse_timestamp(created["updated_at"])

    # Guarantee the clock has moved on from creation before editing.
    time.sleep(1.1)
    before_edit = datetime.now(UTC)

    put_response = client.put(
        f"/notes/{created['id']}", json={"title": "Stamped, edited"}, headers=headers
    )
    assert put_response.status_code == 200
    body = put_response.json()

    # created_at is immutable; only updated_at moves on an edit.
    assert body["created_at"] == original_created_at

    new_updated_at = _parse_timestamp(body["updated_at"])
    assert new_updated_at > original_updated_at

    # The new updated_at is set to (close to) the time of this change, not
    # left stale and not set far in the future.
    assert abs((new_updated_at - before_edit).total_seconds()) < 10


def test_ac012_reopening_the_note_after_an_edit_shows_the_new_updated_at(created_note_ids):
    headers = _auth_headers()
    created = client.post("/notes", json={"title": "x", "body": "y"}, headers=headers).json()
    created_note_ids.append(created["id"])

    time.sleep(1.1)
    put_body = client.put(
        f"/notes/{created['id']}", json={"title": "x, edited"}, headers=headers
    ).json()

    reopened = client.get(f"/notes/{created['id']}", headers=headers).json()

    assert reopened["updated_at"] == put_body["updated_at"]
    assert _parse_timestamp(reopened["updated_at"]) > _parse_timestamp(created["updated_at"])


def test_ac012_each_successive_edit_advances_updated_at_again(created_note_ids):
    headers = _auth_headers()
    created = client.post("/notes", json={"title": "a", "body": "b"}, headers=headers).json()
    created_note_ids.append(created["id"])

    time.sleep(1.1)
    first_edit = client.put(f"/notes/{created['id']}", json={"title": "a2"}, headers=headers).json()

    time.sleep(1.1)
    second_edit = client.put(
        f"/notes/{created['id']}", json={"title": "a3"}, headers=headers
    ).json()

    assert _parse_timestamp(second_edit["updated_at"]) > _parse_timestamp(first_edit["updated_at"])
    assert second_edit["created_at"] == created["created_at"] == first_edit["created_at"]
