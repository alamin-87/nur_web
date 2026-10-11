import fs from "fs";
import path from "path";
import {
  mockCategories,
  mockSubCategories,
  mockProducts,
} from "./mock-data";
import { fallbackSettings } from "./data";

export interface StoredCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  type: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredSubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  order: number;
  published: boolean;
}

export interface StoredBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface StoredProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  category?: string | StoredCategory;
  subCategory?: string | StoredSubCategory | null;
  shortDescription?: string;
  description?: string;
  price?: number;
  currency: string;
  image: string;
  gallery?: string[];
  videoUrl?: string;
  specs?: Array<{ key: string; value: string }>;
  specTable?: Array<{ parameter: string; specification: string }>;
  atAGlance?: string[];
  includedItems?: string[];
  beforeYouOrder?: string[];
  condition?: string;
  packing?: string;
  warranty?: string;
  warrantyAndReturns?: string;
  availabilityText?: string;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  order: number;
  relatedProducts?: string[];
  relatedServices?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredMedia {
  _id: string;
  title: string;
  filename: string;
  url: string;
  data?: string;
  mimeType: string;
  size: number;
  folder?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UnifiedStoreState {
  categories: StoredCategory[];
  subcategories: StoredSubCategory[];
  brands: StoredBrand[];
  products: StoredProduct[];
  settings: Record<string, unknown>;
  companyProfile: Record<string, unknown>;
  media: StoredMedia[];
}

const STORE_FILE = path.join("/tmp", "nes_catalog_store_v1.json");

declare global {
  var __nes_unified_store: UnifiedStoreState | undefined;
}

function getInitialState(): UnifiedStoreState {
  const defaultBrands: StoredBrand[] = [
    { _id: "b1", name: "Siemens", slug: "siemens", description: "Industrial Automation & Drives", active: true, order: 1 },
    { _id: "b2", name: "Delta Electronics", slug: "delta", description: "VFD, PLC & Motion Control", active: true, order: 2 },
    { _id: "b3", name: "Mitsubishi Electric", slug: "mitsubishi", description: "PLC, HMI & Inverters", active: true, order: 3 },
    { _id: "b4", name: "Omron", slug: "omron", description: "Sensors, Relays & Timers", active: true, order: 4 },
    { _id: "b5", name: "Schneider Electric", slug: "schneider", description: "Switchgear, Contactors & Breakers", active: true, order: 5 },
    { _id: "b6", name: "ABB", slug: "abb", description: "Drives, Motors & Robotics", active: true, order: 6 },
  ];

  return {
    categories: JSON.parse(JSON.stringify(mockCategories)),
    subcategories: JSON.parse(JSON.stringify(mockSubCategories)),
    brands: defaultBrands,
    products: JSON.parse(JSON.stringify(mockProducts)),
    settings: JSON.parse(JSON.stringify(fallbackSettings)),
    companyProfile: {},
    media: [],
  };
}

const globalForStore = globalThis as unknown as { __nes_unified_store?: UnifiedStoreState };

function loadStore(): UnifiedStoreState {
  if (globalForStore.__nes_unified_store) {
    return globalForStore.__nes_unified_store;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
        globalForStore.__nes_unified_store = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read store file from /tmp:", err);
  }

  const initial = getInitialState();
  globalForStore.__nes_unified_store = initial;
  saveStore(initial);
  return initial;
}

function saveStore(state: UnifiedStoreState) {
  globalForStore.__nes_unified_store = state;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(state), "utf-8");
  } catch {
    // Ignore if ephemeral fs cannot write
  }
}

// ----------------------------------------------------
// CATEGORY OPERATIONS
// ----------------------------------------------------
export function getStoredCategories(type?: string): StoredCategory[] {
  const store = loadStore();
  let list = store.categories;
  if (type) {
    list = list.filter((c) => c.type === type);
  }
  return list.map((cat) => ({
    ...cat,
    productCount: store.products.filter(
      (p) => String(typeof p.category === "object" && p.category ? (p.category as StoredCategory)._id : p.category) === String(cat._id)
    ).length,
  }));
}

export function getStoredCategoryByIdOrSlug(idOrSlug: string): StoredCategory | null {
  const store = loadStore();
  const found = store.categories.find((c) => c._id === idOrSlug || c.slug === idOrSlug);
  return found ? { ...found } : null;
}

