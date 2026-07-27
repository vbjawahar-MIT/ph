/**
 * Four-up stats row for the About page. Numbers are the visual anchor;
 * labels are the site's standard ui-label style. Uses only existing
 * design tokens (white text on the gradient body, white-alpha borders).
 */

const STATS = [
  { value: "10+", label: "Years experience" },
  { value: "100+", label: "Happy clients" },
  { value: "100+", label: "Weddings covered" },
  { value: "100+", label: "Events completed" },
];

export default function StatsRow() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {STATS.map((s) => (
        <li
          key={s.label}
          className="rounded-sm border border-white/15 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-500 ease-expo hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.08] md:p-8"
        >
          <p
            className="text-4xl font-bold lowercase tracking-display text-white md:text-5xl"
            style={{ lineHeight: 1 }}
          >
            {s.value}
          </p>
          <p className="ui-label mt-3 text-white/60">{s.label}</p>
        </li>
      ))}
    </ul>
  );
}
