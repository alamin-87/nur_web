"use client";

import { Logo } from "@/components/Logo";
import { useSite } from "@/components/SiteProvider";

export function Header() {
  const site = useSite();

  return (
    <header className="border-b border-line bg-white">
      <div className="h-[3px] bg-orange" />
      <div className="shell flex items-center justify-between gap-5 py-3 md:py-3.5">
        <Logo size={76} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />

        <div className="text-right">
          <p className="kicker">Call / WhatsApp</p>
          <a
            href={`tel:${site.phone}`}
            className="mt-1 block font-display text-[1.35rem] font-bold leading-none tracking-wide text-navy transition hover:text-orange"
          >
            {site.phone}
          </a>
          <p className="mt-1 text-[12px] leading-snug text-mist">
            {site.address}
            <br />
            {site.hours}
          </p>
        </div>
      </div>
    </header>
  );
}
