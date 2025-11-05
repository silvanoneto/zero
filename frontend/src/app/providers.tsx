'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { 
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  ledgerWallet,
  argentWallet,
  braveWallet,
  injectedWallet,
  safeWallet,
  rabbyWallet,
  zerionWallet,
  phantomWallet,
  okxWallet,
  tahoWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { 
  ethereumMainnet,
  sepolia,
  polygon,
  polygonAmoy,
  bsc,
  bscTestnet,
  avalanche,
  avalancheFuji,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  hardhat,
} from '../config/chains';

// Determina quais chains usar baseado no ambiente
const isDevelopment = process.env.NODE_ENV === 'development';

// Chains para desenvolvimento (inclui testnets e localhost)
const developmentChains = [
  hardhat,
  sepolia,
  polygonAmoy,
  bscTestnet,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  ethereumMainnet,
  polygon,
] as const;

// Chains para produção (apenas mainnets)
const productionChains = [
  ethereumMainnet,
  polygon,
  bsc,
  avalanche,
  arbitrum,
  optimism,
  base,
] as const;

// Seleciona chains apropriadas
const chains = isDevelopment ? developmentChains : productionChains;

// Configuração expandida de carteiras
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'e4f3b0d8c3a2b1d9e6f5c4a3b2d1e0f9';

// Aviso se o projectId padrão estiver sendo usado
if (projectId === 'e4f3b0d8c3a2b1d9e6f5c4a3b2d1e0f9') {
  console.warn('⚠️  Using default WalletConnect Project ID. Get your own at https://cloud.walletconnect.com');
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Populares',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        trustWallet,
        rainbowWallet,
        rabbyWallet,
        zerionWallet,
      ],
    },
    {
      groupName: 'Hardware & Segurança',
      wallets: [
        ledgerWallet,
        safeWallet,
      ],
    },
    {
      groupName: 'Mais Opções',
      wallets: [
        braveWallet,
        phantomWallet,
        okxWallet,
        argentWallet,
        tahoWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'Revolução Cibernética',
    projectId,
  }
);

// Configuração de transports por chain
const transports = {
  [ethereumMainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
  [polygonAmoy.id]: http(),
  [bsc.id]: http(),
  [bscTestnet.id]: http(),
  [avalanche.id]: http(),
  [avalancheFuji.id]: http(),
  [arbitrum.id]: http(),
  [arbitrumSepolia.id]: http(),
  [optimism.id]: http(),
  [optimismSepolia.id]: http(),
  [base.id]: http(),
  [baseSepolia.id]: http(),
  [hardhat.id]: http(),
};

const config = createConfig({
  chains: chains as any,
  connectors,
  transports,
  ssr: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : cookieStorage,
    key: 'revolucao-cibernetica.wallet.store', // Key específica para evitar conflitos
  }),
  // Habilita reconexão automática
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      retry: 0,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact"
          showRecentTransactions={true}
          initialChain={hardhat}
          coolMode={false}
          appInfo={{
            appName: 'Revolução Cibernética',
            disclaimer: () => (
              <div className="text-xs text-gray-600 dark:text-gray-400 p-4">
                Conectando-se à governança descentralizada.
              </div>
            ),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
