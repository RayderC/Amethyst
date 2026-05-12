"use client";

import { useEffect, useState } from "react";
import type { ServiceLink } from "../../../pages/api/sessions/index";

type FormState = {
  name: string;
  url: string;
  description: string;
  category: string;
  sort_order: string;
};

const empty: FormState = { name: "", url: "", description: "", category: "General", sort_order: "0" };

export default function DashboardSessionsPage() {
  const [links, setLinks] = useState<ServiceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceLink | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  function load() {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => { setLinks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  // Auto-preview favicon when URL changes
  useEffect(() => {
    try {
      const u = new URL(form.url);
      setFaviconPreview(`/api/favicon?url=${encodeURIComponent(u.href)}`);
    } catch {
      setFaviconPreview("");
    }
  }, [form.url]);

  function openAdd() {
    setForm(empty);
    setEditing(null);
    setAdding(true);
    setError("");
  }

  function openEdit(link: ServiceLink) {
    setForm({
      name: link.name,
      url: link.url,
      description: link.description,
      category: link.category,
      sort_order: String(link.sort_order),
    });
    setEditing(link);
    setAdding(false);
    setError("");
  }

  function cancel() {
    setAdding(false);
    setEditing(null);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        url: form.url.trim(),
        description: form.description.trim(),
        category: form.category.trim() || "General",
        icon_url: "",
        sort_order: parseInt(form.sort_order) || 0,
      };

      const url = editing ? `/api/sessions/${editing.id}` : "/api/sessions";
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.message || "Failed to save");
      }
      setAdding(false);
      setEditing(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remove "${name}"?`)) return;
    setDeleting(id);
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  const showForm = adding || editing !== null;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Sessions</h1>
          <p className="dash-subtitle">Manage links to your self-hosted services.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Service</button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-bright)",
          borderRadius: "var(--radius-lg)",
          padding: "28px",
          marginBottom: "32px",
        }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "24px" }}>
            {editing ? "Edit Service" : "Add Service"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                placeholder="Jellyfin"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL *</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  className="form-input"
                  placeholder="https://jellyfin.example.com"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  style={{ flex: 1 }}
                />
                {faviconPreview && (
                  <img
                    src={faviconPreview}
                    alt="favicon"
                    width={28}
                    height={28}
                    style={{ borderRadius: "6px", flexShrink: 0 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                placeholder="Media, Dev, Storage…"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <input
                className="form-input"
                placeholder="Brief description of what this service does"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="form-error" style={{ marginTop: "12px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Service"}
            </button>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>
      ) : links.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⬡</div>
          <p className="empty-title">No services yet</p>
          <p className="empty-desc">Add your first service link to get started.</p>
          {!showForm && (
            <button className="btn btn-primary btn-sm" onClick={openAdd}>Add Service</button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}></th>
                <th>Name</th>
                <th>URL</th>
                <th>Category</th>
                <th>Order</th>
                <th style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <img
                      src={`/api/favicon?url=${encodeURIComponent(link.url)}`}
                      alt=""
                      width={20}
                      height={20}
                      style={{ borderRadius: "4px", display: "block" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{link.name}</td>
                  <td>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary-light)", fontSize: "13px" }}
                    >
                      {link.url}
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-purple">{link.category}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>{link.sort_order}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(link)}
                        disabled={saving}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(link.id, link.name)}
                        disabled={deleting === link.id}
                      >
                        {deleting === link.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
