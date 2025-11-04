'use client';

import { useReadContract } from 'wagmi';

interface VotingStatsProps {
  votingAddress: `0x${string}`;
}

export function VotingStats({ votingAddress }: VotingStatsProps) {
  // Total de propostas
  const { data: proposalCount } = useReadContract({
    address: votingAddress,
    abi: [
      {
        name: 'proposalCount',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'proposalCount',
  });

  // Quorum necessário
  const { data: quorum } = useReadContract({
    address: votingAddress,
    abi: [
      {
        name: 'quorum',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'quorum',
  });

  // Duração da votação
  const { data: votingPeriod } = useReadContract({
    address: votingAddress,
    abi: [
      {
        name: 'votingPeriod',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'votingPeriod',
  });

  const stats = [
    {
      label: 'Total de Propostas',
      value: proposalCount?.toString() || '0',
      icon: '📋',
      color: 'blue',
    },
    {
      label: 'Quorum Necessário',
      value: quorum ? `${quorum.toString()}%` : '0%',
      icon: '✓',
      color: 'green',
    },
    {
      label: 'Período de Votação',
      value: votingPeriod ? `${Number(votingPeriod) / 86400} dias` : '0 dias',
      icon: '⏰',
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span
              className={`text-3xl font-bold ${
                stat.color === 'blue' ? 'text-blue-400' :
                stat.color === 'green' ? 'text-green-400' :
                'text-purple-400'
              }`}
            >
              {stat.value}
            </span>
          </div>
          <p className="text-gray-400 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
