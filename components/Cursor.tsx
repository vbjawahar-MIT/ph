"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorState = {
  visible: boolean;
  label: string | null;
  hovering: boolean;
};

/**
 * Custom cursor.
 *
 * Design goals (post-redesign):
 *   1. Smaller — the dot is 8px (was 16px).
 *   2. Never obscures text — on interactive hover the dot shrinks and
 *      drops to 55% opacity, so headings, buttons and project titles
 *      stay fully readable.
 *   3. Labels ("view", "open", "top") are rendered as a separate pill
 *      offset from the cursor, not baked into the cursor itself. The
 *      cursor never grows to accommodate text.
 *   4. GPU-accelerated — position via translate on spring MotionValues.
 *   5. Hidden on touch / coarse-pointer devices.
 */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Snappy but smooth — high stiffness, low mass = 60fps easing.
  const springConfig = { stiffness: 600, damping: 42, mass: 0.28 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const [state, setState] = useState<CursorState>({
    visible: false,
    label: null,
    hovering: false,
  });
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  // Keep the last label around during exit animations so text doesn't
  // pop out abruptly when leaving a hover target.
  const lastLabel = useRef<string | null>(null);
  if (state.label) lastLabel.current = state.label;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsPointerDevice(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isPointerDevice) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setState((s) => (s.visible ? s : { ...s, visible: true }));
    };
    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const label = el.getAttribute("data-cursor-label");
      setState({ visible: true, label, hovering: true });
    };
    const onLeave = () => {
      setState({ visible: true, label: null, hovering: false });
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const bind = () => {
      const targets = document.querySelectorAll<HTMLElement>(
        "a, button, [role='button'], [data-cursor]"
      );
      targets.forEach((t) => {
        t.removeEventListener("mouseenter", onEnter);
        t.removeEventListener("mouseleave", onLeave);
        t.addEventListener("mouseenter", onEnter);
        t.addEventListener("mouseleave", onLeave);
      });
    };
    bind();
    const observer = new MutationObserver(() => bind());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, [isPointerDevice, x, y]);

  if (!isPointerDevice) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ contain: "layout paint" }}
    >
      {/* The dot — small, subtle, never grows past its own base size. */}
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.6)]"
        style={{
          translateX: springX,
          translateY: springY,
          marginLeft: -4,
          marginTop: -4,
        }}
        animate={{
          scale: state.hovering ? 0.55 : 1,
          opacity: state.visible ? (state.hovering ? 0.55 : 1) : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      {/* Offset label pill — appears next to the cursor when hovering
          something with data-cursor-label. Never covers the target. */}
      <motion.div
        className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-ui text-[#3554ff] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        style={{
          translateX: springX,
          translateY: springY,
          marginLeft: 14,
          marginTop: 14,
          transformOrigin: "top left",
        }}
        animate={{
          opacity: state.label ? 1 : 0,
          scale: state.label ? 1 : 0.7,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        {lastLabel.current ?? ""}
      </motion.div>
    </div>
  );
}
