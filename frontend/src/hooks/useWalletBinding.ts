import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { formatEther } from 'viem';
import { SOVEREIGN_CURRENCY_ADDRESS, MULTI_WALLET_ADDRESS } from '@/contracts/addresses';

// ABI para as funções de wallet binding
const SOB_BINDING_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getWalletIdentity",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "validateWalletTokens",
    "outputs": [
      { "internalType": "bool", "name": "valid", "type": "bool" },
      { "internalType": "string", "name": "reason", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "citizen", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "citizen", "type": "address" }],
    "name": "balanceOfRaw",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "citizen", "type": "address" }],
    "name": "getCitizenInfo",
    "outputs": [
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      { "internalType": "uint256", "name": "totalEarned", "type": "uint256" },
      { "internalType": "uint256", "name": "lastActivity", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "address", "name": "originalWallet", "type": "address" },
      { "internalType": "uint256", "name": "checkpointCount", "type": "uint256" },
      { "internalType": "uint256", "name": "activityCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "identityId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "TokensBound",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "fromWallet", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "toWallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": true, "internalType": "bytes32", "name": "identityId", "type": "bytes32" }
    ],
    "name": "TokensMigrated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "originalWallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "TokensDestroyed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "identityId", "type": "bytes32" }
    ],
    "name": "WalletIdentityLinked",
    "type": "event"
  }
] as const;

const MULTI_WALLET_MIGRATION_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "fromWallet", "type": "address" },
      { "internalType": "address", "name": "toWallet", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "migrateTokens",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export interface WalletTokenInfo {
  address: string;
  identityId: string;
  balance: string;
  rawBalance: string;
  isValid: boolean;
  validationReason: string;
  originalWallet: string;
  isOriginal: boolean;
  isMigrated: boolean;
}

export interface TokenMigrationEvent {
  fromWallet: string;
  toWallet: string;
  amount: string;
  identityId: string;
  timestamp: number;
}

export function useWalletBinding() {
  const { address } = useAccount();
  const [walletInfo, setWalletInfo] = useState<WalletTokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentMigrations, setRecentMigrations] = useState<TokenMigrationEvent[]>([]);

  // Get wallet identity
  const { data: identityId } = useReadContract({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    functionName: 'getWalletIdentity',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Validate wallet tokens
  const { data: validation } = useReadContract({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    functionName: 'validateWalletTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get balance (validated)
  const { data: balance } = useReadContract({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get raw balance (unvalidated, for debugging)
  const { data: rawBalance } = useReadContract({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    functionName: 'balanceOfRaw',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get citizen info (includes originalWallet)
  const { data: citizenInfo } = useReadContract({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    functionName: 'getCitizenInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Watch for token migrations
  useWatchContractEvent({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    eventName: 'TokensMigrated',
    onLogs: (logs) => {
      const migrations = logs.map(log => ({
        fromWallet: log.args.fromWallet as string,
        toWallet: log.args.toWallet as string,
        amount: formatEther(log.args.amount as bigint),
        identityId: log.args.identityId as string,
        timestamp: Date.now()
      }));
      setRecentMigrations(prev => [...migrations, ...prev].slice(0, 10));
    }
  });

  // Watch for token destruction (stolen tokens)
  useWatchContractEvent({
    address: SOVEREIGN_CURRENCY_ADDRESS,
    abi: SOB_BINDING_ABI,
    eventName: 'TokensDestroyed',
    onLogs: (logs) => {
      if (logs.some(log => log.args.wallet === address)) {
        setError('⚠️ Tokens stolen detected and destroyed! Please use wallet recovery.');
      }
    }
  });

  // Update wallet info when data changes
  useEffect(() => {
    if (!address) {
      setWalletInfo(null);
      return;
    }

    const [isValid, reason] = validation || [false, 'Not checked'];
    const originalWallet = citizenInfo?.[4] as string | undefined;

    setWalletInfo({
      address,
      identityId: identityId as string || '0x0',
      balance: balance ? formatEther(balance as bigint) : '0',
      rawBalance: rawBalance ? formatEther(rawBalance as bigint) : '0',
      isValid,
      validationReason: reason,
      originalWallet: originalWallet || '0x0',
      isOriginal: originalWallet ? originalWallet.toLowerCase() === address.toLowerCase() : false,
      isMigrated: originalWallet ? originalWallet.toLowerCase() !== address.toLowerCase() : false
    });
  }, [address, identityId, validation, balance, rawBalance, citizenInfo]);

  // Migrate tokens function
  const { writeContractAsync: migrateTokens } = useWriteContract();

  const migrate = async (toWallet: string, amount: string) => {
    if (!address) {
      setError('No wallet connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      const hash = await migrateTokens({
        address: MULTI_WALLET_ADDRESS,
        abi: MULTI_WALLET_MIGRATION_ABI,
        functionName: 'migrateTokens',
        args: [address, toWallet as `0x${string}`, amountWei]
      });

      return hash;
    } catch (err: any) {
      setError(err.message || 'Migration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    walletInfo,
    isLoading,
    error,
    recentMigrations,
    migrate,
    hasIdentity: !!identityId && identityId !== '0x0000000000000000000000000000000000000000000000000000000000000000',
    isSecure: walletInfo?.isValid ?? false,
    needsAttention: walletInfo ? !walletInfo.isValid : false
  };
}
