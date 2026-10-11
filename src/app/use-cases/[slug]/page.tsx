import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogShell } from "@/components/CatalogShell";
import { Img } from "@/components/Img";
import { ProductCard } from "@/components/ProductCard";
import { ServiceCard } from "@/components/ServiceCard";
import { RelatedSearch } from "@/components/RelatedSearch";
import {
  getCategories,
  getProducts,
  getServiceBySlug,
  getUseCaseBySlug,
  getUseCases,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getUseCaseBySlug(slug);
  if (!item) return { title: "Our Services" };
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getUseCaseBySlug(slug);
  if (!item) {
    const svc = await getServiceBySlug(slug);
    if (svc) {
      redirect(`/services/${encodeURIComponent(svc.slug || slug)}`);
    }
    redirect("/use-cases");
  }

  const categorySlugs = [...new Set(item.bom.map((row) => row.categorySlug))];
  const [categories, allUseCases, ...productSets] = await Promise.all([
    getCategories("product"),
    getUseCases(),
    ...categorySlugs.map((cat) => getProducts({ categorySlug: cat, limit: 2 })),
  ]);

  const relatedProducts = productSets.flat().slice(0, 4);
  const relatedServices = (
    await Promise.all(item.relatedServiceSlugs.map((s) => getServiceBySlug(s)))
  ).filter((s) => s !== null);
  const others = allUseCases.filter((entry) => entry.slug !== item.slug);

  return (
    <CatalogShell categories={categories} showSearch={false}>
      <article className="overflow-hidden border border-line bg-white">
        <div className="relative h-56 md:h-72">
          <Img
            src={item.image}
            alt={item.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy/55" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-bright">
              Use case · {item.industry}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold uppercase leading-tight text-white md:text-4xl">
              {item.title}
            </h1>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.4fr_.8fr]">
          <div className="space-y-8 p-6 md:p-8">
            <p className="text-base leading-7 text-ink">{item.summary}</p>
            <section>
              <h2 className="section-label">The problem</h2>
              <p className="text-sm leading-7 text-steel">{item.problem}</p>
            </section>
            <section>
              <h2 className="section-label">How this desk works it</h2>
              <p className="text-sm leading-7 text-steel">{item.approach}</p>
            </section>
            <section>
              <h2 className="section-label">What you walk away with</h2>
              <p className="text-sm leading-7 text-steel">{item.outcome}</p>
            </section>
            <section>
              <h2 className="section-label">Working method</h2>
              <ol className="grid gap-3 md:grid-cols-3">
                {item.steps.map((step, i) => (
                  <li key={step.title} className="border border-line bg-paper p-4">
                    <p className="font-display text-2xl font-bold text-orange/70">
                      0{i + 1}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold uppercase text-navy">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-steel">{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-6 border-t border-line bg-paper p-6 lg:border-l lg:border-t-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
                Who this is for
              </p>
              <ul className="mt-3 space-y-2">
                {item.audience.map((row) => (
                  <li key={row} className="border border-line bg-white px-3 py-2 text-sm text-ink">
                    {row}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist">
                What to send us
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-steel">
                {item.sendUs.map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ul>
            </div>
            <Link
              href={`/contact?subject=${encodeURIComponent("Use case: " + item.title)}`}
              className="btn-orange w-full"
            >
              Discuss this application
            </Link>
          </aside>
        </div>
      </article>

      <section className="grid gap-3 md:grid-cols-3">
        {item.stats.map((stat) => (
          <div key={stat.label} className="border border-line bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold uppercase text-navy">
              {stat.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-steel">{stat.note}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="section-label">Typical bill of materials</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {item.bom.map((row) => (
            <Link
              key={row.categorySlug + row.item}
              href={`/products?category=${row.categorySlug}`}
              className="catalog-card p-4"
            >
              <p className="font-display text-lg font-bold uppercase text-navy">
                {row.item}
              </p>
              <p className="mt-1 text-sm leading-6 text-steel">{row.why}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange">
                Open {row.item} catalog →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section>
          <div className="section-label">Parts used in this application</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={String(product._id)} product={product} size="sm" />
            ))}
          </div>
        </section>
      )}

      {relatedServices.length > 0 && (
        <section>
          <div className="section-label">Matching technical services</div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {relatedServices.map((service) => (
              <ServiceCard key={String(service._id)} service={service} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <div className="section-label">Other use cases</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((entry) => (
              <Link
                key={entry.slug}
                href={`/use-cases/${entry.slug}`}
                className="border border-line bg-white p-4 hover:border-orange"
              >
                <p className="text-[10px] uppercase tracking-[0.14em] text-orange">
                  {entry.industry}
                </p>
                <p className="mt-1 font-display font-bold uppercase text-navy">
                  {entry.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <RelatedSearch currentHref={`/use-cases/${item.slug}`} />
    </CatalogShell>
  );
}
