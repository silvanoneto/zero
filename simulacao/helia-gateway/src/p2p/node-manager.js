/**
 * @fileoverview P2P Node Manager - Gerencia nó Helia + libp2p
 * @module p2p/node-manager
 * 
 * Este módulo gerencia o ciclo de vida completo do nó P2P:
 * - Inicialização de Helia com libp2p customizado
 * - Gerenciamento de peers e conexões
 * - Sistema de pub/sub para governança
 * - Monitoramento de saúde do nó
 */

import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { 
  createP2PNode, 
  getNodeStats, 
  publishMessage, 
  subscribeToTopic,
  PUBSUB_TOPICS 
} from './libp2p-config.js'
import { logger } from '../utils/logger.js'

/**
 * Classe que gerencia o nó P2P completo
 */
export class P2PNodeManager {
  constructor() {
    this.libp2p = null
    this.helia = null
    this.fs = null
    this.isInitialized = false
    this.messageHandlers = new Map()
    this.startTime = Date.now()
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      proposalsProcessed: 0,
      votesProcessed: 0,
      peersDiscovered: 0
    }
  }

  /**
   * Inicializa o nó P2P completo
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      logger.info('🚀 Initializing P2P node...')
      
      // 1. Cria nó libp2p
      this.libp2p = await createP2PNode(true)
      
      // 2. Cria instância Helia usando o libp2p
      this.helia = await createHelia({
        libp2p: this.libp2p,
        blockstore: undefined, // Usa blockstore padrão
        datastore: undefined   // Usa datastore padrão
      })
      
      // 3. Adiciona UnixFS (para armazenar arquivos)
      this.fs = unixfs(this.helia)
      
      // 4. Configura listeners de eventos
      this.setupEventListeners()
      
      // 5. Subscreve a tópicos de governança
      this.setupGovernanceTopics()
      
      // 6. Inicia health check periódico
      this.startHealthCheck()
      
      this.isInitialized = true
      logger.info('✅ P2P node initialized successfully')
      logger.info(`   Peer ID: ${this.libp2p.peerId.toString()}`)
      
      // Log multiaddrs para debug
      const multiaddrs = this.libp2p.getMultiaddrs()
      logger.info(`   Listening on ${multiaddrs.length} addresses:`)
      multiaddrs.forEach(ma => logger.info(`   - ${ma.toString()}`))
      
    } catch (error) {
      logger.error('❌ Failed to initialize P2P node:', error)
      throw error
    }
  }

  /**
   * Configura listeners de eventos do libp2p
   */
  setupEventListeners() {
    this.libp2p.addEventListener('peer:discovery', async (evt) => {
      const peerId = evt.detail.id.toString()
      this.metrics.peersDiscovered++
      
      // Log dos multiaddrs descobertos
      const multiaddrs = evt.detail.multiaddrs || []
      console.log(`🔍 Discovered peer: ${peerId}`)
      console.log(`   Available addresses (${multiaddrs.length}):`)
      multiaddrs.forEach(ma => console.log(`   - ${ma.toString()}`))
      
      // Tenta conectar automaticamente ao peer descoberto
      try {
        const existingConnections = this.libp2p.getConnections(evt.detail.id)
        if (existingConnections.length === 0) {
          console.log(`🔗 Attempting to connect to discovered peer: ${peerId}`)
          
          // Filtra multiaddrs que não são localhost
          const multiaddrs = evt.detail.multiaddrs || []
          const nonLocalAddrs = multiaddrs.filter(ma => !ma.toString().includes('127.0.0.1'))
          
          if (nonLocalAddrs.length > 0) {
            // Adiciona o peer ID ao multiaddr se não estiver presente
            let targetAddr = nonLocalAddrs[0].toString()
            if (!targetAddr.includes('/p2p/')) {
              targetAddr = `${targetAddr}/p2p/${peerId}`
            }
            console.log(`   Using address: ${targetAddr}`)
            
            // Importa multiaddr para criar objeto
            const { multiaddr } = await import('@multiformats/multiaddr')
            await this.libp2p.dial(multiaddr(targetAddr))
            console.log(`✅ Successfully connected to peer: ${peerId}`)
          } else {
            console.log(`   No non-local addresses available, trying peer ID`)
            await this.libp2p.dial(evt.detail.id)
            console.log(`✅ Successfully connected to peer: ${peerId}`)
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not connect to peer ${peerId}:`, error.message)
        if (error.errors) {
          error.errors.forEach((err, idx) => {
            console.log(`   Error ${idx + 1}:`, err.message || err.toString())
            if (err.cause) {
              console.log(`   Cause:`, err.cause.message || err.cause.toString())
            }
            if (err.stack && process.env.DEBUG_ERRORS) {
              console.log(`   Stack:`, err.stack)
            }
          })
        } else if (error.cause) {
          console.log(`   Cause:`, error.cause.message || error.cause)
        }
      }
    })

    this.libp2p.addEventListener('connection:open', (evt) => {
      // Em libp2p v2, mudou de 'peer:connect' para 'connection:open'
      logger.info(`🤝 Connected to: ${evt.detail.remotePeer.toString()}`)
      this.announcePresence()
    })

    this.libp2p.addEventListener('connection:close', (evt) => {
      // Em libp2p v2, mudou de 'peer:disconnect' para 'connection:close'
      logger.warn(`👋 Disconnected from: ${evt.detail.remotePeer.toString()}`)
    })
  }

  /**
   * Configura subscrições aos tópicos de governança
   */
  setupGovernanceTopics() {
    // Subscreve a novos propostas
    subscribeToTopic(this.libp2p, PUBSUB_TOPICS.PROPOSALS_NEW, (data) => {
      this.metrics.proposalsProcessed++
      this.metrics.messagesReceived++
      logger.info(`📝 New proposal received: ${data.title || data.id}`)
      this.notifyHandler('proposal:new', data)
    })

    // Subscreve a novos votos
    subscribeToTopic(this.libp2p, PUBSUB_TOPICS.VOTES_NEW, (data) => {
      this.metrics.votesProcessed++
      this.metrics.messagesReceived++
      logger.info(`🗳️  New vote received on proposal ${data.proposalId}`)
      this.notifyHandler('vote:new', data)
    })

    // Subscreve a eventos de mitose
    subscribeToTopic(this.libp2p, PUBSUB_TOPICS.DAO_MITOSIS, (data) => {
      this.metrics.messagesReceived++
      logger.warn(`🧬 DAO Mitosis event: ${data.parentDAO} → ${data.childDAOs}`)
      this.notifyHandler('dao:mitosis', data)
    })

    // Subscreve a health checks de outros nós
    subscribeToTopic(this.libp2p, PUBSUB_TOPICS.DAO_HEALTH, (data) => {
      this.metrics.messagesReceived++
      logger.debug(`💓 Health check from ${data.peerId}`)
      this.notifyHandler('dao:health', data)
    })

    logger.info('📡 Subscribed to all governance topics')
  }

  /**
   * Anuncia presença na rede
   */
  async announcePresence() {
    try {
      await publishMessage(this.libp2p, PUBSUB_TOPICS.DAO_HEALTH, {
        type: 'node-online',
        nodeType: 'helia-gateway',
        version: '1.0.0',
        capabilities: ['storage', 'gateway', 'pubsub'],
        uptime: Date.now() - this.startTime
      })
      logger.debug('📢 Announced presence to network')
    } catch (error) {
      logger.error('Failed to announce presence:', error)
    }
  }

  /**
   * Inicia health check periódico
   */
  startHealthCheck() {
    // Reporta saúde a cada 5 minutos
    setInterval(async () => {
      await this.reportHealth()
    }, 5 * 60 * 1000)

    // Primeira execução imediata
    this.reportHealth()
  }

  /**
   * Reporta saúde do nó para a rede
   */
  async reportHealth() {
    try {
      const peers = this.libp2p.getPeers()
      
      // Não tenta publicar se não há peers (evita erro)
      if (peers.length === 0) {
        logger.debug('💓 No peers connected, skipping health report')
        return
      }
      
      const stats = this.getStats()
      
      // Converte stats para formato serializ humanável (sem buffers)
      const serializable = {
        type: 'health-report',
        peerId: stats.peerId,
        uptime: stats.uptime,
        peers: stats.peers,
        metrics: this.metrics
      }
      
      await publishMessage(this.libp2p, PUBSUB_TOPICS.DAO_HEALTH, serializable)
      
      logger.debug('💓 Health report sent to network')
    } catch (error) {
      logger.debug('Failed to report health (no peers):', error.message)
    }
  }

  /**
   * Publica nova proposta na rede
   * @param {Object} proposal - Dados da proposta
   */
  async publishProposal(proposal) {
    try {
      await publishMessage(this.libp2p, PUBSUB_TOPICS.PROPOSALS_NEW, {
        type: 'proposal',
        ...proposal
      })
      
      this.metrics.messagesSent++
      logger.info(`📝 Published proposal: ${proposal.title}`)
    } catch (error) {
      logger.error('Failed to publish proposal:', error)
      throw error
    }
  }

  /**
   * Publica novo voto na rede
   * @param {Object} vote - Dados do voto
   */
  async publishVote(vote) {
    try {
      await publishMessage(this.libp2p, PUBSUB_TOPICS.VOTES_NEW, {
        type: 'vote',
        ...vote
      })
      
      this.metrics.messagesSent++
      logger.info(`🗳️  Published vote on proposal ${vote.proposalId}`)
    } catch (error) {
      logger.error('Failed to publish vote:', error)
      throw error
    }
  }

  /**
   * Registra handler para tipo de mensagem
   * @param {string} type - Tipo de mensagem
   * @param {Function} handler - Callback
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type).push(handler)
  }

  /**
   * Notifica handlers registrados
   * @param {string} type - Tipo de mensagem
   * @param {Object} data - Dados da mensagem
   */
  notifyHandler(type, data) {
    const handlers = this.messageHandlers.get(type) || []
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        logger.error(`Error in message handler for ${type}:`, error)
      }
    })
  }

  /**
   * Retorna estatísticas do nó
   * @returns {Object}
   */
  getStats() {
    if (!this.isInitialized) {
      return {
        status: 'not-initialized',
        uptime: 0
      }
    }

    const libp2pStats = getNodeStats(this.libp2p)
    
    return {
      status: 'online',
      peerId: this.libp2p.peerId.toString(),
      uptime: Date.now() - this.startTime,
      peers: libp2pStats.peers,
      addresses: libp2pStats.addresses,
      metrics: this.metrics,
      services: {
        helia: 'enabled',
        unixfs: 'enabled',
        ...libp2pStats.services
      }
    }
  }

  /**
   * Retorna lista de peers conectados
   * @returns {Array}
   */
  getPeers() {
    if (!this.isInitialized) {
      return []
    }

    return this.libp2p.getPeers().map(peerId => ({
      id: peerId.toString(),
      protocols: []
    }))
  }

  /**
   * Conecta a peer específico
   * @param {string} multiaddr - Endereço multiaddr do peer
   */
  async connectToPeer(multiaddr) {
    try {
      const connection = await this.libp2p.dial(multiaddr)
      logger.info(`✅ Connected to peer: ${connection.remotePeer.toString()}`)
      return {
        success: true,
        peerId: connection.remotePeer.toString()
      }
    } catch (error) {
      logger.error(`Failed to connect to peer ${multiaddr}:`, error)
      throw error
    }
  }

  /**
   * Adiciona conteúdo ao IPFS
   * @param {Uint8Array|string} content - Conteúdo a adicionar
   * @returns {Promise<string>} CID do conteúdo
   */
  async addContent(content) {
    if (!this.isInitialized) {
      throw new Error('Node not initialized')
    }

    try {
      const cid = await this.fs.addBytes(
        typeof content === 'string' ? new TextEncoder().encode(content) : content
      )
      logger.info(`📦 Added content to IPFS: ${cid.toString()}`)
      return cid.toString()
    } catch (error) {
      logger.error('Failed to add content:', error)
      throw error
    }
  }

  /**
   * Busca conteúdo do IPFS
   * @param {string} cid - CID do conteúdo
   * @returns {Promise<Uint8Array>} Conteúdo
   */
  async getContent(cid) {
    if (!this.isInitialized) {
      throw new Error('Node not initialized')
    }

    try {
      const chunks = []
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk)
      }
      
      const content = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        content.set(chunk, offset)
        offset += chunk.length
      }
      
      logger.debug(`📥 Retrieved content from IPFS: ${cid}`)
      return content
    } catch (error) {
      logger.error(`Failed to get content ${cid}:`, error)
      throw error
    }
  }

  /**
   * Para o nó gracefully
   */
  async stop() {
    if (!this.isInitialized) {
      return
    }

    try {
      logger.info('🛑 Stopping P2P node...')
      
      // Anuncia saída apenas se houver peers
      const peers = this.libp2p.getPeers()
      if (peers.length > 0) {
        await publishMessage(this.libp2p, PUBSUB_TOPICS.DAO_HEALTH, {
          type: 'node-offline',
          finalStats: this.getStats()
        })
      }

      // Para Helia (que para libp2p também)
      await this.helia.stop()
      
      this.isInitialized = false
      logger.info('✅ P2P node stopped')
    } catch (error) {
      logger.error('Error stopping P2P node:', error)
      throw error
    }
  }
}

// Singleton instance
let nodeManager = null

/**
 * Retorna instância singleton do NodeManager
 * @returns {P2PNodeManager}
 */
export function getNodeManager() {
  if (!nodeManager) {
    nodeManager = new P2PNodeManager()
  }
  return nodeManager
}

/**
 * Inicializa node manager (se ainda não inicializado)
 * @returns {Promise<P2PNodeManager>}
 */
export async function initializeNodeManager() {
  const manager = getNodeManager()
  
  if (!manager.isInitialized) {
    await manager.initialize()
  }
  
  return manager
}

export default {
  P2PNodeManager,
  getNodeManager,
  initializeNodeManager
}
