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
 * "Coming soon" state — so a placeholder gallery like Traditional still
 * has a card and appears on the archive index.
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
  const imageSizes =
    sizes ?? "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw";

  const total = category.youtubeVideoIds?.length ?? count;
  const countLabel =
    total === 0
      ? null
      : `${total} ${category.kind === "videos" ? "films" : "photos"}`;

  return (
    <Link
      href={href}
      data-cursor-label={category.kind === "videos" ? "watch" : "view"}
      aria-label={`${label} — ${count} ${
        category.kind === "videos" ? "videos" : "photographs"
      }`}
      className="group block"
    >
      <div className="card rounded-xl bg-noir shadow-soft transition-shadow duration-700 ease-expo group-hover:shadow-lift">
        <div className="relative aspect-[4/5] w-full">
          {cover ? (
            cover.kind === "video" ? (
              <VideoThumbnail src={cover.src} className="card-image" />
            ) : (
              <ProtectedImage
                src={cover.thumb ?? cover.src}
                alt=""
                fill
                priority={priority}
                sizes={imageSizes}
                quality={85}
                className="card-image h-full w-full object-cover"
              />
            )
          ) : overrideCoverSrc ? (
            <ProtectedImage
              src={overrideCoverSrc}
              alt=""
              fill
              priority={priority}
              sizes={imageSizes}
              quality={85}
              className="card-image h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_40%,#1f1b14_0%,#0b0b0b_70%)]">
              <span aria-hidden className="gold-rule" />
              <p className="ui-label text-gold">Coming soon</p>
            </div>
          )}
        </div>

        <div className="card-tint" aria-hidden />

        {/* Title over a permanent bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
          <h3
            className="font-serif text-2xl font-medium tracking-serif text-white transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 md:text-[1.75rem]"
            style={{ lineHeight: 1.1 }}
          >
            {label}
          </h3>
          {countLabel && (
            <span className="ui-label shrink-0 pb-1 text-white/75">
              {countLabel}
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/60 first-letter:uppercase">
        {category.tagline}
      </p>
    </Link>
  );
}
