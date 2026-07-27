"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  videoId: string;
  title: string;
  /** Above-the-fold posters should preload — usually the first row. */
  priority?: boolean;
};

/**
 * Click-to-load YouTube embed.
 *
 * Design goals
 * ────────────
 *  • Match the site's card style (rounded-sm, subtle shadow, hover
 *    scale) so it slots into any grid alongside the other gallery
 *    cards without introducing a new visual language.
 *  • Don't ship 5 YouTube player iframes on initial page load —
 *    that's ~500 KB of scripts each. Render a static poster + play
 *    button; only mount the iframe when the visitor actually taps.
 *  • Use the privacy-preserving `youtube-nocookie.com` origin so a
 *    visitor who never plays is never tracked.
 *  • Respect keyboard + screen-reader users: the poster is a real
 *    `<button>` with an aria-label describing the video.
 */
export default function YouTubeEmbed({ videoId, title, priority }: Props) {
  const [play, setPlay] = useState(false);

  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const posterSrc = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-sm bg-black shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)] transition-shadow duration-700 ease-expo hover:shadow-[0_30px_80px_-25px_rgba(10,10,26,0.7)]">
      {play ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          data-cursor-label="play"
          aria-label={`Play video — ${title}`}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={posterSrc}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 768px) 45vw, 100vw"
            quality={85}
            className="object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
          />
          {/* Darken gradient so the play button reads on bright frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          {/* Play button */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md transition-transform duration-500 ease-expo group-hover:scale-110 md:h-20 md:w-20">
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-6 w-6 fill-white md:h-7 md:w-7"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
