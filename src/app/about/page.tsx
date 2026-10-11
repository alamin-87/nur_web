import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { RelatedSearch } from "@/components/RelatedSearch";
import { Img } from "@/components/Img";
import { getCategories, getCompany, getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "About us",
    description:
      "EEE student-built machine parts desk — PLC, motors, drives and technical service in Bangladesh.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const [categories, company] = await Promise.all([
    getCategories("product"),
    getCompany(),
  ]);

  return (
    <CatalogShell categories={categories} showSearch={false}>
      {company?.coverImage && (
        <div className="relative h-56 overflow-hidden border border-line md:h-72">
          <Img
            src={company.coverImage}
            alt={company.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy/50" />
          <div className="absolute bottom-6 left-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-bright">
              {company?.aboutLabel || "About"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase text-white md:text-4xl">
              {company.name}
            </h1>
          </div>
        </div>
      )}
      <div className="border border-line bg-white p-6 md:p-8">
        <p className="text-sm font-medium capitalize text-orange">{company?.tagline}</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-steel">{company?.about}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-line bg-paper p-5">
            <h2 className="font-display text-lg font-bold uppercase text-navy">Mission</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{company?.mission}</p>
          </div>
          <div className="border border-line bg-paper p-5">
            <h2 className="font-display text-lg font-bold uppercase text-navy">Vision</h2>
            <p className="mt-2 text-sm leading-6 text-steel">{company?.vision}</p>
          </div>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {company?.highlights?.map((item) => (
            <div key={item.label} className="border border-line p-4">
              <dt className="text-[10px] uppercase tracking-[0.16em] text-mist">
                {item.label}
              </dt>
              <dd className="mt-1 font-display text-lg font-bold text-navy">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <RelatedSearch currentHref="/about" />
    </CatalogShell>
  );
}
