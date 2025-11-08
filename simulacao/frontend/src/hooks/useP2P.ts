/**
 * @fileoverview Hook React para integração P2P
 * @module hooks/useP2P
 * 
 * Hook que gerencia conexão P2P via API REST
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getP2PClient, initializeP2PClient, PUBSUB_TOPICS, type P2PStats } from '@/lib/p2p-api-client'

export interface UseP2POptions {
  autoConnect?: boolean
}

export function useP2P(options: UseP2POptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [client, setClient] = useState<any | null>(null)
  const clientRef = useRef<any | null>(null) // Ref para evitar problemas de closure
  const [stats, setStats] = useState<P2PStats>({
    peerId: '',
    peers: 0,
    metrics: {
      messagesReceived: 0,
      messagesSent: 0,
      proposalsReceived: 0,
      votesReceived: 0
    }
  })

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      console.log('⚠️ [useP2P] connect() chamado mas já está conectado ou conectando', {
        isConnected,
        isConnecting
      });
      return;
    }

    try {
      console.log('🔄 [useP2P] Iniciando conexão...');
      setIsConnecting(true)
      setError(null)

      const p2pClient = await initializeP2PClient()
      console.log('✅ [useP2P] Cliente P2P inicializado:', p2pClient);
      console.log('🔍 [useP2P] Connection status:', p2pClient.getConnectionStatus());
      console.log('🔍 [useP2P] Stats:', p2pClient.getStats());
      
      setClient(p2pClient)
      clientRef.current = p2pClient // Atualiza ref também
      setIsConnected(true)
      
      // Atualiza stats imediatamente após conexão
      const initialStats = p2pClient.getStats()
      setStats(initialStats)

      console.log('✅ [useP2P] Connected - Estado atualizado:', {
        isConnected: true,
        hasClient: !!p2pClient,
        peerId: initialStats.peerId,
        peers: initialStats.peers
      });
    } catch (err) {
      const error = err as Error
      console.error('❌ [useP2P] Connection failed:', {
        message: error.message,
        stack: error.stack,
        error
      })
      setError(error)
      throw error
    } finally {
      setIsConnecting(false)
      console.log('🏁 [useP2P] Finalizando connect(). isConnecting = false');
    }
  }, [isConnected, isConnecting])

  const disconnect = useCallback(async () => {
    if (!client) return

    try {
      await client.stop()
      setClient(null)
      clientRef.current = null // Limpa ref também
      setIsConnected(false)
      setStats({
        peerId: '',
        peers: 0,
        metrics: {
          messagesReceived: 0,
          messagesSent: 0,
          proposalsReceived: 0,
          votesReceived: 0
        }
      })
      console.log('✅ [useP2P] Disconnected')
    } catch (err) {
      console.error('[useP2P] Error disconnecting:', err)
      throw err
    }
  }, [client])

  const publishProposal = useCallback(
    async (proposal: any): Promise<boolean> => {
      console.log('📤 [useP2P] publishProposal chamado');
      console.log('🔍 [useP2P] clientRef.current:', clientRef.current);
      if (!clientRef.current) {
        console.error('❌ [useP2P] Sem client para publicar proposta');
        return false;
      }
      const result = await clientRef.current.publishProposal(proposal);
      console.log('✅ [useP2P] publishProposal resultado:', result);
      return result;
    },
    []
  )

  const publishVote = useCallback(
    async (vote: any): Promise<boolean> => {
      console.log('📤 [useP2P] publishVote chamado');
      if (!clientRef.current) {
        console.error('❌ [useP2P] Sem client para publicar voto');
        return false;
      }
      return await clientRef.current.publishVote(vote);
    },
    []
  )

  const subscribe = useCallback(
    (topic: string, handler: (data: any) => void): (() => void) => {
      console.log('📡 [useP2P] subscribe chamado para:', topic);
      if (!clientRef.current) {
        console.error('❌ [useP2P] Sem client para subscribe');
        return () => {};
      }
      return clientRef.current.subscribe(topic, handler);
    },
    []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true
    let currentClient: any = null

    async function init() {
      try {
        setIsConnecting(true)
        setError(null)

        currentClient = await initializeP2PClient()

        if (!mounted) {
          await currentClient.stop()
          return
        }

        setClient(currentClient)
        clientRef.current = currentClient // Atualiza ref também
        setIsConnected(true)
        console.log('✅ [useP2P] Auto-connected')
      } catch (err) {
        if (!mounted) return

        const error = err as Error
        console.error('❌ [useP2P] Auto-connect failed:', error)
        setError(error)
      } finally {
        if (mounted) {
          setIsConnecting(false)
        }
      }
    }

    if (options.autoConnect) {
      init()
    }

    return () => {
      mounted = false
      if (currentClient) {
        currentClient.stop().catch(console.error)
      }
    }
  }, [options.autoConnect])

  useEffect(() => {
    if (!client || typeof window === 'undefined') return

    const interval = setInterval(() => {
      try {
        const newStats = client.getStats()
        setStats(newStats)
      } catch (err) {
        console.error('[useP2P] Failed to get stats:', err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [client])

  const getClient = useCallback(() => {
    console.log('🔍 [useP2P] getClient() chamado - clientRef.current:', clientRef.current);
    return clientRef.current
  }, [])

  const getStats = useCallback(() => {
    console.log('🔍 [useP2P] getStats() chamado - clientRef.current:', clientRef.current);
    if (clientRef.current) {
      const currentStats = clientRef.current.getStats()
      console.log('📊 [useP2P] Stats do client:', currentStats);
      return currentStats
    }
    console.log('⚠️ [useP2P] Sem client, retornando stats do estado');
    return stats
  }, [stats])

  return {
    isConnected,
    isConnecting,
    error,
    stats,
    connect,
    disconnect,
    publishProposal,
    publishVote,
    subscribe,
    client,
    getClient,
    getStats,
    PUBSUB_TOPICS
  }
}
