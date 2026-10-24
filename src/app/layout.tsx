import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SiteProvider } from "@/components/SiteProvider";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { DEFAULT_SEO_KEYWORDS, getAnalyticsIds, getSiteUrl, HOMEPAGE_OG_BANNER } from "@/lib/seo";
import { getSettings, getUseCases } from "@/lib/data";

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const revalidate = 60;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2540",
};

export async function generateMetadata(): Promise<Metadata> {
  const [site, url] = await Promise.all([getSettings(), getSiteUrl()]);
  const { searchConsole } = getAnalyticsIds(site);
  const brand = site.brandName || "Nur Engineering Solution";
  const defaultTitle =
    site.seo?.defaultTitle || "Nur Engineering Solution - Industrial Machinery, PLC Automation & Spare Parts";
  const defaultDescription =
    site.seo?.defaultDescription ||
    "Buy machine spare parts, industrial automation equipment, PLC conversion, servo systems, and technical support services in Bangladesh from Nur Engineering Solution.";
  const ogImage = `${url}/nurshopbd-banner.png`;

  return {
    metadataBase: new URL(url),
    title: {
      default: defaultTitle,
      template: `%s | ${brand}`,
    },
    description: defaultDescription,
    keywords: site.seo?.keywords?.length ? site.seo.keywords : DEFAULT_SEO_KEYWORDS,
    applicationName: brand,
    icons: site.favicon
      ? {
        icon: site.favicon,
        shortcut: site.favicon,
        apple: site.favicon,
      }
      : site.logoUrl
        ? {
          icon: site.logoUrl,
          shortcut: site.logoUrl,
          apple: site.logoUrl,
        }
        : undefined,
    openGraph: {
      type: "website",
      locale: "en_BD",
      url,
      siteName: brand,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: [ogImage],
    },
    ...(searchConsole ? { verification: { google: searchConsole } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, useCases] = await Promise.all([getSettings(), getUseCases()]);
  const { gaId } = getAnalyticsIds(settings);

  return (
    <html lang="en-BD" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteProvider settings={settings} useCases={useCases}>
          <JsonLd />
          <Analytics gaId={gaId} />
          <TopBar />
          <Suspense fallback={<div className="h-11 bg-navy" />}>
            <NavBar />
          </Suspense>
          <main id="main-content">{children}</main>
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
