'use client';

import React, { useState } from 'react';
import { useAllocateAttention, useReallocateAttention, useCitizenAttention, useProposalAttention } from '@/hooks/useAttentionTokens';
import { X, AlertTriangle, Zap, TrendingUp } from 'lucide-react';

interface AllocateAttentionModalProps {
  proposalId: bigint;
  isOpen: boolean;
  onClose: () => void;
}

export function AllocateAttentionModal({ proposalId, isOpen, onClose }: AllocateAttentionModalProps) {
  const [amount, setAmount] = useState<string>('10');
  const { citizenAttention, refetch: refetchCitizen } = useCitizenAttention();
  const { proposalAttention, refetch: refetchProposal } = useProposalAttention(Number(proposalId));
  const { allocateAttention, isPending: isAllocating, isConfirming: isAllocateConfirming, isSuccess: isAllocateSuccess } = useAllocateAttention();
  const { reallocateAttention, isPending: isReallocating, isConfirming: isReallocateConfirming, isSuccess: isReallocateSuccess } = useReallocateAttention();

  const currentAllocation = proposalAttention?.allocation || 0n;
  const balance = citizenAttention?.balance || 0n;
  const numAmount = parseInt(amount || '0');

  React.useEffect(() => {
    if (isAllocateSuccess || isReallocateSuccess) {
      refetchCitizen();
      refetchProposal();
      setTimeout(() => {
        onClose();
        setAmount('10');
      }, 2000);
    }
  }, [isAllocateSuccess, isReallocateSuccess, refetchCitizen, refetchProposal, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (numAmount < 1 || numAmount > 50) {
      return;
    }

    if (currentAllocation > 0n) {
      reallocateAttention(Number(proposalId), Number(proposalId), numAmount);
    } else {
      allocateAttention(Number(proposalId), numAmount);
    }
  };

  const isProcessing = isAllocating || isAllocateConfirming || isReallocating || isReallocateConfirming;
  const isSuccess = isAllocateSuccess || isReallocateSuccess;
  const canAllocate = numAmount >= 1 && numAmount <= 50 && Number(balance) >= numAmount;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Alocar Tokens de Atenção</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current State */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tokens disponíveis:</span>
              <span className="font-semibold">{Number(balance)}</span>
            </div>
            {currentAllocation > 0n && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Alocação atual:</span>
                <span className="font-semibold text-purple-600">{Number(currentAllocation)}</span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Quantidade de tokens (1-50)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700"
              placeholder="10"
            />
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isProcessing || Number(balance) < preset}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {numAmount > Number(balance) && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>Tokens insuficientes. Você tem apenas {Number(balance)} disponíveis.</span>
            </div>
          )}

          {currentAllocation > 0n && (
            <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span>
                Realocando tokens: sua alocação atual será substituída por {numAmount} tokens.
              </span>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100">Como funciona?</p>
                <ul className="mt-2 space-y-1 text-purple-800 dark:text-purple-200">
                  <li>• Tokens aumentam a prioridade da proposta</li>
                  <li>• 5000+ tokens ativa tramitação acelerada</li>
                  <li>• 30% de cashback se a proposta for aprovada</li>
                  <li>• Tokens expiram em 30 dias</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-center font-semibold">
              ✅ Tokens alocados com sucesso!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !canAllocate}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {isAllocating || isReallocating ? 'Confirmando...' : 'Processando...'}
                </span>
              ) : (
                currentAllocation > 0n ? 'Realocar' : 'Alocar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
