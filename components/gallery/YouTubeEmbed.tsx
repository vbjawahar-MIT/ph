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
 *   ▪ Poster switched from maxresdefault.jpg (1280x720, 100-200 KB)
 *     to hqdefault.jpg (480x360, ~40 KB) — plenty for the 45vw
 *     desktop / 100vw mobile display area, and always exists for
 *     every YouTube video.
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

  const [posterErrored, setPosterErrored] = useState(false);
  const posterSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  // mute=1 → iOS Safari autoplay works. rel=0 → no unrelated videos
  // in the "up next". modestbranding=1 → hides most YouTube chrome.
  // playsinline=1 → stays inline on mobile Safari (no fullscreen jump).
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;

  const handleActivate = () => {
    if (onActivate) onActivate();
    else setLocalPlay(true);
  };

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-sm bg-black shadow-[0_20px_60px_-30px_rgba(10,10,26,0.5)] transition-shadow duration-700 ease-expo hover:shadow-[0_30px_80px_-25px_rgba(10,10,26,0.7)]">
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
              className="absolute inset-0 bg-gradient-to-br from-[#1a2eb8] via-[#3554ff] to-[#a14dff]"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={posterSrc}
              alt=""
              loading={posterLoading}
              decoding="async"
              fetchPriority={posterFetchPriority}
              onError={() => setPosterErrored(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
            />
          )}
          {/* Darken gradient so the play button reads on bright frames */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          {/* Play button — tap target is the whole button, this is visual only */}
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
