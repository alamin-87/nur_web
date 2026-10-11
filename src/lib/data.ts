import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import {
  SiteSettings,
  Category,
  SubCategory,
  Product,
  Service,
  Feature,
  Banner,
  CompanyProfile,
  UseCase,
  BlogPost,
  BlogCategory,
  Brand,
  type ISiteSettings,
  type ICategory,
  type ISubCategory,
  type IProduct,
  type IService,
  type IFeature,
  type IBanner,
  type ICompanyProfile,
  type IUseCase,
  type IBlogPost,
  type IBrand,
} from "@/lib/models";
import { navLinks, useCaseContent } from "@/lib/use-cases";
import { OFFICIAL_CONTACT, officialOrExisting } from "@/lib/official-contact";
import {
  mockCategories,
  mockSubCategories,
  mockSpecialFeatures,
  mockBanners,
  mockServices,
  mockProducts,
  mockBlogCategories,
  mockBlogPosts,
  type IMockBlogPost,
  type IMockBlogCategory,
  type IMockSpecialFeature,
} from "@/lib/mock-data";

export type PopulatedProduct = Omit<IProduct, "category" | "subCategory" | "relatedServices"> & {
  category: ICategory;
  subCategory?: ISubCategory | null;
  relatedServices: IService[];
};

export type ProductSummary = {
  _id: IProduct["_id"];
  name: string;
  slug: string;
  shortDescription: string;
  image?: string;
  sku?: string;
  brand?: string;
  featured: boolean;
  order?: number;
  category?: { _id: ICategory["_id"]; name: string; slug: string } | null;
  subCategory?: { _id: ISubCategory["_id"]; name: string; slug: string } | null;
};

export type PopulatedService = Omit<IService, "category" | "relatedProducts"> & {
  category?: ICategory | null;
  relatedProducts: IProduct[];
};

type ProductSummaryRecord = {
  _id: unknown;
  name: string;
  slug: string;
  shortDescription?: string;
  image?: string;
  sku?: string;
  brand?: string;
  featured?: boolean;
  order?: number;
  category?: unknown;
  subCategory?: unknown;
};

type MinimalRelation = { _id: unknown; name: string; slug: string };

