'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ProposalCard, VoteModal, VotingStats } from '@/components/FederationVoting';

export default function FederationVotingPage() {
  const { address, isConnected } = useAccount();
  const [selectedProposalId, setSelectedProposalId] = useState<bigint | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Endereço do contrato FederationVoting
  const votingAddress = process.env.NEXT_PUBLIC_FEDERATION_VOTING_ADDRESS as `0x${string}`;

  // Verificar configuração
  if (!votingAddress) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 font-bold text-xl mb-2">⚠️ Configuração Pendente</h2>
          <p className="text-gray-300 mb-4">
            Configure <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_FEDERATION_VOTING_ADDRESS</code> no arquivo <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code>
          </p>
          <a
            href="https://github.com/silvanoneto/revolucao-cibernetica/blob/master/frontend/.env.example"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Ver exemplo de configuração →
          </a>
        </div>
      </div>
    );
  }

  const handleVoteClick = (proposalId: bigint) => {
    if (!isConnected) {
      alert('Por favor, conecte sua wallet primeiro!');
      return;
    }
    setSelectedProposalId(proposalId);
  };

  const handleVoteSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // IDs das propostas (em produção, isso viria do contrato)
  const proposalIds = [1n, 2n, 3n, 4n, 5n];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back to Cybersyn Button */}
          <div className="mb-6">
            <a
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Voltar ao Cybersyn 2.0</span>
            </a>
          </div>

          <h1 className="text-4xl font-bold mb-2">🗳️ Sistema de Votação Federal</h1>
          <p className="text-gray-300 text-lg">
            Governança descentralizada da Revolução Cibernética
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alert de conexão */}
        {!isConnected && (
          <div className="mb-8 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-400 font-semibold">Wallet não conectada</p>
                <p className="text-gray-400 text-sm">
                  Conecte sua wallet no canto superior direito para votar nas propostas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <VotingStats votingAddress={votingAddress} />

        {/* Seção informativa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Como funciona */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-blue-400">📖 Como Funciona</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Qualquer membro pode criar propostas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Período de votação de 7 dias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Quorum de 10% para aprovação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Integrado com sistema de mitose</span>
              </li>
            </ul>
          </div>

          {/* Tipos de voto */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-green-400">🎯 Tipos de Voto</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-green-400 font-semibold">A Favor</p>
                  <p className="text-gray-400 text-sm">Aprovo esta proposta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="text-red-400 font-semibold">Contra</p>
                  <p className="text-gray-400 text-sm">Rejeito esta proposta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚪</span>
                <div>
                  <p className="text-gray-400 font-semibold">Abstenção</p>
                  <p className="text-gray-400 text-sm">Não tomo posição</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integração com Mitose */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-purple-400">🔄 Integração Mitose</h2>
            <p className="text-gray-300 mb-4">
              Ao votar, sua atividade é registrada automaticamente no sistema de mitose.
            </p>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Mantém membros ativos atualizados</li>
              <li>• Contribui para estatísticas da DAO</li>
              <li>• Influencia decisões de divisão</li>
            </ul>
            <a
              href="/dao-mitosis"
              className="mt-4 inline-block text-purple-400 hover:underline"
            >
              Ver Sistema de Mitose →
            </a>
          </div>
        </div>

        {/* Lista de Propostas */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📋 Propostas Ativas</h2>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              🔄 Atualizar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" key={refreshKey}>
            {proposalIds.map((id) => (
              <ProposalCard
                key={id.toString()}
                proposalId={id}
                votingAddress={votingAddress}
                onVote={handleVoteClick}
              />
            ))}
          </div>
        </div>

        {/* Info do contrato */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">📋 Informações do Contrato</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-gray-500">Endereço:</span>
              <code className="text-blue-400 font-mono break-all">{votingAddress}</code>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-500">Network:</span>
              <span className="text-gray-300">
                {process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? 'Ethereum Mainnet' :
                 process.env.NEXT_PUBLIC_CHAIN_ID === '11155111' ? 'Sepolia Testnet' :
                 process.env.NEXT_PUBLIC_CHAIN_ID === '31337' ? 'Localhost' :
                 `Chain ID: ${process.env.NEXT_PUBLIC_CHAIN_ID || 'Unknown'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de votação */}
      {selectedProposalId && (
        <VoteModal
          proposalId={selectedProposalId}
          votingAddress={votingAddress}
          isOpen={true}
          onClose={() => setSelectedProposalId(null)}
          onSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
