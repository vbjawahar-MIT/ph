import Link from "next/link";
import InstagramCard from "./social/InstagramCard";
import GoogleReviewsCard from "./social/GoogleReviewsCard";
import { SITE } from "@/lib/site-config";

/**
 * Compact footer.
 *
 * Phase 9 shrunk every element by ~35–50% versus the previous version:
 * padding, gaps, text sizes, and especially the massive wordmark.
 * Design + brand tokens are unchanged — same fonts, same colours, same
 * hairline border, same right-flush "Elsewhere" column on md+.
 *
 * Contact details (2 phone numbers + full address + email) are
 * preserved verbatim per the spec.
 */
export default function Footer() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single
  )}`;

  return (
    <footer className="relative mt-20 border-t border-white/15 pt-10 text-white md:pt-12">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        {/* Top row — Say hello / Studio / Elsewhere */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {/* Say hello — email */}
          <div>
            <p className="ui-label text-white/60">Say hello</p>
            <Link
              href="/contact"
              data-cursor-label="write"
              className="mt-3 block text-base font-bold lowercase tracking-display text-white transition-opacity duration-500 hover:opacity-70 md:text-lg lg:text-xl"
              style={{ lineHeight: 1.2, wordBreak: "break-word" }}
            >
              vbphotograph2015@gmail.com
            </Link>
          </div>

          {/* Studio — phone + address */}
          <div>
            <p className="ui-label text-white/60">Studio</p>
            <ul className="mt-3 space-y-1">
              {SITE.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s+/g, "")}`}
                    data-cursor-label="call"
                    className="text-sm font-bold lowercase tracking-display text-white transition-opacity duration-500 hover:opacity-70 md:text-base"
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
              className="mt-3 block text-xs text-white/80 transition-opacity duration-500 hover:opacity-70 md:text-sm"
              style={{ lineHeight: 1.5 }}
            >
              {SITE.address.lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </a>
          </div>

          {/* Elsewhere — social links */}
          <div className="md:text-right">
            <p className="ui-label text-white/60">Elsewhere</p>
            <div className="mt-3 flex flex-col gap-2 md:items-end">
              <InstagramCard variant="inline" />
              <GoogleReviewsCard variant="compact" />
            </div>
          </div>
        </div>

        {/* Compact wordmark — spans full width but ~50% of previous size */}
        <div aria-hidden className="mt-10 select-none md:mt-14">
          <p
            className="wordmark-md font-bold lowercase tracking-display text-white/95"
            style={{ lineHeight: 0.9 }}
          >
            vb photographe
          </p>
        </div>

        <div className="flex items-center justify-start py-4 text-xs md:py-5">
          <p className="ui-label text-white/60">© 2015 — 2026 VB Photographe</p>
        </div>
      </div>
    </footer>
  );
}
