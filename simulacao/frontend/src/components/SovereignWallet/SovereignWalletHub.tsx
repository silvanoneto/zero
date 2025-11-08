'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { SecurityDashboard } from './SecurityDashboard';
import MultiWalletManager from './MultiWalletManager';
import FraudMonitor from './FraudMonitor';
import RecoveryPanel from './RecoveryPanel';
import SecureTransferForm from './SecureTransferForm';
import { WalletBindingHub } from '../WalletBinding';
import { ChainSelector } from '../ChainSelector';

type Tab = 'dashboard' | 'transfer' | 'wallets' | 'binding' | 'fraud' | 'recovery' | 'settings';

export default function SovereignWalletHub() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: '🛡️' },
    { id: 'transfer' as Tab, name: 'Transferir', icon: '💰' },
    { id: 'wallets' as Tab, name: 'Multi-Wallet', icon: '👛' },
    { id: 'binding' as Tab, name: 'Segurança SOB', icon: '🔗' },
    { id: 'fraud' as Tab, name: 'Monitor', icon: '🔍' },
    { id: 'recovery' as Tab, name: 'Recuperação', icon: '🔄' },
    { id: 'settings' as Tab, name: 'Rede', icon: '🌐' },
  ];

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold mb-4">Carteira Soberana</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sistema de segurança de 5 camadas com proteção contra fraude, multi-wallet e recuperação avançada
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">Prova de Vida</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Verificação biométrica e comportamental</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border dark:border-green-800">
              <div className="text-3xl mb-2">👛</div>
              <h3 className="font-semibold mb-1">Multi-Wallet</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Até 5 carteiras por identidade</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border dark:border-purple-800">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Detecção de Fraude</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">Análise em tempo real com 8 regras</p>
            </div>
          </div>
          <p className="text-lg text-blue-600 font-semibold">
            👆 Conecte sua carteira para começar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">🔐 Carteira Soberana</h1>
        <p className="text-gray-700 dark:text-gray-400">
          Sistema integrado de segurança com 5 camadas de proteção
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && <SecurityDashboard />}
        {activeTab === 'transfer' && <SecureTransferForm />}
        {activeTab === 'wallets' && <MultiWalletManager />}
        {activeTab === 'binding' && <WalletBindingHub />}
        {activeTab === 'fraud' && <FraudMonitor />}
        {activeTab === 'recovery' && <RecoveryPanel />}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              🌐 Configurações de Rede
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecione a rede blockchain para suas transações. O sistema suporta múltiplas chains EVM.
            </p>
            <ChainSelector showTestnets={process.env.NODE_ENV === 'development'} />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">📋 Camadas de Segurança Ativas</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700 dark:text-gray-300">Prova de Vida</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700 dark:text-gray-300">Multi-Wallet</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700 dark:text-gray-300">Detecção Fraude</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700 dark:text-gray-300">Recuperação</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-700 dark:text-gray-300">Token SOB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
