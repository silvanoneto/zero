'use client';

import { useState } from 'react';
import { Clock, Users, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VoteModal } from './VoteModal';

interface Proposal {
  id: number;
  title: string;
  description: string;
  voteType: string;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVoters: number;
  endTime: number;
  state: string;
  proposer: string;
}

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0n 
    ? Number((proposal.votesFor * 100n) / totalVotes) 
    : 0;
  const againstPercentage = 100 - forPercentage;

  const voteTypeColors: Record<string, string> = {
    LINEAR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    QUADRATIC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    LOGARITHMIC: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CONSENSUS: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const voteTypeLabels: Record<string, string> = {
    LINEAR: 'Linear',
    QUADRATIC: 'Quadrática',
    LOGARITHMIC: 'Logarítmica',
    CONSENSUS: 'Consenso',
  };

  const timeRemaining = formatDistanceToNow(proposal.endTime, { 
    locale: ptBR,
    addSuffix: true 
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {proposal.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {proposal.description}
          </p>
        </div>
        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${voteTypeColors[proposal.voteType] || voteTypeColors.LINEAR}`}>
          {voteTypeLabels[proposal.voteType] || proposal.voteType}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{proposal.totalVoters} votantes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Encerra {timeRemaining}</span>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm font-medium">
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            A favor: {forPercentage.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            Contra: {againstPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 dark:bg-green-600 transition-all duration-300"
              style={{ width: `${forPercentage}%` }}
            />
            <div 
              className="bg-red-500 dark:bg-red-600 transition-all duration-300"
              style={{ width: `${againstPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vote Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-700 dark:text-gray-400">Votos a favor</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {(Number(proposal.votesFor) / 1e18).toFixed(2)} IDS
          </p>
        </div>
        <div>
          <p className="text-gray-700 dark:text-gray-400">Votos contra</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {(Number(proposal.votesAgainst) / 1e18).toFixed(2)} IDS
          </p>
        </div>
      </div>

      {/* Proposer */}
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Proposta por: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</code>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => setIsVoteModalOpen(true)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Votar nesta Proposta
      </button>

      {/* Vote Modal */}
      <VoteModal
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
      />
    </div>
  );
}
