"use client";

import Link from "next/link";

export type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  tech_stack: string;
  github_url: string;
  live_url: string;
  image_url: string;
  gallery: string;
  youtube_url: string;
  featured: number;
  created_at: string;
  updated_at: string;
};

export default function ProjectCard({ project }: { project: Project }) {
  const tags: string[] = (() => {
    try { return JSON.parse(project.tech_stack); } catch { return []; }
  })();

  return (
    <Link href={`/projects/${project.id}`} className={`project-card${project.featured === 1 ? " project-card--featured" : ""}`}>
      <div className="project-card-media">
        {project.image_url ? (
          <img src={project.image_url} alt={project.title} className="project-card-img" />
        ) : (
          <div className="project-card-placeholder">
            <span className="project-card-placeholder-icon">◈</span>
          </div>
        )}
        {project.featured === 1 && (
          <span className="project-card-featured-badge">★ Featured</span>
        )}
      </div>

      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        {project.description && (
          <p className="project-card-desc">{project.description}</p>
        )}
        {tags.length > 0 && (
          <div className="project-card-tags">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
            {tags.length > 4 && (
              <span className="tag">+{tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {(project.github_url || project.live_url) && (
        <div className="project-card-footer">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub ↗
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Live Demo ↗
            </a>
          )}
        </div>
      )}
    </Link>
  );
}
