import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Secure Gmail sender for the /contact form.
 *
 * Reads credentials only from server-side environment variables — never
 * from the request or from any client-visible bundle:
 *   GMAIL_USER            — the Gmail address that sends the message
 *   GMAIL_APP_PASSWORD    — 16-char Google app password (NOT the account password)
 *
 * Legacy env names SMTP_USER / SMTP_PASS are still honoured so existing
 * Render/Vercel envs keep working after this change.
 */

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
  // honeypot — real users leave this blank
  company?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limit per IP (best-effort — resets on cold start)
const RATE_LIMIT: Map<string, number[]> = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function ratelimit(ip: string): boolean {
  const now = Date.now();
  const hits = (RATE_LIMIT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) return false;
  hits.push(now);
  RATE_LIMIT.set(ip, hits);
  return true;
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Sanitize header-bound fields so a newline in `name`/`subject` cannot
// be used to inject additional SMTP headers.
function safeHeader(s: string, max = 200): string {
  return s.replace(/[\r\n]+/g, " ").slice(0, max);
}

const BASE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
} as const;

function json(
  data: Record<string, unknown>,
  status: number,
  extra: Record<string, string> = {}
) {
  return NextResponse.json(data, {
    status,
    headers: { ...BASE_HEADERS, ...extra },
  });
}

function getGmailCreds(): { user: string; pass: string } | null {
  const user = process.env.GMAIL_USER ?? process.env.SMTP_USER ?? "";
  const pass = process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS ?? "";
  if (!user || !pass) return null;
  return { user, pass };
}

// Only allow same-origin submissions from the deployed site.
function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  // Same-origin fetches from the browser include Origin; server-to-server
  // callers (curl, tests) usually omit it — accept those too so localhost
  // dev + Render health checks aren't blocked.
  if (!origin) return true;

  const host = req.headers.get("host") ?? "";
  try {
    const o = new URL(origin);
    if (o.host === host) return true;
  } catch {
    return false;
  }
  return false;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return new Response(null, {
    status: 204,
    headers: {
      ...BASE_HEADERS,
      "Access-Control-Allow-Origin": origin || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
    },
  });
}

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return json({ ok: false, error: "Forbidden." }, 403);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!ratelimit(ip)) {
    return json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      429
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid request body." }, 400);
  }

  // Honeypot — silently succeed so bots don't learn they were caught.
  if (asStr(body.company).length > 0) {
    return json({ ok: true }, 200);
  }

  const name = asStr(body.name);
  const email = asStr(body.email);
  const phone = asStr(body.phone);
  const subject = asStr(body.subject);
  const message = asStr(body.message);

  if (name.length < 2 || name.length > 120) {
    return json({ ok: false, error: "Please enter your name." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(
      { ok: false, error: "Please enter a valid email address." },
      400
    );
  }
  if (phone && phone.length > 40) {
    return json({ ok: false, error: "Phone number is too long." }, 400);
  }
  if (subject.length > 200) {
    return json({ ok: false, error: "Subject is too long." }, 400);
  }
  if (message.length < 5) {
    return json({ ok: false, error: "Please include a message." }, 400);
  }
  // Allow long-form briefs (100+ lines / multi-paragraph enquiries).
  // 50k chars ≈ 8k words / ~30 A4 pages — well above any real brief,
  // still below the ~1 MB JSON body cap Next.js enforces on route handlers.
  if (message.length > 50000) {
    return json({ ok: false, error: "Message is too long." }, 400);
  }

  const creds = getGmailCreds();
  const CONTACT_TO = process.env.CONTACT_TO ?? "vbphotograph2015@gmail.com";

  if (!creds) {
    // Never expose configuration state to visitors. Log the real cause,
    // return the same generic error the visitor sees on any send failure.
    console.error(
      "[/api/contact] GMAIL_USER or GMAIL_APP_PASSWORD is not set on the server"
    );
    return json(
      { ok: false, error: "Message could not be sent. Please try again." },
      500
    );
  }

  const safeName = safeHeader(name);
  const safeSubject = safeHeader(subject);
  const mailSubject = safeSubject
    ? `[Website] ${safeSubject}`
    : `[Website] New enquiry from ${safeName}`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0a0a1a;">
      <h2 style="margin: 0 0 16px; font-size: 18px;">New enquiry via vbphotographe.com</h2>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Name</td><td>${esc(name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Email</td><td>${esc(email)}</td></tr>
        ${phone ? `<tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Phone</td><td>${esc(phone)}</td></tr>` : ""}
        ${subject ? `<tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Subject</td><td>${esc(subject)}</td></tr>` : ""}
      </table>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="white-space: pre-wrap;">${esc(message)}</p>
    </div>
  `;

  const text = [
    `New enquiry via vbphotographe.com`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    subject ? `Subject: ${subject}` : null,
    ``,
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: creds.user, pass: creds.pass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"VB Photographe — Website" <${creds.user}>`,
      to: CONTACT_TO,
      replyTo: `${safeName} <${email}>`,
      subject: mailSubject,
      text,
      html,
    });
    // Server-side confirmation the mail server accepted the message.
    console.log(
      `[/api/contact] sent → ${CONTACT_TO}  messageId=${info.messageId}  accepted=${JSON.stringify(info.accepted)}`
    );
  } catch (err) {
    // Never leak Gmail error details to the visitor. Log for operators.
    console.error("[/api/contact] send failed", err);
    return json(
      { ok: false, error: "Message could not be sent. Please try again." },
      500
    );
  }

  return json({ ok: true }, 200);
}
