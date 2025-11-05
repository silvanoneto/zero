'use client';

import { AttentionBalance, ReputationDisplay } from '@/components/AttentionTokens';
import { VotingStats } from '@/components/VotingStats';
import { CustomConnectButton } from '@/components/CustomConnectButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Vote, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-rgb">
                    Dashboard Pessoal
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Gerencie seus tokens e reputação
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <CustomConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Vote className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 gradient-rgb">
              Conecte sua Carteira
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Para acessar seu dashboard pessoal, visualizar seus tokens de atenção 
              e reputação, conecte sua carteira Web3.
            </p>
            <CustomConnectButton />
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 gradient-rgb">
                Estatísticas Globais
              </h2>
              <VotingStats />
            </div>

            {/* Attention & Reputation Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6 gradient-rgb">
                Sistema de Atenção & Reputação
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attention Balance */}
                <AttentionBalance />

                {/* Reputation Display */}
                <ReputationDisplay variant="detailed" />
              </div>
            </div>

            {/* User Info */}
            <div className="glass-effect rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold mb-4 gradient-rgb">
                Informações da Conta
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Endereço da Carteira
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg font-mono text-sm">
                      {address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(address || '')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    💡 <strong>Dica:</strong> Use seus tokens de atenção para priorizar 
                    propostas importantes. Tokens não utilizados expiram em 30 dias.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-effect rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold mb-4 gradient-rgb">
                Ações Rápidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/"
                  className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">🗳️</div>
                  <h4 className="font-semibold mb-1">Ver Propostas</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Vote em propostas ativas
                  </p>
                </Link>

                <Link
                  href="/"
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border-2 border-pink-200/50 dark:border-pink-700/50 hover:border-pink-400 dark:hover:border-pink-500 transition-all hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <h4 className="font-semibold mb-1">Alocar Atenção</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Priorize propostas importantes
                  </p>
                </Link>

                <Link
                  href="/constituicao"
                  className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border-2 border-green-200/50 dark:border-green-700/50 hover:border-green-400 dark:hover:border-green-500 transition-all hover:shadow-lg"
                >
                  <div className="text-2xl mb-2">📜</div>
                  <h4 className="font-semibold mb-1">Constituição</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Leia a Constituição 2.0
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dashboard Pessoal • Sistema de Tokens de Atenção • Artigo 6º-D
          </p>
        </div>
      </footer>
    </div>
  );
}
