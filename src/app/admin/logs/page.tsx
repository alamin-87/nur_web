"use client";

import { useEffect, useState } from "react";

interface ActivityLogItem {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  user?: { name: string; email: string; role: string };
  createdAt: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  async function loadLogs() {
    try {
      setLoading(true);
      const url = entityFilter
        ? `/api/admin/activity-logs?entity=${encodeURIComponent(entityFilter)}`
        : "/api/admin/activity-logs";
      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Audit Activity Logs
          </h2>
          <p className="text-xs text-steel">
            Chronological audit trail of all changes made across products, settings and user accounts.
          </p>
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded border border-line bg-white px-3 py-2 text-xs font-bold text-navy outline-none focus:border-orange shadow-xs w-full sm:w-auto"
        >
          <option value="">All Entities</option>
          <option value="Product">Products</option>
          <option value="Category">Categories</option>
          <option value="Brand">Brands</option>
          <option value="BlogPost">Blog Posts</option>
          <option value="MediaItem">Media Files</option>
          <option value="SiteSettings">Website Settings</option>
          <option value="User">Users &amp; Authentication</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-mist">
                    No activity logs recorded for this entity.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4 font-bold text-navy">
                      <span className="rounded bg-paper px-2 py-0.5 font-mono text-[11px] text-orange">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-steel">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-steel max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4">
                      {log.user ? (
                        <div>
                          <p className="font-bold text-navy">{log.user.name}</p>
                          <p className="text-[10px] text-mist">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-mist">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-mist whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
