/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide Next's dev-mode overlay button in the bottom-left so our VB
  // back-to-top indicator owns that corner.
  devIndicators: false,
  images: {
    qualities: [75, 85, 90],
    // WebP only. AVIF was tested but Render's free-tier 0.1 CPU
    // cannot encode 40+ variants in parallel fast enough during a
    // lazy-scroll burst — many requests time out at Cloudflare's
    // edge and the browser renders them as broken images. WebP is
    // ~4× faster to encode and still 60-70% smaller than JPEG.
    // Re-enable AVIF once Render tier is upgraded (Starter has 0.5 CPU).
    formats: ["image/webp"],
    // 1 year. The hosted image URLs are immutable (kommododecks generates
    // per-upload IDs), so cache them aggressively both at the Next.js
    // image optimizer layer and in browsers.
    minimumCacheTTL: 31536000,
    // Tighten deviceSizes to the breakpoints we actually use — fewer
    // srcset entries means faster parsing + less HTML weight, and
    // the browser still picks a well-fitting variant.
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // YouTube video thumbnails used by the Candid Videos category
        // card and the click-to-load YouTubeEmbed poster frame.
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      // Cloudflare R2 — public dev subdomain
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // Cloudflare R2 — S3-compatible endpoint (rarely used publicly
      // but included so custom endpoint mappings work out of the box)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Cloudflare Images
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      // Custom Cloudflare-fronted domain (add your own here if you
      // put the bucket behind e.g. img.vbphotographe.com)
      {
        protocol: "https",
        hostname: "img.vbphotographe.com",
      },
      // Kommodo share host serving the migrated photographs.
      // See lib/hosted-images.json + scripts/fetch-hosted-images.mjs.
      {
        protocol: "https",
        hostname: "plain-apac-prod-public.komododecks.com",
      },
    ],
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
