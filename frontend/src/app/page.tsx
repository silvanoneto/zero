'use client';

import { ProposalsList } from '@/components/ProposalsList';
import { CreateProposal } from '@/components/CreateProposal';
import { VotingStats } from '@/components/VotingStats';
import { PlutonimiaMetrics } from '@/components/PlutonimiaMetrics';
import SovereignWalletHub from '@/components/SovereignWallet/SovereignWalletHub';
import P2PStatus from '@/components/P2PStatus';
import ThemeToggle from '@/components/ThemeToggle';
import { CustomConnectButton } from '@/components/CustomConnectButton';
import { FileText, Vote, TrendingUp, Shield } from 'lucide-react';
import { useState } from 'react';
import { useProposals } from '@/hooks/useProposals';

export default function Home() {
  const [activeSection, setActiveSection] = useState<'governance' | 'wallet'>('governance');
  const { data: proposals = [] } = useProposals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b border-gray-200/50 dark:border-gray-800/50 glass-effect sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-green-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Vote className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-rgb">
                  Revolução Cibernética
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Governança Descentralizada Multi-Chain
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="transform hover:scale-105 transition-transform duration-200">
                <CustomConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 bg-white dark:bg-gray-900 rounded-lg shadow-md p-1">
          <button
            onClick={() => setActiveSection('governance')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'governance'
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Vote className="w-5 h-5" />
            <span>Governança</span>
          </button>
          <button
            onClick={() => setActiveSection('wallet')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'wallet'
                ? 'bg-gradient-to-br from-green-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Carteira Soberana</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 animate-fadeIn">{activeSection === 'governance' ? (
          <>
            {/* Hero Section */}
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold mb-4 gradient-rgb animate-slideIn">
                Sistema de Votação Híbrida
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                <strong className="text-blue-600 dark:text-blue-400">4 funções biomimético-cibernéticas</strong>: 
                <span className="text-red-600 dark:text-red-400"> Linear</span>, 
                <span className="text-green-600 dark:text-green-400"> Quadrática</span>, 
                <span className="text-blue-600 dark:text-blue-400"> Logarítmica</span> e 
                <span className="text-purple-600 dark:text-purple-400"> Consenso</span>.
                <br />
                Vote em propostas, crie novas BIPs e participe da governança on-chain.
              </p>
            </div>

            {/* Federation Systems Cards */}
            <div className="mb-12 grid md:grid-cols-3 gap-6">
              {/* Book Card - NOVO */}
              <a 
                href="/book"
                className="group glass-effect rounded-2xl p-6 border-2 border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">📖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                      A Revolução Cibernética
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      Livro completo: <strong>Teoria + Manifesto + Conceito Nhandereko</strong>. 
                      Ontologia executável em 33 capítulos.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                        Cibernética Segunda Ordem
                      </span>
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-semibold">
                        Loop Möbius
                      </span>
                    </div>
                  </div>
                </div>
              </a>

              {/* Mitosis System Card */}
              <a 
                href="/dao-mitosis"
                className="group glass-effect rounded-2xl p-6 border-2 border-orange-200/50 dark:border-orange-700/50 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">🧬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-2">
                      Sistema de Mitose
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      Divisão orgânica de DAOs quando atingem o limite de Dunbar (150 membros). 
                      Implementação do <strong>Artigo 5º-C</strong> da Constituição.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                        Governança Escalável
                      </span>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                        Árvore Genealógica
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
                        Limite de Dunbar
                      </span>
                    </div>
                  </div>
                </div>
              </a>

              {/* Federation Voting Card */}
              <a 
                href="/federation-voting"
                className="group glass-effect rounded-2xl p-6 border-2 border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">🗳️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                      Sistema de Votação Federal
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      Votação descentralizada em propostas federais. Cada voto registra atividade 
                      no sistema de mitose. <strong>Governança transparente</strong> e democrática.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                        A Favor • Contra • Abstenção
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                        Quorum • Transparência
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Stats Grid */}
            <div className="mb-8">
              <VotingStats />
            </div>

            {/* P2P Network Status */}
            <div className="mb-8">
              <P2PStatus />
            </div>

            {/* Plutonomia Metrics */}
            <div className="mb-8">
              <PlutonimiaMetrics proposals={proposals as any} />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">{/* Proposals List (2 cols) */}
              <div className="lg:col-span-2">
                <div className="glass-effect rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold gradient-rgb">Propostas Ativas</h3>
                  </div>
                  <ProposalsList />
                </div>
              </div>

              {/* Create Proposal Sidebar (1 col) */}
              <div className="lg:col-span-1">
                <div className="glass-effect rounded-2xl shadow-xl border-2 border-transparent bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 p-6 sticky top-24 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold gradient-rgb">Nova Proposta</h3>
                  </div>
                  <CreateProposal />
                </div>
              </div>
            </div>
          </>
        ) : (
          <SovereignWalletHub />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-16 py-8 glass-effect">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 font-semibold gradient-rgb text-lg">
            Revolução Cibernética - Cybersyn 2.0
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by <span className="text-red-600 dark:text-red-400 font-medium">O Besta Fera</span> • 
            Built with <span className="text-green-600 dark:text-green-400 font-medium">Next.js</span>, 
            <span className="text-purple-600 dark:text-purple-400 font-medium"> Wagmi</span> & 
            <span className="text-pink-600 dark:text-pink-400 font-medium"> The Graph</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
