'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

interface VoteModalProps {
  proposalId: bigint;
  votingAddress: `0x${string}`;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type VoteType = 0 | 1 | 2; // 0 = Contra, 1 = A Favor, 2 = Abstenção

export function VoteModal({ proposalId, votingAddress, isOpen, onClose, onSuccess }: VoteModalProps) {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Quando a transação for confirmada
  if (isSuccess && hash) {
    setTimeout(() => {
      onSuccess();
      onClose();
      setSelectedVote(null);
    }, 2000);
  }

  const handleVote = () => {
    if (selectedVote === null) return;

    writeContract({
      address: votingAddress,
      abi: [
        {
          name: 'vote',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'proposalId', type: 'uint256' },
            { name: 'support', type: 'uint8' },
          ],
          outputs: [],
        },
      ] as const,
      functionName: 'vote',
      args: [proposalId, selectedVote],
    });
  };

  if (!isOpen) return null;

  const voteOptions = [
    {
      value: 1 as VoteType,
      label: 'A Favor',
      icon: '✅',
      color: 'green',
      description: 'Concordo e aprovo esta proposta',
    },
    {
      value: 0 as VoteType,
      label: 'Contra',
      icon: '❌',
      color: 'red',
      description: 'Discordo e rejeito esta proposta',
    },
    {
      value: 2 as VoteType,
      label: 'Abstenção',
      icon: '⚪',
      color: 'gray',
      description: 'Neutro, não tomo posição',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🗳️ Registrar Voto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isPending || isConfirming}
          >
            ✕
          </button>
        </div>

        {/* Proposta */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <span className="text-gray-400 text-sm">Proposta</span>
          <p className="text-white font-semibold">#{proposalId.toString()}</p>
        </div>

        {/* Opções de voto */}
        <div className="space-y-3 mb-6">
          <p className="text-gray-400 text-sm mb-3">Escolha seu voto:</p>
          {voteOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedVote(option.value)}
              disabled={isPending || isConfirming}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === option.value
                  ? `border-${option.color}-500 bg-${option.color}-500 bg-opacity-20`
                  : 'border-gray-700 hover:border-gray-600'
              } ${isPending || isConfirming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${
                    option.color === 'green' ? 'text-green-400' :
                    option.color === 'red' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-gray-500 text-sm">{option.description}</div>
                </div>
                {selectedVote === option.value && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Estados de loading */}
        {isPending && (
          <div className="mb-4 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-400">Aguardando confirmação da wallet...</span>
            </div>
          </div>
        )}

        {isConfirming && (
          <div className="mb-4 p-4 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
              <span className="text-yellow-400">Processando transação...</span>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="mb-4 p-4 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-green-400">Voto registrado com sucesso!</span>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleVote}
            disabled={selectedVote === null || isPending || isConfirming}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? 'Processando...' : 'Confirmar Voto'}
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-400">
          <p>💡 Dica: Seu voto será registrado publicamente na blockchain e não poderá ser alterado.</p>
        </div>
      </div>
    </div>
  );
}
