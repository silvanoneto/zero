'use client';

import React from 'react';
import { useTopProposals } from '@/hooks/useAttentionTokens';
import { Trophy, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TopProposalsListProps {
  limit?: number;
  showRank?: boolean;
}

export function TopProposalsList({ limit = 10, showRank = true }: TopProposalsListProps) {
  const { topProposals, isLoading } = useTopProposals();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Propostas em Destaque
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayedProposals = topProposals.slice(0, limit);

  if (displayedProposals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Propostas em Destaque
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
          Nenhuma proposta com tokens de atenção ainda.
          <br />
          Seja o primeiro a alocar tokens!
        </p>
      </div>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Propostas em Destaque
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Propostas com maior atenção da comunidade
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayedProposals.map((proposal, index) => {
          const rank = index + 1;
          const tokens = Number(proposal.totalTokens);
          const supporters = Number(proposal.supporters);
          const score = Number(proposal.priorityScore);
          const isFastTrack = proposal.isFastTrack;

          return (
            <div
              key={proposal.proposalId.toString()}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                {showRank && (
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                    rank <= 3 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {getMedalEmoji(rank) || rank}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Proposal Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/proposals/${proposal.proposalId}`}
                        className="text-base font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        Proposta #{proposal.proposalId.toString()}
                      </Link>
                      {isFastTrack && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          Acelerada
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score de prioridade: <span className="font-semibold">{score.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{tokens}</span>
                      <span className="text-gray-600 dark:text-gray-400">tokens</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{supporters}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {supporters === 1 ? 'apoiador' : 'apoiadores'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (only for fast-track candidates) */}
                  {!isFastTrack && tokens >= 1000 && tokens < 5000 && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full transition-all duration-500"
                          style={{ width: `${(tokens / 5000) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {5000 - tokens} tokens até tramitação acelerada
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  href={`/proposals/${proposal.proposalId}`}
                  className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {topProposals.length > limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link
            href="/proposals?sort=attention"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
          >
            Ver todas as {topProposals.length} propostas →
          </Link>
        </div>
      )}
    </div>
  );
}