export function saveStoredCategory(data: Partial<StoredCategory>): StoredCategory {
  const store = loadStore();
  const slug = (data.slug || data.name || "cat")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

  const newCat: StoredCategory = {
    _id: data._id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "Untitled Category",
    slug,
    description: data.description || "",
    order: Number(data.order) || store.categories.length + 1,
    type: data.type || "product",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.categories.push(newCat);
  saveStore(store);
  return newCat;
}

export function updateStoredCategory(id: string, data: Partial<StoredCategory>): StoredCategory | null {
  const store = loadStore();
  const idx = store.categories.findIndex((c) => c._id === id || c.slug === id);
  if (idx === -1) return null;

  const existing = store.categories[idx];
  const updated: StoredCategory = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  store.categories[idx] = updated;
  saveStore(store);
  return updated;
}

export function deleteStoredCategory(id: string): boolean {
  const store = loadStore();
  const prevLen = store.categories.length;
  store.categories = store.categories.filter((c) => c._id !== id && c.slug !== id);
  if (store.categories.length !== prevLen) {
    saveStore(store);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// SUBCATEGORY OPERATIONS
// ----------------------------------------------------
export function getStoredSubCategories(categorySlugOrId?: string): StoredSubCategory[] {
  const store = loadStore();
  let list = store.subcategories;
  if (categorySlugOrId) {
    const parent = store.categories.find((c) => c._id === categorySlugOrId || c.slug === categorySlugOrId);
    if (parent) {
      list = list.filter((s) => String(s.category) === String(parent._id));
    }
  }
  return list;
}

export function saveStoredSubCategory(data: Partial<StoredSubCategory>): StoredSubCategory {
  const store = loadStore();
  const slug = (data.slug || data.name || "sub")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

  const newSub: StoredSubCategory = {
    _id: data._id || `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "Untitled Subcategory",
    slug,
    category: String(data.category || ""),
    order: Number(data.order) || store.subcategories.length + 1,
    published: data.published !== false,
  };

  store.subcategories.push(newSub);
  saveStore(store);
  return newSub;
}

export function updateStoredSubCategory(id: string, data: Partial<StoredSubCategory>): StoredSubCategory | null {
  const store = loadStore();
  const idx = store.subcategories.findIndex((s) => s._id === id || s.slug === id);
  if (idx === -1) return null;

  const existing = store.subcategories[idx];
  const updated: StoredSubCategory = {
    ...existing,
    ...data,
  };

  store.subcategories[idx] = updated;
  saveStore(store);
  return updated;
}

export function deleteStoredSubCategory(id: string): boolean {
  const store = loadStore();
  const prevLen = store.subcategories.length;
  store.subcategories = store.subcategories.filter((s) => s._id !== id && s.slug !== id);
  if (store.subcategories.length !== prevLen) {
    saveStore(store);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// BRAND OPERATIONS
// ----------------------------------------------------
export function getStoredBrands(): StoredBrand[] {
  const store = loadStore();
  return store.brands;
}

export function getStoredBrandByIdOrSlug(idOrSlug: string): StoredBrand | null {
  const store = loadStore();
  const found = store.brands.find((b) => b._id === idOrSlug || b.slug === idOrSlug);
  return found ? { ...found } : null;
}

export function saveStoredBrand(data: Partial<StoredBrand>): StoredBrand {
  const store = loadStore();
  const slug = (data.slug || data.name || "brand")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

  const newBrand: StoredBrand = {
    _id: data._id || `brand_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "Untitled Brand",
    slug,
    logo: data.logo || "",
    description: data.description || "",
    order: Number(data.order) || store.brands.length + 1,
    active: data.active !== false,
  };

  store.brands.push(newBrand);
  saveStore(store);
  return newBrand;
}

export function updateStoredBrand(id: string, data: Partial<StoredBrand>): StoredBrand | null {
  const store = loadStore();
  const idx = store.brands.findIndex((b) => b._id === id || b.slug === id);
  if (idx === -1) return null;

  const existing = store.brands[idx];
  const updated: StoredBrand = {
    ...existing,
    ...data,
  };

  store.brands[idx] = updated;
  saveStore(store);
  return updated;
}

export function deleteStoredBrand(id: string): boolean {
  const store = loadStore();
  const prevLen = store.brands.length;
  store.brands = store.brands.filter((b) => b._id !== id && b.slug !== id);
  if (store.brands.length !== prevLen) {
    saveStore(store);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// PRODUCT OPERATIONS
// ----------------------------------------------------
export function getStoredProducts(opts?: {
  featured?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
  stock?: string;
  published?: string;
  page?: number;
  limit?: number;
}): { items: StoredProduct[]; total: number } {
  const store = loadStore();
  const catMap = new Map(store.categories.map((c) => [String(c._id), c]));
  const subMap = new Map(store.subcategories.map((s) => [String(s._id), s]));

  let list = store.products.map((p) => {
    const rawCat = p.category;
    let populatedCat: StoredCategory = {
      _id: "cat-general",
      name: "General",
      slug: "general",
      order: 0,
      type: "product",
    };

    if (typeof rawCat === "object" && rawCat !== null) {
      populatedCat = rawCat as StoredCategory;
    } else if (rawCat && catMap.has(String(rawCat))) {
      populatedCat = catMap.get(String(rawCat))!;
    }

    let populatedSub: StoredSubCategory | null = null;
    if (typeof p.subCategory === "object" && p.subCategory !== null) {
      populatedSub = p.subCategory as StoredSubCategory;
    } else if (p.subCategory && subMap.has(String(p.subCategory))) {
      populatedSub = subMap.get(String(p.subCategory))!;
    }

    return {
      ...p,
      category: populatedCat,
      subCategory: populatedSub,
    };
  });

  if (opts?.featured) {
    list = list.filter((p) => p.featured);
  }

  if (opts?.categorySlug) {
    list = list.filter((p) => {
      const cat = p.category as StoredCategory;
      return cat?.slug === opts.categorySlug || String(cat?._id) === opts.categorySlug;
    });
  }

  if (opts?.subCategorySlug) {
    list = list.filter((p) => {
      const sub = p.subCategory as StoredSubCategory;
      return sub?.slug === opts.subCategorySlug || String(sub?._id) === opts.subCategorySlug;
    });
  }

  if (opts?.stock === "in") {
    list = list.filter((p) => p.inStock);
  } else if (opts?.stock === "out") {
    list = list.filter((p) => !p.inStock);
  }

  if (opts?.published === "true") {
    list = list.filter((p) => p.published !== false);
  } else if (opts?.published === "false") {
    list = list.filter((p) => p.published === false);
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

  const total = list.length;
  if (opts?.page && opts?.limit) {
    const start = (opts.page - 1) * opts.limit;
    list = list.slice(start, start + opts.limit);
  }

  return { items: list, total };
}

export function getStoredProductByIdOrSlug(idOrSlug: string): StoredProduct | null {
  const store = loadStore();
  const catMap = new Map(store.categories.map((c) => [String(c._id), c]));
  const subMap = new Map(store.subcategories.map((s) => [String(s._id), s]));

  const found = store.products.find(
    (p) => p._id === idOrSlug || p.slug === idOrSlug || (p.sku && p.sku === idOrSlug)
  );

  if (!found) return null;

  const rawCat = found.category;
  let populatedCat: StoredCategory = {
    _id: "cat-general",
    name: "General",
    slug: "general",
    order: 0,
    type: "product",
  };

  if (typeof rawCat === "object" && rawCat !== null) {
    populatedCat = rawCat as StoredCategory;
  } else if (rawCat && catMap.has(String(rawCat))) {
    populatedCat = catMap.get(String(rawCat))!;
  }

  let populatedSub: StoredSubCategory | null = null;
  if (typeof found.subCategory === "object" && found.subCategory !== null) {
    populatedSub = found.subCategory as StoredSubCategory;
  } else if (found.subCategory && subMap.has(String(found.subCategory))) {
    populatedSub = subMap.get(String(found.subCategory))!;
  }

  return {
    ...found,
    category: populatedCat,
    subCategory: populatedSub,
  };
}

export function saveStoredProduct(data: Partial<StoredProduct>): StoredProduct {
  const store = loadStore();
  let slug = (data.slug || data.name || "product")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (store.products.some((p) => p.slug === slug)) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const newProduct: StoredProduct = {
    _id: data._id || `prd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "Untitled Product",
    slug,
    sku: data.sku || "",
    brand: data.brand || "",
    category: typeof data.category === "object" && data.category ? (data.category as StoredCategory)._id : (data.category || "cat-1"),
    subCategory: typeof data.subCategory === "object" && data.subCategory ? (data.subCategory as StoredSubCategory)._id : (data.subCategory || null),
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    currency: data.currency || "BDT",
    image: data.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    videoUrl: data.videoUrl || undefined,
    specs: Array.isArray(data.specs) ? data.specs : [],
    specTable: Array.isArray(data.specTable) ? data.specTable : [],
    atAGlance: Array.isArray(data.atAGlance) ? data.atAGlance : [],
    includedItems: Array.isArray(data.includedItems) ? data.includedItems : [],
    beforeYouOrder: Array.isArray(data.beforeYouOrder) ? data.beforeYouOrder : [],
    condition: data.condition || "Brand New (Unused)",
    packing: data.packing || "Original Factory Packaging",
    warranty: data.warranty || "12 Months Manufacturer Warranty",
    warrantyAndReturns: data.warrantyAndReturns || "",
    availabilityText: data.availabilityText || "Ready for dispatch",
    inStock: data.inStock !== false,
    featured: Boolean(data.featured),
    published: data.published !== false,
    order: Number(data.order) || store.products.length + 1,
    relatedProducts: Array.isArray(data.relatedProducts) ? data.relatedProducts : [],
    relatedServices: Array.isArray(data.relatedServices) ? data.relatedServices : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.products.unshift(newProduct);
  saveStore(store);
  return newProduct;
}

export function updateStoredProduct(idOrSlug: string, data: Partial<StoredProduct>): StoredProduct | null {
  const store = loadStore();
  const idx = store.products.findIndex((p) => p._id === idOrSlug || p.slug === idOrSlug || (p.sku && p.sku === idOrSlug));
  if (idx === -1) return null;

  const existing = store.products[idx];
  const updated: StoredProduct = {
    ...existing,
    ...data,
    category: typeof data.category === "object" && data.category ? (data.category as StoredCategory)._id : (data.category !== undefined ? data.category : existing.category),
    subCategory: typeof data.subCategory === "object" && data.subCategory ? (data.subCategory as StoredSubCategory)._id : (data.subCategory !== undefined ? data.subCategory : existing.subCategory),
    updatedAt: new Date().toISOString(),
  };

  store.products[idx] = updated;
  saveStore(store);
  return updated;
}

export function deleteStoredProduct(idOrSlug: string): boolean {
  const store = loadStore();
  const prevLen = store.products.length;
  store.products = store.products.filter((p) => p._id !== idOrSlug && p.slug !== idOrSlug && p.sku !== idOrSlug);
  if (store.products.length !== prevLen) {
    saveStore(store);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// SETTINGS OPERATIONS
// ----------------------------------------------------
export function getStoredSettings(): Record<string, unknown> {
  const store = loadStore();
  return {
    ...fallbackSettings,
    ...store.settings,
    social: {
      ...fallbackSettings.social,
      ...((store.settings.social as Record<string, string>) || {}),
    },
    footerQr: {
      ...fallbackSettings.footerQr,
      ...((store.settings.footerQr as Record<string, unknown>) || {}),
    },
    seo: {
      ...fallbackSettings.seo,
      ...((store.settings.seo as Record<string, unknown>) || {}),
    },
    analytics: {
      ...fallbackSettings.analytics,
      ...((store.settings.analytics as Record<string, string>) || {}),
    },
  };
}

export function updateStoredSettings(data: Record<string, unknown>): Record<string, unknown> {
  const store = loadStore();
  const current = store.settings || {};
  const merged = {
    ...fallbackSettings,
    ...current,
    ...data,
    social: {
      ...fallbackSettings.social,
      ...((current.social as Record<string, string>) || {}),
      ...((data.social as Record<string, string>) || {}),
    },
    footerQr: {
      ...fallbackSettings.footerQr,
      ...((current.footerQr as Record<string, unknown>) || {}),
      ...((data.footerQr as Record<string, unknown>) || {}),
    },
    seo: {
      ...fallbackSettings.seo,
      ...((current.seo as Record<string, unknown>) || {}),
      ...((data.seo as Record<string, unknown>) || {}),
    },
    analytics: {
      ...fallbackSettings.analytics,
      ...((current.analytics as Record<string, string>) || {}),
      ...((data.analytics as Record<string, string>) || {}),
    },
  };

  store.settings = merged;
  saveStore(store);
  return merged;
}

// ----------------------------------------------------
// MEDIA OPERATIONS
// ----------------------------------------------------
export function getStoredMedia(q?: string): StoredMedia[] {
  const store = loadStore();
  let list = store.media;
  if (q) {
    const lq = q.toLowerCase();
    list = list.filter((m) => m.title.toLowerCase().includes(lq) || m.filename.toLowerCase().includes(lq));
  }
  return list;
}

export function saveStoredMedia(item: StoredMedia): StoredMedia {
  const store = loadStore();
  store.media.unshift(item);
  saveStore(store);
  return item;
}

export function deleteStoredMedia(id: string): boolean {
  const store = loadStore();
  const prevLen = store.media.length;
  store.media = store.media.filter((m) => m._id !== id);
  if (store.media.length !== prevLen) {
    saveStore(store);
    return true;
  }
  return false;
}
