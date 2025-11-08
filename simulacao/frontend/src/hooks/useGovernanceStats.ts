import { useQuery } from '@tanstack/react-query';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/constituicao-2-0';

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  totalVoters: number;
  totalVotingPower: string;
}

const STATS_QUERY = `
  query GovernanceStats {
    governanceStats(id: "governance") {
      totalProposals
      activeProposals
      totalVoters
      totalVotingPower
    }
  }
`;

// Fallback: query agregada se não houver entidade de stats
const AGGREGATE_QUERY = `
  query AggregateStats {
    proposals(first: 1000) {
      id
      status
    }
    votes(first: 1000) {
      voter
      votingPower
    }
  }
`;

async function fetchStats(): Promise<GovernanceStats> {
  try {
    // Tentar query de stats primeiro
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: STATS_QUERY }),
    });

    const { data, errors } = await response.json();

    if (errors || !data?.governanceStats) {
      // Fallback: calcular stats manualmente
      const aggResponse = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: AGGREGATE_QUERY }),
      });

      const { data: aggData } = await aggResponse.json();

      if (aggData) {
        const proposals = aggData.proposals || [];
        const votes = aggData.votes || [];

        // Contar propostas ativas (status: Active = 1)
        const activeProposals = proposals.filter(
          (p: any) => p.status === 'Active' || p.status === '1'
        ).length;

        // Contar votantes únicos
        const uniqueVoters = new Set(votes.map((v: any) => v.voter.toLowerCase()));

        // Somar voting power total
        const totalVotingPower = votes.reduce(
          (sum: bigint, v: any) => sum + BigInt(v.votingPower || 0),
          BigInt(0)
        );

        return {
          totalProposals: proposals.length,
          activeProposals,
          totalVoters: uniqueVoters.size,
          totalVotingPower: totalVotingPower.toString(),
        };
      }
    }

    // Se tiver dados de stats diretos
    if (data?.governanceStats) {
      return data.governanceStats;
    }

    // Fallback para dados mock se subgraph não estiver disponível
    return {
      totalProposals: 0,
      activeProposals: 0,
      totalVoters: 0,
      totalVotingPower: '0',
    };
  } catch (error) {
    console.error('Error fetching governance stats:', error);
    
    // Retornar dados zerados em caso de erro
    return {
      totalProposals: 0,
      activeProposals: 0,
      totalVoters: 0,
      totalVotingPower: '0',
    };
  }
}

export function useGovernanceStats() {
  return useQuery({
    queryKey: ['governance-stats'],
    queryFn: fetchStats,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 20000, // Considerar stale após 20 segundos
  });
}
