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
    ],
  },
};

export default nextConfig;
