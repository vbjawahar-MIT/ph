"use client";

import { motion, useInView } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useRef } from "react";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
} & Partial<Pick<ImageProps, "quality" | "placeholder" | "blurDataURL">>;

const EASE = [0.76, 0, 0.24, 1] as const;

export default function RevealImage({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  sizes,
  priority,
  fill,
  quality = 85,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* White curtain wipe — clean flash before reveal on gradient bg */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-10 origin-bottom bg-white"
        initial={{ scaleY: 1 }}
        animate={inView ? { scaleY: 0 } : { scaleY: 1 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.05 }}
      />
      {/* Image with subtle scale settle */}
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.08 }}
        animate={inView ? { scale: 1 } : { scale: 1.08 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes ?? "100vw"}
            quality={quality}
            priority={priority}
            className={`object-cover ${imgClassName ?? ""}`}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width ?? 1600}
            height={height ?? 2000}
            sizes={sizes ?? "100vw"}
            quality={quality}
            priority={priority}
            className={`h-full w-full object-cover ${imgClassName ?? ""}`}
          />
        )}
      </motion.div>
    </div>
  );
}
