"use client";

import Image, { type ImageProps } from "next/image";
import { type MouseEvent, type DragEvent, type SyntheticEvent } from "react";

type Props = Omit<ImageProps, "onContextMenu" | "onDragStart" | "onCopy"> & {
  /** Attach a subtle diagonal watermark overlay. */
  watermark?: boolean;
  /** Class applied to the wrapper (not the underlying <img>). */
  wrapperClassName?: string;
};

/**
 * The single component every gallery photograph should render through.
 *
 * Client-side protection layer (best-effort — no browser can truly stop
 * a determined user, but this blocks casual right-click / drag / copy):
 *   • disables the native context menu
 *   • blocks the image drag start
 *   • no text selection
 *   • pointerEvents on the underlying <img> disabled so the parent
 *     wrapper intercepts every gesture first
 *   • optional watermark overlay
 *
 * next/image gives us responsive srcset, WebP/AVIF negotiation, lazy
 * loading below the fold and blur placeholders for free.
 */
export default function ProtectedImage({
  watermark = false,
  wrapperClassName,
  className,
  ...imageProps
}: Props) {
  const swallow = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      className={`relative h-full w-full select-none ${wrapperClassName ?? ""}`}
      onContextMenu={swallow as (e: MouseEvent) => void}
      onDragStart={swallow as (e: DragEvent) => void}
      draggable={false}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <Image
        {...imageProps}
        draggable={false}
        onContextMenu={swallow as (e: MouseEvent<HTMLImageElement>) => void}
        onDragStart={swallow as (e: DragEvent<HTMLImageElement>) => void}
        className={`pointer-events-none ${className ?? ""}`}
      />
      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="rotate-[-24deg] whitespace-nowrap text-[6vw] font-bold uppercase tracking-widest text-white/[0.06]"
            style={{ letterSpacing: "0.5em" }}
          >
            VB Photographe
          </span>
        </div>
      )}
    </div>
  );
}
