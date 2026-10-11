"use client";

import { useEffect, useState } from "react";

interface ServiceItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  order: number;
  featured?: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingService(null);
    setTitle("");
    setSlug("");
    setShortDescription("");
    setOrder(services.length + 1);
    setError("");
    setModalOpen(true);
  }

  function handleOpenEdit(svc: ServiceItem) {
    setEditingService(svc);
    setTitle(svc.title);
    setSlug(svc.slug);
    setShortDescription(svc.shortDescription || "");
    setOrder(svc.order || 0);
    setError("");
    setModalOpen(true);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingService
        ? `/api/admin/services/${editingService._id}`
        : "/api/admin/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug.trim() || undefined,
          shortDescription,
          order: Number(order) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save service");

      setModalOpen(false);
      loadServices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete service "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete service");
        return;
      }
      loadServices();
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
            Company Services Management
          </h2>
          <p className="text-xs text-steel">
            Manage the 6 core company services displayed across the homepage boxes and services catalog.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase shadow-sm"
        >
          + Add Service
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4 w-16">No.</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    No services found. Click &quot;+ Add Service&quot; above.
                  </td>
                </tr>
              ) : (
                services.map((svc, i) => (
                  <tr key={svc._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4 font-bold text-orange">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-4 font-bold uppercase text-navy">{svc.title}</td>
                    <td className="py-3 px-4 text-steel font-mono">{svc.slug}</td>
                    <td className="py-3 px-4 text-mist max-w-xs truncate">{svc.shortDescription || "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(svc)}
                          className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(svc._id, svc.title)}
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
                {editingService ? "Edit Service" : "Add Service"}
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

            <form onSubmit={handleSaveService} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Service Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Industrial machineries, Machine spare parts"
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

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Short Summary</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Short description..."
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
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
                  {saving ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
