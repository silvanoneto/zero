'use client';

import { useAccount } from 'wagmi';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useSovereignWallet } from '@/hooks/useSovereignWallet';

export function SecurityDashboard() {
  const { address } = useAccount();
  const { status, health, stats, loading } = useSovereignWallet(address);

  if (!address) {
    return (
      <div className="glass-panel p-6 text-center">
        <Shield className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-400">
          Conecte sua carteira para ver o status de segurança
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (status?.isBlocked) return 'red';
    if (status?.status === 'Quarantine') return 'orange';
    if (status?.status === 'Monitoring') return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    if (status?.isBlocked) return <XCircle className="w-6 h-6" />;
    if (status?.status === 'Quarantine') return <AlertTriangle className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  const getHealthColor = () => {
    if (health >= 90) return 'green';
    if (health >= 70) return 'yellow';
    if (health >= 50) return 'orange';
    return 'red';
  };

  const statusColor = getStatusColor();
  const healthColor = getHealthColor();

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-rgb flex items-center gap-2">
            <Shield className="w-7 h-7" />
            Carteira Soberana
          </h2>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${statusColor}-100 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-400`}>
            {getStatusIcon()}
            <span className="font-semibold">
              {status?.isBlocked ? 'Bloqueada' : status?.status || 'Ativa'}
            </span>
          </div>
        </div>

        {/* Risk Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
              Risk Score
            </span>
            <span className={`text-2xl font-bold text-${statusColor}-600 dark:text-${statusColor}-400`}>
              {status?.riskScore || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500`}
              style={{ width: `${Math.min((status?.riskScore || 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-600 dark:text-gray-500">
            <span>0 (Seguro)</span>
            <span>40 (Quarentena)</span>
            <span>70 (Bloqueio)</span>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Saúde da Carteira
          </h3>
          <span className={`text-3xl font-bold text-${healthColor}-600 dark:text-${healthColor}-400`}>
            {health || 0}<span className="text-lg">/100</span>
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full bg-gradient-to-r from-${healthColor}-400 to-${healthColor}-600 transition-all duration-500`}
            style={{ width: `${health || 0}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-700 dark:text-gray-400">Status:</span>
            <span className="ml-2 font-semibold">
              {health >= 90 ? '🟢 Excelente' : 
               health >= 70 ? '🟡 Bom' : 
               health >= 50 ? '🟠 Atenção' : 
               '🔴 Crítico'}
            </span>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-400">Ação:</span>
            <span className="ml-2 font-semibold">
              {health >= 90 ? 'Nada' : 
               health >= 70 ? 'Revisar' : 
               health >= 50 ? 'Aumentar segurança' : 
               'Imediata'}
            </span>
          </div>
        </div>
      </div>

      {/* Saldo */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Saldo SOB</h3>
        <div className="text-center">
          <div className="text-4xl font-bold gradient-rgb mb-2">
            {status?.balance ? parseFloat(status.balance).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '0'}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-400">
            Tokens Soberanos
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Transferências"
            value={stats?.totalTransfers || 0}
            icon="📤"
          />
          <StatCard
            label="Recebido"
            value={`${stats?.totalReceived || 0} SOB`}
            icon="📥"
          />
          <StatCard
            label="Enviado"
            value={`${stats?.totalSent || 0} SOB`}
            icon="💸"
          />
          <StatCard
            label="Incidentes"
            value={stats?.fraudIncidents || 0}
            icon={(stats?.fraudIncidents || 0) > 0 ? "⚠️" : "✅"}
            alert={(stats?.fraudIncidents || 0) > 0}
          />
        </div>
      </div>

      {/* Configurações de Segurança */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Configurações Ativas</h3>
        <div className="space-y-3">
          <ConfigItem
            label="Biometria Obrigatória"
            enabled={status?.config?.requireBiometric}
          />
          <ConfigItem
            label="Geolocalização"
            enabled={status?.config?.requireGeolocation}
          />
          <ConfigItem
            label="Auto-Bloqueio em Fraude"
            enabled={status?.config?.autoBlockOnFraud}
          />
          <ConfigItem
            label="Recuperação Habilitada"
            enabled={status?.config?.allowRecovery}
          />
        </div>
      </div>

      {/* Alertas */}
      {status?.isBlocked && (
        <div className="glass-panel p-6 border-2 border-red-500">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Carteira Bloqueada
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-400 mb-3">
                Sua carteira foi bloqueada automaticamente devido a atividade suspeita.
                Seus tokens estão seguros.
              </p>
              <button className="btn-primary text-sm">
                Iniciar Recuperação
              </button>
            </div>
          </div>
        </div>
      )}

      {status?.status === 'Quarantine' && (
        <div className="glass-panel p-6 border-2 border-orange-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                Carteira em Quarentena
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Atividade suspeita detectada. Transações grandes requerem confirmação
                adicional de outra carteira.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  alert = false 
}: { 
  label: string; 
  value: string | number; 
  icon: string;
  alert?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg ${alert ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-700 dark:text-gray-400">{label}</span>
      </div>
      <div className={`text-xl font-bold ${alert ? 'text-red-600 dark:text-red-400' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function ConfigItem({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div className={`flex items-center gap-2 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
        {enabled ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <span className="text-sm font-medium">{enabled ? 'Ativado' : 'Desativado'}</span>
      </div>
    </div>
  );
}
