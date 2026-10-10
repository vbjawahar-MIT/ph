import type { Metadata } from "next";
import Link from "next/link";
import RevealText from "@/components/RevealText";
import AboutPortrait from "@/components/about/AboutPortrait";
import StatsRow from "@/components/about/StatsRow";
import ServiceCard from "@/components/about/ServiceCard";
import ProtectedImage from "@/components/gallery/ProtectedImage";
import { readFolder } from "@/lib/gallery";
import type { PackagePhoto } from "@/lib/packages";
import { SERVICES, STORY_PHOTOS } from "@/lib/services";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About — VB Photographe",
  description:
    "VB Photographe Studio, founded by Karthick VB — a decade of weddings, portraits, and family stories from Salem, India.",
};

const PHILOSOPHY_POINTS = [
  "Natural expressions",
  "Genuine emotions",
  "Meaningful storytelling",
];

const MILESTONES = [
  {
    when: "2015",
    text: "VB Photographe Studio is founded in Salem by Karthick VB.",
  },
  {
    when: "10+ years",
    text: "Weddings, portraits and family celebrations, photographed with care.",
  },
  {
    when: "Today",
    text: "A trusted name for 50+ happy clients and their families.",
  },
];

/** Hosted URL for a gallery file, or null if it has been renamed. */
function galleryPhoto(photo: PackagePhoto) {
  return (
    readFolder(photo.folder, "images").find((i) => i.file === photo.file)
      ?.src ?? null
  );
}

