'use client';

import { useState } from 'react';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { ChevronDown, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Chain } from 'wagmi/chains';
import { 
  getChainMetadata, 
  getChainName, 
  getChainColor,
  getNativeCurrencySymbol,
  isTestnet,
  mainnetChains,
  testnetChains 
} from '../config/chains';

interface ChainSelectorProps {
  showTestnets?: boolean;
  compact?: boolean;
}

export function ChainSelector({ showTestnets = false, compact = false }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, switchChain, isPending } = useSwitchChain();

  const currentChain = chains.find(c => c.id === chainId);
  const currentMetadata = getChainMetadata(chainId);

  // Filtra chains disponíveis
  const availableChains = showTestnets 
    ? chains 
    : chains.filter(c => !isTestnet(c.id));

  // Agrupa chains por categoria
  const groupedChains: Record<string, Chain[]> = {};
  availableChains.forEach((chain) => {
    const metadata = getChainMetadata(chain.id);
    const category = metadata?.category || 'evm';
    
    if (!groupedChains[category]) {
      groupedChains[category] = [];
    }
    groupedChains[category].push(chain);
  });

  const categoryLabels: Record<string, string> = {
    ethereum: 'Ethereum',
    layer2: 'Layer 2',
    sidechain: 'Sidechains',
    evm: 'EVM Chains',
    testnet: 'Testnets',
  };

  if (!isConnected) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
        Conecte sua carteira primeiro
      </div>
    );
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          style={{ borderLeftColor: getChainColor(chainId), borderLeftWidth: '3px' }}
        >
          <span className="text-gray-900 dark:text-white">
            {currentMetadata?.shortName || 'Chain'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {Object.entries(groupedChains).map(([category, categoryChains]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                  {categoryLabels[category] || category}
                </div>
                {categoryChains.map((chain) => {
                  const metadata = getChainMetadata(chain.id);
                  const isActive = chain.id === chainId;
                  
                  return (
                    <button
                      key={chain.id}
                      onClick={() => {
                        switchChain({ chainId: chain.id });
                        setIsOpen(false);
                      }}
                      disabled={isPending || isActive}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-white'
                      } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: metadata?.color || '#666666' }}
                        />
                        <span className="font-medium">{metadata?.shortName}</span>
                      </div>
                      {isActive && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Rede Blockchain
      </label>

      {/* Current Chain Display */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          style={{ 
            borderLeftColor: getChainColor(chainId), 
            borderLeftWidth: '4px' 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getChainColor(chainId) }}
            />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                {getChainName(chainId)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getNativeCurrencySymbol(chainId)} • Chain ID: {chainId}
                {isTestnet(chainId) && (
                  <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                    Testnet
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {Object.entries(groupedChains).map(([category, categoryChains]) => (
                <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                    {categoryLabels[category] || category}
                  </div>
                  <div className="py-1">
                    {categoryChains.map((chain) => {
                      const metadata = getChainMetadata(chain.id);
                      const isActive = chain.id === chainId;
                      const isChainTestnet = isTestnet(chain.id);
                      
                      return (
                        <button
                          key={chain.id}
                          onClick={() => {
                            switchChain({ chainId: chain.id });
                            setIsOpen(false);
                          }}
                          disabled={isPending || isActive}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                            isActive
                              ? 'bg-purple-50 dark:bg-purple-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: metadata?.color || '#666666' }}
                            />
                            <div className="text-left">
                              <div className={`font-medium text-sm ${
                                isActive 
                                  ? 'text-purple-700 dark:text-purple-300' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {chain.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span>{metadata?.nativeCurrencySymbol}</span>
                                <span>•</span>
                                <span>ID: {chain.id}</span>
                                {isChainTestnet && (
                                  <>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                                      Testnet
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPending && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
                            {isActive && <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Suporte Multi-Chain</p>
            <p>
              O sistema suporta Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Base e outras redes EVM-compatíveis.
              {!showTestnets && ' Use modo desenvolvedor para ver testnets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
