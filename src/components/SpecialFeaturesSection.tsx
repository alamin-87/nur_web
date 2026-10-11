"use client";

import Link from "next/link";
import { useState } from "react";
import type { ICategory, IFeature } from "@/lib/models";

interface SpecialFeaturesSectionProps {
  features: IFeature[];
  categories: ICategory[];
}

export function SpecialFeaturesSection({ features, categories }: SpecialFeaturesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // If expanded, show all features; otherwise show first 12 (3 rows across 4 columns)
  const visibleFeatures = expanded ? features : features.slice(0, 12);

  return (
    <section className="pt-0">
      <div className="mb-1 sm:mb-1.5 flex items-center justify-between gap-4">
        <div className="section-label !mb-0">Special features</div>
        {features.length > 12 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange hover:text-navy transition cursor-pointer select-none shrink-0"
          >
            {expanded ? (
              <>
                Show less <span className="text-[24px] leading-none relative -top-[3px]">←</span>
              </>
            ) : (
              <>
                See more <span className="text-[24px] leading-none relative -top-[3px]">→</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-1.5">
        {visibleFeatures.map((feat) => (
          <Link
            key={String(feat._id || feat.slug || feat.name)}
            href={featureHref(feat, categories)}
            className="flex items-center gap-1.5 text-[13.5px] sm:text-[14.5px] text-navy font-medium leading-none group min-w-0"
          >
            <FeatureItemIcon label={`${feat.name} ${feat.slug || ""}`} />
            <span className="truncate group-hover:text-orange transition-colors">
              {feat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function featureHref(feat: IFeature, categories: ICategory[]) {
  const slug = (feat.slug || "").toLowerCase();
  const name = norm(feat.name);

  const bySlug = categories.find((c) => {
    const cs = c.slug.toLowerCase();
    return slug === cs || slug.startsWith(`${cs}-`) || cs.startsWith(`${slug}-`);
  });
  if (bySlug) return `/products?category=${encodeURIComponent(bySlug.slug)}`;

  const byName = categories.find((c) => {
    const cn = norm(c.name);
    return cn === name || name.startsWith(cn) || cn.startsWith(name);
  });
  if (byName) return `/products?category=${encodeURIComponent(byName.slug)}`;

  const fTokens = name.split(" ").filter((w) => w.length > 2);
  let best: ICategory | undefined;
  let bestScore = 0;
  for (const c of categories) {
    const cTokens = norm(c.name).split(" ").filter((w) => w.length > 2);
    const score = fTokens.filter((t) =>
      cTokens.some((ct) => ct === t || ct.startsWith(t) || t.startsWith(ct))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  if (best && bestScore >= 2) {
    return `/products?category=${encodeURIComponent(best.slug)}`;
  }

  return `/products?q=${encodeURIComponent(feat.name)}`;
}

function FeatureItemIcon({ label: _label }: { label: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M20.2 12a8.2 8.2 0 1 1-5.1-7.6"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M7.6 12.2l3.2 3.2 6.4-7"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

