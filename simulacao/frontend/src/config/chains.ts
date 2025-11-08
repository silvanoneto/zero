// Multi-Chain Configuration for Revolução Cibernética
// Suporta Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Base, e outras redes

import { Chain } from 'wagmi/chains';

// ============ EVM-Compatible Chains ============

// Ethereum Networks
export const ethereumMainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://eth.llamarpc.com'] },
    public: { http: ['https://eth.llamarpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
} as const satisfies Chain;

export const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
    public: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
} as const satisfies Chain;

// Polygon Networks
export const polygon = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com'] },
    public: { http: ['https://polygon-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
} as const satisfies Chain;

export const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] },
    public: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://amoy.polygonscan.com' },
  },
  testnet: true,
} as const satisfies Chain;

// Binance Smart Chain
export const bsc = {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed1.binance.org'] },
    public: { http: ['https://bsc-dataseed1.binance.org'] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
} as const satisfies Chain;

export const bscTestnet = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
    public: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
} as const satisfies Chain;

// Avalanche
export const avalanche = {
  id: 43114,
  name: 'Avalanche',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
    public: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
} as const satisfies Chain;

export const avalancheFuji = {
  id: 43113,
  name: 'Avalanche Fuji',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
    public: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
} as const satisfies Chain;

// Arbitrum
export const arbitrum = {
  id: 42161,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://arb1.arbitrum.io/rpc'] },
    public: { http: ['https://arb1.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
} as const satisfies Chain;

export const arbitrumSepolia = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    public: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
} as const satisfies Chain;

// Optimism
export const optimism = {
  id: 10,
  name: 'Optimism',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.optimism.io'] },
    public: { http: ['https://mainnet.optimism.io'] },
  },
  blockExplorers: {
    default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
  },
} as const satisfies Chain;

export const optimismSepolia = {
  id: 11155420,
  name: 'Optimism Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.optimism.io'] },
    public: { http: ['https://sepolia.optimism.io'] },
  },
  blockExplorers: {
    default: { name: 'Optimistic Etherscan', url: 'https://sepolia-optimistic.etherscan.io' },
  },
  testnet: true,
} as const satisfies Chain;

// Base
export const base = {
  id: 8453,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
} as const satisfies Chain;

export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
} as const satisfies Chain;

// Gnosis Chain (formerly xDai)
export const gnosis = {
  id: 100,
  name: 'Gnosis',
  nativeCurrency: { name: 'xDai', symbol: 'xDAI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.gnosischain.com'] },
    public: { http: ['https://rpc.gnosischain.com'] },
  },
  blockExplorers: {
    default: { name: 'Gnosisscan', url: 'https://gnosisscan.io' },
  },
} as const satisfies Chain;

// Moonbeam
export const moonbeam = {
  id: 1284,
  name: 'Moonbeam',
  nativeCurrency: { name: 'GLMR', symbol: 'GLMR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.api.moonbeam.network'] },
    public: { http: ['https://rpc.api.moonbeam.network'] },
  },
  blockExplorers: {
    default: { name: 'Moonscan', url: 'https://moonbeam.moonscan.io' },
  },
} as const satisfies Chain;

// Celo
export const celo = {
  id: 42220,
  name: 'Celo',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://forno.celo.org'] },
    public: { http: ['https://forno.celo.org'] },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://celoscan.io' },
  },
} as const satisfies Chain;

// Fantom
export const fantom = {
  id: 250,
  name: 'Fantom',
  nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ftm.tools'] },
    public: { http: ['https://rpc.ftm.tools'] },
  },
  blockExplorers: {
    default: { name: 'FTMScan', url: 'https://ftmscan.com' },
  },
} as const satisfies Chain;

// Hardhat/Localhost
export const hardhat = {
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
} as const satisfies Chain;

// ============ Chain Groups ============

export const mainnetChains = [
  ethereumMainnet,
  polygon,
  bsc,
  avalanche,
  arbitrum,
  optimism,
  base,
  gnosis,
  moonbeam,
  celo,
  fantom,
] as const;

export const testnetChains = [
  sepolia,
  polygonAmoy,
  bscTestnet,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  hardhat,
] as const;

export const allChains = [...mainnetChains, ...testnetChains] as const;

// ============ Chain Metadata ============

export interface ChainMetadata {
  chainId: number;
  name: string;
  shortName: string;
  icon?: string;
  color: string;
  category: 'ethereum' | 'layer2' | 'sidechain' | 'evm' | 'testnet';
  isTestnet: boolean;
  supportsEIP1559: boolean;
  multicallAddress?: string;
  nativeCurrencySymbol: string;
}

