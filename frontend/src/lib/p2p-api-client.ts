/**
 * @fileoverview Cliente P2P via API REST + WebSocket
 * @module lib/p2p-api-client
 * 
 * Cliente simplificado que se conecta ao backend P2P via HTTP/WebSocket
 * ao invés de usar libp2p diretamente (compatível com Next.js)
 */

/**
 * Tópicos de PubSub (mesmos do backend)
 */
export const PUBSUB_TOPICS = {
  PROPOSALS_NEW: 'constituicao:proposals:new',
  PROPOSALS_UPDATED: 'constituicao:proposals:updated',
  VOTES_NEW: 'constituicao:votes:new',
  DAO_MITOSIS: 'constituicao:dao:mitosis',
  DAO_HEALTH: 'constituicao:dao:health',
  CONSTITUTION_EXPIRING: 'constituicao:constitution:expiring',
  ZEC_INVITATION: 'constituicao:zec:invitation',
  TRIAL_NOTIFICATION: 'constituicao:trial:notification'
}

export interface P2PStats {
  peerId: string
  peers: number
  metrics: {
    messagesReceived: number
    messagesSent: number
    proposalsReceived: number
    votesReceived: number
  }
}

/**
 * Cliente P2P via API REST
 * Usa HTTP para publicação e EventSource para real-time updates
 */
export class P2PAPIClient {
  private apiUrl: string
  private eventSource: EventSource | null = null
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'
  private statsCache: P2PStats = {
    peerId: '',
    peers: 0,
    metrics: {
      messagesReceived: 0,
      messagesSent: 0,
      proposalsReceived: 0,
      votesReceived: 0
    }
  }
  private statsInterval: NodeJS.Timeout | null = null

  constructor(apiUrl?: string) {
    // Usa caminho relativo para aproveitar o proxy do Next.js (next.config.mjs)
    // Em desenvolvimento: /api/p2p/* → http://localhost:8080/api/p2p/*
    this.apiUrl = apiUrl || ''
  }

  /**
   * Inicializa cliente P2P
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 [P2P API] Initializing...')
      console.log('🔍 [P2P API] API URL:', this.apiUrl)
      console.log('🔍 [P2P API] Tentando conectar em:', `${this.apiUrl}/api/p2p/status`)
      
      this.connectionStatus = 'connecting'

      // Testa se backend está disponível
      const healthCheck = await fetch(`${this.apiUrl}/api/p2p/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔍 [P2P API] Health check response:', {
        ok: healthCheck.ok,
        status: healthCheck.status,
        statusText: healthCheck.statusText,
        headers: Object.fromEntries(healthCheck.headers.entries())
      })
      
      if (!healthCheck.ok) {
        const errorText = await healthCheck.text()
        console.error('❌ [P2P API] Health check falhou:', {
          status: healthCheck.status,
          statusText: healthCheck.statusText,
          body: errorText
        })
        throw new Error(`Backend P2P não disponível: ${healthCheck.status} ${healthCheck.statusText}`)
      }

      const status = await healthCheck.json()
      console.log('✅ [P2P API] Backend online:', {
        peerId: status.data.peerId,
        peers: status.data.peers,
        uptime: status.data.uptime,
        fullStatus: status
      })

      // Atualiza stats inicial
      this.statsCache.peerId = status.data.peerId
      this.statsCache.peers = status.data.peers?.total || 0
      
      console.log('📊 [P2P API] Stats cache atualizado:', this.statsCache)

      // Inicia polling de stats (atualiza a cada 2s)
      this.startStatsPolling()

      // Conecta EventSource para real-time (opcional, pode ser implementado depois)
      // this.connectEventSource()

      this.connectionStatus = 'connected'
      console.log('✅ [P2P API] Client initialized - connectionStatus:', this.connectionStatus)
      return true
    } catch (error: any) {
      console.error('❌ [P2P API] Failed to initialize:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error
      })
      this.connectionStatus = 'error'
      return false
    }
  }

  /**
   * Inicia polling de estatísticas
   */
  private startStatsPolling() {
    this.statsInterval = setInterval(async () => {
      try {
        const [statusRes, metricsRes] = await Promise.all([
          fetch(`${this.apiUrl}/api/p2p/status`),
          fetch(`${this.apiUrl}/api/p2p/metrics`)
        ])

        if (statusRes.ok && metricsRes.ok) {
          const status = await statusRes.json()
          const metrics = await metricsRes.json()

          this.statsCache = {
            peerId: status.data.peerId,
            peers: status.data.peers?.total || 0,
            metrics: {
              messagesReceived: metrics.metrics.messagesReceived,
              messagesSent: metrics.metrics.messagesSent,
              proposalsReceived: metrics.metrics.proposalsProcessed,
              votesReceived: metrics.metrics.votesProcessed
            }
          }
        }
      } catch (error) {
        console.error('[P2P API] Failed to fetch stats:', error)
      }
    }, 2000) // A cada 2 segundos
  }

