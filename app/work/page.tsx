import type { Metadata } from "next";
import Link from "next/link";
import CategoryGrid from "@/components/gallery/CategoryGrid";
import ProtectedImage from "@/components/gallery/ProtectedImage";
import { getAllCategorySummaries } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Work — VB Photographe",
  description:
    "Selected bridal, groom, candid, baby, pre-wedding and traditional work.",
};

type Pick = { folder: string; file: string; position?: string };

/** Three portraits beside the archive text. */
const PANEL_TOP: Pick[] = [
  { folder: "bridal", file: "24.jpg", position: "50% 25%" },
  { folder: "groom", file: "44.jpg", position: "50% 25%" },
  { folder: "baby-shoot", file: "81.jpg", position: "50% 40%" },
];

/**
 * Staggered strip under it — varied widths and heights, centred on one
 * line so their edges step up and down. 12 columns from small tablets up,
 * a 2-column mosaic on phones.
 */
const PANEL_STRIP: (Pick & { tile: string })[] = [
  {
    folder: "couple-portrait",
    file: "173.jpg",
    position: "50% 45%",
    tile: "col-span-2 h-[190px] sm:col-span-5 sm:h-[240px]",
  },
  {
    folder: "baby-shower",
    file: "196.JPG",
    position: "50% 25%",
    tile: "h-[230px] sm:col-span-2 sm:h-[300px]",
  },
  {
    folder: "puberty",
    file: "202.JPG",
    position: "45% 40%",
    tile: "h-[230px] sm:col-span-3 sm:h-[210px]",
  },
  {
    folder: "pre-wedding",
    file: "97.jpg",
    position: "50% 78%",
    tile: "col-span-2 h-[190px] sm:col-span-2 sm:h-[265px]",
  },
];

export default function WorkPage() {
  const summaries = getAllCategorySummaries();

  const photoCount = summaries
    .filter((s) => s.category.kind === "images")
    .reduce((n, s) => n + s.count, 0);
  const resolve = (pick: Pick) => {
    const item = summaries
      .find((s) => s.category.folder === pick.folder)
      ?.items.find((i) => i.file === pick.file);
    return item ? { ...pick, src: item.thumb ?? item.src } : null;
  };
  const panelTop = PANEL_TOP.map(resolve).filter((p) => p !== null);
  const panelStrip = PANEL_STRIP.map((p) => {
    const r = resolve(p);
    return r ? { ...r, tile: p.tile } : null;
  }).filter((p) => p !== null);

  return (
    <section className="section-top section-bottom px-6 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        {/* COLLECTIONS — first thing on the page */}
        <header className="text-center">
          <p className="eyebrow">Collections</p>
          <h1
            className="mt-4 font-serif text-display font-medium tracking-serif text-ink"
            style={{ lineHeight: 1 }}
          >
            Explore by <em className="italic text-accent">occasion.</em>
          </h1>
          <span aria-hidden className="gold-ornament mt-6"><span /></span>
        </header>
        <div className="stack">
          <CategoryGrid categories={summaries} priorityCount={3} />
        </div>

        {/* THE FULL ARCHIVE */}
        <Link
          href="/work/all"
          data-reveal
          data-cursor-label="open"
          aria-label={`View all ${photoCount} photographs`}
          className="theme-dark group relative stack-lg grid overflow-hidden rounded-[28px] bg-noir shadow-lift ring-1 ring-gold/20 transition-shadow duration-700 ease-expo hover:shadow-[0_40px_80px_-30px_rgba(24,21,18,0.55)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
        >
          {/* Warm glow + fine grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-gold/[0.14] blur-3xl transition-opacity duration-700 group-hover:opacity-80"
          />
          <div aria-hidden className="film-grain absolute inset-0" />

          <div className="relative flex flex-col justify-center px-7 py-10 sm:px-12 lg:px-14 lg:py-12">
            <p className="eyebrow flex items-center gap-4">
              The full archive
              <span aria-hidden className="gold-rule w-10" />
            </p>
            <h2
              className="mt-4 font-serif text-[clamp(1.9rem,3.2vw,2.9rem)] font-medium tracking-serif text-ink"
              style={{ lineHeight: 1.08 }}
            >
              Every photograph,{" "}
              <em className="italic text-accent">in one place.</em>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">
              The complete portfolio, filtered by occasion.
            </p>

            <span className="btn btn-gold mt-7 self-start">
              View All Photographs
              <ArrowIcon />
            </span>
          </div>

          {/* Three portraits */}
          <div className="relative grid h-[220px] grid-cols-3 gap-2 p-2 sm:h-[280px] sm:gap-2.5 sm:p-3 lg:h-auto lg:min-h-[300px]">
            {panelTop.map((p, i) => (
              <PanelPhoto
                key={p.src}
                src={p.src}
                position={p.position}
                sizes="(min-width: 1024px) 16vw, 33vw"
                delay={i}
              />
            ))}
          </div>

          {/* Staggered strip — different sizes, stepping edges */}
          <div className="relative grid grid-cols-2 items-center gap-2 px-2 pb-2 sm:grid-cols-12 sm:gap-2.5 sm:px-3 sm:pb-3 lg:col-span-2">
            {panelStrip.map((p, i) => (
              <PanelPhoto
                key={p.src}
                src={p.src}
                position={p.position}
                sizes="(min-width: 640px) 40vw, 50vw"
                delay={i + 3}
                className={p.tile}
              >
                {i === 0 && (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-3 left-5 font-script text-3xl text-gold-light sm:bottom-4 sm:left-6 sm:text-4xl"
                      style={{ lineHeight: 1.1 }}
                    >
                      Capturing moments
                    </span>
                  </>
                )}
              </PanelPhoto>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
}

/** Rounded photo tile in the archive panel; zooms with the panel's hover. */
function PanelPhoto({
  src,
  position,
  sizes,
  delay,
  className = "",
  children,
}: {
  src: string;
  position?: string;
  sizes: string;
  delay: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[18px] bg-[#1a1a1a] ${className}`}>
      <ProtectedImage
        src={src}
        alt=""
        fill
        loading="lazy"
        sizes={sizes}
        className="object-cover transition-transform ease-expo group-hover:scale-[1.06]"
        style={{
          objectPosition: position ?? "50% 35%",
          transitionDuration: `${1200 + delay * 110}ms`,
        }}
      />
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/10"
      />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
