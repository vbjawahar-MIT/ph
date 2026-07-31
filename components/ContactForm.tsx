"use client";

import { useState, type FormEvent } from "react";

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
      "peer w-full border-0 border-b border-white/25 bg-transparent pb-3 pt-8 text-lg text-white outline-none placeholder:text-white/40 focus:border-transparent",
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
          color: floating ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.9)",
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-white transition-transform duration-500 ease-expo"
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
      className="grid gap-10"
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
      <Field
        id="message"
        label="Tell me about the project"
        type="textarea"
        value={message}
        onChange={setMessage}
        required
      />

      <div className="flex flex-col items-start gap-4 pt-2">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <button
            type="submit"
            data-cursor-label={status === "sending" ? "…" : "send"}
            className="ui-label rounded-full border border-white/80 bg-transparent px-6 py-3 text-white transition-all duration-500 hover:scale-105 hover:border-white hover:bg-white hover:text-[#3554ff] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-white"
            disabled={disabled}
          >
            {status === "sending"
              ? "sending…"
              : status === "sent"
                ? "sent — thank you"
                : "send message"}
          </button>
          <p className="ui-label text-white/70">
            or write directly: vbphotograph2015@gmail.com
          </p>
        </div>

        <div role="status" aria-live="polite" className="min-h-[1.25rem]">
          {status === "sent" && (
            <p className="text-sm text-white">
              Message sent successfully.
            </p>
          )}
          {status === "error" && errorMsg && (
            <p className="text-sm text-white/90">
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
