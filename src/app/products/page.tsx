import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { ProductCard } from "@/components/ProductCard";
import { SubCategoryBar } from "@/components/SubCategoryBar";
import { RelatedSearch } from "@/components/RelatedSearch";
import { Pagination } from "@/components/Pagination";
import {
  getCategories,
  getSubCategories,
  getProducts,
  getProductsTotalCount,
  getSettings,
} from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const PRODUCT_PAGE_SIZE = 20;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const site = await getSettings();
  const title = sp.q
    ? `Search: ${sp.q}`
    : sp.subcategory
      ? sp.subcategory.replace(/-/g, " ")
      : sp.category
        ? sp.category.replace(/-/g, " ")
        : "Products";
  return buildPageMetadata({
    site,
    title,
    description: "Industrial machine parts catalog — PLC, motors, VFD, sensors and spares.",
    path: "/products",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  const filters = {
    categorySlug: sp.category,
    subCategorySlug: sp.subcategory,
    q: sp.q,
  };
  const [categories, subcategories, products, totalProducts] = await Promise.all([
    getCategories("product"),
    sp.category ? getSubCategories(sp.category) : Promise.resolve([]),
    getProducts({
      ...filters,
      page,
      limit: PRODUCT_PAGE_SIZE,
    }),
    getProductsTotalCount(filters),
  ]);

  const activeCategory = categories.find((c) => c.slug === sp.category);
  const activeSubCategory = subcategories.find((s) => s.slug === sp.subcategory);

  const heading = sp.q
    ? `Search results for “${sp.q}”`
    : activeSubCategory
      ? `${activeCategory?.name || ""} → ${activeSubCategory.name}`
      : activeCategory
        ? activeCategory.name
        : "All products";

  return (
    <CatalogShell categories={categories} activeSlug={sp.category}>
      {/* Horizontal Sub-Category Navigation Bar */}
      {activeCategory && subcategories.length > 0 && (
        <SubCategoryBar
          categorySlug={activeCategory.slug}
          categoryName={activeCategory.name}
          subcategories={subcategories}
          activeSubSlug={sp.subcategory}
        />
      )}

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="section-label">{heading}</div>
          {activeCategory?.description && !sp.subcategory && (
            <p className="-mt-2 mb-1 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-steel">
              {activeCategory.description}
            </p>
          )}
        </div>
        <p className="pb-1 font-display text-[12px] uppercase tracking-[0.16em] text-mist shrink-0">
          {String(totalProducts).padStart(2, "0")} items
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={String(product._id)} product={product} />
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(totalProducts / PRODUCT_PAGE_SIZE)}
        basePath="/products"
        queryParams={{
          category: sp.category,
          subcategory: sp.subcategory,
          q: sp.q,
        }}
      />

      <RelatedSearch
        currentHref={
          sp.subcategory && sp.category
            ? `/products?category=${sp.category}&subcategory=${sp.subcategory}`
            : sp.category
              ? `/products?category=${sp.category}`
              : "/products"
        }
        categorySlug={sp.category}
        subcategorySlug={sp.subcategory}
      />

      {!products.length && (
        <div className="border border-line bg-white p-8 text-center text-sm text-steel rounded-[2px]">
          <p className="font-bold text-navy text-sm sm:text-base">No parts currently available in this category.</p>
          <p className="mt-1 text-xs text-mist">Try selecting another sub-category or send us an inquiry on our contact page.</p>
        </div>
      )}
    </CatalogShell>
  );
}
