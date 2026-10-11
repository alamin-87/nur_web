"use client";

import Link from "next/link";
import { useRef } from "react";
import type { ISubCategory } from "@/lib/models";

interface SubCategoryBarProps {
  categorySlug: string;
  categoryName: string;
  subcategories: ISubCategory[];
  activeSubSlug?: string;
}

export function SubCategoryBar({
  categorySlug,
  categoryName,
  subcategories,
  activeSubSlug,
}: SubCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  function scroll(direction: "left" | "right") {
    if (scrollRef.current) {
      const amount = 240;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="relative border-b border-line bg-paper/60 p-2 sm:p-2.5 rounded-[2px] mb-3 sm:mb-4">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange" />
          <span className="font-display text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-navy">
            Sub-Categories ({subcategories.length})
          </span>
        </div>

        {/* Optional scroll arrow buttons */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-[10px] text-navy hover:border-orange hover:text-orange"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-[10px] text-navy hover:border-orange hover:text-orange"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-mist/40 scrollbar-track-transparent select-none"
      >
        {/* "All [Category Name]" pill */}
        <Link
          href={`/products?category=${categorySlug}`}
          className={`shrink-0 whitespace-nowrap rounded-[2px] px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider transition ${
            !activeSubSlug
              ? "bg-navy text-white shadow-xs"
              : "border border-line bg-white text-navy hover:border-orange hover:text-orange hover:bg-paper"
          }`}
        >
          All {categoryName}
        </Link>

        {/* Sub-category pills */}
        {subcategories.map((sub) => {
          const isActive = activeSubSlug === sub.slug;
          return (
            <Link
              key={String(sub._id || sub.slug)}
              href={`/products?category=${categorySlug}&subcategory=${sub.slug}`}
              className={`shrink-0 whitespace-nowrap rounded-[2px] px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-bold tracking-wider transition ${
                isActive
                  ? "bg-orange text-white shadow-xs font-extrabold"
                  : "border border-line bg-white text-navy hover:border-orange hover:text-orange hover:bg-paper"
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
