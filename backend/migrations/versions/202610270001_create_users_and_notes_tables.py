"""create users and notes tables

Revision ID: 202610270001
Revises:
Create Date: 2026-10-27

Additive only: creates the two tables the approved data model declares
(`users` holds the single owner's login; `notes` holds their notes). No
existing table is touched. Guarded with `has_table` so re-running against an
environment that already has them (e.g. a local SQLite file left over from
before migrations existed) is a no-op rather than an error.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import TSVECTOR

revision = "202610270001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
            sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )

    if not inspector.has_table("notes"):
        op.create_table(
            "notes",
            sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
            sa.Column(
                "user_id",
                sa.Uuid(as_uuid=True),
                sa.ForeignKey("users.id"),
                nullable=False,
                index=True,
            ),
            sa.Column("title", sa.String(500), nullable=True),
            sa.Column("body", sa.Text(), nullable=True),
            sa.Column(
                "search_vector", sa.Text().with_variant(TSVECTOR(), "postgresql"), nullable=True
            ),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )


def downgrade() -> None:
    op.drop_table("notes")
    op.drop_table("users")
