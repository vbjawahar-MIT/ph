import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

// simple in-memory rate limit per IP (best-effort — resets on restart)
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

type MailFields = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function renderHtml(f: MailFields): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0a0a1a;">
      <h2 style="margin: 0 0 16px; font-size: 18px;">New enquiry via vbphotographe.com</h2>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Name</td><td>${esc(f.name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Email</td><td>${esc(f.email)}</td></tr>
        ${f.phone ? `<tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Phone</td><td>${esc(f.phone)}</td></tr>` : ""}
        ${f.subject ? `<tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Subject</td><td>${esc(f.subject)}</td></tr>` : ""}
      </table>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="white-space: pre-wrap;">${esc(f.message)}</p>
    </div>
  `;
}

function renderText(f: MailFields): string {
  return [
    `New enquiry via vbphotographe.com`,
    ``,
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    f.phone ? `Phone: ${f.phone}` : null,
    f.subject ? `Subject: ${f.subject}` : null,
    ``,
    f.message,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendViaResend(f: MailFields, to: string): Promise<void> {
  const key = process.env.RESEND_API_KEY!;
  // Resend requires the `from` domain to be verified. Until a custom domain is
  // verified, Resend accepts `onboarding@resend.dev` for testing.
  const from = process.env.RESEND_FROM ?? "VB Photographe <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: `${f.name} <${f.email}>`,
      subject: f.subject
        ? `[Website] ${f.subject}`
        : `[Website] New enquiry from ${f.name}`,
      text: renderText(f),
      html: renderHtml(f),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail || res.statusText}`);
  }
}

async function sendViaSmtp(f: MailFields, to: string): Promise<void> {
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"VB Photographe — Website" <${user}>`,
    to,
    replyTo: `${f.name} <${f.email}>`,
    subject: f.subject
      ? `[Website] ${f.subject}`
      : `[Website] New enquiry from ${f.name}`,
    text: renderText(f),
    html: renderHtml(f),
  });
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!ratelimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot — silently succeed to not tip off the bot
  if (asStr(body.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const fields: MailFields = {
    name: asStr(body.name),
    email: asStr(body.email),
    phone: asStr(body.phone),
    subject: asStr(body.subject),
    message: asStr(body.message),
  };

  if (fields.name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(fields.email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (fields.message.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Please include a message." },
      { status: 400 }
    );
  }

  const CONTACT_TO = process.env.CONTACT_TO ?? "vbphotograph2015@gmail.com";
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!hasResend && !hasSmtp) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email service is not configured on the server. Please email vbphotograph2015@gmail.com directly.",
      },
      { status: 503 }
    );
  }

  try {
    if (hasResend) {
      await sendViaResend(fields, CONTACT_TO);
    } else {
      await sendViaSmtp(fields, CONTACT_TO);
    }
  } catch (primaryErr) {
    console.error("[/api/contact] primary send failed", primaryErr);
    // Fall back to the other provider if it's also configured.
    if (hasResend && hasSmtp) {
      try {
        await sendViaSmtp(fields, CONTACT_TO);
      } catch (fallbackErr) {
        console.error("[/api/contact] fallback send failed", fallbackErr);
        return NextResponse.json(
          {
            ok: false,
            error:
              "Could not send message right now. Please email vbphotograph2015@gmail.com directly.",
          },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Could not send message right now. Please email vbphotograph2015@gmail.com directly.",
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
