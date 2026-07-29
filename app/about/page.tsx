import type { Metadata } from "next";
import RevealText from "@/components/RevealText";
import AboutPortrait from "@/components/about/AboutPortrait";
import StatsRow from "@/components/about/StatsRow";

export const metadata: Metadata = {
  title: "About — VB Photographe",
  description:
    "VB Photographe Studio, founded by Karthick VB — a decade of weddings, portraits, and family stories from Salem, India.",
};

const SPECIALTIES = [
  "Wedding Photography",
  "Pre-Wedding Shoots",
  "Engagement Photography",
  "Baby Shower Photography",
  "Maternity Photography",
  "Puberty Ceremony Photography",
  "Birthday Celebrations",
  "Family Events",
  "All Special Occasions",
];

const PHILOSOPHY_POINTS = [
  "Natural expressions",
  "Genuine emotions",
  "Meaningful storytelling",
];

export default function AboutPage() {
  return (
    <>
      {/* HERO — founder portrait + intro */}
      <section className="px-6 pb-24 pt-40 md:px-10 md:pb-32">
        <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)]">
              <AboutPortrait />
            </div>
          </div>
          <div className="flex flex-col justify-end md:col-span-7">
            <p className="ui-label text-white/70">About</p>
            <h1
              className="mt-4 text-display font-bold lowercase tracking-display text-white"
              style={{ lineHeight: 0.9 }}
            >
              <span>capturing </span>
              <span className="text-white/70">moments,</span>
              <br />
              creating memories.
            </h1>
            <p className="ui-label mt-6 text-white/70">
              Founder — Karthick VB &nbsp;·&nbsp; Salem, India &nbsp;·&nbsp; est. 2015
            </p>

            <RevealText
              as="p"
              splitBy="word"
              className="mt-10 max-w-2xl text-lg text-white/85 md:text-xl"
            >
              VB Photographe Studio was founded by Karthick VB, a passionate photographer with over a decade of experience in capturing life&apos;s most cherished moments.
            </RevealText>
            <RevealText
              as="p"
              splitBy="word"
              delay={0.15}
              className="mt-6 max-w-2xl text-lg text-white/80"
            >
              What began as a passion has grown into a trusted photography brand known for creativity, quality, and storytelling.
            </RevealText>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <p className="ui-label text-white/70">By the numbers</p>
          <h2
            className="mt-4 text-display-sm font-bold lowercase tracking-display text-white"
            style={{ lineHeight: 0.95 }}
          >
            a decade of <span className="text-white/70">stories.</span>
          </h2>
          <div className="mt-12 md:mt-16">
            <StatsRow />
          </div>
        </div>
      </section>

      {/* SPECIALTIES */}
      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="ui-label text-white/70">What we do</p>
            <h2
              className="mt-4 text-display-sm font-bold lowercase tracking-display text-white"
              style={{ lineHeight: 0.95 }}
            >
              we <span className="text-white/70">specialize</span> in
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {SPECIALTIES.map((s) => (
                <li
                  key={s}
                  data-cursor
                  className="text-xl font-bold lowercase tracking-display text-white/60 transition-all duration-500 hover:translate-x-1 hover:text-white md:text-2xl"
                >
                  {s.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="ui-label text-white/70">Our philosophy</p>
            <h2
              className="mt-4 text-display-sm font-bold lowercase tracking-display text-white"
              style={{ lineHeight: 0.95 }}
            >
              more than <span className="text-white/70">pictures.</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <RevealText
              as="p"
              splitBy="word"
              className="text-lg text-white/85 md:text-xl"
            >
              photography is more than taking pictures. it is about preserving emotions, relationships, and unforgettable moments.
            </RevealText>
            <p className="ui-label mt-8 text-white/60">We focus on</p>
            <ul className="mt-4 space-y-2">
              {PHILOSOPHY_POINTS.map((p) => (
                <li
                  key={p}
                  className="text-2xl font-bold lowercase tracking-display text-white md:text-3xl"
                >
                  {p.toLowerCase()}
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-xl text-lg text-white/80">
              from the first consultation to the final delivery, we strive to provide a smooth, friendly, and professional experience. our goal is simple — to transform your special moments into timeless memories that you and your family will cherish forever.
            </p>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="border-t border-white/15 px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1600px] text-center">
          <p
            className="text-display-sm font-bold lowercase tracking-display text-white"
            style={{ lineHeight: 0.95 }}
          >
            vb photographe studio
          </p>
          <p className="ui-label mt-4 text-white/70">
            Capturing Moments, Creating Memories Forever.
          </p>
        </div>
      </section>
    </>
  );
}
