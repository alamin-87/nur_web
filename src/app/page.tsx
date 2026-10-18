import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { HeroSlider } from "@/components/HeroSlider";
import { SpecialFeaturesSection } from "@/components/SpecialFeaturesSection";
import { OurProductSection } from "@/components/OurProductSection";
import Link from "next/link";
import {
  getBanners,
  getCategories,
  getProducts,
  getProductsTotalCount,
  getServices,
  getFeatures,
  getSettings,
} from "@/lib/data";
import { DEFAULT_SEO_KEYWORDS, getSiteUrl, HOMEPAGE_OG_BANNER } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [site, url] = await Promise.all([getSettings(), getSiteUrl()]);
  const title = "NUR SHOP BD - Industrial Machinery, PLC Automation & Spare Parts";
  const description =
    "Buy machine spare parts, industrial automation equipment, PLC conversion, servo systems, and technical support services in Bangladesh from NUR SHOP BD.";
  const ogImage = `${url}/nurshopbd-banner.png`;
  const brand = site.brandName || "NUR SHOP BD";

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: site.seo?.keywords?.length ? site.seo.keywords : DEFAULT_SEO_KEYWORDS,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url,
      siteName: brand,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = 20;

  const [categories, banners, services, features, products, totalProducts] = await Promise.all([
    getCategories("product"),
    getBanners(),
    getServices(),
    getFeatures(),
    getProducts({ page: currentPage, limit: pageSize }),
    getProductsTotalCount(),
  ]);
  const homeServices = services.slice(0, 6);

  return (
    <CatalogShell categories={categories}>
      <HeroSlider banners={banners} />

      {/* 1. COMPANY SERVICES — Compact 6 Boxes */}
      <section>
        <div className="mb-1 sm:mb-1.5 flex items-center justify-between gap-4">
          <div className="section-label !mb-0">Company services</div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange transition hover:text-navy shrink-0"
          >
            All services <span className="text-[24px] leading-none relative -top-[3px]">→</span>
          </Link>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 ${homeServices.length >= 6 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          {homeServices.map((service) => (
            <Link
              key={service.slug || String(service._id)}
              href={`/services/${service.slug}`}
              className="group bg-white border border-line px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-[2px] shadow-xs hover:border-orange hover:shadow-sm transition flex items-center justify-start gap-1.5 min-h-[54px] sm:min-h-[56px] min-w-0"
            >
              <ServiceItemIcon label={`${service.title} ${service.slug}`} />
              <span className="min-w-0 text-[12px] min-[400px]:text-[13px] sm:text-[13px] lg:text-[12px] xl:text-[13.5px] font-bold text-navy leading-tight line-clamp-2">
                {service.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. SPECIAL FEATURES — Compact 3 Columns with See More Toggle */}
      <SpecialFeaturesSection features={features} categories={categories} />

      {/* 3. OUR PRODUCT — 20 Products with Client-Side Load More & Dynamic Pagination */}
      <OurProductSection
        initialProducts={products}
        totalProducts={totalProducts}
        pageSize={pageSize}
        initialPage={currentPage}
      />
    </CatalogShell>
  );
}

function ServiceItemIcon({ label: _label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#dcfce7" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#22c55e" strokeWidth="1.6" />
      <path
        d="M7.4 12.3l3.1 3.1 6.1-6.6"
        fill="none"
        stroke="#16a34a"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

