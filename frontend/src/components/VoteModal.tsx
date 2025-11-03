'use client';

import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Loader2, CheckCircle, AlertCircle, Network } from 'lucide-react';
import { useVote, type VoteSupport } from '../hooks/useVote';
import { useP2P } from '../hooks/useP2P';

interface VoteModalProps {
  proposalId: number;
  proposalTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VoteModal({ proposalId, proposalTitle, isOpen, onClose }: VoteModalProps) {
  const [support, setSupport] = useState<VoteSupport>('FOR');
  const [weight, setWeight] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { 
    vote, 
    publishVoteToP2P,
    isVoting, 
    isConfirming,
    isSuccess, 
    error, 
    hash,
    p2pConnected 
  } = useVote();

  const { stats } = useP2P({ autoConnect: true });

  // Publica voto no P2P quando confirmado
  useEffect(() => {
    if (isSuccess && hash) {
      publishVoteToP2P();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    }
  }, [isSuccess, hash, publishVoteToP2P, onClose]);

  // Monitora erros
  useEffect(() => {
    if (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const weightBigInt = BigInt(parseFloat(weight) * 1e18);
      await vote(proposalId, support, weightBigInt);
    } catch (err) {
      console.error('Erro ao votar:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Votar na Proposta
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Proposal Title */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proposta #{proposalId}</p>
            <p className="font-medium text-gray-900 dark:text-white">{proposalTitle}</p>
          </div>

          {/* P2P Status */}
          {p2pConnected && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <Network className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs text-green-800 dark:text-green-200">
                Rede P2P ativa • {stats.peers} peers conectados
              </p>
            </div>
          )}

          {/* Vote Support Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seu Voto
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSupport('FOR')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  support === 'FOR'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>A Favor</span>
              </button>
              <button
                type="button"
                onClick={() => setSupport('AGAINST')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  support === 'AGAINST'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span>Contra</span>
              </button>
            </div>
          </div>

          {/* Vote Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Peso do Voto (tokens IDS)
            </label>
            <input
              id="weight"
              type="number"
              min="0.01"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quanto maior o peso, mais forte é seu voto
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && hash && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                  Voto registrado com sucesso!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 font-mono break-all mb-2">
                  TX: {hash.substring(0, 10)}...{hash.substring(hash.length - 8)}
                </p>
                {p2pConnected && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Network className="w-3 h-3" />
                    <span>Propagado para {stats.peers} peers na rede P2P</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {showError && error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Erro ao votar
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVoting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isVoting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isConfirming ? 'Confirmando...' : 'Enviando...'}
              </>
            ) : (
              <>
                {support === 'FOR' ? (
                  <ThumbsUp className="w-5 h-5" />
                ) : (
                  <ThumbsDown className="w-5 h-5" />
                )}
                <span>Confirmar Voto</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
