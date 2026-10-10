"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveal for any element marked `data-reveal` (optionally
 * `data-reveal="zoom"` for photographs, and a `--reveal-delay` style for
 * staggering). Styles live in globals.css.
 *
 * The reveal replays every time an element comes back into view — when
 * scrolling down and again when scrolling back up:
 *   ▪ An element is reset to its hidden state (`reveal-pending`) only once
 *     it is fully off screen, so nothing ever fades out in view.
 *   ▪ It rises/fades in again as it re-enters (`reveal-in`).
 *   ▪ After each reveal the helper classes are removed (`reveal-done`) so
 *     the element's own hover transforms and transitions are in charge.
 *
 * Safe by design:
 *   ▪ Anything already on screen at load is left alone, so nothing
 *     flickers; it joins in once it has scrolled away and comes back.
 *     Without JavaScript, everything simply shows.
 *   ▪ Visitors who prefer reduced motion get no reveals at all.
 *   ▪ Re-scans after every client-side route change.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers = new Map<HTMLElement, number>();
    const clearTimer = (el: HTMLElement) => {
      const t = timers.get(el);
      if (t !== undefined) {
        window.clearTimeout(t);
        timers.delete(el);
      }
    };
    const settle = (el: HTMLElement) => {
      clearTimer(el);
      el.classList.remove("reveal-pending", "reveal-in");
      el.classList.add("reveal-done");
    };
    const hide = (el: HTMLElement) => {
      if (el.classList.contains("reveal-pending") && !el.classList.contains("reveal-in")) return;
      clearTimer(el);
      // Jump straight to hidden (it's off screen) so a quick scroll back
      // replays the full reveal rather than a half-faded one.
      el.style.transition = "none";
      el.classList.remove("reveal-done", "reveal-in");
      el.classList.add("reveal-pending");
      void el.offsetHeight; // commit the hidden state before restoring transitions
      el.style.transition = "";
    };
    const reveal = (el: HTMLElement) => {
      if (!el.classList.contains("reveal-pending") || el.classList.contains("reveal-in")) return;
      el.classList.add("reveal-in");
      const delay = parseFloat(getComputedStyle(el).getPropertyValue("--reveal-delay")) || 0;
      timers.set(el, window.setTimeout(() => settle(el), 1300 + delay));
    };

    // Reveal as an element comes into view…
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    // …and reset it only once it is at least 40px past the screen edge.
    // The hidden state shifts an element 26px down (or zooms it slightly),
    // so the margin keeps a reset element off screen — otherwise one that
    // just left through the top could slide back in and flicker.
    const hideIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) hide(entry.target as HTMLElement);
        }
      },
      { rootMargin: "40px 0px 40px 0px", threshold: 0 },
    );

    const raf = requestAnimationFrame(() => {
      const fold = window.innerHeight * 0.94;
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.reveal-pending)")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < fold) {
            el.classList.add("reveal-done"); // already visible — leave it be
          } else {
            el.classList.add("reveal-pending");
          }
          revealIO.observe(el);
          hideIO.observe(el);
        });
    });

    return () => {
      cancelAnimationFrame(raf);
      revealIO.disconnect();
      hideIO.disconnect();
      // Never leave anything hidden behind a route change.
      document
        .querySelectorAll<HTMLElement>("[data-reveal].reveal-pending")
        .forEach(settle);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [pathname]);

  return null;
}
