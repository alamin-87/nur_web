"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ProductsIcon,
  FolderIcon,
  NewspaperIcon,
  SettingsIcon,
  SlidersIcon,
  ActivityIcon,
} from "@/components/admin/AdminIcons";

interface DashboardData {
  stats: {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    totalCategories: number;
    totalBlogs: number;
    totalUsers: number;
    totalMessages: number;
  };
  recentProducts: Array<{
    _id: string;
    name: string;
    slug: string;
    sku?: string;
    price?: number;
    currency: string;
    inStock: boolean;
    published: boolean;
    category?: { name: string };
    createdAt: string;
  }>;
  recentBlogs: Array<{
    _id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
  }>;
  recentLogs: Array<{
    _id: string;
    action: string;
    entity: string;
    details: string;
    user?: { name: string; email: string };
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-semibold text-mist">Loading dashboard metrics...</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4 rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-xs text-steel">
            Manage your machinery catalog, categories, content and website settings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Link href="/admin/products/new" className="btn-orange px-3.5 py-2 text-xs font-bold uppercase flex-1 sm:flex-none text-center">
            + Add Product
          </Link>
          <Link href="/admin/blogs/new" className="btn-navy px-3.5 py-2 text-xs font-bold uppercase flex-1 sm:flex-none text-center">
            + Add Blog
          </Link>
          <Link href="/admin/settings" className="border border-line bg-paper px-3.5 py-2 text-xs font-bold uppercase text-navy hover:bg-white transition flex-1 sm:flex-none text-center flex items-center justify-center gap-1.5">
            <SettingsIcon size={14} className="text-steel" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-mist">Total Products</p>
            <div className="grid h-8 w-8 place-items-center rounded bg-navy/5 text-navy">
              <ProductsIcon size={18} />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-3xl font-bold text-navy">{stats?.totalProducts ?? 0}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] text-steel">
            <span className="text-emerald-600 font-semibold">{stats?.publishedProducts ?? 0} Published</span>
            <span>·</span>
            <span>{stats?.draftProducts ?? 0} Drafts</span>
          </div>
        </div>

        {/* Stock Status */}
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-mist">Availability</p>
            <div className="grid h-8 w-8 place-items-center rounded bg-emerald-50 text-emerald-600">
              <SlidersIcon size={18} />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-3xl font-bold text-emerald-600">{stats?.inStockProducts ?? 0}</p>
          <p className="mt-2 text-[10.5px] sm:text-[11px] text-steel">
            In Stock ({stats?.outOfStockProducts ?? 0} made to order)
          </p>
        </div>

        {/* Categories */}
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-mist">Categories</p>
            <div className="grid h-8 w-8 place-items-center rounded bg-navy/5 text-navy">
              <FolderIcon size={18} />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-3xl font-bold text-navy">{stats?.totalCategories ?? 0}</p>
          <p className="mt-2 text-[10.5px] sm:text-[11px] text-steel">Machine & parts groups</p>
        </div>

        {/* Blogs & Articles */}
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-mist">Blog Posts</p>
            <div className="grid h-8 w-8 place-items-center rounded bg-orange/10 text-orange">
              <NewspaperIcon size={18} />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 font-display text-2xl sm:text-3xl font-bold text-orange">{stats?.totalBlogs ?? 0}</p>
          <p className="mt-2 text-[10.5px] sm:text-[11px] text-steel">Articles & technical notes</p>
        </div>
      </div>

      {/* Two-Column Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-paper/40">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
              Recent Products
            </h3>
            <Link href="/admin/products" className="text-xs font-semibold text-orange hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-line/60 overflow-x-auto">
            {data?.recentProducts.length === 0 ? (
              <p className="p-5 text-center text-xs text-mist">No products found</p>
            ) : (
              data?.recentProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-4 hover:bg-paper/30 transition">
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-xs font-bold uppercase text-navy">{p.name}</p>
                    <p className="text-[11px] text-mist">
                      {p.category?.name || "Uncategorized"} · SKU: {p.sku || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        p.inStock ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.inStock ? "In Stock" : "Made to order"}
                    </span>
                    <Link
                      href={`/admin/products/${p._id}/edit`}
                      className="rounded border border-line px-2 py-1 text-[11px] font-semibold text-navy hover:border-orange transition"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-paper/40">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy flex items-center gap-2">
              <ActivityIcon size={16} className="text-orange" />
              <span>Audit Activity Log</span>
            </h3>
            <Link href="/admin/logs" className="text-xs font-semibold text-orange hover:underline">
              View All Logs →
            </Link>
          </div>
          <div className="divide-y divide-line/60">
            {data?.recentLogs.length === 0 ? (
              <p className="p-5 text-center text-xs text-mist">No recent activity</p>
            ) : (
              data?.recentLogs.map((log) => (
                <div key={log._id} className="p-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-navy">{log.action}</span>
                    <span className="text-[10px] text-mist">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-steel leading-relaxed">{log.details}</p>
                  {log.user && (
                    <p className="mt-1 text-[10px] text-orange">By: {log.user.name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
