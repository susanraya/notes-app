"""Note CRUD and search endpoints (architecture component: backend / Notes API).

Stub routes, same placeholder convention as `app/routers/auth.py`: each
reserves the path, method and request/response shape the approved API spec
declares. Persistence, JWT enforcement, newest-first ordering and the
full-text search over title and body (US-003 through US-010) are the
development sprint's work -- nothing here touches the database.
"""

from fastapi import APIRouter

from app.schemas import NoteCreate, NoteUpdate, StubResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=StubResponse)
async def list_notes(q: str | None = None) -> StubResponse:
    del q  # unused in the stub; accepted only to shape the OpenAPI query param
    return StubResponse(endpoint="GET /notes")


@router.post("", response_model=StubResponse, status_code=201)
async def create_note(note: NoteCreate) -> StubResponse:
    del note  # unused in the stub; accepted only to shape the OpenAPI body
    return StubResponse(endpoint="POST /notes")


@router.get("/{note_id}", response_model=StubResponse)
async def get_note(note_id: str) -> StubResponse:
    del note_id
    return StubResponse(endpoint="GET /notes/{id}")


@router.put("/{note_id}", response_model=StubResponse)
async def update_note(note_id: str, note: NoteUpdate) -> StubResponse:
    del note_id, note
    return StubResponse(endpoint="PUT /notes/{id}")


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str) -> None:
    del note_id
    return None
