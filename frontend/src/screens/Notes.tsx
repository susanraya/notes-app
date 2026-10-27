import * as React from "react";
import { useNavigate } from "react-router-dom";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch } from "@/lib/api";

const { Button, Input, Label, Empty } = UI;
const { Plus, Search, X, ChevronRight, Clock, Trash, AlertCircle, CheckCircle } = Icons;

export interface NoteOut {
  id: string;
  title: string;
  body: string;
  updated_at: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEARCH_DEBOUNCE_MS = 300;

const toRGB = (hex: string): string => {
  const h = String(hex || "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const N_RGB = toRGB(brand.neutralColor);
const PRIMARY_RGB = toRGB(brand.primaryColor);
const BG_RGB = toRGB(brand.backgroundColor);

const T = {
  bg: brand.backgroundColor,
  surface: `rgba(${N_RGB}, 0.05)`,
  surfaceUp: `rgba(${N_RGB}, 0.09)`,
  hairline: `rgba(${N_RGB}, 0.18)`,
  hairlineSoft: `rgba(${N_RGB}, 0.1)`,
  text: `rgba(${PRIMARY_RGB}, 0.93)`,
  muted: brand.neutralColor,
  faint: `rgba(${N_RGB}, 0.7)`,
  accent: brand.primaryColor,
  accentSoft: `rgba(${PRIMARY_RGB}, 0.16)`,
  danger: brand.accentColor,
  dangerSoft: `rgba(${toRGB(brand.accentColor)}, 0.14)`,
  hoverBg: `rgba(${N_RGB}, 0.08)`,
  backdrop: `rgba(${BG_RGB}, 0.6)`,
  radius: brand.radius,
};

// Shared, literal monochrome values for the delete-confirmation dialog.
// These are duplicated verbatim in Note.tsx so both dialogs render
// identically rather than drifting from each screen's own derived palette.
const DIALOG = {
  backdrop: "rgba(0, 0, 0, 0.78)",
  surface: "rgb(18, 18, 18)",
  border: "rgba(154, 154, 154, 0.25)",
  title: "#ffffff",
  desc: "rgba(154, 154, 154, 0.85)",
  cancelBorder: "rgba(154, 154, 154, 0.3)",
  cancelText: "#e5e5e5",
  deleteBg: "#3a3a3a",
  deleteText: "#ffffff",
  errorBg: "rgba(154, 154, 154, 0.12)",
  errorBorder: "rgba(154, 154, 154, 0.4)",
  errorText: "#f5f5f5",
};

const HEAD = `${brand.fontHeading}, ui-sans-serif, system-ui, -apple-system, sans-serif`;
const BODY = `${brand.fontBody}, Iowan Old Style, Georgia, serif`;
const NUM = { fontVariantNumeric: "tabular-nums" } as const;

const pad = (n: number) => String(n).padStart(2, "0");

const fmtStamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const stripHtml = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h1|h2|h3|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

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
  const [notes, setNotes] = React.useState<NoteOut[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [pending, setPending] = React.useState<NoteOut | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [dialogError, setDialogError] = React.useState("");
  const [toast, setToast] = React.useState("");

  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const deleteRef = React.useRef<HTMLButtonElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // Only the most recently issued request is allowed to update state: a
  // response for a term the user has since changed away from is discarded.
  const requestSeq = React.useRef(0);

  const fetchNotes = React.useCallback(async (term: string) => {
    const seq = ++requestSeq.current;
    try {
      const path = term ? `/notes?q=${encodeURIComponent(term)}` : "/notes";
      const data = await apiFetch<NoteOut[]>(path);
      if (seq !== requestSeq.current) return; // a newer request has since started
      setNotes(data);
      setLoadError(null);
      setSearchError(null);
    } catch {
      if (seq !== requestSeq.current) return;
      // A failed request never blanks whatever list is already on screen.
      if (term) {
        setSearchError("Couldn’t search your notes just now. Try again.");
      } else {
        setLoadError("Couldn’t load your notes just now. Try again in a moment.");
      }
    }
  }, []);

  // Initial, unfiltered load.
  React.useEffect(() => {
    fetchNotes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced server-side search as the query changes. Skips the very first
  // render so it doesn't duplicate the initial load above.
  const didMount = React.useRef(false);
  React.useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return undefined;
    }
    const term = query.trim();
    const timer = setTimeout(() => {
      fetchNotes(term);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, fetchNotes]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  React.useEffect(() => {
    if (pending && cancelRef.current) cancelRef.current.focus();
  }, [pending]);

  React.useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 5000);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [toast]);

  const sorted = React.useMemo(
    () =>
      [...(notes ?? [])].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [notes],
  );

  const searching = query.trim().length > 0;

  const clearSearch = () => setQuery("");

  const closeDialog = () => {
    setPending(null);
    setDeleting(false);
    setDialogError("");
    const el = triggerRef.current;
    if (el && document.body.contains(el)) el.focus();
  };

  const openDelete = (note: NoteOut, event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setDialogError("");
    setPending(note);
  };

  const confirmDelete = async () => {
    if (!pending) return;
    const target = pending;
    setDeleting(true);
    setDialogError("");
    try {
      await apiFetch<void>(`/notes/${target.id}`, { method: "DELETE" });
      setNotes((list) => (list ?? []).filter((n) => n.id !== target.id));
      setPending(null);
      setDeleting(false);
      setToast(
        `Deleted “${target.title || "Untitled note"}”. There is no version history, so it is gone for good.`,
      );
      triggerRef.current = null;
    } catch {
      setDeleting(false);
      setDialogError("The store turned that delete down. Nothing was removed — try once more.");
      if (deleteRef.current) deleteRef.current.focus();
    }
  };

  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key !== "Tab") return;
    const order = [cancelRef.current, deleteRef.current].filter(Boolean) as HTMLButtonElement[];
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
    border: "1px solid transparent",
  };
  const quietBtn = {
    backgroundColor: "transparent",
    color: T.muted,
    border: `1px solid ${T.hairline}`,
    borderRadius: T.radius,
    fontFamily: HEAD,
  };
  const dialogCancelBtn = {
    backgroundColor: "transparent",
    color: DIALOG.cancelText,
    border: `1px solid ${DIALOG.cancelBorder}`,
    borderRadius: T.radius,
    fontFamily: HEAD,
  };
  const dialogDeleteBtn = {
    backgroundColor: DIALOG.deleteBg,
    color: DIALOG.deleteText,
    borderRadius: T.radius,
    fontFamily: HEAD,
    border: `1px solid ${DIALOG.deleteBg}`,
  };

  const total = notes?.length ?? 0;

  return (
    <div
      className="min-h-full w-full px-4 py-8 sm:px-8 sm:py-12"
      style={
        {
          backgroundColor: T.bg,
          color: T.text,
          fontFamily: BODY,
          "--qd-hover": T.hoverBg,
        } as React.CSSProperties
      }
    >
      <style>{QD_CSS}</style>

      <div className="mx-auto w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-8">
            <h1
              className="text-3xl sm:text-[34px] leading-tight tracking-tight"
              style={{ fontFamily: HEAD, fontWeight: 600, color: T.text }}
            >
              All notes <span style={NUM}>({total})</span>
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: T.faint }}>
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Kept in this app’s own store</span>
            </p>
          </div>

