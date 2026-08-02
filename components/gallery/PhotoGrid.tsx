"use client";

import { memo, useCallback, useState } from "react";
import ProtectedImage from "./ProtectedImage";
import VideoThumbnail from "./VideoThumbnail";
import Lightbox from "./Lightbox";
import type { MediaItem } from "@/lib/gallery";

type Props = {
  items: MediaItem[];
  /**
   * Column count on the desktop (>=1024px) breakpoint. Tablet always 2,
   * mobile always 1. Video-only galleries default to 2 columns because
   * the tiles are larger.
   */
  columns?: 2 | 3;
  /**
   * Tiles at the top of the grid that use next/image `priority` — this
   * emits a `<link rel=preload as=image fetchpriority=high>` in the
   * document head so the LCP paints as fast as possible. Keep this
   * small (~4): each extra preload competes with the true LCP image
   * for the first bytes on the wire.
   */
  priorityCount?: number;
  /**
   * Tiles up to this index (exclusive) skip lazy loading — the browser
   * begins fetching them during initial HTML parse instead of waiting
   * for scroll. Use this for the first screen or two of tiles that
   * aren't LCP but should still feel instant on scroll.
   */
  eagerCount?: number;
};

const COLUMN_CLASSES = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

const SIZES = {
  2: "(min-width: 768px) 45vw, 100vw",
  3: "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw",
} as const;

/**
 * Brand-tone placeholder. Zero-byte "blur" — a CSS gradient sits
 * behind each tile so visitors see something brand-consistent
 * immediately, and the photograph covers it on decode. No extra
 * HTTP request, no base64 payload.
 */
const PLACEHOLDER_BG =
  "linear-gradient(135deg, #3554ff 0%, #6b4eff 50%, #a14dff 100%)";

type TileProps = {
  item: MediaItem;
  index: number;
  columns: 2 | 3;
  loadStrategy: "priority" | "eager" | "lazy";
  isDimmed: boolean;
  isHovered: boolean;
  onEnter: (i: number) => void;
  onOpen: (i: number) => void;
};

/**
 * Single tile — memoized on its props so a hover change on one tile
 * doesn't re-render every other tile in the grid (previously the
 * whole grid re-rendered on every mouse move over a tile).
 */
const Tile = memo(function Tile({
  item,
  index,
  columns,
  loadStrategy,
  isDimmed,
  isHovered,
  onEnter,
  onOpen,
}: TileProps) {
  // aspect-[4/5] wants a 4×5 intrinsic size hint for the browser
  // to reserve space for offscreen tiles. 320×400 is a comfortable
  // seed — the actual rendered size still adapts to the column width.
  const containStyle: React.CSSProperties =
    loadStrategy === "lazy"
      ? {
          contentVisibility: "auto",
          containIntrinsicSize: "400px 500px",
        }
      : {};

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      onMouseEnter={() => onEnter(index)}
      data-cursor-label={item.kind === "video" ? "watch" : "view"}
      aria-label={
        item.kind === "video"
          ? `Play video ${index + 1}`
          : `Open photo ${index + 1}`
      }
      className="group relative block w-full overflow-hidden rounded-sm shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)] transition-all duration-700 ease-expo"
      style={{
        filter: isDimmed
          ? "brightness(0.72) saturate(0.75) blur(1px)"
          : "brightness(1) saturate(1) blur(0)",
        transform: isHovered
          ? "translateY(-4px) scale(1.015)"
          : "translateY(0) scale(1)",
        ...containStyle,
      }}
    >
      <div
        className="aspect-[4/5] w-full overflow-hidden"
        style={{ background: PLACEHOLDER_BG }}
      >
        {item.kind === "video" ? (
          <VideoThumbnail src={item.src} />
        ) : (
          <ProtectedImage
            src={item.src}
            alt=""
            fill
            sizes={SIZES[columns]}
            quality={85}
            priority={loadStrategy === "priority"}
            loading={loadStrategy === "lazy" ? "lazy" : "eager"}
            fetchPriority={loadStrategy === "priority" ? "high" : "auto"}
            className="h-full w-full"
          />
        )}
        {/* Focussed brighten overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-expo"
          style={{
            opacity: isHovered ? 1 : 0,
            background:
              "radial-gradient(120% 80% at 50% 100%, rgba(255,255,255,0.16) 0%, transparent 60%)",
          }}
        />
      </div>
    </button>
  );
});

/**
 * Responsive gallery grid with the "premium mutual hover" effect —
 * when the visitor hovers one tile, the others soften (blur + fade +
 * de-saturate), the focussed tile lifts, scales a touch, and brightens.
 *
 * Clicking a tile opens the Lightbox at that item's index. Cover-first
 * ordering is preserved because the parent passes `items[0]` first.
 *
 * Loading strategy (Phase 14)
 *  - First `priorityCount` tiles (default 4) get next/image `priority`:
 *    Next injects `<link rel=preload as=image fetchpriority=high>` in
 *    the document head so the LCP paints in the first RTT.
 *  - Tiles up to `eagerCount` (default 12) skip lazy loading — the
 *    browser starts fetching them during HTML parse rather than waiting
 *    for scroll. Uses `fetchpriority=auto` so they don't compete with
 *    the LCP preloads for bandwidth.
 *  - Everything past `eagerCount` gets native `loading="lazy"` plus
 *    CSS `content-visibility: auto` so offscreen tiles cost almost
 *    nothing until scroll approaches them.
 */
export default function PhotoGrid({
  items,
  columns = 3,
  priorityCount = 4,
  eagerCount = 12,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleEnter = useCallback((i: number) => setHovered(i), []);
  const handleOpen = useCallback((i: number) => setOpenIndex(i), []);
  const clearHover = useCallback(() => setHovered(null), []);
  const closeLightbox = useCallback(() => setOpenIndex(null), []);

  if (items.length === 0) {
    return (
      <p className="ui-label text-white/60">
        No files yet — drop images into the folder and they will appear here.
      </p>
    );
  }

  return (
    <>
      <div
        className={`grid gap-6 md:gap-8 lg:gap-10 ${COLUMN_CLASSES[columns]}`}
        onMouseLeave={clearHover}
      >
        {items.map((item, i) => {
          const loadStrategy: "priority" | "eager" | "lazy" =
            i < priorityCount
              ? "priority"
              : i < eagerCount
                ? "eager"
                : "lazy";
          return (
            <Tile
              key={item.src}
              item={item}
              index={i}
              columns={columns}
              loadStrategy={loadStrategy}
              isDimmed={hovered !== null && hovered !== i}
              isHovered={hovered === i}
              onEnter={handleEnter}
              onOpen={handleOpen}
            />
          );
        })}
      </div>

      <Lightbox
        items={items}
        index={openIndex}
        onClose={closeLightbox}
        onChange={setOpenIndex}
      />
    </>
  );
}
