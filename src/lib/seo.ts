import type { Metadata } from "next";
import type { ISiteSettings } from "@/lib/models";

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    const withProto = envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`;
    return withProto.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://nur-company-website.vercel.app";
}

export function buildPageMetadata({
  site,
  title,
  description,
  path = "/",
  image,
  keywords,
}: {
  site: ISiteSettings;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = getSiteUrl();
  const canonical = `${url}${path === "/" ? "" : path}`;
  const desc = description || site.seo?.defaultDescription || site.description;
  const ogImage = image || `${url}/opengraph-image`;

  return {
    title,
    description: desc,
    keywords: keywords?.length ? keywords : site.seo?.keywords || [],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: canonical,
      siteName: site.brandName,
      title: `${title} | ${site.brandName}`,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.brandName}`,
      description: desc,
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
