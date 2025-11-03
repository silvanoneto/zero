'use client';

import { Users, FileText, TrendingUp, Shield } from 'lucide-react';
import { useGovernanceStats } from '@/hooks/useGovernanceStats';

export function VotingStats() {
  const { data: stats, isLoading, error } = useGovernanceStats();

  // Mostrar skeleton enquanto carrega
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-effect rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-red-200/50 dark:border-red-700/50">
        <p className="text-red-600 dark:text-red-400">
          Erro ao carregar estatísticas. Verifique se o subgraph está rodando.
        </p>
      </div>
    );
  }

  const totalVotingPowerFormatted = stats?.totalVotingPower 
    ? (BigInt(stats.totalVotingPower) / BigInt(10 ** 18)).toString()
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Proposals */}
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</span>
        </div>
        <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-1">
          {stats?.totalProposals || 0}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">Propostas criadas</p>
      </div>

      {/* Active Proposals */}
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Ativas</span>
        </div>
        <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent mb-1">
          {stats?.activeProposals || 0}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">Em votação agora</p>
      </div>

      {/* Total Voters */}
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Votantes</span>
        </div>
        <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-1">
          {(stats?.totalVoters || 0).toLocaleString()}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">Participantes únicos</p>
      </div>

      {/* Total Voting Power */}
      <div className="glass-effect rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Poder</span>
        </div>
        <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent mb-1">
          {(Number(totalVotingPowerFormatted) / 1e6).toFixed(2)}M
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-400 font-medium">IDS em circulação</p>
      </div>
    </div>
  );
}
