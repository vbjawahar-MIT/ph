"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Gold-logo watermark sitting behind the hero copy.
 *
 * Uses the transparent-gold PNG produced by scripts/extract-gold.mjs
 * so there is NO dark rectangle behind the artwork — just the golden
 * elements blending directly with the blue→purple gradient.
 *
 * Spec:
 *   • centred, 40–60% of screen width (uses ~50vw with a comfortable
 *     min/max so it stays legible on both phones and 4K displays)
 *   • opacity ~0.08
 *   • blends softly with the gradient (no border, no background box)
 *   • never intercepts clicks (`pointer-events-none`)
 *   • sits at z-index 0 while HeroContent stacks above it
 *   • gently drifts + rotates so it feels alive but not distracting
 */
type Props = { logoSrc: string | null };

export default function HeroWatermark({ logoSrc }: Props) {
  if (!logoSrc) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <motion.div
        className="flex w-full items-center justify-center"
        style={{
          // Opacity chosen to keep the mark clearly gold but still
          // subtle enough to sit behind the hero heading.
          opacity: 0.1,
          // Soft gold aura — the artwork is already gold, so no colour
          // filter is applied; the glow just gives it a premium sheen.
          filter: "drop-shadow(0 0 40px rgba(212, 175, 55, 0.35))",
        }}
        animate={{
          y: [0, -14, 0, 14, 0],
          rotate: [-1, 0, 1, 0, -1],
        }}
        transition={{
          duration: 26,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Image
          src={logoSrc}
          alt=""
          width={1600}
          height={800}
          priority={false}
          quality={90}
          sizes="(min-width: 1024px) 50vw, 80vw"
          className="h-auto w-[55vw] max-w-[1100px] select-none md:w-[50vw] lg:w-[45vw]"
          draggable={false}
          style={{ userSelect: "none" }}
        />
      </motion.div>
    </div>
  );
}
