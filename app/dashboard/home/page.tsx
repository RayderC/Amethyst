"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

const DEFAULTS = {
  name: "RayderC",
  badge_title: "Maker & Fabricator",
  hero_line1: "I build, weld,",
  hero_line2: "and fabricate.",
  bio: "I build and modify things. Cars, custom exhausts, control panels, full paint jobs. Currently in welding school and spending a lot of time in CAD designing custom parts. If something can be modified or built better, I want to figure out how.",
  skills: ["Welding", "Fabrication", "CAD / Design", "3D Printing", "Car Modification", "Custom Exhausts", "Painting", "Custom Control Panels", "Custom Parts", "Sheet Metal"],
  email: "rayder.chance@gmail.com",
  github: "https://github.com/RayderC",
};

export default function HomeEditorPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [badgeTitle, setBadgeTitle] = useState("");
  const [heroLine1, setHeroLine1] = useState("");
  const [heroLine2, setHeroLine2] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((cfg: Record<string, string>) => {
        setName(cfg.name || DEFAULTS.name);
        setBadgeTitle(cfg.badge_title || DEFAULTS.badge_title);
        setHeroLine1(cfg.hero_line1 || DEFAULTS.hero_line1);
        setHeroLine2(cfg.hero_line2 || DEFAULTS.hero_line2);
        setBio(cfg.bio || DEFAULTS.bio);
        setSkills(cfg.skills ? JSON.parse(cfg.skills) : DEFAULTS.skills);
        setEmail(cfg.email || DEFAULTS.email);
        setGithub(cfg.github || DEFAULTS.github);
        setLoaded(true);
      })
      .catch(() => {
        setName(DEFAULTS.name);
        setBadgeTitle(DEFAULTS.badge_title);
        setHeroLine1(DEFAULTS.hero_line1);
        setHeroLine2(DEFAULTS.hero_line2);
        setBio(DEFAULTS.bio);
        setSkills(DEFAULTS.skills);
        setEmail(DEFAULTS.email);
        setGithub(DEFAULTS.github);
        setLoaded(true);
      });
  }, []);

  function addSkill() {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) setSkills([...skills, t]);
    setSkillInput("");
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
    if (e.key === "Backspace" && skillInput === "" && skills.length) setSkills(skills.slice(0, -1));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, badge_title: badgeTitle, hero_line1: heroLine1, hero_line2: heroLine2, bio, skills, email, github }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError((await res.json()).message || "Failed to save");
    }
  }

  if (!loaded) {
    return <p style={{ color: "var(--text-muted)", padding: "40px 0" }}>Loading…</p>;
  }

  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Home Page</h1>
          <p className="dash-subtitle">Edit your public-facing name, bio, hero text, and skills.</p>
        </div>
        <a href="/" target="_blank" className="btn btn-secondary">Preview Site ↗</a>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "780px" }}>
        {error && <p className="form-error">{error}</p>}
        {saved && <p style={{ color: "var(--success)", fontSize: "13px" }}>Saved successfully.</p>}

        {/* Identity */}
        <div>
          <p className="sidebar-section-label" style={{ marginBottom: "16px" }}>Identity</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="RayderC" />
              <span className="form-hint">Shown in the nav logo and hero greeting.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Badge Title</label>
              <input className="form-input" value={badgeTitle} onChange={(e) => setBadgeTitle(e.target.value)} placeholder="Maker & Fabricator" />
              <span className="form-hint">The small pill above the hero title.</span>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <p className="sidebar-section-label" style={{ marginBottom: "16px" }}>Hero Title</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Line 1</label>
              <input className="form-input" value={heroLine1} onChange={(e) => setHeroLine1(e.target.value)} placeholder="I build, weld," />
            </div>
            <div className="form-group">
              <label className="form-label">Line 2</label>
              <input className="form-input" value={heroLine2} onChange={(e) => setHeroLine2(e.target.value)} placeholder="and fabricate." />
            </div>
          </div>
          <div className="form-hint" style={{ marginTop: "8px" }}>
            Preview: <span style={{ color: "var(--text)", fontWeight: 600 }}>Hi, I&apos;m {name || "RayderC"} / {heroLine1 || "…"} / {heroLine2 || "…"}</span>
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            className="form-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Write a short bio about yourself…"
          />
          <span className="form-hint">Shown in the hero subtitle and the About section.</span>
        </div>

        {/* Skills */}
        <div className="form-group">
          <label className="form-label">Skills / What I Work With</label>
          <div className="tag-input-wrap" onClick={() => document.getElementById("skill-input")?.focus()}>
            {skills.map((s) => (
              <span key={s} className="tag-chip">
                {s}
                <button type="button" className="tag-chip-remove" onClick={() => setSkills(skills.filter((x) => x !== s))}>×</button>
              </span>
            ))}
            <input
              id="skill-input"
              className="tag-input-field"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              onBlur={addSkill}
              placeholder={skills.length ? "" : "Welding, CAD, 3D Printing… (Enter to add)"}
            />
          </div>
          <span className="form-hint">These appear as chips in the About section. Press Enter or comma to add.</span>
        </div>

        {/* Links */}
        <div>
          <p className="sidebar-section-label" style={{ marginBottom: "16px" }}>Contact & Links</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input className="form-input" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/…" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => router.push("/dashboard")}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
