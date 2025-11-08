import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import AttentionTokensABI from '@/contracts/AttentionTokens.json';

// Configuração do contrato
const ATTENTION_TOKENS_ADDRESS = process.env.NEXT_PUBLIC_ATTENTION_TOKENS_ADDRESS as `0x${string}`;

export interface CitizenAttention {
  balance: bigint;
  expirationDate: bigint;
  lifetimeAllocated: bigint;
  timeUntilExpiration?: number;
  canClaim?: boolean;
}

export interface ProposalAttention {
  totalTokens: bigint;
  uniqueAllocators: bigint; // Pode ser chamado de supporters
  isFastTrack: boolean;
  isSpam: boolean;
  priorityScore?: bigint;
  allocation?: bigint; // Alocação do usuário atual
}

export interface Reputation {
  totalEarned: bigint;
  reputationScore: bigint;
  winRate: bigint;
  score?: bigint; // Alias para reputationScore
  tier?: string;
  nextTier?: string;
  nextTierThreshold?: bigint;
  lifetimeAllocated?: bigint;
  participationCount?: bigint;
}

export interface TopProposal {
  proposalId: bigint;
  totalTokens: bigint;
  supporters: bigint;
  priorityScore: bigint;
  isFastTrack: boolean;
}

/**
 * Hook para gerenciar dados de atenção do cidadão
 */
