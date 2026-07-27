import type { Metadata } from "next";
import CategoryGrid from "@/components/gallery/CategoryGrid";
import { getAllCategorySummaries } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Work — VB Photographe",
  description:
    "Selected bridal, groom, candid, baby, pre-wedding and traditional work.",
};

export default function WorkPage() {
  const summaries = getAllCategorySummaries();

  return (
    <section className="px-6 pb-32 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1600px]">
        <p className="ui-label text-white/70">The archive</p>
        <h1
          className="mt-4 text-display font-bold lowercase tracking-display text-white"
          style={{ lineHeight: 0.9 }}
        >
          <span>selected </span>
          <span className="text-white/70">work</span>
        </h1>

        <div className="mt-14 md:mt-16">
          <CategoryGrid categories={summaries} priorityCount={3} />
        </div>
      </div>
    </section>
  );
}
