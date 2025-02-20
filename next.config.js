/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:7860/api/:path*', // Keep the /api prefix when forwarding
      },
    ];
  },
};
module.exports = nextConfig;