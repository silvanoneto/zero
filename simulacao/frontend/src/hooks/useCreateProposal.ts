'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress } from '../contracts/addresses';
import { FEDERATION_VOTING_ABI } from '../contracts/abis';
import { LocalStorageAdapter } from './useLocalStorage';
import { useState } from 'react';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type VoteType = 'LINEAR' | 'QUADRATIC' | 'LOGARITHMIC' | 'CONSENSUS';

interface ProposalTags {
  isProcedural: boolean;
  isResourceAllocation: boolean;
  isTechnical: boolean;
  isEthical: boolean;
  budgetImpact: bigint;
  requiresExpertise: boolean;
  expertDomain: `0x${string}`;
}

export function useCreateProposal() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState<Error | null>(null);
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProposal = async (
    title: string,
    description: string,
    voteType: VoteType,
    chainId: number = 31337
  ) => {
    try {
      // Modo demo: salva no localStorage
      if (DEMO_MODE) {
        setDemoError(null);
        setDemoSuccess(false);

        const tags = mapVoteTypeToTags(voteType);
        const content = JSON.stringify({ title, description });
        const ipfsHash = await uploadToIPFS(content);
        
        const now = Date.now();
        const duration = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

        LocalStorageAdapter.saveProposal({
          title,
          description,
          ipfsHash,
          proposer: '0xDemoUser000000000000000000000000000000000',
          voteType,
          startTime: now,
          endTime: now + duration,
          votesFor: '0',
          votesAgainst: '0',
          totalVoters: 0,
          state: 'ACTIVE',
          tags: {
            isProcedural: tags.isProcedural,
            isResourceAllocation: tags.isResourceAllocation,
            isTechnical: tags.isTechnical,
            isEthical: tags.isEthical,
            budgetImpact: tags.budgetImpact.toString(),
            requiresExpertise: tags.requiresExpertise,
          },
        });

        // Simula delay de transação
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDemoSuccess(true);
        return;
      }

      // Modo produção: usa smart contract
      const tags = mapVoteTypeToTags(voteType);
      const content = JSON.stringify({ title, description });
      const ipfsHash = await uploadToIPFS(content);
      
      // Duração padrão de 7 dias
      const duration = BigInt(7 * 24 * 60 * 60); // 7 days in seconds
      
      const contractAddress = getContractAddress('FederationVoting', chainId);
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: FEDERATION_VOTING_ABI,
        functionName: 'createProposal',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: [title, ipfsHash, tags, duration] as any,
      });
    } catch (err) {
      console.error('Error creating proposal:', err);
      if (DEMO_MODE) {
        setDemoError(err as Error);
      }
      throw err;
    }
  };

  return {
    createProposal,
    isPending: DEMO_MODE ? false : isPending,
    isConfirming: DEMO_MODE ? false : isConfirming,
    isSuccess: DEMO_MODE ? demoSuccess : isSuccess,
    error: DEMO_MODE ? demoError : error,
    hash: DEMO_MODE ? undefined : hash,
  };
}

// Mapeia tipo de votação para tags do contrato
function mapVoteTypeToTags(voteType: VoteType): ProposalTags {
  const baseTag: ProposalTags = {
    isProcedural: false,
    isResourceAllocation: false,
    isTechnical: false,
    isEthical: false,
    budgetImpact: BigInt(0),
    requiresExpertise: false,
    expertDomain: '0x0000000000000000000000000000000000000000000000000000000000000000',
  };

  switch (voteType) {
    case 'LINEAR':
      return { ...baseTag, isProcedural: true };
    case 'QUADRATIC':
      return { ...baseTag, isResourceAllocation: true, budgetImpact: BigInt(1000) };
    case 'LOGARITHMIC':
      return { ...baseTag, isTechnical: true, requiresExpertise: true };
    case 'CONSENSUS':
      return { ...baseTag, isEthical: true };
    default:
      return baseTag;
  }
}

/**
 * Simulates IPFS upload (TODO: implement real IPFS integration with Helia)
 * For now, generates a deterministic hash based on content
 */
async function uploadToIPFS(content: string): Promise<string> {
  try {
    // TODO: Replace with actual Helia IPFS upload
    // import { createHelia } from 'helia';
    // import { unixfs } from '@helia/unixfs';
    // const helia = await createHelia();
    // const fs = unixfs(helia);
    // const encoder = new TextEncoder();
    // const cid = await fs.addBytes(encoder.encode(content));
    // return cid.toString();
    
    // Simulated IPFS hash using SHA-256
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `Qm${hashHex.substring(0, 44)}`; // Simulates IPFS CID format
  } catch (error) {
    console.error('Error simulating IPFS upload:', error);
    throw new Error('Failed to generate content hash');
  }
}
