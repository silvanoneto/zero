'use client';

import { useAccount } from 'wagmi';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { useEffect } from 'react';

export default function FraudMonitor() {
  const { address } = useAccount();
  const { status, incidents, rules, loading, refresh } = useFraudDetection(address);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'red';
    if (score >= 40) return 'orange';
    if (score >= 20) return 'yellow';
    return 'green';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'Alto';
    if (score >= 40) return 'Médio';
    if (score >= 20) return 'Baixo';
    return 'Mínimo';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Monitor de Fraude</h2>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Status Card */}
      {status && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">Score de Risco</p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold text-${getRiskColor(status.riskScore)}-600 dark:text-${getRiskColor(status.riskScore)}-400`}>
                  {status.riskScore}
                </p>
                <span className={`px-2 py-1 bg-${getRiskColor(status.riskScore)}-100 dark:bg-${getRiskColor(status.riskScore)}-900/30 text-${getRiskColor(status.riskScore)}-800 dark:text-${getRiskColor(status.riskScore)}-400 text-xs rounded-full`}>
                  {getRiskLabel(status.riskScore)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">Status</p>
              <p className={`text-lg font-semibold ${status.isBlocked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {status.isBlocked ? '🔒 Bloqueado' : '✅ Ativo'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">Ações (24h)</p>
              <p className="text-2xl font-bold">{status.actionCount24h}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">Última Ação</p>
              <p className="text-sm">
                {status.lastActionTime > 0 
                  ? new Date(status.lastActionTime * 1000).toLocaleString('pt-BR')
                  : 'Nenhuma'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detection Rules */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Regras de Detecção</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${
                rule.isActive 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-400">Peso: {rule.weight} pontos</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  rule.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Incidentes Recentes</h3>
        {incidents.length === 0 ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-200">✅ Nenhum incidente detectado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.map((incident, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  incident.wasBlocked
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{incident.wasBlocked ? '🚫' : '⚠️'}</span>
                      <p className="font-medium">{incident.reason}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {new Date(incident.timestamp * 1000).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700 dark:text-gray-400">Score</p>
                    <p className={`text-lg font-bold text-${getRiskColor(incident.riskScore)}-600 dark:text-${getRiskColor(incident.riskScore)}-400`}>
                      {incident.riskScore}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