export const chainMetadata: Record<number, ChainMetadata> = {
  // Ethereum
  1: {
    chainId: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    color: '#627EEA',
    category: 'ethereum',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    shortName: 'SEP',
    color: '#627EEA',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'SEP',
  },
  
  // Polygon
  137: {
    chainId: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    color: '#8247E5',
    category: 'sidechain',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'MATIC',
  },
  80002: {
    chainId: 80002,
    name: 'Polygon Amoy',
    shortName: 'AMOY',
    color: '#8247E5',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'MATIC',
  },
  
  // BSC
  56: {
    chainId: 56,
    name: 'BNB Chain',
    shortName: 'BNB',
    color: '#F3BA2F',
    category: 'evm',
    isTestnet: false,
    supportsEIP1559: false,
    nativeCurrencySymbol: 'BNB',
  },
  97: {
    chainId: 97,
    name: 'BNB Testnet',
    shortName: 'tBNB',
    color: '#F3BA2F',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: false,
    nativeCurrencySymbol: 'tBNB',
  },
  
  // Avalanche
  43114: {
    chainId: 43114,
    name: 'Avalanche',
    shortName: 'AVAX',
    color: '#E84142',
    category: 'evm',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'AVAX',
  },
  43113: {
    chainId: 43113,
    name: 'Avalanche Fuji',
    shortName: 'FUJI',
    color: '#E84142',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'AVAX',
  },
  
  // Arbitrum
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    color: '#28A0F0',
    category: 'layer2',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  421614: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    shortName: 'ARB-SEP',
    color: '#28A0F0',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  
  // Optimism
  10: {
    chainId: 10,
    name: 'Optimism',
    shortName: 'OP',
    color: '#FF0420',
    category: 'layer2',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  11155420: {
    chainId: 11155420,
    name: 'OP Sepolia',
    shortName: 'OP-SEP',
    color: '#FF0420',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  
  // Base
  8453: {
    chainId: 8453,
    name: 'Base',
    shortName: 'BASE',
    color: '#0052FF',
    category: 'layer2',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  84532: {
    chainId: 84532,
    name: 'Base Sepolia',
    shortName: 'BASE-SEP',
    color: '#0052FF',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
  
  // Others
  100: {
    chainId: 100,
    name: 'Gnosis',
    shortName: 'GNO',
    color: '#04795B',
    category: 'sidechain',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'xDAI',
  },
  1284: {
    chainId: 1284,
    name: 'Moonbeam',
    shortName: 'GLMR',
    color: '#53CBC9',
    category: 'evm',
    isTestnet: false,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'GLMR',
  },
  42220: {
    chainId: 42220,
    name: 'Celo',
    shortName: 'CELO',
    color: '#FCFF52',
    category: 'evm',
    isTestnet: false,
    supportsEIP1559: false,
    nativeCurrencySymbol: 'CELO',
  },
  250: {
    chainId: 250,
    name: 'Fantom',
    shortName: 'FTM',
    color: '#1969FF',
    category: 'evm',
    isTestnet: false,
    supportsEIP1559: false,
    nativeCurrencySymbol: 'FTM',
  },
  31337: {
    chainId: 31337,
    name: 'Hardhat',
    shortName: 'HH',
    color: '#FFF100',
    category: 'testnet',
    isTestnet: true,
    supportsEIP1559: true,
    nativeCurrencySymbol: 'ETH',
  },
};

// ============ Utility Functions ============

export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  return chainMetadata[chainId];
}

export function isTestnet(chainId: number): boolean {
  return chainMetadata[chainId]?.isTestnet ?? false;
}

export function getChainColor(chainId: number): string {
  return chainMetadata[chainId]?.color ?? '#666666';
}

export function getChainName(chainId: number): string {
  return chainMetadata[chainId]?.name ?? `Chain ${chainId}`;
}

export function getNativeCurrencySymbol(chainId: number): string {
  return chainMetadata[chainId]?.nativeCurrencySymbol ?? 'ETH';
}

export function supportsEIP1559(chainId: number): boolean {
  return chainMetadata[chainId]?.supportsEIP1559 ?? false;
}

export function getChainsByCategory(category: ChainMetadata['category']): Chain[] {
  return allChains.filter(chain => {
    const metadata = getChainMetadata(chain.id);
    return metadata?.category === category;
  });
}

export function getMainnetChains(): Chain[] {
  return allChains.filter(chain => !isTestnet(chain.id));
}

export function getTestnetChains(): Chain[] {
  return allChains.filter(chain => isTestnet(chain.id));
}
