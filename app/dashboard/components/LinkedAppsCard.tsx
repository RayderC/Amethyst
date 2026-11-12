"use client";

import { useEffect, useState } from "react";
import type { LinkedApp } from "../../../lib/linkedApps";
import { StatusDot, useHubStatus } from "../../components/HubStatus";

/** Dashboard → Hub: the other apps on the Hub, each with its address and a Hide switch. */
export default function LinkedAppsCard() {
  const [apps, setApps] = useState<LinkedApp[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const status = useHubStatus(apps.filter(a => !a.hidden).map(a => ({ key: a.key, url: a.url })));

  useEffect(() => {
    fetch("/api/hub/apps").then(r => r.json()).then((list: LinkedApp[]) => {
      setApps(list);
      setDrafts(Object.fromEntries(list.map(a => [a.key, a.custom ? a.url : ""])));
    }).catch(() => {});
  }, []);

  async function save(key: string, body: { url?: string; hidden?: boolean }, done: string) {
    setMsg(null);
    const r = await fetch("/api/hub/apps", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, ...body }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg({ text: j.message || "Couldn't save", error: true }); return; }
    setApps(j);
    setDrafts(Object.fromEntries((j as LinkedApp[]).map(a => [a.key, a.custom ? a.url : ""])));
    setMsg({ text: done });
  }

  return (
    <div className="card linked-apps" id="linked-apps">
      <h2 className="ops-title">Your apps</h2>
      <p className="ops-hint">
        These sit at the top of the Hub. Each starts at <code>localhost</code> on its usual port, which only opens on the server itself.
        To open them from a phone or another computer, put in the server&apos;s address instead, like <code>http://192.168.1.5:7100</code> or your domain.
      </p>
      {msg && <p className={msg.error ? "form-error" : "ops-hint"} role="status">{msg.text}</p>}
      {apps.map(a => (
        <div key={a.key} className="linked-app-row" data-app={a.key}>
          <img src={a.icon} alt="" width={36} height={36} className="linked-app-icon" />
          <div className="linked-app-main">
            <div className="linked-app-name">{a.name} {!a.hidden && <StatusDot status={status[a.key]} />}</div>
            <div className="linked-app-edit">
              <input className="form-input" aria-label={`${a.name} address`} placeholder={a.defaultUrl}
                value={drafts[a.key] ?? ""} onChange={e => setDrafts({ ...drafts, [a.key]: e.target.value })} />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => save(a.key, { url: (drafts[a.key] ?? "").trim() }, `${a.name} saved.`)}>Save</button>
            </div>
            <label className="linked-app-hide">
              <input type="checkbox" checked={a.hidden} onChange={e => save(a.key, { hidden: e.target.checked }, e.target.checked ? `${a.name} is hidden.` : `${a.name} is shown.`)} />
              Hide from the Hub
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
