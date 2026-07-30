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
    <section className="px-6 pb-32 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1600px]">
        <p className="ui-label text-white/70">{category.label}</p>
        <h1
          className="mt-4 text-display font-bold lowercase tracking-display text-white"
          style={{ lineHeight: 0.9 }}
        >
          {category.tagline}
        </h1>
        <p className="ui-label mt-6 text-white/60">{videoIds.length} films</p>

        <div className="mt-14 md:mt-16">
          <CandidVideosGrid
            videoIds={videoIds}
            categoryLabel={category.label}
          />
        </div>
      </div>
    </section>
  );
}