export function useCitizenAttention() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'getCitizenAttention',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Atualiza a cada 10s
    },
  });

  const citizenAttention: CitizenAttention | null = data
    ? {
        balance: (data as readonly [bigint, bigint, bigint])[0],
        expirationDate: (data as readonly [bigint, bigint, bigint])[1],
        lifetimeAllocated: (data as readonly [bigint, bigint, bigint])[2],
        timeUntilExpiration: Number((data as readonly [bigint, bigint, bigint])[1]) - Math.floor(Date.now() / 1000),
        canClaim: Number((data as readonly [bigint, bigint, bigint])[1]) < Math.floor(Date.now() / 1000),
      }
    : null;

  return {
    citizenAttention,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para alocar tokens de atenção
 */
export function useAllocateAttention() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const allocateAttention = async (proposalId: number, amount: number) => {
    return writeContract({
      address: ATTENTION_TOKENS_ADDRESS,
      abi: AttentionTokensABI.abi,
      functionName: 'allocateAttention',
      args: [BigInt(proposalId), BigInt(amount)],
    });
  };

  return {
    allocateAttention,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook para realocar tokens de atenção
 */
export function useReallocateAttention() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const reallocateAttention = async (
    fromProposalId: number,
    toProposalId: number,
    amount: number
  ) => {
    return writeContract({
      address: ATTENTION_TOKENS_ADDRESS,
      abi: AttentionTokensABI.abi,
      functionName: 'reallocateAttention',
      args: [BigInt(fromProposalId), BigInt(toProposalId), BigInt(amount)],
    });
  };

  return {
    reallocateAttention,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook para reivindicar alocação mensal
 */
export function useClaimMonthlyAllocation() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimAllocation = async () => {
    if (!address) throw new Error('Wallet not connected');

    return writeContract({
      address: ATTENTION_TOKENS_ADDRESS,
      abi: AttentionTokensABI.abi,
      functionName: 'claimMonthlyAllocation',
      args: [address],
    });
  };

  return {
    claimAllocation,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook para obter atenção de uma proposta
 */
export function useProposalAttention(proposalId: number | bigint | undefined) {
  const { address } = useAccount();
  const proposalIdBigInt = proposalId !== undefined ? BigInt(proposalId) : undefined;

  const { data, isLoading, error, refetch } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'getProposalAttention',
    args: proposalIdBigInt !== undefined ? [proposalIdBigInt] : undefined,
    query: {
      enabled: proposalIdBigInt !== undefined,
      refetchInterval: 15000, // Atualiza a cada 15s
    },
  });

  // Também busca o score de priorização
  const { data: scoreData } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'calculatePriorityScore',
    args: proposalIdBigInt !== undefined ? [proposalIdBigInt] : undefined,
    query: {
      enabled: proposalIdBigInt !== undefined,
    },
  });

  // Busca a alocação do usuário atual
  const { data: allocationData } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'citizenAllocations',
    args: address && proposalIdBigInt !== undefined ? [address, proposalIdBigInt] : undefined,
    query: {
      enabled: !!address && proposalIdBigInt !== undefined,
    },
  });

  const proposalAttention: ProposalAttention | null = data
    ? {
        totalTokens: (data as readonly [bigint, bigint, boolean, boolean])[0],
        uniqueAllocators: (data as readonly [bigint, bigint, boolean, boolean])[1],
        isFastTrack: (data as readonly [bigint, bigint, boolean, boolean])[2],
        isSpam: (data as readonly [bigint, bigint, boolean, boolean])[3],
        priorityScore: scoreData as bigint,
        allocation: allocationData as bigint,
      }
    : null;

  return {
    proposalAttention,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para obter top propostas
 */
export function useTopProposals() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'getTopProposals',
    query: {
      refetchInterval: 20000, // Atualiza a cada 20s
    },
  });

  const topProposalIds = (data as bigint[]) || [];
  
  // Buscar detalhes de cada proposta no top
  const topProposals: TopProposal[] = topProposalIds.map((proposalId) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { proposalAttention } = useProposalAttention(Number(proposalId));
    
    return {
      proposalId,
      totalTokens: proposalAttention?.totalTokens || 0n,
      supporters: proposalAttention?.uniqueAllocators || 0n,
      priorityScore: proposalAttention?.priorityScore || 0n,
      isFastTrack: proposalAttention?.isFastTrack || false,
    };
  });

  return {
    topProposals,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para obter reputação do cidadão
 */
export function useReputation(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const address = userAddress || connectedAddress;

  const { data, isLoading, error, refetch } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'getReputation',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Atualiza a cada 30s
    },
  });

  // Busca dados adicionais do cidadão
  const { data: citizenData } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'getCitizenAttention',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const getTier = (score: number): string => {
    if (score >= 1000) return 'Sábio';
    if (score >= 500) return 'Líder';
    if (score >= 200) return 'Ativista';
    if (score >= 50) return 'Participante';
    return 'Observador';
  };

  const getNextTier = (tier: string): string | undefined => {
    const tiers: Record<string, string> = {
      'Observador': 'Participante',
      'Participante': 'Ativista',
      'Ativista': 'Líder',
      'Líder': 'Sábio',
    };
    return tiers[tier];
  };

  const getNextTierThreshold = (tier: string): bigint => {
    const thresholds: Record<string, bigint> = {
      'Observador': 50n,
      'Participante': 200n,
      'Ativista': 500n,
      'Líder': 1000n,
      'Sábio': 0n,
    };
    return thresholds[tier] || 0n;
  };

  const reputation: Reputation | null = data
    ? {
        totalEarned: (data as readonly [bigint, bigint, bigint])[0],
        reputationScore: (data as readonly [bigint, bigint, bigint])[1],
        winRate: (data as readonly [bigint, bigint, bigint])[2],
        score: (data as readonly [bigint, bigint, bigint])[1], // Alias
        tier: getTier(Number((data as readonly [bigint, bigint, bigint])[1])),
        nextTier: getNextTier(getTier(Number((data as readonly [bigint, bigint, bigint])[1]))),
        nextTierThreshold: getNextTierThreshold(getTier(Number((data as readonly [bigint, bigint, bigint])[1]))),
        lifetimeAllocated: citizenData ? (citizenData as readonly [bigint, bigint, bigint])[2] : 0n,
        participationCount: (data as readonly [bigint, bigint, bigint])[0], // Using totalEarned as participation proxy
      }
    : null;

  return {
    reputation,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para obter constantes do contrato
 */
export function useAttentionConstants() {
  const { data: monthlyAllocation } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'MONTHLY_ALLOCATION',
  });

  const { data: fastTrackThreshold } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'FAST_TRACK_THRESHOLD',
  });

  const { data: spamThreshold } = useReadContract({
    address: ATTENTION_TOKENS_ADDRESS,
    abi: AttentionTokensABI.abi,
    functionName: 'SPAM_THRESHOLD',
  });

  return {
    MONTHLY_ALLOCATION: monthlyAllocation ? Number(monthlyAllocation) : 100,
    FAST_TRACK_THRESHOLD: fastTrackThreshold ? Number(fastTrackThreshold) : 5000,
    SPAM_THRESHOLD: spamThreshold ? Number(spamThreshold) : 100,
  };
}

/**
 * Utilitário para formatar tempo restante
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expirado';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Utilitário para formatar score de reputação
 */
export function formatReputationScore(score: bigint): string {
  const value = Number(score);
  if (value >= 900) return '🏆 Excelente';
  if (value >= 700) return '⭐ Muito Bom';
  if (value >= 500) return '👍 Bom';
  if (value >= 300) return '🔄 Regular';
  return '🆕 Iniciante';
}
