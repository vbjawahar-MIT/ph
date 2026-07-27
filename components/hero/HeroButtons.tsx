import Link from "next/link";

/**
 * Primary hero CTAs. Kept as its own component so the button set can
 * evolve (add a secondary "book a call" later, etc.) without touching
 * HeroContent or the 3D scene.
 */
export default function HeroButtons() {
  return (
    <div className="flex items-end justify-between md:justify-end md:gap-12">
      <Link
        href="/work"
        data-cursor-label="enter"
        className="ui-label border-b border-white/80 pb-1 text-white transition-colors duration-500 hover:border-white"
      >
        see the work →
      </Link>
      <div
        aria-hidden
        className="hidden animate-bounce text-2xl text-white/60 md:block"
        style={{ animationDuration: "2.5s" }}
      >
        ↓
      </div>
    </div>
  );
}
