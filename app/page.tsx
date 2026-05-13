export const dynamic = "force-dynamic";

import Link from "next/link";
import Navigation from "./components/Navigation";
import ProjectCard, { type Project } from "./components/ProjectCard";
import db, { getSiteConfig } from "@/lib/db";
import { siteConfig as defaults } from "@/lib/siteConfig";

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
  const raw = getSiteConfig();

  const cfg = {
    name:       raw.name       || defaults.name,
    badge:      raw.badge_title || defaults.title,
    heroLine1:  raw.hero_line1  || "I build, weld,",
    heroLine2:  raw.hero_line2  || "and fabricate.",
    bio:        raw.bio        || defaults.bio,
    skills:     raw.skills     ? (JSON.parse(raw.skills) as string[]) : defaults.skills,
    email:      raw.email      || defaults.email,
    github:     raw.github     || defaults.github,
  };

  return (
    <div className="home-bg">
      <Navigation />

      {/* Hero */}
      <section className="hero">

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {cfg.badge}
          </div>

          <h1 className="hero-title">
            Hi, I&apos;m{" "}
            <span className="gradient-text">{cfg.name}</span>
            <span style={{ display: "block" }}>{cfg.heroLine1}</span>
            <span style={{ display: "block" }}>{cfg.heroLine2}</span>
          </h1>

          <p className="hero-desc">{cfg.bio}</p>

          <div className="hero-actions">
            <Link href="/projects" className="btn btn-primary btn-lg">
              View Projects
            </Link>
          </div>
        </div>

        <a href="#about" className="scroll-indicator" aria-label="Scroll down">
          <span className="scroll-indicator-text">Scroll</span>
          <span className="scroll-indicator-arrow">↓</span>
        </a>
      </section>

      <hr className="section-divider" />

      {/* About */}
      <section id="about" className="section">
        <p className="section-eyebrow">About</p>
        <div className="about-grid">
          <div>
            <h2 className="section-title">Who I am</h2>
            <div className="about-text">
              <p>{cfg.bio}</p>
              <p style={{ marginTop: "16px" }}>
                Always working on something new. Reach me at{" "}
                <a href={`mailto:${cfg.email}`} style={{ color: "var(--primary-light)" }}>
                  {cfg.email}
                </a>
                .
              </p>
            </div>
          </div>

          <div>
            <p className="skills-heading">What I work with</p>
            <div className="skills-wrap">
              {cfg.skills.map((s) => (
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
      <footer className="site-footer">
        <p style={{ fontSize: "13px", color: "var(--text-subtle)" }}>
          Built by{" "}
          <a href={cfg.github} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-light)" }}>
            {cfg.name}
          </a>
        </p>
        <Link href="/login" className="footer-login-link">Admin</Link>
      </footer>
    </div>
  );
}
