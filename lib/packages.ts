/**
 * Photography packages shown on /packages.
 *
 * Edit packages and inclusions here — the page and its cards read only
 * from this file. Prices are deliberately not shown on the site; visitors
 * enquire through "Book Your Slot". Photos point at existing gallery
 * files and are resolved to their hosted URLs at build time.
 */

export type Inclusion = {
  label: string;
  /** Quantity shown on the right; omitted when the item has none. */
  qty?: number;
};

export type PackagePhoto = {
  folder: string;
  file: string;
  /** object-position focal point for the card crop. */
  position?: string;
};

export type PhotoPackage = {
  id: string;
  name: string;
  /** Second line under the name, e.g. "Basic" / "Standard". */
  tier?: string;
  photo: PackagePhoto;
  /** Jewel-tone card colour for the top tiers (see .theme-* in globals.css). */
  highlight?: "emerald" | "ruby";
  inclusions: Inclusion[];
  /**
   * Free extras, shown in a highlighted gold voucher under the list —
   * one or more groups of tags, each with an optional heading.
   */
  complimentary?: ComplimentaryGroup[];
};

export type ComplimentaryGroup = { title?: string; items: Inclusion[] };

export type PackageGroup = {
  id: string;
  title: string;
  /** Word of the title set in gold italic. */
  accent: string;
  tagline: string;
  badge: { icon: "rings" | "family"; title: string; text: string };
  /** Prefixed to the card name in the enquiry subject. */
  subjectPrefix?: string;
  packages: PhotoPackage[];
};

const TRADITIONAL = (n: { video: number; photo: number }): Inclusion[] => [
  { label: "Traditional Video", qty: n.video },
  { label: "Traditional Photo", qty: n.photo },
];
const CANDID_PHOTO: Inclusion = { label: "Candid Photo", qty: 1 };
const CANDID_VIDEO: Inclusion = { label: "Candid Video", qty: 1 };

const CORE = (n: { video: number; photo: number }): Inclusion[] => [
  ...TRADITIONAL(n),
  CANDID_PHOTO,
  CANDID_VIDEO,
];

const DRONE: Inclusion = { label: "Drone (Reception + Wedding)", qty: 1 };

/** Complimentary pre- or post-wedding shoot offered with wedding packages. */
const PRE_POST_WEDDING = "Pre-Wedding or Post-Wedding";
const CEREMONIES: ComplimentaryGroup = {
  items: [{ label: "Haldi Ceremony" }, { label: "Mehendi Function" }],
};
const PRE_POST_PHOTO = { title: PRE_POST_WEDDING, items: [{ label: "Photo" }] };
const PRE_POST_FULL = (magazineBooks: number, extra: Inclusion[] = []) => ({
  title: PRE_POST_WEDDING,
  // Ordered so the tags pack into as few rows as possible on a card.
  items: [
    { label: "Photo" },
    { label: "Video" },
    { label: "E-Invitation" },
    { label: "Couple Magazine Book", qty: magazineBooks },
    { label: "Reels" },
    { label: "Save-the-Date Video" },
    ...extra,
  ],
});