          <div className="flex items-center gap-3 sm:col-span-4 sm:justify-end">
            <Button
              onClick={() => navigate("/note")}
              className="qd-focus inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 px-5 text-[15px] font-semibold transition-opacity hover:opacity-90 sm:flex-none"
              style={primaryBtn}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New note
            </Button>
          </div>
        </div>

        <form className="mt-8" onSubmit={(e) => e.preventDefault()} role="search">
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
                onClick={clearSearch}
                className="qd-focus absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center transition-colors"
                style={{ color: T.muted, borderRadius: T.radius }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {searchError ? (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between gap-3 px-4 py-3 text-[14px]"
            style={{
              color: T.text,
              backgroundColor: T.dangerSoft,
              border: `1px solid ${T.danger}`,
              borderRadius: T.radius,
            }}
          >
            <span className="flex items-start gap-2">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: T.danger }}
                aria-hidden="true"
              />
              {searchError}
            </span>
            <button
              type="button"
              onClick={() => fetchNotes(query.trim())}
              className="qd-focus shrink-0 px-3 py-1.5 text-[13px] font-semibold"
              style={quietBtn}
            >
              Try again
            </button>
          </div>
        ) : null}

        <section className="mt-10" aria-labelledby="notes-list-heading">
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
              {notes === null
                ? "Loading…"
                : searching
                  ? `${total} notes match “${query.trim()}”`
                  : total === 0
                    ? "Nothing saved yet"
                    : `${total} notes, newest change first`}
            </p>
          </div>

          {notes === null && !loadError ? (
            <p className="py-10 text-[15px]" style={{ color: T.faint }}>
              Loading your notes…
            </p>
          ) : loadError ? (
            <div className="py-10">
              <Empty
                title="Couldn’t load your notes"
                description={loadError}
                action={
                  <Button
                    onClick={() => {
                      setNotes(null);
                      fetchNotes("");
                    }}
                    className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    Try again
                  </Button>
                }
              />
            </div>
          ) : total === 0 && !searching ? (
            <div className="py-10">
              <Empty
                title="Nothing written here yet"
                description="Your notes stay in this app’s own store — nothing is synced anywhere else. Start with a title and a few lines; it saves as you type."
                action={
                  <Button
                    onClick={() => navigate("/note")}
                    className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Write your first note
                  </Button>
                }
              />
            </div>
          ) : total === 0 && searching ? (
            <div className="qd-row py-12">
              <Empty
                title={`No notes match “${query.trim()}”`}
                description="Clear the search to see all notes. Search looks at both the title and the text of every note."
                action={
                  <Button
                    onClick={clearSearch}
                    className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-5 text-[15px] font-semibold"
                    style={primaryBtn}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear search
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="relative m-0 list-none p-0">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 bottom-0 w-px"
                style={{ left: "62px", backgroundColor: T.accentSoft }}
              />
              {sorted.map((note) => {
                const d = new Date(note.updated_at);
                const preview = stripHtml(note.body);
                return (
                  <li
                    key={note.id}
                    className="qd-row group relative"
                    style={{ borderBottom: `1px solid ${T.hairlineSoft}` }}
                  >
                    <div className="flex items-start gap-1 transition-colors group-hover:bg-[color:var(--qd-hover)]">
                      <button
                        type="button"
                        onClick={() => navigate(`/note?id=${encodeURIComponent(note.id)}`)}
                        className="qd-focus flex min-w-0 flex-1 items-start gap-5 py-5 pl-2 pr-1 text-left"
                      >
                        <span
                          className="flex w-12 shrink-0 flex-col items-start leading-none"
                          style={{ ...NUM, fontFamily: HEAD }}
                          aria-hidden="true"
                        >
                          <span className="text-[20px]" style={{ color: T.text, fontWeight: 600 }}>
                            {Number.isNaN(d.getTime()) ? "--" : pad(d.getDate())}
                          </span>
                          <span
                            className="mt-1 text-[10px] uppercase tracking-[0.16em]"
                            style={{ color: T.faint }}
                          >
                            {Number.isNaN(d.getTime()) ? "" : MONTHS[d.getMonth()]}
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-[17px]"
                            style={{ fontFamily: HEAD, fontWeight: 600, color: T.text }}
                          >
                            {note.title || "Untitled note"}
                          </span>
                          <span
                            className="mt-1.5 block truncate text-[15px] leading-relaxed"
                            style={{ color: T.muted }}
                          >
                            {preview}
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
                        aria-label={`Delete “${note.title || "Untitled note"}”`}
                        onClick={(e) => openDelete(note, e)}
                        className="qd-focus mt-4 flex h-11 w-11 shrink-0 items-center justify-center transition-colors"
                        style={{ color: T.faint, borderRadius: T.radius }}
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
      </div>

      {pending ? (
        <div
          className="qd-backdrop fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: DIALOG.backdrop }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onKeyDown={onDialogKeyDown}
            className="qd-dialog w-full max-w-md p-6 shadow-2xl"
            style={{
              backgroundColor: DIALOG.surface,
              border: `1px solid ${DIALOG.border}`,
              borderRadius: T.radius,
            }}
          >
            <h2
              id="delete-title"
              className="text-[20px] leading-snug"
              style={{ fontFamily: HEAD, fontWeight: 600, color: DIALOG.title }}
            >
              Delete “{pending.title || "Untitled note"}”?
            </h2>
            <p
              id="delete-desc"
              className="mt-3 text-[15px] leading-relaxed"
              style={{ color: DIALOG.desc }}
            >
              It is removed permanently and cannot be recovered.
            </p>

            {dialogError ? (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 p-3 text-[14px] leading-relaxed"
                style={{
                  color: DIALOG.errorText,
                  backgroundColor: DIALOG.errorBg,
                  border: `1px solid ${DIALOG.errorBorder}`,
                  borderRadius: T.radius,
                }}
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: DIALOG.errorText }}
                  aria-hidden="true"
                />
                <span>{dialogError}</span>
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                ref={cancelRef}
                onClick={closeDialog}
                disabled={deleting}
                className="qd-focus inline-flex min-h-[44px] items-center justify-center px-4 text-[15px] transition-colors disabled:opacity-50"
                style={dialogCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={deleteRef}
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting ? "true" : "false"}
                className="qd-focus inline-flex min-h-[44px] items-center justify-center gap-2 px-4 text-[15px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
                style={dialogDeleteBtn}
              >
                {deleting ? (
                  <>
                    <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Deleting…
                  </>
                ) : dialogError ? (
                  "Try delete again"
                ) : (
                  "Delete note"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
          }}
        >
          <CheckCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: T.accent }}
            aria-hidden="true"
          />
          <p className="flex-1 text-[14px] leading-relaxed" style={{ color: T.text }}>
            {toast}
          </p>
        </div>
      ) : null}
    </div>
  );
}
