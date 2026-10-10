/**
 * Services shown as photo cards in the "What we do" section of /about
 * (the nav's "Services" link scrolls there).
 *
 * Covers every specialty the studio lists plus the gallery categories.
 * Photos point at existing gallery files (resolved to hosted URLs at
 * build time).
 */

import { getCategoryBySlug } from "./categories";
import type { PackagePhoto } from "./packages";

const FILMS_THUMB = getCategoryBySlug("candid-videos")?.coverThumb ?? "";

export type Service = {
  id: string;
  title: string;
  description: string;
  /** Gallery (or page) the card opens. */
  href: string;
  /** Gallery photograph, or an external thumbnail (candid films). */
  photo: PackagePhoto | { src: string; position?: string };
  /** Shows a play badge over the photo. */
  video?: boolean;
};

export const SERVICES: Service[] = [
  {
    id: "wedding",
    title: "Wedding Photography",
    description:
      "Traditional and candid coverage of your rituals, ceremony and reception.",
    href: "/work/couple-portrait",
    photo: { folder: "couple-portrait", file: "135.jpg", position: "50% 30%" },
  },
  {
    id: "engagement",
    title: "Engagement",
    description: "The rings, the families and your first portraits together.",
    href: "/work/couple-portrait",
    photo: { folder: "couple-portrait", file: "153.jpg", position: "50% 35%" },
  },
  {
    id: "pre-wedding",
    title: "Pre-Wedding Shoots",
    description: "Stories before the wedding begins — on location, at your pace.",
    href: "/work/pre-wedding",
    photo: { folder: "pre-wedding", file: "96.jpg", position: "50% 30%" },
  },
  {
    id: "couple-portraits",
    title: "Couple Portraits",
    description: "Two people, in the same light.",
    href: "/work/couple-portrait",
    photo: { folder: "couple-portrait", file: "155.jpg", position: "50% 30%" },
  },
  {
    id: "bridal",
    title: "Bridal Portraits",
    description: "The calm before every wedding.",
    href: "/work/bridal-portraits",
    photo: { folder: "bridal", file: "18.jpg", position: "50% 25%" },
  },
  {
    id: "groom",
    title: "Groom Portraits",
    description: "Quiet moments. Tailored confidence.",
    href: "/work/groom-portraits",
    photo: { folder: "groom", file: "52.jpg", position: "50% 30%" },
  },
  {
    id: "baby-shower",
    title: "Baby Shower",
    description: "Blessings, rituals and family — the day before the day.",
    href: "/work/baby-shower",
    photo: { folder: "baby-shower", file: "192.JPG", position: "50% 30%" },
  },
  {
    id: "maternity",
    title: "Maternity",
    description: "Soft, timeless portraits of the months of waiting.",
    href: "/work/baby-shower",
    photo: { folder: "baby-shower", file: "191.JPG", position: "50% 40%" },
  },
  {
    id: "puberty",
    title: "Puberty Ceremony",
    description: "One afternoon, one small ceremony — held close.",
    href: "/work/puberty",
    photo: { folder: "puberty", file: "207.JPG", position: "50% 25%" },
  },
  {
    id: "birthday",
    title: "Birthday & Baby Shoots",
    description: "The smallest moments deserve the biggest memories.",
    href: "/work/baby-shoot",
    photo: { folder: "baby-shoot", file: "87.jpg", position: "50% 40%" },
  },
  {
    id: "events",
    title: "Family Events & Occasions",
    description: "Family functions, celebrations and every special occasion in between.",
    href: "/work",
    photo: { folder: "couple-portrait", file: "176.jpg", position: "58% 45%" },
  },
  {
    id: "films",
    title: "Candid Films",
    description: "The day, in motion — cinematic films of your celebration.",
    href: "/work/candid-videos",
    photo: { src: FILMS_THUMB, position: "50% 50%" },
    video: true,
  },
];

/** Photographs for the About page's story section. */
export const STORY_PHOTOS: { main: PackagePhoto; inset: PackagePhoto } = {
  main: { folder: "couple-portrait", file: "172.jpg", position: "50% 40%" },
  inset: { folder: "couple-portrait", file: "171.jpg", position: "50% 30%" },
};
