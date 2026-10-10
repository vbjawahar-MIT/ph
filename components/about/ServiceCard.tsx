import Link from "next/link";
import ProtectedImage from "@/components/gallery/ProtectedImage";

type Props = {
  index: number;
  title: string;
  description: string;
  href: string;
  photoSrc: string | null;
  position?: string;
  video?: boolean;
};

const CARD_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw";

/**
 * Photo-led service card: tall photograph with a slow zoom on hover,
 * numbered serif title, one-line description and a gallery link.
 */
export default function ServiceCard({
  index,
  title,
  description,
  href,
  photoSrc,
  position,
  video = false,
}: Props) {
  return (
    <Link
      href={href}
      data-cursor-label="view"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/[0.07] bg-card shadow-soft transition-[transform,box-shadow,border-color] duration-700 ease-expo hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-lift"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-alt">
        {photoSrc && (
          <ProtectedImage
            src={photoSrc}
            alt=""
            fill
            sizes={CARD_SIZES}
            loading="lazy"
            className="object-cover transition-transform duration-[1400ms] ease-expo group-hover:scale-[1.06]"
            style={{ objectPosition: position ?? "50% 35%" }}
          />
        )}
        {/* Soft shade so the number badge reads on any photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/25 opacity-80 transition-opacity duration-700 group-hover:opacity-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-noir/55 px-2.5 py-1 font-sans text-[0.65rem] font-semibold tracking-ui text-gold-light backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[0.7rem]">
          {String(index).padStart(2, "0")}
        </span>
        {video && (
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-noir shadow-lift transition-transform duration-500 ease-expo group-hover:scale-110"
          >
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <h3
          className="font-serif text-[1.2rem] font-medium tracking-serif text-ink sm:text-[1.6rem]"
          style={{ lineHeight: 1.1 }}
        >
          {title}
        </h3>
        <p className="mt-2 hidden text-[0.92rem] leading-relaxed text-ink/65 sm:block">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4 sm:pt-6">
          <span className="ui-label whitespace-nowrap text-[0.62rem] text-ink/45 sm:text-[0.68rem]">
            <span className="sm:hidden">{video ? "Films" : "Gallery"}</span>
            <span className="hidden sm:inline">
              {video ? "Watch films" : "View gallery"}
            </span>
          </span>
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/15 text-ink transition-all duration-500 ease-expo group-hover:border-gold group-hover:bg-gold group-hover:text-noir sm:h-10 sm:w-10"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
