import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import { getAllCategorySlugs } from "@/lib/categories";
import { getGalleryFor } from "@/lib/gallery";

type Params = { slug: string };

/**
 * `candid-videos` is served by its own dedicated static file
 * (`app/work/candid-videos/page.tsx`) because its media lives on
 * YouTube, not in the filesystem. Excluding it here prevents a route
 * collision — otherwise Next.js could serve either route depending
 * on host + build order, and the `[slug]` variant would render an
 * empty PhotoGrid ("no files yet") because the candid-videos folder
 * has no local files.
 */
const EXCLUDE_FROM_DYNAMIC_ROUTE = new Set(["candid-videos"]);

export async function generateStaticParams(): Promise<Params[]> {
  return getAllCategorySlugs()
    .filter((slug) => !EXCLUDE_FROM_DYNAMIC_ROUTE.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGalleryFor(slug);
  if (!g) return { title: "Not found — VB Photographe" };
  return {
    title: `${g.category.label} — VB Photographe`,
    description: `${g.category.label} work by VB Photographe. ${g.count} ${
      g.category.kind === "videos" ? "films" : "photographs"
    }.`,
  };
}

export default async function CategoryGalleryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  // Belt-and-braces: never let the dynamic route serve candid-videos.
  // The dedicated static page must always win.
  if (EXCLUDE_FROM_DYNAMIC_ROUTE.has(slug)) notFound();
  const gallery = getGalleryFor(slug);
  if (!gallery) notFound();

  const { category, items, count } = gallery;
  const isVideos = category.kind === "videos";

  return (
    <section className="px-6 pb-32 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1600px]">
        <p className="ui-label text-white/70">{category.label}</p>
        <h1
          className="mt-4 text-display font-bold lowercase tracking-display text-white"
          style={{ lineHeight: 0.9 }}
        >
          {category.tagline}
        </h1>
        <p className="ui-label mt-6 text-white/60">
          {count > 0
            ? `${count} ${isVideos ? "films" : "photographs"}`
            : "coming soon"}
        </p>

        <div className="mt-14 md:mt-16">
          <PhotoGrid
            items={items}
            columns={isVideos ? 2 : 3}
            priorityCount={4}
          />
        </div>
      </div>
    </section>
  );
}
