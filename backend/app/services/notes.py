"""Owner-scoped note persistence (US-003-1).

All queries are filtered by `user_id` so one owner never sees, updates or
deletes another owner's notes (NFR-001). The owner's identity always comes
from the verified JWT subject (`get_current_owner`), resolved here to the
`users.id` the `notes.user_id` foreign key uses -- never from the request
body.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Note, User
from app.schemas import NoteCreate, NoteUpdate


def _owner_id(db: Session, owner_email: str) -> uuid.UUID:
    user = db.scalar(select(User).where(User.email == owner_email))
    if user is None:
        # The bearer JWT was valid but no longer matches a real owner row.
        raise LookupError("owner not found")
    return user.id


def list_notes(db: Session, owner_email: str, q: str | None = None) -> list[Note]:
    user_id = _owner_id(db, owner_email)
    stmt = select(Note).where(Note.user_id == user_id)
    term = q.strip() if q else ""
    if term:
        pattern = f"%{term}%"
        stmt = stmt.where(or_(Note.title.ilike(pattern), Note.body.ilike(pattern)))
    stmt = stmt.order_by(Note.updated_at.desc())
    return list(db.scalars(stmt))


def create_note(db: Session, owner_email: str, data: NoteCreate) -> Note:
    user_id = _owner_id(db, owner_email)
    note = Note(user_id=user_id, title=data.title, body=data.body)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def get_note(db: Session, owner_email: str, note_id: uuid.UUID) -> Note | None:
    user_id = _owner_id(db, owner_email)
    stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
    return db.scalar(stmt)


def update_note(db: Session, owner_email: str, note_id: uuid.UUID, data: NoteUpdate) -> Note | None:
    note = get_note(db, owner_email, note_id)
    if note is None:
        return None
    if data.title is not None:
        note.title = data.title
    if data.body is not None:
        note.body = data.body
    note.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, owner_email: str, note_id: uuid.UUID) -> bool:
    note = get_note(db, owner_email, note_id)
    if note is None:
        return False
    db.delete(note)
    db.commit()
    return True


__all__ = ["list_notes", "create_note", "get_note", "update_note", "delete_note"]
