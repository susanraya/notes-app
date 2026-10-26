"""Shared fixtures for the auth test suite.

Runs against the real database the app is configured with (`DATABASE_URL`,
falling back to the SQLite default in `app/database.py`) and the real FastAPI
app -- nothing here mocks the database or the auth endpoints. There is no
sign-up endpoint, so the single owner's row is created directly through the
`User` model, exactly as a migration/seed step would.
"""

import uuid

import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext

from app.database import Base, SessionLocal, engine
from app.main import app

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

Base.metadata.create_all(bind=engine)


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def owner_credentials():
    """Creates a fresh owner row with a known plaintext password, and removes it
    afterwards so repeated runs against a persistent database (Postgres) do not
    collide on the unique email constraint."""
    from app.models import User

    email = f"owner.{uuid.uuid4().hex[:10]}@example.com"
    password = "Correct-Horse-Battery-Staple-1"
    password_hash = _pwd_context.hash(password)

    session = SessionLocal()
    try:
        user = User(email=email, password_hash=password_hash)
        session.add(user)
        session.commit()
        session.refresh(user)
        user_id = user.id
    finally:
        session.close()

    yield {"email": email, "password": password, "password_hash": password_hash, "id": user_id}

    session = SessionLocal()
    try:
        row = session.get(User, user_id)
        if row is not None:
            session.delete(row)
            session.commit()
    finally:
        session.close()
