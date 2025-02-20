/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Keep the /api prefix when forwarding
      },
    ];
  },
};
module.exports = nextConfig;