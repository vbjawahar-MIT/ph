"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ProtectedImage from "./ProtectedImage";
import Lightbox from "./Lightbox";
import CandidVideosGrid from "./CandidVideosGrid";
import { useLenis } from "@/components/SmoothScroll";
import type { MediaItem } from "@/lib/gallery";
import type { PortfolioFilter } from "@/lib/portfolio";

export type PortfolioPhoto = {
  /** Full-resolution original — opened in the lightbox. */
  src: string;
  /** Lightweight grid image (falls back to src). */
  thumb?: string;
  file: string;
  w: number;
  h: number;
  /** Category slug and label. */
  category: string;
  label: string;
};

type Props = {
  /** Every photograph, grouped by category in gallery order. */
  photos: PortfolioPhoto[];
  filters: PortfolioFilter[];
  /** slug → label/tagline, for "open the collection" links. */
  collections: Record<string, { label: string; tagline: string }>;
  films: { slug: string; label: string; videoIds: readonly string[] } | null;
};

const ALL = "all";
/** Photographs rendered per step; more are added as the visitor scrolls. */
const BATCH = 24;
const SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

// Column count follows the viewport: 2 on phones, 3 on tablets/laptops,
// 4 on wide screens. Server render assumes 3.
const COLUMN_QUERIES: [string, number][] = [
  ["(min-width: 1280px)", 4],
  ["(min-width: 768px)", 3],
];
function subscribeColumns(onChange: () => void) {
  const lists = COLUMN_QUERIES.map(([q]) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}
function getColumns() {
  for (const [q, n] of COLUMN_QUERIES) {
    if (window.matchMedia(q).matches) return n;
  }
  return 2;
}

/** Round-robin across categories so a mixed view opens with variety. */
function interleave(photos: PortfolioPhoto[]) {
  const groups = new Map<string, PortfolioPhoto[]>();
  for (const p of photos) {
    const g = groups.get(p.category);
    if (g) g.push(p);
    else groups.set(p.category, [p]);
  }
  const lists = [...groups.values()];
  if (lists.length < 2) return photos;
  const out: PortfolioPhoto[] = [];
  for (let i = 0; out.length < photos.length; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

/**
 * Masonry placement: each photograph goes to the currently shortest
 * column (heights from the known aspect ratios), so the layout is stable
 * before any image loads and appending a batch never reshuffles it.
 */
function toColumns(photos: PortfolioPhoto[], n: number) {
  const cols = Array.from({ length: n }, () => [] as { photo: PortfolioPhoto; index: number }[]);
  const heights = new Array<number>(n).fill(0);
  photos.forEach((photo, index) => {
    let c = 0;
    for (let k = 1; k < n; k++) if (heights[k] < heights[c] - 0.001) c = k;
    cols[c].push({ photo, index });
    heights[c] += photo.h / photo.w + 0.04;
  });
  return cols;
}

type TileProps = {
  photo: PortfolioPhoto;
  index: number;
  total: number;
  load: "priority" | "eager" | "lazy";
  delay: number;
  onOpen: (index: number) => void;
};

const Tile = memo(function Tile({ photo, index, total, load, delay, onOpen }: TileProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      data-cursor-label="view"
      aria-label={`Open photo ${index + 1} of ${total} — ${photo.label}`}
      className="portfolio-tile group/tile relative block w-full overflow-hidden rounded-[10px] bg-surface-alt"
      style={{ aspectRatio: `${photo.w} / ${photo.h}`, animationDelay: `${delay}ms` }}
    >
      <ProtectedImage
        src={photo.thumb ?? photo.src}
        alt=""
        fill
        sizes={SIZES}
        priority={load === "priority"}
        loading={load === "lazy" ? "lazy" : "eager"}
        fetchPriority={load === "priority" ? "high" : "auto"}
        className="object-cover transition-transform duration-[1400ms] ease-expo group-hover/tile:scale-[1.045]"
      />
      {/* Hover: soft shade, category name and an expand mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100"
      />
      <span
        aria-hidden
        className="ui-label pointer-events-none absolute bottom-3 left-3 translate-y-1 text-[0.62rem] text-white opacity-0 transition-all duration-500 ease-expo group-hover/tile:translate-y-0 group-hover/tile:opacity-100 md:bottom-4 md:left-4"
      >
        {photo.label}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-noir opacity-0 transition-all duration-500 ease-expo group-hover/tile:opacity-100 md:right-4 md:top-4"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
});

/**
 * Filterable portfolio for /work: category tabs (sticky under the nav),
 * a masonry grid of thumbnails at their true proportions, batched
 * loading as the visitor scrolls, and the shared Lightbox for the
 * full-resolution photograph. The filter is mirrored in ?filter= so a
 * view can be shared.
 */
export default function Portfolio({ photos, filters, collections, films }: Props) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const columns = useSyncExternalStore(subscribeColumns, getColumns, () => 3);

  const [active, setActive] = useState(ALL);
  const [visible, setVisible] = useState(BATCH);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [stickyTop, setStickyTop] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filter = filters.find((f) => f.id === active) ?? null;
  const isFilms = !!films && !!filter?.categories.includes(films.slug);

  const shown = useMemo(
    () =>
      interleave(
        filter ? photos.filter((p) => filter.categories.includes(p.category)) : photos,
      ),
    [filter, photos],
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = { [ALL]: photos.length };
    for (const f of filters) {
      out[f.id] =
        films && f.categories.includes(films.slug)
          ? films.videoIds.length
          : photos.filter((p) => f.categories.includes(p.category)).length;
    }
    return out;
  }, [filters, films, photos]);

  // Restore a shared ?filter= on load.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("filter");
    if (id && filters.some((f) => f.id === id)) setActive(id);
  }, [filters]);

  // Keep the filter bar tucked under the fixed nav, whatever its height.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("body > header");
    if (!header) return;
    const update = () => setStickyTop(Math.round(header.getBoundingClientRect().height));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Add the next batch as the end of the grid comes within reach.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= shown.length) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible((v) => Math.min(v + BATCH, shown.length));
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, shown.length]);

  const select = (id: string) => {
    if (id === active) return;
    setActive(id);
    setVisible(BATCH);
    setOpenIndex(null);

    const url = new URL(window.location.href);
    if (id === ALL) url.searchParams.delete("filter");
    else url.searchParams.set("filter", id);
    window.history.replaceState(window.history.state, "", url);

    // If the visitor has scrolled into the grid, bring its top back
    // into view under the sticky bar.
    const top = gridTopRef.current?.getBoundingClientRect().top ?? 0;
    const offset = stickyTop + (barRef.current?.offsetHeight ?? 0) + 12;
    if (top < offset) {
      const y = window.scrollY + top - offset;
      if (lenis) lenis.scrollTo(y, { immediate: Boolean(reduceMotion) });
      else window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const open = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);

  const lightboxItems = useMemo<MediaItem[]>(
    () =>
      shown.map((p) => ({
        src: p.src,
        file: p.file,
        kind: "image",
        name: p.file.replace(/\.[^.]+$/, ""),
      })),
    [shown],
  );

  const slice = shown.slice(0, visible);
  const grid = toColumns(slice, columns);
  const single =
    filter && filter.categories.length === 1 ? filter.categories[0] : null;
  const tabs = [{ id: ALL, label: "All" }, ...filters];

  return (
    <>
      <style>{`
        @keyframes portfolio-in {
          from { opacity: 0; transform: translateY(16px) scale(0.985); }
          to   { opacity: 1; transform: none; }
        }
        .portfolio-tile {
          animation: portfolio-in 800ms var(--ease-expo) both;
          transition: opacity 500ms var(--ease-expo), filter 500ms var(--ease-expo);
        }
        @media (hover: hover) {
          .portfolio-grid:has(.portfolio-tile:hover) .portfolio-tile:not(:hover) {
            opacity: 0.72;
            filter: saturate(0.8);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .portfolio-tile { animation: none; }
          .portfolio-tile img { transition: none !important; transform: none !important; }
        }
      `}</style>

      {/* Filters — sticky under the nav */}
      <div
        ref={barRef}
        className="sticky z-30 -mx-6 border-b border-line/[0.06] bg-surface/90 px-6 backdrop-blur-md md:-mx-10 md:px-10"
        style={{ top: stickyTop }}
      >
        <nav aria-label="Filter the portfolio" className="mx-auto max-w-[1440px]">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto py-3 [mask-image:linear-gradient(to_right,transparent,black_14px,black_calc(100%-14px),transparent)] md:flex-wrap md:justify-center md:overflow-visible md:[mask-image:none]">
            {tabs.map((t) => {
              const selected = t.id === active;
              const count = counts[t.id] ?? 0;
              return (
                <li key={t.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => select(t.id)}
                    aria-pressed={selected}
                    className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-[0.02em] transition-colors duration-500 md:text-[13.5px] ${
                      selected ? "text-white" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="portfolio-pill"
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-noir"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 36 }
                        }
                      />
                    )}
                    <span className="relative">
                      {t.label}
                      <sup
                        className={`ml-1 text-[10px] font-semibold ${
                          selected ? "text-gold-light" : "text-ink/35"
                        }`}
                      >
                        {count > 0 ? count : "soon"}
                      </sup>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div ref={gridTopRef} className="mx-auto max-w-[1440px] pt-8 md:pt-10">
        {isFilms && films ? (
          <CandidVideosGrid videoIds={films.videoIds} categoryLabel={films.label} />
        ) : shown.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center md:py-28">
            <span aria-hidden className="gold-rule" />
            <p className="mt-6 font-serif text-4xl font-medium tracking-serif text-ink">
              {filter?.label}
            </p>
            {single && collections[single] && (
              <p className="mt-3 text-ink/60 first-letter:uppercase">
                {collections[single].tagline}
              </p>
            )}
            <p className="ui-label mt-6 text-accent">Coming soon</p>
            <Link href="/contact#enquiry" data-cursor-label="write" className="btn btn-outline btn-sm mt-8">
              Enquire
            </Link>
          </div>
        ) : (
          <>
            <div
              key={active}
              className="portfolio-grid flex items-start gap-2.5 sm:gap-4 lg:gap-5"
            >
              {grid.map((col, c) => (
                <div key={c} className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-4 lg:gap-5">
                  {col.map(({ photo, index }) => (
                    <Tile
                      key={photo.src}
                      photo={photo}
                      index={index}
                      total={shown.length}
                      load={
                        index < columns
                          ? "priority"
                          : index < columns * 3
                            ? "eager"
                            : "lazy"
                      }
                      delay={Math.min((index % BATCH) * 35, 500)}
                      onOpen={open}
                    />
                  ))}
                </div>
              ))}
            </div>

            {visible < shown.length && (
              <div ref={sentinelRef} className="flex justify-center pt-12">
                <button
                  type="button"
                  onClick={() => setVisible((v) => Math.min(v + BATCH, shown.length))}
                  className="btn btn-outline btn-sm"
                >
                  Show more
                </button>
              </div>
            )}
          </>
        )}

        {/* Link through to the full collection page */}
        {single && collections[single] && shown.length > 0 && (
          <p className="stack text-center">
            <Link
              href={`/work/${single}`}
              data-cursor-label="open"
              className="ui-label inline-flex items-center gap-3 text-ink/60 transition-colors duration-500 hover:text-accent"
            >
              <span aria-hidden className="gold-rule w-8" />
              Open the {collections[single].label} collection
              <span aria-hidden className="gold-rule w-8" />
            </Link>
          </p>
        )}
      </div>

      <Lightbox
        items={lightboxItems}
        index={openIndex}
        onClose={close}
        onChange={setOpenIndex}
      />
    </>
  );
}
