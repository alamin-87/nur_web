import { NextResponse } from "next/server";
import { getCategories, getSubCategories, getCatalogProductLinks } from "@/lib/data";
import { PUBLIC_API_CACHE } from "@/lib/http-cache";
import { jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeProducts = url.searchParams.get("includeProducts") === "true";
    const categorySlug = url.searchParams.get("category") || undefined;
    const [categories, subcategories, products] = await Promise.all([
      getCategories("product"),
      getSubCategories(categorySlug),
      includeProducts ? getCatalogProductLinks(categorySlug) : Promise.resolve([]),
    ]);

    const productsBySubcategory = new Map<string, typeof products>();
    for (const product of products) {
      const sub = product.subCategory;
      if (!sub) continue;
      const keys = [sub._id, sub.slug];
      for (const key of keys) {
        const existing = productsBySubcategory.get(key) || [];
        existing.push(product);
        productsBySubcategory.set(key, existing);
      }
    }

    const tree: Record<
      string,
      {
        _id: string;
        name: string;
        slug: string;
        subcategories: Array<{
          _id: string;
          name: string;
          slug: string;
          products: Array<{
            _id: string;
            name: string;
            slug: string;
            image: string;
          }>;
        }>;
      }
    > = {};

    for (const cat of categories) {
      const catId = String(cat._id);
      const catSubs = subcategories.filter((s) => {
        const parentId =
          typeof s.category === "object" && s.category && "_id" in s.category
            ? String(s.category._id)
            : String(s.category);
        return parentId === catId;
      });

      tree[cat.slug] = {
        _id: catId,
        name: cat.name,
        slug: cat.slug,
        subcategories: catSubs.map((sub) => {
          const subId = String(sub._id);
          const subProds =
            productsBySubcategory.get(subId) ||
            productsBySubcategory.get(sub.slug) ||
            [];
          return {
            _id: subId,
            name: sub.name,
            slug: sub.slug,
            products: subProds.map((p) => ({
              _id: String(p._id),
              name: p.name,
              slug: p.slug,
              image:
                p.image ||
                "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
            })),
          };
        }),
      };
    }

    return NextResponse.json(
      { tree },
      {
        headers: {
          "Cache-Control": PUBLIC_API_CACHE,
        },
      }
    );
  } catch (err: unknown) {
    console.error("GET /api/catalog-tree error:", err);
    return jsonError("Failed to load catalog tree");
  }
}
