import Link from "next/link";
import ProtectedImage from "./ProtectedImage";
import VideoThumbnail from "./VideoThumbnail";
import type { CategorySummary } from "@/lib/gallery";

type Props = {
  summary: CategorySummary;
  /** Above-the-fold cards should preload their cover. */
  priority?: boolean;
  /** next/image `sizes` — set by the parent grid. */
  sizes?: string;
};

/**
 * A single category tile used on /work and the home Featured section.
 * Cover comes from `cover.jpg` in the folder if present, otherwise the
 * first natural-sorted file. Empty categories still render — with a
 * subtle "coming soon" state — so a placeholder gallery like
 * Traditional still has a card and appears on the archive index.
 */
export default function CategoryCard({ summary, priority, sizes }: Props) {
  const { category, cover, count } = summary;
  const label = category.label;
  const href = `/work/${category.slug}`;

  // Resolve the cover in preference order:
  //   1. Filesystem cover (from public/assets/<folder>/) if any
  //   2. Explicit `coverThumb` on the category (e.g. YouTube thumbnail
  //      for Candid Videos whose media lives off-server)
  //   3. Fall back to the "Coming soon" placeholder tile
  const overrideCoverSrc = !cover ? category.coverThumb : null;

  return (
    <Link
      href={href}
      data-cursor-label={category.kind === "videos" ? "watch" : "view"}
      aria-label={`${label} — ${count} ${
        category.kind === "videos" ? "videos" : "photographs"
      }`}
      className="group block"
    >
      <div className="card relative overflow-hidden rounded-sm shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)] transition-shadow duration-700 ease-expo group-hover:shadow-[0_30px_80px_-25px_rgba(10,10,26,0.7)]">
        <div className="aspect-[4/5] w-full">
          {cover ? (
            cover.kind === "video" ? (
              <VideoThumbnail src={cover.src} className="card-image" />
            ) : (
              <ProtectedImage
                src={cover.src}
                alt=""
                fill
                priority={priority}
                sizes={sizes ?? "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"}
                quality={85}
                className="card-image h-full w-full"
              />
            )
          ) : overrideCoverSrc ? (
            <ProtectedImage
              src={overrideCoverSrc}
              alt=""
              fill
              priority={priority}
              sizes={sizes ?? "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"}
              quality={85}
              className="card-image h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5">
              <p className="ui-label text-white/60">Coming soon</p>
            </div>
          )}
        </div>
        <div className="card-tint" aria-hidden />
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-xl font-bold lowercase tracking-display text-white transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 md:text-2xl">
          {label.toLowerCase()}
        </h3>
        <span className="ui-label shrink-0 text-white/60">
          {(() => {
            const total = category.youtubeVideoIds?.length ?? count;
            if (total === 0) return "coming soon";
            return `${total} ${category.kind === "videos" ? "films" : "photos"}`;
          })()}
        </span>
      </div>
      <p className="ui-label mt-2 text-white/60">{category.tagline}</p>
    </Link>
  );
}
