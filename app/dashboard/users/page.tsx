"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  username: string;
  is_admin: number;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  function startEdit(u: AdminUser) {
    setEditingId(u.id); setEditUsername(u.username); setEditPassword(""); setEditIsAdmin(u.is_admin === 1); setEditError("");
  }

  async function saveEdit(u: AdminUser) {
    setEditSaving(true); setEditError("");
    const body: Record<string, unknown> = {};
    if (editUsername.trim().toLowerCase() !== u.username) body.username = editUsername.trim();
    if (editPassword) body.password = editPassword;
    if (editIsAdmin !== (u.is_admin === 1)) body.isAdmin = editIsAdmin;
    if (!Object.keys(body).length) { setEditSaving(false); setEditingId(null); return; }
    const res = await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setEditSaving(false);
    if (res.ok) { setEditingId(null); setSuccess(`Saved ${String(body.username ?? u.username).toLowerCase()}`); load(); }
    else setEditError((await res.json().catch(() => ({})))?.message || "Couldn't save");
  }

  function load() {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);
    const form = e.currentTarget as HTMLFormElement & {
      username: { value: string };
      password: { value: string };
      isAdmin: { checked: boolean };
    };
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        username: form.username.value.trim().toLowerCase(),
        password: form.password.value,
        isAdmin: form.isAdmin.checked,
      }),
      headers: { "Content-Type": "application/json" },
    });
    setCreating(false);
    if (res.ok) {
      setSuccess(`Created account for ${form.username.value.trim()}`);
      form.reset();
      load();
    } else {
      setError((await res.json()).message || "Failed to create user");
    }
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete account "${username}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError((await res.json()).message || "Failed to delete user");
  }

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Users</h1>
          <p className="dash-subtitle">Only administrators can create new accounts.</p>
        </div>
      </div>

      <div className="stat-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Create new account</h2>
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "480px" }}>
          {error && <p className="form-error">{error}</p>}
          {success && <p style={{ color: "var(--success, #4ade80)", fontSize: "13px" }}>{success}</p>}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input data-bwignore="true" data-1p-ignore="true" data-lpignore="true" type="text" id="username" name="username" className="form-input" placeholder="newuser" autoComplete="off" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input data-bwignore="true" data-1p-ignore="true" data-lpignore="true" autoComplete="new-password" type="password" id="password" name="password" className="form-input" placeholder="At least 8 characters" minLength={8} required />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
            <input type="checkbox" id="isAdmin" name="isAdmin" />
            Grant administrator privileges
          </label>

          <button type="submit" className="btn btn-primary btn-sm" disabled={creating} style={{ alignSelf: "flex-start" }}>
            {creating ? "Creating…" : "Create Account"}
          </button>
        </form>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Created</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => editingId === u.id ? (
                <tr key={u.id}>
                  <td colSpan={4} style={{ padding: "16px" }}>
                    {editError && <p className="form-error" style={{ marginBottom: "12px" }}>{editError}</p>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end" }}>
                      <div className="form-group" style={{ margin: 0, minWidth: "160px" }}>
                        <label className="form-label" htmlFor={`eu-name-${u.id}`} style={{ fontSize: "11px" }}>Username</label>
                        <input data-bwignore="true" data-1p-ignore="true" data-lpignore="true" id={`eu-name-${u.id}`} className="form-input" autoComplete="off" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ margin: 0, minWidth: "160px" }}>
                        <label className="form-label" htmlFor={`eu-pw-${u.id}`} style={{ fontSize: "11px" }}>New password (leave blank to keep)</label>
                        <input data-bwignore="true" data-1p-ignore="true" data-lpignore="true" id={`eu-pw-${u.id}`} type="password" className="form-input" autoComplete="new-password" placeholder="unchanged" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", paddingBottom: "4px" }}>
                        <input type="checkbox" checked={editIsAdmin} onChange={(e) => setEditIsAdmin(e.target.checked)} /> Admin
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(u)} disabled={editSaving}>{editSaving ? "Saving…" : "Save"}</button>
                        <button className="btn btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>A new password signs {u.username} out of every device.</p>
                  </td>
                </tr>
              ) : (
                <tr key={u.id}>
                  <td style={{ color: "var(--text)", fontWeight: 600 }}>{u.username}</td>
                  <td>
                    {u.is_admin === 1
                      ? <span className="badge badge-green">Admin</span>
                      : <span style={{ color: "var(--text-subtle)", fontSize: "13px" }}>User</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-sm" onClick={() => startEdit(u)}>Edit</button>
                      <button className="btn btn-sm" onClick={async () => {
                        if (!confirm(`Sign ${u.username} out of every device?`)) return;
                        const r = await fetch("/api/admin/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id }) });
                        if (r.ok) setSuccess(`${u.username} is signed out everywhere.`); else setError((await r.json()).message || "Failed");
                      }}>Sign out</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id, u.username)}
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
      )}
    </>
  );
}
