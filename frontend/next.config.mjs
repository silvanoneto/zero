/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // GitHub Pages configuration - desabilitado para Docker
  // basePath: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? '/cybersyn' : '',
  images: {
    unoptimized: true, // Necessário para export estático
  },
  
  // Next.js 15 - Configurações otimizadas
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  webpack: (config, { isServer }) => {
    // Fallbacks para módulos Node.js no browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
      'node:stream': false,
      'node:crypto': false,
      'node:buffer': false,
      // React Native fallbacks (MetaMask SDK)
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-crypto': false,
      'react-native-randombytes': false,
    };
    
    // Externals
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Ignora warnings de módulos React Native
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/react-native/ },
    ];
    
    return config;
  },
  
  // Otimizações de performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Proxy para backend P2P
  async rewrites() {
    return [
      {
        source: '/api/p2p/:path*',
        destination: 'http://localhost:8080/api/p2p/:path*',
      },
    ];
  },
};export default nextConfig;
