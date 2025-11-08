'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ProposalCard } from './ProposalCard';
import { Loader2 } from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';

export function ProposalsList() {
  const { address } = useAccount();
  const [filter, setFilter] = useState<string>('all');
  
  // Buscar propostas ativas do subgraph
  const { data: proposals = [], isLoading, error } = useProposals({ state: 'ACTIVE' });

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return p.voteType === filter;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('LINEAR')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'LINEAR'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => setFilter('QUADRATIC')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'QUADRATIC'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Quadrática
        </button>
        <button
          onClick={() => setFilter('LOGARITHMIC')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'LOGARITHMIC'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Logarítmica
        </button>
        <button
          onClick={() => setFilter('CONSENSUS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'CONSENSUS'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Consenso
        </button>
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Erro ao carregar propostas
          </p>
          <p className="text-sm text-gray-500">
            Verifique se o subgraph está rodando
          </p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma proposta encontrada
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}
