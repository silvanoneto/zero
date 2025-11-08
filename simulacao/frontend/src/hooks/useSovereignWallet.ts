import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { SOVEREIGN_WALLET_ABI } from '@/contracts/abis';
import { SOVEREIGN_WALLET_ADDRESS } from '@/contracts/addresses';

export interface SecurityStatus {
  isVerified: boolean;
  isBlocked: boolean;
  riskScore: number;
  status: 'Active' | 'Monitoring' | 'Quarantine' | 'Blocked' | 'Destroyed';
  balance: string;
  config: {
    requireBiometric: boolean;
    requireGeolocation: boolean;
    autoBlockOnFraud: boolean;
    allowRecovery: boolean;
    minConfirmations: number;
    dailyTransferLimit: string;
  };
}

export interface WalletStats {
  totalTransfers: number;
  totalReceived: string;
  totalSent: string;
  fraudIncidents: number;
  recoveryAttempts: number;
  lastActivityAt: number;
}

export function useSovereignWallet(address?: `0x${string}`) {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [health, setHealth] = useState<number>(0);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Get security status
  const { data: statusData, refetch: refetchStatus } = useReadContract({
    address: SOVEREIGN_WALLET_ADDRESS,
    abi: SOVEREIGN_WALLET_ABI,
    functionName: 'getSecurityStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get health score
  const { data: healthData, refetch: refetchHealth } = useReadContract({
    address: SOVEREIGN_WALLET_ADDRESS,
    abi: SOVEREIGN_WALLET_ABI,
    functionName: 'getWalletHealthScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get wallet stats
  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: SOVEREIGN_WALLET_ADDRESS,
    abi: SOVEREIGN_WALLET_ABI,
    functionName: 'getWalletStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get remaining daily limit
  const { data: dailyLimitData } = useReadContract({
    address: SOVEREIGN_WALLET_ADDRESS,
    abi: SOVEREIGN_WALLET_ABI,
    functionName: 'getRemainingDailyLimit',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    if (statusData) {
      const [isVerified, isBlocked, riskScore, statusEnum, balance, config] = statusData as readonly [boolean, boolean, bigint, number, bigint, {
        requireBiometric: boolean;
        requireGeolocation: boolean;
        autoBlockOnFraud: boolean;
        allowRecovery: boolean;
        minConfirmations: number;
        dailyTransferLimit: bigint;
      }];
      
      const statusMap = ['Active', 'Monitoring', 'Quarantine', 'Blocked', 'Destroyed'];
      
      setStatus({
        isVerified,
        isBlocked,
        riskScore: Number(riskScore),
        status: statusMap[Number(statusEnum)] as any,
        balance: balance.toString(),
        config: {
          requireBiometric: config.requireBiometric,
          requireGeolocation: config.requireGeolocation,
          autoBlockOnFraud: config.autoBlockOnFraud,
          allowRecovery: config.allowRecovery,
          minConfirmations: Number(config.minConfirmations),
          dailyTransferLimit: config.dailyTransferLimit.toString(),
        },
      });
    }

    if (healthData) {
      setHealth(Number(healthData));
    }

    if (statsData) {
      const [totalTransfers, totalReceived, totalSent, fraudIncidents, recoveryAttempts, lastActivityAt] = statsData as readonly [bigint, bigint, bigint, bigint, bigint, bigint];
      
      setStats({
        totalTransfers: Number(totalTransfers),
        totalReceived: totalReceived.toString(),
        totalSent: totalSent.toString(),
        fraudIncidents: Number(fraudIncidents),
        recoveryAttempts: Number(recoveryAttempts),
        lastActivityAt: Number(lastActivityAt),
      });
    }

    setLoading(false);
  }, [address, statusData, healthData, statsData]);

  const refresh = async () => {
    await Promise.all([
      refetchStatus(),
      refetchHealth(),
      refetchStats(),
    ]);
  };

  return {
    status,
    health,
    stats,
    dailyLimitRemaining: dailyLimitData ? dailyLimitData.toString() : '0',
    loading,
    refresh,
  };
}
