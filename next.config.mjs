import dns from "node:dns";

const SUPABASE_CLOUDFLARE_IPS = [
  { address: "104.18.38.10", family: 4 },
  { address: "172.64.149.246", family: 4 },
];

if (typeof dns?.lookup === "function") {
  const g = globalThis;
  if (!g.__supabaseDnsPatched) {
    g.__supabaseDnsPatched = true;
    const originalLookup = dns.lookup.bind(dns);
    dns.lookup = function (hostname, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (typeof hostname === "string" && hostname.includes("supabase.co")) {
        if (options && options.all) {
          return callback(null, SUPABASE_CLOUDFLARE_IPS);
        }
        return callback(
          null,
          SUPABASE_CLOUDFLARE_IPS[0].address,
          SUPABASE_CLOUDFLARE_IPS[0].family
        );
      }
      return originalLookup(hostname, options, callback);
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
