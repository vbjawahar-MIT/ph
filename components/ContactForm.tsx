"use client";

import { useEffect, useState, type FormEvent } from "react";

type FieldProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
};

function Field({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  autoComplete,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;

  const commonProps = {
    id,
    name: id,
    value,
    required,
    autoComplete,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(e.target.value),
    className:
      "peer w-full border-0 border-b border-line/20 bg-transparent pb-3 pt-8 text-base text-ink outline-none placeholder:text-ink/40 focus:border-transparent md:text-lg",
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="ui-label absolute left-0 transition-all duration-500 ease-expo"
        style={{
          top: floating ? "0" : "2rem",
          fontSize: floating ? "0.72rem" : "1.05rem",
          textTransform: floating ? "uppercase" : "none",
          letterSpacing: floating ? "0.15em" : "0",
          color: floating ? "rgb(var(--accent))" : "rgb(var(--ink) / 0.6)",
          fontWeight: floating ? 600 : 400,
        }}
      >
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={4}
        />
      ) : (
        <input
          {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)}
          type={type}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gold transition-transform duration-500 ease-expo"
        style={{ transform: focused ? "scaleX(1)" : "scaleX(0)" }}
      />
    </div>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Arriving from a package's "Book Your Slot" (/contact?package=…):
  // pre-fill the subject. Read on mount so the page stays static.
  useEffect(() => {
    const pkg = new URLSearchParams(window.location.search).get("package");
    const clean = pkg?.replace(/[\r\n\t]+/g, " ").trim().slice(0, 150);
    if (clean) setSubject((s) => s || `Booking enquiry: ${clean}`);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setErrorMsg("Please enter your name.");
      setStatus("error");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    if (message.trim().length < 5) {
      setErrorMsg("Please include a message.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          company,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        // Validation errors (400) come from the server — surface them so
        // the visitor can fix their input. Any other failure gets the
        // generic message the operator asked for.
        const isValidation = res.status === 400 && !!data.error;
        throw new Error(
          isValidation
            ? (data.error as string)
            : "Message could not be sent. Please try again."
        );
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Message could not be sent. Please try again."
      );
    }
  }

  const disabled = status === "sending" || status === "sent";

  return (
    <form
      className="grid gap-8"
      onSubmit={onSubmit}
      aria-label="Contact form"
      noValidate
    >
      {/* Honeypot — hidden from real users */}
      <div
        aria-hidden
        className="absolute h-0 w-0 overflow-hidden opacity-0"
        style={{ position: "absolute", left: "-10000px" }}
      >
        <label htmlFor="company">Company (leave blank)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* Paired fields sit side by side on wider screens (layout only) */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-x-10">
        <Field
          id="name"
          label="Your name"
          value={name}
          onChange={setName}
          autoComplete="name"
          required
        />
        <Field
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-8 md:grid-cols-2 md:gap-x-10">
        <Field
          id="phone"
          label="Phone number"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
        />
        <Field
          id="subject"
          label="Subject"
          value={subject}
          onChange={setSubject}
        />
      </div>
      <Field
        id="message"
        label="Tell me about the project"
        type="textarea"
        value={message}
        onChange={setMessage}
        required
      />

      <div className="flex flex-col items-start gap-4 pt-2">
        <div className="flex w-full flex-col items-start gap-6 md:flex-row md:items-center">
          <button
            type="submit"
            data-cursor-label={status === "sending" ? "…" : "send"}
            className="btn btn-gold group w-full px-9 py-4 text-[0.95rem] sm:w-auto"
            disabled={disabled}
          >
            {status === "sending"
              ? "Sending…"
              : status === "sent"
                ? "Sent — Thank You"
                : "Send Message"}
            {status === "idle" || status === "error" ? (
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </button>
          <p className="text-sm text-ink/60">
            or write directly:{" "}
            <a
              href="mailto:vbphotograph2015@gmail.com"
              className="text-accent underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
            >
              vbphotograph2015@gmail.com
            </a>
          </p>
        </div>

        <div role="status" aria-live="polite" className="min-h-[1.25rem]">
          {status === "sent" && (
            <p className="text-sm font-medium text-emerald-700">
              Message sent successfully.
            </p>
          )}
          {status === "error" && errorMsg && (
            <p className="text-sm font-medium text-red-700">
              <span className="mr-1" aria-hidden>
                ✕
              </span>
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