function relationRef(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function relationLookupFilter(refs: string[]): Record<string, unknown> | null {
  const ids: mongoose.Types.ObjectId[] = [];
  const names: string[] = [];
  for (const ref of refs) {
    if (mongoose.Types.ObjectId.isValid(ref)) ids.push(new mongoose.Types.ObjectId(ref));
    else names.push(ref);
  }
  const or: Record<string, unknown>[] = [];
  if (ids.length) or.push({ _id: { $in: ids } });
  if (names.length) {
    or.push({ slug: { $in: names } }, { name: { $in: names } });
  }
  return or.length ? { $or: or } : null;
}

function relationMap(docs: MinimalRelation[]) {
  const map = new Map<string, { _id: string; name: string; slug: string }>();
  for (const doc of docs) {
    const relation = { _id: String(doc._id), name: doc.name, slug: doc.slug };
    map.set(relation._id, relation);
    map.set(relation.slug, relation);
    map.set(relation.name.toLowerCase(), relation);
  }
  return map;
}

function resolveRelation(
  value: unknown,
  map: Map<string, { _id: string; name: string; slug: string }>
) {
  if (value && typeof value === "object" && "name" in value && "slug" in value) {
    const relation = value as { _id?: unknown; name: unknown; slug: unknown };
    return {
      _id: String(relation._id ?? relation.slug),
      name: String(relation.name),
      slug: String(relation.slug),
    };
  }
  const ref = relationRef(value);
  if (!ref) return null;
  return map.get(ref) || map.get(ref.toLowerCase()) || {
    _id: ref,
    name: ref.replace(/-/g, " "),
    slug: ref,
  };
}

async function resolveProductSummaries(
  records: ProductSummaryRecord[]
): Promise<ProductSummary[]> {
  const categoryRefs = [...new Set(records.map((record) => relationRef(record.category)).filter((ref): ref is string => Boolean(ref)))];
  const subcategoryRefs = [...new Set(records.map((record) => relationRef(record.subCategory)).filter((ref): ref is string => Boolean(ref)))];
  const categoryFilter = relationLookupFilter(categoryRefs);
  const subcategoryFilter = relationLookupFilter(subcategoryRefs);
  const [categoryDocs, subcategoryDocs] = await Promise.all([
    categoryFilter
      ? Category.find(categoryFilter).select("_id name slug").lean<MinimalRelation[]>()
      : Promise.resolve([]),
    subcategoryFilter
      ? SubCategory.find(subcategoryFilter).select("_id name slug").lean<MinimalRelation[]>()
      : Promise.resolve([]),
  ]);
  const categories = relationMap(categoryDocs);
  const subcategories = relationMap(subcategoryDocs);

  return records.map((record) => ({
    _id: String(record._id),
    name: record.name,
    slug: record.slug,
    shortDescription: record.shortDescription || "",
    image: record.image,
    sku: record.sku,
    brand: record.brand,
    featured: Boolean(record.featured),
    order: Number(record.order || 0),
    category: resolveRelation(record.category, categories),
    subCategory: resolveRelation(record.subCategory, subcategories),
  }));
}

function toProductSummary(product: PopulatedProduct): ProductSummary {
  return {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription || "",
    image: product.image,
    sku: product.sku,
    brand: product.brand,
    featured: Boolean(product.featured),
    order: Number(product.order || 0),
    category: resolveRelation(product.category, new Map()) as ProductSummary["category"],
    subCategory: resolveRelation(product.subCategory, new Map()) as ProductSummary["subCategory"],
  };
}

function externalizeRecordField<T extends object>(
  record: T,
  entity: PublicImageEntity,
  id: string,
  field: string,
  key: string
): T {
  const source = (record as Record<string, unknown>)[key];
  if (!id || typeof source !== "string") return record;
  return {
    ...record,
    [key]: getPublicRecordImageUrl(entity, id, field, null, source),
  } as T;
}

function externalizeService(service: PopulatedService): PopulatedService {
  const products = (service.relatedProducts || []).map((product) => {
    const slug = String(product.slug || product._id);
    return {
      ...product,
      image: getPublicRecordImageUrl("product", slug, "image", null, product.image),
      gallery: product.gallery?.map((image, index) =>
        getPublicRecordImageUrl("product", slug, "gallery", index, image)
      ),
    };
  });
  const normalized = { ...service, relatedProducts: products };
  return externalizeRecordField(
    normalized,
    "service",
    String(service.slug || service._id),
    "image",
    "image"
  );
}

import { defaultFooterQuickLinks, defaultFooterServices } from "@/lib/footer-defaults";
import { cachedRead, clearReadCache, withReadCache } from "@/lib/read-cache";
import {
  externalizeProductImages,
  getPublicRecordImageUrl,
  getSiteImageUrl,
  type PublicImageEntity,
  type SiteImageField,
} from "@/lib/public-images";
export { defaultFooterQuickLinks, defaultFooterServices };

export const fallbackSettings: ISiteSettings = {
  _id: "fallback",
  brandName: "Nur Engineering Solution",
  tagline: "Machine, spare parts and Technical service provider",
  description:
    "EEE-led supplier of PLC, motors, drives, sensors, and industrial spare parts with technical service across Bangladesh.",
  email: OFFICIAL_CONTACT.email,
  phone: OFFICIAL_CONTACT.phone,
  phone2: OFFICIAL_CONTACT.phone2,
  phone3: OFFICIAL_CONTACT.phone3,
  wechatId: OFFICIAL_CONTACT.wechatId,
  address: OFFICIAL_CONTACT.address,
  addressHouse: OFFICIAL_CONTACT.addressHouse,
  addressRoad: OFFICIAL_CONTACT.addressRoad,
  addressBlock: OFFICIAL_CONTACT.addressBlock,
  hours: "Sat–Thu 9:00–18:00",
  workingDays: "Saturday – Thursday",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=House%2343-44%2C%20Road-1%2C%20Block%20-B%2C%20Mirpur-1%20%28Beside%20Shah%20Ali%20Thana%29%2C%20Dhaka-1216&t=&z=16&ie=UTF8&iwloc=&output=embed",
  mapShareUrl: "",
  mapZoom: 16,
  contactPage: {
    heading: "Send a part number or photo",
    description:
      "We reply with options, stock and pricing. Same desk for products and technical service.",
    phoneLabel: "Phone",
    emailLabel: "Email",
    addressLabel: "Address",
    hoursLabel: "Hours",
    formHeading: "",
    nameLabel: "Name",
    emailFieldLabel: "Email",
    phoneFieldLabel: "Phone",
    companyFieldLabel: "Company / Workshop",
    inquiryTypeLabel: "Inquiry type",
    inquiryTypeOptions: ["Product quote", "Parts sourcing", "Technical service", "Other"],
    subjectLabel: "Subject",
    messageLabel: "Message",
    submitButtonText: "Send inquiry",
    successMessage: "Message received. We will reply shortly.",
    errorMessage: "Failed to send message. Please try again.",
  },
  logoUrl: "",
  footerLogoUrl: "",
  favicon: "",
  notice: "Out of stock products will be delivered within 3–5 days.",
  noticeBn:
    "★ কোন পার্টস স্টকে না থাকলে জরুরী প্রয়োজনে অর্ডার দেওয়ার ০৩ কার্যদিবসের মধ্যে চায়না থেকে আমদানি করে সরবরাহ করা হয় ★",
  noticeBoardSpeed: 50,
  noticeSpeed: 84,
  social: {
    facebook: "https://www.facebook.com/",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: OFFICIAL_CONTACT.whatsapp,
  },
  footerQr: {
    wechatQr: "",
    wechatQrLabel: "WECHAT QR SCAN",
    wechatQrEnabled: true,
    whatsappQr: "",
    whatsappQrLabel: "WHATSAPP QR SCAN",
    whatsappQrEnabled: true,
  },
  heroBanners: {
    banner1: "",
    banner2: "",
    banner3: "",
  },
  seo: {
    defaultTitle:
      "Nur Engineering Solution | Machine Parts & Technical Service",
    defaultDescription:
      "Buy PLC, motors, VFD, sensors, contactors and industrial spare parts. Technical service from an EEE engineering desk in Bangladesh.",
    keywords: [
      "PLC Bangladesh",
      "machine parts",
      "VFD",
      "motors",
      "sensors",
      "EEE spare parts",
    ],
  },
  analytics: {},
  nav: navLinks,
  footerQuickLinks: defaultFooterQuickLinks,
  footerServices: defaultFooterServices,
};

function getMockPopulatedProducts(): PopulatedProduct[] {
  const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
  const subMap = new Map(mockSubCategories.map((s) => [String(s._id), s]));
  const svcMap = new Map(mockServices.map((s) => [String(s._id), s]));
  return mockProducts.map((p) => ({
    ...p,
    category:
      catMap.get(String(p.category)) ||
      mockCategories[0],
    subCategory: p.subCategory ? subMap.get(String(p.subCategory)) || null : null,
    relatedServices: (p.relatedServices || [])
      .map((sid) => svcMap.get(String(sid)))
      .filter(Boolean) as IService[],
  }));
}

function getMockPopulatedServices(): PopulatedService[] {
  const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
  return mockServices.map((s) => ({
    ...s,
    category: s.category ? catMap.get(String(s.category)) || null : null,
    relatedProducts: [],
  }));
}

export async function getSettings(): Promise<ISiteSettings> {
  const globalCache = globalThis as typeof globalThis & {
    __nurSettingsCache?: { value: ISiteSettings; expiresAt: number };
    __nurRawSettingsCache?: { value: Record<string, unknown>; expiresAt: number };
  };
  if (globalCache.__nurSettingsCache && globalCache.__nurSettingsCache.expiresAt > Date.now()) {
    return globalCache.__nurSettingsCache.value;
  }

  let doc: Record<string, unknown> | null = null;
  try {
    const db = await connectDB();
    if (db) {
      const found = await SiteSettings.findOne().sort({ updatedAt: -1 }).lean<ISiteSettings | null>();
      if (found) {
        doc = serialize(found) as unknown as Record<string, unknown>;
        globalCache.__nurRawSettingsCache = {
          value: doc,
          expiresAt: Date.now() + 30_000,
        };
      }
    }
  } catch (err) {
    console.warn("getSettings DB warning:", err);
  }

  const merged: Record<string, unknown> = {
    ...fallbackSettings,
    ...(doc || {}),
  };

  const rawContactPage = {
    ...fallbackSettings.contactPage,
    ...((doc?.contactPage as Record<string, unknown>) || {}),
  };

  const rawSocial = {
    ...fallbackSettings.social,
    ...((doc?.social as Record<string, string>) || {}),
  };

  const rawFooterQr = {
    ...fallbackSettings.footerQr,
    ...((doc?.footerQr as Record<string, unknown>) || {}),
  };

  const rawSeo = {
    ...fallbackSettings.seo,
    ...((doc?.seo as Record<string, unknown>) || {}),
  };

  const rawAnalytics = {
    ...fallbackSettings.analytics,
    ...((doc?.analytics as Record<string, string>) || {}),
  };

  const result: ISiteSettings = {
    _id: (merged._id as string) || "site-settings",
    brandName: (merged.brandName as string) || fallbackSettings.brandName,
    tagline: (merged.tagline as string) || fallbackSettings.tagline,
    description: (merged.description as string) || fallbackSettings.description,
    email: officialOrExisting(merged.email as string, fallbackSettings.email),
    phone: officialOrExisting(merged.phone as string, fallbackSettings.phone),
    phone2: officialOrExisting(merged.phone2 as string, fallbackSettings.phone2 || ""),
    phone3: officialOrExisting(merged.phone3 as string | undefined, fallbackSettings.phone3 || ""),
    wechatId: officialOrExisting(merged.wechatId as string, fallbackSettings.wechatId || ""),
    address: officialOrExisting(merged.address as string, fallbackSettings.address),
    addressHouse: officialOrExisting(
      merged.addressHouse as string,
      fallbackSettings.addressHouse || ""
    ),
    addressRoad: officialOrExisting(
      merged.addressRoad as string,
      fallbackSettings.addressRoad || ""
    ),
    addressBlock: officialOrExisting(
      merged.addressBlock as string,
      fallbackSettings.addressBlock || ""
    ),
    hours: (merged.hours as string) || fallbackSettings.hours,
    workingDays: (merged.workingDays as string) || fallbackSettings.workingDays || "Saturday – Thursday",
    mapEmbedUrl: (merged.mapEmbedUrl as string) || fallbackSettings.mapEmbedUrl,
    mapShareUrl: (merged.mapShareUrl as string) || "",
    mapZoom:
      typeof merged.mapZoom === "number" && !isNaN(merged.mapZoom)
        ? merged.mapZoom
        : (fallbackSettings.mapZoom || 16),
    contactPage: {
      heading:
        (rawContactPage.heading as string) ||
        fallbackSettings.contactPage?.heading ||
        "Send a part number or photo",
      description:
        (rawContactPage.description as string) ||
        fallbackSettings.contactPage?.description ||
        "We reply with options, stock and pricing. Same desk for products and technical service.",
      phoneLabel:
        (rawContactPage.phoneLabel as string) ||
        fallbackSettings.contactPage?.phoneLabel ||
        "Phone",
      emailLabel:
        (rawContactPage.emailLabel as string) ||
        fallbackSettings.contactPage?.emailLabel ||
        "Email",
      addressLabel:
        (rawContactPage.addressLabel as string) ||
        fallbackSettings.contactPage?.addressLabel ||
        "Address",
      hoursLabel:
        (rawContactPage.hoursLabel as string) ||
        fallbackSettings.contactPage?.hoursLabel ||
        "Hours",
      formHeading: (rawContactPage.formHeading as string) || "",
      nameLabel: (rawContactPage.nameLabel as string) || "Name",
      emailFieldLabel: (rawContactPage.emailFieldLabel as string) || "Email",
      phoneFieldLabel: (rawContactPage.phoneFieldLabel as string) || "Phone",
      companyFieldLabel: (rawContactPage.companyFieldLabel as string) || "Company / Workshop",
      inquiryTypeLabel: (rawContactPage.inquiryTypeLabel as string) || "Inquiry type",
      inquiryTypeOptions:
        Array.isArray(rawContactPage.inquiryTypeOptions) && rawContactPage.inquiryTypeOptions.length > 0
          ? (rawContactPage.inquiryTypeOptions as string[])
          : (fallbackSettings.contactPage?.inquiryTypeOptions || [
              "Product quote",
              "Parts sourcing",
              "Technical service",
              "Other",
            ]),
      subjectLabel: (rawContactPage.subjectLabel as string) || "Subject",
      messageLabel: (rawContactPage.messageLabel as string) || "Message",
      submitButtonText: (rawContactPage.submitButtonText as string) || "Send inquiry",
      successMessage:
        (rawContactPage.successMessage as string) ||
        "Message received. We will reply shortly.",
      errorMessage:
        (rawContactPage.errorMessage as string) ||
        "Failed to send message. Please try again.",
    },
    logoUrl: ((merged.logoUrl || merged.logo) as string) || "",
    footerLogoUrl: (merged.footerLogoUrl as string) || "",
    favicon: (merged.favicon as string) || "",
    notice:
      (merged.notice as string) ||
      fallbackSettings.notice ||
      "Out of stock products will be delivered within 3–5 days.",
    noticeBn:
      (merged.noticeBn as string) ||
      fallbackSettings.noticeBn ||
      "★ কোন পার্টস স্টকে না থাকলে জরুরী প্রয়োজনে অর্ডার দেওয়ার ০৩ কার্যদিবসের মধ্যে চায়না থেকে আমদানি করে সরবরাহ করা হয় ★",
    noticeBoardSpeed:
      typeof merged.noticeBoardSpeed === "number" && !isNaN(merged.noticeBoardSpeed) && merged.noticeBoardSpeed > 0
        ? merged.noticeBoardSpeed
        : (fallbackSettings.noticeBoardSpeed || 50),
    noticeSpeed:
      typeof merged.noticeSpeed === "number" && !isNaN(merged.noticeSpeed) && merged.noticeSpeed > 0
        ? merged.noticeSpeed
        : (fallbackSettings.noticeSpeed || 84),
    social: {
      facebook: rawSocial.facebook || fallbackSettings.social?.facebook || "",
      linkedin: rawSocial.linkedin || fallbackSettings.social?.linkedin || "",
      instagram: rawSocial.instagram || fallbackSettings.social?.instagram || "",
      youtube: rawSocial.youtube || fallbackSettings.social?.youtube || "",
      whatsapp: officialOrExisting(
        rawSocial.whatsapp,
        fallbackSettings.social?.whatsapp || OFFICIAL_CONTACT.whatsapp
      ),
    },
    heroBanners: {
      banner1: ((merged.heroBanners as { banner1?: string } | undefined)?.banner1 as string) || "",
      banner2: ((merged.heroBanners as { banner2?: string } | undefined)?.banner2 as string) || "",
      banner3: ((merged.heroBanners as { banner3?: string } | undefined)?.banner3 as string) || "",
    },
    footerQr: {
      wechatQr: (rawFooterQr.wechatQr as string) || "",
      wechatQrLabel: (rawFooterQr.wechatQrLabel as string) || "WECHAT QR SCAN",
      wechatQrEnabled: rawFooterQr.wechatQrEnabled !== false,
      whatsappQr: (rawFooterQr.whatsappQr as string) || "",
      whatsappQrLabel: (rawFooterQr.whatsappQrLabel as string) || "WHATSAPP QR SCAN",
      whatsappQrEnabled: rawFooterQr.whatsappQrEnabled !== false,
    },
    seo: {
      defaultTitle: (rawSeo.defaultTitle as string) || fallbackSettings.seo.defaultTitle,
      defaultDescription: (rawSeo.defaultDescription as string) || fallbackSettings.seo.defaultDescription,
      keywords: Array.isArray(rawSeo.keywords) ? (rawSeo.keywords as string[]) : fallbackSettings.seo.keywords,
    },
    analytics: {
      gaMeasurementId:
        rawAnalytics.gaMeasurementId ||
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
        "",
      googleSiteVerification:
        rawAnalytics.googleSiteVerification ||
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "",
    },
    nav: Array.isArray(merged.nav) && merged.nav.length ? (merged.nav as ISiteSettings["nav"]) : fallbackSettings.nav,
    footerQuickLinks:
      Array.isArray(merged.footerQuickLinks) && merged.footerQuickLinks.length
        ? (merged.footerQuickLinks as { label: string; href: string }[])
        : fallbackSettings.footerQuickLinks,
    footerServices:
      Array.isArray(merged.footerServices) && merged.footerServices.length
        ? (merged.footerServices as { label: string; href: string }[])
        : fallbackSettings.footerServices,
  };
  result.logoUrl = getSiteImageUrl("logoUrl", result.logoUrl || "");
  result.footerLogoUrl = getSiteImageUrl("footerLogoUrl", result.footerLogoUrl || "");
  result.favicon = getSiteImageUrl("favicon", result.favicon || "");
  result.heroBanners = {
    ...result.heroBanners,
    banner1: getSiteImageUrl("heroBanners.banner1", result.heroBanners?.banner1 || ""),
    banner2: getSiteImageUrl("heroBanners.banner2", result.heroBanners?.banner2 || ""),
    banner3: getSiteImageUrl("heroBanners.banner3", result.heroBanners?.banner3 || ""),
  };
  result.footerQr = {
    ...result.footerQr,
    wechatQr: getSiteImageUrl("footerQr.wechatQr", result.footerQr?.wechatQr || ""),
    whatsappQr: getSiteImageUrl("footerQr.whatsappQr", result.footerQr?.whatsappQr || ""),
  };
  globalCache.__nurSettingsCache = {
    value: result,
    expiresAt: Date.now() + 30_000,
  };
  return result;
}

export function invalidateSettingsCache() {
  const globalCache = globalThis as typeof globalThis & {
    __nurSettingsCache?: { value: ISiteSettings; expiresAt: number };
    __nurRawSettingsCache?: { value: Record<string, unknown>; expiresAt: number };
  };
  delete globalCache.__nurSettingsCache;
  delete globalCache.__nurRawSettingsCache;
  clearReadCache();
}

const rawSiteImageFields: Record<SiteImageField, string> = {
  logoUrl: "logoUrl",
  footerLogoUrl: "footerLogoUrl",
  favicon: "favicon",
  "heroBanners.banner1": "heroBanners.banner1",
  "heroBanners.banner2": "heroBanners.banner2",
  "heroBanners.banner3": "heroBanners.banner3",
  "footerQr.wechatQr": "footerQr.wechatQr",
  "footerQr.whatsappQr": "footerQr.whatsappQr",
};

export async function getRawSiteImage(field: string): Promise<string | null> {
  if (!Object.hasOwn(rawSiteImageFields, field)) return null;
  const allowedField = field as SiteImageField;
  const globalCache = globalThis as typeof globalThis & {
    __nurRawSettingsCache?: { value: Record<string, unknown>; expiresAt: number };
  };
  let doc =
    globalCache.__nurRawSettingsCache &&
    globalCache.__nurRawSettingsCache.expiresAt > Date.now()
      ? globalCache.__nurRawSettingsCache.value
      : null;
  if (!doc) {
    const db = await connectDB();
    if (!db) return null;
    const found = await SiteSettings.findOne()
      .sort({ updatedAt: -1 })
      .select(`${Object.values(rawSiteImageFields).join(" ")} logo`)
      .lean<Record<string, unknown> | null>();
    if (!found) return null;
    doc = serialize(found) as Record<string, unknown>;
    globalCache.__nurRawSettingsCache = {
      value: doc,
      expiresAt: Date.now() + 30_000,
    };
  }
  const value = allowedField.includes(".")
    ? allowedField.split(".").reduce<unknown>((current, key) => {
        return current && typeof current === "object"
          ? (current as Record<string, unknown>)[key]
          : undefined;
      }, doc)
    : doc[allowedField];
  if (typeof value === "string") return value;
  if (allowedField === "logoUrl" && typeof doc.logo === "string") return doc.logo;
  return null;
}

export async function getRawPublicImage(
  entity: string,
  id: string,
  field: string,
  index: number | null
): Promise<string | null> {
  if (entity === "settings") return getRawSiteImage(field);
  if (!id || (!Number.isInteger(index) && index !== null)) return null;

  const allowedEntity = entity as PublicImageEntity;
  const cacheKey = `raw-public-image:${allowedEntity}:${id}:${field}:${index ?? ""}`;
  return cachedRead(cacheKey, async () => {
    const db = await connectDB();
    if (!db) return null;

    if (allowedEntity === "product") {
      if (field === "image" && index === null) {
        const doc = await Product.findOne({ slug: id, published: { $ne: false } })
          .select("image")
          .lean<{ image?: string } | null>();
        return doc?.image || null;
      }
      if (field === "gallery" && index !== null && index >= 0 && index <= 30) {
        const doc = await Product.findOne({ slug: id, published: { $ne: false } })
          .select("gallery")
          .lean<{ gallery?: string[] } | null>();
        return doc?.gallery?.[index] || null;
      }
      return null;
    }

    if (allowedEntity === "service" && field === "image") {
      const doc = await Service.findOne({ slug: id, published: { $ne: false } })
        .select("image")
        .lean<{ image?: string } | null>();
      return doc?.image || null;
    }
    if (allowedEntity === "use-case" && field === "image") {
      const doc = await UseCase.findOne({ slug: id, published: true })
        .select("image")
        .lean<{ image?: string } | null>();
      return doc?.image || null;
    }
    if (allowedEntity === "blog-post" && field === "coverImage") {
      const doc = await BlogPost.findOne({ slug: id, status: "published" })
        .select("coverImage")
        .lean<{ coverImage?: string } | null>();
      return doc?.coverImage || null;
    }
    if (allowedEntity === "category" && field === "image") {
      const doc = await Category.findOne({ slug: id })
        .select("image")
        .lean<{ image?: string } | null>();
      return doc?.image || null;
    }
    if (allowedEntity === "subcategory" && field === "image") {
      const doc = await SubCategory.findOne({ slug: id, published: { $ne: false } })
        .select("image")
        .lean<{ image?: string } | null>();
      return doc?.image || null;
    }
    if (allowedEntity === "brand" && field === "logo") {
      const doc = await Brand.findOne({ slug: id, active: { $ne: false } })
        .select("logo")
        .lean<{ logo?: string } | null>();
      return doc?.logo || null;
    }
    if (allowedEntity === "banner" && field === "image") {
      const doc = await Banner.findOne({ _id: id, active: true })
        .select("image")
        .lean<{ image?: string } | null>();
      return doc?.image || null;
    }
    if (allowedEntity === "company" && id === "company-profile" && field === "coverImage") {
      const doc = await CompanyProfile.findOne()
        .select("coverImage")
        .lean<{ coverImage?: string } | null>();
      return doc?.coverImage || null;
    }
    return null;
  });
}

export const fallbackCompanyProfile: ICompanyProfile = {
  _id: "company-profile",
  name: "Nur Engineering Solution",
  tagline: "Machine, spare parts and Technical service provider",
  about:
    "Nur Engineering Solution is a Bangladesh-based machine parts and technical service desk founded by an Electrical and Electronic Engineering student. We sell PLC, motors, drives, sensors, contactors and workshop spare parts — and we help you pick the right substitute when the original part is gone.",
  mission:
    "Supply accurate industrial parts with honest specs, clear prices, and EEE-backed selection help.",
  vision:
    "Be the parts partner workshops and small factories in Bangladesh actually call first.",
  aboutLabel: "About",
  foundedYear: 2024,
  email: OFFICIAL_CONTACT.email,
  phone: OFFICIAL_CONTACT.phone,
  address: OFFICIAL_CONTACT.address,
  coverImage: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1600&q=80",
  highlights: [
    { label: "Founded", value: "2024" },
    { label: "Focus", value: "EEE machine parts & service" },
    { label: "Based in", value: "Dhaka, Bangladesh" },
    { label: "Catalog", value: "PLC to bearings" },
  ],
};

async function loadCompany(): Promise<ICompanyProfile> {
  let doc: ICompanyProfile | null = null;
  try {
    const db = await connectDB();
    if (db) {
      const found = await CompanyProfile.findOne().lean<ICompanyProfile | null>();
      if (found) doc = serialize(found);
    }
  } catch (err) {
    console.warn("getCompany DB error:", err);
  }

  if (!doc) {
    return fallbackCompanyProfile;
  }

  return externalizeRecordField({
    ...fallbackCompanyProfile,
    ...doc,
    aboutLabel: doc.aboutLabel || fallbackCompanyProfile.aboutLabel,
    highlights:
      Array.isArray(doc.highlights) && doc.highlights.length > 0
        ? doc.highlights
        : fallbackCompanyProfile.highlights,
  }, "company", "company-profile", "coverImage", "coverImage");
}

async function loadCategories(
  type?: "product" | "service"
): Promise<ICategory[]> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = {};
      if (type === "product") {
        filter.$or = [{ type: "product" }, { type: { $exists: false } }, { type: null }];
      } else if (type === "service") {
        filter.type = "service";
      }
      const docs = await Category.find(filter)
        .select("_id name slug description type image order active")
        .sort({ order: 1, name: 1 })
        .lean<ICategory[]>();
      if (docs) {
        return serialize(
          docs.map((category) =>
            externalizeRecordField(category, "category", String(category.slug), "image", "image")
          )
        );
      }
    }
  } catch (err) {
    console.error("getCategories DB error:", err);
  }
  const mock = type ? mockCategories.filter((c) => c.type === type) : mockCategories;
  return serialize(
    mock.map((category) =>
      externalizeRecordField(category, "category", String(category.slug), "image", "image")
    )
  ) as unknown as ICategory[];
}

