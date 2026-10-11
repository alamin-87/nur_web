import { createHash } from "node:crypto";
import type { PopulatedProduct } from "@/lib/data";

export type SiteImageField =
  | "logoUrl"
  | "footerLogoUrl"
  | "favicon"
  | "heroBanners.banner1"
  | "heroBanners.banner2"
  | "heroBanners.banner3"
  | "footerQr.wechatQr"
  | "footerQr.whatsappQr";

export type PublicImageEntity =
  | "product"
  | "service"
  | "use-case"
  | "blog-post"
  | "category"
  | "subcategory"
  | "brand"
  | "banner"
  | "company";

export function getImageVersion(source: string) {
  return createHash("sha256").update(source).digest("hex").slice(0, 20);
}

export function getSiteImageUrl(field: SiteImageField, source: string) {
  if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(source)) return source;
  const params = new URLSearchParams({ field, v: getImageVersion(source) });
  return `/api/site-image?${params.toString()}`;
}

export function getProductImageUrl(
  slug: string,
  field: "image" | "gallery",
  index: number | null,
  source: string
) {
  return getPublicRecordImageUrl("product", slug, field, index, source);
}

export function getPublicRecordImageUrl(
  entity: PublicImageEntity,
  id: string,
  field: string,
  index: number | null,
  source: string
) {
  if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(source)) return source;
  const params = new URLSearchParams({
    entity,
    id,
    field,
    v: getImageVersion(source),
  });
  if (index !== null) params.set("index", String(index));
  return `/api/site-image?${params.toString()}`;
}

export function externalizeProductImages<T extends PopulatedProduct>(product: T): T {
  const slug = String(product.slug || product._id);
  return {
    ...product,
    image: getProductImageUrl(slug, "image", null, product.image),
    gallery: product.gallery?.map((image, index) =>
      getProductImageUrl(slug, "gallery", index, image)
    ),
    relatedServices: product.relatedServices?.map((service) => ({
      ...service,
      image: getPublicRecordImageUrl(
        "service",
        String(service.slug || service._id),
        "image",
        null,
        service.image || ""
      ),
    })),
  };
}

export function decodeImageDataUrl(source: string) {
  const match = /^data:(image\/(?:png|jpe?g|webp|gif));base64,([a-z\d+/=\r\n]+)$/i.exec(source);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64"),
  };
}
