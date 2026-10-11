"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSite } from "@/components/SiteProvider";
import type { ICategory } from "@/lib/models";

interface SubCategoryItem {
  _id: string;
  name: string;
  slug: string;
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    image: string;
  }>;
}

interface CategoryTreeItem {
  _id: string;
  name: string;
  slug: string;
  subcategories: SubCategoryItem[];
}

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: ICategory[];
  activeSlug?: string;
}) {
  const site = useSite();
  const rawWa = site.social?.whatsapp || site.phone || "+880170000000";
  const whatsappUrl = rawWa.startsWith("http")
    ? rawWa
    : `https://wa.me/${rawWa.replace(/[^\d+]/g, "").replace(/^\+/, "")}`;
  const whatsappDisplay = site.social?.whatsapp || site.phone || "+880 1700-000000";
  const emailDisplay = site.email || "ceo@nurengineering.bd.com";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<Record<string, CategoryTreeItem>>({});

  // Hover states for Desktop Flyout Menu
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
  const [hoveredSubCategorySlug, setHoveredSubCategorySlug] = useState<string | null>(null);

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch catalog tree on mount
  useEffect(() => {
    const params = new URLSearchParams({ includeProducts: "true" });
    fetch(`/api/catalog-tree?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.tree) {
          setTreeData(data.tree);
        }
      })
      .catch((err) => console.error("Error loading catalog tree:", err));
  }, []);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  // --- Hover Handlers with Anti-Flicker Debounce ---
  function handleCategoryMouseEnter(slug: string) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoveredCategorySlug(slug);

    // Auto-select first sub-category if available or reset
    const catTree = treeData[slug];
    if (catTree?.subcategories?.length) {
      setHoveredSubCategorySlug(catTree.subcategories[0].slug);
    } else {
      setHoveredSubCategorySlug(null);
    }
  }

  function handleSubCategoryMouseEnter(subSlug: string) {
    if (subTimerRef.current) {
      clearTimeout(subTimerRef.current);
      subTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoveredSubCategorySlug(subSlug);
  }

  function handlePanelMouseEnter() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handlePanelMouseLeave() {
    closeTimerRef.current = setTimeout(() => {
      setHoveredCategorySlug(null);
      setHoveredSubCategorySlug(null);
    }, 180);
  }

  const currentHoveredCat = hoveredCategorySlug ? treeData[hoveredCategorySlug] : null;
  const currentSubCategories = currentHoveredCat?.subcategories || [];
  const currentHoveredSub = currentSubCategories.find((s) => s.slug === hoveredSubCategorySlug);
  const currentProducts = currentHoveredSub?.products || [];

  return (
    <>
      {/* Mobile Collapsible Category Accordion / Dropdown */}
      <div className="block lg:hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)] w-full max-w-full min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-navy px-3 sm:px-4 py-2.5 sm:py-3 text-left transition min-w-0"
          aria-expanded={mobileOpen}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="font-display text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white shrink-0">
              Category
            </span>
            {activeCategory ? (
              <span className="rounded bg-orange px-1.5 sm:px-2 py-0.5 text-[10.5px] sm:text-[11px] font-bold uppercase text-white truncate">
                {activeCategory.name}
              </span>
            ) : (
              <span className="rounded bg-white/20 px-1.5 sm:px-2 py-0.5 text-[10.5px] sm:text-[11px] font-bold uppercase text-white/90 shrink-0">
                All Products
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-orange font-bold shrink-0 ml-2">
            <span>{mobileOpen ? "Hide" : "Filter"}</span>
            <span className="text-sm">{mobileOpen ? "▲" : "▼"}</span>
          </span>
        </button>

        {mobileOpen && (
          <div className="border-t border-line divide-y divide-line/70 max-h-[360px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 text-[12.5px] transition ${
                !activeSlug
                  ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                  : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
              }`}
            >
              <span>All products</span>
              {!activeSlug && <span className="text-orange font-bold text-xs">✓</span>}
            </Link>

            {categories.map((cat) => {
              const active = activeSlug === cat.slug;
              const catData = treeData[cat.slug];
              const subItems = catData?.subcategories || [];
              const isExpanded = mobileExpandedCat === cat.slug;

              return (
                <div key={String(cat._id)} className="flex flex-col">
                  <div
                    className={`flex items-center justify-between px-4 py-2 text-[12.5px] transition ${
                      active
                        ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                        : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
                    }`}
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 truncate"
                    >
                      {cat.name}
                    </Link>

                    {subItems.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileExpandedCat(isExpanded ? null : cat.slug);
                        }}
                        className="ml-2 px-2 py-1 text-xs font-bold text-orange hover:bg-orange/10 rounded"
                        aria-label="Toggle subcategories"
                      >
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    )}
                  </div>

                  {/* Mobile Sub-categories expander */}
                  {isExpanded && subItems.length > 0 && (
                    <div className="bg-paper/80 pl-6 pr-3 py-1.5 space-y-1 border-t border-line/40">
                      {subItems.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block text-[11.5px] py-1 text-steel hover:text-orange hover:underline truncate"
                        >
                          › {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Contact Box */}
            <div className="border-t border-line bg-paper/40">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block bg-navy px-4 py-2 text-center font-display text-[11.5px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-orange"
              >
                CONTACT
              </Link>
              <div className="p-2.5 space-y-2 text-xs">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-navy hover:text-orange font-semibold transition"
                >
                  <svg className="h-4 w-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span className="truncate">{whatsappDisplay}</span>
                </a>
                <a
                  href={`mailto:${emailDisplay}`}
                  className="flex items-center gap-2 text-navy hover:text-orange font-semibold transition"
                >
                  <svg className="h-4 w-4 fill-none stroke-orange shrink-0" strokeWidth="2" viewBox="0 0 24 24">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="truncate">{emailDisplay}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Category Sidebar with Hover-Driven 3-Level Mega Flyout Menu */}
      <div
        className="relative hidden lg:block"
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
      >
        <aside className="flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)] rounded-[2px]">
          <div className="flex shrink-0 items-center justify-between bg-navy px-3 py-2.5">
            <p className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-white">
              Category
            </p>
            <span className="h-px w-6 bg-orange" />
          </div>

          <ul className="min-h-0 flex-1 max-h-[380px] xl:max-h-[420px] overflow-y-auto divide-y divide-line/60 scrollbar-thin">
            <li>
              <Link
                href="/products"
                className={`flex items-center justify-between px-3 py-2 text-[11.5px] xl:text-[12px] leading-tight transition ${
                  !activeSlug
                    ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-bold text-navy"
                    : "border-l-[3px] border-l-transparent font-medium text-steel hover:bg-paper hover:text-navy"
                }`}
                onMouseEnter={() => {
                  setHoveredCategorySlug(null);
                  setHoveredSubCategorySlug(null);
                }}
              >
                <span className="truncate">All products</span>
              </Link>
            </li>

            {categories.map((cat) => {
              const active = activeSlug === cat.slug;
              const isHovered = hoveredCategorySlug === cat.slug;
              const catData = treeData[cat.slug];
              const hasSubcategories = catData && catData.subcategories && catData.subcategories.length > 0;

              return (
                <li
                  key={String(cat._id)}
                  onMouseEnter={() => handleCategoryMouseEnter(cat.slug)}
                >
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`flex items-center justify-between px-3 py-2 text-[11.5px] xl:text-[12px] leading-tight transition ${
                      active || isHovered
                        ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-bold text-navy"
                        : "border-l-[3px] border-l-transparent font-medium text-steel hover:bg-paper hover:text-navy"
                    }`}
                    title={cat.name}
                  >
                    <span className="truncate">{cat.name}</span>
                    {hasSubcategories && (
                      <span className="text-[22px] leading-none text-mist/80 group-hover:text-orange ml-1 shrink-0">
                        ›
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Contact Section */}
          <div className="shrink-0 border-t border-line bg-paper/40">
            <Link
              href="/contact"
              className="block bg-navy px-3 py-1.5 text-center font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-orange"
            >
              CONTACT
            </Link>
            <div className="p-2 space-y-1.5 text-[11px]">
              {/* WhatsApp Item */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-navy hover:text-orange font-semibold transition group min-w-0"
                title={`WhatsApp: ${whatsappDisplay}`}
              >
                <svg className="h-3.5 w-3.5 fill-[#25D366] shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="truncate">{whatsappDisplay}</span>
              </a>

              {/* Email Item */}
              <a
                href={`mailto:${emailDisplay}`}
                className="flex items-center gap-1.5 text-navy hover:text-orange font-semibold transition group min-w-0"
                title={`Email: ${emailDisplay}`}
              >
                <svg className="h-3.5 w-3.5 fill-none stroke-orange shrink-0 group-hover:scale-110 transition-transform" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="truncate text-[10px] xl:text-[10.5px]">{emailDisplay}</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Level 2: Sub-Categories White Floating Panel */}
        {hoveredCategorySlug && currentSubCategories.length > 0 && (
          <div
            className="absolute left-full top-0 ml-1.5 z-50 flex shadow-2xl rounded-[2px] animate-in fade-in zoom-in-95 duration-100"
            onMouseEnter={handlePanelMouseEnter}
            onMouseLeave={handlePanelMouseLeave}
          >
            {/* Sub-Category Column */}
            <div className="w-[230px] xl:w-[250px] max-h-[390px] xl:max-h-[430px] overflow-y-auto bg-white border border-line rounded-l-[2px] divide-y divide-line/60 scrollbar-thin">
              <div className="bg-paper/80 px-3 py-2 border-b border-line flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-navy truncate">
                  {currentHoveredCat?.name}
                </span>
                <span className="text-[10px] font-bold text-orange shrink-0">
                  {currentSubCategories.length} items
                </span>
              </div>

              {currentSubCategories.map((sub) => {
                const isSubHovered = hoveredSubCategorySlug === sub.slug;
                const hasProds = sub.products && sub.products.length > 0;

                return (
                  <div
                    key={sub.slug}
                    onMouseEnter={() => handleSubCategoryMouseEnter(sub.slug)}
                    className={`group flex items-center justify-between px-3 py-2 text-[11.5px] cursor-pointer transition ${
                      isSubHovered
                        ? "bg-[#fff7f1] text-orange font-bold border-l-2 border-orange"
                        : "text-navy hover:bg-paper font-medium border-l-2 border-transparent"
                    }`}
                  >
                    <Link
                      href={`/products?category=${hoveredCategorySlug}&subcategory=${sub.slug}`}
                      className="flex-1 truncate"
                    >
                      {sub.name}
                    </Link>
                    {hasProds && (
                      <span className="text-[10px] text-orange font-bold ml-1 shrink-0">
                        {sub.products.length} ›
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Level 3: Products Floating Panel */}
            <div className="w-[280px] xl:w-[320px] max-h-[390px] xl:max-h-[430px] overflow-y-auto bg-white border-y border-r border-line rounded-r-[2px] p-3 scrollbar-thin flex flex-col justify-between">
              <div>
                <div className="border-b border-line pb-2 mb-2.5 flex items-center justify-between">
                  <span className="font-display text-[11px] font-bold uppercase tracking-wider text-navy truncate max-w-[180px]">
                    {currentHoveredSub?.name || "Products"}
                  </span>
                  <Link
                    href={`/products?category=${hoveredCategorySlug}&subcategory=${hoveredSubCategorySlug}`}
                    className="text-[10.5px] font-bold text-orange hover:underline shrink-0"
                  >
                    View All →
                  </Link>
                </div>

                {currentProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {currentProducts.slice(0, 6).map((prod) => (
                      <Link
                        key={prod._id}
                        href={`/products/${prod.slug}`}
                        className="group flex items-center gap-2.5 p-1.5 rounded-[2px] border border-line/60 bg-paper/30 hover:bg-white hover:border-orange hover:shadow-xs transition"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[2px] border border-line bg-white">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            sizes="44px"
                            className="object-contain p-0.5 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11.5px] font-bold text-navy group-hover:text-orange leading-tight line-clamp-2">
                            {prod.name}
                          </p>
                          <span className="text-[10px] text-steel font-medium">In Stock</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs font-bold text-navy">No products currently available</p>
                    <p className="text-[10.5px] text-mist mt-0.5">
                      Inquire with us for custom sourcing
                    </p>
                  </div>
                )}
              </div>

              {currentProducts.length > 0 && (
                <div className="mt-3 pt-2 border-t border-line text-center">
                  <Link
                    href={`/products?category=${hoveredCategorySlug}&subcategory=${hoveredSubCategorySlug}`}
                    className="inline-block w-full py-1 text-center font-display text-[11px] font-bold uppercase tracking-wider bg-navy text-white hover:bg-orange transition rounded-[2px]"
                  >
                    Browse {currentProducts.length} Items →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
