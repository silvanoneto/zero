/**
 * @fileoverview Hook para votação em propostas com integração P2P
 * @module hooks/useVote
 */

import { useState } from 'react';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useP2P } from './useP2P';

export type VoteSupport = 'FOR' | 'AGAINST';

export interface VoteParams {
  proposalId: number;
  support: VoteSupport;
  weight: bigint;
}

export function useVote() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const { 
    isConnected: p2pConnected, 
    publishVote 
  } = useP2P({ autoConnect: true });

  const [voteData, setVoteData] = useState<VoteParams | null>(null);

  const vote = async (proposalId: number, support: VoteSupport, weight?: bigint) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    // TODO: Substituir com endereço real do contrato de governança
    const GOVERNANCE_CONTRACT = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT || '0x0000000000000000000000000000000000000000';

    try {
      // Peso padrão é 1e18 (1 token)
      const voteWeight = weight || BigInt(1e18);
      
      // Armazena dados do voto para publicação P2P posterior
      setVoteData({ proposalId, support, weight: voteWeight });

      // Envia transação para blockchain
      const tx = await writeContractAsync({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: [
          {
            name: 'vote',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'proposalId', type: 'uint256' },
              { name: 'support', type: 'bool' }, // true = FOR, false = AGAINST
              { name: 'weight', type: 'uint256' }
            ],
            outputs: []
          }
        ],
        functionName: 'vote',
        args: [BigInt(proposalId), support === 'FOR', voteWeight],
      });

      return tx;
    } catch (err) {
      console.error('Error voting:', err);
      setVoteData(null);
      throw err;
    }
  };

  // Publica voto no P2P após confirmação na blockchain
  const publishVoteToP2P = async () => {
    if (!voteData || !hash || !p2pConnected) return false;

    try {
      const voteP2PData = {
        hash,
        proposalId: voteData.proposalId,
        support: voteData.support,
        weight: voteData.weight.toString(),
        voter: address,
        chainId,
        timestamp: Date.now()
      };

      const success = await publishVote(voteP2PData);
      
      if (success) {
        console.log('✅ Voto publicado na rede P2P');
      } else {
        console.warn('⚠️ Falha ao publicar voto no P2P');
      }

      return success;
    } catch (err) {
      console.error('❌ Erro ao publicar voto no P2P:', err);
      return false;
    }
  };

  return {
    vote,
    publishVoteToP2P,
    isVoting: isPending || isConfirming,
    isConfirming,
    isSuccess,
    error,
    hash,
    voteData,
    p2pConnected,
  };
}
