"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string; avatar?: string } | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!user && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071422] text-white">
        <p className="text-sm font-semibold">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-ink">
      <Suspense fallback={<aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#071422]" />}>
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      </Suspense>

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader
          user={user}
          onMobileMenuToggle={() => setMobileOpen((v) => !v)}
        />

        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>

        <footer className="border-t border-line bg-white px-6 py-3 text-center text-xs text-mist">
          <span>Nur Engineering Solution CMS · Built for Administrative Management</span>
        </footer>
      </div>
    </div>
  );
}
