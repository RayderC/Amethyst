"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "../../components/MarkdownEditor";
import type { Project } from "../../components/ProjectCard";

type Props = {
  initial?: Partial<Project>;
  projectId?: number;
};

export default function ProjectForm({ initial, projectId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!projectId;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState<string[]>(() => {
    try { return JSON.parse(initial?.tech_stack ?? "[]"); } catch { return []; }
  });
  const [tagInput, setTagInput] = useState("");
  const [githubUrl, setGithubUrl] = useState(initial?.github_url ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(() => {
    try { return JSON.parse(initial?.gallery ?? "[]"); } catch { return []; }
  });
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url ?? "");
  const [featured, setFeatured] = useState(initial?.featured === 1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && tagInput === "" && tags.length) {
      setTags(tags.slice(0, -1));
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        setGallery((prev) => [...prev, url]);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      title, description, content,
      tech_stack: tags,
      github_url: githubUrl,
      live_url: liveUrl,
      image_url: imageUrl,
      gallery,
      youtube_url: youtubeUrl,
      featured,
    };

    const res = await fetch(isEdit ? `/api/projects/${projectId}` : "/api/projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError((await res.json()).message || "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {error && <p className="form-error">{error}</p>}

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Awesome Project"
          required
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Short Description</label>
        <textarea
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief summary shown on project cards."
          rows={3}
        />
        <span className="form-hint">Shown on cards. Keep it to 1–2 sentences.</span>
      </div>

      {/* Tech Stack */}
      <div className="form-group">
        <label className="form-label">Tags / Materials</label>
        <div className="tag-input-wrap" onClick={() => document.getElementById("tag-input")?.focus()}>
          {tags.map((t) => (
            <span key={t} className="tag-chip">
              {t}
              <button type="button" className="tag-chip-remove" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
            </span>
          ))}
          <input
            id="tag-input"
            className="tag-input-field"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={addTag}
            placeholder={tags.length ? "" : "Steel, Aluminum, 3D Printed… (Enter to add)"}
          />
        </div>
      </div>

      {/* URLs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        <div className="form-group">
          <label className="form-label">GitHub URL</label>
          <input className="form-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" />
        </div>
        <div className="form-group">
          <label className="form-label">Live URL</label>
          <input className="form-input" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="form-group">
          <label className="form-label">Thumbnail Image URL</label>
          <input className="form-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/cover.jpg" />
        </div>
      </div>

      {/* YouTube URL */}
      <div className="form-group">
        <label className="form-label">YouTube Video</label>
        <input
          className="form-input"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…  or  https://youtu.be/…"
        />
        <span className="form-hint">Optional. Paste any YouTube link and it gets embedded on the project page.</span>
      </div>

      {/* Gallery Photos */}
      <div className="form-group">
        <label className="form-label">Gallery Photos</label>
        <div className="gallery-upload-grid">
          {gallery.filter(Boolean).map((url, i) => (
            <div key={i} className="gallery-upload-item">
              <img src={url} alt={`Photo ${i + 1}`} />
              <button
                type="button"
                className="gallery-remove"
                onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <label className={`gallery-upload-add${uploading ? " gallery-upload-add--loading" : ""}`}>
            <span style={{ fontSize: "26px", lineHeight: 1 }}>{uploading ? "⏳" : "+"}</span>
            <span>{uploading ? "Uploading…" : "Upload Photos"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <span className="form-hint">Click the + to upload. Select multiple photos at once. Supports JPG, PNG, GIF, WebP.</span>
      </div>

      {/* Featured toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
          <div
            onClick={() => setFeatured(!featured)}
            style={{
              width: "40px",
              height: "22px",
              borderRadius: "11px",
              background: featured ? "var(--primary)" : "var(--border-bright)",
              transition: "background 0.2s",
              position: "relative",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute",
              top: "3px",
              left: featured ? "20px" : "3px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }} />
          </div>
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Feature on home page
          </span>
        </label>
      </div>

      {/* Content / Markdown Editor */}
      <div className="form-group">
        <label className="form-label">Full Description (Markdown)</label>
        <MarkdownEditor value={content} onChange={setContent} />
        <span className="form-hint">Supports headings, bold, lists, images, code blocks, tables, and more.</span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish Project"}
        </button>
        <button type="button" className="btn btn-ghost btn-lg" onClick={() => router.push("/dashboard")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
