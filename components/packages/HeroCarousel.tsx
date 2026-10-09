"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import ProtectedImage from "@/components/gallery/ProtectedImage";

export type CarouselSlide = {
  src: string;
  position?: string;
  /** Small caption kicker, e.g. "Wedding". */
  label: string;
  /** Serif caption line. */
  title: string;
};

/** Vertical slices each new photograph is revealed through. */
const SLICES = 6;
/** Time on each photograph (also the progress-bar fill). */
const INTERVAL = 5600;
const EASE = [0.76, 0, 0.24, 1] as const;
const SIZES = "(min-width: 1024px) 58vw, 100vw";

/**
 * Packages hero carousel.
 *
 * Transition: the incoming photograph is revealed through six vertical
 * slices that sweep in one after another (bottom-up going forward,
 * top-down going back) while the whole frame settles from a 1.16× zoom;
 * the outgoing photograph darkens and drifts back underneath. The caption
 * slides through a mask, gold progress bars time each slide, and a slow
 * Ken Burns drift runs while a photograph is on screen.
 *
 * Autoplays; pauses on hover, focus, an inactive tab or when scrolled out
 * of view. Arrows, the progress bars, swipe and ←/→ all navigate. Visitors
 * who prefer reduced motion get a plain crossfade and no autoplay.
 */
