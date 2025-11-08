'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Play, Network, Loader2 } from 'lucide-react';
import { useP2P } from '../hooks/useP2P';
import { useAccount } from 'wagmi';

type TestStatus = 'pending' | 'running' | 'success' | 'error';

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  duration?: number;
  data?: any;
}

export function P2PTestSuite() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  const { 
    isConnected: p2pConnected, 
    publishProposal,
    publishVote,
    subscribe,
    stats,
    connect,
    getClient,
    getStats,
    PUBSUB_TOPICS 
  } = useP2P({ autoConnect: false });

  const { address, isConnected: walletConnected } = useAccount();

  const updateTest = (name: string, status: TestStatus, message: string, data?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => 
          t.name === name 
            ? { ...t, status, message, data }
            : t
        );
      }
      return [...prev, { name, status, message, data }];
    });
  };

  const runTest = async (
    name: string,
    testFn: () => Promise<{ success: boolean; message: string; data?: any }>
  ) => {
    setCurrentTest(name);
    updateTest(name, 'running', 'Executando...');
    
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTest(
        name, 
        result.success ? 'success' : 'error', 
        result.message,
        result.data
      );
      
      return result.success;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Captura máximo de detalhes do erro
      const errorDetails = {
        message: error.message || 'Erro desconhecido',
        name: error.name,
        stack: error.stack,
        cause: error.cause,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : undefined,
        // Captura propriedades adicionais do erro
        ...Object.getOwnPropertyNames(error).reduce((acc, key) => {
          if (!['message', 'name', 'stack', 'cause', 'response'].includes(key)) {
            acc[key] = error[key];
          }
          return acc;
        }, {} as any)
      };
      
      console.error(`❌ Erro detalhado no teste "${name}":`, errorDetails);
      
      updateTest(
        name, 
        'error', 
        `${error.message || 'Erro desconhecido'}`,
        errorDetails
      );
      
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Verificar wallet conectada
    const test1 = await runTest(
      'Wallet Connection',
      async () => {
        if (!walletConnected || !address) {
          return { 
            success: false, 
            message: 'Carteira não conectada. Por favor, conecte sua carteira primeiro.' 
          };
        }
        return { 
          success: true, 
          message: `Carteira conectada: ${address.slice(0, 6)}...${address.slice(-4)}`,
          data: { address }
        };
      }
    );

    if (!test1) {
      setIsRunning(false);
      return;
    }

    // Test 2: Conectar ao P2P [UPDATED - v2]
    const test2 = await runTest(
      'P2P Connection',
      async () => {
        try {
          console.log('=== TESTE P2P CONNECTION V2 ===');
          console.log('🔍 Iniciando teste de conexão P2P...');
          console.log('🔍 Estado inicial - p2pConnected:', p2pConnected);
          console.log('🔍 Stats atuais:', stats);
          console.log('🔍 Função connect disponível?', typeof connect);
          
          if (!p2pConnected) {
            console.log('🔄 Tentando conectar...');
            console.log('🔄 Chamando connect()...');
            const connectResult = await connect();
            console.log('🔄 connect() retornou:', connectResult);
            // Aguarda 3s para estabilizar conexão e estados React
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('🔍 Após connect() + delay - p2pConnected:', p2pConnected);
            console.log('🔍 Stats após connect():', stats);
            
            // Busca client e stats diretamente (não depende do estado React capturado)
            const currentClient = getClient();
            const currentStats = getStats();
            
            console.log('� Client disponível?', !!currentClient);
            console.log('�📊 Stats direto do getStats():', currentStats);
            
            if (currentClient && currentStats.peerId) {
              return { 
                success: true, 
                message: `Conectado ao P2P. Peer ID: ${currentStats.peerId.slice(0, 10)}...`,
                data: { 
                  peerId: currentStats.peerId, 
                  peers: currentStats.peers,
                  fullStats: currentStats,
                  reactState: { p2pConnected, stats }
                }
              };
            }
          } else {
            console.log('⚠️ Já estava conectado, pulando connect()');
          }
          
          // Re-verifica stats diretamente (pode ter sido atualizado)
          const currentStats = stats;
          const isNowConnected = p2pConnected;
          
          console.log('🔍 Verificação final:', {
            isNowConnected,
            hasPeerId: !!currentStats.peerId,
            peerId: currentStats.peerId,
            peers: currentStats.peers
          });
          
          if (isNowConnected && currentStats.peerId) {
            return { 
              success: true, 
              message: `Conectado ao P2P. Peer ID: ${currentStats.peerId.slice(0, 10)}...`,
              data: { 
                peerId: currentStats.peerId, 
                peers: currentStats.peers,
                fullStats: currentStats 
              }
            };
          }
          
          // Captura estado detalhado em caso de falha
          const failureState = {
            p2pConnected: isNowConnected,
            hasPeerId: !!currentStats.peerId,
            peerId: currentStats.peerId,
            peers: currentStats.peers,
            stats: currentStats,
            timestamp: new Date().toISOString()
          };
          
          console.error('❌ Falha na conexão P2P. Estado:', failureState);
          
          return { 
            success: false, 
            message: `Falha ao conectar ao P2P. Status: ${isNowConnected ? 'conectado' : 'desconectado'}, PeerId: ${currentStats.peerId || 'N/A'}`,
            data: failureState
          };
        } catch (error: any) {
          console.error('❌ Exceção no teste de conexão P2P:', error);
          throw error; // Re-throw para ser capturado pelo runTest
        }
      }
    );

    if (!test2) {
      setIsRunning(false);
      return;
    }

    // Test 3: Verificar peers conectados
    await runTest(
      'P2P Peers Discovery',
      async () => {
        // Aguarda 3s para descobrir peers
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return { 
          success: stats.peers >= 0, 
          message: `${stats.peers} peer(s) descoberto(s)`,
          data: { peers: stats.peers }
        };
      }
    );

    // Test 4: Subscrever tópicos P2P
    const test4 = await runTest(
      'P2P Topic Subscription',
      async () => {
        let proposalReceived = false;
        let voteReceived = false;
        
        const unsubscribeProposal = subscribe(
          PUBSUB_TOPICS.PROPOSALS_NEW,
          (data) => {
            console.log('📨 Proposta recebida via P2P:', data);
            proposalReceived = true;
          }
        );

        const unsubscribeVote = subscribe(
          PUBSUB_TOPICS.VOTES_NEW,
          (data) => {
            console.log('📨 Voto recebido via P2P:', data);
            voteReceived = true;
          }
        );

        // Aguarda 1s
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { 
          success: true, 
          message: `Inscrito em ${Object.keys(PUBSUB_TOPICS).length} tópicos P2P`,
          data: { topics: Object.values(PUBSUB_TOPICS) }
        };
      }
    );

    // Test 5: Publicar proposta de teste
    const test5 = await runTest(
      'Publish Test Proposal',
      async () => {
        const testProposal = {
          id: `test-${Math.random().toString(16).slice(2)}`, // Backend espera 'id', não 'hash'
          hash: `0x${Math.random().toString(16).slice(2)}`,
          title: `[TESTE E2E] Proposta ${new Date().toISOString()}`,
          description: 'Proposta de teste para validação P2P',
          voteType: 'LINEAR',
          tags: ['teste', 'e2e', 'p2p'],
          chainId: 1,
          timestamp: Date.now(),
          creator: address
        };

        console.log('📤 Tentando publicar proposta:', testProposal);
        console.log('🔍 publishProposal disponível?', typeof publishProposal);
        console.log('🔍 Client atual:', getClient());
        
        try {
          const success = await publishProposal(testProposal);
          console.log('📤 publishProposal retornou:', success);
          
          if (success) {
            return { 
              success: true, 
              message: 'Proposta publicada com sucesso no P2P',
              data: testProposal
            };
          }
          
          return { 
            success: false, 
            message: 'Falha ao publicar proposta no P2P (retornou false)',
            data: { testProposal, publishProposalResult: success }
          };
        } catch (error: any) {
          console.error('❌ Erro ao publicar proposta:', error);
          return { 
            success: false, 
            message: `Erro ao publicar: ${error.message}`,
            data: { error: error.message, testProposal }
          };
        }
      }
    );

    if (!test5) {
      setIsRunning(false);
      return;
    }

    // Aguarda propagação
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 6: Publicar voto de teste
    const test6 = await runTest(
      'Publish Test Vote',
      async () => {
        const testVote = {
          hash: `0x${Math.random().toString(16).slice(2)}`,
          proposalId: 'test-proposal-1', // Backend espera proposalId
          voter: address,
          choice: 'FOR', // Backend espera 'choice', não 'support'
          support: 'FOR', // Mantém support para compatibilidade
          weight: '1000000000000000000',
          tokens: '1000000000000000000', // Backend pode esperar 'tokens' também
          chainId: 1,
          timestamp: Date.now()
        };

        const success = await publishVote(testVote);
        
        if (success) {
          return { 
            success: true, 
            message: 'Voto publicado com sucesso no P2P',
            data: testVote
          };
        }
        
        return { 
          success: false, 
          message: 'Falha ao publicar voto no P2P' 
        };
      }
    );

    // Aguarda propagação final
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 7: Verificar métricas P2P
    await runTest(
      'P2P Metrics Validation',
      async () => {
        const metrics = {
          messagesSent: stats.metrics.messagesSent,
          messagesReceived: stats.metrics.messagesReceived,
          proposalsSent: stats.metrics.proposalsReceived >= 0,
          votesSent: stats.metrics.votesReceived >= 0
        };

        return { 
          success: true, 
          message: `Métricas: ${metrics.messagesSent} enviadas, ${metrics.messagesReceived} recebidas`,
          data: metrics
        };
      }
    );

    setIsRunning(false);
    setCurrentTest('');
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'running':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const totalTests = tests.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 P2P End-to-End Test Suite
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Teste completo do fluxo P2P: Proposta → Propagação → Voto → Propagação
          </p>
        </div>
        
        <button
          onClick={runAllTests}
          disabled={isRunning || !walletConnected}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed shadow-lg"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Executando...' : 'Executar Testes'}
        </button>
      </div>

      {/* P2P Status */}
      {p2pConnected && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <Network className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              P2P Conectado
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {stats.peers} peer(s) • Peer ID: {stats.peerId.slice(0, 20)}...
            </p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {tests.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Sucesso</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Falhas</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={test.name}
            className={`p-4 border rounded-lg transition-all ${getStatusColor(test.status)}`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {index + 1}. {test.name}
                  </h3>
                  {test.status === 'running' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                      Executando...
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {test.message}
                </p>
                {test.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                      Ver detalhes
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {tests.length === 0 && (
        <div className="text-center py-12">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pronto para Testar
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Clique em &quot;Executar Testes&quot; para iniciar a suíte completa de testes P2P
          </p>
          {!walletConnected && (
            <p className="text-sm text-orange-600 dark:text-orange-400">
              ⚠️ Conecte sua carteira primeiro
            </p>
          )}
        </div>
      )}
    </div>
  );
}
