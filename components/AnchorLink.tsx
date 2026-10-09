"use client";

import { useReducedMotion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { useLenis } from "@/components/SmoothScroll";

type Props = {
  /** Id of the section on this page to glide to (without "#"). */
  to: string;
  className?: string;
  children: ReactNode;
  "data-cursor-label"?: string;
};

/**
 * In-page link that glides to a section through Lenis instead of the
 * browser's instant jump. The section's scroll-margin-top keeps it clear
 * of the fixed nav.
 */
export default function AnchorLink({ to, className, children, ...rest }: Props) {
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(to);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { immediate: Boolean(reduceMotion) });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
    window.history.replaceState(window.history.state, "", `#${to}`);
  };

  return (
    <a href={`#${to}`} onClick={onClick} className={className} {...rest}>
      {children}
    </a>
  );
}