export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const reduce = Boolean(useReducedMotion());
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [turn, setTurn] = useState(0); // increments per change; 0 = first paint
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);

  const paused = hovered || focused || offscreen || tabHidden;

  const go = useCallback(
    (target: number, direction: 1 | -1) => {
      const next = (target + count) % count;
      if (next === index) return;
      setPrev(index);
      setDir(direction);
      setIndex(next);
      setTurn((t) => t + 1);
    },
    [count, index],
  );
  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const back = useCallback(() => go(index - 1, -1), [go, index]);

  // Pause while the tab is hidden or the carousel is off screen.
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const el = rootRef.current;
    const io = el
      ? new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), {
          threshold: 0.2,
        })
      : null;
    if (el && io) io.observe(el);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, []);

  // Warm the remaining photographs once the first has had its turn —
  // skipped for visitors on Save-Data / very slow connections.
  useEffect(() => {
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")) return;
    const t = window.setTimeout(() => {
      slides.slice(1).forEach((s) => {
        const img = new Image();
        img.decoding = "async";
        img.src = s.src;
      });
    }, 1800);
    return () => window.clearTimeout(t);
  }, [slides]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    }
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else back();
    }
  };

  const slide = slides[index];
  const first = turn === 0;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured photographs"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="relative select-none outline-none [touch-action:pan-y]"
    >
      {/* Image transitions are plain CSS animations (fill-mode "both"),
          so every layer holds its last frame with no hand-off flicker. */}
      <style>{`
        @keyframes carousel-progress { from { width: 0%; } to { width: 100%; } }
        @keyframes carousel-drift { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes carousel-settle { from { transform: scale(1.16); } to { transform: scale(1); } }
        @keyframes carousel-out { from { transform: scale(1.04); filter: brightness(1); } to { transform: scale(1.12); filter: brightness(0.45); } }
        @keyframes carousel-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes carousel-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slice-up { from { clip-path: inset(100% var(--r) 0% var(--l)); } to { clip-path: inset(0% var(--r) 0% var(--l)); } }
        @keyframes slice-down { from { clip-path: inset(0% var(--r) 100% var(--l)); } to { clip-path: inset(0% var(--r) 0% var(--l)); } }
        .carousel-drift { animation: carousel-drift 9s ease-out forwards; }
        .carousel-settle { animation: carousel-settle 1.6s var(--ease-expo) both; }
        .carousel-out { animation: carousel-out 1.2s var(--ease-expo) both; }
        .carousel-slice {
          clip-path: inset(0% var(--r) 0% var(--l));
          animation-duration: 950ms;
          animation-timing-function: var(--ease-expo);
          animation-fill-mode: both;
        }
        @media (prefers-reduced-motion: reduce) { .carousel-drift { animation: none; } }
      `}</style>

      {/* Offset gold frame behind the carousel */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border border-gold/50 md:translate-x-5 md:translate-y-5"
      />

      <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-noir shadow-lift ring-1 ring-gold/20 sm:aspect-[3/2] lg:aspect-[5/4] xl:aspect-[4/3]">
        {/* Outgoing photograph — darkens and drifts back */}
        {prev !== null && (
          <div
            key={`out-${turn}`}
            className={reduce ? "absolute inset-0" : "carousel-out absolute inset-0"}
            style={
              reduce
                ? { animation: "carousel-fade-out 0.5s ease both" }
                : undefined
            }
            onAnimationEnd={reduce ? () => setPrev(null) : undefined}
          >
            <SlidePhoto slide={slides[prev]} priority={prev === 0} />
          </div>
        )}

        {/* Incoming photograph — revealed through vertical slices */}
        <div
          key={`in-${turn}`}
          className={first || reduce ? "absolute inset-0" : "carousel-settle absolute inset-0"}
          style={
            reduce && !first
              ? { animation: "carousel-fade-in 0.5s ease both" }
              : undefined
          }
        >
          <div
            className="carousel-drift absolute inset-0"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            {Array.from({ length: reduce || first ? 1 : SLICES }).map((_, i, all) => {
              if (all.length === 1) {
                return (
                  <div key="whole" className="absolute inset-0">
                    <SlidePhoto slide={slide} priority={index === 0} />
                  </div>
                );
              }
              const left = (i * 100) / SLICES;
              const right = 100 - ((i + 1) * 100) / SLICES;
              // A hair of overlap so neighbouring slices never show a seam.
              const l = Math.max(left - 0.2, 0);
              const r = Math.max(right - 0.2, 0);
              const order = dir === 1 ? i : SLICES - 1 - i;
              return (
                <div
                  key={i}
                  className="carousel-slice absolute inset-0"
                  style={
                    {
                      "--l": `${l}%`,
                      "--r": `${r}%`,
                      animationName: dir === 1 ? "slice-up" : "slice-down",
                      animationDelay: `${order * 75}ms`,
                    } as React.CSSProperties
                  }
                  onAnimationEnd={
                    order === SLICES - 1
                      ? (e) => {
                          if (e.target === e.currentTarget) setPrev(null);
                        }
                      : undefined
                  }
                >
                  <SlidePhoto slide={slide} priority={index === 0} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Shade for the caption + controls */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30"
        />

        {/* Progress bars — also jump to a photograph */}
        <div className="absolute inset-x-4 top-3 z-10 flex gap-1.5 sm:inset-x-6 sm:top-4">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => go(i, i > index ? 1 : -1)}
              aria-label={`Show photograph ${i + 1}: ${s.label}`}
              aria-current={i === index}
              data-cursor-label="view"
              className="group/bar flex-1 py-2"
            >
              <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25 transition-colors duration-300 group-hover/bar:bg-white/40">
                {i < index && <span className="absolute inset-0 bg-gold" />}
                {i === index && (
                  <span
                    key={`bar-${turn}`}
                    className="absolute inset-y-0 left-0 bg-gold"
                    style={
                      reduce
                        ? { width: "100%" }
                        : {
                            animation: `carousel-progress ${INTERVAL}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                    }
                    onAnimationEnd={reduce ? undefined : next}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Caption */}
        <div
          className="absolute bottom-5 left-5 right-32 z-10 sm:bottom-7 sm:left-8 sm:right-40"
          aria-live={paused ? "polite" : "off"}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`k-${index}`}
                className="ui-label text-[0.62rem] text-gold-light sm:text-[0.68rem]"
                initial={{ y: "120%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {String(index + 1).padStart(2, "0")} — {slide.label}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-1.5 overflow-hidden pb-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`t-${index}`}
                className="font-serif text-xl italic text-white sm:text-3xl"
                style={{ lineHeight: 1.15 }}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                exit={{ y: "-110%" }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
              >
                {slide.title}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Counter + arrows */}
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 sm:bottom-7 sm:right-8 sm:gap-3">
          <span className="ui-label hidden text-[0.68rem] text-white/80 sm:inline">
            {String(index + 1).padStart(2, "0")}
            <span className="text-white/40"> / {String(count).padStart(2, "0")}</span>
          </span>
          <ArrowButton label="Previous photograph" onClick={back} flip />
          <ArrowButton label="Next photograph" onClick={next} />
        </div>
      </div>
    </div>
  );
}

/**
 * The first photograph is the page's LCP image — it keeps `priority`
 * wherever it is drawn (it is already loaded, so this costs nothing and
 * stops Next's dev LCP check from flagging the re-rendered copies).
 */
function SlidePhoto({
  slide,
  priority = false,
}: {
  slide: CarouselSlide;
  priority?: boolean;
}) {
  return (
    <ProtectedImage
      src={slide.src}
      alt=""
      fill
      sizes={SIZES}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      className="object-cover"
      style={{ objectPosition: slide.position ?? "50% 40%" }}
    />
  );
}

function ArrowButton({
  label,
  onClick,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-cursor-label={flip ? "prev" : "next"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm transition-all duration-500 ease-expo hover:scale-105 hover:border-gold hover:bg-gold hover:text-noir sm:h-11 sm:w-11"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className={`h-3.5 w-3.5 ${flip ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
