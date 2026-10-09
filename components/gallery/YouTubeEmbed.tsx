"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  videoId: string;
  title: string;
  /** true → mount iframe, false → show poster + play button. */
  isActive?: boolean;
  /** Called when the user taps the poster. Parent uses this to
   *  guarantee only one iframe is mounted at a time. If omitted the
   *  component manages its own local state (backwards compatible). */
  onActivate?: () => void;
  /** Native <img> loading strategy for the poster. Default "lazy" —
   *  set "eager" when the grid wants posters loaded on first paint. */
  posterLoading?: "lazy" | "eager";
  /** fetchpriority hint for the poster. */
  posterFetchPriority?: "high" | "low" | "auto";
};

/**
 * Lite click-to-load YouTube embed — mobile-safe.
 *
 * Fixes applied in Phase 12:
 *   ▪ Embed URL now includes `mute=1`. iOS Safari refuses to
 *     autoplay unmuted media even after a user tap; muting keeps
 *     playback consistent across iOS + Android + desktop. The user
 *     can unmute inside YouTube's own controls.
 *   ▪ Poster uses maxresdefault.jpg (1280x720, ~100-170 KB) for a
 *     sharp, letterbox-free frame, falling back to hqdefault.jpg
 *     (480x360, always exists) if a video has no HD thumbnail.
 *   ▪ Native <img> + `loading="lazy"` + `decoding="async"` — avoids
 *     the next/image optimizer round-trip for a tiny YouTube thumb,
 *     and lazy-loads below-fold posters on scroll.
 *   ▪ `onError` fallback so a broken poster becomes a subtle gradient
 *     rather than a browser default "broken image" icon.
 *   ▪ Optional parent-managed `isActive` + `onActivate` — the parent
 *     coordinates so only one iframe is mounted at a time. Previous
 *     iframes unmount cleanly (releases memory, stops playback,
 *     drops network sockets).
 */
export default function YouTubeEmbed({
  videoId,
  title,
  isActive,
  onActivate,
  posterLoading = "lazy",
  posterFetchPriority = "auto",
}: Props) {
  // Fallback to local state when the parent doesn't manage activation.
  const [localPlay, setLocalPlay] = useState(false);
  const play = isActive ?? localPlay;

  // Full-HD poster (maxresdefault, 1280x720 — no letterbox bars), falling
  // back to hqdefault if a video has no HD thumbnail, then to a gradient.
  const [posterStage, setPosterStage] = useState<0 | 1 | 2>(0);
  const posterErrored = posterStage === 2;
  const posterSrc = `https://i.ytimg.com/vi/${videoId}/${
    posterStage === 0 ? "maxresdefault" : "hqdefault"
  }.jpg`;

  // mute=1 → iOS Safari autoplay works. rel=0 → no unrelated videos
  // in the "up next". modestbranding=1 → hides most YouTube chrome.
  // playsinline=1 → stays inline on mobile Safari (no fullscreen jump).
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;

  const handleActivate = () => {
    if (onActivate) onActivate();
    else setLocalPlay(true);
  };

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-soft transition-shadow duration-700 ease-expo hover:shadow-lift">
      {play ? (
        <iframe
          key={videoId}
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={handleActivate}
          data-cursor-label="play"
          aria-label={`Play video — ${title}`}
          className="absolute inset-0 h-full w-full touch-manipulation"
        >
          {posterErrored ? (
            // Neutral gradient placeholder — matches site's dark aesthetic.
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[#2a2216] via-[#0b0b0b] to-[#1c1a17]"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={posterSrc}
              alt=""
              loading={posterLoading}
              decoding="async"
              fetchPriority={posterFetchPriority}
              onError={() => setPosterStage((s) => (s === 0 ? 1 : 2))}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
            />
          )}
          {/* Darken gradient so the play button reads on bright frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          {/* Play button — tap target is the whole button, this is visual only */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-md transition-all duration-500 ease-expo group-hover:scale-110 group-hover:border-gold group-hover:bg-gold md:h-20 md:w-20">
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-6 w-6 fill-white transition-colors duration-500 group-hover:fill-[#0b0b0b] md:h-7 md:w-7"
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
