import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { ContactForm } from "@/components/ContactForm";
import { GoogleMap } from "@/components/GoogleMap";
import { RelatedSearch } from "@/components/RelatedSearch";
import {
  getCategories,
  getProductBySlug,
  getServiceBySlug,
  getSettings,
} from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "Contact",
    description: "Request a quote for machine parts or technical service.",
    path: "/contact",
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; service?: string; subject?: string }>;
}) {
  const sp = await searchParams;
  const [categories, settings, product, service] = await Promise.all([
    getCategories("product"),
    getSettings(),
    sp.product ? getProductBySlug(sp.product) : Promise.resolve(null),
    sp.service ? getServiceBySlug(sp.service) : Promise.resolve(null),
  ]);

  const subject = product
    ? `Quote: ${product.name}`
    : service
      ? `Service: ${service.title}`
      : sp.subject;

  const cp = settings.contactPage || {};
  const heading = cp.heading || "Send a part number or photo";
  const descText =
    cp.description ||
    "We reply with options, stock and pricing. Same desk for products and technical service.";
  const phoneLabel = cp.phoneLabel || "Phone";
  const emailLabel = cp.emailLabel || "Email";
  const addressLabel = cp.addressLabel || "Address";
  const hoursLabel = cp.hoursLabel || "Hours";
  const whatsappNumber = settings.social?.whatsapp || settings.phone || "+8801713798987";
  const wechatNumber = settings.wechatId || "nurul01713798987";

  return (
    <CatalogShell categories={categories} showSearch={false}>
      <div className="section-label">Contact</div>
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="flex h-full flex-col border border-line bg-navy p-3.5 text-white sm:p-5">
          <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-semibold tracking-normal leading-snug">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm leading-5 text-white/70">
            {descText}
          </p>
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 min-[480px]:flex-row min-[480px]:items-stretch">
            <dl className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-bright text-white">
                  <svg className="h-[15px] w-[15px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-orange-bright">{phoneLabel}</dt>
                  <dd className="mt-1 space-y-0.5 text-[15px] sm:text-base font-medium leading-snug">
                    <div><a href={`tel:${settings.phone}`}>{settings.phone}</a></div>
                    {settings.phone2 ? (
                      <div><a href={`tel:${settings.phone2}`}>{settings.phone2}</a></div>
                    ) : null}
                    {settings.phone3 ? (
                      <div><a href={`tel:${settings.phone3}`}>{settings.phone3}</a></div>
                    ) : null}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-bright text-white">
                  <svg className="h-[15px] w-[15px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-orange-bright">{emailLabel}</dt>
                  <dd className="mt-1 break-words text-[15px] sm:text-[17px] font-medium leading-snug">
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-bright text-white">
                  <svg className="h-[15px] w-[15px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-orange-bright">{addressLabel}</dt>
                  <dd className="mt-1 text-[15px] sm:text-base leading-snug text-white/95">
                    <div className="font-semibold">{settings.brandName}</div>
                    {settings.addressHouse ? <div>House {settings.addressHouse}</div> : null}
                    {settings.addressRoad ? <div>Road {settings.addressRoad}</div> : null}
                    {settings.addressBlock ? <div>Block {settings.addressBlock}</div> : null}
                    <div>{settings.address}</div>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-bright text-white">
                  <svg className="h-[15px] w-[15px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-orange-bright">{hoursLabel}</dt>
                  <dd className="mt-1 text-[15px] sm:text-base font-medium">
                    <div>{settings.hours}</div>
                    {settings.workingDays && settings.workingDays !== settings.hours ? (
                      <div className="text-xs text-white/70 font-normal">{settings.workingDays}</div>
                    ) : null}
                  </dd>
                </div>
              </div>
            </dl>

            {(settings.footerQr?.whatsappQrEnabled !== false || settings.footerQr?.wechatQrEnabled !== false) && (
              <div className="flex shrink-0 flex-row items-end justify-start gap-3 min-[480px]:h-full min-[480px]:flex-col min-[480px]:items-center min-[480px]:justify-between">
                {settings.footerQr?.whatsappQrEnabled !== false && (
                  <div className="flex w-[88px] flex-col items-center">
                    <div className="h-[88px] w-[88px] overflow-hidden rounded-[2px] border border-white/20 bg-white p-1">
                      {settings.footerQr?.whatsappQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.footerQr.whatsappQr} alt="WhatsApp QR Scan" className="h-full w-full object-contain" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[#25D366] text-[9px] font-bold uppercase text-white">WA</div>
                      )}
                    </div>
                    <span className="mt-1 w-[7.25rem] text-center text-[10.5px] font-medium leading-tight tracking-normal text-white/90">
                      WhatsApp: {whatsappNumber}
                    </span>
                  </div>
                )}
                {settings.footerQr?.wechatQrEnabled !== false && (
                  <div className="flex w-[88px] flex-col items-center">
                    <div className="h-[88px] w-[88px] overflow-hidden rounded-[2px] border border-white/20 bg-white p-1">
                      {settings.footerQr?.wechatQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.footerQr.wechatQr} alt="WeChat QR Scan" className="h-full w-full object-contain" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[#07C160] text-[9px] font-bold uppercase text-white">WeChat</div>
                      )}
                    </div>
                    <span className="mt-1 w-[7.25rem] text-center text-[10.5px] font-medium leading-tight tracking-normal text-white/90">
                      Wechat: {wechatNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex h-full flex-col border border-line bg-white p-3 md:p-4">
          {(product || service) && (
            <p className="mb-1.5 text-sm text-orange">
              Inquiry about: {product?.name || service?.title}
            </p>
          )}
          <ContactForm
            defaultSubject={subject}
            productId={product ? String(product._id) : undefined}
            serviceId={service ? String(service._id) : undefined}
            content={cp}
          />
        </div>
      </div>
      <GoogleMap />
      <RelatedSearch currentHref="/contact" />
    </CatalogShell>
  );
}
