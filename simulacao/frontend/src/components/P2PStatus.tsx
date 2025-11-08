/**
 * @fileoverview Componente de Status P2P
 * @module components/P2PStatus
 * 
 * Mostra status da conexão P2P, peers conectados e métricas em tempo real
 */

import React, { useState, useEffect } from 'react'
import { useP2P } from '@/hooks/useP2P'

const P2PStatus: React.FC = () => {
  const { 
    isConnected, 
    isConnecting, 
    error, 
    stats, 
    connect, 
    disconnect,
    subscribe 
  } = useP2P({ autoConnect: true })

  const [recentMessages, setRecentMessages] = useState<Array<{
    type: string
    data: any
    timestamp: number
  }>>([])

  const [showDetails, setShowDetails] = useState(false)

  // Subscreve a eventos P2P
  useEffect(() => {
    const unsubProposal = subscribe('proposal:new', (data: any) => {
      setRecentMessages(prev => [
        { type: 'proposal', data, timestamp: Date.now() },
        ...prev.slice(0, 9) // Mantém últimas 10
      ])
    })

    const unsubVote = subscribe('vote:new', (data: any) => {
      setRecentMessages(prev => [
        { type: 'vote', data, timestamp: Date.now() },
        ...prev.slice(0, 9)
      ])
    })

    const unsubMitosis = subscribe('dao:mitosis', (data: any) => {
      setRecentMessages(prev => [
        { type: 'mitosis', data, timestamp: Date.now() },
        ...prev.slice(0, 9)
      ])
    })

    return () => {
      unsubProposal()
      unsubVote()
      unsubMitosis()
    }
  }, [subscribe])

  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500'
    if (isConnected) return 'bg-green-500'
    if (error) return 'bg-red-500'
    return 'bg-gray-500'
  }

  const getStatusText = () => {
    if (isConnecting) return 'Conectando...'
    if (isConnected) return 'Conectado'
    if (error) return 'Erro'
    return 'Desconectado'
  }

  const formatPeerId = (peerId?: string) => {
    if (!peerId) return 'N/A'
    return `${peerId.slice(0, 8)}...${peerId.slice(-6)}`
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 1000) return 'agora'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s atrás`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
    return `${Math.floor(diff / 3600000)}h atrás`
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'proposal': return '📝'
      case 'vote': return '🗳️'
      case 'mitosis': return '🧬'
      default: return '📡'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse flex-shrink-0`} />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Rede P2P
          </h3>
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-400">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {!isConnected && !isConnecting && (
            <button
              onClick={connect}
              className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition whitespace-nowrap"
            >
              Conectar
            </button>
          )}
          {isConnected && (
            <button
              onClick={disconnect}
              className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600 transition whitespace-nowrap"
            >
              Desconectar
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-1">
              <span>{showDetails ? '▼' : '▶'}</span>
              <span className="hidden xs:inline">Detalhes</span>
            </span>
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded">
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 break-words">
            ⚠️ {error.message}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded">
          <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-400 mb-1">
            Peers
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {stats.peers}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded">
          <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-400 mb-1">
            Mensagens
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {stats.metrics.messagesReceived}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded">
          <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-400 mb-1">
            Propostas
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {stats.metrics.proposalsReceived}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded">
          <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-400 mb-1">
            Votos
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {stats.metrics.votesReceived}
          </div>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {showDetails && isConnected && (
        <div className="space-y-4">
          {/* Peer ID */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Seu Peer ID
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(stats.peerId || '')}
                className="text-xs text-blue-500 hover:text-blue-600 self-start xs:self-auto"
              >
                📋 Copiar
              </button>
            </div>
            <code className="block w-full p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto break-all">
              {stats.peerId || 'N/A'}
            </code>
          </div>

          {/* Mensagens Recentes */}
          {recentMessages.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Mensagens Recentes
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">{getMessageIcon(msg.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 dark:text-white font-medium capitalize truncate text-xs sm:text-sm">
                        {msg.type}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                        {msg.data.id || msg.data.proposalId || 'N/A'}
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métricas Detalhadas */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Métricas de Rede
            </h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-400">Recebidas:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {stats.metrics.messagesReceived}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-400">Enviadas:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {stats.metrics.messagesSent}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-400">Propostas:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {stats.metrics.proposalsReceived}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-400">Votos:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {stats.metrics.votesReceived}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isConnecting && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Conectando à rede P2P...
          </p>
        </div>
      )}

      {/* Disconnected State */}
      {!isConnected && !isConnecting && !error && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Desconectado da rede P2P
          </p>
          <button
            onClick={connect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            🔗 Conectar Agora
          </button>
        </div>
      )}
    </div>
  )
}

export default P2PStatus
