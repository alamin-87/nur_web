"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/Img";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  order: number;
  active: boolean;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/brands");
      const data = await res.json();
      if (data.brands) setBrands(data.brands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingBrand(null);
    setName("");
    setSlug("");
    setLogo("");
    setDescription("");
    setOrder(brands.length + 1);
    setActive(true);
    setError("");
    setModalOpen(true);
  }

  function handleOpenEdit(brand: Brand) {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogo(brand.logo || "");
    setDescription(brand.description || "");
    setOrder(brand.order || 0);
    setActive(brand.active);
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingBrand
        ? `/api/admin/brands/${editingBrand._id}`
        : "/api/admin/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug.trim() || undefined,
          logo,
          description,
          order: Number(order) || 0,
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save brand");

      setModalOpen(false);
      loadBrands();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (res.ok) loadBrands();
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
            Brand Management
          </h2>
          <p className="text-xs text-steel">
            Manage manufacturer brands (Siemens, Delta, Mitsubishi, Omron, Schneider, ABB, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase"
        >
          + Add New Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4 w-16">Logo</th>
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    Loading brands...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    No brands found. Click &quot;+ Add New Brand&quot; above.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4">
                      {b.logo ? (
                        <div className="relative h-9 w-16 rounded border border-line bg-paper/40 overflow-hidden">
                          <Img src={b.logo} alt={b.name} fill className="object-contain p-1" sizes="64px" />
                        </div>
                      ) : (
                        <div className="grid h-8 w-12 place-items-center rounded bg-paper text-[10px] font-bold text-steel">
                          No logo
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold uppercase text-navy">{b.name}</td>
                    <td className="py-3 px-4 text-steel">{b.slug}</td>
                    <td className="py-3 px-4 text-mist max-w-xs truncate">{b.description || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          b.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {b.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b._id, b.name)}
                          className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-mist hover:text-navy font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siemens, Delta, ABB"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Brand Logo URL</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://... or /uploads/..."
                    className="flex-1 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="btn-navy px-3 py-2 text-xs font-bold shrink-0"
                  >
                    Select 🖼️
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the brand / parts..."
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="brandActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <label htmlFor="brandActive" className="text-xs font-bold text-navy cursor-pointer">
                  Active in catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-orange px-5 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setLogo(url)}
      />
    </div>
  );
}
