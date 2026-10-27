import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch } from "@/lib/api";

const { Button, Input, Label, Separator } = UI;

export interface NoteOut {
  id: string;
  title: string;
  body: string;
  updated_at: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WHITE: [number, number, number] = [255, 255, 255];

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

const mix = (hex: string, target: [number, number, number], t: number) => {
  const [r, g, b] = hexToRgb(hex);
  const m = (a: number, c: number) => Math.round(a + (c - a) * t);
  return `rgb(${m(r, target[0])}, ${m(g, target[1])}, ${m(b, target[2])})`;
};

const alpha = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// Shared, literal monochrome values for the delete-confirmation dialog.
// These are duplicated verbatim in Notes.tsx so both dialogs render
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

const formatStamp = (d: Date) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ` +
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const stripHtml = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h1|h2|h3|ul|ol)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

type Status = "loading" | "idle" | "pending" | "saving" | "saved" | "error" | "loadError";

export default function Screen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get("id");

  const ink = mix(brand.neutralColor, WHITE, 0.72);
  const inkStrong = mix(brand.neutralColor, WHITE, 0.9);
  const muted = brand.neutralColor;
  const hair = alpha(brand.neutralColor, 0.18);
  const hairSoft = alpha(brand.neutralColor, 0.1);
  const surface = alpha(brand.neutralColor, 0.055);
  const primary = brand.primaryColor;
  const primaryLift = mix(brand.primaryColor, WHITE, 0.3);
  const accentText = mix(brand.accentColor, WHITE, 0.4);
  const headingFont = `${brand.fontHeading}, ui-sans-serif, system-ui, sans-serif`;
  const bodyFont = `${brand.fontBody}, Georgia, 'Times New Roman', serif`;

  const [noteId, setNoteId] = React.useState<string | null>(urlId);
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState<Status>(urlId ? "loading" : "idle");
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null);
  const [saveCount, setSaveCount] = React.useState(0);
  const [linkHint, setLinkHint] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [dialogError, setDialogError] = React.useState("");

  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const confirmRef = React.useRef<HTMLButtonElement | null>(null);
  const noteIdRef = React.useRef<string | null>(urlId);
  const titleRef = React.useRef("");

  React.useEffect(() => {
    noteIdRef.current = noteId;
  }, [noteId]);

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), Link.configure({ openOnClick: false })],
    content: "",
    immediatelyRender: false,
    onUpdate: () => scheduleSave(),
  });

  // `useEditor` can hand back a new Editor instance across renders before it
  // settles; the load effect below must not re-run (and re-fetch) each time
  // that happens, so it reaches the current editor through this ref instead
  // of depending on it directly.
  const editorRef = React.useRef(editor);
  editorRef.current = editor;

  // Loads the stored note's rich-text body via GET /notes/{id}. Nothing is
  // rendered into the title or editor until this resolves, so a 401 (which
  // apiFetch turns into a redirect to /login) never flashes note content.
  React.useEffect(() => {
    if (!urlId) return;
    let cancelled = false;
    apiFetch<NoteOut>(`/notes/${urlId}`)
      .then((note) => {
        if (cancelled) return;
        setTitle(note.title);
        titleRef.current = note.title;
        editorRef.current?.commands.setContent(note.body || "");
        setUpdatedAt(note.updated_at);
        setStatus("saved");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("loadError");
        setLoadError("Couldn’t open this note. It may have been deleted.");
      });
    return () => {
      cancelled = true;
    };
  }, [urlId]);

  const performSave = React.useCallback(async () => {
    if (!editor) return;
    const bodyHtml = editor.getHTML();
    const plain = stripHtml(bodyHtml);
    const currentTitle = titleRef.current.trim();
    if (!currentTitle && !plain) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    try {
      const payload = { title: currentTitle, body: bodyHtml };
      const id = noteIdRef.current;
      const saved = id
        ? await apiFetch<NoteOut>(`/notes/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await apiFetch<NoteOut>("/notes", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      if (!id) {
        setNoteId(saved.id);
        setSearchParams({ id: saved.id }, { replace: true });
      }
      setUpdatedAt(saved.updated_at ?? new Date().toISOString());
      setStatus("saved");
      setSaveCount((c) => c + 1);
    } catch {
      setStatus("error");
    }
  }, [editor, setSearchParams]);

  const scheduleSave = React.useCallback(() => {
    setStatus("pending");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      performSave();
    }, 800);
  }, [performSave]);

  React.useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const plain = editor ? stripHtml(editor.getHTML()) : "";
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;

  React.useEffect(() => {
    if (!deleteOpen) return undefined;
    const id = setTimeout(() => cancelRef.current && cancelRef.current.focus(), 20);
    return () => clearTimeout(id);
  }, [deleteOpen]);

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      setLinkHint("");
      return;
    }
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ").trim();
    if (!text) {
      setLinkHint(
        "Select the words you want to link in the body, then press Link again. Press Link inside an existing link to remove it.",
      );
      editor.commands.focus();
      return;
    }
    const cleaned = text.replace(/^\/+/, "").replace(/\s+/g, "");
    const url = /^https?:\/\//i.test(text) ? text : `https://${cleaned}`;
    setLinkHint("");
    editor.chain().focus().setLink({ href: url }).run();
  };

  const openDialog = () => {
    setDialogError("");
    setDeleteOpen(true);
  };

  const closeDialog = () => {
    setDeleteOpen(false);
    setDeleting(false);
    setDialogError("");
    if (deleteBtnRef.current) deleteBtnRef.current.focus();
  };

  const onDialogKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key === "Tab") {
      const nodes = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLButtonElement[];
      if (nodes.length === 0) return;
      e.preventDefault();
      const i = nodes.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.shiftKey
        ? nodes[(i - 1 + nodes.length) % nodes.length]
        : nodes[(i + 1) % nodes.length];
      next.focus();
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDialogError("");
    const id = noteIdRef.current;
    try {
      if (id) await apiFetch<void>(`/notes/${id}`, { method: "DELETE" });
      navigate("/notes");
    } catch {
      setDeleting(false);
      setDialogError("The store turned that delete down. Nothing was removed — try once more.");
      if (confirmRef.current) confirmRef.current.focus();
    }
  };

  const STATUS: Record<
    Exclude<Status, "loading" | "loadError">,
    { text: string; Icon: typeof Icons.Check; color: string; dot: string }
  > = {
    idle: {
      text: "Nothing saved yet — start with a title or a few words",
      Icon: Icons.FileText,
      color: muted,
      dot: muted,
    },
    saved: {
      text: updatedAt ? `Saved — last updated ${formatStamp(new Date(updatedAt))}` : "Saved",
      Icon: Icons.Check,
      color: primaryLift,
      dot: primary,
    },
    pending: {
      text: "Edited just now — saving in a moment",
      Icon: Icons.Clock,
      color: muted,
      dot: muted,
    },
    saving: { text: "Saving your changes…", Icon: Icons.Clock, color: muted, dot: primary },
    error: {
      text: "Couldn’t save just now — your words are still here, try again",
      Icon: Icons.AlertCircle,
      color: accentText,
      dot: brand.accentColor,
    },
  };

  const st = status === "loading" || status === "loadError" ? STATUS.idle : STATUS[status];

  const toolButton = (id: string, label: string, isActive: boolean | null, onClick: () => void) => (
    <button
      key={id}
      type="button"
      aria-pressed={isActive === null ? undefined : isActive}
      onClick={onClick}
      disabled={status === "loading"}
      className="qd-ring h-11 w-full text-[13px] tracking-wide transition-colors duration-150"
      style={{
        fontFamily: headingFont,
        fontWeight: 600,
        borderRadius: brand.radius,
        border: `1px solid ${isActive ? alpha(primary, 0.55) : hair}`,
        backgroundColor: isActive ? alpha(primary, 0.16) : "transparent",
        color: isActive ? primaryLift : ink,
      }}
    >
      {label}
    </button>
  );

  const css = `
    .qd-ring:focus-visible { outline: 2px solid ${primary}; outline-offset: 2px; }
    .ProseMirror:focus { outline: none; }
    .ProseMirror h3 { font-family: ${headingFont}; font-weight: 600; font-size: 1.125rem; line-height: 1.4; color: ${inkStrong}; margin: 24px 0 8px; }
    .ProseMirror h3:first-child { margin-top: 0; }
    .ProseMirror p { margin: 0 0 16px; }
    .ProseMirror ul { list-style: disc; padding-left: 24px; margin: 0 0 16px; }
    .ProseMirror ol { list-style: decimal; padding-left: 24px; margin: 0 0 16px; }
    .ProseMirror li { margin: 4px 0; }
    .ProseMirror strong { font-weight: 700; color: ${inkStrong}; }
    .ProseMirror a { color: ${primaryLift}; text-decoration: underline; text-underline-offset: 3px; }
    .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: ${alpha(brand.neutralColor, 0.55)};
      float: left;
      height: 0;
      pointer-events: none;
    }
    .qd-input::placeholder { color: ${alpha(brand.neutralColor, 0.6)}; }
    @media (prefers-reduced-motion: reduce) {
      * { transition-duration: 0.01ms !important; }
    }
  `;

  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: brand.backgroundColor, color: ink, fontFamily: bodyFont }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-8 sm:py-10">
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-12 sm:col-span-3">
            <Button
              type="button"
              onClick={() => navigate("/notes")}
              className="qd-ring inline-flex h-11 items-center gap-2 px-0 text-[14px] transition-colors duration-150"
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: ink,
                fontFamily: headingFont,
                fontWeight: 600,
              }}
            >
              <Icons.ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to notes
            </Button>
          </div>

          <div className="col-span-12 sm:col-span-6 sm:flex sm:justify-center">
            {status === "loading" ? (
              <p
                className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px]"
                style={{
                  borderRadius: "999px",
                  border: `1px solid ${hair}`,
                  backgroundColor: surface,
                  color: muted,
                }}
              >
                Loading note…
              </p>
            ) : (
              <p
                aria-live="polite"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px]"
                style={{
                  borderRadius: "999px",
                  border: `1px solid ${hair}`,
                  backgroundColor: surface,
                  color: st.color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: st.dot }}
                />
                <st.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {st.text}
              </p>
            )}
          </div>

          <div className="col-span-12 flex sm:col-span-3 sm:justify-end">
            <button
              type="button"
              ref={deleteBtnRef}
              onClick={openDialog}
              disabled={status === "loading"}
              className="qd-ring inline-flex h-11 items-center gap-2 px-4 text-[14px] transition-colors duration-150 disabled:opacity-50"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${alpha(brand.accentColor, 0.45)}`,
                borderRadius: brand.radius,
                color: accentText,
                fontFamily: headingFont,
                fontWeight: 600,
              }}
            >
              <Icons.Trash className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>

        {loadError ? (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2 px-4 py-3 text-[14px]"
            style={{
              color: accentText,
              backgroundColor: alpha(brand.accentColor, 0.12),
              border: `1px solid ${alpha(brand.accentColor, 0.5)}`,
              borderRadius: brand.radius,
            }}
          >
            <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {loadError}
          </p>
        ) : null}

        <div
          className="mt-3"
          style={{
            border: `1px solid ${hair}`,
            borderRadius: brand.radius,
            backgroundColor: surface,
          }}
        >
          <div className="px-4 pt-6 sm:px-10">
            <Label
              htmlFor="note-title"
              className="block text-[11px] uppercase"
              style={{
                fontFamily: headingFont,
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: muted,
              }}
            >
              Title
            </Label>
            <Input
              id="note-title"
              value={title}
              disabled={status === "loading"}
              onChange={(e) => {
                titleRef.current = e.target.value;
                setTitle(e.target.value);
                scheduleSave();
              }}
              placeholder="Name this note"
              className="qd-input qd-ring mt-2 w-full px-0 text-[26px] leading-tight sm:text-[30px]"
              style={{
                fontFamily: headingFont,
                fontWeight: 600,
                color: inkStrong,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: `1px solid ${hairSoft}`,
                borderRadius: 0,
                height: "auto",
                paddingBottom: "12px",
              }}
            />
          </div>

          <div className="relative px-4 pb-6 pt-5 sm:px-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-4 top-5 hidden w-px sm:left-[26px] sm:block"
              style={{ backgroundColor: alpha(primary, 0.32) }}
            />

            <div className="sm:pl-8">
              <div
                role="group"
                aria-label="Formatting"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
              >
                {toolButton("bold", "Bold", editor?.isActive("bold") ?? false, () =>
                  editor?.chain().focus().toggleBold().run(),
                )}
                {toolButton(
                  "heading",
                  "Heading",
                  editor?.isActive("heading", { level: 3 }) ?? false,
                  () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
                )}
                {toolButton("list", "List", editor?.isActive("bulletList") ?? false, () =>
                  editor?.chain().focus().toggleBulletList().run(),
                )}
                {toolButton("link", "Link", editor?.isActive("link") ?? false, toggleLink)}
              </div>

              <p
                aria-live="polite"
                className={linkHint ? "mt-3 flex items-start gap-2 text-[13px]" : "sr-only"}
                style={linkHint ? { color: accentText } : undefined}
              >
                {linkHint && (
                  <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {linkHint}
              </p>

              <div className="mt-6">
                <span
                  id="body-label"
                  className="block text-[11px] uppercase"
                  style={{
                    fontFamily: headingFont,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    color: muted,
                  }}
                >
                  Body
                </span>
                <div
                  className="mt-3 text-[17px] leading-[1.65]"
                  style={{ color: ink, minHeight: "340px", maxWidth: "68ch", fontFamily: bodyFont }}
                  aria-labelledby="body-label"
                  role="textbox"
                  aria-multiline="true"
                >
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: hairSoft }}>
            <Separator />
          </div>

          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="text-[13px]" style={{ color: muted }}>
              Changes save automatically as you type. No attachments and no version history — once a
              note is deleted it is gone.
            </p>
            <p
              className="text-[12px] uppercase"
              style={{
                fontFamily: headingFont,
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: muted,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {words} words · {saveCount} autosaves this session
            </p>
          </div>
        </div>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: DIALOG.backdrop }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) closeDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onKeyDown={onDialogKey}
            className="w-full max-w-[480px] p-6"
            style={{
              backgroundColor: DIALOG.surface,
              border: `1px solid ${DIALOG.border}`,
              borderRadius: brand.radius,
              boxShadow: "0 28px 70px rgba(0, 0, 0, 0.55)",
            }}
          >
            <h2
              id="delete-title"
              className="text-[20px] leading-snug"
              style={{ fontFamily: headingFont, fontWeight: 600, color: DIALOG.title }}
            >
              Delete “{title.trim() || "Untitled note"}”?
            </h2>
            <p id="delete-desc" className="mt-3 text-[15px] leading-[1.6]" style={{ color: DIALOG.desc }}>
              It is removed permanently and cannot be recovered. This app keeps no version history
              and no trash.
            </p>

            {dialogError ? (
              <p
                role="alert"
                className="mt-4 flex items-start gap-2 p-3 text-[14px] leading-relaxed"
                style={{
                  color: DIALOG.errorText,
                  backgroundColor: DIALOG.errorBg,
                  border: `1px solid ${DIALOG.errorBorder}`,
                  borderRadius: brand.radius,
                }}
              >
                <Icons.AlertCircle
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
                disabled={deleting}
                onClick={closeDialog}
                className="qd-ring h-11 w-full text-[14px] transition-colors duration-150"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${DIALOG.cancelBorder}`,
                  borderRadius: brand.radius,
                  color: DIALOG.cancelText,
                  fontFamily: headingFont,
                  fontWeight: 600,
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={confirmRef}
                disabled={deleting}
                onClick={confirmDelete}
                className="qd-ring inline-flex h-11 w-full items-center justify-center gap-2 text-[14px] transition-colors duration-150"
                style={{
                  backgroundColor: DIALOG.deleteBg,
                  border: `1px solid ${DIALOG.deleteBg}`,
                  borderRadius: brand.radius,
                  color: DIALOG.deleteText,
                  fontFamily: headingFont,
                  fontWeight: 600,
                  opacity: deleting ? 0.85 : 1,
                }}
              >
                {deleting ? (
                  <>
                    <Icons.Clock className="h-4 w-4" aria-hidden="true" />
                    Deleting…
                  </>
                ) : dialogError ? (
                  "Try delete again"
                ) : (
                  <>
                    <Icons.Trash className="h-4 w-4" aria-hidden="true" />
                    Delete note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
