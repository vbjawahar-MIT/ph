"use client";

type Props = {
  items: string[];
  gradient?: boolean;
};

export default function Marquee({ items, gradient = true }: Props) {
  // Duplicate items so the -50% translate produces a seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line/10 py-10 md:py-14">
      <div className="marquee-track flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`mx-6 font-serif text-[clamp(2rem,4.5vw,3.75rem)] italic tracking-serif md:mx-10 ${
              gradient ? "text-ink" : "text-ink/80"
            }`}
            style={{ lineHeight: 1.1 }}
            aria-hidden={i >= items.length}
          >
            {item}
            <span className="ml-12 inline-block align-middle text-base not-italic text-accent md:ml-20">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
