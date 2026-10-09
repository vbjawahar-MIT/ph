import Link from "next/link";
import InstagramCard from "./social/InstagramCard";
import GoogleReviewsCard from "./social/GoogleReviewsCard";
import { SITE } from "@/lib/site-config";

// Same destinations as the top nav (components/Nav.tsx).
const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/about#services", label: "Services" },
  { href: "/work", label: "Gallery" },
  { href: "/packages", label: "Packages" },
  { href: "/contact", label: "Contact" },
];

/**
 * Dark footer — signature, quick links, contact details, socials and
 * copyright. Contact details (2 phone numbers + full address + email)
 * are preserved verbatim.
 */
export default function Footer() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single
  )}`;

  return (
    <footer className="theme-dark relative bg-noir">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 md:px-10 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          {/* Signature */}
          <div className="md:col-span-4">
            <p
              aria-hidden
              className="wordmark-md select-none font-script text-gold"
              style={{ lineHeight: 1.1 }}
            >
              VB Photographe
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Photographs that hold their breath.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <p className="eyebrow">Explore</p>
            <ul className="mt-5 space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink/75 transition-colors duration-500 hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/contact#enquiry"
                  data-cursor-label="book"
                  className="text-sm font-semibold text-gold transition-colors duration-500 hover:text-gold-light"
                >
                  Book Now →
                </Link>
              </li>
            </ul>
          </div>

          {/* Say hello + Studio */}
          <div className="md:col-span-3">
            <p className="eyebrow">Say hello</p>
            <Link
              href="/contact"
              data-cursor-label="write"
              className="mt-5 block font-serif text-xl text-ink transition-colors duration-500 hover:text-gold"
              style={{ lineHeight: 1.3, wordBreak: "break-word" }}
            >
              vbphotograph2015@gmail.com
            </Link>

            <p className="eyebrow mt-8">Studio</p>
            <ul className="mt-4 space-y-1">
              {SITE.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    data-cursor-label="call"
                    className="font-serif text-lg text-ink transition-colors duration-500 hover:text-gold"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="map"
              className="mt-3 block text-sm text-ink/60 transition-colors duration-500 hover:text-ink"
              style={{ lineHeight: 1.6 }}
            >
              {SITE.address.lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </a>
          </div>

          {/* Elsewhere — social links */}
          <div className="md:col-span-3 md:text-right">
            <p className="eyebrow">Elsewhere</p>
            <div className="mt-5 flex flex-col gap-4 md:items-end">
              <InstagramCard variant="inline" />
              <GoogleReviewsCard variant="compact" />
            </div>
          </div>
        </div>

        {/* Extra bottom/left padding keeps the row clear of the fixed
            "VB" back-to-top button in the bottom-left corner. */}
        <div className="mt-14 flex flex-col gap-2 border-t border-line/10 pb-24 pt-6 md:mt-16 md:flex-row md:items-center md:justify-between md:pb-6 md:pl-20">
          <p className="text-xs tracking-wide text-ink/50">
            © 2015 — 2026 VB Photographe
          </p>
          <p className="ui-label text-ink/40">{SITE.location}</p>
        </div>
      </div>
    </footer>
  );
}
