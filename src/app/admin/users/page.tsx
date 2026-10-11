"use client";

import { useEffect, useState } from "react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "admin" | "editor" | "viewer">("admin");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("admin");
    setActive(true);
    setError("");
    setModalOpen(true);
  }

  function handleOpenEdit(u: UserItem) {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setActive(u.active);
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser._id}`
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
        name,
        email,
        role,
        active,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save user");

      setModalOpen(false);
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            User Management & Roles
          </h2>
          <p className="text-xs text-steel">
            Control administrator accounts, editorial access and permission roles.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase"
        >
          + Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    Loading users...
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-paper/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[11px] font-bold text-white uppercase">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-navy">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-steel">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.role === "super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : u.role === "editor"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-mist">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u._id, u.name)}
                        className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingUser ? "Edit User Account" : "Add New User Account"}
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
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUser)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@nurengineering.com"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange disabled:bg-paper"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Role & Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "super_admin" | "admin" | "editor" | "viewer")}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none bg-white text-navy font-bold"
                >
                  <option value="super_admin">Super Admin (Full Access)</option>
                  <option value="admin">Admin (Catalog & Content)</option>
                  <option value="editor">Editor (Blog & Pages)</option>
                  <option value="viewer">Viewer (Read-Only)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <label htmlFor="userActive" className="text-xs font-bold text-navy cursor-pointer">
                  Account is Active
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
                  {saving ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
