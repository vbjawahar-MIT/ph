import RevealText from "@/components/RevealText";
import HeroButtons from "./HeroButtons";
import { HeroFade } from "./HeroSlider";
import { SITE } from "@/lib/site-config";

const SERVICES = [
  "Weddings",
  "Pre-Wedding",
  "Baby Shower",
  "Puberty",
  "Candid Films",
];

/**
 * Hero copy — brand eyebrow, headline, tagline, services and CTAs.
 * Sits bottom-left over the cinematic photograph so it never covers
 * faces; entrance is a staggered fade/rise after the page loads.
 */
export default function HeroContent() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1440px]">
      <div className="max-w-xl lg:max-w-[38rem]">
        <HeroFade delay={0.1}>
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-gold" />
            VB Photographe &nbsp;·&nbsp; Est. 2015
          </p>
        </HeroFade>

        <h1
          className="mt-6 font-serif text-[clamp(2.75rem,6vw,6rem)] font-medium tracking-serif text-white md:mt-7"
          style={{ lineHeight: 1 }}
        >
          <span className="sr-only">VB Photographe — </span>
          <RevealText as="span" splitBy="word" delay={0.2} className="block">
            Photographs that
          </RevealText>{" "}
          <RevealText
            as="span"
            splitBy="word"
            delay={0.38}
            className="block italic text-gold"
          >
            hold their breath.
          </RevealText>
        </h1>

        <HeroFade delay={0.65}>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 md:mt-7 md:text-lg">
            Bridal, groom and candid stories for the couples, families and
            people who prefer quiet to loud.
          </p>
        </HeroFade>

        <HeroFade delay={0.78}>
          <ul
            aria-label="Services"
            className="mt-5 hidden flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/60 md:flex"
          >
            {SERVICES.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
                )}
                {s}
              </li>
            ))}
          </ul>
        </HeroFade>

        <HeroFade delay={0.92}>
          <HeroButtons />
        </HeroFade>
      </div>
    </div>
  );
}

/**
 * Bottom-left contact row for the hero — Instagram, phone and studio
 * location. Server component (reads SITE, which uses node:fs).
 */
export function HeroMeta() {
  const phone = SITE.phones[0];
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    SITE.address.single
  )}`;
  const circle =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/85 transition-all duration-500 ease-expo group-hover:border-gold group-hover:bg-gold group-hover:text-noir md:h-10 md:w-10";

  return (
    <div className="flex items-center gap-3 md:gap-6">
      <a
        href={SITE.social.instagram.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram @${SITE.social.instagram.handle} (opens in a new tab)`}
        data-cursor-label="follow"
        className="group flex items-center gap-3"
      >
        <span className={circle}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="hidden text-sm text-white/75 transition-colors duration-500 group-hover:text-white xl:inline">
          @{SITE.social.instagram.handle}
        </span>
      </a>

      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        aria-label={`Call ${phone}`}
        data-cursor-label="call"
        className="group flex items-center gap-3"
      >
        <span className={circle}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
        </span>
        <span className="hidden text-sm text-white/75 transition-colors duration-500 group-hover:text-white md:inline">
          {phone}
        </span>
      </a>

      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Studio location — ${SITE.location} (opens Google Maps)`}
        data-cursor-label="map"
        className="group hidden items-center gap-3 lg:flex"
      >
        <span className={circle}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
        </span>
        <span className="text-sm text-white/75 transition-colors duration-500 group-hover:text-white">
          {SITE.location}
        </span>
      </a>
    </div>
  );
}
