/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide Next's dev-mode overlay button in the bottom-left so our VB
  // back-to-top indicator owns that corner.
  devIndicators: false,
  images: {
    qualities: [75, 85, 90],
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
    ],
  },
};

export default nextConfig;
