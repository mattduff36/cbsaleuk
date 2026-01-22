/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds (we can enable later)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds for initial migration
  typescript: {
    ignoreBuildErrors: true,
  },
  // Image optimization config
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
