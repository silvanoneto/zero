'use client';

import React from 'react';
import { useProposalAttention } from '@/hooks/useAttentionTokens';
import { Zap, Users, TrendingUp, AlertOctagon } from 'lucide-react';

interface ProposalAttentionBadgeProps {
  proposalId: bigint;
  variant?: 'compact' | 'detailed';
}

export function ProposalAttentionBadge({ proposalId, variant = 'compact' }: ProposalAttentionBadgeProps) {
  const { proposalAttention, isLoading } = useProposalAttention(Number(proposalId));

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded"></div>
    );
  }

  if (!proposalAttention) {
    return null;
  }

  const totalTokens = Number(proposalAttention.totalTokens);
  const supporters = Number(proposalAttention.uniqueAllocators);
  const isFastTrack = proposalAttention.isFastTrack;
  const isSpam = proposalAttention.isSpam;

  // Status indicators
  if (isSpam) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
        <AlertOctagon className="w-4 h-4" />
        <span>Possível Spam</span>
      </div>
    );
  }

  if (isFastTrack) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
        <Zap className="w-4 h-4" />
        <span>⚡ Tramitação Acelerada</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
        <TrendingUp className="w-4 h-4" />
        <span className="font-semibold">{totalTokens}</span>
        <span className="text-xs opacity-75">tokens</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
          <TrendingUp className="w-4 h-4" />
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">{totalTokens}</span>
            <span className="text-xs">tokens</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
          <Users className="w-4 h-4" />
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">{supporters}</span>
            <span className="text-xs">{supporters === 1 ? 'apoiador' : 'apoiadores'}</span>
          </div>
        </div>
      </div>

      {/* Progress to Fast Track */}
      {!isFastTrack && totalTokens >= 1000 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Progresso para tramitação acelerada</span>
            <span>{Math.round((totalTokens / 5000) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalTokens / 5000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Faltam {5000 - totalTokens} tokens para ativação
          </p>
        </div>
      )}
    </div>
  );
}
