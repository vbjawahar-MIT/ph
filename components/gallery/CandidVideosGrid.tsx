"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import YouTubeEmbed from "./YouTubeEmbed";

type Grid = HTMLDivElement | null;

type Props = {
  videoIds: readonly string[];
  categoryLabel: string;
};

/**
 * Grid wrapper that guarantees only ONE video iframe is mounted at a
 * time. When the visitor plays a new video, the previous iframe
 * unmounts — pauses playback, releases the network stream, and
 * reclaims memory on mobile.
 *
 * When the active video's tile scrolls far out of view (>80% out
 * of the viewport), the iframe also unmounts so the video doesn't
 * keep loading behind the fold. That's the single biggest battery
 * saver on mobile.
 */
export default function CandidVideosGrid({ videoIds, categoryLabel }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<Grid>(null);

  const activate = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // If the active video scrolls out of view, unmount it.
  useEffect(() => {
    if (!activeId) return;
    const root = rootRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-video-id="${activeId}"]`
    );
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && entry.intersectionRatio === 0) {
            setActiveId(null);
          }
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeId]);

  return (
    <div
      ref={rootRef}
      className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10"
    >
      {videoIds.map((id, i) => (
        <div key={id} data-video-id={id}>
          <YouTubeEmbed
            videoId={id}
            title={`${categoryLabel} — film ${i + 1}`}
            isActive={activeId === id}
            onActivate={() => activate(id)}
          />
        </div>
      ))}
    </div>
  );
}
