"use client";

import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  productCount?: number;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: { _id: string; name: string; slug: string } | string;
  description?: string;
  order: number;
}

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catOrder, setCatOrder] = useState(0);

  // SubCategory Modal State
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subParentCat, setSubParentCat] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subOrder, setSubOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/subcategories"),
      ]);
      const catData = await catRes.json();
      const subData = await subRes.json();
      if (catData.categories) setCategories(catData.categories);
      if (subData.subcategories) setSubcategories(subData.subcategories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // --- Category Handlers ---
  function handleOpenCreateCat() {
    setEditingCategory(null);
    setCatName("");
    setCatSlug("");
    setCatDescription("");
    setCatOrder(categories.length + 1);
    setError("");
    setCatModalOpen(true);
  }

  function handleOpenEditCat(cat: Category) {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description || "");
    setCatOrder(cat.order || 0);
    setError("");
    setCatModalOpen(true);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          slug: catSlug.trim() || undefined,
          description: catDescription,
          order: Number(catOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      setCatModalOpen(false);
      loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }
      loadAll();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  // --- SubCategory Handlers ---
  function handleOpenCreateSub() {
    setEditingSubCategory(null);
    setSubName("");
    setSubSlug("");
    setSubParentCat(selectedCatFilter !== "all" ? selectedCatFilter : categories[0]?._id || "");
    setSubDescription("");
    setSubOrder(subcategories.length + 1);
    setError("");
    setSubModalOpen(true);
  }

  function handleOpenEditSub(sub: SubCategory) {
    setEditingSubCategory(sub);
    setSubName(sub.name);
    setSubSlug(sub.slug);
    setSubParentCat(
      typeof sub.category === "object" ? sub.category._id : sub.category
    );
    setSubDescription(sub.description || "");
    setSubOrder(sub.order || 0);
    setError("");
    setSubModalOpen(true);
  }

  async function handleSaveSubCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!subParentCat) throw new Error("Please select a parent Category");

      const url = editingSubCategory
        ? `/api/admin/subcategories/${editingSubCategory._id}`
        : "/api/admin/subcategories";
      const method = editingSubCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subName,
          slug: subSlug.trim() || undefined,
          category: subParentCat,
          description: subDescription,
          order: Number(subOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save subcategory");

      setSubModalOpen(false);
      loadAll();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSubCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete sub-category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete subcategory");
        return;
      }
      loadAll();
    } catch (err) {
      console.error("Delete subcategory error:", err);
    }
  }

  const filteredSubcategories =
    selectedCatFilter === "all"
      ? subcategories
      : subcategories.filter((s) => {
          const catId = typeof s.category === "object" ? s.category._id : s.category;
          return catId === selectedCatFilter;
        });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            Category &amp; Sub-Category Management
          </h2>
          <p className="text-xs text-steel">
            Organize main machine categories and horizontal sub-category navigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "categories" ? (
            <button
              type="button"
              onClick={handleOpenCreateCat}
              className="btn-orange px-4 py-2 text-xs font-bold uppercase shadow-sm"
            >
              + Add Category
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateSub}
              className="btn-orange px-4 py-2 text-xs font-bold uppercase shadow-sm"
            >
              + Add Sub-Category
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px ${
            activeTab === "categories"
              ? "border-orange text-navy bg-white shadow-xs"
              : "border-transparent text-steel hover:text-navy hover:bg-paper/50"
          }`}
        >
          Main Categories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subcategories")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px ${
            activeTab === "subcategories"
              ? "border-orange text-navy bg-white shadow-xs"
              : "border-transparent text-steel hover:text-navy hover:bg-paper/50"
          }`}
        >
          Sub-Categories ({subcategories.length})
        </button>
      </div>

      {/* MAIN CATEGORIES TAB */}
      {activeTab === "categories" && (
        <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
                <tr>
                  <th className="py-3 px-4 w-16">Order</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Sub-Categories</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-mist">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-mist">
                      No categories found. Click &quot;+ Add Category&quot; above.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => {
                    const subCount = subcategories.filter((s) => {
                      const cid = typeof s.category === "object" ? s.category._id : s.category;
                      return cid === cat._id;
                    }).length;

                    return (
                      <tr key={cat._id} className="hover:bg-paper/30 transition">
                        <td className="py-3 px-4 font-bold text-orange">{cat.order}</td>
                        <td className="py-3 px-4 font-bold uppercase text-navy">{cat.name}</td>
                        <td className="py-3 px-4 text-steel font-mono">{cat.slug}</td>
                        <td className="py-3 px-4 text-mist max-w-xs truncate">{cat.description || "—"}</td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCatFilter(cat._id);
                              setActiveTab("subcategories");
                            }}
                            className="rounded bg-navy/5 hover:bg-orange/10 hover:text-orange px-2 py-0.5 font-bold text-navy transition"
                          >
                            {subCount} sub-items →
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCat(cat)}
                              className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-CATEGORIES TAB */}
      {activeTab === "subcategories" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-line">
            <span className="text-xs font-bold uppercase text-navy">Filter by Parent Category:</span>
            <select
              value={selectedCatFilter}
              onChange={(e) => setSelectedCatFilter(e.target.value)}
              className="rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-orange bg-white text-navy font-medium"
            >
              <option value="all">All Categories ({subcategories.length})</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
                  <tr>
                    <th className="py-3 px-4 w-16">Order</th>
                    <th className="py-3 px-4">Sub-Category Name</th>
                    <th className="py-3 px-4">Parent Category</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-mist">
                        Loading sub-categories...
                      </td>
                    </tr>
                  ) : filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-mist">
                        No sub-categories found. Click &quot;+ Add Sub-Category&quot; above.
                      </td>
                    </tr>
                  ) : (
                    filteredSubcategories.map((sub) => {
                      const parentName =
                        typeof sub.category === "object" && sub.category
                          ? sub.category.name
                          : categories.find((c) => c._id === sub.category)?.name || "—";

                      return (
                        <tr key={sub._id} className="hover:bg-paper/30 transition">
                          <td className="py-3 px-4 font-bold text-orange">{sub.order}</td>
                          <td className="py-3 px-4 font-bold text-navy">{sub.name}</td>
                          <td className="py-3 px-4">
                            <span className="rounded bg-navy text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                              {parentName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-steel font-mono">{sub.slug}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSub(sub)}
                                className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubCategory(sub._id, sub.name)}
                                className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingCategory ? "Edit Main Category" : "Add Main Category"}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="text-mist hover:text-navy font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600">{error}</div>
            )}

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. PLC & HMI, Servo System"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Slug (optional)</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="auto-generated if blank"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Display Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Description</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Short description of this category..."
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-orange px-5 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingSubCategory ? "Edit Sub-Category" : "Add Sub-Category"}
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="text-mist hover:text-navy font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600">{error}</div>
            )}

            <form onSubmit={handleSaveSubCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Parent Category *</label>
                <select
                  required
                  value={subParentCat}
                  onChange={(e) => setSubParentCat(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy font-medium"
                >
                  <option value="">Select Parent Category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Sub-Category Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Horizontal Injection molding machine"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Slug (optional)</label>
                <input
                  type="text"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  placeholder="auto-generated if blank"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Display Order</label>
                <input
                  type="number"
                  value={subOrder}
                  onChange={(e) => setSubOrder(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-orange px-5 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Sub-Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
