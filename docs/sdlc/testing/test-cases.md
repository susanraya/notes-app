# Tests

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start summary -->
201 tests · Passed 154 · Failed 0 · Skipped 0 · Not run 47

Acceptance criteria covered: 33/37 · passing: 16/37
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
| AC-022 | Login screen > [AC-022] the page root has a sensible max content width and never forces a fixed width wider than the viewport | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-023 | Login screen > [AC-023] the Log in button meets the 44px minimum touch target at every width | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-023 | Login screen > [AC-023] the two-column layout only applies from the lg breakpoint, so it reflows to one column below it | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-028 | Login screen > [AC-028] on render, the page background, labels, inputs and primary button are all greyscale | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-029 | Login screen > [AC-029] field-level validation errors use the same monochrome treatment | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
| AC-029 | Login screen > [AC-029] the incorrect-credentials error banner renders in greyscale with sufficient contrast against its background | Unit | Passed | `frontend/src/screens/Login.test.tsx` |
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
| AC-008 | Note screen > [AC-008] applying a heading, a bullet list and a link to selected text each show the matching tag in the editor | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-008 | Note screen > [AC-008] applying bold to selected text shows a <strong> in the editor, is marked pressed, and is sent to PUT /notes/{id} | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-008 | Note screen > [AC-008] formatting applied before a save is still shown when the note is reopened | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-009 | Note screen > [AC-009] the editor offers no option to add file or image attachments | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-011 | Note screen > [AC-011] editing an existing note's title sends both the new title and the unchanged body in the save | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-011 | Note screen > [AC-011] reopening a note after it was edited shows the content the server now stores | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-012 | Note screen > [AC-012] after an edit is saved, the displayed last-updated stamp moves to the new updated_at from the server | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-022 | Note screen > [AC-022] at 1280px the screen root clips overflow and the content column, toolbar and status row stay within a bounded, centred width | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-023 | Note screen > [AC-023] at 375px the back, delete and all four formatting toolbar controls meet the 44px touch-target minimum | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-023 | Note screen > [AC-023] at 375px the delete-confirmation dialog's title wraps and its Cancel / Delete controls stack full-width at >=44px tall | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-023 | Note screen > [AC-023] at 375px the title, toolbar and body carry the classes that let them reflow to a narrow screen instead of overflowing it | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-025 | Note screen > [AC-025] offers no sync, import, or export option | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-032 | Note screen > [AC-032] ProseMirror content styles (headings, bold, lists, links, placeholder) use monochrome values | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-032 | Note screen > [AC-032] the title field, body field and formatting toolbar render in greyscale with no indigo/purple remaining | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-033 | Note screen > [AC-033] the active bold toolbar state renders in monochrome and is visually distinct from inactive | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-033 | Note screen > [AC-033] the active heading toolbar state renders in monochrome and is visually distinct from inactive | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-033 | Note screen > [AC-033] the active link toolbar state renders in monochrome and is visually distinct from inactive | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-033 | Note screen > [AC-033] the active list toolbar state renders in monochrome and is visually distinct from inactive | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-034 | Note screen > [AC-034] opening a saved note renders its title, body and applied formatting in the black-and-white palette with no indigo/purple remaining | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-035 | Note screen > [AC-035] the edit screen for an existing note uses the identical palette tokens as the view state | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > opens an existing note via GET /notes/{id} and renders its stored body | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > saving an existing note calls PUT /notes/{id} | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > the formatting toolbar wraps (reflows into additional rows) rather than overflowing at narrow widths | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > the load-error message for a saved note renders in the monochrome palette | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| — | Note screen > the status chip, save/last-updated indicator, back and delete affordances render in the monochrome palette for a saved note | Unit | Passed | `frontend/src/screens/Note.test.tsx` |
| AC-004 | Notes screen > [AC-004] a 401 while loading notes clears the token and never shows note content | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-006 | Notes screen > [AC-006] clicking New note navigates to the note editor | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-020 | Notes screen > [AC-020] typing a term in the search box calls GET /notes?q= and filters the list to matches | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-021 | Notes screen > [AC-021] shows an empty-result indication when no notes match, with a clear control that returns the full list | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-022 | Notes screen > [AC-022] the list column has a sensible max content width that keeps it readable at 1280px | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-022 | Notes screen > [AC-022] the top controls reflow to a single column below the sm breakpoint | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-023 | Notes screen > [AC-023] New note, search and clear-search controls each meet the 44px minimum touch target | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-023 | Notes screen > [AC-023] the per-row delete control meets the 44px minimum touch target | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-024 | Notes screen > [AC-024] renders notes fetched from GET /notes with no seeded sample data | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-024 | Notes screen > [AC-024] shows an empty state when there are no notes | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-025 | Notes screen > [AC-025] offers no sync, import, or export option | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-030 | Notes screen > [AC-030] dividers and the clear-search control render in the monochrome palette | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-030 | Notes screen > [AC-030] the search box, row text and hover-highlight colour are all greyscale with no indigo/purple/violet present | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-031 | Notes screen > [AC-031] the no-results indication for a search term renders in greyscale text with a legible clear-search action | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > debounces search requests so rapid keystrokes do not each trigger a fetch | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > deletes a note and removes it from the list | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > discards an in-flight response for a stale search term | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > shows a retry affordance on a failed search and never blanks the existing list | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| — | Notes screen > shows an error state and can retry when the list fails to load | Unit | Passed | `frontend/src/screens/Notes.test.tsx` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[delete-/6d8f30ba-a751-4d88-bdae-31cf8083fd0a-None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[get--None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[get-/45db213d-cdcd-4091-aab9-069a7e0a54a0-None] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[post--json_body1] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-004 | test_ac004_notes_endpoints_reject_requests_without_a_token[put-/7ec423c0-9de6-4126-9c29-f306ca3a257b-json_body3] | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_delete_note_removes_it | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_delete_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_note_by_id_returns_it | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_note_with_malformed_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_notes_lists_the_created_note | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_get_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_post_notes_creates_a_note | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_put_note_updates_title_and_body | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-007 | test_ac007_put_unknown_note_id_returns_404 | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-008 | test_ac008_bold_heading_list_and_link_markup_round_trips_through_put_then_get | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-009 | test_ac009_note_schema_has_no_attachment_or_file_field | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-009 | test_ac009_openapi_document_exposes_no_attachment_or_upload_endpoint | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-011 | test_ac011_a_second_edit_overwrites_the_first_and_is_what_reopening_shows | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-011 | test_ac011_put_changing_only_the_body_is_shown_on_reopen | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-011 | test_ac011_put_changing_only_the_title_is_shown_on_reopen | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-011 | test_ac011_put_changing_title_and_body_together_is_shown_on_reopen | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-012 | test_ac012_each_successive_edit_advances_updated_at_again | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-012 | test_ac012_put_advances_updated_at_but_leaves_created_at_unchanged | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-012 | test_ac012_reopening_the_note_after_an_edit_shows_the_new_updated_at | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-024 | test_ac024_note_created_in_one_session_is_read_back_unchanged_by_a_fresh_session | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-025 | test_ac025_openapi_document_exposes_no_sync_import_or_export_endpoint | Integration | Passed | `backend/tests/integration/test_notes.py` |
| — | test_rich_text_html_body_round_trips_through_post_then_get | Integration | Passed | `backend/tests/integration/test_notes.py` |
| AC-024 | [AC-024] a note saved in one session is still listed with its title and body after logging out and back in | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | is offered on the note editor | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | is offered on the notes list | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |
| — | opens an empty editor with a title field and a rich-text body, and the saved note appears back in the list | E2E | Not run yet | `frontend/e2e/notes.spec.ts` |

### FIX-COVERAGE-R1: —

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | ui kit > [AC-UI] Avatar renders an image when src is given | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Avatar shows initials when no image src is given | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Badge renders each variant including accent styling | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Button renders each variant and size without crashing | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Card compound components render their content | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Checkbox toggles checked state | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Empty renders title, description and action | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Empty renders without description or action | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Input, Textarea and Label render and accept input | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Select renders options from the options prop and from children | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Separator renders a horizontal rule | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Stat renders label, value and optional hint | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Stat renders without a hint when none is given | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Switch reflects checked prop and fires onChange | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Table family renders rows, headers and cells | Unit | Passed | `frontend/src/lib/ui.test.tsx` |
| — | ui kit > [AC-UI] Tabs renders each tab and calls onChange with its key | Unit | Passed | `frontend/src/lib/ui.test.tsx` |

## Sprint 2

### US-004: Format note body with rich text

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-008 | [AC-008] bold, heading, list and link applied to selected text are shown in the editor and are what it shows after saving and reopening | E2E | Not run yet | `frontend/e2e/format-note.spec.ts` |
| — | pasting an image file onto the body does not add an attachment control or an upload request | E2E | Not run yet | `frontend/e2e/format-note.spec.ts` |
| — | the note editor's formatting toolbar offers only bold, heading, list and link | E2E | Not run yet | `frontend/e2e/format-note.spec.ts` |

### US-006: Edit a note

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-012 | [AC-012] PUT /notes/{id} response reports an updated_at strictly later than the note's created_at | E2E | Not run yet | `frontend/e2e/edit-note.spec.ts` |
| AC-012 | [AC-012] saving an edit through the UI advances the note's updated_at, as confirmed directly from the API | E2E | Not run yet | `frontend/e2e/edit-note.spec.ts` |
| — | a changed title and body are stored and are what the note shows when it is reopened | E2E | Not run yet | `frontend/e2e/edit-note.spec.ts` |

### US-014: Define global black-and-white theme tokens

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-029 | [AC-029] a wrong-credentials login shows a monochrome, legible error message | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| AC-031 | [AC-031] the no-results indication for an unmatched search term is monochrome | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | background, text and input computed colours are greyscale, with no indigo/purple present | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | bold, list, heading and link each become monochrome-but-distinguishable once applied | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | dialog background, heading, description and buttons are monochrome with sufficient contrast | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | list rows, highlight accents and the search box use monochrome computed colours | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | title and body colours are identical before and after making an edit | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | title field, body field and toolbar computed colours are monochrome with no indigo/purple | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |
| — | title, body and formatted content are monochrome on reopen | E2E | Not run yet | `frontend/e2e/theme-monochrome.spec.ts` |

## Sprint 3

### US-010: Search notes by title and body

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-020 | test_ac020_q_is_case_insensitive | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-020 | test_ac020_q_matches_notes_by_body_only | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-020 | test_ac020_q_matches_notes_by_title_only | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-020 | test_ac020_q_with_no_matches_returns_empty_list | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-021 | test_ac021_absent_q_returns_full_list_newest_updated_first | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-021 | test_ac021_empty_q_returns_full_list_newest_updated_first | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-021 | test_ac021_whitespace_only_q_is_treated_as_empty | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| — | test_ac_q_search_without_token_returns_401 | Integration | Passed | `backend/tests/integration/test_notes_search.py` |
| AC-020 | [AC-020] search by title matches independently of case | E2E | Not run yet | `frontend/e2e/notes-search.spec.ts` |
| — | typing a term filters the visible list to matching notes, a non-matching term shows the empty-result indication, and clearing it restores the full list | E2E | Not run yet | `frontend/e2e/notes-search.spec.ts` |

### US-011: Use the app on desktop and mobile browsers

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | login screen reflows without horizontal overflow, and logging in is clickable with a touch-sized target | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |
| — | login screen renders without horizontal overflow and with core controls visible | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |
| — | note editor reflows without horizontal overflow, and its delete control is clickable with a touch-sized target | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |
| — | note editor renders without horizontal overflow and with core controls visible | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |
| — | notes list reflows without horizontal overflow, and new note / search / open note / delete are clickable with touch-sized targets | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |
| — | notes list renders without horizontal overflow and with core controls visible | E2E | Not run yet | `frontend/e2e/responsive.spec.ts` |

### US-013: Use the app free of charge

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| AC-026 | test_ac026_a_full_crud_cycle_never_returns_402_payment_required | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | test_ac026_an_unknown_note_id_returns_plain_404_not_a_payment_gate | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | test_ac026_login_response_carries_no_payment_or_subscription_field | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | test_ac026_note_schema_carries_no_payment_or_subscription_field | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | test_ac026_openapi_document_exposes_no_payment_billing_subscription_or_paywall_endpoint | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | test_ac026_openapi_document_schemas_carry_no_plan_tier_quota_or_billing_field | Integration | Passed | `backend/tests/integration/test_no_billing.py` |
| AC-026 | [AC-026] a failed login attempt does not surface a payment or subscription prompt | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |
| AC-026 | [AC-026] creating, formatting, auto-saving and deleting a note never presents a payment, billing, subscription or paywall screen | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |
| AC-026 | [AC-026] no payment, billing or subscription endpoint can be reached through the running API, and a full CRUD cycle never returns 402 Payment Required | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |
| AC-026 | [AC-026] searching notes presents no payment, billing, subscription or paywall wording | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |
| AC-026 | [AC-026] the login screen presents no payment, billing, subscription or paywall wording | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |
| AC-026 | [AC-026] the notes list presents no payment, billing, subscription or paywall wording | E2E | Not run yet | `frontend/e2e/no-paywall.spec.ts` |

## Project setup

| Criteria | Test | Level | Result | File |
|---|---|---|---|---|
| — | test_health_reports_ok | Unit | Passed | `backend/tests/test_health.py` |
| — | test_the_openapi_document_builds | Unit | Passed | `backend/tests/test_health.py` |
| AC-004 | test_ac004_notes_id_endpoints_reject_requests_without_a_token[delete-None] | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-004 | test_ac004_notes_id_endpoints_reject_requests_without_a_token[get-None] | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-004 | test_ac004_notes_id_endpoints_reject_requests_without_a_token[put-json_body1] | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-011, AC-012 | test_ac011_ac012_put_changes_title_and_body_and_raises_updated_at | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-015, AC-016 | test_ac015_ac016_delete_removes_note_from_list_and_get_returns_404 | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-016 | test_ac016_no_recovery_route_in_openapi_document | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| AC-017, AC-018 | test_ac017_ac018_list_is_newest_updated_first_and_edit_moves_note_to_head | Integration | Passed | `backend/tests/integration/test_notes_lifecycle.py` |
| — | the app loads | E2E | Not run yet | `frontend/e2e/example.spec.ts` |
| AC-008 | [AC-008] bold, a bullet list, a heading and a link applied to the body survive a save and a reopen | E2E | Not run yet | `frontend/e2e/note-editor.spec.ts` |
| AC-009 | [AC-009] no file or image attachment control is present on the note editor | E2E | Not run yet | `frontend/e2e/note-editor.spec.ts` |
| AC-010 | [AC-010] selecting a note from the list renders its title and formatted body | E2E | Not run yet | `frontend/e2e/note-editor.spec.ts` |
| AC-013 | [AC-013] typing into a note auto-saves and updates the last-updated indicator without an explicit save click | E2E | Not run yet | `frontend/e2e/note-editor.spec.ts` |
| AC-014 | [AC-014][NFR-003] reloading the page and reopening the note shows the most recently auto-saved content | E2E | Not run yet | `frontend/e2e/note-editor.spec.ts` |
| AC-015, AC-016 | [AC-015][AC-016] deleting a note from the list removes it and it stays gone after reload | E2E | Not run yet | `frontend/e2e/notes-list.spec.ts` |
| — | renders newest-updated-first and shows no tags, labels, folders or notebooks | E2E | Not run yet | `frontend/e2e/notes-list.spec.ts` |
<!-- sdlc:auto:end tests -->
