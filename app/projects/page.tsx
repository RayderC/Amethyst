"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import ProjectCard, { type Project } from "../components/ProjectCard";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allTags = Array.from(
    new Set(
      projects.flatMap((p) => {
        try { return JSON.parse(p.tech_stack) as string[]; } catch { return []; }
      })
    )
  ).sort();

  const visible = filter
    ? projects.filter((p) => {
        try { return (JSON.parse(p.tech_stack) as string[]).includes(filter); } catch { return false; }
      })
    : projects;

  return (
    <div>
      <Navigation />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p className="section-eyebrow">Portfolio</p>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            All Projects
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} — things I&apos;ve built and shipped.
          </p>
        </div>

        {/* Filter */}
        {allTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "36px" }}>
            <button
              className={`skill-chip${!filter ? " active-filter" : ""}`}
              style={!filter ? { borderColor: "var(--primary-light)", color: "var(--primary-light)", background: "var(--primary-glow)" } : {}}
              onClick={() => setFilter("")}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                className="skill-chip"
                style={filter === t ? { borderColor: "var(--primary-light)", color: "var(--primary-light)", background: "var(--primary-glow)" } : {}}
                onClick={() => setFilter(filter === t ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading…</div>
        ) : visible.length > 0 ? (
          <div className="projects-grid">
            {visible.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">{filter ? `No projects tagged "${filter}"` : "No projects yet"}</p>
            <p className="empty-desc">{filter ? "Try clearing the filter." : "Check back soon."}</p>
            {filter && (
              <button className="btn btn-secondary btn-sm" onClick={() => setFilter("")}>Clear filter</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
