// Returns the input with `https://` prepended if no scheme is present.
// Empty/whitespace input is returned unchanged so callers can validate it.
export function normalizeUrl(input: string): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

/** The normalized URL if it's a real http(s) link, otherwise null. A javascript: link runs as whoever clicks it. */
export function httpUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const normalized = normalizeUrl(input);
  if (normalized.length > 2000) return null;
  try {
    const { protocol } = new URL(normalized);
    return protocol === "http:" || protocol === "https:" ? normalized : null;
  } catch {
    return null;
  }
}

/** A link or image address, which can also be a path on this site like /uploads/x.jpg. Empty stays empty. */
export function linkOrEmpty(input: unknown): string | null {
  if (input == null || input === "") return "";
  if (typeof input === "string" && /^\/(?!\/)/.test(input) && input.length <= 2000) return input;
  return httpUrl(input);
}

export function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
