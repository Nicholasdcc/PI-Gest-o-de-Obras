import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'mobilidade.estadao.com.br',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/lib', '@/hooks'],
  },
  
  // Enable React compiler optimizations
  reactStrictMode: true,
  
  // Compress responses
  compress: true,
};

export default nextConfig;
