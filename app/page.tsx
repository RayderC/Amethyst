import Link from "next/link";
import Navigation from "./components/Navigation";
import ProjectCard, { type Project } from "./components/ProjectCard";
import db from "@/lib/db";
import { siteConfig } from "@/lib/siteConfig";

function getFeaturedProjects(): Project[] {
  try {
    return db
      .prepare("SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC LIMIT 6")
      .all() as Project[];
  } catch {
    return [];
  }
}

export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <div className="home-bg">
      <Navigation />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {siteConfig.title}
          </div>

          <h1 className="hero-title">
            Hi, I&apos;m{" "}
            <span className="gradient-text">{siteConfig.name}</span>
            <span style={{ display: "block" }}>I build, weld,</span>
            <span style={{ display: "block" }}>and fabricate.</span>
          </h1>

          <p className="hero-desc">{siteConfig.bio}</p>

          <div className="hero-actions">
            <Link href="/projects" className="btn btn-primary btn-lg">
              View Projects
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* About */}
      <section className="section">
        <p className="section-eyebrow">About</p>
        <div className="about-grid">
          <div>
            <h2 className="section-title">Who I am</h2>
            <div className="about-text">
              <p>{siteConfig.bio}</p>
              <p style={{ marginTop: "16px" }}>
                Always working on something new. Reach me at{" "}
                <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--primary-light)" }}>
                  {siteConfig.email}
                </a>
                .
              </p>
            </div>
          </div>

          <div>
            <p className="skills-heading">What I work with</p>
            <div className="skills-wrap">
              {siteConfig.skills.map((s) => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Featured Projects */}
      <section className="section">
        <div className="section-header-row">
          <div>
            <p className="section-eyebrow">Work</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Projects</h2>
          </div>
          <Link href="/projects" className="view-all-link" style={{ marginTop: 0 }}>
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="projects-grid">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">No featured projects yet</p>
            <p className="empty-desc">Head to the dashboard to add your first project.</p>
          </div>
        )}

        {featured.length > 0 && (
          <Link href="/projects" className="view-all-link">
            View all projects →
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-subtle)" }}>
          Built by{" "}
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-light)" }}>
            {siteConfig.name}
          </a>
        </p>
      </footer>
    </div>
  );
}
