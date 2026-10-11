import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/Img";
import { RelatedSearch } from "@/components/RelatedSearch";
import { Pagination } from "@/components/Pagination";
import {
  getBlogPosts,
  getBlogPostsTotalCount,
  getBlogCategories,
  getSettings,
  type PopulatedBlogPost,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Engineering Blog & Technical Guides | Nur Engineering Solution",
  description:
    "Practical industrial automation, PLC, VFD, sensors, motors and electrical maintenance guides written by electrical engineering practitioners in Bangladesh.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
const BLOG_PAGE_SIZE = 12;

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category: selectedCategory, page: pageParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam) || 1));
  const [posts, categories, site, totalPosts] = await Promise.all([
    getBlogPosts({ categorySlug: selectedCategory, page, limit: BLOG_PAGE_SIZE }),
    getBlogCategories(),
    getSettings(),
    getBlogPostsTotalCount({ categorySlug: selectedCategory }),
  ]);
  const wa = (site.social?.whatsapp || site.phone || "").replace(/[^\d]/g, "");

  const featuredPost = page === 1 ? posts.find((p) => p.featured) || posts[0] : undefined;
  const gridPosts = featuredPost
    ? posts.filter((p) => p.slug !== featuredPost.slug)
    : posts;

  return (
    <div className="bg-paper min-h-screen py-8 sm:py-10">
      <div className="container-page space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center gap-2 text-xs text-steel">
            <Link href="/" className="hover:text-orange transition">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-navy">Blog</span>
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-navy">
            Technical Blog &amp; Engineering Guides
          </h1>
          <p className="mt-2 max-w-3xl text-xs sm:text-sm text-steel leading-relaxed">
            Hands-on technical insights, parameter optimization, PLC programming, VFD sizing, and preventative machine maintenance advice from our engineering desk.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              !selectedCategory
                ? "bg-navy text-white shadow-xs"
                : "border border-line bg-white text-navy hover:border-orange hover:text-orange"
            }`}
          >
            All Articles
          </Link>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <Link
                key={cat._id}
                href={`/blog?category=${cat.slug}`}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "bg-orange text-white shadow-xs"
                    : "border border-line bg-white text-navy hover:border-orange hover:text-orange"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Featured Article Card (if not filtered or available) */}
        {featuredPost && !selectedCategory && (
          <article className="group relative overflow-hidden rounded border border-line bg-white shadow-xs transition hover:border-orange/60 lg:grid lg:grid-cols-12">
            <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 bg-navy overflow-hidden">
              <Img
                src={
                  featuredPost.coverImage ||
                  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80"
                }
                alt={featuredPost.title}
                fill
                priority
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              <div className="absolute top-4 left-4">
                <span className="rounded bg-orange px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Featured Guide
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-steel">
                  <span className="text-orange uppercase font-bold tracking-wider">
                    {typeof featuredPost.category === "object"
                      ? featuredPost.category?.name
                      : "Automation"}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(featuredPost.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold uppercase leading-snug text-navy group-hover:text-orange transition">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-steel leading-relaxed line-clamp-4">
                  {featuredPost.summary}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-line/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-mist">
                  By {featuredPost.author || "Nur Engineering Desk"}
                </span>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="btn-orange px-4 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  Read Article →
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Blog Post Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h3 className="font-display text-base font-bold uppercase tracking-wider text-navy">
              {selectedCategory
                ? `Articles in ${
                    categories.find((c) => c.slug === selectedCategory)?.name ||
                    "Category"
                  }`
                : "Latest Technical Articles"}
            </h3>
            <span className="text-xs font-semibold text-mist">
              {totalPosts} {totalPosts === 1 ? "article" : "articles"}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded border border-line bg-white p-12 text-center">
              <p className="font-display text-base font-bold uppercase text-navy">
                No articles found in this category
              </p>
              <p className="mt-1 text-xs text-steel">
                Please browse our other engineering topics or view all articles.
              </p>
              <Link
                href="/blog"
                className="btn-navy mt-4 inline-block px-4 py-2 text-xs font-bold uppercase"
              >
                View All Articles
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(selectedCategory ? posts : gridPosts).map((post) => {
                const catName =
                  typeof post.category === "object"
                    ? post.category?.name
                    : "Engineering";

                return (
                  <article
                    key={String(post._id)}
                    className="group flex flex-col justify-between overflow-hidden rounded border border-line bg-white shadow-2xs transition hover:border-orange/60 hover:shadow-md"
                  >
                    <div>
                      {/* Card Thumbnail */}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="relative block aspect-[16/10] overflow-hidden bg-paper/60"
                      >
                        <Img
                          src={
                            post.coverImage ||
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80"
                          }
                          alt={post.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className="rounded bg-navy/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                            {catName}
                          </span>
                        </div>
                      </Link>

                      {/* Card Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[10.5px] font-semibold text-mist">
                          <span>
                            {new Date(post.createdAt || Date.now()).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <h4 className="mt-2 font-display text-sm sm:text-base font-bold uppercase leading-snug text-navy group-hover:text-orange transition line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h4>

                        <p className="mt-2 text-xs text-steel leading-relaxed line-clamp-3">
                          {post.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-line/60 p-5 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-mist truncate max-w-[150px]">
                        {post.author || "Nur Engineering"}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-display text-xs font-bold uppercase tracking-wider text-orange hover:text-navy transition flex items-center gap-1"
                      >
                        <span>Read More</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalPosts / BLOG_PAGE_SIZE)}
          basePath="/blog"
          queryParams={{ category: selectedCategory }}
        />

        {/* Bottom Contact / Engineering Support Callout */}
        <div className="rounded border border-line bg-navy p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="kicker text-orange">Engineering Support Desk</span>
              <h3 className="mt-2 font-display text-lg sm:text-xl font-bold uppercase text-white">
                Need on-site troubleshooting or PLC / VFD sizing assistance?
              </h3>
              <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                Our team provides physical diagnosis, parameter configuration, panel retrofitting and genuine replacement components across Bangladesh.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="btn-orange px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Contact Engineering Desk
              </Link>
              <a
                href={wa ? `https://wa.me/${wa}` : "/contact"}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-navy transition"
              >
                WhatsApp Direct ↗
              </a>
            </div>
          </div>
        </div>
        <RelatedSearch currentHref="/blog" />
      </div>
    </div>
  );
}
