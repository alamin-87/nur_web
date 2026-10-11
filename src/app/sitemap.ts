import type { MetadataRoute } from "next";
import { getProductSlugs, getServiceSlugs, getUseCaseSlugs } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/use-cases",
    "/services",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/products" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const [products, services, useCases] = await Promise.all([
      getProductSlugs(),
      getServiceSlugs(),
      getUseCaseSlugs(),
    ]);
    return [
      ...staticEntries,
      ...products.map((p) => ({
        url: `${base}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...services.map((s) => ({
        url: `${base}/services/${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
      ...useCases.map((item) => ({
        url: `${base}/use-cases/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
