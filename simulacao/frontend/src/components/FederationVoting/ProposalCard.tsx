'use client';

import { useReadContract } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalCardProps {
  proposalId: bigint;
  votingAddress: `0x${string}`;
  onVote: (proposalId: bigint) => void;
}

export function ProposalCard({ proposalId, votingAddress, onVote }: ProposalCardProps) {
  // Ler dados da proposta
  const { data: proposal, isLoading } = useReadContract({
    address: votingAddress,
    abi: [
      {
        name: 'getProposal',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [
          { name: 'id', type: 'uint256' },
          { name: 'description', type: 'string' },
          { name: 'proposer', type: 'address' },
          { name: 'startTime', type: 'uint256' },
          { name: 'endTime', type: 'uint256' },
          { name: 'executed', type: 'bool' },
          { name: 'canceled', type: 'bool' },
        ],
      },
    ] as const,
    functionName: 'getProposal',
    args: [proposalId],
  });

  // Ler votos da proposta
  const { data: votes } = useReadContract({
    address: votingAddress,
    abi: [
      {
        name: 'getProposalVotes',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [
          { name: 'forVotes', type: 'uint256' },
          { name: 'againstVotes', type: 'uint256' },
          { name: 'abstainVotes', type: 'uint256' },
          { name: 'totalVotes', type: 'uint256' },
        ],
      },
    ] as const,
    functionName: 'getProposalVotes',
    args: [proposalId],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-lg p-6">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!proposal || !votes) {
    return null;
  }

  const [id, description, proposer, startTime, endTime, executed, canceled] = proposal;
  const [forVotes, againstVotes, abstainVotes, totalVotes] = votes;

  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= Number(startTime) && now <= Number(endTime) && !executed && !canceled;
  const hasEnded = now > Number(endTime);

  // Calcular porcentagens
  const total = Number(totalVotes);
  const forPercent = total > 0 ? (Number(forVotes) * 100) / total : 0;
  const againstPercent = total > 0 ? (Number(againstVotes) * 100) / total : 0;
  const abstainPercent = total > 0 ? (Number(abstainVotes) * 100) / total : 0;

  // Status da proposta
  let status = '';
  let statusColor = '';
  if (canceled) {
    status = 'Cancelada';
    statusColor = 'bg-gray-500';
  } else if (executed) {
    status = 'Executada';
    statusColor = 'bg-green-500';
  } else if (hasEnded) {
    status = 'Encerrada';
    statusColor = 'bg-red-500';
  } else if (isActive) {
    status = 'Ativa';
    statusColor = 'bg-blue-500';
  } else {
    status = 'Agendada';
    statusColor = 'bg-yellow-500';
  }

  // Tempo restante ou tempo desde o fim
  const timeInfo = hasEnded
    ? `Encerrada ${formatDistanceToNow(Number(endTime) * 1000, { locale: ptBR, addSuffix: true })}`
    : `Encerra ${formatDistanceToNow(Number(endTime) * 1000, { locale: ptBR, addSuffix: true })}`;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusColor}`}>
              {status}
            </span>
            <span className="text-gray-400 text-sm">#{id.toString()}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{description}</h3>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <span>👤</span>
          <span>Proposto por:</span>
          <code className="text-blue-400 font-mono text-xs">
            {proposer.slice(0, 6)}...{proposer.slice(-4)}
          </code>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span>⏰</span>
          <span>{timeInfo}</span>
        </div>
      </div>

      {/* Resultados da votação */}
      <div className="space-y-3 mb-4">
        {/* A Favor */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-400 font-semibold">✅ A Favor</span>
            <span className="text-gray-400">
              {forVotes.toString()} votos ({forPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${forPercent}%` }}
            />
          </div>
        </div>

        {/* Contra */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-400 font-semibold">❌ Contra</span>
            <span className="text-gray-400">
              {againstVotes.toString()} votos ({againstPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${againstPercent}%` }}
            />
          </div>
        </div>

        {/* Abstenção */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400 font-semibold">⚪ Abstenção</span>
            <span className="text-gray-400">
              {abstainVotes.toString()} votos ({abstainPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 transition-all duration-500"
              style={{ width: `${abstainPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total de votos */}
      <div className="text-center py-2 bg-gray-900 rounded mb-4">
        <span className="text-gray-400 text-sm">Total de Votos: </span>
        <span className="text-white font-semibold">{totalVotes.toString()}</span>
      </div>

      {/* Botão de votar */}
      {isActive && (
        <button
          onClick={() => onVote(proposalId)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          🗳️ Votar nesta Proposta
        </button>
      )}

      {hasEnded && !executed && !canceled && (
        <div className="text-center py-3 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-700">
          <span className="text-yellow-400 text-sm">⏰ Aguardando execução</span>
        </div>
      )}
    </div>
  );
}
