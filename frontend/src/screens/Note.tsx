// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Card, Input, Label, Select, Separator } = UI;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WHITE = [255, 255, 255];

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
};

const mix = (hex, target, t) => {
  const [r, g, b] = hexToRgb(hex);
  const m = (a, c) => Math.round(a + (c - a) * t);
  return `rgb(${m(r, target[0])}, ${m(g, target[1])}, ${m(b, target[2])})`;
};

const alpha = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const INITIAL_TITLE = 'Groceries for the week';

const INITIAL_BODY =
  '<h3>Market run — Saturday</h3>' +
  '<p>Pickup slot booked for <b>09:15</b> at Fieldgate. Card at the door, no cash this time. If the queue is past the bakery, go round by the loading bay.</p>' +
  '<ul>' +
  '<li>Steel-cut oats — 1kg bag</li>' +
  '<li>Coffee — Mariposa dark roast, 500g</li>' +
  '<li>Olive oil — the green tin, not the bottle</li>' +
  '<li>Lemons ×2, flat parsley, a head of garlic</li>' +
  '</ul>' +
  '<p>The <b>big box of oat milk</b> drops to offer price on Thursday night — order it before Friday or it sells out again like last month. Standing order lives at <a href="https://mariposa.coffee/subscribe">mariposa.coffee/subscribe</a>.</p>';

const CREATED_AT = '24 Oct 2026, 08:12';
const INITIAL_UPDATED = '26 Oct 2026, 14:32';

