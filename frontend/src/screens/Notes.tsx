// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, Search, X, ChevronRight, Clock, Trash, AlertCircle, CheckCircle } = Icons;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toRGB = (hex) => {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const N_RGB = toRGB(brand.neutralColor);

const T = {
  bg: brand.backgroundColor,
  surface: `rgba(${N_RGB}, 0.05)`,
  surfaceUp: `rgba(${N_RGB}, 0.09)`,
  hairline: `rgba(${N_RGB}, 0.18)`,
  hairlineSoft: `rgba(${N_RGB}, 0.1)`,
  text: 'rgba(255, 255, 255, 0.93)',
  muted: brand.neutralColor,
  faint: `rgba(${N_RGB}, 0.7)`,
  accent: brand.primaryColor,
  accentSoft: `rgba(${toRGB(brand.primaryColor)}, 0.16)`,
  danger: brand.accentColor,
  dangerSoft: `rgba(${toRGB(brand.accentColor)}, 0.14)`,
  radius: brand.radius,
};

const HEAD = `${brand.fontHeading}, ui-sans-serif, system-ui, -apple-system, sans-serif`;
const BODY = `${brand.fontBody}, Iowan Old Style, Georgia, serif`;
const NUM = { fontVariantNumeric: 'tabular-nums' };

const FLAKY_ID = 'n_c704';

const SEED_NOTES = [
  {
    id: 'n_a19f',
    user_id: 'u_1',
    title: 'Groceries for the week',
    body: 'Oat milk ×2, sourdough starter flour (rye), chestnut mushrooms, lemons, anchovies for the pasta on Thursday. Skip the market — stall closes at noon on Wednesdays.',
    created_at: '2026-10-26T08:11:00',
    updated_at: '2026-10-26T14:32:00',
  },
  {
    id: 'n_7b52',
    user_id: 'u_1',
    title: 'Sprint retro takeaways',
    body: 'Keep: the Tuesday pairing hour. Drop: estimating in hours. Try: writing the acceptance notes before the ticket. Marek to own the flaky deploy check this sprint.',
    created_at: '2026-10-26T09:00:00',
    updated_at: '2026-10-26T09:05:00',
  },
  {
    id: 'n_31d8',
    user_id: 'u_1',
    title: 'Reading list 2026',
    body: 'Finished: The Dawn of Everything, Piranesi. Next: Small Things Like These, A Short History of Nearly Everything. Anja recommended the Ishiguro essays — library has one copy.',
    created_at: '2026-01-04T10:22:00',
    updated_at: '2026-10-24T20:41:00',
  },
  {
    id: 'n_c704',
    user_id: 'u_1',
    title: 'Flat viewing questions',
    body: 'Which year was the boiler replaced? Service charge for 2027 and what it covers. Is the bike store allocated or first-come? Ask about the works on the rear elevation.',
    created_at: '2026-10-20T07:44:00',
    updated_at: '2026-10-21T18:12:00',
  },
  {
    id: 'n_5e60',
    user_id: 'u_1',
    title: 'Dad’s birthday — gift ideas',
    body: 'Record shop voucher, the Ordnance Survey map of the Peaks he keeps borrowing, or tickets for the Hallé on 12 Dec. Decide by Friday so it arrives in time.',
    created_at: '2026-10-18T19:30:00',
    updated_at: '2026-10-20T21:58:00',
  },
  {
    id: 'n_9fa3',
    user_id: 'u_1',
    title: 'Call notes: Ineke at Vestia',
    body: 'She needs the scope note by 2 Nov. Budget sits with facilities, not marketing. Two rounds of revision included; anything past that is quoted separately.',
    created_at: '2026-10-19T11:02:00',
    updated_at: '2026-10-19T11:26:00',
  },
  {
    id: 'n_2cc1',
    user_id: 'u_1',
    title: 'Sourdough: what went wrong',
    body: 'Over-proofed — left it four hours at 24°C. Next time: shorter bulk, colder kitchen, and shape twice. The crumb was dense near the base, crust fine.',
    created_at: '2026-10-17T07:50:00',
    updated_at: '2026-10-17T08:03:00',
  },
  {
    id: 'n_8d47',
    user_id: 'u_1',
    title: 'Harbourline Studio — payment chase',
    body: 'Second reminder sent 14 Oct, net-30 terms agreed in writing. If nothing by 28 Oct, phone Rebecca directly rather than emailing the shared inbox again.',
    created_at: '2026-10-14T09:15:00',
    updated_at: '2026-10-15T16:47:00',
  },
  {
    id: 'n_6b09',
    user_id: 'u_1',
    title: 'Half-marathon training plan',
    body: 'Week 5: easy 6k Tuesday, hills Thursday, long run 16k Sunday along the canal. Shoes are at roughly 480km — replace before week 9.',
    created_at: '2026-09-21T06:20:00',
    updated_at: '2026-10-13T06:34:00',
  },
  {
    id: 'n_4a7e',
    user_id: 'u_1',
    title: 'Things to fix in the flat',
    body: 'Bathroom extractor rattles. Second hob ring ignites slowly. Draught under the hallway door — brush strip, not foam. Touch up the skirting in the back room.',
    created_at: '2026-10-09T18:05:00',
    updated_at: '2026-10-11T19:20:00',
  },
  {
    id: 'n_0f93',
    user_id: 'u_1',
    title: 'Lisbon trip — rough plan',
    body: 'Four nights, mid-March. Stay in Príncipe Real. Gulbenkian on the quiet morning, tram 28 early or not at all, day trip to Sintra midweek when it is calmer.',
    created_at: '2026-10-08T12:40:00',
    updated_at: '2026-10-08T13:09:00',
  },
  {
    id: 'n_d215',
    user_id: 'u_1',
    title: 'Password manager migration',
    body: 'Export finished, 214 entries moved. Still to do: old banking logins, two shared household accounts, and turn off the browser’s built-in saving everywhere.',
    created_at: '2026-10-05T21:40:00',
    updated_at: '2026-10-05T22:15:00',
  },
];

