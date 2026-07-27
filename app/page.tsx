import Link from "next/link";
import Marquee from "@/components/Marquee";
import HeroContent from "@/components/hero/HeroContent";
import HeroWatermark from "@/components/hero/HeroWatermark";
import CategoryGrid from "@/components/gallery/CategoryGrid";
import ContactDetails from "@/components/ContactDetails";
import { getAllCategorySummaries } from "@/lib/gallery";
import { SITE } from "@/lib/site-config";

export default function HomePage() {
  const summaries = getAllCategorySummaries();

  return (
    <>
      {/* HERO — single gold watermark behind the wordmark. Nav logo
          is the only foreground brand mark. Overflow-hidden so the
          watermark can never push out of the section. */}
      <section className="relative flex min-h-[86svh] flex-col justify-end overflow-hidden px-6 pb-14 pt-32 md:px-10 md:pb-20 md:pt-36">
        <HeroWatermark logoSrc={SITE.logo?.src ?? null} />
        <HeroContent />
      </section>

      {/* FEATURED — all populated categories, clean 3-col grid */}
      <section
        aria-labelledby="featured-heading"
        className="px-6 py-20 md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-[1600px]">
          <header className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <div>
              <p className="ui-label text-white/70">Selected work</p>
              <h2
                id="featured-heading"
                className="mt-3 text-display-sm font-bold lowercase tracking-display text-white"
                style={{ lineHeight: 0.95 }}
              >
                featured <span className="text-white/70">stories</span>
              </h2>
            </div>
            <Link
              href="/work"
              data-cursor-label="view all"
              className="ui-label self-start border-b border-white/60 pb-1 text-white/80 transition-colors duration-500 hover:border-white hover:text-white md:self-end"
            >
              browse the archive →
            </Link>
          </header>

          <CategoryGrid categories={summaries} priorityCount={3} />
        </div>
      </section>

      {/* MARQUEE — wedding-service labels (no videos post-Phase 8) */}
      <Marquee
        items={[
          "bridal portraits",
          "groom portraits",
          "couple portrait",
          "baby shoot",
          "pre-wedding",
          "traditional",
        ]}
        gradient
      />

      {/* CONTACT STRIP — phone + address near the bottom of home */}
      <section className="border-t border-white/15 px-6 py-20 md:px-10 md:py-28">
        <ContactDetails
          eyebrow="Studio"
          heading={
            <>
              visit <span className="text-white/70">or call</span>
            </>
          }
        />
      </section>
    </>
  );
}
