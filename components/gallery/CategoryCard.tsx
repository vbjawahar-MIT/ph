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
  //   1. Hand-picked `coverImage` on the category (high-resolution crop)
  //   2. Filesystem cover (from public/assets/<folder>/) if any
  //   3. Explicit `coverThumb` on the category (e.g. YouTube thumbnail
  //      for Candid Videos whose media lives off-server)
  //   4. Fall back to the "Coming soon" placeholder tile
  const overrideCoverSrc =
    category.coverImage ?? (!cover ? category.coverThumb : null);
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
      <div className="card rounded-xl bg-noir shadow-soft transition-shadow duration-700 ease-expo [container-type:inline-size] group-hover:shadow-lift">
        <div className="relative aspect-[6/7] w-full">
          {cover && !category.coverImage ? (
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
        {/* Title on one line (sized to the card's width), count beneath */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-5 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 md:p-6">
          <h3
            className="max-w-full truncate font-serif text-[clamp(22px,10cqi,40px)] font-medium tracking-serif text-white"
            style={{ lineHeight: 1.1 }}
          >
            {label}
          </h3>
          {countLabel && (
            <span className="ui-label mt-[8px] text-white/80">{countLabel}</span>
          )}
        </div>
      </div>

      <p className="mt-3 font-serif text-[1.08rem] leading-snug text-ink/65 first-letter:uppercase">
        {category.tagline}
      </p>
    </Link>
  );
}