export default function AboutPage() {
  const storyMain = galleryPhoto(STORY_PHOTOS.main);
  const storyInset = galleryPhoto(STORY_PHOTOS.inset);
  const phone = SITE.phones[0];

  return (
    <>
      {/* INTRO — the photographer */}
      <section className="relative overflow-hidden section-top section-bottom px-6 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-16 h-[460px] w-[460px] rounded-full bg-gold/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-[40px] md:grid-cols-12 md:gap-[48px] lg:gap-[64px]">
          <div className="md:col-span-5">
            <div className="relative mx-auto max-w-md md:max-w-none">
              {/* Offset gold frame behind the portrait */}
              <div
                aria-hidden
                className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border border-gold/50 md:translate-x-5 md:translate-y-5"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lift">
                <AboutPortrait />
              </div>

              {/* Experience badge */}
              <div className="absolute -bottom-7 -left-2 rounded-2xl border border-line/10 bg-card px-5 py-4 shadow-lift sm:-left-6 sm:px-6 sm:py-5">
                <p className="font-serif text-4xl font-semibold leading-none text-ink sm:text-5xl">
                  10<span className="text-accent">+</span>
                </p>
                <p className="ui-label mt-2 text-[0.6rem] leading-snug text-ink/55 sm:text-[0.66rem]">
                  Years behind
                  <br />
                  the camera
                </p>
              </div>
              <p className="ui-label absolute -right-2 top-6 rounded-full bg-noir px-4 py-2 text-[0.6rem] text-gold-light shadow-lift sm:-right-5 sm:text-[0.66rem]">
                Est. 2015 · Salem
              </p>
            </div>
          </div>

          <div className="flex flex-col md:col-span-7 md:pl-4 lg:pl-10">
            <p className="eyebrow flex items-center gap-4">
              Meet the photographer
              <span aria-hidden className="gold-rule w-10" />
            </p>
            <h1
              className="mt-5 font-serif text-display font-medium tracking-serif text-ink"
              style={{ lineHeight: 0.95 }}
            >
              Karthick <em className="italic text-accent">VB</em>
            </h1>
            <p className="ui-label mt-5 text-ink/55">
              Founder &amp; Photographer &nbsp;·&nbsp; VB Photographe Studio
            </p>

            <p
              className="mt-9 max-w-2xl font-serif text-[1.7rem] font-medium tracking-serif text-ink md:text-[2.1rem]"
              style={{ lineHeight: 1.2 }}
            >
              Capturing <em className="italic text-accent">moments,</em>{" "}
              creating memories — for over a decade.
            </p>
            <span aria-hidden className="gold-rule mt-8" />
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/75">
              Wedding, portrait and family photographer based in Salem, Tamil
              Nadu — photographing weddings, celebrations and the people in
              them since 2015.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/contact#enquiry" data-cursor-label="book" className="btn btn-gold group">
                Book a Session
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
              </Link>
              <Link href="/packages" data-cursor-label="open" className="btn btn-outline">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section-y bg-surface-alt px-6 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <header data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">By the numbers</p>
            <h2
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              A decade of <em className="italic text-accent">stories.</em>
            </h2>
            <span aria-hidden className="gold-rule mx-auto mt-6" />
          </header>
          <div className="stack">
            <StatsRow />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section-y overflow-hidden px-6 md:px-10">
        <div className="mx-auto grid max-w-[1440px] items-center gap-[40px] md:grid-cols-12 md:gap-[48px] lg:gap-[72px]">
          <div className="relative pb-12 md:col-span-6 md:pb-16 lg:col-span-5">
            <div data-reveal="zoom" className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-2xl bg-surface-alt shadow-lift">
              {storyMain && (
                <ProtectedImage
                  src={storyMain}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 40vw, 82vw"
                  className="object-cover"
                  style={{ objectPosition: STORY_PHOTOS.main.position }}
                />
              )}
            </div>
            <div
              data-reveal
              style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
              className="absolute bottom-0 right-0 aspect-square w-[48%] overflow-hidden rounded-2xl border-[6px] border-surface bg-surface-alt shadow-lift"
            >
              {storyInset && (
                <ProtectedImage
                  src={storyInset}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 24vw, 48vw"
                  className="object-cover"
                  style={{ objectPosition: STORY_PHOTOS.inset.position }}
                />
              )}
            </div>
          </div>

          <div data-reveal className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <p className="eyebrow">Our story</p>
            <h2
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              From a passion to a{" "}
              <em className="italic text-accent">trusted studio.</em>
            </h2>
            <span aria-hidden className="gold-rule mt-7" />

            <RevealText
              as="p"
              splitBy="word"
              className="mt-8 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl"
            >
              VB Photographe Studio was founded by Karthick VB, a passionate photographer with over a decade of experience in capturing life&apos;s most cherished moments.
            </RevealText>
            <RevealText
              as="p"
              splitBy="word"
              delay={0.15}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70"
            >
              What began as a passion has grown into a trusted photography brand known for creativity, quality, and storytelling.
            </RevealText>

            <ol className="mt-10 space-y-6 border-l border-gold/40 pl-7">
              {MILESTONES.map((m) => (
                <li key={m.when} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rotate-45 bg-gold"
                  />
                  <p className="ui-label text-accent">{m.when}</p>
                  <p className="mt-1.5 text-base leading-relaxed text-ink/75">
                    {m.text}
                  </p>
                </li>
              ))}
            </ol>

            <p
              className="mt-10 font-script text-5xl text-accent"
              style={{ lineHeight: 1.1 }}
            >
              Karthick VB
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES — the nav's "Services" link scrolls here */}
      <section
        id="services"
        className="section-y scroll-mt-20 bg-surface-alt px-6 md:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <header data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What we do</p>
            <h2
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Our <em className="italic text-accent">Services</em>
            </h2>
            <span aria-hidden className="gold-rule mx-auto mt-6" />
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
              Weddings, portraits, family celebrations and candid films — each
              photographed with the same care.
            </p>
          </header>

          <ul className="stack grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-7">
            {SERVICES.map((s, i) => (
              <li
                key={s.id}
                data-reveal
                style={{ "--reveal-delay": `${(i % 4) * 80}ms` } as React.CSSProperties}
              >
                <ServiceCard
                  index={i + 1}
                  title={s.title}
                  description={s.description}
                  href={s.href}
                  photoSrc={"src" in s.photo ? s.photo.src : galleryPhoto(s.photo)}
                  position={s.photo.position}
                  video={s.video}
                />
              </li>
            ))}
          </ul>

          <div data-reveal className="stack flex flex-col items-center gap-6 text-center">
            <p className="font-serif text-2xl text-ink/80 md:text-3xl">
              …and <em className="italic text-accent">all special occasions.</em>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/packages" data-cursor-label="open" className="btn btn-gold">
                View Packages
              </Link>
              <Link href="/contact#enquiry" data-cursor-label="book" className="btn btn-outline">
                Ask About Your Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="section-y theme-dark bg-noir px-6 md:px-10">
        <div data-reveal className="mx-auto grid max-w-[1440px] gap-[40px] md:grid-cols-12 md:gap-[56px]">
          <div className="md:col-span-4">
            <p className="eyebrow">Our philosophy</p>
            <h2
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              More than <em className="italic text-accent">pictures.</em>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <RevealText
              as="p"
              splitBy="word"
              className="text-lg leading-relaxed text-ink/85 md:text-xl"
            >
              Photography is more than taking pictures. It is about preserving emotions, relationships, and unforgettable moments.
            </RevealText>
            <p className="eyebrow mt-10">We focus on</p>
            <ul className="mt-5 space-y-3">
              {PHILOSOPHY_POINTS.map((p, i) => (
                <li
                  key={p}
                  className="flex items-baseline gap-5 font-serif text-2xl text-ink md:text-3xl"
                >
                  <span className="font-sans text-xs font-semibold tracking-ui text-accent">
                    0{i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink/70">
              From the first consultation to the final delivery, we strive to provide a smooth, friendly, and professional experience. Our goal is simple — to transform your special moments into timeless memories that you and your family will cherish forever.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING — call to action */}
      <section className="section-y px-6 md:px-10">
        <div data-reveal className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-line/10 bg-card px-6 py-[48px] text-center shadow-soft md:px-16 md:py-[64px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
          />
          <p
            className="relative font-script text-5xl text-accent md:text-7xl"
            style={{ lineHeight: 1.2 }}
          >
            VB Photographe Studio
          </p>
          <p className="ui-label relative mt-4 text-ink/55">
            Capturing Moments, Creating Memories Forever.
          </p>
          <span aria-hidden className="gold-rule relative mx-auto mt-8" />
          <h2
            className="relative mt-8 font-serif text-display-sm font-medium tracking-serif text-ink"
            style={{ lineHeight: 1.05 }}
          >
            Let&apos;s tell <em className="italic text-accent">your story.</em>
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
            Share your date, venue and plans, and we&apos;ll help you find the
            right package for your celebration.
          </p>
          <div className="relative mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contact#enquiry" data-cursor-label="book" className="btn btn-gold group">
              Book a Session
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
            </Link>
            <Link href="/packages" data-cursor-label="open" className="btn btn-outline">
              View Packages
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

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
