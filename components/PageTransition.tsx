"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();

  return (
    // initial={false}: no curtain on the very first page load (content and
    // the hero entrance are visible immediately); it still wipes on every
    // route change.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] origin-bottom"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.76, 0, 0.24, 1],
        }}
        style={{ background: "#F7F4EE" }}
      />
    </AnimatePresence>
  );
}
