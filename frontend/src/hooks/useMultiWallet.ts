import { useEffect, useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { MULTI_WALLET_ADDRESS } from '@/contracts/addresses';

// Simplified ABI - will be replaced with full ABI later
const MULTI_WALLET_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getIdentity",
    "outputs": [
      { "internalType": "bytes32", "name": "identityId", "type": "bytes32" },
      { "internalType": "address", "name": "primaryWallet", "type": "address" },
      { "internalType": "address[]", "name": "wallets", "type": "address[]" },
      { "internalType": "uint8", "name": "walletCount", "type": "uint8" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createIdentity",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newWallet", "type": "address" }],
    "name": "addWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "walletToRemove", "type": "address" }],
    "name": "removeWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newPrimary", "type": "address" }],
    "name": "changePrimaryWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export interface Identity {
  identityId: string;
  primaryWallet: string;
  wallets: string[];
  walletCount: number;
  isActive: boolean;
}

export function useMultiWallet(address?: `0x${string}`) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);

  // Get identity
  const { data: identityData, refetch } = useReadContract({
    address: MULTI_WALLET_ADDRESS,
    abi: MULTI_WALLET_ABI,
    functionName: 'getIdentity',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Write operations
  const { writeContract: createIdentity, isPending: isCreating } = useWriteContract();
  const { writeContract: addWallet, isPending: isAdding } = useWriteContract();
  const { writeContract: removeWallet, isPending: isRemoving } = useWriteContract();
  const { writeContract: changePrimary, isPending: isChanging } = useWriteContract();

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    if (identityData) {
      const [identityId, primaryWallet, wallets, walletCount, isActive] = identityData as readonly [
        `0x${string}`,
        `0x${string}`,
        readonly `0x${string}`[],
        number,
        boolean
      ];

      setIdentity({
        identityId,
        primaryWallet,
        wallets: [...wallets],
        walletCount: Number(walletCount),
        isActive,
      });
    }

    setLoading(false);
  }, [address, identityData]);

  const handleCreateIdentity = () => {
    createIdentity({
      address: MULTI_WALLET_ADDRESS,
      abi: MULTI_WALLET_ABI,
      functionName: 'createIdentity',
    });
  };

  const handleAddWallet = (newWallet: `0x${string}`) => {
    addWallet({
      address: MULTI_WALLET_ADDRESS,
      abi: MULTI_WALLET_ABI,
      functionName: 'addWallet',
      args: [newWallet],
    });
  };

  const handleRemoveWallet = (walletToRemove: `0x${string}`) => {
    removeWallet({
      address: MULTI_WALLET_ADDRESS,
      abi: MULTI_WALLET_ABI,
      functionName: 'removeWallet',
      args: [walletToRemove],
    });
  };

  const handleChangePrimary = (newPrimary: `0x${string}`) => {
    changePrimary({
      address: MULTI_WALLET_ADDRESS,
      abi: MULTI_WALLET_ABI,
      functionName: 'changePrimaryWallet',
      args: [newPrimary],
    });
  };

  return {
    identity,
    loading,
    refetch,
    createIdentity: handleCreateIdentity,
    addWallet: handleAddWallet,
    removeWallet: handleRemoveWallet,
    changePrimary: handleChangePrimary,
    isCreating,
    isAdding,
    isRemoving,
    isChanging,
  };
}
