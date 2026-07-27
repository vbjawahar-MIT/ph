import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

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

  const name = asStr(body.name);
  const email = asStr(body.email);
  const phone = asStr(body.phone);
  const subject = asStr(body.subject);
  const message = asStr(body.message);

  if (name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (message.length < 5) {
    return NextResponse.json(
      { ok: false, error: "Please include a message." },
      { status: 400 }
    );
  }

  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const CONTACT_TO = process.env.CONTACT_TO ?? "vbphotograph2015@gmail.com";
  const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);

  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email service is not configured. See .env.local.example for setup.",
      },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

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

  try {
    await transporter.sendMail({
      from: `"VB Photographe — Website" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: `${name} <${email}>`,
      subject: subject ? `[Website] ${subject}` : `[Website] New enquiry from ${name}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[/api/contact] send failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not send message. Please email directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
