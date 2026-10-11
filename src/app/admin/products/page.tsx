"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Img } from "@/components/Img";

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  category?: { _id: string; name: string; slug: string };
  price?: number;
  currency: string;
  image: string;
  inStock: boolean;
  published: boolean;
  featured: boolean;
  order: number;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (stockFilter) params.set("stock", stockFilter);
      if (publishedFilter) params.set("published", publishedFilter);
      params.set("page", String(page));
      params.set("limit", "15");

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setProducts(data.items);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, stockFilter, publishedFilter, page]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function toggleStatus(id: string, field: "inStock" | "published" | "featured", current: boolean) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, [field]: !current } : p))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            Product Management
          </h2>
          <p className="text-xs text-steel">
            Manage your complete machine parts, automation components and inventory.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-orange px-4 py-2 text-xs font-bold uppercase">
          + Add New Product
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 rounded-lg border border-line bg-white p-3.5 sm:p-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:min-w-[200px] sm:flex-1">
          <input
            type="search"
            placeholder="Search name, SKU, brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy"
        >
          <option value="">All Availability</option>
          <option value="in">In Stock</option>
          <option value="out">Made to Order</option>
        </select>

        {/* Published Filter */}
        <select
          value={publishedFilter}
          onChange={(e) => {
            setPublishedFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        {(search || categoryFilter || stockFilter || publishedFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setStockFilter("");
              setPublishedFilter("");
              setPage(1);
            }}
            className="text-xs text-orange hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand / SKU</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-bold text-navy">No products found</p>
                    <p className="mt-1 text-xs text-mist">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-paper/30 transition">
                    {/* Product Name & Image */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-line bg-paper/50">
                          <Img
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold uppercase text-navy line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-mist truncate">/products/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-medium text-navy">
                      {p.category?.name || "—"}
                    </td>

                    {/* Brand / SKU */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-steel">{p.brand || "—"}</p>
                      <p className="text-[10.5px] text-mist">{p.sku ? `SKU: ${p.sku}` : ""}</p>
                    </td>

                    {/* Stock status toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(p._id, "inStock", p.inStock)}
                        className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                          p.inStock
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {p.inStock ? "● In Stock" : "○ Made to Order"}
                      </button>
                    </td>

                    {/* Published status toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(p._id, "published", p.published)}
                        className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                          p.published
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p.published ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-line px-2 py-1 text-[11px] font-medium text-navy hover:border-orange transition"
                          title="View on public site"
                        >
                          👁️ View
                        </Link>
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="rounded border border-line bg-paper px-2 py-1 text-[11px] font-bold text-navy hover:border-orange hover:text-orange transition"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.name)}
                          className="rounded border border-red-200 bg-red-50/50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line px-4 sm:px-5 py-3 text-xs text-steel bg-paper/20">
          <span>
            Total: <strong>{totalCount}</strong> products
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-line px-3 py-1 font-bold disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line px-3 py-1 font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
