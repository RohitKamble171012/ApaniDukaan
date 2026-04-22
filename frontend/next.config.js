/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
