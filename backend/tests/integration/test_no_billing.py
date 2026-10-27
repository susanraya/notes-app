"""Integration tests for US-013 -- AC-026: the app is free of charge.

Runs against the real PostgreSQL service (DATABASE_URL); `conftest.py` in
this package applies the Alembic migrations, including the seeded owner
row, before these run. Nothing here mocks the database or the app.

AC-026 is a negative guarantee -- no payment, billing, subscription or
paywall screen is presented at any point while using any feature. On the
backend that means: no such endpoint is declared in the approved API
surface, no note or auth response carries a payment-shaped field (including
a plan, tier, quota or billing field), and a normal, uninterrupted CRUD flow
through every /notes verb never returns a 402 Payment Required or any other
response that gates the feature behind payment.
"""

import os
import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

_OWNER_EMAIL = os.environ["OWNER_EMAIL"]
_OWNER_PASSWORD = os.environ["OWNER_PASSWORD"]

_BILLING_WORDS = (
    "pay",
    "payment",
    "bill",
    "billing",
    "subscribe",
    "subscription",
    "plan",
    "tier",
    "quota",
    "pricing",
    "paywall",
    "checkout",
    "invoice",
    "upgrade",
    "trial",
)


def _login_token() -> str:
    response = client.post("/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD})
    assert response.status_code == 200
    return response.json()["access_token"]


def _auth_headers() -> dict:
    return {"Authorization": f"Bearer {_login_token()}"}


def test_ac026_openapi_document_exposes_no_payment_billing_subscription_or_paywall_endpoint():
    paths = client.get("/openapi.json").json()["paths"]

    for path in paths:
        lowered = path.lower()
        for word in _BILLING_WORDS:
            assert word not in lowered, f"path {path!r} looks billing-related"


def test_ac026_login_response_carries_no_payment_or_subscription_field():
    response = client.post("/auth/login", json={"email": _OWNER_EMAIL, "password": _OWNER_PASSWORD})

    assert response.status_code == 200
    keys = {key.lower() for key in response.json()}
    for word in _BILLING_WORDS:
        assert word not in keys


def test_ac026_note_schema_carries_no_payment_or_subscription_field():
    headers = _auth_headers()

    created = client.post(
        "/notes", json={"title": "Free note", "body": "no charge here"}, headers=headers
    )
    assert created.status_code == 201
    note_id = created.json()["id"]
    try:
        for payload in (created.json(), client.get(f"/notes/{note_id}", headers=headers).json()):
            keys = {key.lower() for key in payload}
            for word in _BILLING_WORDS:
                assert word not in keys
    finally:
        client.delete(f"/notes/{note_id}", headers=headers)


def test_ac026_openapi_document_schemas_carry_no_plan_tier_quota_or_billing_field():
    """Checks every declared component schema (not just a sampled response
    body) for a plan, tier, quota or billing-shaped property name, so the
    guarantee holds even for fields that happen to be absent/None on any
    single sampled response."""
    openapi = client.get("/openapi.json").json()
    schemas = openapi.get("components", {}).get("schemas", {})

    assert schemas, "expected at least one component schema in the OpenAPI document"

    for schema_name, schema in schemas.items():
        properties = schema.get("properties", {})
        for property_name in properties:
            lowered = property_name.lower()
            for word in ("plan", "tier", "quota", "bill", "billing", "subscription", "pay", "payment"):
                assert word not in lowered, (
                    f"schema {schema_name!r} has a billing-shaped field {property_name!r}"
                )


def test_ac026_a_full_crud_cycle_never_returns_402_payment_required():
    headers = _auth_headers()

    # List, create, read, update and delete a note -- every feature a user
    # can exercise through this API -- none of it is ever gated by payment.
    responses = []
    responses.append(client.get("/notes", headers=headers))
    created = client.post(
        "/notes", json={"title": "Free to use", "body": "no plans here"}, headers=headers
    )
    responses.append(created)
    note_id = created.json()["id"]
    responses.append(client.get(f"/notes/{note_id}", headers=headers))
    responses.append(
        client.put(
            f"/notes/{note_id}",
            json={"title": "Still free", "body": "still no charge"},
            headers=headers,
        )
    )
    responses.append(client.get("/notes?q=still", headers=headers))
    responses.append(client.delete(f"/notes/{note_id}", headers=headers))

    for response in responses:
        assert response.status_code != 402

    # A follow-up search/list call also never surfaces a payment gate, even
    # repeated past the single note above.
    for _ in range(3):
        again = client.get("/notes", headers=headers)
        assert again.status_code != 402


def test_ac026_an_unknown_note_id_returns_plain_404_not_a_payment_gate():
    headers = _auth_headers()

    response = client.get(f"/notes/{uuid.uuid4()}", headers=headers)

    assert response.status_code == 404
    assert response.status_code != 402
    detail = str(response.json().get("detail", "")).lower()
    for word in _BILLING_WORDS:
        assert word not in detail
