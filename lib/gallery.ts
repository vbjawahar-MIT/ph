/**
 * Manifest-backed gallery loader.
 *
 * Runs at build time inside Server Components and `generateStaticParams`,
 * so pages ship as static HTML with zero runtime filesystem cost.
 *
 * Design
 * ──────
 *   • Source of truth: `lib/asset-manifest.json` — a JSON catalog of
 *     `{ folder: [file, file, …] }` generated from public/assets/ by
 *     `scripts/build-manifest.mjs` and committed to git. The raw JPGs
 *     stay outside git (2.85 GB — ignored) and are served from
 *     Cloudflare R2 in production.
 *
 *   • URL strategy: each `MediaItem.src` is prefixed by
 *     `NEXT_PUBLIC_CDN_BASE_URL` when it's set. When unset (local
 *     dev), URLs stay as `/assets/…` and Next serves them straight
 *     from public/. When set to `https://<bucket>.r2.dev` (or a
 *     Cloudflare custom domain), URLs become `<base>/assets/…` and
 *     every photograph loads from Cloudflare.
 *
 *   • Cover-first: `cover.jpg`/.png/.webp/.avif (in the folder) is
 *     pushed to index 0 of the returned items. Otherwise the first
 *     natural-sorted file is the cover.
 *
 *   • Format-agnostic: image and video extensions are both tracked.
 *     The Category's `kind` field decides which type is exposed for
 *     each category — no cross-contamination.
 *
 *   • CMS-swappable: components consume `getGalleryFor(slug)` and
 *     `getAllCategorySummaries()` — swap those two calls to hit
 *     Sanity/Contentful/etc. later without touching the UI.
 */

import manifest from "./asset-manifest.json";
import {
  CATEGORIES,
  getCategoryBySlug,
  type Category,
  type CategoryKind,
} from "./categories";

export type MediaKind = "image" | "video";

export type MediaItem = {
  /** Public URL, ready for <img src> or <video src>. */
  src: string;
  /** Original filename (stripped of the assets prefix). */
  file: string;
  kind: MediaKind;
  /** Filename without extension — used as an alt-text fallback. */
  name: string;
};

export type CategorySummary = {
  category: Category;
  cover: MediaItem | null;
  /** Cover + gallery (cover is duplicated to `items[0]`). */
  items: MediaItem[];
  count: number;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const COVER_RE = /^cover\.(jpe?g|png|webp|avif)$/i;

/**
 * CDN prefix. Empty string in dev → URLs stay local. Set to
 * `https://<bucket>.r2.dev` or `https://img.vbphotographe.com` in
 * production → URLs point to Cloudflare.
 *
 * NEXT_PUBLIC_ prefix required because the value ends up in HTML
 * rendered by Server Components AND may be referenced by client
 * components (next/image constructs URLs at render time).
 */
const CDN_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CDN_BASE_URL) ||
  "";

function buildSrc(folder: string, file: string): string {
  const path = `/assets/${folder}/${file}`;
  if (!CDN_BASE) return path;
  const base = CDN_BASE.replace(/\/+$/, "");
  return `${base}${path}`;
}

function fileToMedia(folder: string, file: string): MediaItem | null {
  const isImage = IMAGE_EXT.test(file);
  const isVideo = VIDEO_EXT.test(file);
  if (!isImage && !isVideo) return null;
  return {
    src: buildSrc(folder, file),
    file,
    kind: isVideo ? "video" : "image",
    name: file.replace(/\.[^.]+$/, ""),
  };
}

/**
 * Read every media file recorded for `folder` in the manifest.
 * Missing folders return an empty array so a new category renders
 * a "Coming soon" state until it's populated.
 */
export function readFolder(folder: string, kind: CategoryKind): MediaItem[] {
  const files: string[] =
    (manifest as Record<string, string[]>)[folder] ?? [];

  const media: MediaItem[] = [];
  let cover: MediaItem | null = null;

  for (const f of files) {
    const item = fileToMedia(folder, f);
    if (!item) continue;
    if (kind === "videos" && item.kind !== "video") continue;
    if (kind === "images" && item.kind !== "image") continue;
    if (COVER_RE.test(f)) {
      cover = item;
      continue;
    }
    media.push(item);
  }

  return cover ? [cover, ...media] : media;
}

/** Full gallery for a single slug, cover-first. */
export function getGalleryFor(slug: string): CategorySummary | null {
  const category = getCategoryBySlug(slug);
  if (!category) return null;
  const items = readFolder(category.folder, category.kind);
  return {
    category,
    cover: items[0] ?? null,
    items,
    count: items.length,
  };
}

/** Every category with its cover + count — for /work index + home grid. */
export function getAllCategorySummaries(): CategorySummary[] {
  return CATEGORIES.map((c) => {
    const items = readFolder(c.folder, c.kind);
    return {
      category: c,
      cover: items[0] ?? null,
      items,
      count: items.length,
    };
  });
}

/** Categories that already have at least one file, for the home grid. */
export function getFeaturedCategorySummaries(): CategorySummary[] {
  return getAllCategorySummaries().filter((s) => s.count > 0);
}
