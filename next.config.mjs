/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize images for production
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
