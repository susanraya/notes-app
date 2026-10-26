import * as React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { LoginError, login } from "@/lib/auth";

const { Button, Card, Input, Label, Checkbox } = UI;

type Status = "idle" | "checking" | "error" | "success";
type FieldErrors = { email: string | null; password: string | null };

const toRgb = (hex: string): [number, number, number] => {
  const h = String(hex).replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const [a, b, c] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return [a, b, c];
};
const alpha = (hex: string, a: number) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const lighten = (hex: string, amt: number) => {
  const [r, g, b] = toRgb(hex);
  const m = (c: number) => Math.round(c + (255 - c) * amt);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
};

const INK = lighten(brand.neutralColor, 0.74);
const BODY = brand.neutralColor;
const MUTED = alpha(brand.neutralColor, 0.74);
const HAIR = alpha(brand.neutralColor, 0.16);
const HAIR_STRONG = alpha(brand.neutralColor, 0.34);
const SURFACE = alpha(brand.neutralColor, 0.05);
const FIELD = alpha(brand.neutralColor, 0.08);
const TINT = alpha(brand.neutralColor, 0.1);

const HEAD_FONT = `${brand.fontHeading}, 'Public Sans', system-ui, sans-serif`;
const BODY_FONT = `${brand.fontBody}, 'Source Serif 4', Georgia, serif`;

const FACTS = [
  { Icon: Icons.Clock, text: "Auto-saves while you type, and stamps the time of the last save." },
  { Icon: Icons.Search, text: "Search reads every title and every body — not just the headings." },
  {
    Icon: Icons.FileText,
    text: "Notes stay in this app’s own store. Nothing is synced anywhere else.",
  },
  { Icon: Icons.CheckCircle, text: "Free to use. No plans, no billing, no upgrade nudge — ever." },
];

const STYLES = `
.qd-scope *:focus-visible { outline: 2px solid var(--qd-ring); outline-offset: 2px; border-radius: var(--qd-radius); }
.qd-primary { transition: filter .18s ease, transform .14s ease, opacity .18s ease; }
.qd-primary:hover:not(:disabled) { filter: brightness(1.09); }
.qd-primary:active:not(:disabled) { transform: translateY(1px); }
.qd-primary:disabled { opacity: .5; cursor: not-allowed; }
.qd-ghost { transition: background-color .18s ease, color .18s ease, border-color .18s ease; }
.qd-ghost:hover { background-color: var(--qd-tint); color: var(--qd-ink); }
.qd-field { transition: border-color .18s ease, background-color .18s ease; }
.qd-field:hover:not(:focus) { border-color: var(--qd-hair-strong); }
.qd-rise { animation: qd-rise .55s cubic-bezier(.2,.7,.3,1) both; }
@keyframes qd-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.qd-fade { animation: qd-fade .4s ease both; }
@keyframes qd-fade { from { opacity: 0; } to { opacity: 1; } }
.qd-shake { animation: qd-shake .36s ease both; }
@keyframes qd-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
.qd-dot { animation: qd-blink 1.1s infinite ease-in-out; }
.qd-dot:nth-child(2) { animation-delay: .18s; }
.qd-dot:nth-child(3) { animation-delay: .36s; }
@keyframes qd-blink { 0%, 75%, 100% { opacity: .25; } 35% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .qd-scope *, .qd-scope *::before, .qd-scope *::after { animation: none !important; transition: none !important; }
}
`;

