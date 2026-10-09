"use client";

import { motion, useInView } from "framer-motion";
import { Fragment, useRef, ReactNode } from "react";

type Props = {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  splitBy?: "word" | "line";
  delay?: number;
  once?: boolean;
};

/**
 * Splits text into masked chunks that translate upward into view.
 * Each word (or line) rises from below its own overflow-hidden mask.
 */
export default function RevealText({
  children,
  as: Tag = "p",
  className,
  splitBy = "word",
  delay = 0,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

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
      animate={inView ? "show" : "hidden"}
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
