/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '**.onrender.com' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  // Remove the rewrite to backend for uploads — handle via env var in code instead
  env: {
    NEXT_PUBLIC_APP_NAME: 'ApaniDukaan'
  }
};

module.exports = nextConfig;
