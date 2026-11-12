import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** The Hub pages also check, from your browser, whether each app and link answers, so they may connect anywhere. */
const csp = (hub: boolean) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Project images and service icons can be hosted anywhere.
  "img-src 'self' data: blob: http: https:",
  `connect-src 'self'${hub ? " http: https:" : ""}${isDev ? " wss: ws:" : ""}`,
  "font-src 'self'",
  "frame-src https://www.youtube.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp(false) },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  transpilePackages: ["react-markdown", "remark-gfm"],
  async headers() {
    const hub = [...securityHeaders.filter(h => h.key !== "Content-Security-Policy"), { key: "Content-Security-Policy", value: csp(true) }];
    return [
      // When two rules set the same header, the later one wins, so the Hub pages get the looser policy.
      { source: "/(.*)", headers: securityHeaders },
      { source: "/hub", headers: hub },
      { source: "/dashboard/hub", headers: hub },
    ];
  },
};

export default nextConfig;
