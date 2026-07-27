import { SITE } from "@/lib/site-config";

type Props = {
  /** Section title above the columns. Omit for a bare/inline placement. */
  eyebrow?: string;
  /** Larger display heading — only shown when set. */
  heading?: React.ReactNode;
};

/**
 * Reusable phone + address block for the Contact page and the home
 * page contact strip. Uses only existing design tokens (ui-label,
 * white-alpha text, border-white/15) so it feels native.
 *
 * Phone numbers link via `tel:` and the address as a whole opens
 * Google Maps in a new tab — small conveniences that don't change the
 * visual language.
 */
export default function ContactDetails({ eyebrow, heading }: Props) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single
  )}`;

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {eyebrow && <p className="ui-label text-white/70">{eyebrow}</p>}
      {heading && (
        <h2
          className="mt-4 font-bold lowercase tracking-display text-white"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1 }}
        >
          {heading}
        </h2>
      )}

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-2 md:gap-16">
        {/* Phone */}
        <div>
          <p className="ui-label text-white/60">Phone</p>
          <ul className="mt-4 space-y-2">
            {SITE.phones.map((p) => (
              <li key={p}>
                <a
                  href={`tel:${p.replace(/\s+/g, "")}`}
                  data-cursor-label="call"
                  className="text-xl font-bold lowercase tracking-display text-white transition-opacity duration-500 hover:opacity-70 md:text-2xl"
                >
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Address */}
        <div>
          <p className="ui-label text-white/60">Address</p>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="map"
            className="mt-4 block text-lg font-medium text-white/90 transition-opacity duration-500 hover:opacity-70 md:text-xl"
            style={{ lineHeight: 1.5 }}
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
  );
}
