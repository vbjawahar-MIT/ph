import type { Metadata } from "next";
import CandidVideosGrid from "@/components/gallery/CandidVideosGrid";
import { getCategoryBySlug } from "@/lib/categories";
import { notFound } from "next/navigation";

/**
 * Candid Videos gallery.
 *
 * A static route (wins over the dynamic /work/[slug]) because this
 * category's media is hosted on YouTube rather than in the local
 * filesystem. Header, spacing, animations and page width match the
 * other category pages exactly.
 *
 * The grid + video state now live in CandidVideosGrid (client) so
 * we can coordinate a single active iframe at a time — see
 * components/gallery/CandidVideosGrid.tsx for the reasoning.
 */

export const metadata: Metadata = {
  title: "Candid Videos — VB Photographe",
  description: "Candid films from VB Photographe — the day, in motion.",
};

export default function CandidVideosPage() {
  const category = getCategoryBySlug("candid-videos");
  const videoIds = category?.youtubeVideoIds ?? [];
  if (!category || videoIds.length === 0) notFound();

  return (
    <section className="section-top section-bottom px-6 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{category.label}</p>
          <h1
            className="mt-4 font-serif text-display-sm font-medium tracking-serif text-ink first-letter:uppercase"
            style={{ lineHeight: 1.05 }}
          >
            {category.tagline}
          </h1>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span aria-hidden className="gold-rule w-8" />
            <p className="ui-label text-ink/55">{videoIds.length} films</p>
            <span aria-hidden className="gold-rule w-8" />
          </div>
        </header>

        <div className="stack">
          <CandidVideosGrid
            videoIds={videoIds}
            categoryLabel={category.label}
          />
        </div>
      </div>
    </section>
  );
}
