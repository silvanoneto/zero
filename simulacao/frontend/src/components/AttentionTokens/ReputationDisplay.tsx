'use client';

import React from 'react';
import { useReputation, formatReputationScore } from '@/hooks/useAttentionTokens';
import { Award, TrendingUp, Star } from 'lucide-react';
import { Address } from 'viem';

interface ReputationDisplayProps {
  address?: Address;
  variant?: 'compact' | 'detailed';
}

export function ReputationDisplay({ address, variant = 'compact' }: ReputationDisplayProps) {
  const { reputation, isLoading } = useReputation(address);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded"></div>
    );
  }

  if (!reputation) {
    return null;
  }

  const score = Number(reputation.score || reputation.reputationScore);
  const tier = reputation.tier || 'Observador';
  const nextTier = reputation.nextTier;
  const nextTierThreshold = Number(reputation.nextTierThreshold || 0n);

  // Tier configurations
  const tierConfig = {
    'Observador': { color: 'gray', icon: '👁️', gradient: 'from-gray-400 to-gray-500' },
    'Participante': { color: 'blue', icon: '🗳️', gradient: 'from-blue-400 to-blue-500' },
    'Ativista': { color: 'purple', icon: '⚡', gradient: 'from-purple-400 to-purple-500' },
    'Líder': { color: 'yellow', icon: '⭐', gradient: 'from-yellow-400 to-yellow-500' },
    'Sábio': { color: 'orange', icon: '🎖️', gradient: 'from-orange-400 to-orange-500' },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig['Observador'];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-700 dark:text-${config.color}-300 rounded-full text-sm font-medium`}>
        <span>{config.icon}</span>
        <span>{formatReputationScore(BigInt(score))}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          Reputação
        </h3>
        <div className="text-2xl">{config.icon}</div>
      </div>

      {/* Score Display */}
      <div className="text-center space-y-2">
        <div className={`text-5xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {formatReputationScore(BigInt(score))}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Nível: <span className="font-semibold">{tier}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {nextTier && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progresso para {nextTier}</span>
            <span>{Math.round((score / nextTierThreshold) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min((score / nextTierThreshold) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {nextTierThreshold - score} pontos até o próximo nível
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Tokens alocados</span>
          </div>
          <div className="text-2xl font-bold">{Number(reputation.lifetimeAllocated || 0n)}</div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4" />
            <span>Propostas votadas</span>
          </div>
          <div className="text-2xl font-bold">{Number(reputation.participationCount || 0n)}</div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-sm space-y-2">
        <p className="font-semibold text-purple-900 dark:text-purple-100">Benefícios do nível {tier}:</p>
        <ul className="space-y-1 text-purple-800 dark:text-purple-200">
          {tier === 'Observador' && (
            <>
              <li>• Acesso básico ao sistema de atenção</li>
              <li>• 100 tokens mensais</li>
            </>
          )}
          {tier === 'Participante' && (
            <>
              <li>• Visibilidade aumentada nas suas alocações</li>
              <li>• Bonus de 5% em cashback</li>
            </>
          )}
          {tier === 'Ativista' && (
            <>
              <li>• Destaque nas listas de apoiadores</li>
              <li>• Bonus de 10% em cashback</li>
              <li>• Badge especial no perfil</li>
            </>
          )}
          {tier === 'Líder' && (
            <>
              <li>• Propostas com peso dobrado na ordenação</li>
              <li>• Bonus de 15% em cashback</li>
              <li>• Badge dourado no perfil</li>
            </>
          )}
          {tier === 'Sábio' && (
            <>
              <li>• Autoridade máxima no sistema</li>
              <li>• Bonus de 20% em cashback</li>
              <li>• Badge platinado no perfil</li>
              <li>• Voz consultiva em decisões críticas</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
