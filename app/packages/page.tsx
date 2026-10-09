import type { Metadata } from "next";
import Link from "next/link";
import AnchorLink from "@/components/AnchorLink";
import HeroCarousel from "@/components/packages/HeroCarousel";
import PackageCard from "@/components/packages/PackageCard";
import { readFolder } from "@/lib/gallery";
import {
  PACKAGE_GROUPS,
  PACKAGES_CAROUSEL,
  enquirySubject,
  type PackageGroup,
  type PackagePhoto,
} from "@/lib/packages";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Packages — VB Photographe",
  description:
    "Wedding, engagement, baby shower and puberty photography packages from VB Photographe, Salem — traditional and candid photo and video, albums, frames and more.",
};

/** Hosted URL for a gallery file, or null if it has been renamed. */
function photoSrc(photo: PackagePhoto) {
  return (
    readFolder(photo.folder, "images").find((i) => i.file === photo.file)
      ?.src ?? null
  );
}

export default function PackagesPage() {
  // Carousel uses the full-resolution originals — it's the page's hero.
  const carousel = PACKAGES_CAROUSEL.flatMap((p) => {
    const item = readFolder(p.folder, "images").find((i) => i.file === p.file);
    return item
      ? [{ src: item.src, position: p.position, label: p.label, title: p.title }]
      : [];
  });
  const phone = SITE.phones[0];

  return (
    <>
      {/* HERO — copy beside the photograph carousel */}
      <section className="relative isolate overflow-hidden bg-surface px-6 pb-20 pt-28 md:px-10 md:pt-36 lg:pb-28 lg:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl"
        />
        <Sprig className="pointer-events-none absolute -left-12 bottom-6 hidden h-60 w-auto -rotate-12 text-gold/50 lg:block" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <p className="eyebrow">
              Your story <span className="mx-2 text-gold">•</span> Our passion
            </p>
            <h1
              className="mt-5 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Timeless Moments,
              <br />
              <em className="italic text-accent">Beautifully Captured</em>
            </h1>
            <span aria-hidden className="gold-rule mt-8" />
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/75">
              We turn your special moments into stunning memories with
              creativity, passion and a personal touch.
            </p>
            <AnchorLink
              to={PACKAGE_GROUPS[0].id}
              data-cursor-label="open"
              className="btn btn-gold group mt-9"
            >
              Explore Our Packages
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
            </AnchorLink>
            <p
              aria-hidden
              className="mt-10 flex flex-wrap items-center gap-x-3 font-script text-3xl text-accent md:text-[2.1rem]"
              style={{ lineHeight: 1.2 }}
            >
              Weddings · Events · Families · Forever
              <HeartIcon className="h-6 w-6" />
            </p>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <HeroCarousel slides={carousel} />
          </div>
        </div>
      </section>

      {PACKAGE_GROUPS.map((group, i) => (
        <section
          key={group.id}
          id={group.id}
          className={`relative scroll-mt-16 overflow-hidden px-6 py-20 md:px-10 md:py-28 ${
            i % 2 === 1 ? "bg-surface-alt" : ""
          }`}
        >
          {i % 2 === 1 && (
            <>
              <Sprig className="pointer-events-none absolute -left-10 top-10 hidden h-56 w-auto -rotate-[35deg] text-gold/45 lg:block" />
              <Sprig className="pointer-events-none absolute -right-10 top-24 hidden h-56 w-auto rotate-[200deg] text-gold/45 lg:block" />
            </>
          )}
          <div className="relative mx-auto max-w-[1440px]">
            <GroupHeader group={group} />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 md:mt-14 xl:grid-cols-4 xl:gap-7">
              {group.packages.map((pkg, n) => (
                <div
                  key={pkg.id}
                  data-reveal
                  className="h-full"
                  style={{ "--reveal-delay": `${(n % 4) * 90}ms` } as React.CSSProperties}
                >
                  <PackageCard
                    index={n + 1}
                    pkg={pkg}
                    photoSrc={photoSrc(pkg.photo)}
                    subject={enquirySubject(group, pkg)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CLOSING — help choosing */}
      <section className="px-6 py-20 md:px-10 md:py-24">
        <div data-reveal className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Not sure which to choose?</p>
            <h2
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Tell us about your <em className="italic text-accent">celebration.</em>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">
              Share your date, venue and plans, and we&apos;ll help you find
              the package that fits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/contact#enquiry" data-cursor-label="book" className="btn btn-gold">
              Book Now
            </Link>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              data-cursor-label="call"
              className="btn btn-outline"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function GroupHeader({ group }: { group: PackageGroup }) {
  const [before] = group.title.split(group.accent);
  return (
    <header data-reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="eyebrow flex items-center gap-4">
          Our Packages
          <span aria-hidden className="gold-rule w-10" />
        </p>
        <h2
          className="mt-4 font-serif text-[clamp(2.1rem,4vw,3.4rem)] font-medium tracking-serif text-ink"
          style={{ lineHeight: 1.05 }}
        >
          {before}
          <em className="italic text-accent">{group.accent}</em>
        </h2>
        <p className="ui-label mt-5 tracking-[0.28em] text-ink/55">
          {group.tagline}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-accent">
          {group.badge.icon === "rings" ? (
            <RingsIcon className="h-7 w-7" />
          ) : (
            <FamilyIcon className="h-7 w-7" />
          )}
        </span>
        <div>
          <p className="font-serif text-xl font-medium text-ink">
            {group.badge.title}
          </p>
          <p className="text-sm text-ink/60">{group.badge.text}</p>
        </div>
      </div>
    </header>
  );
}

/* ── Icons & ornaments ─────────────────────────────────────────────── */

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RingsIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="19" r="8" />
      <circle cx="20" cy="19" r="8" />
      <path d="M12 4.5l2.5 3-2.5 3-2.5-3z" strokeLinejoin="round" />
    </svg>
  );
}

function FamilyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="23" cy="9" r="3.5" />
      <circle cx="16" cy="14" r="3" />
      <path d="M2.5 27c0-5 2.9-9 6.5-9 1.6 0 3 .7 4.1 1.9" />
      <path d="M29.5 27c0-5-2.9-9-6.5-9-1.6 0-3 .7-4.1 1.9" />
      <path d="M10.5 28c0-4 2.5-7 5.5-7s5.5 3 5.5 7" />
    </svg>
  );
}

/** Gold line-art leaf sprig, echoing the florals in the logo. */
function Sprig({ className }: { className?: string }) {
  const leaves: [number, number, number][] = [
    [58, 240, -150],
    [56, 206, -30],
    [54, 172, -155],
    [54, 138, -25],
    [57, 104, -150],
    [61, 72, -32],
    [66, 42, -142],
  ];
  return (
    <svg aria-hidden viewBox="0 0 120 280" className={className} fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d="M62 278C56 220 48 150 70 6" />
      {leaves.map(([x, y, r]) => (
        <path
          key={`${x}-${y}`}
          d="M0 0C10-13 30-13 40 0 30 13 10 13 0 0Z"
          transform={`translate(${x} ${y}) rotate(${r})`}
          fill="currentColor"
          fillOpacity="0.08"
        />
      ))}
      <path d="M0 0C6-8 18-8 24 0 18 8 6 8 0 0Z" transform="translate(70 8) rotate(-80)" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}
