"use client";

import { useState } from "react";
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
   * How many tiles at the top of the grid should preload eagerly.
   * These are the images most likely to be above the fold on any
   * viewport (1 mobile, 2 tablet, 3 desktop → 4 gives a safety margin).
   * Everything after this index gets native lazy loading + CSS
   * `content-visibility: auto` so the browser skips render + layout
   * work for offscreen tiles entirely.
   */
  priorityCount?: number;
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

/**
 * Responsive gallery grid with the "premium mutual hover" effect —
 * when the visitor hovers one tile, the others soften (blur + fade +
 * de-saturate), the focussed tile lifts, scales a touch, and brightens.
 *
 * Clicking a tile opens the Lightbox at that item's index. Cover-first
 * ordering is preserved because the parent passes `items[0]` first.
 *
 * Perf (Phase 13)
 *  - First `priorityCount` tiles preload eagerly (fetchpriority=high
 *    on the <img>) so the LCP element paints as fast as possible.
 *  - Everything after that gets native `loading="lazy"` (Next default)
 *    plus CSS `content-visibility: auto` so offscreen tiles cost
 *    almost nothing. `contain-intrinsic-size` reserves the slot so
 *    scrolling doesn't jump when tiles hydrate.
 */
export default function PhotoGrid({
  items,
  columns = 3,
  priorityCount = 4,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        onMouseLeave={() => setHovered(null)}
      >
        {items.map((item, i) => {
          const isDimmed = hovered !== null && hovered !== i;
          const isPriority = i < priorityCount;
          // aspect-[4/5] wants a 4×5 intrinsic size hint for the browser
          // to reserve space for offscreen tiles. 320×400 is a comfortable
          // seed — the actual rendered size still adapts to the column width.
          const containStyle: React.CSSProperties = isPriority
            ? {}
            : {
                contentVisibility: "auto",
                containIntrinsicSize: "400px 500px",
              };
          return (
            <button
              key={item.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              onMouseEnter={() => setHovered(i)}
              data-cursor-label={item.kind === "video" ? "watch" : "view"}
              aria-label={
                item.kind === "video" ? `Play video ${i + 1}` : `Open photo ${i + 1}`
              }
              className="group relative block w-full overflow-hidden rounded-sm shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)] transition-all duration-700 ease-expo"
              style={{
                filter: isDimmed
                  ? "brightness(0.72) saturate(0.75) blur(1px)"
                  : "brightness(1) saturate(1) blur(0)",
                transform:
                  hovered === i
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
                    priority={isPriority}
                    fetchPriority={isPriority ? "high" : "auto"}
                    className="h-full w-full"
                  />
                )}
                {/* Focussed brighten overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-expo"
                  style={{
                    opacity: hovered === i ? 1 : 0,
                    background:
                      "radial-gradient(120% 80% at 50% 100%, rgba(255,255,255,0.16) 0%, transparent 60%)",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <Lightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </>
  );
}