async function loadSubCategories(
  categorySlugOrId?: string
): Promise<ISubCategory[]> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (categorySlugOrId) {
        if (mongoose.Types.ObjectId.isValid(categorySlugOrId)) {
          filter.category = new mongoose.Types.ObjectId(categorySlugOrId);
        } else {
          const cat = await Category.findOne({
            $or: [
              { slug: categorySlugOrId },
              { slug: { $regex: new RegExp(`^${categorySlugOrId}$`, "i") } },
            ],
          }).lean<ICategory | null>();
          if (cat) {
            filter.$or = [
              { category: cat._id },
              { category: String(cat._id) },
              { category: cat.slug },
            ];
          } else {
            filter.category = categorySlugOrId;
          }
        }
      }
      const docs = await SubCategory.find(filter)
        .select("_id name slug category image order active")
        .populate({ path: "category", select: "_id name slug" })
        .sort({ order: 1, name: 1 })
        .lean<ISubCategory[]>();
      if (docs) {
        return serialize(
          docs.map((category) =>
            externalizeRecordField(
              category,
              "subcategory",
              String(category.slug),
              "image",
              "image"
            )
          )
        );
      }
    }
  } catch (err) {
    console.error("getSubCategories DB error:", err);
  }

  let list = mockSubCategories;
  if (categorySlugOrId) {
    const parentMockCat = mockCategories.find(
      (c) => c._id === categorySlugOrId || c.slug === categorySlugOrId
    );
    if (parentMockCat) {
      list = list.filter((s) => String(s.category) === String(parentMockCat._id));
    }
  }
  return serialize(
    list.map((category) =>
      externalizeRecordField(
        category,
        "subcategory",
        String(category.slug),
        "image",
        "image"
      )
    )
  ) as unknown as ISubCategory[];
}

