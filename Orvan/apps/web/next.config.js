/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://137.23.57.25:8000/:path*', 
      },
    ];
  },
};

export default nextConfig;