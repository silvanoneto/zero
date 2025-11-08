'use client';

import { useAccount } from 'wagmi';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useState } from 'react';

export default function MultiWalletManager() {
  const { address } = useAccount();
  const { identity, loading, createIdentity, addWallet, removeWallet, changePrimary, isAdding, isRemoving } = useMultiWallet(address);
  const [newWalletAddress, setNewWalletAddress] = useState('');

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!identity?.isActive) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Multi-Wallet Identity</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Você ainda não tem uma identidade multi-carteira. Crie uma para gerenciar até 5 carteiras.
        </p>
        <button
          onClick={createIdentity}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Criar Identidade
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Multi-Wallet Manager</h2>
      
      {/* Identity Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">Identity ID</p>
            <p className="font-mono text-sm">{identity.identityId.slice(0, 10)}...</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">Carteiras Ativas</p>
            <p className="font-bold text-lg">{identity.walletCount} / 5</p>
          </div>
        </div>
      </div>

      {/* Primary Wallet */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Carteira Primária</h3>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="font-mono text-sm">{identity.primaryWallet}</p>
        </div>
      </div>

      {/* Wallet List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Todas as Carteiras</h3>
        <div className="space-y-2">
          {identity.wallets.map((wallet, index) => (
            <div key={wallet} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-500">#{index + 1}</span>
                <p className="font-mono text-sm">{wallet}</p>
                {wallet === identity.primaryWallet && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Primária
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {wallet !== identity.primaryWallet && (
                  <>
                    <button
                      onClick={() => changePrimary(wallet as `0x${string}`)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Tornar Primária
                    </button>
                    <button
                      onClick={() => removeWallet(wallet as `0x${string}`)}
                      disabled={isRemoving}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400"
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Wallet */}
      {identity.walletCount < 5 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Adicionar Nova Carteira</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              onClick={() => {
                if (newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                  addWallet(newWalletAddress as `0x${string}`);
                  setNewWalletAddress('');
                }
              }}
              disabled={isAdding || !newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              Adicionar
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-500">
            ⚠️ Nova carteira terá período de espera de 7 dias antes de se tornar ativa
          </p>
        </div>
      )}
    </div>
  );
}
