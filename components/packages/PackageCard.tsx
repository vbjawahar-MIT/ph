import { Fragment } from "react";
import Link from "next/link";
import ProtectedImage from "@/components/gallery/ProtectedImage";
import { isFeatured, type PhotoPackage } from "@/lib/packages";

type Props = {
  pkg: PhotoPackage;
  /** Position within its group, shown as a small tier number. */
  index: number;
  /** Resolved hosted URL of the card photograph. */
  photoSrc: string | null;
  /** Pre-filled subject for the enquiry form. */
  subject: string;
};

const CARD_SIZES =
  "(min-width: 1536px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Package card. Top tiers with a `highlight` get a jewel-tone silk card
 * (emerald / ruby) with a slow gold sheen; any other drone-coverage tier
 * falls back to the dark treatment. Every card lifts, gains a gold edge
 * and sweeps a gold accent line across its top on hover.
 *
 * Like the navbar, the card is sized in px (type in em of a fixed 16px
 * base), so enlarged browser text can't squeeze five cards in a row.
 */
export default function PackageCard({ pkg, index, photoSrc, subject }: Props) {
  const featured = isFeatured(pkg);
  const tone = pkg.highlight
    ? `theme-${pkg.highlight} pkg-jewel`
    : featured
      ? "theme-dark border-gold/40 bg-noir shadow-lift"
      : "border-line/[0.08] bg-card shadow-soft hover:border-gold/50";
  const bookHref = `/contact?package=${encodeURIComponent(subject)}#enquiry`;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border text-[16px] transition-[transform,box-shadow,border-color] duration-700 ease-expo hover:-translate-y-2 hover:shadow-lift ${tone}`}
    >
      {/* Gold accent line that sweeps in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-gold transition-transform duration-700 ease-expo group-hover:scale-x-100"
      />

      <div className="pkg-photo relative overflow-hidden bg-surface-alt">
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
        <span className="ui-label absolute left-[16px] top-[16px] whitespace-nowrap rounded-full bg-noir/60 px-[12px] py-[4px] !text-[0.75em] text-gold-light backdrop-blur-sm">
          {String(index).padStart(2, "0")}
        </span>
        {featured && (
          <span className="ui-label absolute right-[16px] top-[16px] whitespace-nowrap rounded-full bg-gold px-[12px] py-[4px] !text-[0.75em] text-noir shadow-soft">
            Drone coverage
          </span>
        )}
      </div>

      <div className="pkg-body flex flex-1 flex-col">
        <h3
          className="font-serif text-[1.65em] font-medium tracking-serif text-ink"
          style={{ lineHeight: 1.1 }}
        >
          {pkg.name}
        </h3>
        {pkg.tier && (
          <p className="mt-[2px] font-serif text-[1.125em] italic leading-[1.55] text-accent">
            {pkg.tier}
          </p>
        )}

        <span aria-hidden className="mt-[20px] block h-px bg-line/10" />
        <p className="ui-label mt-[20px] !text-[0.75em] text-ink/45">
          What&apos;s included
        </p>

        {/* Tick and quantity sit in boxes exactly one line tall, so they
            stay level with the first line of a wrapping label, and the
            label can never slide underneath the quantity. */}
        <ul className="mt-[12px] space-y-[10px] text-[0.88em] leading-[1.45] text-ink/80">
          {pkg.inclusions.map((item) => (
            <li key={item.label} className="flex items-start gap-[12px]">
              <span aria-hidden className="flex h-[1.45em] shrink-0 items-center">
                <span className="flex h-[1.3em] w-[1.3em] items-center justify-center rounded-full bg-gold/15 text-accent">
                  <svg viewBox="0 0 16 16" className="h-[0.7em] w-[0.7em]" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3.5 8.4l2.9 2.9 6-6.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <span className="flex-1">{item.label}</span>
              {item.qty !== undefined && (
                <span className="flex h-[1.45em] shrink-0 items-center">
                  <span className="rounded-full bg-surface-alt px-[0.65em] py-[0.3em] text-[0.8em] font-semibold leading-none tabular-nums text-ink/70">
                    ×{item.qty}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Complimentary shoot as a gold gift voucher: foil header with a
            passing shine, perforated edge, and the free items as tags. */}
        {pkg.complimentary && (
          <div className="pkg-gift-wrap mt-[24px]">
            <div className="pkg-gift">
              <div className="pkg-gift-head">
                <span
                  aria-hidden
                  className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-noir/85 text-gold-light"
                >
                  <GiftIcon className="h-[15px] w-[15px]" />
                </span>
                <p className="font-script text-[1.8em] leading-none">
                  Complimentary
                </p>
                <SparkleIcon className="ml-auto h-[18px] w-[18px] shrink-0 opacity-70" />
              </div>
              <div className="pkg-gift-body">
                {pkg.complimentary.map((group, g) => (
                  <Fragment key={g}>
                    {g > 0 && (
                      <span
                        aria-hidden
                        className="my-[12px] block border-t border-dashed border-gold/40"
                      />
                    )}
                    {/* Hyphenated words stay whole: "Pre-Wedding or / Post-Wedding". */}
                    {group.title && (
                      <p className="mb-[10px] font-serif text-[1.15em] font-medium leading-[1.2] text-ink">
                        {group.title.split(" ").map((word, i) => (
                          <Fragment key={i}>
                            {i > 0 && " "}
                            <span className="whitespace-nowrap">{word}</span>
                          </Fragment>
                        ))}
                      </p>
                    )}
                    <ul className="flex flex-wrap gap-[5px]">
                      {group.items.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center gap-[6px] rounded-full border border-gold/45 bg-card/75 px-[8px] py-[3px] text-[0.72em] font-medium leading-tight text-ink/90"
                        >
                          <span aria-hidden className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold" />
                          {item.label}
                          {item.qty !== undefined && (
                            <span className="font-semibold tabular-nums text-accent">
                              ×{item.qty}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-[28px]">
          <Link
            href={bookHref}
            data-cursor-label="book"
            className="btn btn-gold group/cta w-full gap-[10px] whitespace-normal px-[20px] py-[16px] text-center text-[0.875em]"
            aria-label={`Book your slot — ${subject}`}
          >
            Book Your Slot
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="h-[14px] w-[14px] transition-transform duration-500 ease-expo group-hover/cta:translate-x-1"
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

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12" />
      <path d="M12 8C10.5 5 7 4.5 7 6.8 7 8 9.5 8 12 8zM12 8c1.5-3 5-3.5 5-1.2C17 8 14.5 8 12 8z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11 2.5l1.9 6.6 6.6 1.9-6.6 1.9L11 19.5l-1.9-6.6L2.5 11l6.6-1.9z" />
      <path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z" />
    </svg>
  );
}
