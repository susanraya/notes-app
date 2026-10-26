"""SQLAlchemy models.

One class per entity in the approved data model: `users` (the single
owner's credentials) and `notes` (their notes). Columns use SQLAlchemy's
cross-dialect generic types (`Uuid`, `DateTime(timezone=True)`) so the same
schema that the architecture approved for PostgreSQL also creates cleanly
against the zero-setup SQLite default in `database.py` and in the
Playwright e2e run, which boots the API against that default.

`search_vector` is the one column PostgreSQL-specific: `.with_variant` asks
for the real `tsvector` the architecture calls for on PostgreSQL, and falls
back to plain text everywhere else. Populating it and querying it is the
development sprint's work (US-010), not this scaffold's -- it is declared
here only because the data model says the column exists.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """The single owner's login (data model: `users`)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    notes: Mapped[list["Note"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Note(Base):
    """One of the owner's notes (data model: `notes`)."""

    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    # Nullable per the approved data model, though every create/update in the
    # API spec sends both -- enforcing "required" is request validation, the
    # development sprint's work, not a column constraint this scaffold adds.
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    search_vector: Mapped[str | None] = mapped_column(
        Text().with_variant(TSVECTOR(), "postgresql"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="notes")


__all__ = ["Base", "User", "Note"]
