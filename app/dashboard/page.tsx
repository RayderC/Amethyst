"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "../components/ProjectCard";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  function load() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  const featured = projects.filter((p) => p.featured === 1).length;

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Projects</h1>
          <p className="dash-subtitle">Manage everything that appears on your portfolio.</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{featured}</div>
          <div className="stat-label">Featured on Home</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p className="empty-title">No projects yet</p>
          <p className="empty-desc">Create your first project to get started.</p>
          <Link href="/dashboard/new" className="btn btn-primary btn-sm">Create Project</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Tech Stack</th>
                <th>Featured</th>
                <th>Created</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const tags: string[] = (() => { try { return JSON.parse(p.tech_stack); } catch { return []; } })();
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/projects/${p.id}`} style={{ color: "var(--text)", fontWeight: 600 }} target="_blank">
                        {p.title}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                        {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
                      </div>
                    </td>
                    <td>
                      {p.featured === 1
                        ? <span className="badge badge-green">Yes</span>
                        : <span style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link href={`/dashboard/edit/${p.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                        >
                          {deleting === p.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
