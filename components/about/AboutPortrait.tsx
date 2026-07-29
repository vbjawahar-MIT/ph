"use client";

import { type SyntheticEvent } from "react";
import {
  ABOUT_PORTRAIT_ALT,
  ABOUT_PORTRAIT_DATA_URI,
} from "@/lib/about-portrait";

/**
 * About page portrait, rendered inline from a base64 data URI so no
 * file path under `/public` or `/assets` is exposed. Client-side
 * protections match the ProtectedImage pattern used elsewhere:
 *
 *   ▪ Native context menu blocked on the image + wrapper
 *   ▪ Drag start blocked at both element and event level
 *   ▪ Text + image selection disabled via CSS
 *   ▪ `draggable={false}` attribute on the underlying <img>
 *   ▪ `pointer-events: none` on the <img> so the wrapper intercepts
 *     every gesture first — casual "save as" / middle-click routes
 *     never see the image element directly
 *
 * These stop casual copying. No browser-based technique fully
 * prevents a determined user from screenshotting or dumping the
 * decoded data URI from devtools — that's an accepted limit.
 */
export default function AboutPortrait() {
  const swallow = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      className="relative h-full w-full select-none"
      onContextMenu={swallow}
      onDragStart={swallow}
      onDrop={swallow}
      draggable={false}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ABOUT_PORTRAIT_DATA_URI}
        alt={ABOUT_PORTRAIT_ALT}
        draggable={false}
        onContextMenu={swallow}
        onDragStart={swallow}
        onDrop={swallow}
        className="pointer-events-none h-full w-full object-cover"
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />
    </div>
  );
}
