/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    },
    webpack: (config) => {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@': process.cwd(),
        }
        return config
      },
};

export default nextConfig;
