import type { Metadata } from "next";
import Link from "next/link";
import Portfolio, { type PortfolioPhoto } from "@/components/gallery/Portfolio";
import { CATEGORIES } from "@/lib/categories";
import { readFolder } from "@/lib/gallery";
import { PORTFOLIO_FILTERS } from "@/lib/portfolio";

/**
 * Every photograph in one filterable portfolio. A static route, so it
 * takes precedence over /work/[slug] ("all" is not a category slug).
 */
export const metadata: Metadata = {
  title: "All Photographs — VB Photographe",
  description:
    "Every photograph from VB Photographe — weddings, pre-wedding, portraits, baby, maternity and family celebrations.",
};

export default function AllPhotographsPage() {
  // Every photograph from the existing galleries, category by category.
  const photos: PortfolioPhoto[] = CATEGORIES.filter(
    (c) => c.kind === "images",
  ).flatMap((c) =>
    readFolder(c.folder, "images")
      .filter((i) => i.kind === "image")
      .map((i) => ({
        src: i.src,
        thumb: i.thumb,
        file: i.file,
        w: i.width ?? 4,
        h: i.height ?? 5,
        category: c.slug,
        label: c.label,
      })),
  );

  const filmsCategory = CATEGORIES.find(
    (c) => c.kind === "videos" && (c.youtubeVideoIds?.length ?? 0) > 0,
  );
  const films = filmsCategory
    ? {
        slug: filmsCategory.slug,
        label: filmsCategory.label,
        videoIds: filmsCategory.youtubeVideoIds ?? [],
      }
    : null;

  const collections = Object.fromEntries(
    CATEGORIES.map((c) => [c.slug, { label: c.label, tagline: c.tagline }]),
  );

  return (
    <section className="section-top section-bottom px-6 md:px-10">
      <header className="mx-auto max-w-2xl text-center">
        <Link
          href="/work"
          data-cursor-label="back"
          className="ui-label inline-flex items-center gap-2 text-ink/55 transition-colors duration-500 hover:text-accent"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All collections
        </Link>
        <h1
          className="mt-5 font-serif text-display font-medium tracking-serif text-ink"
          style={{ lineHeight: 1 }}
        >
          All <em className="italic text-accent">Photographs</em>
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4">
          <span aria-hidden className="gold-rule w-8" />
          <p className="ui-label text-ink/55">
            {photos.length} photographs
            {films ? ` · ${films.videoIds.length} films` : ""}
          </p>
          <span aria-hidden className="gold-rule w-8" />
        </div>
      </header>

      <div className="stack">
        <Portfolio
          photos={photos}
          filters={PORTFOLIO_FILTERS}
          collections={collections}
          films={films}
        />
      </div>
    </section>
  );
}
