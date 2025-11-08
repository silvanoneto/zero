import { useQuery } from '@tanstack/react-query';
import { LocalStorageAdapter, StoredProposal } from './useLocalStorage';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/constituicao-2-0';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  ipfsHash: string;
  proposer: string;
  voteType: string;
  startTime: number;
  endTime: number;
  votesFor: bigint;
  votesAgainst: bigint;
  totalVoters: number;
  state: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED';
}

const PROPOSALS_QUERY = `
  query GetProposals($state: String, $first: Int, $skip: Int) {
    proposals(
      first: $first
      skip: $skip
      orderBy: startTime
      orderDirection: desc
      where: { state: $state }
    ) {
      id
      title
      ipfsHash
      proposer
      voteType
      startTime
      endTime
      votesFor
      votesAgainst
      totalVoters
      state
    }
  }
`;

interface UseProposalsOptions {
  state?: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXPIRED';
  first?: number;
  skip?: number;
}

export function useProposals(options: UseProposalsOptions = {}) {
  const { state, first = 100, skip = 0 } = options;

  return useQuery({
    queryKey: ['proposals', state, first, skip],
    queryFn: async () => {
      // Modo demo: usa localStorage
      if (DEMO_MODE) {
        // Inicializa dados demo se necessário
        if (typeof window !== 'undefined') {
          LocalStorageAdapter.initializeDemoData();
        }

        const storedProposals = LocalStorageAdapter.getProposals();
        
        // Filtra por estado se especificado
        let filtered = storedProposals;
        if (state) {
          filtered = storedProposals.filter(p => p.state === state);
        }

        // Aplica skip e first (paginação)
        const paginated = filtered.slice(skip, skip + first);

        // Converte para o formato esperado
        return paginated.map((p: StoredProposal) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          ipfsHash: p.ipfsHash,
          proposer: p.proposer,
          voteType: p.voteType,
          startTime: p.startTime,
          endTime: p.endTime,
          votesFor: BigInt(p.votesFor),
          votesAgainst: BigInt(p.votesAgainst),
          totalVoters: p.totalVoters,
          state: p.state,
        }));
      }

      // Modo produção: usa subgraph
      try {
        const response = await fetch(SUBGRAPH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: PROPOSALS_QUERY,
            variables: {
              state,
              first,
              skip,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch proposals from subgraph');
        }

        const result = await response.json();

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error('GraphQL query failed');
        }

        const proposals: Proposal[] = result.data?.proposals || [];

        // Converter dados do subgraph para o formato esperado pelo componente
        return proposals.map(p => ({
          id: parseInt(p.id as any),
          title: p.title || `Proposta #${p.id}`,
          description: `Proposta #${p.id}`, // TODO: Buscar descrição do IPFS/Helia usando ipfsHash
          ipfsHash: p.ipfsHash,
          proposer: p.proposer,
          voteType: p.voteType,
          startTime: parseInt((p as any).startTime) * 1000, // Converter para timestamp JS
          endTime: parseInt((p as any).endTime) * 1000, // Converter para timestamp JS
          votesFor: BigInt((p as any).votesFor || '0'),
          votesAgainst: BigInt((p as any).votesAgainst || '0'),
          totalVoters: p.totalVoters || 0,
          state: p.state,
        }));
      } catch (error) {
        console.error('Error fetching proposals:', error);
        // Retorna array vazio em caso de erro ao invés de falhar
        return [];
      }
    },
    staleTime: 10000, // 10 segundos
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}
