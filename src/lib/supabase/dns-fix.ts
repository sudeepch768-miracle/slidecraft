import dns from "dns";

const SUPABASE_CLOUDFLARE_IPS = [
  { address: "104.18.38.10", family: 4 },
  { address: "172.64.149.246", family: 4 },
];

/**
 * Patches Node.js dns.lookup to resolve *.supabase.co to verified Cloudflare anycast IPs.
 * This fixes local ISP DNS hijacking (e.g. in India/ACT/Airtel) where supabase.co is mapped
 * to non-responsive IP addresses, breaking authentication and API connectivity.
 */
if (typeof window === "undefined" && typeof dns?.lookup === "function") {
  const g = globalThis as any;
  if (!g.__supabaseDnsPatched) {
    g.__supabaseDnsPatched = true;
    const originalLookup = dns.lookup.bind(dns);

    dns.lookup = function (
      hostname: string,
      options: any,
      callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
    ) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }

      if (typeof hostname === "string" && hostname.includes("supabase.co")) {
        if (options && options.all) {
          return callback(null, SUPABASE_CLOUDFLARE_IPS as any);
        }
        return callback(
          null,
          SUPABASE_CLOUDFLARE_IPS[0].address,
          SUPABASE_CLOUDFLARE_IPS[0].family
        );
      }

      return originalLookup(hostname, options, callback);
    } as any;
  }
}
