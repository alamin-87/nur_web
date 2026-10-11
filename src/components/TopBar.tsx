"use client";

import { usePathname } from "next/navigation";
import { useSite } from "@/components/SiteProvider";
import { NoticeTickerItems } from "@/components/NoticeTickerItems";

export function TopBar() {
  const pathname = usePathname();
  const site = useSite();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const rawWa = site.social?.whatsapp || site.phone || "+880170000000";
  const cleanPhone = rawWa.replace(/[^\d]/g, "");
  const whatsappUrl = rawWa.startsWith("http")
    ? rawWa
    : `https://wa.me/${cleanPhone}`;

  const speed =
    typeof site.noticeBoardSpeed === "number" && !isNaN(site.noticeBoardSpeed) && site.noticeBoardSpeed > 0
      ? site.noticeBoardSpeed
      : typeof site.noticeSpeed === "number" && !isNaN(site.noticeSpeed) && site.noticeSpeed > 0 && site.noticeSpeed <= 100
      ? site.noticeSpeed
      : 50;

  const desktopDuration = Math.max(5, Math.round((84 * 50) / speed));
  const mobileDuration = Math.max(5, Math.round((112 * 50) / speed));

  return (
    <div className="sticky top-0 z-50 md:static bg-[#1F456E] text-white/90 border-b border-white/10">
      {/* Desktop TopBar Layout (Unchanged) */}
      <div className="shell hidden md:flex min-h-[34px] items-center justify-between gap-2 py-1">
        {/* Left info: Phone & Email */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Phone */}
          <a
            href={`tel:${site.phone}`}
            className="flex items-center gap-1.5 shrink-0 transition text-white hover:text-orange text-xs sm:text-[12.5px] font-semibold"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="h-4 w-4 text-[#fde047] fill-none stroke-current shrink-0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{site.phone}</span>
          </a>

          {/* Divider */}
          <span className="h-3 w-px bg-white/30 shrink-0" />

          {/* Email */}
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-1.5 shrink-0 transition text-white/90 hover:text-orange text-xs sm:text-[12.5px]"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="h-4 w-4 text-[#fde047] fill-none stroke-current shrink-0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="truncate max-w-[130px] sm:max-w-[180px] md:max-w-none">{site.email}</span>
          </a>
        </div>

        {/* Center: Dynamic Notice Ticker (Seamless Continuous Marquee) */}
        <div
          className="notice-ticker-container flex-1 overflow-hidden mx-2 sm:mx-4 md:mx-6 min-w-0 flex items-center cursor-default select-none relative"
          title="Notice (Hover to pause)"
        >
          <div className="notice-ticker-track" style={{ animationDuration: `${desktopDuration}s` }}>
            {/* Primary Content Group */}
            <div className="notice-ticker-group">
              {[0, 1].map((i) => (
                <NoticeTickerItems
                  key={`g1-${i}`}
                  noticeBn={site.noticeBn}
                  noticeEn={site.notice}
                />
              ))}
            </div>
            {/* Exact Duplicated Group for Infinite Seamless Loop */}
            <div className="notice-ticker-group" aria-hidden="true">
              {[0, 1].map((i) => (
                <NoticeTickerItems
                  key={`g2-${i}`}
                  noticeBn={site.noticeBn}
                  noticeEn={site.notice}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right social icons: Facebook -> LinkedIn -> YouTube -> WhatsApp */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Facebook */}
          <a
            href={site.social?.facebook || "https://www.facebook.com/"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            title="Facebook"
            className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
          >
            <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={site.social?.linkedin || "https://www.linkedin.com/"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
          >
            <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href={site.social?.youtube || "https://www.youtube.com/"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            title="YouTube"
            className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
          >
            <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
            className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
          >
            <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile TopBar Layout: Contact + Social top line, then Dynamic Notice Ticker line */}
      <div className="block md:hidden w-full max-w-full overflow-hidden">
        {/* Mobile Top Contact info & Social icons */}
        <div className="shell flex items-center justify-between gap-1.5 py-1 text-xs w-full max-w-full min-w-0">
          {/* Phone */}
          <a
            href={`tel:${site.phone}`}
            className="flex items-center gap-1 shrink-0 transition text-white hover:text-orange text-[11px] sm:text-xs font-semibold min-w-0 truncate"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              className="h-3.5 w-3.5 text-[#fde047] fill-none stroke-current shrink-0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="truncate">{site.phone}</span>
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={site.social?.facebook || "https://www.facebook.com/"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
            >
              <svg width="13" height="13" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <a
              href={site.social?.linkedin || "https://www.linkedin.com/"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
            >
              <svg width="13" height="13" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            <a
              href={site.social?.youtube || "https://www.youtube.com/"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
            >
              <svg width="13" height="13" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className="flex h-5 w-5 items-center justify-center text-white/80 transition hover:text-orange"
            >
              <svg width="13" height="13" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Dedicated Mobile Dynamic Notice Board Ticker Row */}
        <div className="bg-[#143049] border-t border-white/10 py-1 overflow-hidden w-full max-w-full">
          <div
            className="notice-ticker-container shell overflow-hidden flex items-center cursor-default select-none relative w-full max-w-full min-w-0"
            title="Notice"
          >
            <div className="notice-ticker-track" style={{ animationDuration: `${mobileDuration}s` }}>
              {/* Primary Content Group */}
              <div className="notice-ticker-group">
                {[0, 1].map((i) => (
                  <NoticeTickerItems
                    key={`mg1-${i}`}
                    noticeBn={site.noticeBn}
                    noticeEn={site.notice}
                    itemClassName="notice-ticker-item !pr-8"
                    labelClassName="notice-label !text-[11px]"
                    textClassName="notice-text !text-[11px]"
                  />
                ))}
              </div>
              {/* Exact Duplicated Group for Infinite Seamless Loop */}
              <div className="notice-ticker-group" aria-hidden="true">
                {[0, 1].map((i) => (
                  <NoticeTickerItems
                    key={`mg2-${i}`}
                    noticeBn={site.noticeBn}
                    noticeEn={site.notice}
                    itemClassName="notice-ticker-item !pr-8"
                    labelClassName="notice-label !text-[11px]"
                    textClassName="notice-text !text-[11px]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