export default function Screen() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [keepSignedIn, setKeepSignedIn] = React.useState(true);
  const [status, setStatus] = React.useState<Status>("idle");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({
    email: null,
    password: null,
  });
  const [noticeOpen, setNoticeOpen] = React.useState(true);

  const busy = status === "checking" || status === "success";

  // The UI kit's `Input` isn't ref-forwarding, so a field is focused by id
  // rather than through a React ref.
  const focusField = (id: "login-email" | "login-password") => {
    document.getElementById(id)?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors: FieldErrors = { email: null, password: null };
    const trimmed = email.trim();
    if (!trimmed) nextErrors.email = "Enter the email this desk was set up with.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      nextErrors.email = "That isn’t a complete email address yet.";
    if (!password) nextErrors.password = "Enter your password to unlock the drawer.";

    if (nextErrors.email || nextErrors.password) {
      setFieldErrors(nextErrors);
      setFormError(null);
      focusField(nextErrors.email ? "login-email" : "login-password");
      return;
    }

    setFieldErrors({ email: null, password: null });
    setFormError(null);
    setStatus("checking");

    try {
      await login(trimmed, password);
      setStatus("success");
      navigate("notes");
    } catch (err) {
      setStatus("error");
      setFormError(
        err instanceof LoginError
          ? err.message
          : "Couldn’t reach the server just now. Try again in a moment.",
      );
      focusField("login-password");
    }
  };

  const fieldStyle = (invalid: boolean) => ({
    backgroundColor: FIELD,
    border: `1px solid ${invalid ? alpha(brand.accentColor, 0.75) : HAIR}`,
    borderRadius: brand.radius,
    color: INK,
    fontFamily: BODY_FONT,
  });

  const liveMessage =
    status === "checking"
      ? "Checking your credentials."
      : status === "success"
        ? "Signed in. Opening your notes."
        : formError || "";

  return (
    <div
      className="qd-scope min-h-screen w-full"
      style={
        {
          backgroundColor: brand.backgroundColor,
          fontFamily: BODY_FONT,
          color: BODY,
          "--qd-ring": brand.primaryColor,
          "--qd-tint": TINT,
          "--qd-ink": INK,
          "--qd-hair-strong": HAIR_STRONG,
          "--qd-radius": brand.radius,
        } as React.CSSProperties
      }
    >
      <style>{STYLES}</style>

      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-5 py-8 sm:px-8 lg:py-14">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center"
            style={{
              border: `1px solid ${alpha(brand.primaryColor, 0.6)}`,
              borderRadius: brand.radius,
              color: brand.primaryColor,
            }}
            aria-hidden="true"
          >
            <Icons.FileText className="h-4 w-4" />
          </span>
          <span
            className="text-[15px] tracking-[0.18em] uppercase"
            style={{ fontFamily: HEAD_FONT, color: INK, fontWeight: 600 }}
          >
            Quorq Notes
          </span>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16 lg:py-16">
          {/* Left pane — the ruled desk */}
          <section className="qd-fade order-2 lg:order-1">
            <div
              className="relative py-6 pl-8 sm:pl-10"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${alpha(brand.neutralColor, 0.09)} 35px, ${alpha(brand.neutralColor, 0.09)} 36px)`,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-3 w-px sm:left-4"
                style={{ backgroundColor: alpha(brand.primaryColor, 0.55) }}
              />
              <p
                className="max-w-[18ch] text-[30px] leading-[1.25] sm:text-[38px] sm:leading-[1.2]"
                style={{ color: INK }}
              >
                One desk, one drawer, and nobody else holding the key.
              </p>
              <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.6]" style={{ color: MUTED }}>
                Quorq Notes is built for a single person. Sign in and your notes open in the order
                you last touched them — newest at the top, the rest waiting quietly underneath.
              </p>
            </div>

            <ul
              className="mt-10 hidden max-w-[56ch] lg:block"
              aria-label="What’s behind the sign-in"
            >
              {FACTS.map((fact, i) => (
                <li
                  key={fact.text}
                  className="flex items-start gap-4 py-4"
                  style={{ borderTop: i === 0 ? "none" : `1px solid ${HAIR}` }}
                >
                  <fact.Icon
                    className="mt-[3px] h-4 w-4 shrink-0"
                    style={{ color: alpha(brand.primaryColor, 0.9) }}
                    aria-hidden="true"
                  />
                  <span className="text-[15px] leading-[1.6]" style={{ color: BODY }}>
                    {fact.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right pane — sign in */}
          <section className="qd-rise order-1 w-full lg:order-2">
            {noticeOpen && (
              <div
                className="mb-5 flex items-start gap-3 px-4 py-3"
                style={{
                  backgroundColor: SURFACE,
                  border: `1px solid ${HAIR}`,
                  borderRadius: brand.radius,
                }}
              >
                <Icons.Clock
                  className="mt-[3px] h-4 w-4 shrink-0"
                  style={{ color: MUTED }}
                  aria-hidden="true"
                />
                <p className="flex-1 text-[14px] leading-[1.55]" style={{ color: MUTED }}>
                  Sign in to pick your notebook back up.
                </p>
                <button
                  type="button"
                  onClick={() => setNoticeOpen(false)}
                  className="qd-ghost -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ borderRadius: brand.radius, color: MUTED }}
                  aria-label="Dismiss the session notice"
                >
                  <Icons.X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <Card
              className="relative overflow-hidden"
              style={{
                backgroundColor: SURFACE,
                border: `1px solid ${status === "success" ? alpha(brand.primaryColor, 0.6) : HAIR}`,
                borderRadius: brand.radius,
                transition: "border-color .3s ease",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-6 w-px lg:left-7"
                style={{ backgroundColor: alpha(brand.primaryColor, 0.45) }}
              />

              <div className="py-8 pl-10 pr-6 sm:pr-8 lg:pl-12">
                <h1
                  className="text-[28px] leading-tight"
                  style={{ fontFamily: HEAD_FONT, fontWeight: 600, color: INK }}
                >
                  Log in to Notes
                </h1>
                <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.6]" style={{ color: MUTED }}>
                  This app holds exactly one account. There’s no sign-up to follow — the
                  credentials were set when the desk was built.
                </p>

                <div className="my-6" style={{ borderTop: `1px solid ${HAIR}` }} />

                {formError && (
                  <div
                    role="alert"
                    className="qd-shake mb-5 flex items-start gap-3 px-4 py-3"
                    style={{
                      backgroundColor: alpha(brand.accentColor, 0.12),
                      border: `1px solid ${alpha(brand.accentColor, 0.5)}`,
                      borderRadius: brand.radius,
                    }}
                  >
                    <Icons.AlertCircle
                      className="mt-[2px] h-4 w-4 shrink-0"
                      style={{ color: lighten(brand.accentColor, 0.3) }}
                      aria-hidden="true"
                    />
                    <div
                      className="text-[14px] leading-[1.55]"
                      style={{ color: lighten(brand.accentColor, 0.42) }}
                    >
                      <span className="font-semibold" style={{ fontFamily: HEAD_FONT }}>
                        Not accepted.{" "}
                      </span>
                      {formError}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="space-y-5">
                    <div>
                      <Label
                        htmlFor="login-email"
                        className="mb-2 block text-[13px] tracking-wide"
                        style={{ fontFamily: HEAD_FONT, color: BODY }}
                      >
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        name="email"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={email}
                        disabled={busy}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: null }));
                        }}
                        aria-invalid={fieldErrors.email ? "true" : "false"}
                        aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                        className="qd-field h-11 w-full px-3 text-[15px]"
                        style={fieldStyle(Boolean(fieldErrors.email))}
                      />
                      {fieldErrors.email && (
                        <p
                          id="login-email-error"
                          className="qd-fade mt-2 flex items-center gap-2 text-[13px]"
                          style={{ color: lighten(brand.accentColor, 0.38) }}
                        >
                          <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <Label
                          htmlFor="login-password"
                          className="block text-[13px] tracking-wide"
                          style={{ fontFamily: HEAD_FONT, color: BODY }}
                        >
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setReveal((v) => !v)}
                          aria-pressed={reveal}
                          className="qd-ghost px-2 py-1 text-[13px]"
                          style={{
                            borderRadius: brand.radius,
                            color: MUTED,
                            fontFamily: HEAD_FONT,
                          }}
                        >
                          {reveal ? "Hide password" : "Show password"}
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type={reveal ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        disabled={busy}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password)
                            setFieldErrors((f) => ({ ...f, password: null }));
                        }}
                        aria-invalid={fieldErrors.password ? "true" : "false"}
                        aria-describedby={
                          fieldErrors.password ? "login-password-error" : undefined
                        }
                        className="qd-field h-11 w-full px-3 text-[15px]"
                        style={fieldStyle(Boolean(fieldErrors.password))}
                      />
                      {fieldErrors.password && (
                        <p
                          id="login-password-error"
                          className="qd-fade mt-2 flex items-center gap-2 text-[13px]"
                          style={{ color: lighten(brand.accentColor, 0.38) }}
                        >
                          <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Checkbox
                        id="login-keep"
                        checked={keepSignedIn}
                        disabled={busy}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                      />
                      <Label
                        htmlFor="login-keep"
                        className="text-[14px] leading-tight"
                        style={{ color: MUTED }}
                      >
                        Keep me signed in on this device
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      disabled={busy}
                      className="qd-primary flex h-12 w-full items-center justify-center gap-2 text-[15px]"
                      style={{
                        backgroundColor:
                          status === "success"
                            ? alpha(brand.primaryColor, 0.9)
                            : brand.primaryColor,
                        color: brand.backgroundColor,
                        borderRadius: brand.radius,
                        fontFamily: HEAD_FONT,
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      {status === "checking" && (
                        <>
                          <span className="flex items-center gap-1" aria-hidden="true">
                            <span
                              className="qd-dot h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: brand.backgroundColor }}
                            />
                            <span
                              className="qd-dot h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: brand.backgroundColor }}
                            />
                            <span
                              className="qd-dot h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: brand.backgroundColor }}
                            />
                          </span>
                          Checking your credentials
                        </>
                      )}
                      {status === "success" && (
                        <>
                          <Icons.Check className="h-4 w-4" aria-hidden="true" />
                          Opening your notes
                        </>
                      )}
                      {status !== "checking" && status !== "success" && (
                        <>
                          Log in
                          <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="sr-only" role="status" aria-live="polite">
                  {liveMessage}
                </p>
              </div>
            </Card>

            <p className="mt-5 pl-1 text-[13px] leading-[1.6]" style={{ color: MUTED }}>
              Forgotten the password? It isn’t stored anywhere you can read it — reset it from the
              server the desk runs on.
            </p>
          </section>
        </div>

        <footer
          className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-8 text-[13px]"
          style={{ borderTop: `1px solid ${HAIR}`, color: MUTED }}
        >
          <span>Quorq Notes — a single-desk notebook.</span>
          <span style={{ color: HAIR_STRONG }} aria-hidden="true">
            ·
          </span>
          <span>Free to use, with no plans or billing.</span>
          <span style={{ color: HAIR_STRONG }} aria-hidden="true">
            ·
          </span>
          <span>Notes never leave this app’s own store.</span>
        </footer>
      </div>
    </div>
  );
}
