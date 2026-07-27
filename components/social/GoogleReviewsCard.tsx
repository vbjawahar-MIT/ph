import { SITE } from "@/lib/site-config";

type Props = {
  variant?: "card" | "compact";
};

/**
 * Premium Google Reviews card.
 *
 * `variant="card"` — full call-to-action for the Contact page /
 *   dedicated reviews section: 5-star row + name + prompt + CTA button.
 * `variant="compact"` — condensed one-line footer variant.
 *
 * Both open in a new tab, are keyboard accessible, and use existing
 * design tokens only (no new brand colors introduced).
 */
export default function GoogleReviewsCard({ variant = "card" }: Props) {
  const href = SITE.social.google.reviewHref;
  const business = SITE.social.google.businessName;
  const label = `Leave a Google review for ${business} (opens in a new tab)`;

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        data-cursor-label="review"
        className="group inline-flex items-center gap-3 text-white transition-opacity duration-500 hover:opacity-80"
      >
        <StarRow small />
        <span className="ui-label">leave a Google review →</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor-label="review"
      className="group flex flex-col gap-6 rounded-sm border border-white/15 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/[0.08] hover:shadow-[0_20px_60px_-30px_rgba(255,255,255,0.35)] md:p-7"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform duration-500 ease-expo group-hover:scale-110 md:h-12 md:w-12">
          <GoogleGlyph className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="flex-1">
          <p className="ui-label text-white/60">Google Reviews</p>
          <StarRow />
        </div>
      </div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-lg font-bold lowercase tracking-display text-white md:text-xl">
            share your experience
          </p>
          <p className="mt-1 text-sm text-white/70">
            a few words from you helps future couples find us.
          </p>
        </div>
        <span className="ui-label shrink-0 whitespace-nowrap rounded-full border border-white/40 px-4 py-2 text-white transition-all duration-500 group-hover:scale-105 group-hover:border-white group-hover:bg-white group-hover:text-[#3554ff]">
          leave a review
        </span>
      </div>
    </a>
  );
}

function StarRow({ small = false }: { small?: boolean }) {
  const size = small ? "h-3.5 w-3.5" : "h-4 w-4 md:h-5 md:w-5";
  return (
    <div className="mt-2 flex items-center gap-1 text-white" aria-label="5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${size} fill-current`} aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 11v2.5h5.7c-.24 1.4-1.66 4.1-5.7 4.1-3.43 0-6.23-2.85-6.23-6.35S8.57 4.9 12 4.9c1.95 0 3.26.83 4.01 1.55l2.74-2.63C17.05 2.28 14.75 1.3 12 1.3 6.24 1.3 1.6 5.94 1.6 11.7S6.24 22.1 12 22.1c6.93 0 11.5-4.87 11.5-11.72 0-.79-.09-1.4-.2-1.98H12z" />
    </svg>
  );
}
