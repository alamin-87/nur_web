"use client";

import { useState } from "react";
import { Img } from "@/components/Img";
import { youtubeId } from "@/lib/product-media";

type Item =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string; id: string; thumb: string };

export function ProductGallery({
  name,
  images,
  videoUrl,
}: {
  name: string;
  images: string[];
  videoUrl?: string;
}) {
  const yt = youtubeId(videoUrl);
  const isFile = Boolean(videoUrl && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl));

  const imageItems: Item[] = images
    .filter(Boolean)
    .map((src) => ({ kind: "image" as const, src }));

  const videoItem: Item | null = yt
    ? {
        kind: "video" as const,
        src: videoUrl!,
        id: yt,
        thumb: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      }
    : isFile && videoUrl
    ? {
        kind: "video" as const,
        src: videoUrl,
        id: "file",
        thumb: images[0] || "",
      }
    : null;

  const items: Item[] = videoItem
    ? [...imageItems.slice(0, 3), videoItem]
    : imageItems.slice(0, 4);

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = items[active] || items[0];
  if (!current) return null;

  function select(index: number) {
    setActive(index);
    // If selecting video thumbnail, autoplay immediately
    if (items[index]?.kind === "video") {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }

  function go(dir: number) {
    const nextIndex = (active + dir + items.length) % items.length;
    setActive(nextIndex);
    if (items[nextIndex]?.kind === "video") {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }

  return (
    <div className="w-full select-none">
      {/* Main Media Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-white shadow-xs">
        {current.kind === "image" ? (
          <div className="relative h-full w-full p-2 sm:p-3 md:p-4 flex items-center justify-center">
            <Img
              src={current.src}
              alt={name}
              fill
              priority
              className="object-contain p-1 sm:p-2 transition-transform duration-300 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ) : playing && yt && current.id !== "file" ? (
          <iframe
            title={`${name} video`}
            src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0&autoplay=1`}
            className="absolute inset-0 z-10 h-full w-full bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : playing && current.id === "file" ? (
          <video
            className="absolute inset-0 z-10 h-full w-full object-contain bg-black"
            src={current.src}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <div className="relative h-full w-full bg-navy/95">
            <Img
              src={current.thumb || images[0]}
              alt={`${name} video`}
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 z-20 grid place-items-center bg-navy/30 transition hover:bg-navy/20"
              aria-label="Play video"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-orange text-white shadow-xl hover:scale-105 transition">
                  <svg className="h-6 w-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-[11px] font-display font-bold uppercase tracking-widest text-white drop-shadow">
                  Play Video
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Prev / Next Chevrons */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center text-mist hover:text-navy transition cursor-pointer select-none"
            >
              <svg className="h-6 w-6 stroke-current fill-none opacity-60 hover:opacity-100 transition-opacity" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center text-mist hover:text-navy transition cursor-pointer select-none"
            >
              <svg className="h-6 w-6 stroke-current fill-none opacity-60 hover:opacity-100 transition-opacity" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery Row */}
      {items.length > 1 && (
        <div
          className={`mt-2.5 grid gap-2 sm:gap-2.5 ${
            items.length === 2
              ? "grid-cols-2 max-w-[200px]"
              : items.length === 3
              ? "grid-cols-3 max-w-[300px]"
              : items.length === 4
              ? "grid-cols-4"
              : "grid-cols-5"
          }`}
        >
          {items.map((item, i) => {
            const isActive = i === active;
            if (item.kind === "video") {
              return (
                <button
                  key={`video-${i}`}
                  type="button"
                  onClick={() => select(i)}
                  className={`relative aspect-square overflow-hidden border transition flex flex-col items-center justify-center bg-[#2b2e35] cursor-pointer rounded-[2px] ${
                    isActive
                      ? "border-2 border-[#1ea952]"
                      : "border-line hover:border-steel/50"
                  }`}
                  aria-label="Product Video"
                >
                  <div className="flex flex-col items-center justify-center gap-1 p-1">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-white/80 text-white">
                      <svg className="h-3.5 w-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="font-display text-[9px] font-bold uppercase tracking-wider text-white">
                      VIDEO
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={`img-${item.src}-${i}`}
                type="button"
                onClick={() => select(i)}
                className={`relative aspect-square overflow-hidden border bg-white p-1 transition cursor-pointer rounded-[2px] ${
                  isActive
                    ? "border-2 border-[#1ea952]"
                    : "border-line hover:border-steel/50"
                }`}
                aria-label={`${name} thumbnail ${i + 1}`}
              >
                <Img
                  src={item.src}
                  alt={`${name} thumbnail ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 640px) 20vw, 90px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
