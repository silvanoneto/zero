/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use 'export' for GitHub Pages, 'standalone' for Docker
  output: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'export' : 'standalone',
  
  // GitHub Pages configuration
  basePath: '',
  images: {
    unoptimized: true, // Necessário para export estático
  },
  
  // Next.js 16 - Configurações otimizadas
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  
  // Habilitar instrumentação para métricas
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Proxy para backend P2P (only for standalone mode)
  ...((process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') && {
    async rewrites() {
      return [
        {
          source: '/api/p2p/:path*',
          destination: 'http://localhost:8080/api/p2p/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;
