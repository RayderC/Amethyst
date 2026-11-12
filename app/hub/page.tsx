"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import type { ServiceLink } from "../../pages/api/sessions/index";
import { normalizeUrl } from "../../lib/url";

/** host and port, so two apps on the same machine can be told apart. */
const hostOf = (url: string) => { try { return new URL(url).host; } catch { return url; } };
import type { LinkedApp } from "../../lib/linkedApps";
import { StatusDot, useHubStatus, type Status } from "../components/HubStatus";

type GroupedLinks = Record<string, ServiceLink[]>;

export default function HubPage() {
  const router = useRouter();
  const [links, setLinks] = useState<ServiceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [apps, setApps] = useState<LinkedApp[]>([]);
  const shownApps = apps.filter((a) => !a.hidden);
  const status = useHubStatus([
    ...shownApps.map((a) => ({ key: a.key, url: a.url })),
    ...links.map((l) => ({ key: `link-${l.id}`, url: normalizeUrl(l.url) })),
  ]);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.replace("/login"); return; }
        setAuthed(true);
        fetch("/api/hub/apps").then((r) => (r.ok ? r.json() : [])).then(setApps).catch(() => {});
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
    <div style={{ minHeight: "100vh" }}>
      <Navigation />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p className="section-eyebrow">Services</p>
          <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            Hub
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "520px" }}>
            A private gateway to self-hosted services and tools.
          </p>
        </div>

        {shownApps.length > 0 && (
          <div style={{ marginBottom: "56px" }}>
            <p className="hub-category">Your apps</p>
            <div className="sessions-grid">
              {shownApps.map((a) => <AppCard key={a.key} app={a} status={status[a.key]} />)}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading…</div>
        ) : links.length === 0 ? (
          shownApps.length > 0 ? null : (
            <div className="empty-state">
              <div className="empty-icon">⬡</div>
              <p className="empty-title">No services yet</p>
              <p className="empty-desc">Add links from the dashboard to get started.</p>
            </div>
          )
        ) : (
          Object.entries(grouped).map(([category, catLinks]) => (
            <div key={category} style={{ marginBottom: "56px" }}>
              <p className="hub-category">{category}</p>
              <div className="sessions-grid">
                {catLinks.map((link) => (
                  <ServiceCard key={link.id} link={link} status={status[`link-${link.id}`]} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AppCard({ app, status }: { app: LinkedApp; status: Status | undefined }) {
  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className="service-card app-card" data-app={app.key}>
      <div className="service-card-icon app-card-icon">
        <img src={app.icon} alt="" width={44} height={44} />
      </div>
      <div className="service-card-body">
        <div className="service-card-name">{app.name} <StatusDot status={status} /></div>
        <div className="service-card-desc">{app.description}</div>
        <div className="service-card-url">{hostOf(app.url)}</div>
      </div>
      <div className="service-card-arrow">↗</div>
    </a>
  );
}

function ServiceCard({ link, status }: { link: ServiceLink; status: Status | undefined }) {
  const href = normalizeUrl(link.url);
  const faviconSrc = link.icon_url || `/api/favicon?url=${encodeURIComponent(href)}`;
  const letter = link.name.charAt(0).toUpperCase();

  function handleFaviconLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    // Google returns a 16×16 blank pixel for unknown domains — treat as missing
    if (img.naturalWidth <= 2) img.style.opacity = "0";
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="service-card"
    >
      <div className="service-card-icon">
        <span className="service-card-letter">{letter}</span>
        <img
          src={faviconSrc}
          alt=""
          className="service-card-favicon"
          onLoad={handleFaviconLoad}
          onError={(e) => { (e.currentTarget).style.opacity = "0"; }}
        />
      </div>
      <div className="service-card-body">
        <div className="service-card-name">{link.name} <StatusDot status={status} /></div>
        {link.description && (
          <div className="service-card-desc">{link.description}</div>
        )}
        <div className="service-card-url">
          {hostOf(href)}
        </div>
      </div>
      <div className="service-card-arrow">↗</div>
    </a>
  );
}