const formatStamp = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ` +
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const stripHtml = (html) =>
  html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h1|h2|h3|ul|ol)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

export default function Screen() {
  const navigate = useNavigate();
  const ink = mix(brand.neutralColor, WHITE, 0.72);
  const inkStrong = mix(brand.neutralColor, WHITE, 0.9);
  const muted = brand.neutralColor;
  const hair = alpha(brand.neutralColor, 0.18);
  const hairSoft = alpha(brand.neutralColor, 0.1);
  const surface = alpha(brand.neutralColor, 0.055);
  const surfaceLift = mix(brand.backgroundColor, WHITE, 0.09);
  const primary = brand.primaryColor;
  const primaryLift = mix(brand.primaryColor, WHITE, 0.3);
  const accentSolid = mix(brand.accentColor, [0, 0, 0], 0.16);
  const accentText = mix(brand.accentColor, WHITE, 0.4);
  const headingFont = `${brand.fontHeading}, ui-sans-serif, system-ui, sans-serif`;
  const bodyFont = `${brand.fontBody}, Georgia, 'Times New Roman', serif`;

  const bodyRef = React.useRef(null);
  const retimer = React.useRef(null);
  const linkBtnRef = React.useRef(null);
  const deleteBtnRef = React.useRef(null);
  const cancelRef = React.useRef(null);
  const confirmRef = React.useRef(null);

  const [title, setTitle] = React.useState(INITIAL_TITLE);
  const [bodyHtml, setBodyHtml] = React.useState(INITIAL_BODY);
  const [revision, setRevision] = React.useState(0);
  const [status, setStatus] = React.useState('saved');
  const [updatedAt, setUpdatedAt] = React.useState(INITIAL_UPDATED);
  const [saveCount, setSaveCount] = React.useState(0);
  const [active, setActive] = React.useState({ bold: false, list: false, heading: false, link: false });
  const [linkHint, setLinkHint] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const plain = stripHtml(bodyHtml).trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  const titleEmpty = title.trim().length === 0;

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.innerHTML = INITIAL_BODY;
  }, []);

  // Auto-save pipeline: edit -> pending -> saving -> saved (with new updated_at)
  React.useEffect(() => {
    if (revision === 0) return undefined;
    if (titleEmpty && !plain) {
      setStatus('empty');
      return undefined;
    }
    if (titleEmpty) {
      setStatus('needsTitle');
      return undefined;
    }
    setStatus('pending');
    const t1 = setTimeout(() => {
      setStatus('saving');
      retimer.current = setTimeout(() => {
        setStatus('saved');
        setUpdatedAt(formatStamp(new Date()));
        setSaveCount((c) => c + 1);
      }, 520);
    }, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(retimer.current);
    };
  }, [revision, titleEmpty, plain]);

  React.useEffect(() => {
    if (!deleteOpen) return undefined;
    const id = setTimeout(() => cancelRef.current && cancelRef.current.focus(), 20);
    return () => clearTimeout(id);
  }, [deleteOpen]);

  const syncActive = React.useCallback(() => {
    try {
      const sel = window.getSelection();
      let heading = false;
      let link = false;
      if (sel && sel.anchorNode) {
        let n = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        while (n && n !== bodyRef.current) {
          if (n.tagName === 'H3') heading = true;
          if (n.tagName === 'A') link = true;
          n = n.parentElement;
        }
      }
      setActive({
        bold: document.queryCommandState('bold'),
        list: document.queryCommandState('insertUnorderedList'),
        heading,
        link,
      });
    } catch (e) {
      /* selection not available */
    }
  }, []);

  const pushBody = () => {
    if (!bodyRef.current) return;
    setBodyHtml(bodyRef.current.innerHTML);
    setRevision((r) => r + 1);
    syncActive();
  };

  const exec = (cmd, value) => {
    if (!bodyRef.current) return;
    bodyRef.current.focus();
    try {
      document.execCommand(cmd, false, value);
    } catch (e) {
      /* command unsupported */
    }
    pushBody();
  };

  // Link works straight from the selection: select the words, press Link.
  const toggleLink = () => {
    if (active.link) {
      setLinkHint('');
      exec('unlink');
      return;
    }
    let text = '';
    try {
      const sel = window.getSelection();
      text = sel ? String(sel).trim() : '';
    } catch (e) {
      text = '';
    }
    if (!text) {
      setLinkHint('Select the words you want to link in the body, then press Link again. Press Link inside an existing link to remove it.');
      if (bodyRef.current) bodyRef.current.focus();
      return;
    }
    const cleaned = text.replace(/^\/+/, '').replace(/\s+/g, '');
    const url = /^https?:\/\//i.test(text) ? text : `https://${cleaned}`;
    setLinkHint('');
    exec('createLink', url);
  };

  const closeDialog = () => {
    setDeleteOpen(false);
    setDeleting(false);
    if (deleteBtnRef.current) deleteBtnRef.current.focus();
  };

  const onDialogKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key === 'Tab') {
      const nodes = [cancelRef.current, confirmRef.current].filter(Boolean);
      if (nodes.length === 0) return;
      e.preventDefault();
      const i = nodes.indexOf(document.activeElement);
      const next = e.shiftKey
        ? nodes[(i - 1 + nodes.length) % nodes.length]
        : nodes[(i + 1) % nodes.length];
      next.focus();
    }
  };

  const confirmDelete = () => {
    setDeleting(true);
    retimer.current = setTimeout(() => navigate('notes'), 650);
  };

  React.useEffect(() => () => clearTimeout(retimer.current), []);

  const STATUS = {
    saved: { text: `Saved — last updated ${updatedAt}`, Icon: Icons.Check, color: primaryLift, dot: primary },
    pending: { text: 'Edited just now — saving in a moment', Icon: Icons.Clock, color: muted, dot: muted },
    saving: { text: 'Saving your changes…', Icon: Icons.Clock, color: muted, dot: primary },
    needsTitle: { text: 'Not saved — this note needs a title', Icon: Icons.AlertCircle, color: accentText, dot: brand.accentColor },
    empty: { text: 'Nothing saved yet — start with a title', Icon: Icons.FileText, color: muted, dot: muted },
  };
  const st = STATUS[status];

  const toolButton = (id, label, isActive, onClick, ref) => (
    <button
      key={id}
      ref={ref}
      type="button"
      data-wf={id}
      aria-pressed={isActive === null ? undefined : isActive}
      onClick={onClick}
      className="qd-ring h-11 w-full text-[13px] tracking-wide transition-colors duration-150"
      style={{
        fontFamily: headingFont,
        fontWeight: 600,
        borderRadius: brand.radius,
        border: `1px solid ${isActive ? alpha(primary, 0.55) : hair}`,
        backgroundColor: isActive ? alpha(primary, 0.16) : 'transparent',
        color: isActive ? primaryLift : ink,
      }}
    >
      {label}
    </button>
  );

  const css = `
    .qd-ring:focus-visible { outline: 2px solid ${primary}; outline-offset: 2px; }
    .qd-body:focus { outline: none; }
    .qd-body:focus-visible { outline: 2px solid ${primary}; outline-offset: 8px; border-radius: 2px; }
    .qd-body h3 { font-family: ${headingFont}; font-weight: 600; font-size: 1.125rem; line-height: 1.4; color: ${inkStrong}; margin: 24px 0 8px; }
    .qd-body h3:first-child { margin-top: 0; }
    .qd-body p { margin: 0 0 16px; }
    .qd-body ul { list-style: disc; padding-left: 24px; margin: 0 0 16px; }
    .qd-body ol { list-style: decimal; padding-left: 24px; margin: 0 0 16px; }
    .qd-body li { margin: 4px 0; }
    .qd-body b, .qd-body strong { font-weight: 700; color: ${inkStrong}; }
    .qd-body a { color: ${primaryLift}; text-decoration: underline; text-underline-offset: 3px; }
    .qd-input::placeholder { color: ${alpha(brand.neutralColor, 0.6)}; }
    @keyframes qd-rise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes qd-fade { from { opacity: 0 } to { opacity: 1 } }
    @keyframes qd-breathe { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }
    .qd-rise { animation: qd-rise .2s ease-out both; }
    .qd-fade { animation: qd-fade .18s ease-out both; }
    .qd-breathe { animation: qd-breathe 1.1s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .qd-rise, .qd-fade, .qd-breathe { animation: none !important; }
      * { transition-duration: 0.01ms !important; }
    }
  `;

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: brand.backgroundColor, color: ink, fontFamily: bodyFont }}>
      <style>{css}</style>

      <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-8 sm:py-10">
        {/* Row 1 — back, save status, delete */}
        <div className="grid grid-cols-12 items-center gap-4">
          <div className="col-span-12 sm:col-span-3">
            <Button
              type="button"
              data-wf="b-0-0"
              onClick={() => navigate('notes')}
              className="qd-ring inline-flex h-11 items-center gap-2 px-0 text-[14px] transition-colors duration-150"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
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
            <p
              data-wf="b-0-1"
              aria-live="polite"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px]"
              style={{
                borderRadius: '999px',
                border: `1px solid ${hair}`,
                backgroundColor: surface,
                color: st.color,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span
                aria-hidden="true"
                className={status === 'saving' ? 'qd-breathe inline-block h-1.5 w-1.5 rounded-full' : 'inline-block h-1.5 w-1.5 rounded-full'}
                style={{ backgroundColor: st.dot }}
              />
              <st.Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {st.text}
            </p>
          </div>

          <div className="col-span-12 flex sm:col-span-3 sm:justify-end">
            <Button
              type="button"
              ref={deleteBtnRef}
              data-wf="b-0-2"
              onClick={() => setDeleteOpen(true)}
              className="qd-ring inline-flex h-11 items-center gap-2 px-4 text-[14px] transition-colors duration-150"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${alpha(brand.accentColor, 0.45)}`,
                borderRadius: brand.radius,
                color: accentText,
                fontFamily: headingFont,
                fontWeight: 600,
              }}
            >
              <Icons.Trash className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        <h1
          className="mt-8 text-[11px] uppercase"
          style={{ fontFamily: headingFont, fontWeight: 600, letterSpacing: '0.2em', color: muted }}
        >
          Note · created {CREATED_AT}
        </h1>

        {/* The sheet */}
        <div
          className="mt-3"
          style={{ border: `1px solid ${hair}`, borderRadius: brand.radius, backgroundColor: surface }}
        >
          {/* Row 2 — title field */}
          <div className="px-4 pt-6 sm:px-10">
            <Label
              htmlFor="note-title"
              className="block text-[11px] uppercase"
              style={{ fontFamily: headingFont, fontWeight: 600, letterSpacing: '0.18em', color: muted }}
            >
              Title
            </Label>
            <Input
              id="note-title"
              data-wf="b-1-0"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setRevision((r) => r + 1); }}
              placeholder="Name this note"
              aria-invalid={status === 'needsTitle'}
              aria-describedby={status === 'needsTitle' ? 'title-error' : undefined}
              className="qd-input qd-ring mt-2 w-full px-0 text-[26px] leading-tight sm:text-[30px]"
              style={{
                fontFamily: headingFont,
                fontWeight: 600,
                color: inkStrong,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${status === 'needsTitle' ? alpha(brand.accentColor, 0.6) : hairSoft}`,
                borderRadius: 0,
                height: 'auto',
                paddingBottom: '12px',
              }}
            />
            {status === 'needsTitle' && (
              <p id="title-error" className="qd-fade mt-2 flex items-start gap-2 text-[13px]" style={{ color: accentText }}>
                <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                A note needs a title before it can be saved. Everything you have typed is still here — add a few words above and it saves itself.
              </p>
            )}
          </div>

          {/* ruled margin: the Quiet Desk signature */}
          <div className="relative px-4 pb-6 pt-5 sm:px-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-4 top-5 hidden w-px sm:left-[26px] sm:block"
              style={{ backgroundColor: alpha(primary, 0.32) }}
            />

            <div className="sm:pl-8">
              {/* Row 3 — formatting toolbar */}
              <div role="group" aria-label="Formatting" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {toolButton('b-2-0', 'Bold', active.bold, () => exec('bold'))}
                {toolButton('b-2-1', 'Heading', active.heading, () => exec('formatBlock', active.heading ? '<p>' : '<h3>'))}
                {toolButton('b-2-2', 'List', active.list, () => exec('insertUnorderedList'))}
                {toolButton('b-2-3', 'Link', active.link, toggleLink, linkBtnRef)}
              </div>

              <p
                aria-live="polite"
                className={linkHint ? 'qd-fade mt-3 flex items-start gap-2 text-[13px]' : 'sr-only'}
                style={linkHint ? { color: accentText } : undefined}
              >
                {linkHint && <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                {linkHint}
              </p>

              {/* Row 4 — rich-text body */}
              <div className="mt-6">
                <span
                  id="body-label"
                  className="block text-[11px] uppercase"
                  style={{ fontFamily: headingFont, fontWeight: 600, letterSpacing: '0.18em', color: muted }}
                >
                  Body
                </span>
                <div className="relative mt-3">
                  {!plain && (
                    <p
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 text-[17px] leading-[1.65]"
                      style={{ color: alpha(brand.neutralColor, 0.55) }}
                    >
                      Start typing. Use Bold, Heading, List or Link above to shape it — text only, no attachments.
                    </p>
                  )}
                  <div
                    ref={bodyRef}
                    data-wf="b-3-0"
                    className="qd-body text-[17px] leading-[1.65]"
                    style={{ color: ink, minHeight: '340px', maxWidth: '68ch', fontFamily: bodyFont }}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-multiline="true"
                    aria-labelledby="body-label"
                    tabIndex={0}
                    onInput={pushBody}
                    onKeyUp={syncActive}
                    onMouseUp={syncActive}
                    onFocus={syncActive}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: hairSoft }}>
            <Separator />
          </div>

          {/* Row 5 — autosave helper */}
          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p data-wf="b-4-0" className="text-[13px]" style={{ color: muted }}>
              Changes save automatically as you type. No attachments and no version history — once a note is deleted it is gone.
            </p>
            <p
              className="text-[12px] uppercase"
              style={{ fontFamily: headingFont, fontWeight: 600, letterSpacing: '0.14em', color: muted, fontVariantNumeric: 'tabular-nums' }}
            >
              {words} words · {saveCount} autosaves this session
            </p>
          </div>
        </div>
      </div>

      {/* Row 6 + 7 — delete confirmation */}
      {deleteOpen && (
        <div
          className="qd-fade fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ backgroundColor: alpha(brand.backgroundColor, 0.82) }}
          onMouseDown={(e) => { if (e.target === e.currentTarget && !deleting) closeDialog(); }}
        >
          <div
            data-wf="b-5-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            onKeyDown={onDialogKey}
            className="qd-rise w-full max-w-[480px] p-6"
            style={{
              backgroundColor: surfaceLift,
              border: `1px solid ${hair}`,
              borderRadius: brand.radius,
              boxShadow: '0 28px 70px rgba(0, 0, 0, 0.55)',
            }}
          >
            <h2
              id="delete-title"
              className="text-[20px] leading-snug"
              style={{ fontFamily: headingFont, fontWeight: 600, color: inkStrong }}
            >
              Delete “{title.trim() || 'Untitled note'}”?
            </h2>
            <p id="delete-desc" className="mt-3 text-[15px] leading-[1.6]" style={{ color: ink }}>
              It is removed permanently and cannot be recovered. This app keeps no version history and no trash.
            </p>
            <p className="mt-2 text-[13px]" style={{ color: muted, fontVariantNumeric: 'tabular-nums' }}>
              Last updated {updatedAt} · {words} words
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                ref={cancelRef}
                data-wf="b-6-0"
                disabled={deleting}
                onClick={closeDialog}
                className="qd-ring h-11 w-full text-[14px] transition-colors duration-150"
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${hair}`,
                  borderRadius: brand.radius,
                  color: deleting ? muted : ink,
                  fontFamily: headingFont,
                  fontWeight: 600,
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                ref={confirmRef}
                data-wf="b-6-1"
                disabled={deleting}
                onClick={confirmDelete}
                className="qd-ring inline-flex h-11 w-full items-center justify-center gap-2 text-[14px] transition-colors duration-150"
                style={{
                  backgroundColor: accentSolid,
                  border: `1px solid ${accentSolid}`,
                  borderRadius: brand.radius,
                  color: '#ffffff',
                  fontFamily: headingFont,
                  fontWeight: 600,
                  opacity: deleting ? 0.85 : 1,
                }}
              >
                {deleting ? (
                  <>
                    <Icons.Clock className="qd-breathe h-4 w-4" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Icons.Trash className="h-4 w-4" aria-hidden="true" />
                    Delete note
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