export const PACKAGE_GROUPS: PackageGroup[] = [
  {
    id: "wedding-packages",
    title: "Wedding Packages",
    accent: "Packages",
    tagline: "Because every moment matters",
    badge: { icon: "rings", title: "Your Big Day", text: "Beautifully Documented" },
    subjectPrefix: "Wedding Package",
    packages: [
      {
        id: "wedding-basic",
        name: "Basic",
        photo: { folder: "couple-portrait", file: "138.jpg", position: "50% 30%" },
        inclusions: [
          ...TRADITIONAL({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
        complimentary: [PRE_POST_PHOTO],
      },
      {
        id: "wedding-standard",
        name: "Standard",
        photo: { folder: "couple-portrait", file: "184.jpg", position: "50% 45%" },
        inclusions: [
          ...TRADITIONAL({ video: 1, photo: 1 }),
          CANDID_PHOTO,
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
        complimentary: [PRE_POST_PHOTO, CEREMONIES],
      },
      {
        id: "wedding-premium",
        name: "Premium",
        photo: { folder: "bridal", file: "9.jpg", position: "50% 35%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 2 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 1 },
        ],
        complimentary: [PRE_POST_FULL(1), CEREMONIES],
      },
      {
        id: "wedding-premium-plus",
        name: "Premium Plus",
        highlight: "emerald",
        photo: { folder: "couple-portrait", file: "160.jpg", position: "40% 25%" },
        inclusions: [
          ...CORE({ video: 2, photo: 2 }),
          DRONE,
          { label: "Premium Album", qty: 2 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 2 },
        ],
        complimentary: [PRE_POST_FULL(1, [{ label: "Drone" }]), CEREMONIES],
      },
      {
        id: "wedding-elite",
        name: "Elite",
        highlight: "ruby",
        photo: { folder: "couple-portrait", file: "144.jpg", position: "55% 35%" },
        inclusions: [
          ...CORE({ video: 3, photo: 3 }),
          DRONE,
          { label: "Spinner 360", qty: 1 },
          { label: "LED Wall", qty: 1 },
          { label: "Live Streaming", qty: 1 },
          { label: "Premium Album", qty: 3 },
          { label: "Album (120 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 4 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 2 },
        ],
        complimentary: [PRE_POST_FULL(2, [{ label: "Drone" }]), CEREMONIES],
      },
    ],
  },
  {
    id: "celebration-packages",
    title: "Engagement, Baby Shower, Puberty, Birthday Shoot & Housewarming Packages",
    accent: "Packages",
    tagline: "Celebrating every special chapter",
    badge: { icon: "family", title: "Every Celebration", text: "Deserves Beautiful Memories" },
    subjectPrefix: "Celebration Package",
    packages: [
      {
        id: "celebration-basic",
        name: "Basic",
        photo: { folder: "puberty", file: "210.JPG", position: "50% 42%" },
        inclusions: [
          ...TRADITIONAL({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (30 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "celebration-standard",
        name: "Standard",
        photo: { folder: "baby-shower", file: "189.JPG", position: "50% 33%" },
        inclusions: [
          ...TRADITIONAL({ video: 1, photo: 1 }),
          CANDID_PHOTO,
          { label: "Premium Album", qty: 1 },
          { label: "Album (40 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "celebration-premium",
        name: "Premium",
        photo: { folder: "puberty", file: "200.jpg", position: "50% 30%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
        complimentary: [
          {
            items: [
              { label: "Magazine Book", qty: 1 },
              { label: "E-Invitation" },
              { label: "Reels" },
            ],
          },
        ],
      },
    ],
  },
];

/** Photographs in the packages hero carousel, in order. */
export const PACKAGES_CAROUSEL: (PackagePhoto & { label: string; title: string })[] = [
  { folder: "couple-portrait", file: "123.jpg", position: "62% 35%", label: "Wedding", title: "Two people, in the same light." },
  { folder: "couple-portrait", file: "185.jpg", position: "50% 35%", label: "Wedding", title: "Golden-hour vows." },
  { folder: "bridal", file: "9.jpg", position: "50% 40%", label: "Bridal", title: "The calm before every wedding." },
  { folder: "baby-shower", file: "195.JPG", position: "40% 35%", label: "Baby Shower", title: "The day before the day." },
  { folder: "puberty", file: "202.JPG", position: "45% 40%", label: "Puberty", title: "One afternoon, one small ceremony." },
];

/** Top-tier cards (those with drone coverage) get the featured treatment. */
export function isFeatured(pkg: PhotoPackage) {
  return pkg.inclusions.some((i) => i.label.startsWith("Drone"));
}

/** Subject line the contact form is pre-filled with for a package. */
export function enquirySubject(group: PackageGroup, pkg: PhotoPackage) {
  if (group.subjectPrefix) return `${group.subjectPrefix} — ${pkg.name}`;
  return pkg.tier ? `${pkg.name} — ${pkg.tier}` : pkg.name;
}