async function loadBrands(): Promise<IBrand[]> {
  try {
    const db = await connectDB();
    if (db) {
      const docs = await Brand.find({ active: { $ne: false } })
        .sort({ order: 1, name: 1 })
        .lean<IBrand[]>();
      if (docs) {
        return serialize(
          docs.map((brand) =>
            externalizeRecordField(brand, "brand", String(brand.slug), "logo", "logo")
          )
        );
      }
    }
  } catch (err) {
    console.error("getBrands DB error:", err);
  }
  return [];
}


async function loadBanners(): Promise<IBanner[]> {
  let banners: IBanner[] = serialize(mockBanners);
  try {
    const db = await connectDB();
    if (db) {
      const docs = await Banner.find({ active: true })
        .sort({ order: 1 })
        .limit(3)
        .lean<IBanner[]>();
      if (docs.length) banners = serialize(docs);
    }
  } catch {
    banners = serialize(mockBanners);
  }

  try {
    const settings = await getSettings();
    const overrides = [
      settings.heroBanners?.banner1,
      settings.heroBanners?.banner2,
      settings.heroBanners?.banner3,
    ];
    banners = banners.map((banner, index) => {
      const image = overrides[index];
      return image ? { ...banner, image } : banner;
    });
  } catch {
    // keep default banner images
  }

  return banners.map((banner) =>
    externalizeRecordField(
      banner,
      "banner",
      String(banner._id),
      "image",
      "image"
    )
  );
}

