"use client";

import { useEffect, useState } from "react";
import { BackupsCard, SignInsCard, UpdateNotice } from "../../components/OpsCards";

/** Updates, backups, shared login and your sign-ins. */
export default function SystemPage() {
  return (
    <>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">System</h1>
          <p className="dash-subtitle">Updates, backups, shared login and sign-ins.</p>
        </div>
      </div>
      <UpdateNotice />
      <SsoCard />
      <BackupsCard />
      <SignInsCard />
    </>
  );
}

function SsoCard() {
  const [state, setState] = useState<{ enabled: boolean; secret: string | null } | null>(null);
  const [shown, setShown] = useState(false);
  const [msg, setMsg] = useState("");
  const call = async (method: string) => {
    const r = await fetch("/api/admin/sso", { method });
    if (r.ok) setState(await r.json());
  };
  useEffect(() => { call("GET"); }, []);
  if (!state) return null;
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <div className="card ops-card" id="sso">
      <div className="ops-head"><h2 className="ops-title">Sign in with Amethyst</h2><span className={`ops-badge${state.enabled ? " on" : ""}`}>{state.enabled ? "On" : "Off"}</span></div>
      <p className="ops-hint">
        Lets people sign in to SkyBit, ComicOrbit, AstroFit and NitroLog with their Amethyst account. It matches by username,
        so the person needs an account with the same name in that app. Their own password still works there too.
      </p>
      {!state.enabled ? (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => call("POST")}>Turn on shared login</button>
      ) : (
        <>
          <ol className="sso-steps">
            <li>In each app, open its admin page and find <b>Sign in with Amethyst</b>.</li>
            <li>Put in this Amethyst&apos;s address: <code className="sso-code">{origin}</code></li>
            <li>Paste this shared secret:
              <div className="sso-secret">
                <code className="sso-code" data-secret>{shown ? state.secret : "•".repeat(24)}</code>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShown(!shown)}>{shown ? "Hide" : "Show"}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={async () => {
                  try { await navigator.clipboard.writeText(state.secret ?? ""); setMsg("Copied."); } catch { setShown(true); setMsg("Select it and copy."); }
                }}>Copy</button>
              </div>
            </li>
            <li>The app&apos;s login page then has a <b>Sign in with Amethyst</b> button.</li>
          </ol>
          {msg && <p className="ops-hint" role="status">{msg}</p>}
          <p className="ops-hint">Treat the secret like a password: anyone with it could sign in to those apps as anyone. If it leaks, make a new one and paste it into each app again.</p>
          <div className="ops-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { if (confirm("Make a new secret? Each app stops accepting Amethyst sign-ins until you paste the new one in.")) call("POST"); }}>Make a new secret</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Turn shared login off?")) call("DELETE"); }}>Turn off</button>
          </div>
        </>
      )}
    </div>
  );
}
