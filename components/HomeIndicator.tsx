"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Bottom-left "VB" back-to-top button. Circular, backdrop-blurred,
 * appears after the user has scrolled a screenful, and smoothly
 * scrolls the page back to the top on click.
 *
 * Replaces the dev-mode Next.js indicator that used to sit in that
 * corner — this one persists in production as brand furniture.
 */
export default function HomeIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      aria-label="Back to top"
      data-cursor-label="top"
      onClick={scrollTop}
      className="group fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-500 ease-expo hover:scale-110 hover:border-white hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.35)] md:bottom-8 md:left-8 md:h-14 md:w-14"
      initial={{ opacity: 0, y: 16, scale: 0.85 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 16,
        scale: visible ? 1 : 0.85,
      }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <span
        className="text-sm font-bold tracking-[0.06em] text-white transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 md:text-base"
        style={{ lineHeight: 1 }}
      >
        VB
      </span>
    </motion.button>
  );
}
