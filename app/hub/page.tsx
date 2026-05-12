"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import type { ServiceLink } from "../../pages/api/sessions/index";
import { normalizeUrl, safeHostname } from "../../lib/url";

type GroupedLinks = Record<string, ServiceLink[]>;

export default function HubPage() {
  const router = useRouter();
  const [links, setLinks] = useState<ServiceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Check admin access
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.isAdmin) { router.replace("/login"); return; }
        setAuthed(true);
        return fetch("/api/sessions");
      })
      .then((r) => (r ? r.json() : []))
      .then((data) => { setLinks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const grouped: GroupedLinks = links.reduce((acc, link) => {
    const cat = link.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(link);
    return acc;
  }, {} as GroupedLinks);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Verifying access…
      </div>
    );
  }

  return (
    <div style={{ background: "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(124,14,179,0.15) 0%, transparent 60%), var(--bg)", minHeight: "100vh" }}>
      <Navigation />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p className="section-eyebrow">Admin</p>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            Hub
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "520px" }}>
            Your private gateway to self-hosted services and tools.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading…</div>
        ) : links.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p className="empty-title">No services yet</p>
            <p className="empty-desc">Add links from the dashboard to get started.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catLinks]) => (
            <div key={category} style={{ marginBottom: "56px" }}>
              <p style={{
                fontSize: "11px", fontWeight: 700, color: "var(--primary-light)",
                letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px"
              }}>
                {category}
              </p>
              <div className="sessions-grid">
                {catLinks.map((link) => (
                  <ServiceCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ServiceCard({ link }: { link: ServiceLink }) {
  const href = normalizeUrl(link.url);
  const faviconSrc = `/api/favicon?url=${encodeURIComponent(href)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="service-card"
    >
      <div className="service-card-icon">
        <img
          src={faviconSrc}
          alt={link.name}
          width={32}
          height={32}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="service-card-body">
        <div className="service-card-name">{link.name}</div>
        {link.description && (
          <div className="service-card-desc">{link.description}</div>
        )}
        <div className="service-card-url">
          {safeHostname(href)}
        </div>
      </div>
      <div className="service-card-arrow">↗</div>
    </a>
  );
}
