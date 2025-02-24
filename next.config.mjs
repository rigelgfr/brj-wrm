/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
      serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  webpack: (config) => {
      config.resolve.alias = {
          ...config.resolve.alias,
          '@': process.cwd(),
          '@mapbox/node-pre-gyp': false  // Add this line to fix the error
      }
      return config
  },
};

export default nextConfig;