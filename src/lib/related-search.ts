import type { ICategory, IFeature, ISubCategory, IUseCase } from "@/lib/models";
import type { PopulatedService } from "@/lib/data";

export type RelatedSearchLink = { href: string; label: string };

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function featureSearchHref(feat: IFeature, categories: ICategory[]) {
  const slug = (feat.slug || "").toLowerCase();
  const name = norm(feat.name);

  const bySlug = categories.find((c) => {
    const cs = c.slug.toLowerCase();
    return slug === cs || slug.startsWith(`${cs}-`) || cs.startsWith(`${slug}-`);
  });
  if (bySlug) return `/products?category=${encodeURIComponent(bySlug.slug)}`;

  const byName = categories.find((c) => {
    const cn = norm(c.name);
    return cn === name || name.startsWith(cn) || cn.startsWith(name);
  });
  if (byName) return `/products?category=${encodeURIComponent(byName.slug)}`;

  const q = feat.slug || feat.name;
  return `/products?q=${encodeURIComponent(q)}`;
}

function parentCategorySlug(sub: ISubCategory, categories: ICategory[]) {
  const raw = sub.category as unknown;
  if (raw && typeof raw === "object" && "slug" in raw) {
    return String((raw as { slug: string }).slug);
  }
  const id = String(raw || "");
  return categories.find((c) => String(c._id) === id || c.slug === id)?.slug;
}

export function buildRelatedSearchLinks(opts: {
  currentHref: string;
  categorySlug?: string;
  subcategorySlug?: string;
  categories: ICategory[];
  subcategories: ISubCategory[];
  features: IFeature[];
  services: PopulatedService[];
  useCases?: IUseCase[];
}): RelatedSearchLink[] {
  const links: RelatedSearchLink[] = [];
  const { categorySlug, subcategorySlug, categories, subcategories, features, services, useCases } =
    opts;

  const currentCat = categories.find((c) => c.slug === categorySlug);

  if (currentCat) {
    links.push({
      href: `/products?category=${encodeURIComponent(currentCat.slug)}`,
      label: currentCat.name,
    });
  }

  const currentSubs = subcategories.filter((s) => {
    const parent = parentCategorySlug(s, categories);
    return categorySlug ? parent === categorySlug : true;
  });
  const otherSubs = subcategories.filter((s) => {
    const parent = parentCategorySlug(s, categories);
    return categorySlug ? parent !== categorySlug : false;
  });

  for (const sub of [...currentSubs, ...otherSubs]) {
    if (subcategorySlug && sub.slug === subcategorySlug) continue;
    const parent = parentCategorySlug(sub, categories);
    if (!parent) continue;
    links.push({
      href: `/products?category=${encodeURIComponent(parent)}&subcategory=${encodeURIComponent(sub.slug)}`,
      label: sub.name,
    });
  }

  for (const cat of categories) {
    if (cat.slug === categorySlug) continue;
    links.push({
      href: `/products?category=${encodeURIComponent(cat.slug)}`,
      label: cat.name,
    });
  }

  for (const feat of features) {
    if (!feat.name) continue;
    links.push({
      href: featureSearchHref(feat, categories),
      label: feat.name,
    });
  }

  for (const svc of services) {
    if (!svc.slug) continue;
    links.push({ href: `/services/${svc.slug}`, label: svc.title });
  }

  for (const item of useCases || []) {
    if (!item.slug) continue;
    links.push({ href: `/use-cases/${item.slug}`, label: item.title });
  }

  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link.href || !link.label) return false;
    if (link.href === opts.currentHref) return false;
    const key = link.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
