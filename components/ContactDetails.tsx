import { SITE } from "@/lib/site-config";

type Props = {
  /** Section title above the columns. Omit for a bare/inline placement. */
  eyebrow?: string;
  /** Larger display heading — only shown when set. */
  heading?: React.ReactNode;
};

/**
 * Reusable phone + address block for the Contact page and the home
 * page contact strip. Phone numbers link via `tel:` and the address
 * opens Google Maps in a new tab.
 */
export default function ContactDetails({ eyebrow, heading }: Props) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single
  )}`;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {heading && (
        <h2
          className="mt-4 font-serif font-medium tracking-serif text-ink"
          style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)", lineHeight: 1.05 }}
        >
          {heading}
        </h2>
      )}

      <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
        {/* Phone */}
        <div className="flex gap-5 rounded-2xl border border-line/10 bg-card p-6 shadow-soft md:p-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
          </span>
          <div>
            <p className="ui-label text-ink/55">Phone</p>
            <ul className="mt-3 space-y-1">
              {SITE.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    data-cursor-label="call"
                    className="font-serif text-2xl text-ink transition-colors duration-500 hover:text-accent md:text-[1.75rem]"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Address */}
        <div className="flex gap-5 rounded-2xl border border-line/10 bg-card p-6 shadow-soft md:p-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
          </span>
          <div>
            <p className="ui-label text-ink/55">Address</p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="map"
              className="mt-3 block text-base text-ink/80 transition-colors duration-500 hover:text-ink md:text-lg"
              style={{ lineHeight: 1.6 }}
            >
              {SITE.address.lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
