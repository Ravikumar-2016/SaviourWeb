/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        port: '',
        pathname: '/img/wn/**',
      },
    ],
  },
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    OPENWEATHERMAP_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', etc. on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        async_hooks: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
      };
    }
    
    // Explicitly mark mongodb as external
    if (isServer) {
      config.externals = [...(config.externals || []), 'mongodb'];
    }
    
    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  serverExternalPackages: ['mongodb'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig