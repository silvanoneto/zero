'use client';

import { P2PTestSuite } from '../../components/P2PTestSuite';
import { CustomConnectButton } from '../../components/CustomConnectButton';
import ThemeToggle from '../../components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function TestPage() {
  // Aplica tema salvo ao montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Voltar</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold gradient-rgb">
                  Testes E2E P2P
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Validação completa do sistema de rede distribuída
                </p>
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
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Sobre estes testes
          </h2>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              Esta suíte de testes valida o fluxo completo de comunicação peer-to-peer (P2P) 
              do sistema de governança descentralizada.
            </p>
            <p className="font-medium">Testes executados:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Conexão da carteira Web3</li>
              <li>Estabelecimento de conexão P2P com backend</li>
              <li>Descoberta de peers na rede</li>
              <li>Subscrição em tópicos de mensagens</li>
              <li>Publicação de proposta de teste</li>
              <li>Publicação de voto de teste</li>
              <li>Validação de métricas de rede</li>
            </ul>
            <p className="mt-4 text-xs text-blue-700 dark:text-blue-300 italic">
              💡 Dica: Execute com múltiplas janelas abertas para simular vários peers
            </p>
          </div>
        </div>

        <P2PTestSuite />

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              🔧 Tecnologias
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>• <strong>libp2p</strong> - Rede P2P distribuída</li>
              <li>• <strong>PubSub</strong> - Mensageria entre peers</li>
              <li>• <strong>GossipSub</strong> - Protocolo de propagação</li>
              <li>• <strong>REST API</strong> - Interface com backend</li>
              <li>• <strong>WebSocket</strong> - Comunicação em tempo real</li>
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📊 Métricas Monitoradas
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li>• <strong>Peers conectados</strong> - Número de nós ativos</li>
              <li>• <strong>Mensagens enviadas</strong> - Total de publicações</li>
              <li>• <strong>Mensagens recebidas</strong> - Total de recebimentos</li>
              <li>• <strong>Propostas propagadas</strong> - Contagem específica</li>
              <li>• <strong>Votos propagados</strong> - Contagem específica</li>
            </ul>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-8 p-6 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">
            🐛 Console de Debug
          </h3>
          <p className="text-sm text-gray-400 mb-2">
            Abra o Console do navegador (F12) para ver logs detalhados da execução dos testes.
          </p>
          <div className="bg-gray-950 p-4 rounded font-mono text-xs text-green-400 overflow-x-auto">
            <div>$ npm run dev</div>
            <div className="text-gray-500">→ Frontend rodando em http://localhost:3000</div>
            <div className="text-gray-500">→ Backend P2P rodando em http://localhost:3001</div>
            <div className="text-green-400 mt-2">✓ Sistema pronto para testes E2E</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Revolução Cibernética - Sistema de Testes P2P
          </p>
        </div>
      </footer>
    </div>
  );
}
