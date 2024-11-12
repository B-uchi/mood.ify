import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'i.scdn.co',
        protocol: 'https',
        port: '',
        pathname: '/image/**' 
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256, 384],
  }
};

export default nextConfig;