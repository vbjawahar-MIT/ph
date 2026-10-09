/**
 * Filters for the /work portfolio. Each filter draws on one or more
 * existing gallery categories (slugs from lib/categories.ts); a category
 * can appear under several filters. Edit labels or groupings here —
 * the page reads only from this list.
 *
 * "All" is implicit and always first.
 */

export type PortfolioFilter = {
  id: string;
  label: string;
  categories: string[];
};

export const PORTFOLIO_FILTERS: PortfolioFilter[] = [
  {
    id: "wedding",
    label: "Wedding",
    categories: ["couple-portrait", "bridal-portraits", "groom-portraits"],
  },
  { id: "pre-wedding", label: "Pre-Wedding", categories: ["pre-wedding"] },
  { id: "bridal", label: "Bridal", categories: ["bridal-portraits"] },
  { id: "groom", label: "Groom", categories: ["groom-portraits"] },
  { id: "couple", label: "Couple", categories: ["couple-portrait"] },
  // Family functions: puberty ceremonies and baby showers.
  { id: "events", label: "Events", categories: ["puberty", "baby-shower"] },
  // The Baby Shower gallery holds the maternity shoots too.
  { id: "maternity", label: "Maternity", categories: ["baby-shower"] },
  { id: "baby", label: "Baby", categories: ["baby-shoot"] },
  { id: "puberty", label: "Puberty", categories: ["puberty"] },
  { id: "traditional", label: "Traditional", categories: ["traditional"] },
  { id: "films", label: "Films", categories: ["candid-videos"] },
];
