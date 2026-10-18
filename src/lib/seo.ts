import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ISiteSettings } from "@/lib/models";

export const DEFAULT_PRODUCTION_DOMAIN = "https://nurshopbd.net";
export const VERCEL_DOMAIN = "https://nurshopbd.vercel.app";
export const HOMEPAGE_OG_BANNER = `${DEFAULT_PRODUCTION_DOMAIN}/nurshopbd-banner.png`;

export const DEFAULT_SEO_KEYWORDS = [
  "PLC automation Bangladesh",
  "PLC programming Bangladesh",
  "Ai530 PLC",
  "Mi530 PLC",
  "Hering628",
  "Porcheson controller",
  "Inovance servo motor",
  "Inovance drive",
  "Servo drive Bangladesh",
  "Industrial machinery conversion",
  "Injection molding machine conversion",
  "Extrusion machinery automation",
  "Die casting machine conversion",
  "Industrial automation Bangladesh",
  "machine spare parts",
  "NUR SHOP BD",
  "Nur Engineering Solution",
];

export function getDefaultSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    if (envUrl.includes("nurshopbd.xyz")) {
      return DEFAULT_PRODUCTION_DOMAIN;
    }
    const withProto = envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`;
    return withProto.replace(/\/$/, "");
  }
  return DEFAULT_PRODUCTION_DOMAIN;
}

export async function getSiteUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) {
      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        return `http://${host}`;
      }
      if (host.includes("nurshopbd.vercel.app")) {
        return "https://nurshopbd.vercel.app";
      }
      if (host.includes("nurengineeringbd.com")) {
        return "https://nurengineeringbd.com";
      }
      if (host.includes("nurshopbd.net")) {
        return "https://nurshopbd.net";
      }
      const proto = h.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`;
    }
  } catch {
    // Outside request context / build time
  }
  return getDefaultSiteUrl();
}

export function toAbsoluteUrl(
  pathOrUrl?: string,
  baseUrl: string = DEFAULT_PRODUCTION_DOMAIN
): string {
  const cleanBase = baseUrl.replace(/\/$/, "");
  if (!pathOrUrl || typeof pathOrUrl !== "string") {
    return `${cleanBase}/nurshopbd-banner.png`;
  }
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return `${cleanBase}/nurshopbd-banner.png`;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (trimmed.includes("nurshopbd.xyz")) {
      return trimmed.replace("nurshopbd.xyz", cleanBase.replace(/^https?:\/\//, ""));
    }
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${cleanBase}${normalizedPath}`;
}

export function buildPageMetadata({
  site,
  title,
  description,
  path = "/",
  image,
  keywords,
  baseUrl = DEFAULT_PRODUCTION_DOMAIN,
}: {
  site: ISiteSettings;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  baseUrl?: string;
}): Metadata {
  const canonical = `${baseUrl}${path === "/" ? "" : path}`;
  const desc = description || site.seo?.defaultDescription || site.description;
  const ogImage = image?.trim() ? toAbsoluteUrl(image, baseUrl) : `${baseUrl}/nurshopbd-banner.png`;
  const brand = site.brandName || "NUR SHOP BD";
  const finalKeywords = keywords?.length
    ? keywords
    : site.seo?.keywords?.length
    ? site.seo.keywords
    : DEFAULT_SEO_KEYWORDS;

  return {
    title,
    description: desc,
    keywords: finalKeywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: canonical,
      siteName: brand,
      title: `${title} | ${brand}`,
      description: desc,
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
      title: `${title} | ${brand}`,
      description: desc,
      images: [ogImage],
    },
  };
}

export function buildProductMetadata({
  site,
  product,
  baseUrl = DEFAULT_PRODUCTION_DOMAIN,
}: {
  site: ISiteSettings;
  product: {
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    image?: string;
    sku?: string;
    brand?: string;
  };
  baseUrl?: string;
}): Metadata {
  const canonical = `${baseUrl}/products/${product.slug}`;
  const brand = site.brandName || "NUR SHOP BD";
  const title = `${product.name} | ${brand}`;

  const rawDesc =
    product.shortDescription ||
    product.description ||
    `${product.name} available at ${brand}. Industrial machinery, automation components and spare parts in Bangladesh.`;
  const cleanDesc = rawDesc
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  const ogImage = product.image?.trim()
    ? toAbsoluteUrl(product.image, baseUrl)
    : `${baseUrl}/nurshopbd-banner.png`;

  return {
    title,
    description: cleanDesc,
    keywords: [
      product.name,
      ...(product.brand ? [product.brand] : []),
      ...DEFAULT_SEO_KEYWORDS,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: canonical,
      siteName: brand,
      title: `${product.name} | ${brand}`,
      description: cleanDesc,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${brand}`,
      description: cleanDesc,
      images: [ogImage],
    },
  };
}

export function buildServiceMetadata({
  site,
  service,
  baseUrl = DEFAULT_PRODUCTION_DOMAIN,
}: {
  site: ISiteSettings;
  service: {
    title: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    image?: string;
  };
  baseUrl?: string;
}): Metadata {
  const canonical = `${baseUrl}/services/${service.slug}`;
  const brand = site.brandName || "NUR SHOP BD";
  const title = `${service.title} | ${brand}`;
  const rawDesc =
    service.shortDescription ||
    service.description ||
    `${service.title} - Industrial automation and machinery conversion services in Bangladesh.`;
  const cleanDesc = rawDesc
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const ogImage = service.image?.trim()
    ? toAbsoluteUrl(service.image, baseUrl)
    : `${baseUrl}/nurshopbd-banner.png`;

  return {
    title,
    description: cleanDesc,
    keywords: [service.title, ...DEFAULT_SEO_KEYWORDS],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: canonical,
      siteName: brand,
      title: `${service.title} | ${brand}`,
      description: cleanDesc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: service.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | ${brand}`,
      description: cleanDesc,
      images: [ogImage],
    },
  };
}

export function getAnalyticsIds(site?: ISiteSettings | null) {
  return {
    gaId:
      site?.analytics?.gaMeasurementId?.trim() ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
      "",
    searchConsole:
      site?.analytics?.googleSiteVerification?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
      "",
  };
}
