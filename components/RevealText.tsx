"use client";

import { motion, useInView } from "framer-motion";
import { Fragment, useEffect, useRef, useState, ReactNode } from "react";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  splitBy?: "word" | "line";
  delay?: number;
  /** Play only the first time; by default it replays on every return. */
  once?: boolean;
};

/**
 * Splits text into masked chunks that translate upward into view.
 * Each word (or line) rises from below its own overflow-hidden mask.
 * The reveal replays whenever the text comes back on screen (scrolling
 * down or up); it only resets once the text is fully off screen, so the
 * words never drop away while they're being read.
 */
export default function RevealText({
  children,
  as: Tag = "p",
  className,
  splitBy = "word",
  delay = 0,
  once = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const entering = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const onScreen = useInView(ref);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (entering) setShown(true);
    else if (!onScreen && !once) setShown(false);
  }, [entering, onScreen, once]);

  // Defensive: caller may pass a non-string (JSX) child. If so, render it plain.
  if (typeof children !== "string") {
    return <Tag className={className}>{children as unknown as ReactNode}</Tag>;
  }

  const chunks =
    splitBy === "line" ? children.split("\n") : children.split(" ");

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: delay,
      },
    },
  };
  const item = {
    hidden: { y: "110%" },
    show: {
      y: "0%",
      transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
    },
  };

  const content: ReactNode = (
    <motion.span
      ref={ref}
      variants={container}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      className="inline"
    >
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          <span className="reveal-mask">
            <motion.span variants={item} className="inline-block">
              {chunk}
            </motion.span>
          </span>
          {/* Real space between words so screen readers and search
              engines read "hold their breath", not "holdtheirbreath". */}
          {splitBy === "word" && i < chunks.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );

  return <Tag className={className}>{content}</Tag>;
}
