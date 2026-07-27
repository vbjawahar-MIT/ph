"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { MediaItem } from "@/lib/gallery";

type Props = {
  items: MediaItem[];
  /** Currently-open index. `null` closes the lightbox. */
  index: number | null;
  onClose: () => void;
  onChange: (next: number) => void;
};

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Fullscreen media viewer.
 *
 * Features
 * ────────
 *  • Prev / Next arrow buttons
 *  • Keyboard: ←, →, Esc, + / - to zoom, 0 to reset
 *  • Touch swipe (pointer events — horizontal drag)
 *  • Click-to-zoom on images (1x ↔ 2x with mouse-follow pan)
 *  • Native <video> controls for videos, poster autoplay-off
 *  • Image counter, fade transition, backdrop click to close
 *  • Escapes body scroll while open (Lenis is paused via a class hook)
 */
export default function Lightbox({ items, index, onClose, onChange }: Props) {
  const open = index !== null;
  const current = open ? items[index] : null;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(false);

  // Reset zoom whenever the visible item changes.
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  const go = useCallback(
    (delta: number) => {
      if (!open) return;
      const next = (index! + delta + items.length) % items.length;
      onChange(next);
    },
    [open, index, items.length, onChange]
  );

  // Keyboard shortcuts + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.5));
      else if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
      else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, go, onClose]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = false;
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragMoved.current = true;
    if (zoom > 1) setPan({ x: dx, y: dy });
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    dragStart.current = null;
    if (zoom === 1 && Math.abs(dx) > 60) {
      go(dx < 0 ? 1 : -1);
    }
    if (dragMoved.current && zoom > 1) {
      // pan settled, keep the offset
    } else if (!dragMoved.current) {
      // clean tap — toggle zoom on images
      if (current?.kind === "image") {
        setZoom((z) => (z === 1 ? 2 : 1));
        setPan({ x: 0, y: 0 });
      }
    }
  };

  const swallow = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const positionLabel = useMemo(
    () => (open ? `${index! + 1} / ${items.length}` : ""),
    [open, index, items.length]
  );

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#080820]/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Media viewer — ${positionLabel}`}
        >
          {/* Top bar — counter + close */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 text-white md:px-10">
            <span className="ui-label opacity-80">{positionLabel}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close (ESC)"
              data-cursor-label="close"
              className="ui-label rounded-full border border-white/40 px-4 py-2 transition-all duration-500 hover:scale-105 hover:border-white hover:bg-white hover:text-[#3554ff]"
            >
              close &nbsp;esc
            </button>
          </div>

          {/* Prev / Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous (←)"
            data-cursor-label="prev"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-md transition-all duration-500 hover:scale-110 hover:border-white hover:bg-white hover:text-[#3554ff] md:left-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M15 6l-6 6 6 6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next (→)"
            data-cursor-label="next"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-md transition-all duration-500 hover:scale-110 hover:border-white hover:bg-white hover:text-[#3554ff] md:right-8"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M9 6l6 6-6 6z" />
            </svg>
          </button>

          {/* Media stage */}
          <motion.div
            key={current.src}
            className="relative h-full w-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragStart.current = null)}
          >
            {current.kind === "image" ? (
              <div
                className="flex h-full w-full items-center justify-center px-4 py-16 md:px-16"
                style={{ cursor: zoom === 1 ? "zoom-in" : "grab" }}
              >
                <div
                  className="relative flex h-full max-h-full w-full max-w-[1400px] items-center justify-center"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center",
                    transition: dragStart.current
                      ? "none"
                      : "transform 400ms cubic-bezier(0.76,0,0.24,1)",
                  }}
                >
                  <Image
                    src={current.src}
                    alt=""
                    fill
                    quality={90}
                    sizes="100vw"
                    priority
                    className="pointer-events-none select-none object-contain"
                    draggable={false}
                    onContextMenu={swallow}
                    onDragStart={swallow}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 py-16 md:px-16">
                <video
                  src={current.src}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  className="max-h-full max-w-[1400px] rounded-sm shadow-2xl"
                  onContextMenu={swallow}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
