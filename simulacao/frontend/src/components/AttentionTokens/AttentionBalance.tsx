'use client';

import React from 'react';
import { useCitizenAttention, useClaimMonthlyAllocation, formatTimeRemaining } from '@/hooks/useAttentionTokens';
import { Clock, Coins, TrendingUp, Sparkles } from 'lucide-react';

export function AttentionBalance() {
  const { citizenAttention, isLoading, refetch } = useCitizenAttention();
  const { claimAllocation, isPending, isConfirming, isSuccess } = useClaimMonthlyAllocation();

  React.useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Tokens de Atenção</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!citizenAttention) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-2">Tokens de Atenção</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Conecte sua carteira para ver seus tokens de atenção
        </p>
      </div>
    );
  }

  const balance = Number(citizenAttention.balance);
  const maxBalance = 100;
  const percentage = (balance / maxBalance) * 100;
  const timeRemaining = citizenAttention.timeUntilExpiration || 0;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg shadow-lg p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl" />
      
      <div className="relative space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Tokens de Atenção
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use seus tokens para priorizar propostas importantes
          </p>
        </div>

        {/* Main Balance */}
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {balance}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            de 100 tokens disponíveis
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{100 - balance} usados</span>
            <span>{balance} restantes</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Expira em
            </div>
            <div className="text-lg font-semibold">
              {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : 'Expirado'}
            </div>
          </div>

          <div className="space-y-1 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              Total alocado
            </div>
            <div className="text-lg font-semibold">
              {Number(citizenAttention.lifetimeAllocated)}
            </div>
          </div>
        </div>

        {/* Claim Button */}
        {citizenAttention.canClaim && (
          <button
            onClick={() => claimAllocation()}
            disabled={isPending || isConfirming}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {isPending || isConfirming ? (
              <>
                <span className="animate-spin">⏳</span>
                {isPending ? 'Confirmando...' : 'Processando...'}
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                Reivindicar 100 Tokens Mensais
              </>
            )}
          </button>
        )}

        {timeRemaining <= 0 && !citizenAttention.canClaim && (
          <div className="text-center text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
            ⚠️ Seus tokens expiraram. Reivindique novos tokens para continuar.
          </div>
        )}
      </div>
    </div>
  );
}