  /**
   * Para polling de estatísticas
   */
  private stopStatsPolling() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
      this.statsInterval = null
    }
  }

  /**
   * Conecta EventSource para real-time (futuro)
   */
  private connectEventSource() {
    // TODO: Implementar quando backend tiver endpoint SSE
    // this.eventSource = new EventSource(`${this.apiUrl}/api/p2p/stream`)
    // this.eventSource.onmessage = (event) => this.handleMessage(JSON.parse(event.data))
  }

  /**
   * Publica proposta na rede P2P
   */
  async publishProposal(proposal: any): Promise<boolean> {
    try {
      console.log('📝 [P2P API] Publishing proposal:', proposal.id)

      const response = await fetch(`${this.apiUrl}/api/p2p/publish/proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proposal)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ [P2P API] Proposal published')

      // Incrementa contador local
      this.statsCache.metrics.messagesSent++
      this.statsCache.metrics.proposalsReceived++

      // Notifica handlers locais
      this.notifyHandler('proposal:new', proposal)

      return result.success
    } catch (error) {
      console.error('❌ [P2P API] Failed to publish proposal:', error)
      return false
    }
  }

  /**
   * Publica voto na rede P2P
   */
  async publishVote(vote: any): Promise<boolean> {
    try {
      console.log('🗳️ [P2P API] Publishing vote:', vote.proposalId)

      const response = await fetch(`${this.apiUrl}/api/p2p/publish/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vote)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ [P2P API] Vote published')

      // Incrementa contador local
      this.statsCache.metrics.messagesSent++
      this.statsCache.metrics.votesReceived++

      // Notifica handlers locais
      this.notifyHandler('vote:new', vote)

      return result.success
    } catch (error) {
      console.error('❌ [P2P API] Failed to publish vote:', error)
      return false
    }
  }

  /**
   * Subscreve a tópico
   */
  subscribe(topic: string, handler: (data: any) => void): () => void {
    this.messageHandlers.set(topic, handler)
    console.log(`📡 [P2P API] Subscribed to: ${topic}`)

    // Retorna função para desinscrever
    return () => {
      this.messageHandlers.delete(topic)
      console.log(`📡 [P2P API] Unsubscribed from: ${topic}`)
    }
  }

  /**
   * Notifica handlers registrados
   */
  private notifyHandler(event: string, data: any) {
    const handler = this.messageHandlers.get(event)
    if (handler) {
      handler(data)
    }
  }

  /**
   * Retorna estatísticas atuais
   */
  getStats(): P2PStats {
    return { ...this.statsCache }
  }

  /**
   * Retorna status da conexão
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionStatus
  }

  /**
   * Para cliente P2P
   */
  async stop(): Promise<void> {
    console.log('🛑 [P2P API] Stopping client...')

    this.stopStatsPolling()

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.messageHandlers.clear()
    this.connectionStatus = 'disconnected'

    console.log('✅ [P2P API] Client stopped')
  }
}

// Singleton instance
let p2pClientInstance: P2PAPIClient | null = null

/**
 * Obtém instância singleton do cliente P2P
 */
export function getP2PClient(): P2PAPIClient {
  if (!p2pClientInstance) {
    // Usa variável de ambiente para a URL do backend P2P
    const apiUrl = process.env.NEXT_PUBLIC_P2P_GATEWAY || process.env.NEXT_PUBLIC_HELIA_GATEWAY || 'http://localhost:8080'
    console.log('🔧 [P2P API] Criando cliente com URL:', apiUrl)
    p2pClientInstance = new P2PAPIClient(apiUrl)
  }
  return p2pClientInstance
}

/**
 * Inicializa cliente P2P (wrapper para conveniência)
 */
export async function initializeP2PClient(): Promise<P2PAPIClient> {
  const client = getP2PClient()
  await client.initialize()
  return client
}
