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
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <div className="projects-page-inner">
        <div className="projects-page-header">
          <p className="section-eyebrow">Portfolio</p>
          <h1 className="projects-page-title">All Projects</h1>
          <p className="projects-page-desc">
            {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""} — things I've built and made.`}
          </p>
        </div>

        {allTags.length > 0 && (
          <div className="filter-row">
            <button
              className={`filter-chip${!filter ? " filter-chip--active" : ""}`}
              onClick={() => setFilter("")}
            >
              All <span className="filter-chip-count">{projects.length}</span>
            </button>
            {allTags.map((t) => {
              const count = projects.filter((p) => {
                try { return (JSON.parse(p.tech_stack) as string[]).includes(t); } catch { return false; }
              }).length;
              return (
                <button
                  key={t}
                  className={`filter-chip${filter === t ? " filter-chip--active" : ""}`}
                  onClick={() => setFilter(filter === t ? "" : t)}
                >
                  {t} <span className="filter-chip-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
          </div>
        ) : visible.length > 0 ? (
          <div className="projects-grid">
            {visible.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">{filter ? `No projects tagged "${filter}"` : "No projects yet"}</p>
            <p className="empty-desc">{filter ? "Try a different filter." : "Check back soon."}</p>
            {filter && (
              <button className="btn btn-secondary btn-sm" onClick={() => setFilter("")}>Clear filter</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