const pad = (n) => String(n).padStart(2, '0');

const fmtStamp = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const QD_CSS = `
.qd-focus:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; border-radius: ${T.radius}; }
.qd-row { animation: qd-rise 260ms ease-out both; }
.qd-dialog { animation: qd-rise 180ms ease-out both; }
.qd-backdrop { animation: qd-fade 160ms ease-out both; }
.qd-toast { animation: qd-rise 220ms ease-out both; }
@keyframes qd-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes qd-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .qd-row, .qd-dialog, .qd-backdrop, .qd-toast { animation-duration: 1ms !important; }
  * { transition-duration: 1ms !important; }
}
`;

export default function Screen() {
  const navigate = useNavigate();
  const [notes, setNotes] = React.useState(SEED_NOTES);
  const [query, setQuery] = React.useState('');
  const [pending, setPending] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [dialogError, setDialogError] = React.useState('');
  const [failedOnce, setFailedOnce] = React.useState([]);
  const [toast, setToast] = React.useState('');

  const cancelRef = React.useRef(null);
  const deleteRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const timers = React.useRef([]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (pending && cancelRef.current) cancelRef.current.focus();
  }, [pending]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 5000);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [toast]);

  const sorted = React.useMemo(
    () => [...notes].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [notes]
  );

  const term = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!term) return sorted;
    return sorted.filter(
      (n) => n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term)
    );
  }, [sorted, term]);

  const closeDialog = () => {
    setPending(null);
    setDeleting(false);
    setDialogError('');
    const el = triggerRef.current;
    if (el && document.body.contains(el)) el.focus();
  };

  const openDelete = (note, event) => {
    triggerRef.current = event.currentTarget;
    setDialogError('');
    setPending(note);
  };

  const confirmDelete = () => {
    if (!pending) return;
    const target = pending;
    setDeleting(true);
    setDialogError('');
    const t = setTimeout(() => {
      setDeleting(false);
      if (target.id === FLAKY_ID && !failedOnce.includes(target.id)) {
        setFailedOnce((f) => [...f, target.id]);
        setDialogError('The store turned that delete down. Nothing was removed — try once more.');
        if (deleteRef.current) deleteRef.current.focus();
        return;
      }
      setNotes((list) => list.filter((n) => n.id !== target.id));
      setPending(null);
      setToast(`Deleted “${target.title}”. There is no version history, so it is gone for good.`);
      triggerRef.current = null;
    }, 700);
    timers.current.push(t);
  };

  const onDialogKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    const order = [cancelRef.current, deleteRef.current].filter(Boolean);
    if (order.length < 2) return;
    const first = order[0];
    const last = order[order.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const primaryBtn = {
    backgroundColor: T.accent,
    color: T.bg,
    borderRadius: T.radius,
    fontFamily: HEAD,
    border: '1px solid transparent',
  };
  const quietBtn = {
    backgroundColor: 'transparent',
    color: T.muted,
    border: `1px solid ${T.hairline}`,
    borderRadius: T.radius,
    fontFamily: HEAD,
  };

  return (
    <div
      className="min-h-full w-full px-4 py-8 sm:px-8 sm:py-12"
      style={{ backgroundColor: T.bg, color: T.text, fontFamily: BODY }}
    >
      <style>{QD_CSS}</style>

      <div className="mx-auto w-full max-w-3xl">
        {/* Row 1 — title + actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:items-end">
          <div data-wf="b-0-0" className="sm:col-span-8">
            <h1
              className="text-3xl sm:text-[34px] leading-tight tracking-tight"
              style={{ fontFamily: HEAD, fontWeight: 600, color: T.text }}
            >
              All notes <span style={NUM}>({notes.length})</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: T.faint }}>
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span style={NUM}>Kept in this app’s own store · last loaded 14:33</span>
            </p>
          </div>

          <div className="flex items-center gap-3 sm:col-span-4 sm:justify-end">
            <Button
              data-wf="b-0-1"
              onClick={() => navigate('note')}
              className="qd-focus inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 px-5 text-[15px] font-semibold transition-opacity hover:opacity-90 sm:flex-none"
              style={primaryBtn}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New note
            </Button>
          </div>
        </div>

        {/* Row 2 — search */}
        <form
          data-wf="b-1-0"
          className="mt-8"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <Label
            htmlFor="note-search"
            className="block text-[11px] uppercase tracking-[0.14em]"
            style={{ color: T.faint, fontFamily: HEAD }}
          >
            Search
          </Label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: T.faint }}
              aria-hidden="true"
            />
            <Input
              id="note-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes by title or text"
              autoComplete="off"
              className="qd-focus h-12 w-full pl-10 pr-12 text-[15px] placeholder:opacity-60"
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.hairline}`,
                borderRadius: T.radius,
                color: T.text,
                fontFamily: BODY,
              }}
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="qd-focus absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition-colors"
                style={{ color: T.muted, borderRadius: T.radius }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {/* Row 3 — list */}
        <section data-wf="b-2-0" className="mt-10" aria-labelledby="notes-list-heading">
          <div
            className="flex flex-wrap items-baseline justify-between gap-2 pb-3"
            style={{ borderBottom: `1px solid ${T.hairline}` }}
          >
            <h2
              id="notes-list-heading"
              className="text-[13px] uppercase tracking-[0.14em]"
              style={{ fontFamily: HEAD, fontWeight: 600, color: T.muted }}
            >
              Newest first
            </h2>
            <p className="text-[13px]" style={{ ...NUM, color: T.faint }} aria-live="polite">
              {notes.length === 0
                ? 'Nothing saved yet'
                : term
                ? `${filtered.length} of ${notes.length} notes match “${query.trim()}”`
                : `${notes.length} notes, newest change first`}
            </p>
          </div>

          {notes.length === 0 ? (
            <div className="py-10">
              <Empty
                title="Nothing written here yet"
                description="Your notes stay in this app’s own store — nothing is synced anywhere else. Start with a title and a few lines; it saves as you type."
                action={
                  <Button
                    onClick={() => navigate('note')}
                    className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Write your first note
                  </Button>
                }
              />
            </div>
          ) : filtered.length === 0 ? null : (
            <ul className="relative m-0 list-none p-0">
              {/* notebook margin rule — the signature of Quiet Desk */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 w-px"
                style={{ left: '62px', backgroundColor: T.accentSoft }}
              />
              {filtered.map((note, i) => {
                const d = new Date(note.updated_at);
                return (
                  <li
                    key={note.id}
                    className="qd-row group relative"
                    style={{ borderBottom: `1px solid ${T.hairlineSoft}` }}
                  >
                    <div className="flex items-start gap-1 transition-colors group-hover:bg-[color:var(--qd-hover)]"
                      style={{ '--qd-hover': T.surface }}
                    >
                      <button
                        type="button"
                        data-wf={i < 4 ? `i-2-0-${i}` : undefined}
                        onClick={() => navigate('note')}
                        className="qd-focus flex min-w-0 flex-1 items-start gap-5 py-5 pl-2 pr-1 text-left"
                      >
                        <span
                          className="flex w-12 shrink-0 flex-col items-start leading-none"
                          style={{ ...NUM, fontFamily: HEAD }}
                          aria-hidden="true"
                        >
                          <span className="text-[20px]" style={{ color: T.text, fontWeight: 600 }}>
                            {pad(d.getDate())}
                          </span>
                          <span
                            className="mt-1 text-[10px] uppercase tracking-[0.16em]"
                            style={{ color: T.faint }}
                          >
                            {MONTHS[d.getMonth()]}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-[17px]"
                            style={{ fontFamily: HEAD, fontWeight: 600, color: T.text }}
                          >
                            {note.title}
                          </span>
                          <span
                            className="mt-1.5 block truncate text-[15px] leading-relaxed"
                            style={{ color: T.muted }}
                          >
                            {note.body}
                          </span>
                          <span
                            className="mt-2 block text-[12px]"
                            style={{ ...NUM, color: T.faint }}
                          >
                            Updated {fmtStamp(note.updated_at)}
                          </span>
                        </span>

                        <ChevronRight
                          className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
                          style={{ color: T.muted }}
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete “${note.title}”`}
                        onClick={(e) => openDelete(note, e)}
                        className="qd-focus mt-4 flex h-11 w-11 shrink-0 items-center justify-center transition-colors"
                        style={{ color: T.faint, borderRadius: T.radius }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = T.danger;
                          e.currentTarget.style.backgroundColor = T.dangerSoft;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = T.faint;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Row 4 — no-results empty state */}
        {notes.length > 0 && filtered.length === 0 ? (
          <div data-wf="b-3-0" className="qd-row py-12">
            <Empty
              title={`No notes match “${query.trim()}”`}
              description="Clear the search to see all notes. Search looks at both the title and the text of every note."
              action={
                <Button
                  onClick={() => setQuery('')}
                  className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                  style={primaryBtn}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear search
                </Button>
              }
            />
          </div>
        ) : null}
      </div>

      {/* Rows 5 + 6 — delete confirmation */}
      {pending ? (
        <div
          className="qd-backdrop fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            data-wf="b-4-0"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onKeyDown={onDialogKeyDown}
            ref={null}
            className="qd-dialog w-full max-w-md p-6 shadow-2xl"
            style={{
              backgroundColor: T.bg,
              border: `1px solid ${T.hairline}`,
              borderRadius: T.radius,
            }}
          >
            <h2
              id="delete-title"
              className="text-[20px] leading-snug"
              style={{ fontFamily: HEAD, fontWeight: 600, color: T.text }}
            >
              Delete “{pending.title}”?
            </h2>
            <p
              id="delete-desc"
              className="mt-3 text-[15px] leading-relaxed"
              style={{ color: T.muted }}
            >
              It is removed permanently and cannot be recovered.
            </p>

            {dialogError ? (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 p-3 text-[14px] leading-relaxed"
                style={{
                  color: T.text,
                  backgroundColor: T.dangerSoft,
                  border: `1px solid ${T.danger}`,
                  borderRadius: T.radius,
                }}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.danger }} aria-hidden="true" />
                <span>{dialogError}</span>
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                data-wf="b-5-0"
                ref={cancelRef}
                onClick={closeDialog}
                disabled={deleting}
                className="qd-focus inline-flex min-h-[44px] items-center justify-center px-4 text-[15px] transition-colors disabled:opacity-50"
                style={quietBtn}
              >
                Cancel
              </Button>
              <Button
                data-wf="b-5-1"
                ref={deleteRef}
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting ? 'true' : 'false'}
                className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-4 text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
                style={{
                  backgroundColor: T.danger,
                  color: T.bg,
                  borderRadius: T.radius,
                  fontFamily: HEAD,
                  border: '1px solid transparent',
                }}
              >
                {deleting ? (
                  <>
                    <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Deleting…
                  </>
                ) : dialogError ? (
                  'Try delete again'
                ) : (
                  'Delete note'
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmation of a completed delete */}
      <div aria-live="polite" className="sr-only">
        {toast}
      </div>
      {toast ? (
        <div
          className="qd-toast fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-md items-start gap-3 p-4 shadow-2xl"
          style={{
            backgroundColor: T.surfaceUp,
            border: `1px solid ${T.hairline}`,
            borderRadius: T.radius,
            backdropFilter: 'none',
          }}
        >
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.accent }} aria-hidden="true" />
          <p className="flex-1 text-[14px] leading-relaxed" style={{ color: T.text }}>
            {toast}
          </p>
        </div>
      ) : null}
    </div>
  );
}
