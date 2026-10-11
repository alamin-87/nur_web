"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/Img";
import type { IBanner } from "@/lib/models";

export function HeroSlider({ banners }: { banners: IBanner[] }) {
  const slides = banners.length
    ? banners
    : [
        {
          _id: "fallback",
          title: "Machine parts & technical service",
          subtitle: "PLC, motors, drives, sensors and spare parts for EEE work.",
          image:
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80",
          ctaLabel: "View catalog",
          ctaHref: "/products",
          order: 1,
          active: true,
        },
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];
  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="relative w-full aspect-[1920/500] overflow-hidden border border-line bg-navy shadow-[0_1px_0_rgba(11,31,51,0.03)]">
      <Img
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 75vw"
      />

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5 sm:bottom-3.5 sm:left-8 md:left-10">
          {slides.map((item, i) => (
            <button
              key={String(item._id)}
              type="button"
              aria-label={`Slide ${i + 1}`}
              className={`h-1 sm:h-0.5 rounded-full transition-all ${
                i === index ? "w-6 bg-orange" : "w-2.5 bg-white/35"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <div className="absolute right-3.5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1.5 md:flex">
          <button
            type="button"
            aria-label="Next slide"
            className="grid h-8 w-8 place-items-center border border-white/20 bg-navy/50 text-sm text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange cursor-pointer"
            onClick={() => go(1)}
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Previous slide"
            className="grid h-8 w-8 place-items-center border border-white/20 bg-navy/50 text-sm text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange cursor-pointer"
            onClick={() => go(-1)}
          >
            ‹
          </button>
        </div>
      )}
    </section>
  );
}
