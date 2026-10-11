import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Img } from "@/components/Img";
import { RelatedSearch } from "@/components/RelatedSearch";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
  getBlogPosts,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Article Not Found | Nur Engineering Solution" };
  }
  return {
    title: `${post.title} | Nur Engineering Blog`,
    description: post.summary,
  };
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const categorySlug =
    typeof post.category === "object" ? post.category?.slug : undefined;
  const categoryName =
    typeof post.category === "object"
      ? post.category?.name
      : "Industrial Automation";

  const relatedPosts = await getRelatedBlogPosts(post.slug, categorySlug, 3);

  // Helper to render markdown-formatted content nicely
  const renderFormattedContent = (raw: string) => {
    const lines = raw.split("\n");
    const elements: React.ReactNode[] = [];

    let inList = false;
    let listItems: string[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${key}`}
            className="my-4 space-y-2 pl-5 list-disc text-steel text-xs sm:text-sm leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx}>
                {item.split("**").map((part, pIdx) =>
                  pIdx % 2 === 1 ? (
                    <strong key={pIdx} className="text-navy font-bold">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("### ")) {
        flushList(index);
        elements.push(
          <h3
            key={index}
            className="mt-6 mb-2 font-display text-base sm:text-lg font-bold uppercase tracking-wide text-navy"
          >
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        flushList(index);
        elements.push(
          <h2
            key={index}
            className="mt-8 mb-3 font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy border-b border-line pb-2"
          >
            {trimmed.replace("## ", "")}
          </h2>
        );
      } else if (trimmed.startsWith("#### ")) {
        flushList(index);
        elements.push(
          <h4
            key={index}
            className="mt-4 mb-1 font-display text-sm font-bold uppercase tracking-wide text-orange"
          >
            {trimmed.replace("#### ", "")}
          </h4>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
      } else if (trimmed.length > 0) {
        flushList(index);
        elements.push(
          <p
            key={index}
            className="my-3 text-xs sm:text-sm leading-relaxed text-steel"
          >
            {trimmed.split("**").map((part, pIdx) =>
              pIdx % 2 === 1 ? (
                <strong key={pIdx} className="text-navy font-bold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    });

    flushList(lines.length);
    return elements;
  };

  return (
    <div className="bg-paper min-h-screen py-8 sm:py-10">
      <div className="container-page space-y-10">
        {/* Breadcrumb Header */}
        <nav className="flex items-center gap-2 text-xs text-steel">
          <Link href="/" className="hover:text-orange transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-orange transition">
            Blog
          </Link>
          <span>/</span>
          <span className="truncate max-w-xs font-semibold text-navy">
            {post.title}
          </span>
        </nav>

        {/* Main Article Section */}
        <article className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Article Main Column */}
          <div className="space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href={`/blog?category=${categorySlug}`}
                  className="rounded bg-orange px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-white shadow-xs"
                >
                  {categoryName}
                </Link>
                <span className="text-steel">•</span>
                <span className="text-steel font-medium">
                  {new Date(post.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {post.readTime && (
                  <>
                    <span className="text-steel">•</span>
                    <span className="text-steel font-medium">{post.readTime}</span>
                  </>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-snug tracking-tight text-navy">
                {post.title}
              </h1>

              <div className="flex items-center gap-3 border-y border-line py-3 text-xs text-steel">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white uppercase">
                  NES
                </div>
                <div>
                  <p className="font-bold text-navy">
                    {post.author || "Nur Engineering Desk"}
                  </p>
                  <p className="text-[10px] text-mist">
                    Electrical &amp; Industrial Automation Division
                  </p>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded border border-line bg-white shadow-xs">
              <Img
                src={
                  post.coverImage ||
                  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80"
                }
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 800px, 100vw"
              />
            </div>

            {/* Excerpt Lead */}
            <div className="rounded border-l-4 border-orange bg-white p-4 sm:p-5 shadow-2xs">
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-navy italic">
                {post.summary}
              </p>
            </div>

            {/* Article Body Content */}
            <div className="rounded border border-line bg-white p-6 sm:p-8 shadow-xs">
              <div className="article-body">
                {renderFormattedContent(post.content)}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-line">
                  <p className="text-xs font-bold uppercase tracking-wider text-navy mb-2">
                    Related Topics:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-semibold text-steel"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share & Support Action Box */}
            <div className="rounded border border-line bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-sm font-bold uppercase text-navy">
                  Need Help Applying This Solution?
                </h4>
                <p className="text-xs text-steel mt-0.5">
                  Consult with an engineer on wiring diagrams or component selection.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/contact"
                  className="btn-orange px-4 py-2 text-xs font-bold uppercase"
                >
                  Contact Desk
                </Link>
                <a
                  href="https://wa.me/880170000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-navy px-4 py-2 text-xs font-bold uppercase"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Consultation Widget */}
            <div className="rounded border border-line bg-navy p-6 text-white shadow-xs">
              <span className="kicker text-orange">Technical Service</span>
              <h3 className="mt-2 font-display text-base font-bold uppercase text-white">
                Machine Spares &amp; Diagnosis
              </h3>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                We supply PLC, VFDs, Sensors, Contactors and provide on-site calibration across Bangladesh.
              </p>
              <div className="mt-5 space-y-2.5 text-xs">
                <p className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+880 1700-000000</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>info@nurengineering.com</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Dhaka, Bangladesh</span>
                </p>
              </div>
              <Link
                href="/contact"
                className="btn-orange mt-5 block w-full py-2 text-center text-xs font-bold uppercase tracking-wider"
              >
                Request Quotation
              </Link>
            </div>

            {/* Back to Blog Listing */}
            <div className="rounded border border-line bg-white p-5 shadow-xs text-center">
              <Link
                href="/blog"
                className="font-display text-xs font-bold uppercase tracking-wider text-orange hover:text-navy transition block"
              >
                ← Back to All Articles
              </Link>
            </div>
          </aside>
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-line">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-navy">
                Related Engineering Guides
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold uppercase tracking-wider text-orange hover:underline"
              >
                View All Guides →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => {
                const rCat =
                  typeof related.category === "object"
                    ? related.category?.name
                    : "Engineering";

                return (
                  <article
                    key={String(related._id)}
                    className="group flex flex-col justify-between overflow-hidden rounded border border-line bg-white shadow-2xs transition hover:border-orange/60 hover:shadow-md"
                  >
                    <div>
                      <Link
                        href={`/blog/${related.slug}`}
                        className="relative block aspect-[16/10] overflow-hidden bg-paper/60"
                      >
                        <Img
                          src={
                            related.coverImage ||
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80"
                          }
                          alt={related.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className="rounded bg-navy/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            {rCat}
                          </span>
                        </div>
                      </Link>

                      <div className="p-4">
                        <h4 className="font-display text-xs sm:text-sm font-bold uppercase leading-snug text-navy group-hover:text-orange transition line-clamp-2">
                          <Link href={`/blog/${related.slug}`}>
                            {related.title}
                          </Link>
                        </h4>
                        <p className="mt-1.5 text-[11px] text-steel leading-relaxed line-clamp-2">
                          {related.summary}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-line/60 p-4 pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-mist">
                        {new Date(related.createdAt || Date.now()).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                      <Link
                        href={`/blog/${related.slug}`}
                        className="font-display text-[11px] font-bold uppercase tracking-wider text-orange hover:text-navy transition"
                      >
                        Read →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        <RelatedSearch currentHref={`/blog/${post.slug}`} />
      </div>
    </div>
  );
}
