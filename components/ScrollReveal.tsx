"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveal for any element marked `data-reveal` (optionally
 * `data-reveal="zoom"` for photographs, and a `--reveal-delay` style for
 * staggering). Styles live in globals.css.
 *
 * Safe by design:
 *   ▪ Only elements BELOW the first screen are hidden (`reveal-pending`)
 *     and they fade/rise in as they approach — anything already on screen
 *     is left alone, so nothing flickers on load. Without JavaScript,
 *     everything simply shows.
 *   ▪ Once revealed, the helper classes are removed so each element's own
 *     hover transforms and transitions are back in charge.
 *   ▪ Visitors who prefer reduced motion get no reveals at all.
 *   ▪ Re-scans after every client-side route change.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers = new Set<number>();
    const settle = (el: HTMLElement) => {
      el.classList.remove("reveal-pending", "reveal-in");
      el.classList.add("reveal-done");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.classList.add("reveal-in");
          const delay = parseFloat(getComputedStyle(el).getPropertyValue("--reveal-delay")) || 0;
          const t = window.setTimeout(() => {
            timers.delete(t);
            settle(el);
          }, 1300 + delay);
          timers.add(t);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const raf = requestAnimationFrame(() => {
      const fold = window.innerHeight * 0.94;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.reveal-done):not(.reveal-pending)")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < fold) {
            el.classList.add("reveal-done"); // already visible — leave it be
            return;
          }
          el.classList.add("reveal-pending");
          io.observe(el);
        });
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      // Never leave anything hidden behind a route change.
      document
        .querySelectorAll<HTMLElement>("[data-reveal].reveal-pending")
        .forEach(settle);
    };
  }, [pathname]);

  return null;
}
