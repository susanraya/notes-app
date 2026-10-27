# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
78 tests · Passed 67 · Failed 0 · Skipped 0 · Not run 11

Acceptance criteria covered: 9/26 · passing: 4/26
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start tests -->
## Sprint 1

### US-001: Log in with email and password

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-001 | test_ac001_correct_credentials_return_a_usable_jwt | Unit | Passed | `backend/tests/test_auth.py` |
| AC-002 | test_ac002_wrong_email_returns_401_with_no_token | Unit | Passed | `backend/tests/test_auth.py` |
| AC-002 | test_ac002_wrong_password_returns_401_with_no_token | Unit | Passed | `backend/tests/test_auth.py` |
| AC-003 | test_ac003_openapi_document_exposes_no_sign_up_endpoint | Unit | Passed | `backend/tests/test_auth.py` |
| AC-004 | test_ac004_notes_with_expired_token_returns_401 | Unit | Passed | `backend/tests/test_auth.py` |
| AC-004 | test_ac004_notes_with_malformed_token_returns_401 | Unit | Passed | `backend/tests/test_auth.py` |
| AC-004 | test_ac004_notes_with_no_token_returns_401 | Unit | Passed | `backend/tests/test_auth.py` |
| AC-005 | test_ac005_logout_succeeds_for_an_authenticated_caller | Unit | Passed | `backend/tests/test_auth.py` |
| — | test_nfr001_owner_password_is_stored_only_as_a_bcrypt_hash | Unit | Passed | `backend/tests/test_auth.py` |
| AC-004 | test_ac004_decode_access_token_rejects_expired_token | Unit | Passed | `backend/tests/test_security.py` |
| AC-004 | test_ac004_decode_access_token_rejects_malformed_token | Unit | Passed | `backend/tests/test_security.py` |
| — | test_create_and_decode_access_token_round_trips | Unit | Passed | `backend/tests/test_security.py` |
| — | test_hash_password_never_stores_plaintext | Unit | Passed | `backend/tests/test_security.py` |
| — | test_verify_password_accepts_correct_and_rejects_wrong | Unit | Passed | `backend/tests/test_security.py` |
| AC-004 | App > [AC-004] redirects /note to the login page when no token is stored | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-004 | App > [AC-004] redirects /notes to the login page when no token is stored, with no note content | Unit | Passed | `frontend/src/App.test.tsx` |
| AC-005 | App > [AC-005] logs out, clears the token and sends notes routes back to login | Unit | Passed | `frontend/src/App.test.tsx` |
| — | App > renders a screen inside the app shell and shows its menu when authenticated | Unit | Passed | `frontend/src/App.test.tsx` |
| — | apiFetch > attaches the stored JWT as the Authorization bearer | Unit | Passed | `frontend/src/lib/api.test.ts` |
| — | apiFetch > clears the stored token and redirects to /login on a 401 | Unit | Passed | `frontend/src/lib/api.test.ts` |
| — | apiFetch > sends no Authorization header when there is no stored token | Unit | Passed | `frontend/src/lib/api.test.ts` |
| AC-001 | Login screen > [AC-001] submits correct credentials, stores the token and navigates to notes | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-002 | Login screen > [AC-002] keeps the user on login and shows an error when credentials are rejected | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-003 | Login screen > [AC-003] offers no sign-up or account-creation link | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-001 | test_ac001_login_with_correct_credentials_returns_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | test_ac002_error_body_does_not_reveal_which_field_was_wrong | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | test_ac002_login_with_wrong_email_returns_generic_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | test_ac002_login_with_wrong_password_returns_generic_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-003 | test_ac003_no_signup_endpoint_in_openapi_document | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-004 | test_ac004_notes_endpoint_rejects_expired_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-004 | test_ac004_notes_endpoint_rejects_malformed_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-004 | test_ac004_notes_endpoint_rejects_missing_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-005 | test_ac005_logout_with_valid_token_returns_204 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-005 | test_ac005_logout_without_token_returns_401 | Integration | Passed | `backend/tests/integration/test_auth.py` |
| — | test_notes_endpoint_accepts_valid_token | Integration | Passed | `backend/tests/integration/test_auth.py` |
| AC-002 | [AC-002] a bad password keeps the user on the login page with a visible credential error | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-003 | [AC-003] the login page shows no sign-up option | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-004 | [AC-004] navigating directly to /note redirects to /login with no note content visible | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-004 | [AC-004] navigating directly to /notes redirects to /login with no note content visible | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| AC-005 | [AC-005] after logging out, /notes and /note redirect to /login again | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |
| — | lands on the notes list | E2E | Not run yet | `frontend/e2e/auth.spec.ts` |

### US-003: Create a new note

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-004 | Note screen > [AC-004] a 401 while opening a note clears the token and never shows note content | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-006 | Note screen > [AC-006] a new note opens an empty editor with a title field and a rich-text body | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-007 | Note screen > [AC-007] saving a new note calls POST /notes with the title | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-025 | Note screen > [AC-025] offers no sync, import, or export option | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > opens an existing note via GET /notes/{id} and renders its stored body | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > saving an existing note calls PUT /notes/{id} | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-004 | Notes screen > [AC-004] a 401 while loading notes clears the token and never shows note content | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-006 | Notes screen > [AC-006] clicking New note navigates to the note editor | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-024 | Notes screen > [AC-024] renders notes fetched from GET /notes with no seeded sample data | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-024 | Notes screen > [AC-024] shows an empty state when there are no notes | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-025 | Notes screen > [AC-025] offers no sync, import, or export option | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > deletes a note and removes it from the list | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > shows an error state and can retry when the list fails to load | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[delete-/1af157f5-7087-4caa-b797-34b392bc010a-None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[get--None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[get-/893967e2-e0b8-4bed-b9d5-a71daa5c5715-None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[post--json_body1] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[put-/eb9fdc7d-0d54-4e4c-bfa3-74eba58dd7d7-json_body3] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_delete_note_removes_it | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_delete_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_note_by_id_returns_it | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_note_with_malformed_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_notes_lists_the_created_note | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_post_notes_creates_a_note | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_put_note_updates_title_and_body | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_put_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-024 | test_ac024_note_created_in_one_session_is_read_back_unchanged_by_a_fresh_session | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-025 | test_ac025_openapi_document_exposes_no_sync_import_or_export_endpoint | Integration | Passed | `backend/tests/integration/test_notes.py` |
| — | test_rich_text_html_body_round_trips_through_post_then_get | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-024 | [AC-024] a note saved in one session is still listed with its title and body after logging out and back in | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | is offered on the note editor | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | is offered on the notes list | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | opens an empty editor with a title field and a rich-text body, and the saved note appears back in the list | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_health_reports_ok | Unit | Passed | `backend/tests/test_health.py` |
| — | test_the_openapi_document_builds | Unit | Passed | `backend/tests/test_health.py` |
| — | the app loads | E2E | Not run yet | `frontend/e2e/example.spec.ts` |
<!-- sdlc:auto:end tests -->
