import { SITE } from "@/lib/site-config";

type Props = {
  variant?: "card" | "inline";
};

/**
 * Premium social card linking to VB Photographe's official Instagram.
 *
 * `variant="card"` — full editorial tile with icon + copy + follow CTA.
 *   Suitable for the Contact page and any dedicated social section.
 * `variant="inline"` — compact link with just an icon + handle.
 *   Suitable for the Footer or dense composition surfaces.
 *
 * Uses the site's existing type + colour tokens — no new brand colors.
 */
export default function InstagramCard({ variant = "card" }: Props) {
  const href = SITE.social.instagram.href;
  const handle = SITE.social.instagram.handle;

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-label="follow"
        aria-label={`Follow @${handle} on Instagram (opens in a new tab)`}
        className="group inline-flex items-center gap-3 font-serif text-xl text-ink transition-colors duration-500 hover:text-gold"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-noir">
          <InstagramGlyph className="h-4 w-4" />
        </span>
        <span>Instagram</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="follow"
      aria-label={`Follow @${handle} on Instagram (opens in a new tab)`}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-line/10 bg-card p-6 shadow-soft transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:shadow-lift md:p-8"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 text-accent transition-all duration-500 ease-expo group-hover:scale-110 group-hover:border-gold group-hover:bg-gold group-hover:text-noir">
          <InstagramGlyph className="h-5 w-5" />
        </div>
        <div>
          <p className="ui-label text-ink/55">Instagram</p>
          <p className="mt-1 font-serif text-xl text-ink md:text-2xl">
            Follow @{handle}
          </p>
        </div>
      </div>
      <span className="ui-label whitespace-nowrap text-accent transition-transform duration-500 ease-expo group-hover:translate-x-1">
        Open →
      </span>
    </a>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
