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
        className="group inline-flex items-center gap-3 text-ink/75 transition-colors duration-500 hover:text-gold"
      >
        <StarRow small />
        <span className="ui-label">Leave a Google review →</span>
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
      className="group flex flex-col gap-6 rounded-2xl border border-line/10 bg-card p-6 shadow-soft transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:shadow-lift md:p-8"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent transition-transform duration-500 ease-expo group-hover:scale-110">
          <GoogleGlyph className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="ui-label text-ink/55">Google Reviews</p>
          <StarRow />
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end sm:gap-6">
        <div>
          <p className="font-serif text-xl text-ink md:text-2xl">
            Share your experience
          </p>
          <p className="mt-1 text-sm text-ink/65">
            A few words from you helps future couples find us.
          </p>
        </div>
        <span className="btn btn-gold btn-sm shrink-0">Leave a review</span>
      </div>
    </a>
  );
}

function StarRow({ small = false }: { small?: boolean }) {
  const size = small ? "h-3.5 w-3.5" : "h-4 w-4 md:h-5 md:w-5";
  return (
    <div className="mt-2 flex items-center gap-1 text-gold" aria-label="5 out of 5">
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
