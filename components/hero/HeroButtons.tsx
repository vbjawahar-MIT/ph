import Link from "next/link";

/**
 * Hero calls to action — primary (the work) and secondary (booking).
 */
export default function HeroButtons() {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
      <Link href="/work" data-cursor-label="enter" className="btn btn-light">
        See the Work <span aria-hidden>→</span>
      </Link>
      <Link href="/contact" data-cursor-label="book" className="btn btn-outline">
        Book a Session
      </Link>
    </div>
  );
}
