"use client";

import { useSite } from "@/components/SiteProvider";
import { getValidMapEmbedUrl } from "@/lib/google-maps";

export function GoogleMap() {
  const site = useSite();
  const src = getValidMapEmbedUrl(
    site.mapEmbedUrl || site.mapShareUrl,
    site.mapZoom,
    site.address
  );

  return (
    <div className="relative w-full overflow-hidden border border-line bg-paper">
      <iframe
        title={`${site.brandName} location`}
        src={src}
        className="h-72 w-full border-0 md:h-[380px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
