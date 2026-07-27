/**
 * The gallery categories exposed on the site. Each entry maps a URL
 * slug to a folder under `public/assets/{folder}`.
 *
 * Adding a new category
 * ─────────────────────
 *   1. Create `public/assets/<folder>/` and drop files in.
 *   2. Append one entry to `CATEGORIES` below.
 *
 * That's it. The filesystem loader picks up every file, the /work
 * archive renders a card, the /work/<slug> route serves the gallery,
 * and the home Featured Stories row picks it up automatically.
 *
 * Empty categories still render (with a "Coming soon" state on the
 * card + gallery page) so a category can be pre-announced before any
 * files land.
 */

export type CategoryKind = "images" | "videos";

export type Category = {
  /** URL slug — used in /work/{slug}. */
  slug: string;
  /** Display label — shown on cards and page headings. */
  label: string;
  /** Short editorial description shown on cards. */
  tagline: string;
  /** Folder name under `public/assets/`. */
  folder: string;
  /** What the folder holds (photos vs videos changes the tile UI). */
  kind: CategoryKind;
  /**
   * Optional external cover thumbnail. Overrides the filesystem-derived
   * cover on the /work + Home cards. Used by categories whose media
   * lives off-server (e.g. YouTube-embedded Candid Videos).
   */
  coverThumb?: string;
  /**
   * Optional list of YouTube video IDs. When present the category
   * skips the filesystem gallery and its dedicated page renders these
   * as click-to-load YouTube embeds.
   */
  youtubeVideoIds?: readonly string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "bridal-portraits",
    label: "Bridal Portraits",
    tagline: "the calm before every wedding.",
    folder: "bridal",
    kind: "images",
  },
  {
    slug: "groom-portraits",
    label: "Groom Portraits",
    tagline: "quiet moments. tailored confidence.",
    folder: "groom",
    kind: "images",
  },
  {
    slug: "baby-shoot",
    label: "Baby Shoot",
    tagline: "the smallest moments deserve the biggest memories.",
    folder: "baby-shoot",
    kind: "images",
  },
  {
    slug: "pre-wedding",
    label: "Pre-Wedding",
    tagline: "stories before the wedding begins.",
    folder: "pre-wedding",
    kind: "images",
  },
  {
    slug: "couple-portrait",
    label: "Couple Portrait",
    tagline: "two people, in the same light.",
    folder: "couple-portrait",
    kind: "images",
  },
  {
    slug: "baby-shower",
    label: "Baby Shower",
    tagline: "the day before the day.",
    folder: "baby-shower",
    kind: "images",
  },
  {
    slug: "puberty",
    label: "Puberty",
    tagline: "one afternoon, one small ceremony.",
    folder: "puberty",
    kind: "images",
  },
  {
    slug: "traditional",
    label: "Traditional",
    tagline: "ritual, held close.",
    folder: "traditional",
    kind: "images",
  },
  {
    slug: "candid-videos",
    label: "Candid Videos",
    tagline: "the day, in motion.",
    folder: "candid-videos",
    kind: "videos",
    // First YouTube video's thumbnail — real content, not a placeholder.
    coverThumb: "https://i.ytimg.com/vi/FqgyJ1x1Jzg/maxresdefault.jpg",
    youtubeVideoIds: [
      "FqgyJ1x1Jzg",
      "CXoybPeLk1Y",
      "6vIY3JKRVdc",
      "aSAeTKVtUQM",
      "bBkFn5TO7QY",
    ] as const,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByFolder(folder: string): Category | undefined {
  return CATEGORIES.find((c) => c.folder === folder);
}

export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map((c) => c.slug);
}
