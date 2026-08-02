"use client";

import { useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";
import { getGalleryFor } from "@/lib/gallery";

type Props = {
  /** Slug of the gallery currently being viewed. */
  currentSlug: string;
  /** How many images from each adjacent gallery to warm. Default 12. */
  count?: number;
};

/**
 * Warm the image cache for adjacent galleries during browser idle time.
 *
 * When a visitor is looking at (say) /work/bridal-portraits, they are
 * disproportionately likely to visit the next photograph category next.
 * This component queues an `<img>` fetch for the first `count` images
 * of the two neighbouring galleries once the browser reports it's idle,
 * so those tiles paint from disk cache on click instead of hitting the
 * network cold.
 *
 * Cheap on purpose:
 *   • Runs inside `requestIdleCallback` — never competes with the
 *     current page's LCP or user interaction work.
 *   • Skips entirely on the first render of Save-Data / 2G / 3G
 *     connections so we don't burn a metered visitor's data plan
 *     on speculative fetches.
 *   • Fires plain `new Image()` requests — the browser dedupes by URL,
 *     so when the visitor navigates the resulting <img> lookups hit
 *     the memory/disk cache immediately.
 *   • Renders nothing.
 */

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

function shouldPrefetch(): boolean {
  if (typeof navigator === "undefined") return false;
  // Chromium exposes navigator.connection; other browsers do not — if
  // absent, assume a reasonable connection and continue.
  const conn = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
    return false;
  }
  return true;
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
};

function whenIdle(cb: () => void): void {
  if (typeof window === "undefined") return;
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(cb, { timeout: 2000 });
  } else {
    // Safari fallback — 500ms after paint is close enough.
    setTimeout(cb, 500);
  }
}

function pickNeighbours(currentSlug: string): string[] {
  // Only walk image categories with actual files. Videos live on YouTube
  // and don't share the /_next/image cache, so warming them here is
  // useless.
  const imageSlugs = CATEGORIES.filter((c) => c.kind === "images").map(
    (c) => c.slug
  );
  const idx = imageSlugs.indexOf(currentSlug);
  if (idx === -1) return [];
  const nexts: string[] = [];
  if (imageSlugs[idx + 1]) nexts.push(imageSlugs[idx + 1]);
  if (imageSlugs[idx - 1]) nexts.push(imageSlugs[idx - 1]);
  // Wrap around so the last category still warms one neighbour.
  if (nexts.length === 0 && imageSlugs.length > 1) {
    nexts.push(imageSlugs[0]);
  }
  return nexts;
}

// Resolve each slug's first N image URLs at build time on the client —
// getGalleryFor reads only the static manifest + hosted URL map, so this
// is a pure function safe to call during idle time in the browser.
function collectUrls(slugs: string[], count: number): string[] {
  const urls: string[] = [];
  for (const slug of slugs) {
    const g = getGalleryFor(slug);
    if (!g) continue;
    for (const item of g.items.slice(0, count)) {
      if (item.kind === "image") urls.push(item.src);
    }
  }
  return urls;
}

export default function GalleryIdlePrefetch({
  currentSlug,
  count = 12,
}: Props) {
  useEffect(() => {
    if (!shouldPrefetch()) return;

    whenIdle(() => {
      const neighbours = pickNeighbours(currentSlug);
      if (neighbours.length === 0) return;
      const urls = collectUrls(neighbours, count);
      // Stagger loads so a batch of 24 doesn't saturate the connection
      // and slow down user-visible fetches (e.g. lightbox open).
      let i = 0;
      const kick = () => {
        if (i >= urls.length) return;
        const img = new Image();
        img.decoding = "async";
        img.src = urls[i];
        i += 1;
        // Space out ~50ms apart — mostly free on fast connections,
        // gentle on slower ones.
        setTimeout(kick, 50);
      };
      kick();
    });
  }, [currentSlug, count]);

  return null;
}
