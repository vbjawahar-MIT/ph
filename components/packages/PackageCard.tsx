import Link from "next/link";
import ProtectedImage from "@/components/gallery/ProtectedImage";
import { formatAmount, isFeatured, type PhotoPackage } from "@/lib/packages";

type Props = {
  pkg: PhotoPackage;
  /** Position within its group, shown as a small tier number. */
  index: number;
  /** Resolved hosted URL of the card photograph. */
  photoSrc: string | null;
  /** Pre-filled subject for the enquiry form. */
  subject: string;
};

const CARD_SIZES = "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw";

/**
 * Pricing card. The top tier of a group (drone coverage) gets the dark
 * featured treatment; every card lifts, gains a gold edge and sweeps a
 * gold accent line across its top on hover.
 */
export default function PackageCard({ pkg, index, photoSrc, subject }: Props) {
  const featured = isFeatured(pkg);
  const bookHref = `/contact?package=${encodeURIComponent(subject)}#enquiry`;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border transition-[transform,box-shadow,border-color] duration-700 ease-expo hover:-translate-y-2 hover:shadow-lift ${
        featured
          ? "theme-dark border-gold/40 bg-noir shadow-lift"
          : "border-line/[0.08] bg-card shadow-soft hover:border-gold/50"
      }`}
    >
      {/* Gold accent line that sweeps in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-gold transition-transform duration-700 ease-expo group-hover:scale-x-100"
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
        {photoSrc && (
          <ProtectedImage
            src={photoSrc}
            alt=""
            fill
            sizes={CARD_SIZES}
            loading="lazy"
            className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.07]"
            style={{ objectPosition: pkg.photo.position ?? "50% 35%" }}
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/20"
        />
        <span className="ui-label absolute left-4 top-4 rounded-full bg-noir/60 px-3 py-1 text-[0.62rem] text-gold-light backdrop-blur-sm">
          {String(index).padStart(2, "0")}
        </span>
        {featured && (
          <span className="ui-label absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-[0.6rem] text-noir shadow-soft">
            Drone coverage
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 xl:p-5 2xl:p-6">
        <h3
          className="font-serif text-[1.65rem] font-medium tracking-serif text-ink"
          style={{ lineHeight: 1.1 }}
        >
          {pkg.name}
        </h3>
        {pkg.tier && (
          <p className="mt-0.5 font-serif text-lg italic text-accent">
            {pkg.tier}
          </p>
        )}

        {/* Price */}
        <p
          className="mt-4 flex items-baseline gap-1 text-ink"
          aria-label={`Price ₹${formatAmount(pkg.price)}`}
        >
          <span className="font-serif text-xl text-accent">₹</span>
          <span
            className="font-serif text-[2.35rem] font-semibold tracking-serif"
            style={{ lineHeight: 1 }}
          >
            {formatAmount(pkg.price)}
          </span>
          <span className="ml-0.5 text-sm text-ink/45">/-</span>
        </p>

        <span aria-hidden className="mt-5 block h-px bg-line/10" />
        <p className="ui-label mt-5 text-[0.62rem] text-ink/45">
          What&apos;s included
        </p>

        <ul className="mt-3 space-y-2.5 text-[0.88rem] text-ink/80">
          {pkg.inclusions.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-accent"
              >
                <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3.5 8.4l2.9 2.9 6-6.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.qty !== undefined && (
                <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-ink/70">
                  ×{item.qty}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <Link
            href={bookHref}
            data-cursor-label="book"
            className="btn btn-gold group/cta w-full py-4"
            aria-label={`Book your slot — ${subject}`}
          >
            Book Your Slot
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover/cta:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
