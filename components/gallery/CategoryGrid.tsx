import CategoryCard from "./CategoryCard";
import type { CategorySummary } from "@/lib/gallery";

type Props = {
  categories: CategorySummary[];
  /** Above-the-fold cover priority — usually the first row. */
  priorityCount?: number;
};

const SIZES = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw";

/**
 * Grid of six category cards. Same responsive behaviour as PhotoGrid
 * (3-col desktop, 2-col tablet, 1-col mobile) so /work and the home
 * Featured section share their layout DNA.
 */
export default function CategoryGrid({ categories, priorityCount = 0 }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
      {categories.map((c, i) => (
        <CategoryCard
          key={c.category.slug}
          summary={c}
          priority={i < priorityCount}
          sizes={SIZES}
        />
      ))}
    </div>
  );
}
