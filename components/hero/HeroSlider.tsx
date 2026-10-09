"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import ProtectedImage from "@/components/gallery/ProtectedImage";

export type HeroSlide = {
  src: string;
  /** object-position on phones / tablets (portrait crop of a landscape photo). */
  mobile?: string;
  /** object-position on desktop. */
  desktop?: string;
};

type Props = {
  slides: HeroSlide[];
  /** Copy column (headline, tagline, CTAs). */
  children: ReactNode;
  /** Bottom-left row — social / contact links. */
  meta?: ReactNode;
  /** Time each slide stays on screen, in ms. */
  interval?: number;
};

const EASE = [0.76, 0, 0.24, 1] as const;
const FADE_S = 1.4;

/**
 * Full-screen cinematic hero.
 *
 * Crossfading photographs with a slow Ken Burns settle, layered dark
 * gradients + vignette + film grain for legibility, and a bottom bar with
 * contact links and slide controls (counter, arrows, progress, pause).
 *
 * Performance: only the first slide is in the initial HTML (it is the
 * LCP image). The others mount after the page is idle — skipped on
 * Save-Data / 2G, where they load only if the visitor navigates to them.
 * Autoplay pauses while the tab is hidden, while the hero is scrolled out
 * of view, while the pointer/focus is on the controls, and when the
 * visitor presses pause. Reduced-motion users get no autoplay and no
 * zoom (MotionConfig strips transform animations).
 */
export default function HeroSlider({
  slides,
  children,
  meta,
  interval = 6500,
}: Props) {
  const count = slides.length;
  const reduce = useReducedMotion();

  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState<number[]>([0]);
  const [started, setStarted] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);

  const paused =
    !started || !autoplay || hovering || tabHidden || offscreen || count < 2;

  const go = useCallback(
    (index: number) => {
      const next = (index + count) % count;
      setMounted((m) => (m.includes(next) ? m : [...m, next]));
      setActive(next);
    },
    [count]
  );

  // Start after hydration; reduced-motion visitors start paused.
  useEffect(() => {
    setStarted(true);
    if (reduce) setAutoplay(false);
  }, [reduce]);

  // Mount the remaining slides once the page has settled.
  useEffect(() => {
    if (count < 2) return;
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (
      conn?.saveData ||
      conn?.effectiveType === "2g" ||
      conn?.effectiveType === "slow-2g"
    ) {
      return;
    }
    const id = window.setTimeout(
      () => setMounted(slides.map((_, i) => i)),
      2500
    );
    return () => window.clearTimeout(id);
  }, [count, slides]);

  useEffect(() => {
    const onVisibility = () =>
      setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reset the progress bar whenever the slide changes.
  useEffect(() => {
    progress.current = 0;
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
  }, [active]);

  // Drive the progress bar (and autoplay) from a rAF loop that writes to
  // the DOM directly — no React re-render per frame.
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      progress.current += (now - last) / interval;
      last = now;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(progress.current, 1)})`;
      }
      if (progress.current >= 1) {
        go(active + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, interval, active, go]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const showControls = count > 1;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-label="Featured photographs"
        className="theme-dark relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-noir px-6 pb-32 pt-32 md:px-10 md:pb-36 lg:pb-40"
      >
        {/* Photographs */}
        <div aria-hidden className="absolute inset-0 -z-10">
          {slides.map((slide, i) =>
            mounted.includes(i) ? (
              <motion.div
                key={slide.src}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={{ duration: FADE_S, ease: EASE }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: i === 0 ? 1.12 : 1.08 }}
                  animate={{ scale: i === active ? 1 : 1.08 }}
                  transition={
                    i === active
                      ? { duration: interval / 1000 + FADE_S, ease: "easeOut" }
                      : { duration: 0, delay: FADE_S }
                  }
                >
                  <ProtectedImage
                    src={slide.src}
                    alt=""
                    fill
                    priority={i === 0}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    loading={i === 0 ? undefined : "eager"}
                    sizes="100vw"
                    quality={90}
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-cover object-[var(--pos-m)] lg:object-[var(--pos-d)]"
                    style={
                      {
                        "--pos-m": slide.mobile ?? "50% 35%",
                        "--pos-d": slide.desktop ?? "50% 40%",
                      } as CSSProperties
                    }
                  />
                </motion.div>
              </motion.div>
            ) : null
          )}

          {/* Cinematic treatment: warm grade, vignette, legibility gradients */}
          <div className="absolute inset-0 bg-[#2a1d08]/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_35%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-noir/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/55 to-transparent lg:via-noir/35" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-noir/80 via-noir/25 to-transparent lg:block" />
          <div className="film-grain absolute inset-0" />
        </div>

        {children}

        {/* Bottom bar — contact links + slide controls */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10">
            <div
              aria-hidden
              className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            />
            <div className="flex items-center justify-between gap-4 py-5 md:py-7">
              <HeroFade delay={1.05}>{meta}</HeroFade>

              {showControls && (
                <HeroFade delay={1.15}>
                  <div
                    className="flex items-center gap-3 md:gap-5"
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    onFocus={() => setHovering(true)}
                    onBlur={() => setHovering(false)}
                  >
                    {/* Progress bars */}
                    <div aria-hidden className="hidden items-center gap-2 sm:flex">
                      {slides.map((s, i) => (
                        <span
                          key={s.src}
                          className="relative block h-px w-8 overflow-hidden bg-white/25 md:w-12"
                        >
                          {i === active ? (
                            <span
                              ref={barRef}
                              className="absolute inset-0 origin-left bg-gold"
                              style={{ transform: "scaleX(0)" }}
                            />
                          ) : null}
                        </span>
                      ))}
                    </div>

                    <p
                      className="font-serif text-lg text-white md:text-xl"
                      aria-live={paused ? "polite" : "off"}
                      aria-atomic="true"
                    >
                      <span className="sr-only">Photograph </span>
                      {pad(active + 1)}
                      <span className="text-white/40">
                        <span className="sr-only"> of</span> / {pad(count)}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => go(active - 1)}
                        aria-label="Previous photograph"
                        data-cursor-label="prev"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-500 ease-expo hover:border-gold hover:bg-gold hover:text-noir md:h-11 md:w-11"
                      >
                        <Chevron dir="left" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go(active + 1)}
                        aria-label="Next photograph"
                        data-cursor-label="next"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-noir shadow-[0_10px_30px_-12px_rgba(201,165,92,0.8)] transition-all duration-500 ease-expo hover:bg-gold-light md:h-11 md:w-11"
                      >
                        <Chevron dir="right" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoplay((a) => !a)}
                        aria-pressed={!autoplay}
                        aria-label={autoplay ? "Pause slideshow" : "Play slideshow"}
                        data-cursor-label={autoplay ? "pause" : "play"}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors duration-500 hover:text-gold md:h-10 md:w-10"
                      >
                        {autoplay ? <PauseIcon /> : <PlayIcon />}
                      </button>
                    </div>
                  </div>
                </HeroFade>
              )}
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/**
 * Subtle entrance — fade + short rise. Used by the hero copy, CTAs and
 * bottom bar so everything arrives in one choreographed sequence.
 */
export function HeroFade({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
      <rect x="14" y="5" width="3.5" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}
