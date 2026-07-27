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
        className="group inline-flex items-center gap-3 text-2xl font-bold lowercase tracking-display text-white transition-opacity duration-500 hover:opacity-70"
      >
        <InstagramGlyph className="h-6 w-6 shrink-0" />
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
      className="group flex items-center justify-between gap-6 rounded-sm border border-white/15 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/[0.08] hover:shadow-[0_20px_60px_-30px_rgba(255,255,255,0.35)] md:p-7"
    >
      <div className="flex items-center gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform duration-500 ease-expo group-hover:scale-110 md:h-12 md:w-12">
          <InstagramGlyph className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div>
          <p className="ui-label text-white/60">Instagram</p>
          <p className="mt-1 text-lg font-bold lowercase tracking-display text-white md:text-xl">
            follow @{handle}
          </p>
        </div>
      </div>
      <span className="ui-label whitespace-nowrap text-white/60 transition-colors duration-500 group-hover:text-white">
        open →
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
