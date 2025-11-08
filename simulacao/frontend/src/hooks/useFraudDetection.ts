import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { FRAUD_DETECTION_ADDRESS } from '@/contracts/addresses';

// Simplified ABI - will be replaced with full ABI later
const FRAUD_DETECTION_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getWalletStatus",
    "outputs": [
      { "internalType": "uint256", "name": "riskScore", "type": "uint256" },
      { "internalType": "bool", "name": "isBlocked", "type": "bool" },
      { "internalType": "uint256", "name": "lastActionTime", "type": "uint256" },
      { "internalType": "uint256", "name": "actionCount24h", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getRecentIncidents",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "reason", "type": "string" },
          { "internalType": "uint256", "name": "riskScore", "type": "uint256" },
          { "internalType": "bool", "name": "wasBlocked", "type": "bool" }
        ],
        "internalType": "struct FraudDetection.Incident[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getDetectionRules",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "uint256", "name": "weight", "type": "uint256" }
        ],
        "internalType": "struct FraudDetection.Rule[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface WalletStatus {
  riskScore: number;
  isBlocked: boolean;
  lastActionTime: number;
  actionCount24h: number;
}

export interface Incident {
  timestamp: number;
  reason: string;
  riskScore: number;
  wasBlocked: boolean;
}

export interface DetectionRule {
  name: string;
  isActive: boolean;
  weight: number;
}

export function useFraudDetection(address?: `0x${string}`) {
  const [status, setStatus] = useState<WalletStatus | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Get wallet status
  const { data: statusData, refetch: refetchStatus } = useReadContract({
    address: FRAUD_DETECTION_ADDRESS,
    abi: FRAUD_DETECTION_ABI,
    functionName: 'getWalletStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get recent incidents
  const { data: incidentsData, refetch: refetchIncidents } = useReadContract({
    address: FRAUD_DETECTION_ADDRESS,
    abi: FRAUD_DETECTION_ABI,
    functionName: 'getRecentIncidents',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Get detection rules
  const { data: rulesData, refetch: refetchRules } = useReadContract({
    address: FRAUD_DETECTION_ADDRESS,
    abi: FRAUD_DETECTION_ABI,
    functionName: 'getDetectionRules',
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
      const [riskScore, isBlocked, lastActionTime, actionCount24h] = statusData as readonly [
        bigint,
        boolean,
        bigint,
        bigint
      ];

      setStatus({
        riskScore: Number(riskScore),
        isBlocked,
        lastActionTime: Number(lastActionTime),
        actionCount24h: Number(actionCount24h),
      });
    }

    if (incidentsData) {
      const mapped = (incidentsData as any[]).map(incident => ({
        timestamp: Number(incident.timestamp),
        reason: incident.reason,
        riskScore: Number(incident.riskScore),
        wasBlocked: incident.wasBlocked,
      }));
      setIncidents(mapped);
    }

    if (rulesData) {
      const mapped = (rulesData as any[]).map(rule => ({
        name: rule.name,
        isActive: rule.isActive,
        weight: Number(rule.weight),
      }));
      setRules(mapped);
    }

    setLoading(false);
  }, [address, statusData, incidentsData, rulesData]);

  const refresh = async () => {
    await Promise.all([
      refetchStatus(),
      refetchIncidents(),
      refetchRules(),
    ]);
  };

  return {
    status,
    incidents,
    rules,
    loading,
    refresh,
  };
}