async function loadServices(opts?: {
  featured?: boolean;
  limit?: number;
}): Promise<PopulatedService[]> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (opts?.featured) filter.featured = true;
      let query = Service.find(filter)
        .select("_id title slug shortDescription image category order featured published")
        .populate({ path: "category", select: "_id name slug" })
        .sort({ order: 1, _id: 1 })
        .lean<PopulatedService[]>();
      if (opts?.limit) query = query.limit(Math.min(40, Math.max(1, opts.limit)));
      const docs = await query;
      if (docs && docs.length > 0) {
        return serialize(docs.map(externalizeService));
      }
    }
  } catch (err) {
    console.error("getServices DB error:", err);
  }
  let res = getMockPopulatedServices();
  if (opts?.featured) res = res.filter((s) => s.featured);
  if (opts?.limit) res = res.slice(0, Math.min(40, Math.max(1, opts.limit)));
  return serialize(res.map(externalizeService));
}

async function loadFeatures(): Promise<IFeature[]> {
  try {
    const db = await connectDB();
    if (db) {
      const docs = await Feature.find({ active: { $ne: false } })
        .sort({ order: 1, _id: 1 })
        .lean<IFeature[]>();
      if (docs && docs.length > 0) {
        return serialize(docs);
      }
    }
  } catch (err) {
    console.error("getFeatures DB error:", err);
  }
  return serialize(mockSpecialFeatures.filter((f) => f.active));
}

