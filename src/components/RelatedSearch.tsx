import Link from "next/link";
import {
  getCategories,
  getFeatures,
  getServices,
  getSubCategories,
  getUseCases,
} from "@/lib/data";
import { buildRelatedSearchLinks } from "@/lib/related-search";

export async function RelatedSearch({
  currentHref,
  categorySlug,
  subcategorySlug,
}: {
  currentHref: string;
  categorySlug?: string;
  subcategorySlug?: string;
}) {
  const [categories, subcategories, features, services, useCases] = await Promise.all([
    getCategories("product"),
    getSubCategories(),
    getFeatures(),
    getServices(),
    getUseCases(),
  ]);

  const links = buildRelatedSearchLinks({
    currentHref,
    categorySlug,
    subcategorySlug,
    categories,
    subcategories,
    features,
    services,
    useCases,
  });

  if (!links.length) return null;

  return (
    <section className="mt-3 border-t border-line pt-2 pb-1">
      <h2 className="mb-1.5 font-display text-[12px] font-bold uppercase tracking-wider text-navy">
        Related Search
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex max-w-full items-center rounded-full border border-line bg-white px-2.5 py-0.5 text-[11.5px] font-medium leading-5 text-navy transition hover:border-orange hover:text-orange"
          >
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
