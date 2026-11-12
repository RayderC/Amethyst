import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navigation from "../../components/Navigation";
import db from "@/lib/db";
import type { Project } from "../../components/ProjectCard";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let videoId: string | null = null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") videoId = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) videoId = u.pathname.split("/embed/")[1];
      else if (u.pathname.startsWith("/shorts/")) videoId = u.pathname.split("/shorts/")[1];
    } else if (host === "youtu.be") {
      videoId = u.pathname.slice(1);
    }
    return videoId && /^[\w-]{1,64}$/.test(videoId) ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = db
    // By its readable name (/projects/steel-workbench) or, for old links, its number.
    .prepare("SELECT * FROM projects WHERE slug = ? OR id = ? ORDER BY slug = ? DESC LIMIT 1")
    .get(projectId, projectId, projectId) as Project | undefined;

  if (!project) notFound();

  const tags: string[] = (() => {
    try { return JSON.parse(project.tech_stack); } catch { return []; }
  })();

  const galleryImages: string[] = (() => {
    try {
      const parsed = JSON.parse(project.gallery ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch { return []; }
  })();

  const embedUrl = getYouTubeEmbedUrl(project.youtube_url ?? "");

  return (
    <div>
      <Navigation />

      <div className="project-detail-page">
        <Link href="/projects" className="back-link">← Back to Projects</Link>

        <div style={{ marginBottom: "40px" }}>
          <h1 className="project-detail-title">{project.title}</h1>
          {project.description && (
            <p className="project-detail-desc">{project.description}</p>
          )}

          <div className="project-detail-meta">
            {tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                GitHub ↗
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Live Demo ↗
              </a>
            )}
          </div>
        </div>

        {project.image_url && (
          <img src={project.image_url} alt={project.title} className="project-detail-img" />
        )}

        {embedUrl && (
          <div className="youtube-embed">
            <iframe
              src={embedUrl}
              title={`${project.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className="project-gallery">
            {galleryImages.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="project-gallery-item">
                <img src={src} alt={`${project.title} photo ${i + 1}`} />
              </a>
            ))}
          </div>
        )}

        {project.content ? (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No description provided.</p>
        )}
      </div>
    </div>
  );
}
