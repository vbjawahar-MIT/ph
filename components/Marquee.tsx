"use client";

type Props = {
  items: string[];
  gradient?: boolean;
};

export default function Marquee({ items, gradient = true }: Props) {
  // Duplicate items so the -50% translate produces a seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-16">
      <div className="marquee-track flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`mx-8 text-display font-bold lowercase tracking-display ${
              gradient ? "text-white" : "text-white/80"
            }`}
            style={{ lineHeight: 0.95 }}
            aria-hidden={i >= items.length}
          >
            {item}
            <span className="mx-8 inline-block align-middle text-white/40">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
