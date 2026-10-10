/**
 * Four-up stats row for the About page — light cards with a gold line
 * icon, serif number and small-caps label.
 */

type IconName = "camera" | "heart" | "rings" | "spark";

const STATS: { value: string; label: string; icon: IconName }[] = [
  { value: "10+", label: "Years experience", icon: "camera" },
  { value: "50+", label: "Happy clients", icon: "heart" },
  { value: "50+", label: "Weddings covered", icon: "rings" },
  { value: "50+", label: "Events completed", icon: "spark" },
];

export default function StatsRow() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {STATS.map((s, i) => (
        <li
          key={s.label}
          data-reveal
          style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          className="group rounded-2xl border border-line/10 bg-card p-6 text-center shadow-soft transition-all duration-500 ease-expo hover:-translate-y-1 hover:shadow-lift md:p-8"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 text-accent transition-colors duration-500 group-hover:border-accent">
            <StatIcon name={s.icon} />
          </span>
          <p
            className="mt-5 font-serif text-4xl font-medium text-ink md:text-5xl"
            style={{ lineHeight: 1 }}
          >
            {s.value}
          </p>
          <p className="ui-label mt-3 text-ink/55">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}

function StatIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "camera":
      return (
        <svg {...common}>
          <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.4-2h7.6l1.4 2h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
        </svg>
      );
    case "rings":
      return (
        <svg {...common}>
          <circle cx="9" cy="14" r="5" />
          <circle cx="15" cy="14" r="5" />
          <path d="M10.5 5.5 12 4l1.5 1.5L12 7z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
        </svg>
      );
  }
}
