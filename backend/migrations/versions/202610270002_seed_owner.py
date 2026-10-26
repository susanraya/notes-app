"""seed the single owner row

Revision ID: 202610270002
Revises: 202610270001
Create Date: 2026-10-27

NFR-001: creates exactly one `users` row, with the password stored as a
passlib bcrypt hash, never in plaintext. Reads the owner's real credentials
from `OWNER_EMAIL` / `OWNER_PASSWORD` (the platform injects these in every
deployed environment); the fallbacks here only let a fresh local clone run.
Idempotent: does nothing if a `users` row already exists, so re-running
migrations never creates a second owner.
"""

import os
import uuid

import sqlalchemy as sa
from alembic import op
from passlib.context import CryptContext

revision = "202610270002"
down_revision = "202610270001"
branch_labels = None
depends_on = None

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_users_table = sa.table(
    "users",
    sa.column("id", sa.Uuid(as_uuid=True)),
    sa.column("email", sa.String),
    sa.column("password_hash", sa.String),
)


def upgrade() -> None:
    bind = op.get_bind()
    already_seeded = bind.execute(sa.text("SELECT COUNT(*) FROM users")).scalar()
    if already_seeded:
        return

    email = os.environ.get("OWNER_EMAIL", "owner@example.com")
    password = os.environ.get("OWNER_PASSWORD", "change-me-now")
    bind.execute(
        _users_table.insert().values(
            id=uuid.uuid4(),
            email=email,
            password_hash=_pwd_context.hash(password),
        )
    )


def downgrade() -> None:
    op.execute("DELETE FROM users")
