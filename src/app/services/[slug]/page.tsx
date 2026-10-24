import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CatalogShell } from "@/components/CatalogShell";
import { Img } from "@/components/Img";
import { ProductCard } from "@/components/ProductCard";
import { RelatedSearch } from "@/components/RelatedSearch";
import {
  getCategories,
  getServiceBySlug,
  getSettings,
} from "@/lib/data";
import type { PopulatedProduct } from "@/lib/data";
import { buildPageMetadata, buildServiceMetadata, getSiteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [service, site, baseUrl] = await Promise.all([
    getServiceBySlug(slug),
    getSettings(),
    getSiteUrl(),
  ]);
  if (!service) return { title: "Technical services" };
  return buildServiceMetadata({
    site,
    service,
    baseUrl,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, categories, siteSettings, siteUrl] = await Promise.all([
    getServiceBySlug(slug),
    getCategories("product"),
    getSettings(),
    getSiteUrl(),
  ]);
  if (!service) redirect("/services");
  const related = (service.relatedProducts || []) as unknown as PopulatedProduct[];

  const serviceAbsoluteImage = service.image
    ? service.image.startsWith("http")
      ? service.image
      : `${siteUrl}${service.image.startsWith("/") ? service.image : `/${service.image}`}`
    : `${siteUrl}/nurshopbd-banner.png`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description:
      service.description ||
      service.shortDescription ||
      `${service.title} provided by ${siteSettings.brandName || "Nur Engineering Solution"}`,
    provider: {
      "@type": "Organization",
      name: siteSettings.brandName || "Nur Engineering Solution",
      url: siteUrl,
    },
    areaServed: "BD",
    serviceType: "Industrial Automation & Engineering Conversion",
    url: `${siteUrl}/services/${service.slug}`,
    image: serviceAbsoluteImage,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${siteUrl}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${siteUrl}/services/${service.slug}`,
      },
    ],
  };

  return (
    <CatalogShell categories={categories}>
      {/* Service JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {/* BreadcrumbList JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 mb-3">
        <Link href="/" className="transition hover:text-orange">
          Home
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/services" className="transition hover:text-orange font-medium">
          Services
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-navy font-bold uppercase truncate max-w-[260px] sm:max-w-none">
          {service.title}
        </span>
      </nav>
      <article className="overflow-hidden border border-line bg-white">
        {service.image && (
          <div className="relative h-56 md:h-72">
            <Img
              src={service.image}
              alt={service.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-navy/45" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-bright">
                Technical service
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold uppercase text-white md:text-4xl">
                {service.title}
              </h1>
            </div>
          </div>
        )}
        <div className="p-6 md:p-8">
          <p className="max-w-2xl text-sm leading-7 text-steel">{service.description}</p>
          {service.features?.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-3">
              {service.features.map((feature) => (
                <li key={feature} className="border border-line bg-paper px-3 py-2 text-sm">
                  {feature}
                </li>
              ))}
            </ul>
          )}
          <Link href={`/contact?service=${service.slug}`} className="btn-orange mt-8 inline-flex">
            Request this service
          </Link>
        </div>
      </article>
      {related.length > 0 && (
        <section>
          <div className="section-label">Related parts</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((item) =>
              item?.slug ? (
                <ProductCard key={String(item._id)} product={item} size="sm" />
              ) : null
            )}
          </div>
        </section>
      )}
      <RelatedSearch currentHref={`/services/${service.slug}`} />
    </CatalogShell>
  );
}
