"use client";

import { useEffect, useRef, useState } from "react";

type Info = { app: string; origin: string; username: string; known: boolean };

/**
 * Another app sent you here to sign in. If you're signed in to Amethyst, this asks once (or not at all for the
 * apps on your Hub) and sends you back with a pass.
 */
export default function SsoPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  const params = () => new URLSearchParams(window.location.search);

  async function go() {
    setBusy(true);
    const p = params();
    const r = await fetch("/api/sso/authorize", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: p.get("app"), return: p.get("return"), state: p.get("state") }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setError(j.message || "Couldn't sign you in"); setBusy(false); return; }
    window.location.replace(j.redirect);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const p = params();
    fetch(`/api/sso/authorize?app=${encodeURIComponent(p.get("app") ?? "")}&return=${encodeURIComponent(p.get("return") ?? "")}`)
      .then(async r => {
        if (r.status === 401) {
          window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setError(j.message || "Couldn't sign you in"); return; }
        setInfo(j);
        // Apps on your Hub don't need asking.
        if (j.known) go();
      })
      .catch(() => setError("Couldn't reach Amethyst."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card sso-card">
        <h1 className="sso-title">Sign in with Amethyst</h1>
        {error ? <p className="form-error">{error}</p> : !info ? <p className="ops-hint">Checking…</p> : (
          <>
            <p className="ops-hint">
              <b>{info.app}</b> at <code className="sso-code">{info.origin}</code> wants to sign you in as <b>{info.username}</b>.
            </p>
            {!info.known && <p className="ops-hint">That address isn&apos;t one of the apps on your Hub. Only continue if you just tapped <b>Sign in with Amethyst</b> there.</p>}
            <div className="ops-actions">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={go}>{busy ? "Signing in…" : `Continue to ${info.app}`}</button>
              <a className="btn btn-ghost" href="/hub">Cancel</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
