import { useEffect, useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { WALLET_RECOVERY_ADDRESS } from '@/contracts/addresses';

// Simplified ABI - will be replaced with full ABI later
const WALLET_RECOVERY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getRecoveryStatus",
    "outputs": [
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "address", "name": "newWallet", "type": "address" },
      { "internalType": "uint256", "name": "proofsSubmitted", "type": "uint256" },
      { "internalType": "uint256", "name": "totalScore", "type": "uint256" },
      { "internalType": "uint256", "name": "guardiansVoted", "type": "uint256" },
      { "internalType": "uint256", "name": "guardiansRequired", "type": "uint256" },
      { "internalType": "uint256", "name": "executionTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "compromisedWallet", "type": "address" },
      { "internalType": "address", "name": "newWallet", "type": "address" }
    ],
    "name": "initiateRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "uint8", "name": "proofType", "type": "uint8" },
      { "internalType": "bytes32", "name": "proofHash", "type": "bytes32" }
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "bool", "name": "approve", "type": "bool" }
    ],
    "name": "voteRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "executeRecovery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export interface RecoveryStatus {
  isActive: boolean;
  newWallet: string;
  proofsSubmitted: number;
  totalScore: number;
  guardiansVoted: number;
  guardiansRequired: number;
  executionTime: number;
}

export function useWalletRecovery(address?: `0x${string}`) {
  const [status, setStatus] = useState<RecoveryStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Get recovery status
  const { data: statusData, refetch } = useReadContract({
    address: WALLET_RECOVERY_ADDRESS,
    abi: WALLET_RECOVERY_ABI,
    functionName: 'getRecoveryStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Write operations
  const { writeContract: initiateRecovery, isPending: isInitiating } = useWriteContract();
  const { writeContract: submitProof, isPending: isSubmitting } = useWriteContract();
  const { writeContract: voteRecovery, isPending: isVoting } = useWriteContract();
  const { writeContract: executeRecovery, isPending: isExecuting } = useWriteContract();

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    if (statusData) {
      const [
        isActive,
        newWallet,
        proofsSubmitted,
        totalScore,
        guardiansVoted,
        guardiansRequired,
        executionTime
      ] = statusData as readonly [
        boolean,
        `0x${string}`,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ];

      setStatus({
        isActive,
        newWallet,
        proofsSubmitted: Number(proofsSubmitted),
        totalScore: Number(totalScore),
        guardiansVoted: Number(guardiansVoted),
        guardiansRequired: Number(guardiansRequired),
        executionTime: Number(executionTime),
      });
    }

    setLoading(false);
  }, [address, statusData]);

  const handleInitiateRecovery = (compromisedWallet: `0x${string}`, newWallet: `0x${string}`) => {
    initiateRecovery({
      address: WALLET_RECOVERY_ADDRESS,
      abi: WALLET_RECOVERY_ABI,
      functionName: 'initiateRecovery',
      args: [compromisedWallet, newWallet],
    });
  };

  const handleSubmitProof = (wallet: `0x${string}`, proofType: number, proofHash: `0x${string}`) => {
    submitProof({
      address: WALLET_RECOVERY_ADDRESS,
      abi: WALLET_RECOVERY_ABI,
      functionName: 'submitProof',
      args: [wallet, proofType, proofHash],
    });
  };

  const handleVoteRecovery = (wallet: `0x${string}`, approve: boolean) => {
    voteRecovery({
      address: WALLET_RECOVERY_ADDRESS,
      abi: WALLET_RECOVERY_ABI,
      functionName: 'voteRecovery',
      args: [wallet, approve],
    });
  };

  const handleExecuteRecovery = (wallet: `0x${string}`) => {
    executeRecovery({
      address: WALLET_RECOVERY_ADDRESS,
      abi: WALLET_RECOVERY_ABI,
      functionName: 'executeRecovery',
      args: [wallet],
    });
  };

  return {
    status,
    loading,
    refetch,
    initiateRecovery: handleInitiateRecovery,
    submitProof: handleSubmitProof,
    voteRecovery: handleVoteRecovery,
    executeRecovery: handleExecuteRecovery,
    isInitiating,
    isSubmitting,
    isVoting,
    isExecuting,
  };
}
