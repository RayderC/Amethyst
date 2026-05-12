// Returns the input with `https://` prepended if no scheme is present.
// Empty/whitespace input is returned unchanged so callers can validate it.
export function normalizeUrl(input: string): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

export function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
