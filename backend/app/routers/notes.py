"""Note CRUD endpoints (architecture component: backend / Notes API, US-003-1).

Thin handlers: persistence, ownership scoping and the newest-updated-first
ordering live in `app/services/notes.py`. Every route here depends on
`get_current_owner` (US-001, NFR-002): an unauthenticated request never
reaches a handler body.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_owner
from app.schemas import NoteCreate, NoteOut, NoteUpdate
from app.services import notes as notes_service

router = APIRouter(prefix="/notes", tags=["notes"])


def _parse_note_id(note_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(note_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Note not found"
        ) from None


@router.get("", response_model=list[NoteOut])
async def list_notes(
    q: str | None = Query(default=None),
    owner: str = Depends(get_current_owner),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> list[NoteOut]:
    notes = notes_service.list_notes(db, owner, q)
    return [NoteOut.model_validate(note) for note in notes]


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    owner: str = Depends(get_current_owner),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> NoteOut:
    created = notes_service.create_note(db, owner, note)
    return NoteOut.model_validate(created)


@router.get("/{note_id}", response_model=NoteOut)
async def get_note(
    note_id: str,
    owner: str = Depends(get_current_owner),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> NoteOut:
    found = notes_service.get_note(db, owner, _parse_note_id(note_id))
    if found is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return NoteOut.model_validate(found)


@router.put("/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: str,
    note: NoteUpdate,
    owner: str = Depends(get_current_owner),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> NoteOut:
    updated = notes_service.update_note(db, owner, _parse_note_id(note_id), note)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return NoteOut.model_validate(updated)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    owner: str = Depends(get_current_owner),  # noqa: B008
    db: Session = Depends(get_db),  # noqa: B008
) -> None:
    deleted = notes_service.delete_note(db, owner, _parse_note_id(note_id))
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return None
