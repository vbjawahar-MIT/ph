"use client";

import { type SyntheticEvent } from "react";

type Props = {
  src: string;
  className?: string;
};

/**
 * Video card face. Uses the video element itself with `preload="metadata"`
 * so the browser paints the first frame as a poster automatically —
 * no separate thumbnail generation required. A translucent play button
 * sits on top to communicate that the tile opens a video, not a photo.
 */
export default function VideoThumbnail({ src, className }: Props) {
  const swallow = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      className={`relative h-full w-full select-none ${className ?? ""}`}
      onContextMenu={swallow}
      onDragStart={swallow}
      draggable={false}
    >
      <video
        src={src}
        preload="metadata"
        muted
        playsInline
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        className="pointer-events-none h-full w-full object-cover"
      />
      {/* Subtle darken gradient so the play icon reads on bright frames */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      {/* Play button */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md transition-transform duration-500 ease-expo group-hover:scale-110 md:h-16 md:w-16">
          <svg
            viewBox="0 0 24 24"
            className="ml-1 h-5 w-5 fill-white md:h-6 md:w-6"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
