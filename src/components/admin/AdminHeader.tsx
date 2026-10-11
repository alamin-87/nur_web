"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export function AdminHeader({
  user,
  onMobileMenuToggle,
}: {
  user: { name: string; email: string; role: string; avatar?: string } | null;
  onMobileMenuToggle: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Generate readable breadcrumb
  const parts = pathname.replace("/admin", "").split("/").filter(Boolean);
  const breadcrumb = parts.length
    ? parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "))
        .join(" / ")
    : "Dashboard";

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 md:px-6 shadow-xs">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="grid h-9 w-9 place-items-center rounded border border-line text-navy hover:bg-paper lg:hidden shrink-0 cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="font-display text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide text-navy truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
            {breadcrumb}
          </h1>
        </div>
      </div>

      {/* Right: Quick Action & User Profile Dropdown */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-full border border-line bg-paper/50 py-1 pl-1.5 pr-3 transition hover:border-orange/60"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-navy text-xs font-bold text-white uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-bold leading-none text-navy">{user.name}</p>
                <p className="text-[10px] uppercase font-semibold text-orange">
                  {user.role.replace("_", " ")}
                </p>
              </div>
              <span className="text-[10px] text-steel">▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded border border-line bg-white p-2 shadow-lg z-50">
                <div className="border-b border-line px-3 py-2">
                  <p className="text-xs font-bold text-navy">{user.name}</p>
                  <p className="truncate text-[11px] text-mist">{user.email}</p>
                  <span className="mt-1 inline-block rounded bg-paper px-1.5 py-0.5 text-[9px] font-bold uppercase text-navy">
                    {user.role.replace("_", " ")}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
