/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/en/:path*',
        destination: '/:path*',
      },
      {
        source: '/de/:path*',
        destination: '/:path*',
      },
      {
        source: '/ru/:path*',
        destination: '/:path*',
      }
    ];
  },
};

export default nextConfig;
