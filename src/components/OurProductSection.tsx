"use client";

import { useState, useRef } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import type { ProductSummary } from "@/lib/data";

interface OurProductSectionProps {
  initialProducts: ProductSummary[];
  totalProducts: number;
  pageSize?: number;
  initialPage?: number;
}

export function OurProductSection({
  initialProducts,
  totalProducts,
  pageSize = 20,
  initialPage = 1,
}: OurProductSectionProps) {
  const [products, setProducts] = useState<ProductSummary[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<"viewMore" | "pageChange" | null>(null);
  const [isAccumulated, setIsAccumulated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  // Determine if there are more products available to load
  const hasMore = isAccumulated
    ? products.length < totalProducts
    : currentPage < totalPages;

  // 1. "VIEW MORE PRODUCT →" progressive same-page loading
  async function handleViewMore() {
    if (loading) return;
    setError(null);
    setLoading(true);
    setLoadingType("viewMore");

    try {
      // If currently showing a single page, calculate next page from current list count or currentPage
      const currentCount = products.length;
      const nextPage = Math.floor(currentCount / pageSize) + 1;

      const res = await fetch(`/api/products?page=${nextPage}&limit=${pageSize}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setProducts((prev) => {
          // Avoid duplicate product IDs
          const existingIds = new Set(prev.map((p) => String(p._id)));
          const uniqueNew = (json.data as ProductSummary[]).filter(
            (p) => !existingIds.has(String(p._id))
          );
          return [...prev, ...uniqueNew];
        });
        setIsAccumulated(true);
      }
    } catch (err) {
      console.error("Error loading more products:", err);
      setError("Failed to load more products. Please try again.");
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  }

  // 2. Dynamic page number / NEXT pagination on the SAME page
  async function handlePageChange(targetPage: number) {
    if (loading || targetPage === currentPage && !isAccumulated) return;
    if (targetPage < 1 || targetPage > totalPages) return;

    setError(null);
    setLoading(true);
    setLoadingType("pageChange");

    try {
      const res = await fetch(`/api/products?page=${targetPage}&limit=${pageSize}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data as ProductSummary[]);
        setCurrentPage(targetPage);
        setIsAccumulated(false);

        // Smooth scroll to top of section for smooth UX
        if (sectionRef.current) {
          const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Error fetching page products:", err);
      setError("Failed to load page. Please try again.");
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  }

  return (
    <section ref={sectionRef} className="relative">
      <div className="section-label">Our product</div>

      {/* Loading overlay for full page change */}
      {loading && loadingType === "pageChange" && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center min-h-[300px] rounded-[2px] transition-opacity">
          <div className="flex items-center gap-2.5 bg-navy text-white px-4 py-2 rounded-[2px] shadow-md text-xs font-bold uppercase tracking-wider">
            <svg className="animate-spin h-4 w-4 text-orange" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>Loading products...</span>
          </div>
        </div>
      )}

      {/* 20 Products Grid (5 per row on desktop) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={String(product._id)} product={product} size="sm" />
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mt-3 p-2.5 rounded bg-red-50 border border-red-200 text-center text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* View More Product Button — Progressive Same-Page Loader */}
      {hasMore && (
        <div className="pt-3.5 text-center">
          <button
            type="button"
            onClick={handleViewMore}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 font-display text-[12px] font-bold uppercase tracking-[0.16em] text-orange hover:text-navy transition disabled:opacity-50 cursor-pointer group py-1 px-3"
          >
            {loading && loadingType === "viewMore" ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-orange" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Loading more products...</span>
              </>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>View More Product</span>
                <span className="relative -top-[3.5px] inline-flex items-center justify-center text-[26px] sm:text-[28px] leading-none select-none transition-transform duration-200">
                  →
                </span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Dynamic Same-Page Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={loading}
      />
    </section>
  );
}
