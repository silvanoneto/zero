'use client';

import { useMemo } from 'react';
import { TrendingDown, Users, Scale, AlertCircle } from 'lucide-react';

interface Vote {
  voter: string;
  support: boolean;
  weight: bigint;
}

interface Proposal {
  id: string;
  title: string;
  voteType: 'LINEAR' | 'QUADRATIC' | 'LOGARITHMIC' | 'CONSENSUS';
  votes: Vote[];
  votesFor: bigint;
  votesAgainst: bigint;
}

interface PlutonimiaMetricsProps {
  proposals: Proposal[];
}

export function PlutonimiaMetrics({ proposals }: PlutonimiaMetricsProps) {
  const metrics = useMemo(() => {
    if (!proposals || proposals.length === 0) {
      return {
        plutonimiaIndex: 0,
        giniCoefficient: 0,
        topVoterConcentration: 0,
        averageVoteEquality: 0,
      };
    }

    // Calcula métricas agregadas de todas as propostas
    let totalPlutonomyReduction = 0;
    let totalGini = 0;
    let totalConcentration = 0;
    let totalEquality = 0;
    let validProposals = 0;

    proposals.forEach((proposal) => {
      if (!proposal.votes || proposal.votes.length === 0) return;

      // Ordena votos por peso (maior para menor)
      const sortedVotes = [...proposal.votes].sort((a, b) => {
        const weightA = Number(a.weight);
        const weightB = Number(b.weight);
        return weightB - weightA;
      });

      const totalWeight = sortedVotes.reduce((sum, v) => sum + Number(v.weight), 0);
      
      if (totalWeight === 0) return;

      // 1. Índice de Plutonomia (quão igualitário é o sistema)
      // Mede a diferença entre o maior e a média
      const maxWeight = Number(sortedVotes[0].weight);
      const avgWeight = totalWeight / sortedVotes.length;
      const plutonomyRatio = maxWeight / avgWeight;
      
      // Score invertido: quanto menor o ratio, melhor (mais igualitário)
      // Normaliza para 0-100 (100 = perfeita igualdade)
      const plutonomyScore = Math.max(0, 100 - (plutonomyRatio - 1) * 10);
      totalPlutonomyReduction += plutonomyScore;

      // 2. Coeficiente de Gini (desigualdade de distribuição)
      // 0 = perfeita igualdade, 1 = máxima desigualdade
      let gini = 0;
      let sumOfDifferences = 0;
      
      for (let i = 0; i < sortedVotes.length; i++) {
        for (let j = 0; j < sortedVotes.length; j++) {
          sumOfDifferences += Math.abs(Number(sortedVotes[i].weight) - Number(sortedVotes[j].weight));
        }
      }
      
      if (sortedVotes.length > 1) {
        gini = sumOfDifferences / (2 * sortedVotes.length * totalWeight);
      }
      
      totalGini += (1 - gini) * 100; // Inverte para que 100 = igualitário

      // 3. Concentração dos Top 10% de votantes
      const top10Count = Math.max(1, Math.floor(sortedVotes.length * 0.1));
      const top10Weight = sortedVotes
        .slice(0, top10Count)
        .reduce((sum, v) => sum + Number(v.weight), 0);
      const top10Percentage = (top10Weight / totalWeight) * 100;
      
      // Score invertido: quanto menor a concentração, melhor
      const concentrationScore = Math.max(0, 100 - top10Percentage);
      totalConcentration += concentrationScore;

      // 4. Igualdade Média de Voto (distância da média)
      const deviations = sortedVotes.map(v => 
        Math.abs(Number(v.weight) - avgWeight) / avgWeight
      );
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      const equalityScore = Math.max(0, 100 - avgDeviation * 100);
      totalEquality += equalityScore;

      validProposals++;
    });

    if (validProposals === 0) {
      return {
        plutonimiaIndex: 0,
        giniCoefficient: 0,
        topVoterConcentration: 0,
        averageVoteEquality: 0,
      };
    }

    return {
      plutonimiaIndex: Math.round(totalPlutonomyReduction / validProposals),
      giniCoefficient: Math.round(totalGini / validProposals),
      topVoterConcentration: Math.round(totalConcentration / validProposals),
      averageVoteEquality: Math.round(totalEquality / validProposals),
    };
  }, [proposals]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const overallScore = Math.round(
    (metrics.plutonimiaIndex + 
     metrics.giniCoefficient + 
     metrics.topVoterConcentration + 
     metrics.averageVoteEquality) / 4
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Métricas de Plutonomia
        </h2>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-400 mb-6">
        Análise da distribuição de poder de voto no sistema. Quanto mais próximo de 100, mais igualitário.
      </p>

      {/* Overall Score */}
      <div className={`mb-6 p-4 rounded-lg ${getScoreBgColor(overallScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Índice Geral de Igualdade
            </p>
            <p className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </p>
          </div>
          <div className="text-4xl">
            {overallScore >= 80 ? '🎉' : overallScore >= 60 ? '✅' : overallScore >= 40 ? '⚠️' : '🚨'}
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plutonimia Index */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Índice Anti-Plutonomia
            </h3>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(metrics.plutonimiaIndex)}`}>
            {metrics.plutonimiaIndex}/100
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
            Mede a redução de poder de grandes holders
          </p>
        </div>

        {/* Gini Coefficient */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Coeficiente de Gini Invertido
            </h3>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(metrics.giniCoefficient)}`}>
            {metrics.giniCoefficient}/100
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
            Desigualdade de distribuição (100 = igualitário)
          </p>
        </div>

        {/* Top Voter Concentration */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Desconcentração Top 10%
            </h3>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(metrics.topVoterConcentration)}`}>
            {metrics.topVoterConcentration}/100
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
            Quanto poder os maiores votantes NÃO têm
          </p>
        </div>

        {/* Average Vote Equality */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Igualdade Média de Voto
            </h3>
          </div>
          <p className={`text-2xl font-bold ${getScoreColor(metrics.averageVoteEquality)}`}>
            {metrics.averageVoteEquality}/100
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
            Proximidade à média (desvio padrão)
          </p>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📊 Como Interpretar
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>80-100:</strong> Sistema altamente igualitário ✅</li>
          <li>• <strong>60-79:</strong> Boa distribuição de poder ⚖️</li>
          <li>• <strong>40-59:</strong> Concentração moderada ⚠️</li>
          <li>• <strong>0-39:</strong> Plutonomia detectada 🚨</li>
        </ul>
      </div>

      {/* Vote Type Distribution */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Distribuição por Tipo de Votação
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {['LINEAR', 'QUADRATIC', 'LOGARITHMIC', 'CONSENSUS'].map((type) => {
            const count = proposals.filter(p => p.voteType === type).length;
            const percentage = proposals.length > 0 ? Math.round((count / proposals.length) * 100) : 0;
            
            return (
              <div key={type} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {type === 'LINEAR' && 'Linear'}
                  {type === 'QUADRATIC' && 'Quadrática'}
                  {type === 'LOGARITHMIC' && 'Logarítmica'}
                  {type === 'CONSENSUS' && 'Consenso'}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({count})
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
