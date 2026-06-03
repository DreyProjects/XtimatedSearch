/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'jsdom',
      '@mozilla/readability',
      'pdf-parse',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Aumentar timeout de las funciones serverless (requiere plan Pro en Vercel)
  // En Hobby el límite es 10s y no se puede cambiar
  serverRuntimeConfig: {
    maxDuration: 30,
  },
}

module.exports = nextConfig
