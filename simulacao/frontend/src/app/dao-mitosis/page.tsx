'use client';

import { DAOStatusCard, MitosisVoting, DAOGenealogyTree } from '@/components/DAOMitosis';
import { useState } from 'react';
import Link from 'next/link';

// Endereço do contrato DAOMitosis (deve ser configurado via env)
const DAO_MITOSIS_ADDRESS = (process.env.NEXT_PUBLIC_DAO_MITOSIS_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export default function DAOMitosisPage() {
  const [daoId, setDaoId] = useState<bigint>(1n);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back to Cybersyn Button */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Voltar ao Cybersyn 2.0</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Sistema de Mitose da DAO
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Gestão automática de crescimento organizacional baseada nos limites de Dunbar.
            Quando uma DAO atinge 500 membros, inicia-se um processo democrático de divisão.
          </p>
        </div>

        {/* DAO Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecionar DAO
          </label>
          <div className="flex space-x-4">
            <input
              type="number"
              value={daoId.toString()}
              onChange={(e) => setDaoId(BigInt(e.target.value || 1))}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="ID da DAO"
              min="1"
            />
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* DAO Status */}
            <DAOStatusCard 
              daoId={daoId}
              daoMitosisAddress={DAO_MITOSIS_ADDRESS}
            />

            {/* Mitosis Voting */}
            <MitosisVoting
              daoId={daoId}
              daoMitosisAddress={DAO_MITOSIS_ADDRESS}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Genealogy Tree */}
            <DAOGenealogyTree
              daoId={daoId}
              daoMitosisAddress={DAO_MITOSIS_ADDRESS}
            />

            {/* Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">📚</span>
                Sobre o Artigo 5º-C
              </h3>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Limite de Dunbar:</strong> Pesquisas mostram que grupos humanos funcionam melhor
                  com até 150 membros (Dunbar clássico). Adotamos 500 como limite para DAOs.
                </p>
                <p>
                  <strong>Mitose Organizacional:</strong> Quando o limite é atingido, a DAO se divide
                  democraticamente em duas organizações filhas, mantendo a coesão social.
                </p>
                <p>
                  <strong>Critérios de Divisão:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Afinidade:</strong> Grupos de interesse</li>
                  <li><strong>Cognitivo:</strong> Áreas de expertise</li>
                  <li><strong>Aleatório:</strong> Máxima diversidade</li>
                  <li><strong>Temporal:</strong> Veteranos vs novatos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-2xl mr-2">🛡️</span>
            Proteções de Segurança
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Rate Limiting
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                Máximo de 10 operações por bloco e 50 por janela de 5 minutos para prevenir spam.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Cooldown
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                1 hora de espera entre adicionar e remover o mesmo membro, evitando flip-flop.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Detecção de Ataques
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Sistema monitora padrões suspeitos e emite alertas para administradores.
              </p>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            DAOMitosis Contract: {DAO_MITOSIS_ADDRESS === '0x0000000000000000000000000000000000000000' ? (
              <span className="text-red-500 font-semibold">NOT CONFIGURED</span>
            ) : (
              <code className="font-mono">{DAO_MITOSIS_ADDRESS}</code>
            )}
          </p>
          {DAO_MITOSIS_ADDRESS === '0x0000000000000000000000000000000000000000' && (
            <p className="text-xs text-red-500 mt-2">
              Configure NEXT_PUBLIC_DAO_MITOSIS_ADDRESS no .env.local
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
