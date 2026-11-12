"use client";

import { useEffect, useState } from "react";

export type Status = "checking" | "up" | "down";

/** Asks from this browser whether an address answers. Any reply counts; only no reply at all is down. */
async function browserCheck(url: string): Promise<boolean> {
  try {
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(4000) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Up or down for each app and link. The server checks first; anything it can't reach is tried from this
 * browser too, since "localhost" or a home-network address may only work from where you are.
 * Keys: app keys, and "link-<id>" for service links.
 */
export function useHubStatus(targets: { key: string; url: string }[]): Record<string, Status> {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const sig = targets.map(t => `${t.key}=${t.url}`).join("|");

  useEffect(() => {
    if (!targets.length) return;
    let gone = false;
    setStatus(Object.fromEntries(targets.map(t => [t.key, "checking" as Status])));
    (async () => {
      const server = await fetch("/api/hub/status").then(r => (r.ok ? r.json() : { apps: {}, links: {} })).catch(() => ({ apps: {}, links: {} }));
      const serverSays = (key: string) => (key.startsWith("link-") ? server.links?.[key.slice(5)] : server.apps?.[key]);
      await Promise.all(targets.map(async t => {
        const up = serverSays(t.key) === "up" || await browserCheck(t.url);
        if (!gone) setStatus(s => ({ ...s, [t.key]: up ? "up" : "down" }));
      }));
    })();
    return () => { gone = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  return status;
}

export function StatusDot({ status }: { status: Status | undefined }) {
  const s = status ?? "checking";
  const label = s === "up" ? "Up" : s === "down" ? "Not answering" : "Checking…";
  return <span className={`status-dot status-${s}`} role="img" aria-label={label} title={label} />;
}
