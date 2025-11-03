'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useAccount, useDisconnect } from 'wagmi';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  Network
} from 'lucide-react';
import { useState } from 'react';
import { ChainSelector } from './ChainSelector';
import { 
  getChainMetadata, 
  getChainName, 
  getChainColor,
  getNativeCurrencySymbol,
  isTestnet 
} from '../config/chains';

export function CustomConnectButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const metadata = getChainMetadata(chainId);
  const chainColor = getChainColor(chainId);
  const chainName = getChainName(chainId);
  const isTestnetChain = isTestnet(chainId);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // Opcional: mostrar toast de sucesso
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Wallet className="w-5 h-5" />
            <span>Conectar Carteira</span>
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
        style={{ borderLeftColor: chainColor, borderLeftWidth: '4px' }}
      >
        {/* Chain Indicator */}
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: chainColor }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {metadata?.shortName || chainName}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* Address */}
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {formatAddress(address!)}
          </span>
        </div>

        {/* Dropdown Icon */}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Connected Status */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">Conectado</span>
                </div>
                {isTestnetChain && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Testnet</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors"
                  title="Copiar endereço completo"
                >
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Network Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: `${chainColor}20`,
                    border: `2px solid ${chainColor}`
                  }}
                >
                  <Network className="w-5 h-5" style={{ color: chainColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {chainName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Chain ID: {chainId}</span>
                    <span>•</span>
                    <span>{getNativeCurrencySymbol(chainId)}</span>
                    {metadata?.supportsEIP1559 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400">EIP-1559 ✓</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowChainSelector(!showChainSelector);
                }}
                className="w-full mt-3 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Network className="w-4 h-4" />
                <span>Trocar de Rede</span>
              </button>

              {showChainSelector && (
                <div className="mt-3">
                  <ChainSelector compact={true} />
                </div>
              )}
            </div>

            {/* Multi-Chain Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-start gap-2">
                <div className="text-2xl">🌐</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Suporte Multi-Chain
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Esta carteira funciona em <strong>19 redes blockchain</strong>: 
                    Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Base e outras.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Recursos de Segurança
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Prova de Vida ativa</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Multi-Wallet (até 5 carteiras)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Detecção de fraude em tempo real</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-gray-600 dark:text-gray-400">Token SOB vinculado</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Desconectar Carteira</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
