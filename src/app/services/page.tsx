import type { Metadata } from "next";
import Link from "next/link";
import { CatalogShell } from "@/components/CatalogShell";
import { RelatedSearch } from "@/components/RelatedSearch";
import { ServiceCard } from "@/components/ServiceCard";
import { getCategories, getServices, getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "Technical services",
    description:
      "PLC support, motor-drive matching, panel parts kits and spare-parts sourcing.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    getCategories("product"),
    getServices(),
  ]);

  return (
    <CatalogShell categories={categories}>
      <div className="section-label">Technical service provider</div>
      <p className="-mt-2 mb-4 max-w-2xl text-sm leading-6 text-steel">
        We sell parts and we help you use them — selection, substitution and
        panel support from an EEE desk.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map((service) => (
          <ServiceCard key={String(service._id)} service={service} />
        ))}
      </div>
      <div className="border border-line bg-white p-6">
        <p className="font-display text-xl font-bold uppercase text-navy">
          Need a part matched today?
        </p>
        <p className="mt-2 text-sm text-steel">
          Send a photo, nameplate or part number.
        </p>
        <Link href="/contact" className="btn-orange mt-4 inline-flex">
          Contact
        </Link>
      </div>
      <RelatedSearch currentHref="/services" />
    </CatalogShell>
  );
}
