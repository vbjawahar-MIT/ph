/**
 * Photography packages shown on /packages.
 *
 * Edit prices and inclusions here — the page and its cards read only
 * from this file. Prices are whole rupees; the page formats them with
 * Indian digit grouping (1,25,000). Photos point at existing gallery
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
  price: number;
  photo: PackagePhoto;
  inclusions: Inclusion[];
};

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

const CORE = (n: { video: number; photo: number }): Inclusion[] => [
  { label: "Traditional Video", qty: n.video },
  { label: "Traditional Photo", qty: n.photo },
  { label: "Candid Photo", qty: 1 },
  { label: "Candid Video", qty: 1 },
];

const DRONE: Inclusion = { label: "Drone (Reception + Wedding)" };

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
        price: 45000,
        photo: { folder: "couple-portrait", file: "138.jpg", position: "50% 30%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "wedding-standard",
        name: "Standard",
        price: 65000,
        photo: { folder: "couple-portrait", file: "184.jpg", position: "50% 45%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          // Quantity left blank in the source price list — confirm.
          { label: "Photo Calendar" },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "wedding-premium",
        name: "Premium",
        price: 125000,
        photo: { folder: "bridal", file: "9.jpg", position: "50% 35%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "wedding-premium-plus",
        name: "Premium Plus",
        price: 165000,
        photo: { folder: "couple-portrait", file: "185.jpg", position: "50% 30%" },
        inclusions: [
          ...CORE({ video: 2, photo: 2 }),
          DRONE,
          { label: "Premium Album", qty: 2 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 2 },
        ],
      },
    ],
  },
  {
    id: "celebration-packages",
    title: "Engagement, Baby Shower & Puberty Packages",
    accent: "Packages",
    tagline: "Celebrating every special chapter",
    badge: { icon: "family", title: "Every Celebration", text: "Deserves Beautiful Memories" },
    packages: [
      {
        id: "engagement",
        name: "Engagement Package",
        price: 245000,
        photo: { folder: "couple-portrait", file: "144.jpg", position: "55% 35%" },
        inclusions: [
          ...CORE({ video: 2, photo: 2 }),
          DRONE,
          { label: "Premium Album", qty: 2 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 2 },
        ],
      },
      {
        id: "baby-shower-basic",
        name: "Baby Shower Package",
        tier: "Basic",
        price: 30000,
        photo: { folder: "baby-shower", file: "195.JPG", position: "40% 30%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (50 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 1 },
          { label: "Photo Calendar", qty: 1 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "baby-shower-standard",
        name: "Baby Shower Package",
        tier: "Standard",
        price: 40000,
        photo: { folder: "baby-shower", file: "193.JPG", position: "50% 30%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 1 },
        ],
      },
      {
        id: "puberty-premium",
        name: "Puberty Package",
        tier: "Premium",
        price: 65000,
        photo: { folder: "puberty", file: "200.jpg", position: "50% 30%" },
        inclusions: [
          ...CORE({ video: 1, photo: 1 }),
          { label: "Premium Album", qty: 1 },
          { label: "Album (80 Sheets)", qty: 1 },
          { label: "Photo Frame", qty: 2 },
          { label: "Photo Calendar", qty: 2 },
          { label: "Pendrive Box", qty: 1 },
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

/** 1,25,000 — Indian digit grouping. */
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN").format(amount);
}

/** ₹1,25,000/- style, matching the studio's price list. */
export function formatRupees(amount: number) {
  return `₹${formatAmount(amount)}/-`;
}

/** Top-tier cards (those with drone coverage) get the dark treatment. */
export function isFeatured(pkg: PhotoPackage) {
  return pkg.inclusions.some((i) => i.label.startsWith("Drone"));
}

/** Subject line the contact form is pre-filled with for a package. */
export function enquirySubject(group: PackageGroup, pkg: PhotoPackage) {
  const name = group.subjectPrefix
    ? `${group.subjectPrefix} — ${pkg.name}`
    : pkg.tier
      ? `${pkg.name} — ${pkg.tier}`
      : pkg.name;
  return `${name} (${formatRupees(pkg.price)})`;
}
