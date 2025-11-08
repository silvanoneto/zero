'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MitosisVotingProps {
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
}

enum DivisionCriteria {
  AFFINITY = 0,
  COGNITIVE = 1,
  RANDOM = 2,
  TEMPORAL = 3,
}

const CRITERIA_INFO = {
  [DivisionCriteria.AFFINITY]: {
    name: 'Afinidade',
    icon: '❤️',
    description: 'Dividir por grupos de interesse e conexões sociais',
    color: 'border-red-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
    selectedColor: 'border-red-500 bg-red-50 dark:bg-red-900/30',
  },
  [DivisionCriteria.COGNITIVE]: {
    name: 'Cognitivo',
    icon: '🧠',
    description: 'Dividir por áreas de expertise e conhecimento',
    color: 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    selectedColor: 'border-purple-500 bg-purple-50 dark:bg-purple-900/30',
  },
  [DivisionCriteria.RANDOM]: {
    name: 'Aleatório',
    icon: '🎲',
    description: 'Dividir aleatoriamente para máxima diversidade',
    color: 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    selectedColor: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
  },
  [DivisionCriteria.TEMPORAL]: {
    name: 'Temporal',
    icon: '⏰',
    description: 'Dividir por tempo de entrada (veteranos vs novatos)',
    color: 'border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
    selectedColor: 'border-green-500 bg-green-50 dark:bg-green-900/30',
  },
};

export default function MitosisVoting({ daoId, daoMitosisAddress }: MitosisVotingProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<DivisionCriteria | null>(null);

  // Lê o processo de mitose ativo
  const { data: processId } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'activeMitosisProcess',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'activeMitosisProcess',
    args: [daoId],
  });

  // Lê dados do processo
  const { data: processData, refetch: refetchProcess } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'mitosisProcesses',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_processId', type: 'uint256' }],
        outputs: [
          { name: 'processId', type: 'uint256' },
          { name: 'daoId', type: 'uint256' },
          { name: 'initiatedAt', type: 'uint256' },
          { name: 'votingEndsAt', type: 'uint256' },
          { name: 'votesForAffinity', type: 'uint256' },
          { name: 'votesForCognitive', type: 'uint256' },
          { name: 'votesForRandom', type: 'uint256' },
          { name: 'votesForTemporal', type: 'uint256' },
          { name: 'totalVotes', type: 'uint256' },
          { name: 'selectedCriteria', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'childDao1Id', type: 'uint256' },
          { name: 'childDao2Id', type: 'uint256' },
          { name: 'snapshotIPFS', type: 'string' },
        ],
      },
    ] as const,
    functionName: 'mitosisProcesses',
    args: processId ? [processId] : undefined,
    query: {
      enabled: !!processId && processId > 0n,
    },
  });

  // Vote
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleVote = async () => {
    if (!processId || selectedCriteria === null) return;

    writeContract({
      address: daoMitosisAddress,
      abi: [
        {
          name: 'voteOnMitosisCriteria',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: '_processId', type: 'uint256' },
            { name: '_criteria', type: 'uint8' },
          ],
          outputs: [],
        },
      ] as const,
      functionName: 'voteOnMitosisCriteria',
      args: [processId, selectedCriteria],
    });
  };

  if (isSuccess) {
    setTimeout(() => refetchProcess(), 2000);
  }

  if (!processId || processId === 0n) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">Nenhum processo de mitose ativo</p>
      </div>
    );
  }

  if (!processData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  const [
    _processId,
    _daoId,
    initiatedAt,
    votingEndsAt,
    votesForAffinity,
    votesForCognitive,
    votesForRandom,
    votesForTemporal,
    totalVotes,
  ] = processData;

  const votes = {
    [DivisionCriteria.AFFINITY]: Number(votesForAffinity),
    [DivisionCriteria.COGNITIVE]: Number(votesForCognitive),
    [DivisionCriteria.RANDOM]: Number(votesForRandom),
    [DivisionCriteria.TEMPORAL]: Number(votesForTemporal),
  };

  const totalVotesNum = Number(totalVotes);
  const votingEndsDate = new Date(Number(votingEndsAt) * 1000);
  const isVotingActive = Date.now() < votingEndsDate.getTime();
  const timeRemaining = isVotingActive
    ? formatDistanceToNow(votingEndsDate, { addSuffix: true, locale: ptBR })
    : 'Encerrada';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🗳️ Votação de Mitose
        </h2>
        {isVotingActive ? (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            ⏰ {timeRemaining}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Encerrada
          </span>
        )}
      </div>

      {/* Description */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          A DAO atingiu o limite de Dunbar (500 membros). Vote no critério de divisão preferido.
          As duas DAOs filhas herdarão a estrutura, tokens e governança da DAO atual.
        </p>
      </div>

      {/* Current Results */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Resultados Atuais ({totalVotesNum} votos)
        </h3>
        {Object.entries(votes).map(([criteria, voteCount]) => {
          const criteriaKey = parseInt(criteria) as DivisionCriteria;
          const info = CRITERIA_INFO[criteriaKey];
          const percentage = totalVotesNum > 0 ? (voteCount / totalVotesNum) * 100 : 0;

          return (
            <div key={criteria} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {info.icon} {info.name}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {voteCount} votos ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Vote Options */}
      {isVotingActive && (
        <>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Seu Voto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(CRITERIA_INFO).map(([key, info]) => {
                const criteriaKey = parseInt(key) as DivisionCriteria;
                const isSelected = selectedCriteria === criteriaKey;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCriteria(criteriaKey)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      isSelected ? info.selectedColor : info.color
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div className="text-left flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {info.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {info.description}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vote Button */}
          <button
            onClick={handleVote}
            disabled={selectedCriteria === null || isPending || isConfirming}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              selectedCriteria === null || isPending || isConfirming
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPending || isConfirming ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isPending ? 'Confirmando...' : 'Processando...'}
              </span>
            ) : (
              'Confirmar Voto'
            )}
          </button>

          {isSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                <span className="text-xl mr-2">✅</span>
                Voto registrado com sucesso!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
