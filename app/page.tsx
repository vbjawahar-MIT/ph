import Link from "next/link";
import Marquee from "@/components/Marquee";
import HeroContent, { HeroMeta } from "@/components/hero/HeroContent";
import HeroSlider, { type HeroSlide } from "@/components/hero/HeroSlider";
import CategoryGrid from "@/components/gallery/CategoryGrid";
import ContactDetails from "@/components/ContactDetails";
import { getAllCategorySummaries } from "@/lib/gallery";

/**
 * Hero photographs — landscape frames from the existing galleries. The
 * first slide is the owner's pick. Positions are the focal point for the
 * portrait (mobile) and landscape (desktop) crops.
 */
const HERO_PICKS = [
  { folder: "couple-portrait", file: "120.jpg", mobile: "44% 30%", desktop: "50% 35%" },
  { folder: "couple-portrait", file: "185.jpg", mobile: "66% 40%", desktop: "50% 30%" },
  { folder: "bridal", file: "9.jpg", mobile: "86% 40%", desktop: "50% 45%" },
];

export default function HomePage() {
  const summaries = getAllCategorySummaries();

  const heroSlides: HeroSlide[] = HERO_PICKS.flatMap((pick) => {
    const item = summaries
      .find((s) => s.category.folder === pick.folder)
      ?.items.find((i) => i.file === pick.file && i.kind === "image");
    return item ? [{ src: item.src, mobile: pick.mobile, desktop: pick.desktop }] : [];
  });
  // Fallback if the picks are ever renamed: first category cover.
  if (heroSlides.length === 0) {
    const cover = summaries.find((s) => s.cover?.kind === "image")?.cover;
    if (cover) heroSlides.push({ src: cover.src });
  }

  return (
    <>
      {/* HERO — full-screen cinematic slider */}
      <HeroSlider slides={heroSlides} meta={<HeroMeta />}>
        <HeroContent />
      </HeroSlider>

      {/* FEATURED — all categories, clean grid */}
      <section
        aria-labelledby="featured-heading"
        className="px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-[1440px]">
          <header data-reveal className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
            <p className="eyebrow">Selected work</p>
            <h2
              id="featured-heading"
              className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.05 }}
            >
              Featured <em className="italic text-accent">Stories</em>
            </h2>
            <span aria-hidden className="gold-rule mx-auto mt-6" />
          </header>

          <CategoryGrid categories={summaries} priorityCount={3} />

          <div data-reveal className="mt-14 flex justify-center md:mt-20">
            <Link
              href="/work"
              data-cursor-label="view all"
              className="btn btn-outline"
            >
              Browse the Archive <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE — wedding-service labels on a dark band */}
      <div className="theme-dark bg-noir">
        <Marquee
          items={[
            "Bridal Portraits",
            "Groom Portraits",
            "Couple Portrait",
            "Baby Shoot",
            "Pre-Wedding",
            "Traditional",
          ]}
          gradient
        />
      </div>

      {/* CONTACT STRIP — phone + address near the bottom of home */}
      <section data-reveal className="bg-surface-alt px-6 py-24 md:px-10 md:py-28">
        <ContactDetails
          eyebrow="Studio"
          heading={
            <>
              Visit <em className="italic text-accent">or Call</em>
            </>
          }
        />
      </section>
    </>
  );
}
