// The other self-hosted apps, shown at the top of the Hub. Each starts at localhost on its usual port, and an
// admin can change the address (for a phone, use the server's IP or domain) or hide it.
import { getSiteConfig, setSiteConfigKey } from "./db";

export const KNOWN_APPS = [
  { key: "skybit", name: "SkyBit", port: 7070, description: "Files and photos" },
  { key: "comicorbit", name: "ComicOrbit", port: 7080, description: "Manga and comics" },
  { key: "astrofit", name: "AstroFit", port: 7090, description: "Workouts and food" },
  { key: "nitrolog", name: "NitroLog", port: 7100, description: "Vehicle maintenance" },
] as const;

export type AppKey = (typeof KNOWN_APPS)[number]["key"];
export type LinkedApp = { key: AppKey; name: string; description: string; url: string; defaultUrl: string; custom: boolean; hidden: boolean; icon: string };
type Saved = Partial<Record<AppKey, { url?: string; hidden?: boolean }>>;

const defaultUrl = (port: number) => `http://localhost:${port}`;

function saved(): Saved {
  try { return JSON.parse(getSiteConfig().linked_apps || "{}"); } catch { return {}; }
}

export function getLinkedApps(): LinkedApp[] {
  const s = saved();
  return KNOWN_APPS.map(a => {
    const mine = s[a.key] ?? {};
    return {
      key: a.key, name: a.name, description: a.description, defaultUrl: defaultUrl(a.port),
      url: mine.url || defaultUrl(a.port), custom: !!mine.url, hidden: !!mine.hidden, icon: `/apps/${a.key}.svg`,
    };
  });
}

export const isAppKey = (k: unknown): k is AppKey => KNOWN_APPS.some(a => a.key === k);

/** url: an http(s) address, or "" to go back to localhost. */
export function saveLinkedApp(key: AppKey, change: { url?: string; hidden?: boolean }) {
  const s = saved();
  const cur = { ...(s[key] ?? {}) };
  if (change.url !== undefined) {
    if (change.url === "") delete cur.url;
    else cur.url = change.url;
  }
  if (change.hidden !== undefined) cur.hidden = change.hidden;
  s[key] = cur;
  setSiteConfigKey("linked_apps", JSON.stringify(s));
}

export function appName(key: string): string {
  return KNOWN_APPS.find(a => a.key === key)?.name ?? key.replace(/[^\w -]/g, "").slice(0, 40);
}
