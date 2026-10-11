import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo";

export async function JsonLd() {
  const site = await getSettings();
  const url = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Store"],
    name: site.brandName,
    url,
    email: site.email,
    telephone: site.phone,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.brandName,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
