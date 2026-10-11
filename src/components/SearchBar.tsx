"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full overflow-hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)]"
    >
      <span className="grid w-11 place-items-center text-mist" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.2-3.2" />
        </svg>
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search PLC, motor, VFD, sensor, SKU or part number"
        className="min-h-12 w-full bg-transparent pr-3 text-sm outline-none placeholder:text-mist"
        aria-label="Search products"
      />
      <button type="submit" className="btn-orange shrink-0 rounded-none">
        Search
      </button>
    </form>
  );
}
