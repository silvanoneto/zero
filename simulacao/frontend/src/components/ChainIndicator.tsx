'use client';

import { useChainId } from 'wagmi';
import { Network, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  getChainMetadata, 
  getChainName, 
  getChainColor,
  getNativeCurrencySymbol,
  isTestnet 
} from '../config/chains';

interface ChainIndicatorProps {
  showDetails?: boolean;
}

export function ChainIndicator({ showDetails = false }: ChainIndicatorProps) {
  const chainId = useChainId();
  const metadata = getChainMetadata(chainId);
  const color = getChainColor(chainId);
  const name = getChainName(chainId);
  const symbol = getNativeCurrencySymbol(chainId);
  const testnet = isTestnet(chainId);

  if (!showDetails) {
    // Compact indicator for header/navbar
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm"
        style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-gray-900 dark:text-white">
          {metadata?.shortName || name}
        </span>
        {testnet && (
          <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
            Test
          </span>
        )}
      </div>
    );
  }

  // Detailed card view
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`
            }}
          >
            <Network className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chain ID: {chainId}
            </p>
          </div>
        </div>
        {testnet ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Testnet</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mainnet</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Moeda Nativa
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {symbol}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Categoria
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {metadata?.category || 'EVM'}
          </p>
        </div>

        {metadata?.supportsEIP1559 && (
          <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              ✅ Suporta EIP-1559 (Taxas de Gas Otimizadas)
            </p>
          </div>
        )}
      </div>

      {testnet && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Testnet:</strong> Use apenas para desenvolvimento e testes. 
            Tokens não têm valor real.
          </p>
        </div>
      )}
    </div>
  );
}

// Badge simples para usar inline
export function ChainBadge() {
  const chainId = useChainId();
  const metadata = getChainMetadata(chainId);
  const color = getChainColor(chainId);

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
      style={{ 
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {metadata?.shortName}
    </span>
  );
}
