import type { NextConfig } from "next";

// Permanent redirects for old paths that moved to /tracker/* during reorganisation.
// 308 = permanent redirect (preserves HTTP method).
const OLD_TRACKER_PATHS = [
  'dashboard', 'products', 'inventory', 'purchases', 'sales',
  'returns', 'customers', 'invoices', 'reports', 'settings',
];

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options',       value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  },

  async redirects() {
    const trackerPageRedirects = OLD_TRACKER_PATHS.map(path => ({
      source:      `/${path}`,
      destination: `/tracker/${path}`,
      permanent:   true,
    }));

    return [
      ...trackerPageRedirects,
    ];
  },
};

export default nextConfig;
