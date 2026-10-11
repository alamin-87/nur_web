"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useSite } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";
import type { ProductSummary } from "@/lib/data";

const defaultNavServices = [
  { _id: "svc-1", title: "Industrial Machineries", slug: "industrial-machineries" },
  { _id: "svc-2", title: "Machine Spare parts", slug: "machine-spare-parts" },
  { _id: "svc-3", title: "Technical Services", slug: "technical-services" },
  { _id: "svc-4", title: "Industrial Automation", slug: "industrial-automation" },
  { _id: "svc-5", title: "Robotics", slug: "robotics" },
];

export function NavBar() {
  const router = useRouter();
  const site = useSite();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedProductCat, setSelectedProductCat] = useState<string | null>(null);
  const [navServices, setNavServices] = useState<Array<{ _id: string; title: string; slug: string }>>(defaultNavServices);
  const [navCatalog, setNavCatalog] = useState<
    Array<{
      name: string;
      slug: string;
      subcategories: Array<{ name: string; slug: string }>;
    }>
  >([]);
  const closeServicesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeProductsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDownloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search state
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const rawNav = site.nav?.length ? site.nav : [];
  const hasBlog = rawNav.some((item) => item.href === "/blog");
  const fullNav = (hasBlog
    ? rawNav
    : [...rawNav, { href: "/blog", label: "Blog", order: 7 }]
  ).map((item) => (item.href === "/use-cases" ? { ...item, label: "Our Services" } : item));
  const nav = [...fullNav]
    .filter((item) => item.href !== "/services")
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.services)) setNavServices(data.services);
      })
      .catch(() => {});

    fetch("/api/catalog-tree")
      .then((res) => res.json())
      .then((treeJson) => {
        const tree = (treeJson?.tree || {}) as Record<
          string,
          { name: string; slug: string; subcategories?: Array<{ name: string; slug: string }> }
        >;
        const fromTree = Object.values(tree).map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));
        setNavCatalog(fromTree);
      })
      .catch(() => {});
  }, []);

  function openMenu(kind: "services" | "products" | "download") {
    if (kind === "services") {
      if (closeServicesTimer.current) clearTimeout(closeServicesTimer.current);
      setCasesOpen(true);
      setProductsOpen(false);
      setDownloadOpen(false);
    } else if (kind === "download") {
      if (closeDownloadTimer.current) clearTimeout(closeDownloadTimer.current);
      setDownloadOpen(true);
      setCasesOpen(false);
      setProductsOpen(false);
    } else {
      if (closeProductsTimer.current) clearTimeout(closeProductsTimer.current);
      if (!productsOpen) setSelectedProductCat(null);
      setProductsOpen(true);
      setCasesOpen(false);
      setDownloadOpen(false);
    }
  }

  function closeMenu(kind: "services" | "products" | "download") {
    const timer = setTimeout(() => {
      if (kind === "services") setCasesOpen(false);
      else if (kind === "download") setDownloadOpen(false);
      else {
        setProductsOpen(false);
        setSelectedProductCat(null);
      }
    }, kind === "products" || kind === "services" || kind === "download" ? 160 : 80);
    if (kind === "services") closeServicesTimer.current = timer;
    else if (kind === "download") closeDownloadTimer.current = timer;
    else closeProductsTimer.current = timer;
  }

  function handleMenuClick(e: MouseEvent, kind: "services" | "products" | "download") {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      const isOpen = kind === "services" ? casesOpen : kind === "download" ? downloadOpen : productsOpen;
      if (isOpen) {
        if (kind === "services") setCasesOpen(false);
        else if (kind === "download") setDownloadOpen(false);
        else setProductsOpen(false);
      } else {
        openMenu(kind);
      }
    }
  }

  // Debounced live search fetch
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=6`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Live search fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q]);

  // Click outside to close live search dropdown
  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      const target = e.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setShowResults(false);
      } else if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        !mobileSearchRef.current
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string) {
    const url = new URL(href, "http://local.nav");
    const path = url.pathname;
    const wantedCat = url.searchParams.get("category");
    const currentCat = searchParams.get("category");

    if (path === "/") return pathname === "/";

    if (wantedCat) {
      return pathname === path && currentCat === wantedCat;
    }

    const siblingOwnsCategory = nav.some((item) => {
      if (item.href === href) return false;
      const other = new URL(item.href, "http://local.nav");
      return (
        other.pathname === path &&
        other.searchParams.get("category") === currentCat &&
        Boolean(currentCat) &&
        pathname === path
      );
    });
    if (siblingOwnsCategory) return false;

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();
    setShowResults(false);
    setMobileSearchOpen(false);
    setOpen(false);
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="relative sticky top-[50px] md:top-0 z-40 border-b border-line bg-white shadow-[0_2px_12px_rgba(11,31,51,0.04)] w-full max-w-full overflow-x-clip">
      <div className="shell flex items-center justify-between py-2 md:py-2.5 gap-2 sm:gap-3 w-full max-w-full min-w-0">
        {/* Left: Logo & Company Name Branding (Slightly Larger) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink md:shrink-0 mr-1 sm:mr-2 md:mr-2 lg:mr-3 xl:mr-6">
          <div className="shrink-0">
            <Logo size={58} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />
          </div>
          <div className="flex flex-col justify-center min-w-0 md:min-w-max">
            <div className="font-display text-[16px] sm:text-[20px] md:text-[22px] xl:text-[24px] font-extrabold uppercase leading-none tracking-[0.02em] sm:tracking-[0.03em] whitespace-normal sm:whitespace-nowrap">
              <span className="text-navy">{(site.brandName || "NUR ENGINEERING SOLUTION").split(" ")[0]} </span>
              <span className="text-orange">{(site.brandName || "NUR ENGINEERING SOLUTION").split(" ").slice(1).join(" ")}</span>
            </div>
            <span className="mt-0.5 sm:mt-1 text-[9.5px] sm:text-[11px] md:text-[11.5px] font-medium leading-none tracking-tight text-steel whitespace-normal sm:whitespace-nowrap">
              {site.tagline || "Machine, spare parts and Technical service provider"}
            </span>
          </div>
        </Link>

        {/* Center-Left: Desktop Navigation Links (Slightly Larger Font & Shifted Left) */}
        <nav className="hidden items-center gap-2.5 md:gap-3.5 lg:gap-4 xl:gap-6 2xl:gap-7 md:flex mr-3 xl:mr-4 shrink-0">
          {nav.map((link) => {
            const active = isActive(link.href);
            const isProducts = link.href === "/products";
            const isUseCases = link.href === "/use-cases";

            if (isUseCases) {
              return (
                <div
                  key={link.href}
                  className="relative shrink-0"
                  onMouseEnter={() => openMenu("services")}
                  onMouseLeave={() => closeMenu("services")}
                >
                  <Link
                    href="/use-cases"
                    onClick={(e) => handleMenuClick(e, "services")}
                    className={`relative flex items-center gap-1 py-3.5 font-display text-[14.5px] lg:text-[15px] xl:text-[15.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                      active
                        ? "text-orange"
                        : "text-navy hover:text-orange"
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={casesOpen}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
                    )}
                  </Link>
                  {casesOpen && (
                    <div className="absolute top-full left-0 z-[60] w-max min-w-[240px] max-w-[min(92vw,22rem)] max-h-[min(72vh,calc(100dvh-5.5rem))] overflow-hidden border-t-2 border-orange bg-white shadow-[0_16px_36px_rgba(11,31,51,0.14)]">
                      <div
                        className="overflow-y-auto overscroll-contain px-4 py-3"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-y-2">
                          {navServices.map((service) => (
                            <Link
                              key={service.slug || service._id}
                              href={`/services/${service.slug}`}
                              className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-navy transition hover:text-orange"
                            >
                              <ServiceNavIcon label={`${service.title} ${service.slug}`} />
                              <span className="min-w-0">{service.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (isProducts) {
              return (
                <div
                  key={link.href}
                  className="relative shrink-0"
                  onMouseEnter={() => openMenu("products")}
                  onMouseLeave={() => closeMenu("products")}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => handleMenuClick(e, "products")}
                    className={`relative flex items-center gap-1 py-3.5 font-display text-[14.5px] lg:text-[15px] xl:text-[15.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                      active
                        ? "text-orange"
                        : "text-navy hover:text-orange"
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={productsOpen}
                  >
                    <span>{link.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-6 w-6 fill-none stroke-current opacity-70 shrink-0"
                      strokeWidth="2.8"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    {active && (
                      <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
                    )}
                  </Link>
                  {productsOpen && (
                    <div className="absolute top-full left-0 z-[60] flex max-h-[min(72vh,calc(100dvh-5.5rem))] overflow-hidden border-t-2 border-orange bg-white shadow-[0_16px_36px_rgba(11,31,51,0.14)]">
                      <div
                        className="min-w-[220px] max-w-[280px] overflow-y-auto overscroll-contain py-2"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {navCatalog.map((cat) => {
                          const selected = selectedProductCat === cat.slug;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onMouseEnter={() => {
                                setSelectedProductCat(cat.subcategories.length ? cat.slug : null);
                              }}
                              onClick={() => {
                                if (!cat.subcategories.length) {
                                  router.push(`/products?category=${encodeURIComponent(cat.slug)}`);
                                  setProductsOpen(false);
                                  setSelectedProductCat(null);
                                  return;
                                }
                                setSelectedProductCat(selected ? null : cat.slug);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-semibold leading-snug transition ${
                                selected ? "bg-paper text-orange" : "text-navy hover:bg-paper hover:text-orange"
                              }`}
                            >
                              <CategoryNavIcon label={`${cat.name} ${cat.slug}`} />
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedProductCat && (
                        <div
                          className="min-w-[220px] max-w-[300px] overflow-y-auto overscroll-contain border-l border-line py-2"
                          onMouseEnter={() => openMenu("products")}
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {(navCatalog.find((c) => c.slug === selectedProductCat)?.subcategories || []).map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/products?category=${encodeURIComponent(selectedProductCat)}&subcategory=${encodeURIComponent(sub.slug)}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-[13px] leading-snug text-navy transition hover:bg-paper hover:text-orange"
                            >
                              <CategoryNavIcon label={`${sub.name} ${sub.slug}`} />
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1 py-3.5 font-display text-[14.5px] lg:text-[15px] xl:text-[15.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                  active
                    ? "text-orange"
                    : "text-navy hover:text-orange"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
                )}
              </Link>
            );
          })}
          <div
            className="relative shrink-0"
            onMouseEnter={() => openMenu("download")}
            onMouseLeave={() => closeMenu("download")}
          >
            <button
              type="button"
              onClick={(e) => handleMenuClick(e, "download")}
              className={`relative flex items-center gap-1 py-3.5 font-display text-[14.5px] lg:text-[15px] xl:text-[15.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                pathname === "/catalogue" || pathname === "/user-manual"
                  ? "text-orange"
                  : "text-navy hover:text-orange"
              }`}
              aria-expanded={downloadOpen}
            >
              <span>Download</span>
              {(pathname === "/catalogue" || pathname === "/user-manual") && (
                <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
              )}
            </button>
            {downloadOpen && (
              <div className="absolute top-full right-0 z-[60] w-max min-w-[180px] max-w-[min(92vw,16rem)] overflow-hidden border-t-2 border-orange bg-white shadow-[0_16px_36px_rgba(11,31,51,0.14)]">
                <div className="flex flex-col py-2">
                  <Link
                    href="/catalogue"
                    className="px-4 py-2 text-[13px] font-medium text-navy transition hover:bg-paper hover:text-orange"
                  >
                    Catalogue
                  </Link>
                  <Link
                    href="/user-manual"
                    className="px-4 py-2 text-[13px] font-medium text-navy transition hover:bg-paper hover:text-orange"
                  >
                    User Manual
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Compact Header Live Search & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
          {/* Desktop / Laptop Live Search Input & Dropdown */}
          <div className="relative hidden md:block min-w-0 w-full max-w-none" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-[2px] border-2 border-navy bg-white overflow-hidden h-[34px] md:h-[36px] w-full min-w-0 shadow-[0_1px_2px_rgba(11,31,51,0.06)] transition focus-within:border-orange"
            >
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search PLC, servo drives, heaters, sensors, part numbers..."
                className="header-live-search-input w-full h-full bg-transparent border-0 px-2.5 text-[11.5px] md:text-xs text-navy placeholder:text-steel/70 placeholder:font-normal min-w-0 appearance-none shadow-none ring-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:shadow-none focus:border-0"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="text-mist hover:text-navy text-xs font-bold shrink-0 px-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="bg-navy text-white hover:bg-orange transition flex items-center gap-1 px-2.5 md:px-3 h-full shrink-0 font-display text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
                title="Search products"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  className="h-3.5 w-3.5 fill-none stroke-current shrink-0"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="hidden md:inline">SEARCH</span>
              </button>
            </form>

            {/* Live Search Vertical Dropdown (Desktop) */}
            {showResults && q.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-1 z-50 w-[300px] sm:w-[340px] max-w-[90vw] rounded-lg border border-line bg-white shadow-2xl overflow-hidden divide-y divide-line/60 animate-in fade-in slide-in-from-top-1 duration-150">
                {loading ? (
                  <div className="p-4 text-center text-xs text-mist font-medium flex items-center justify-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-orange border-t-transparent animate-spin" />
                    <span>Searching products...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    <div className="bg-paper/90 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-mist flex justify-between items-center border-b border-line">
                      <span>Matching Products ({results.length})</span>
                      <span className="text-[9.5px] font-bold text-orange">Live Result</span>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-line/40">
                      {results.map((product) => (
                        <Link
                          key={String(product._id || product.slug)}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setShowResults(false);
                            setQ("");
                          }}
                          className="flex items-center gap-3 p-2.5 transition hover:bg-paper group"
                        >
                          <div className="h-10 w-10 shrink-0 rounded border border-line/80 bg-paper/50 overflow-hidden flex items-center justify-center p-0.5">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="font-display text-[10px] font-bold text-mist uppercase">
                                NES
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-xs sm:text-[13px] font-bold uppercase text-navy group-hover:text-orange leading-snug line-clamp-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-steel">
                              {product.category?.name && (
                                <span className="truncate text-orange font-semibold">
                                  {product.category.name}
                                </span>
                              )}
                              {product.sku && (
                                <span className="truncate font-mono text-mist">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/products?q=${encodeURIComponent(q.trim())}`}
                      onClick={() => setShowResults(false)}
                      className="block bg-paper/80 p-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-orange hover:bg-orange hover:text-white transition"
                    >
                      View all products for &ldquo;{q.trim()}&rdquo; →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-mist font-medium">
                    No products found for &ldquo;{q.trim()}&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 md:hidden shrink-0 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-xs transition hover:bg-orange"
            aria-label="Search products"
            title="Search products"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-line text-navy hover:bg-paper md:hidden shrink-0"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              className="h-5 w-5 fill-none stroke-current"
              strokeWidth="2"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Live Search Dropdown Drawer */}
      {mobileSearchOpen && (
        <div className="border-t border-line bg-white p-3 md:hidden shadow-lg animate-in fade-in slide-in-from-top-1 duration-150" ref={mobileSearchRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-[2px] border-2 border-navy bg-white overflow-hidden h-9"
          >
            <input
              type="text"
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowResults(true);
              }}
              placeholder="Search PLC, servo drives, heaters, sensors, part numbers..."
              className="header-live-search-input w-full h-full bg-transparent border-0 px-2.5 text-xs text-navy placeholder:text-steel/70 min-w-0 appearance-none shadow-none ring-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:shadow-none focus:border-0"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setResults([]);
                }}
                className="text-mist hover:text-navy text-xs font-bold shrink-0 px-1.5"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="bg-navy text-white hover:bg-orange transition flex items-center gap-1.5 px-3 h-full shrink-0 font-display text-xs font-bold uppercase tracking-wider"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.5">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>SEARCH</span>
            </button>
          </form>

          {/* Mobile Live Results */}
          {q.trim().length > 0 && (
            <div className="mt-2 rounded border border-line bg-white overflow-hidden divide-y divide-line/60">
              {loading ? (
                <div className="p-3 text-center text-xs text-mist font-medium">
                  Searching products...
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="max-h-[260px] overflow-y-auto divide-y divide-line/40">
                    {results.map((product) => (
                      <Link
                        key={String(product._id || product.slug)}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setMobileSearchOpen(false);
                          setShowResults(false);
                          setQ("");
                        }}
                        className="flex items-center gap-2.5 p-2 transition hover:bg-paper"
                      >
                        <div className="h-8 w-8 shrink-0 rounded border border-line/80 bg-paper/50 overflow-hidden flex items-center justify-center p-0.5">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="font-display text-[9px] font-bold text-mist uppercase">
                              NES
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-xs font-bold uppercase text-navy leading-snug line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-orange font-semibold">
                            {product.category?.name || "Product"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/products?q=${encodeURIComponent(q.trim())}`}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setShowResults(false);
                    }}
                    className="block bg-paper/80 p-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-orange hover:bg-orange hover:text-white transition"
                  >
                    View all results →
                  </Link>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-mist font-medium">
                  No products found for &ldquo;{q.trim()}&rdquo;.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="border-t border-line bg-white py-3 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="shell flex flex-col divide-y divide-line/60">
            {nav.map((link) => {
              const active = isActive(link.href);
              const isProducts = link.href === "/products";
              const isUseCases = link.href === "/use-cases";

              if (isProducts) {
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                        productsOpen || active ? "text-orange" : "text-navy"
                      }`}
                      onClick={() => setProductsOpen((v) => !v)}
                    >
                      <span>{link.label}</span>
                    </button>
                    {productsOpen && (
                      <div className="pb-3 space-y-1">
                        {navCatalog.map((cat) => (
                          <div key={cat.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!cat.subcategories.length) {
                                  router.push(`/products?category=${encodeURIComponent(cat.slug)}`);
                                  setOpen(false);
                                  return;
                                }
                                setSelectedProductCat((prev) => (prev === cat.slug ? null : cat.slug));
                              }}
                              className={`flex w-full items-center gap-2 py-1 text-left text-[13px] font-semibold ${
                                selectedProductCat === cat.slug ? "text-orange" : "text-navy"
                              }`}
                            >
                              <CategoryNavIcon label={`${cat.name} ${cat.slug}`} />
                              <span>{cat.name}</span>
                            </button>
                            {selectedProductCat === cat.slug &&
                              cat.subcategories.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/products?category=${encodeURIComponent(cat.slug)}&subcategory=${encodeURIComponent(sub.slug)}`}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center gap-2 py-1 pl-6 text-[12px] text-steel"
                                >
                                  <CategoryNavIcon label={`${sub.name} ${sub.slug}`} />
                                  <span>{sub.name}</span>
                                </Link>
                              ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (isUseCases) {
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                        casesOpen || active ? "text-orange" : "text-navy"
                      }`}
                      onClick={() => setCasesOpen((v) => !v)}
                    >
                      <span>{link.label}</span>
                    </button>
                    {casesOpen && (
                      <div className="pb-3 space-y-2">
                        {navServices.map((service) => (
                          <Link
                            key={service.slug || service._id}
                            href={`/services/${service.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 py-0.5 text-[13px] font-medium text-navy"
                          >
                            <ServiceNavIcon label={`${service.title} ${service.slug}`} />
                            <span>{service.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                    active ? "text-orange" : "text-navy hover:text-orange"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                  )}
                </Link>
              );
            })}
            <div>
              <button
                type="button"
                className={`flex w-full items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                  downloadOpen || pathname === "/catalogue" || pathname === "/user-manual"
                    ? "text-orange"
                    : "text-navy"
                }`}
                onClick={() => setDownloadOpen((v) => !v)}
              >
                <span>Download</span>
              </button>
              {downloadOpen && (
                <div className="space-y-2 pb-3">
                  <Link
                    href="/catalogue"
                    onClick={() => setOpen(false)}
                    className="block py-0.5 text-[13px] font-medium text-navy"
                  >
                    Catalogue
                  </Link>
                  <Link
                    href="/user-manual"
                    onClick={() => setOpen(false)}
                    className="block py-0.5 text-[13px] font-medium text-navy"
                  >
                    User Manual
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function ServiceNavIcon({ label: _label }: { label: string }) {
  return <NavChevronIcon />;
}

function CategoryNavIcon({ label: _label }: { label: string }) {
  return <NavChevronIcon />;
}

function NavChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 fill-none stroke-[#22c55e]"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5.5 16.5 12 9 18.5" />
    </svg>
  );
}


