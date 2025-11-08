'use client';

import { useAccount } from 'wagmi';
import { useWalletRecovery } from '@/hooks/useWalletRecovery';
import { useState } from 'react';

const PROOF_TYPES = [
  { id: 0, name: 'Biométrico', weight: '90-100%' },
  { id: 1, name: 'Dispositivo', weight: '85-95%' },
  { id: 2, name: 'Documento', weight: '80-90%' },
  { id: 3, name: 'Email', weight: '70-80%' },
  { id: 4, name: 'Telefone', weight: '70-80%' },
  { id: 5, name: 'Localização', weight: '60-70%' },
  { id: 6, name: 'Social', weight: '50-60%' },
  { id: 7, name: 'Histórico', weight: '40-50%' },
];

export default function RecoveryPanel() {
  const { address } = useAccount();
  const { status, loading, initiateRecovery, submitProof, executeRecovery, isInitiating, isSubmitting, isExecuting } = useWalletRecovery(address);
  
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [selectedProofType, setSelectedProofType] = useState(0);
  const [proofData, setProofData] = useState('');

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

  const handleInitiate = () => {
    if (address && newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      initiateRecovery(address, newWalletAddress as `0x${string}`);
    }
  };

  const handleSubmitProof = () => {
    if (address && proofData) {
      // Simple hash of proof data (in production, use proper hashing)
      const proofHash = `0x${proofData.padEnd(64, '0')}` as `0x${string}`;
      submitProof(address, selectedProofType, proofHash);
      setProofData('');
    }
  };

  const handleExecute = () => {
    if (address) {
      executeRecovery(address);
    }
  };

  const canExecute = status?.isActive && 
                      status.guardiansVoted >= status.guardiansRequired &&
                      status.totalScore >= 80 &&
                      status.executionTime > 0 &&
                      Date.now() / 1000 >= status.executionTime;

  const timeUntilExecution = status?.executionTime 
    ? Math.max(0, status.executionTime - Date.now() / 1000)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Recuperação de Carteira</h2>

      {!status?.isActive ? (
        // Initiate Recovery
        <div>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold mb-2">ℹ️ Como Funciona</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Inicie a recuperação informando a nova carteira</li>
              <li>• Submeta provas de identidade (mínimo 80 pontos)</li>
              <li>• Guardiões votam na aprovação (quorum 2/3)</li>
              <li>• Aguarde 72h para contestação</li>
              <li>• Execute a recuperação e transfira os tokens</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova Carteira (destino)
              </label>
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleInitiate}
              disabled={isInitiating || !newWalletAddress.match(/^0x[a-fA-F0-9]{40}$/)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
            >
              {isInitiating ? 'Iniciando...' : 'Iniciar Recuperação'}
            </button>
          </div>
        </div>
      ) : (
        // Active Recovery
        <div className="space-y-6">
          {/* Status */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">🔄 Recuperação em Andamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Nova Carteira</p>
                <p className="font-mono text-sm">{status.newWallet.slice(0, 10)}...{status.newWallet.slice(-8)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">Provas Submetidas</p>
                <p className="text-xl font-bold">{status.proofsSubmitted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">Pontuação Total</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-xl font-bold ${status.totalScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {status.totalScore}
                  </p>
                  <span className="text-sm text-gray-600 dark:text-gray-500">/ 80 mínimo</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">Votos dos Guardiões</p>
                <p className="text-xl font-bold">
                  {status.guardiansVoted} / {status.guardiansRequired}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Proof */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Submeter Prova</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Prova
                </label>
                <select
                  value={selectedProofType}
                  onChange={(e) => setSelectedProofType(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {PROOF_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.weight})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dados da Prova (Hash)
                </label>
                <input
                  type="text"
                  value={proofData}
                  onChange={(e) => setProofData(e.target.value)}
                  placeholder="Digite o hash da prova..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleSubmitProof}
                disabled={isSubmitting || !proofData}
                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {isSubmitting ? 'Submetendo...' : 'Submeter Prova'}
              </button>
            </div>
          </div>

          {/* Execute Recovery */}
          {status.totalScore >= 80 && status.guardiansVoted >= status.guardiansRequired && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Executar Recuperação</h3>
              {timeUntilExecution > 0 ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
                  <p className="text-blue-800 dark:text-blue-200">
                    ⏳ Período de contestação: {Math.ceil(timeUntilExecution / 3600)} horas restantes
                  </p>
                </div>
              ) : canExecute ? (
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 font-semibold text-lg"
                >
                  {isExecuting ? 'Executando...' : '✅ Executar Recuperação'}
                </button>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <p className="text-gray-700 dark:text-gray-400">Requisitos ainda não atendidos</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
