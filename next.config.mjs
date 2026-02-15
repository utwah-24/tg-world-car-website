/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tgworld.e-saloon.online',
        port: '',
        pathname: '/public/**',
      },
    ],
  },
}

export default nextConfig