async function loadServiceBySlug(
  slug: string
): Promise<PopulatedService | null> {
  if (!slug) return null;
  const raw = String(slug).trim();
  const decoded = decodeURIComponent(raw).trim();
  const slugDash = decoded.toLowerCase().replace(/\s+/g, "-");
  const slugSpace = decoded.toLowerCase().replace(/-/g, " ");

  try {
    const db = await connectDB();
    if (db) {
      const orConditions: Record<string, unknown>[] = [
        { slug: raw },
        { slug: decoded },
        { slug: slugDash },
        { slug: slugSpace },
        { slug: { $regex: new RegExp(`^${decoded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { slug: { $regex: new RegExp(`^${slugDash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { slug: { $regex: new RegExp(`^${slugSpace.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { title: { $regex: new RegExp(`^${decoded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        { title: { $regex: new RegExp(`^${slugSpace.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ];
      if (mongoose.Types.ObjectId.isValid(raw)) {
        orConditions.push({ _id: raw });
      }

      const doc = await Service.findOne({
        $or: orConditions,
        published: { $ne: false },
      })
        .populate({ path: "category", select: "_id name slug" })
        .populate({
          path: "relatedProducts",
          select: "_id name slug shortDescription image sku brand featured order category",
          populate: { path: "category", select: "_id name slug" },
        })
        .lean<PopulatedService | null>();
      if (doc) return serialize(externalizeService(doc));
    }
  } catch (err) {
    console.error("getServiceBySlug DB error:", err);
  }

  const s = getMockPopulatedServices().find((item) => {
    const itemSlug = (item.slug || "").toLowerCase();
    const itemTitle = (item.title || "").toLowerCase();
    return (
      itemSlug === raw.toLowerCase() ||
      itemSlug === decoded.toLowerCase() ||
      itemSlug === slugDash ||
      itemSlug === slugSpace ||
      itemTitle === decoded.toLowerCase() ||
      itemTitle === slugSpace ||
      item._id === raw
    );
  });
  return s ? serialize(externalizeService(s)) : null;
}

async function loadProducts(opts?: {
  featured?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ProductSummary[]> {
  const page = Math.max(1, Math.floor(Number(opts?.page) || 1));
  const limit = Math.min(40, Math.max(1, Math.floor(Number(opts?.limit) || 20)));
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (opts?.featured) filter.featured = true;

      if (opts?.categorySlug) {
        let catDoc = null;
        if (mongoose.Types.ObjectId.isValid(opts.categorySlug)) {
          catDoc = await Category.findById(opts.categorySlug)
            .select("_id name slug")
            .lean<ICategory | null>();
        }
        if (!catDoc) {
          catDoc = await Category.findOne({
            $or: [
              { slug: opts.categorySlug },
              { slug: { $regex: new RegExp(`^${opts.categorySlug}$`, "i") } },
              { name: { $regex: new RegExp(`^${opts.categorySlug.replace(/-/g, " ")}$`, "i") } },
            ],
          }).select("_id name slug").lean<ICategory | null>();
        }
        if (catDoc) {
          filter.$or = [
            { category: catDoc._id },
            { category: String(catDoc._id) },
            { category: catDoc.slug },
          ];
        } else {
          return [];
        }
      }

      if (opts?.subCategorySlug) {
        let subDoc = null;
        if (mongoose.Types.ObjectId.isValid(opts.subCategorySlug)) {
          subDoc = await SubCategory.findById(opts.subCategorySlug)
            .select("_id name slug")
            .lean<ISubCategory | null>();
        }
        if (!subDoc) {
          subDoc = await SubCategory.findOne({
            $or: [
              { slug: opts.subCategorySlug },
              { slug: { $regex: new RegExp(`^${opts.subCategorySlug}$`, "i") } },
              { name: { $regex: new RegExp(`^${opts.subCategorySlug.replace(/-/g, " ")}$`, "i") } },
            ],
          }).select("_id name slug").lean<ISubCategory | null>();
        }
        if (subDoc) {
          const subCondition = {
            $or: [
              { subCategory: subDoc._id },
              { subCategory: String(subDoc._id) },
              { subCategory: subDoc.slug },
            ],
          };
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, subCondition];
            delete filter.$or;
          } else {
            filter.$or = subCondition.$or;
          }
        } else {
          return [];
        }
      }

      if (opts?.q) {
        const qRegex = { $regex: opts.q, $options: "i" };
        const qCondition = {
          $or: [
            { name: qRegex },
            { shortDescription: qRegex },
            { description: qRegex },
            { sku: qRegex },
            { brand: qRegex },
          ],
        };
        if (filter.$and) {
          (filter.$and as unknown[]).push(qCondition);
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, qCondition];
          delete filter.$or;
        } else {
          filter.$or = qCondition.$or;
        }
      }

      const rawDocs = await Product.find(filter)
        .select("_id name slug shortDescription image sku brand featured order category subCategory")
        .sort({ order: 1, featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ProductSummaryRecord[]>();

      if (rawDocs && rawDocs.length > 0) {
        const summaries = await resolveProductSummaries(rawDocs);
        return serialize(
          summaries.map((product) =>
            externalizeRecordField(product, "product", product.slug, "image", "image")
          )
        );
      }
      return [];
    }
  } catch (err) {
    console.error("getProducts DB error:", err);
  }

  // If DB connection was truly unavailable, fallback to mock data
  let list = getMockPopulatedProducts();
  if (opts?.featured) list = list.filter((p) => p.featured);
  if (opts?.categorySlug) {
    list = list.filter(
      (p) =>
        p.category?.slug === opts.categorySlug ||
        String(p.category?._id) === opts.categorySlug
    );
  }
  if (opts?.subCategorySlug) {
    list = list.filter(
      (p) =>
        p.subCategory?.slug === opts.subCategorySlug ||
        String(p.subCategory?._id) === opts.subCategorySlug
    );
  }
  if (opts?.q) {
    const lq = opts.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        (p.sku ? p.sku.toLowerCase().includes(lq) : false) ||
        (p.brand ? p.brand.toLowerCase().includes(lq) : false)
    );
  }
  const start = (page - 1) * limit;
  return serialize(
    list.slice(start, start + limit).map((product) => {
      const summary = toProductSummary(product);
      return externalizeRecordField(summary, "product", summary.slug, "image", "image");
    })
  );
}

async function loadProductsTotalCount(opts?: {
  featured?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
}): Promise<number> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (opts?.featured) filter.featured = true;

      if (opts?.categorySlug) {
        let catDoc = null;
        if (mongoose.Types.ObjectId.isValid(opts.categorySlug)) {
          catDoc = await Category.findById(opts.categorySlug)
            .select("_id slug")
            .lean<ICategory | null>();
        }
        if (!catDoc) {
          catDoc = await Category.findOne({
            $or: [
              { slug: opts.categorySlug },
              { slug: { $regex: new RegExp(`^${opts.categorySlug}$`, "i") } },
              { name: { $regex: new RegExp(`^${opts.categorySlug.replace(/-/g, " ")}$`, "i") } },
            ],
          }).select("_id slug").lean<ICategory | null>();
        }
        if (catDoc) {
          filter.$or = [
            { category: catDoc._id },
            { category: String(catDoc._id) },
            { category: catDoc.slug },
          ];
        } else {
          return 0;
        }
      }

      if (opts?.subCategorySlug) {
        let subDoc = null;
        if (mongoose.Types.ObjectId.isValid(opts.subCategorySlug)) {
          subDoc = await SubCategory.findById(opts.subCategorySlug)
            .select("_id slug")
            .lean<ISubCategory | null>();
        }
        if (!subDoc) {
          subDoc = await SubCategory.findOne({
            $or: [
              { slug: opts.subCategorySlug },
              { slug: { $regex: new RegExp(`^${opts.subCategorySlug}$`, "i") } },
              { name: { $regex: new RegExp(`^${opts.subCategorySlug.replace(/-/g, " ")}$`, "i") } },
            ],
          }).select("_id slug").lean<ISubCategory | null>();
        }
        if (subDoc) {
          const subCondition = {
            $or: [
              { subCategory: subDoc._id },
              { subCategory: String(subDoc._id) },
              { subCategory: subDoc.slug },
            ],
          };
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, subCondition];
            delete filter.$or;
          } else {
            filter.$or = subCondition.$or;
          }
        } else {
          return 0;
        }
      }

      if (opts?.q) {
        const qRegex = { $regex: opts.q, $options: "i" };
        const qCondition = {
          $or: [
            { name: qRegex },
            { shortDescription: qRegex },
            { description: qRegex },
            { sku: qRegex },
            { brand: qRegex },
          ],
        };
        if (filter.$and) {
          (filter.$and as unknown[]).push(qCondition);
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, qCondition];
          delete filter.$or;
        } else {
          filter.$or = qCondition.$or;
        }
      }

      return await Product.countDocuments(filter);
    }
  } catch (err) {
    console.error("getProductsTotalCount DB error:", err);
  }
  return 0;
}

export type CatalogProductLink = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subCategory?: { _id: string; name: string; slug: string } | null;
};

async function loadCatalogProductLinks(categorySlug?: string): Promise<CatalogProductLink[]> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug })
          .select("_id slug")
          .lean<{ _id: unknown; slug: string } | null>();
        if (category) {
          filter.$or = [
            { category: category._id },
            { category: String(category._id) },
            { category: category.slug },
          ];
        } else {
          filter.category = categorySlug;
        }
      }
      const records = await Product.find(filter)
        .select("_id name slug image subCategory")
        .sort({ order: 1, name: 1 })
        .lean<ProductSummaryRecord[]>();
      if (!records.length) return [];
      const refs = [...new Set(records.map((record) => relationRef(record.subCategory)).filter((ref): ref is string => Boolean(ref)))];
      const subcategoryFilter = relationLookupFilter(refs);
      const subcategoryDocs = subcategoryFilter
        ? await SubCategory.find(subcategoryFilter).select("_id name slug").lean<MinimalRelation[]>()
        : [];
      const subcategories = relationMap(subcategoryDocs);
      return serialize(
        records.map((record) => {
          const product: CatalogProductLink = {
            _id: String(record._id),
            name: record.name,
            slug: record.slug,
            image: record.image,
            subCategory: resolveRelation(record.subCategory, subcategories),
          };
          return externalizeRecordField(
            product,
            "product",
            product.slug,
            "image",
            "image"
          );
        })
      );
    }
  } catch (err) {
    console.error("getCatalogProductLinks DB error:", err);
  }
  return serialize(
    getMockPopulatedProducts()
      .filter((product) => !categorySlug || product.category.slug === categorySlug)
      .map((product) => {
        const summary = toProductSummary(product);
        return {
          _id: String(summary._id),
          name: summary.name,
          slug: summary.slug,
          image: summary.image,
          subCategory: summary.subCategory
            ? { ...summary.subCategory, _id: String(summary.subCategory._id) }
            : null,
        };
      })
  );
}

async function loadProductSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const db = await connectDB();
    if (db) {
      return serialize(
        await Product.find({ published: { $ne: false } })
          .select("slug")
          .sort({ slug: 1 })
          .lean<Array<{ slug: string }>>()
      );
    }
  } catch (err) {
    console.error("getProductSlugs DB error:", err);
  }
  return getMockPopulatedProducts().map(({ slug }) => ({ slug }));
}

async function loadServiceSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const db = await connectDB();
    if (db) {
      return serialize(
        await Service.find({ published: { $ne: false } })
          .select("slug")
          .sort({ slug: 1 })
          .lean<Array<{ slug: string }>>()
      );
    }
  } catch (err) {
    console.error("getServiceSlugs DB error:", err);
  }
  return getMockPopulatedServices().map(({ slug }) => ({ slug }));
}

async function loadUseCaseSlugs(): Promise<Array<{ slug: string }>> {
  try {
    const db = await connectDB();
    if (db) {
      return serialize(
        await UseCase.find({ published: true })
          .select("slug")
          .sort({ slug: 1 })
          .lean<Array<{ slug: string }>>()
      );
    }
  } catch (err) {
    console.error("getUseCaseSlugs DB error:", err);
  }
  return useCaseContent.map(({ slug }) => ({ slug }));
}

async function loadProductBySlug(
  slug: string
): Promise<PopulatedProduct | null> {
  try {
    const db = await connectDB();
    if (db) {
      const decodedSlug = decodeURIComponent(slug).trim();
      const slugRegex = new RegExp(`^${decodedSlug}$`, "i");

      let doc = await Product.findOne({
        $or: [
          { slug: decodedSlug },
          { slug: slugRegex },
          { sku: decodedSlug },
          { sku: slugRegex },
        ],
        published: { $ne: false },
      })
        .populate({ path: "category", select: "_id name slug" })
        .populate({ path: "subCategory", select: "_id name slug" })
        .populate({
          path: "relatedServices",
          select: "_id title slug shortDescription image",
        })
        .lean<PopulatedProduct | null>();

      if (!doc && mongoose.Types.ObjectId.isValid(decodedSlug)) {
        doc = await Product.findOne({ _id: decodedSlug, published: { $ne: false } })
          .populate({ path: "category", select: "_id name slug" })
          .populate({ path: "subCategory", select: "_id name slug" })
          .populate({
            path: "relatedServices",
            select: "_id title slug shortDescription image",
          })
          .lean<PopulatedProduct | null>();
      }

      if (doc) {
        if (!doc.category || typeof doc.category !== "object" || !("name" in doc.category)) {
          const catId = String(doc.category);
          let foundCat = null;
          if (mongoose.Types.ObjectId.isValid(catId)) {
            foundCat = await Category.findById(catId).lean<ICategory | null>();
          }
          if (!foundCat) {
            foundCat = await Category.findOne({
              $or: [{ slug: catId }, { slug: new RegExp(`^${catId}$`, "i") }, { name: catId }],
            }).lean<ICategory | null>();
          }
          if (foundCat) doc.category = foundCat;
        }

        if (doc.subCategory && (typeof doc.subCategory !== "object" || !("name" in doc.subCategory))) {
          const subId = String(doc.subCategory);
          let foundSub = null;
          if (mongoose.Types.ObjectId.isValid(subId)) {
            foundSub = await SubCategory.findById(subId).lean<ISubCategory | null>();
          }
          if (!foundSub) {
            foundSub = await SubCategory.findOne({
              $or: [{ slug: subId }, { slug: new RegExp(`^${subId}$`, "i") }, { name: subId }],
            }).lean<ISubCategory | null>();
          }
          if (foundSub) doc.subCategory = foundSub;
        }

        return serialize(externalizeProductImages(doc));
      }
    }
  } catch (err) {
    console.error("getProductBySlug DB error:", err);
  }

  const p = getMockPopulatedProducts().find(
    (item) => item.slug === slug || String(item._id) === slug || item.sku === slug
  );
  return p ? serialize(externalizeProductImages(p)) : null;
}


async function loadRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 15
): Promise<ProductSummary[]> {
  const safeLimit = Math.min(40, Math.max(1, Math.floor(Number(limit) || 15)));
  try {
    const db = await connectDB();
    if (db) {
      let catFilter: Record<string, unknown> = { category: categoryId };
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        catFilter = {
          $or: [
            { category: new mongoose.Types.ObjectId(categoryId) },
            { category: categoryId },
          ],
        };
      }

      const primaryDocs = await Product.find({
        ...catFilter,
        slug: { $ne: excludeSlug },
        published: { $ne: false },
      })
        .select("_id name slug shortDescription image sku brand featured order category subCategory")
        .sort({ order: 1, _id: 1 })
        .limit(safeLimit)
        .lean<ProductSummaryRecord[]>();

      if (primaryDocs && primaryDocs.length >= safeLimit) {
        const summaries = await resolveProductSummaries(primaryDocs);
        return serialize(dedupeRelatedProducts(summaries, excludeSlug).map((product) =>
          externalizeRecordField(product, "product", product.slug, "image", "image")
        ));
      }

      const existingIds = (primaryDocs || []).map((d) => d._id);
      const extraNeeded = safeLimit - (primaryDocs ? primaryDocs.length : 0);

      const fallbackDocs = await Product.find({
        _id: { $nin: existingIds.length ? existingIds : [null] },
        slug: { $ne: excludeSlug },
        published: { $ne: false },
      })
        .select("_id name slug shortDescription image sku brand featured order category subCategory")
        .sort({ featured: -1, order: 1, _id: 1 })
        .limit(extraNeeded)
        .lean<ProductSummaryRecord[]>();

      const summaries = await resolveProductSummaries([
        ...(primaryDocs || []),
        ...(fallbackDocs || []),
      ]);
      return serialize(
        dedupeRelatedProducts(summaries, excludeSlug).map((product) =>
          externalizeRecordField(product, "product", product.slug, "image", "image")
        )
      );
    }
  } catch (err) {
    console.error("getRelatedProducts DB error:", err);
  }

  const allMock = getMockPopulatedProducts().filter((p) => p.slug !== excludeSlug);
  const sameCat = allMock.filter(
    (p) =>
      String(p.category._id) === String(categoryId) ||
      p.category.slug === categoryId
  );
  const otherCat = allMock.filter(
    (p) =>
      String(p.category._id) !== String(categoryId) &&
      p.category.slug !== categoryId
  );

  sameCat.sort((a, b) => (a.order || 999) - (b.order || 999));
  otherCat.sort((a, b) => (a.order || 999) - (b.order || 999));

  return serialize(
    dedupeRelatedProducts([...sameCat, ...otherCat].map(toProductSummary), excludeSlug)
      .slice(0, safeLimit)
      .map((product) =>
        externalizeRecordField(product, "product", product.slug, "image", "image")
      )
  );
}

function dedupeRelatedProducts(items: ProductSummary[], excludeSlug: string) {
  const seen = new Set<string>();
  return items.filter((p) => {
    if (!p || p.slug === excludeSlug) return false;
    const id = String(p._id);
    if (seen.has(id) || seen.has(p.slug)) return false;
    seen.add(id);
    seen.add(p.slug);
    return true;
  });
}

function toUseCaseDoc(item: (typeof useCaseContent)[number]): IUseCase {
  return {
    _id: item.slug,
    ...item,
    published: true,
  };
}

async function loadUseCases(): Promise<IUseCase[]> {
  try {
    const db = await connectDB();
    if (!db) return useCaseContent.map(toUseCaseDoc);
    const docs = await UseCase.find({ published: true })
      .sort({ order: 1 })
      .lean<IUseCase[]>();
    if (docs.length) {
      return serialize(
        docs.map((item) =>
          externalizeRecordField(item, "use-case", String(item.slug), "image", "image")
        )
      );
    }
  } catch {
    // fall through to editorial content
  }
  return useCaseContent
    .map(toUseCaseDoc)
    .map((item) =>
      externalizeRecordField(item, "use-case", String(item.slug), "image", "image")
    );
}

async function loadUseCaseBySlug(slug: string): Promise<IUseCase | null> {
  try {
    const db = await connectDB();
    if (!db) {
      const local = useCaseContent.find((item) => item.slug === slug);
      return local ? toUseCaseDoc(local) : null;
    }
    const doc = await UseCase.findOne({ slug, published: true }).lean<IUseCase | null>();
    if (doc) {
      return serialize(
        externalizeRecordField(doc, "use-case", String(doc.slug), "image", "image")
      );
    }
  } catch {
    // fall through
  }
  const local = useCaseContent.find((item) => item.slug === slug);
  return local
    ? externalizeRecordField(
        toUseCaseDoc(local),
        "use-case",
        String(local.slug),
        "image",
        "image"
      )
    : null;
}

export type PopulatedBlogPost = Omit<IBlogPost, "category" | "_id"> & {
  _id: string;
  category?: { _id: string; name: string; slug: string } | null;
  readTime?: string;
};

async function loadBlogCategories(): Promise<IMockBlogCategory[]> {
  try {
    const db = await connectDB();
    if (!db) return mockBlogCategories;
    const docs = await BlogCategory.find({ active: true })
      .select("_id name slug order active")
      .sort({ order: 1, name: 1 })
      .lean();
    if (docs.length) return serialize(docs) as unknown as IMockBlogCategory[];
  } catch {
    // fall through
  }
  return mockBlogCategories;
}

async function loadBlogPosts(options?: {
  categorySlug?: string;
  limit?: number;
  page?: number;
}): Promise<PopulatedBlogPost[]> {
  const page = Math.max(1, Math.floor(Number(options?.page) || 1));
  const limit = Math.min(30, Math.max(1, Math.floor(Number(options?.limit) || 12)));
  try {
    const db = await connectDB();
    if (!db) {
      let localPosts = mockBlogPosts.filter((p) => p.status === "published");
      if (options?.categorySlug) {
        localPosts = localPosts.filter((p) => p.category.slug === options.categorySlug);
      }
      const start = (page - 1) * limit;
      return localPosts.slice(start, start + limit) as unknown as PopulatedBlogPost[];
    }
    const filter: Record<string, unknown> = { status: "published" };
    if (options?.categorySlug) {
      const cat = await BlogCategory.findOne({ slug: options.categorySlug })
        .select("_id")
        .lean<{ _id: unknown } | null>();
      if (!cat) return [];
      filter.category = cat._id;
    }

    const query = BlogPost.find(filter)
      .select("_id title slug summary coverImage category author featured createdAt")
      .populate({ path: "category", select: "_id name slug" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const docs = await query.lean();
    if (docs.length) {
      return serialize(
        docs.map((post) =>
          externalizeRecordField(
            post,
            "blog-post",
            String(post.slug),
            "coverImage",
            "coverImage"
          )
        )
      ) as unknown as PopulatedBlogPost[];
    }
  } catch {
    // fall through
  }

  let posts = mockBlogPosts.filter((p) => p.status === "published");
  if (options?.categorySlug) {
    posts = posts.filter((p) => p.category.slug === options.categorySlug);
  }
  const start = (page - 1) * limit;
  posts = posts.slice(start, start + limit);
  return posts.map((post) =>
    externalizeRecordField(
      post,
      "blog-post",
      String(post.slug),
      "coverImage",
      "coverImage"
    )
  ) as unknown as PopulatedBlogPost[];
}

async function loadBlogPostsTotalCount(options?: {
  categorySlug?: string;
}): Promise<number> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { status: "published" };
      if (options?.categorySlug) {
        const category = await BlogCategory.findOne({ slug: options.categorySlug })
          .select("_id")
          .lean<{ _id: unknown } | null>();
        if (!category) return 0;
        filter.category = category._id;
      }
      return await BlogPost.countDocuments(filter);
    }
  } catch {
    // fall through to the local editorial data
  }
  return mockBlogPosts.filter(
    (post) =>
      post.status === "published" &&
      (!options?.categorySlug || post.category.slug === options.categorySlug)
  ).length;
}

async function loadBlogPostBySlug(
  slug: string
): Promise<PopulatedBlogPost | null> {
  try {
    const db = await connectDB();
    if (!db) {
      const local = mockBlogPosts.find((p) => p.slug === slug);
      return local
        ? (externalizeRecordField(
            local,
            "blog-post",
            String(local.slug),
            "coverImage",
            "coverImage"
          ) as unknown as PopulatedBlogPost)
        : null;
    }
    const doc = await BlogPost.findOne({ slug, status: "published" })
      .populate("category", "name slug")
      .lean<IBlogPost | null>();
    if (doc) {
      return serialize(
        externalizeRecordField(
          doc,
          "blog-post",
          String(doc.slug),
          "coverImage",
          "coverImage"
        )
      ) as unknown as PopulatedBlogPost;
    }
  } catch {
    // fall through
  }

  const post = mockBlogPosts.find((p) => p.slug === slug);
  return post
    ? (externalizeRecordField(
        post,
        "blog-post",
        String(post.slug),
        "coverImage",
        "coverImage"
      ) as unknown as PopulatedBlogPost)
    : null;
}

async function loadRelatedBlogPosts(
  currentSlug: string,
  categorySlug?: string,
  limit = 3
): Promise<PopulatedBlogPost[]> {
  const safeLimit = Math.min(10, Math.max(1, Math.floor(Number(limit) || 3)));
  try {
    const db = await connectDB();
    if (db) {
      const baseFilter: Record<string, unknown> = {
        status: "published",
        slug: { $ne: currentSlug },
      };
      let categoryId: unknown;
      if (categorySlug) {
        const category = await BlogCategory.findOne({ slug: categorySlug })
          .select("_id")
          .lean<{ _id: unknown } | null>();
        categoryId = category?._id;
      }
      const fields = "_id title slug summary coverImage category author featured createdAt";
      const populate = { path: "category", select: "_id name slug" };
      const sameCategory = categoryId
        ? await BlogPost.find({ ...baseFilter, category: categoryId })
            .select(fields)
            .populate(populate)
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .lean()
        : await BlogPost.find(baseFilter)
            .select(fields)
            .populate(populate)
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .lean();

      let docs = sameCategory;
      if (categoryId && docs.length < safeLimit) {
        const extra = await BlogPost.find({
          ...baseFilter,
          category: { $ne: categoryId },
          _id: { $nin: docs.map((post) => post._id) },
        })
          .select(fields)
          .populate(populate)
          .sort({ createdAt: -1 })
          .limit(safeLimit - docs.length)
          .lean();
        docs = [...docs, ...extra];
      }
      return serialize(
        docs.map((post) =>
          externalizeRecordField(
            post,
            "blog-post",
            String(post.slug),
            "coverImage",
            "coverImage"
          )
        )
      ) as unknown as PopulatedBlogPost[];
    }
  } catch {
    // fall through to local editorial data
  }

  const others = mockBlogPosts
    .filter((post) => post.status === "published" && post.slug !== currentSlug)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const sameCategory = categorySlug
    ? others.filter((post) => post.category.slug === categorySlug)
    : others;
  const remaining = categorySlug
    ? others.filter((post) => post.category.slug !== categorySlug)
    : [];
  return [...sameCategory, ...remaining]
    .slice(0, safeLimit)
    .map((post) =>
      externalizeRecordField(
        post,
        "blog-post",
        String(post.slug),
        "coverImage",
        "coverImage"
      )
    ) as unknown as PopulatedBlogPost[];
}

export const getCompany = withReadCache("company", loadCompany);
export const getCategories = withReadCache("categories", loadCategories);
export const getSubCategories = withReadCache("subcategories", loadSubCategories);
export const getBrands = withReadCache("brands", loadBrands);
export const getBanners = withReadCache("banners", loadBanners);
export const getServices = withReadCache("services", loadServices);
export const getFeatures = withReadCache("features", loadFeatures);
export const getServiceBySlug = withReadCache("service-by-slug", loadServiceBySlug);
export const getProducts = withReadCache("products", loadProducts);
export const getProductsTotalCount = withReadCache("product-count", loadProductsTotalCount);
export const getProductBySlug = withReadCache("product-by-slug", loadProductBySlug);
export const getRelatedProducts = withReadCache("related-products", loadRelatedProducts);
export const getCatalogProductLinks = withReadCache("catalog-product-links", loadCatalogProductLinks);
export const getProductSlugs = withReadCache("product-slugs", loadProductSlugs);
export const getServiceSlugs = withReadCache("service-slugs", loadServiceSlugs);
export const getUseCaseSlugs = withReadCache("use-case-slugs", loadUseCaseSlugs);
export const getUseCases = withReadCache("use-cases", loadUseCases);
export const getUseCaseBySlug = withReadCache("use-case-by-slug", loadUseCaseBySlug);
export const getBlogCategories = withReadCache("blog-categories", loadBlogCategories);
export const getBlogPosts = withReadCache("blog-posts", loadBlogPosts);
export const getBlogPostsTotalCount = withReadCache("blog-post-count", loadBlogPostsTotalCount);
export const getRelatedBlogPosts = withReadCache("related-blog-posts", loadRelatedBlogPosts);
export const getBlogPostBySlug = withReadCache("blog-post-by-slug", loadBlogPostBySlug);
