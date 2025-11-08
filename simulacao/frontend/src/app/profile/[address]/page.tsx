'use client';

import { ReputationDisplay } from '@/components/AttentionTokens';
import { CustomConnectButton } from '@/components/CustomConnectButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Vote, ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function ProfilePage() {
  const params = useParams();
  const { address: connectedAddress, isConnected } = useAccount();
  
  // Pegar endereço dos params ou usar o conectado
  const profileAddress = (params.address as string) || connectedAddress;
  const isOwnProfile = profileAddress?.toLowerCase() === connectedAddress?.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-rgb">
                    {isOwnProfile ? 'Meu Perfil' : 'Perfil do Cidadão'}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Reputação e histórico de participação
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
        {!profileAddress ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 gradient-rgb">
              Conecte sua Carteira
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Para visualizar informações de perfil e reputação, conecte sua carteira Web3.
            </p>
            <CustomConnectButton />
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Profile Header */}
            <div className="glass-effect rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h2 className="text-2xl font-bold gradient-rgb mb-1">
                      {isOwnProfile ? 'Você' : 'Cidadão'}
                    </h2>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                      {profileAddress?.slice(0, 10)}...{profileAddress?.slice(-8)}
                    </code>
                    {isOwnProfile && (
                      <Link
                        href="/dashboard"
                        className="block mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        Ver Dashboard Completo →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => navigator.clipboard.writeText(profileAddress || '')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Copiar Endereço
                </button>
              </div>
            </div>

            {/* Reputation Display */}
            <div>
              <h2 className="text-2xl font-bold mb-6 gradient-rgb">
                Sistema de Reputação
              </h2>
              <ReputationDisplay 
                address={profileAddress as `0x${string}`} 
                variant="detailed" 
              />
            </div>

            {/* About Section */}
            <div className="glass-effect rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold mb-4 gradient-rgb">
                Sobre o Sistema de Reputação
              </h3>
              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  O <strong>Sistema de Reputação</strong> é parte do <strong>Artigo 6º-D</strong> 
                  da Constituição 2.0, implementando uma economia de atenção justa e transparente.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      📊 Como Ganhar Reputação
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Alocar tokens de atenção em propostas</li>
                      <li>• Votar em propostas que são aprovadas</li>
                      <li>• Participar ativamente da governança</li>
                      <li>• Criar propostas relevantes</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">
                      🎁 Benefícios por Nível
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Cashback em tokens alocados</li>
                      <li>• Peso aumentado nas votações</li>
                      <li>• Badges exclusivos no perfil</li>
                      <li>• Voz consultiva (níveis altos)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">
                      ⚡ Tokens de Atenção
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• 100 tokens mensais gratuitos</li>
                      <li>• Alocar 1-50 tokens por proposta</li>
                      <li>• Tokens expiram em 30 dias</li>
                      <li>• Cashback de 30% ao acertar</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-900 dark:text-orange-100">
                      🚀 Tramitação Acelerada
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li>• 5000+ tokens ativa fast-track</li>
                      <li>• Prioridade na fila de votação</li>
                      <li>• Processamento mais rápido</li>
                      <li>• Detecção anti-spam automática</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 <strong>Nota:</strong> O sistema de reputação é totalmente on-chain e 
                    transparente. Todos os cálculos são verificáveis no contrato 
                    AttentionTokens.sol.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {isOwnProfile && (
              <div className="glass-effect rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-bold mb-4 gradient-rgb">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard"
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border-2 border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg text-center"
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-semibold mb-1">Dashboard</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ver estatísticas completas
                    </p>
                  </Link>

                  <Link
                    href="/"
                    className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg text-center"
                  >
                    <div className="text-2xl mb-2">✨</div>
                    <h4 className="font-semibold mb-1">Alocar Tokens</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Priorizar propostas
                    </p>
                  </Link>

                  <Link
                    href="/"
                    className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border-2 border-green-200/50 dark:border-green-700/50 hover:border-green-400 dark:hover:border-green-500 transition-all hover:shadow-lg text-center"
                  >
                    <div className="text-2xl mb-2">🗳️</div>
                    <h4 className="font-semibold mb-1">Votar</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Participar da governança
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Perfil do Cidadão • Sistema de Reputação • Artigo 6º-D
          </p>
        </div>
      </footer>
    </div>
  );
}
