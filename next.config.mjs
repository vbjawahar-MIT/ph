/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide Next's dev-mode overlay button in the bottom-left so our VB
  // back-to-top indicator owns that corner.
  devIndicators: false,
  images: {
    // Bypass the Next.js image optimizer entirely on Render free tier.
    //
    // The optimizer transcodes each source image on demand at the origin.
    // On Render's 0.1 CPU free tier that pipeline cannot keep up with a
    // gallery visitor who scrolls: many /_next/image requests stall at
    // Cloudflare's edge and the browser renders those tiles as broken.
    //
    // Kommodo (the source origin) is already fronted by Cloudflare, serves
    // globally at edge speeds, and returns cache-friendly headers. Sending
    // the browser the raw source URLs bypasses the origin CPU bottleneck
    // entirely — the trade-off is per-image bandwidth (source ~500KB vs
    // optimizer WebP ~175KB), still comfortably within any reasonable
    // performance budget for a photography portfolio.
    //
    // Re-enable optimization once Render is upgraded to Starter (0.5 CPU).
    unoptimized: true,
  },
  compress: true,
  async headers() {
    return [
      {
        // Next handles _next/static with hashed URLs immutably by
        // default, but pinning it here means edge caches (Cloudflare
        // in front of Render) always see the immutable directive.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Optimizer output — 1yr immutable. Matches minimumCacheTTL.
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
