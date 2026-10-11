"use client";

import { useEffect, useState } from "react";

interface FeatureItem {
  _id: string;
  name: string;
  slug: string;
  order: number;
  active: boolean;
}

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeatures();
  }, []);

  async function loadFeatures() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/features");
      const data = await res.json();
      if (data.features) setFeatures(data.features);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingFeature(null);
    setName("");
    setSlug("");
    setOrder(features.length + 1);
    setActive(true);
    setError("");
    setModalOpen(true);
  }

  function handleOpenEdit(feat: FeatureItem) {
    setEditingFeature(feat);
    setName(feat.name);
    setSlug(feat.slug);
    setOrder(feat.order || 0);
    setActive(feat.active !== false);
    setError("");
    setModalOpen(true);
  }

  async function handleSaveFeature(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingFeature
        ? `/api/admin/features/${editingFeature._id}`
        : "/api/admin/features";
      const method = editingFeature ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug.trim() || undefined,
          order: Number(order) || 0,
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save feature");

      setModalOpen(false);
      loadFeatures();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFeature(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete special feature "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/features/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete feature");
        return;
      }
      loadFeatures();
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
            Special Features Management
          </h2>
          <p className="text-xs text-steel">
            Manage the 23 technical capabilities and machine specifications displayed in the homepage 3-column list.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase shadow-sm"
        >
          + Add Feature
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4 w-16">No.</th>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    Loading features...
                  </td>
                </tr>
              ) : features.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    No features found. Click &quot;+ Add Feature&quot; above.
                  </td>
                </tr>
              ) : (
                features.map((feat, i) => (
                  <tr key={feat._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4 font-bold text-orange">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-4 font-bold text-navy flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{feat.name}</span>
                    </td>
                    <td className="py-3 px-4 text-steel font-mono">{feat.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        feat.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {feat.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(feat)}
                          className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feat._id, feat.name)}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingFeature ? "Edit Special Feature" : "Add Special Feature"}
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
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600">{error}</div>
            )}

            <form onSubmit={handleSaveFeature} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Feature Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Injection molding machine (IMM), Moulds"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Slug (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated if blank"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-line text-orange focus:ring-orange"
                />
                <label htmlFor="featActive" className="text-xs font-bold text-navy cursor-pointer select-none">
                  Active (Display on Homepage)
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
                  {saving ? "Saving..." : "Save Feature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
