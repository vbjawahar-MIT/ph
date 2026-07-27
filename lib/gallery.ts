/**
 * Filesystem-backed gallery loader.
 *
 * Runs entirely at build time inside Server Components and
 * `generateStaticParams`, so pages are pre-rendered as static HTML —
 * zero runtime filesystem cost, zero API layer.
 *
 * Design goals
 * ────────────
 *  • Drop-in scalability. New files in `public/assets/{folder}/` appear
 *    on the site on the next build with no code change.
 *  • Cover-first ordering. `cover.jpg` (or cover.jpeg/.png/.webp)
 *    always renders first. Otherwise a natural sort of filenames.
 *  • Format-agnostic. Any common image extension is treated as a
 *    photograph; any common video extension goes through the video
 *    lightbox instead. Uppercase extensions (Canon-style .JPG) work.
 *  • CMS-swappable. Components consume `getGalleryFor(slug)` — swap
 *    the body for a Sanity / Contentful / Supabase call later without
 *    changing any UI.
 */

import fs from "node:fs";
import path from "node:path";
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

// Natural sort: "10_x.jpg" comes after "2_x.jpg", not before.
const NATURAL = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function assetsRoot(): string {
  return path.join(process.cwd(), "public", "assets");
}

function fileToMedia(folder: string, file: string): MediaItem | null {
  const isImage = IMAGE_EXT.test(file);
  const isVideo = VIDEO_EXT.test(file);
  if (!isImage && !isVideo) return null;
  return {
    src: `/assets/${folder}/${file}`,
    file,
    kind: isVideo ? "video" : "image",
    name: file.replace(/\.[^.]+$/, ""),
  };
}

/**
 * Read every media file from a category folder. Missing folders return
 * an empty array so a new category listing can render immediately even
 * before any files are dropped in (e.g. "Traditional").
 */
export function readFolder(folder: string, kind: CategoryKind): MediaItem[] {
  const dir = path.join(assetsRoot(), folder);
  if (!fs.existsSync(dir)) return [];

  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  const media: MediaItem[] = [];
  let cover: MediaItem | null = null;

  for (const f of files.sort(NATURAL.compare)) {
    if (f.startsWith(".")) continue;
    const item = fileToMedia(folder, f);
    if (!item) continue;

    // A video-kind category exposes only videos; an image-kind category
    // exposes only photos. This keeps cross-contamination impossible
    // even if a folder ends up mixed.
    if (kind === "videos" && item.kind !== "video") continue;
    if (kind === "images" && item.kind !== "image") continue;

    if (COVER_RE.test(f)) {
      cover = item;
      continue;
    }
    media.push(item);
  }

  // Cover-first ordering — either the explicit cover.jpg or the first
  // natural-sorted item.
  if (cover) return [cover, ...media];
  return media;
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
