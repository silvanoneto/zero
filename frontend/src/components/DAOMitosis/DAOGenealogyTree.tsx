'use client';

import { useReadContract } from 'wagmi';
import { useState } from 'react';

interface DAOGenealogy {
  id: bigint;
  name: string;
  activeMemberCount: number;
  status: number;
  parentDaoId: bigint;
  generationLevel: number;
  childDaoIds: bigint[];
}

interface DAOGenealogyTreeProps {
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
}

const STATUS_EMOJI = {
  0: '✅', // ACTIVE
  1: '⚠️', // WARNING
  2: '🗳️', // MITOSIS_VOTE
  3: '🔄', // SPLITTING
  4: '📚', // LEGACY
};

export default function DAOGenealogyTree({ daoId, daoMitosisAddress }: DAOGenealogyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([daoId.toString()]));

  // Lê dados da DAO
  const { data: daoData } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'daos',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [
          { name: 'id', type: 'uint256' },
          { name: 'daoAddress', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'activeMemberCount', type: 'uint256' },
          { name: 'totalMemberCount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'parentDaoId', type: 'uint256' },
          { name: 'generationLevel', type: 'uint256' },
          { name: 'metadataIPFS', type: 'string' },
        ],
      },
    ] as const,
    functionName: 'daos',
    args: [daoId],
  });

  // Lê IDs das DAOs filhas
  const { data: childIds } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'getChildDAOs',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256[]' }],
      },
    ] as const,
    functionName: 'getChildDAOs',
    args: [daoId],
  });

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  if (!daoData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const [id, daoAddress, name, createdAt, activeMemberCount, totalMemberCount, status, parentDaoId, generationLevel] = daoData;
  const hasChildren = childIds && childIds.length > 0;
  const isExpanded = expandedNodes.has(daoId.toString());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🌳 Genealogia da DAO
      </h2>

      {/* Tree View */}
      <div className="space-y-2">
        {/* Current DAO */}
        <div className="flex items-start space-x-3">
          {hasChildren && (
            <button
              onClick={() => toggleNode(daoId.toString())}
              className="mt-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="w-5"></span>}
          
          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{STATUS_EMOJI[status as keyof typeof STATUS_EMOJI]}</span>
                <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Gen {Number(generationLevel)}
                </span>
              </div>
              <button
                onClick={() => window.location.href = `/dao/${daoId}`}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver →
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Number(activeMemberCount)} membros ativos
            </div>
          </div>
        </div>

        {/* Child DAOs */}
        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
            {childIds.map((childId) => (
              <ChildDAONode
                key={childId.toString()}
                daoId={childId}
                daoMitosisAddress={daoMitosisAddress}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Parent Link */}
      {parentDaoId > 0n && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => window.location.href = `/dao/${parentDaoId}`}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-2"
          >
            <span>↑</span>
            <span>Ver DAO Mãe</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Componente recursivo para nós filhos
function ChildDAONode({
  daoId,
  daoMitosisAddress,
  expandedNodes,
  toggleNode,
}: {
  daoId: bigint;
  daoMitosisAddress: `0x${string}`;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
}) {
  const { data: daoData } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'daos',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [
          { name: 'id', type: 'uint256' },
          { name: 'daoAddress', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'activeMemberCount', type: 'uint256' },
          { name: 'totalMemberCount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'parentDaoId', type: 'uint256' },
          { name: 'generationLevel', type: 'uint256' },
          { name: 'metadataIPFS', type: 'string' },
        ],
      },
    ] as const,
    functionName: 'daos',
    args: [daoId],
  });

  const { data: childIds } = useReadContract({
    address: daoMitosisAddress,
    abi: [
      {
        name: 'getChildDAOs',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_daoId', type: 'uint256' }],
        outputs: [{ name: '', type: 'uint256[]' }],
      },
    ] as const,
    functionName: 'getChildDAOs',
    args: [daoId],
  });

  if (!daoData) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  const [id, daoAddress, name, createdAt, activeMemberCount, totalMemberCount, status, parentDaoId, generationLevel] = daoData;
  const hasChildren = childIds && childIds.length > 0;
  const isExpanded = expandedNodes.has(daoId.toString());

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        {hasChildren && (
          <button
            onClick={() => toggleNode(daoId.toString())}
            className="mt-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-5"></span>}
        
        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{STATUS_EMOJI[status as keyof typeof STATUS_EMOJI]}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{name}</h4>
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                Gen {Number(generationLevel)}
              </span>
            </div>
            <button
              onClick={() => window.location.href = `/dao/${daoId}`}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver →
            </button>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {Number(activeMemberCount)} membros
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-8 space-y-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
          {childIds.map((childId) => (
            <ChildDAONode
              key={childId.toString()}
              daoId={childId}
              daoMitosisAddress={daoMitosisAddress}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
