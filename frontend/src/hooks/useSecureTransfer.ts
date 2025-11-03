import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { SOVEREIGN_WALLET_ABI } from '@/contracts/abis';
import { SOVEREIGN_WALLET_ADDRESS } from '@/contracts/addresses';

export interface TransferParams {
  to: `0x${string}`;
  amount: bigint;
  biometricHash?: `0x${string}`;
  geolocation?: string;
  deviceFingerprint?: `0x${string}`;
}

export function useSecureTransfer() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContract, isSuccess, data: hash } = useWriteContract();

  const transfer = async (params: TransferParams) => {
    setIsPending(true);
    setError(null);

    try {
      // Default values for optional parameters
      const biometricHash = params.biometricHash || '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;
      const geolocation = params.geolocation || '';
      const deviceFingerprint = params.deviceFingerprint || '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

      writeContract({
        address: SOVEREIGN_WALLET_ADDRESS,
        abi: SOVEREIGN_WALLET_ABI,
        functionName: 'secureTransfer',
        args: [params.to, params.amount, biometricHash, geolocation, deviceFingerprint],
      });
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsPending(false);
    }
  };

  return {
    transfer,
    isPending,
    isSuccess,
    error,
    hash,
  };
}
