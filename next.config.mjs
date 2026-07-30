/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide Next's dev-mode overlay button in the bottom-left so our VB
  // back-to-top indicator owns that corner.
  devIndicators: false,
  images: {
    qualities: [75, 85, 90],
    // 1 year. The hosted image URLs are immutable (kommododecks generates
    // per-upload IDs), so cache them aggressively both at the Next.js
    // image optimizer layer and in browsers.
    minimumCacheTTL: 31536000,
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
};

export default nextConfig;
