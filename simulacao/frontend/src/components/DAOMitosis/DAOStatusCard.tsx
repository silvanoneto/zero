'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

interface DAOStatusCardProps {
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
}

enum DAOStatus {
  ACTIVE = 0,
  WARNING = 1,
  MITOSIS_VOTE = 2,
  SPLITTING = 3,
  LEGACY = 4,
}

const STATUS_INFO = {
  [DAOStatus.ACTIVE]: {
    label: 'Ativa',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: '✅',
    description: 'DAO operando normalmente',
  },
  [DAOStatus.WARNING]: {
    label: 'Alerta Dunbar',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: '⚠️',
    description: 'Aproximando do limite de 500 membros',
  },
  [DAOStatus.MITOSIS_VOTE]: {
    label: 'Votação de Mitose',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: '🗳️',
    description: 'Membros votando nos critérios de divisão',
  },
  [DAOStatus.SPLITTING]: {
    label: 'Em Divisão',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: '🔄',
    description: 'Processo de mitose em execução',
  },
  [DAOStatus.LEGACY]: {
    label: 'Legado',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    icon: '📚',
    description: 'DAO dividida - veja as filhas',
  },
};

const DUNBAR_LIMIT = 500;
const WARNING_THRESHOLD = 450;

export default function DAOStatusCard({ daoId, daoMitosisAddress }: DAOStatusCardProps) {
  const [percentage, setPercentage] = useState(0);

  // Lê informações da DAO
  const { data: daoData, isLoading } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'daos',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [
          { name: 'id', type: 'uint256' },
          { name: 'daoAddress', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'activeMemberCount', type: 'uint256' },
          { name: 'totalMemberCount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'parentDaoId', type: 'uint256' },
          { name: 'generationLevel', type: 'uint256' },
          { name: 'metadataIPFS', type: 'string' },
        ],
      },
    ] as const,
    functionName: 'daos',
    args: [daoId],
  });

  useEffect(() => {
    if (daoData && daoData[4]) {
      const memberCount = Number(daoData[4]);
      setPercentage((memberCount / DUNBAR_LIMIT) * 100);
    }
  }, [daoData]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!daoData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-500 dark:text-gray-400">DAO não encontrada</p>
      </div>
    );
  }

  const [id, daoAddress, name, createdAt, activeMemberCount, totalMemberCount, status] = daoData;
  const statusInfo = STATUS_INFO[status as DAOStatus] || STATUS_INFO[DAOStatus.ACTIVE];
  const memberCount = Number(activeMemberCount);
  const isDanger = memberCount >= WARNING_THRESHOLD;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>

      {/* Status Description */}
      <p className="text-gray-600 dark:text-gray-400">{statusInfo.description}</p>

      {/* Member Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Membros Ativos
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {memberCount} / {DUNBAR_LIMIT}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage >= 90
                ? 'bg-red-500'
                : percentage >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span className="text-yellow-600 dark:text-yellow-400">⚠️ {WARNING_THRESHOLD}</span>
          <span className="text-red-600 dark:text-red-400">🔴 {DUNBAR_LIMIT}</span>
        </div>
      </div>

      {/* Alert Messages */}
      {isDanger && status === DAOStatus.ACTIVE && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                Limite de Dunbar Próximo
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Esta DAO está se aproximando do limite natural de coesão social (500 membros).
                Quando atingir o limite, será iniciado um processo democrático de mitose.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === DAOStatus.MITOSIS_VOTE && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🗳️</span>
            <div>
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">
                Votação em Andamento
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                Os membros estão votando nos critérios para dividir a DAO em duas organizações filhas.
              </p>
              <button
                onClick={() => window.location.href = `/dao/${daoId}/mitosis`}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver Votação →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAO Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total de Membros</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Number(totalMemberCount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Geração</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Number(daoData[8])}ª
          </p>
        </div>
      </div>
    </div>
  );
}
