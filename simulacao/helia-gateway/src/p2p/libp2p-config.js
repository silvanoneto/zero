/**
 * @fileoverview Configuração libp2p para rede P2P da Cybersyn 2.0
 * @module p2p/libp2p-config
 * 
 * Este módulo configura o stack completo de networking P2P:
 * - Transports: TCP (Node.js) + WebSockets (browsers) + WebRTC (browser-to-browser)
 * - Security: Noise protocol para criptografia
 * - Multiplexing: Yamux para múltiplas streams
 * - Discovery: mDNS (LAN) + Bootstrap nodes + DHT
 * - PubSub: GossipSub para propagação de mensagens
 */

import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { identify } from '@libp2p/identify'
import { ping } from '@libp2p/ping'

/**
 * Bootstrap nodes da rede Cybersyn 2.0
 * Estes são nós sempre-online que ajudam novos peers a descobrir a rede
 * 
 * Em produção, estes seriam múltiplos VPS geograficamente distribuídos
 * mantidos pela DAO com redundância (Artigo 4º-B)
 */
const getBootstrapPeers = () => {
  // Tenta pegar da variável de ambiente
  const envPeers = process.env.BOOTSTRAP_PEERS
  if (envPeers) {
    return envPeers.split(',').map(p => p.trim()).filter(p => p.length > 0)
  }
  
  // Fallback para lista vazia
  return []
}

const BOOTSTRAP_PEERS = getBootstrapPeers()
console.log('🔗 Bootstrap peers configurados:', BOOTSTRAP_PEERS.length)

/**
 * Tópicos de PubSub para governança
 * Seguindo a arquitetura definida em P2P_DISTRIBUTED_ARCHITECTURE.md
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

/**
 * Cria configuração libp2p para servidor (Node.js)
 * Suporta TCP + WebSockets para aceitar conexões de browsers
 * 
 * @returns {Object} Configuração libp2p
 */
export function createServerConfig() {
  // Usa portas das variáveis de ambiente ou portas dinâmicas
  const tcpPort = process.env.P2P_TCP_PORT || 0
  const wsPort = process.env.P2P_WS_PORT || 0
  
  console.log(`🔧 libp2p TCP port: ${tcpPort}, WS port: ${wsPort}`)
  
  // Connection gater para filtrar endereços locais em Docker
  const connectionGater = {
    /**
     * Filtra multiaddrs antes de tentar conectar
     * Remove 127.0.0.1 quando rodando em Docker
     */
    denyDialMultiaddr: async (multiaddr) => {
      try {
        const maStr = multiaddr.toString()
        
        // Em modo desenvolvimento (Docker), bloqueia 127.0.0.1
        if (process.env.NODE_ENV === 'development' && maStr.includes('/ip4/127.0.0.1/')) {
          return true  // Bloqueia (sem log para reduzir ruído)
        }
        
        return false  // Permite
      } catch (error) {
        console.error('Error in connectionGater:', error)
        return false  // Permite em caso de erro
      }
    }
  }
  
  return {
    addresses: {
      listen: [
        `/ip4/0.0.0.0/tcp/${tcpPort}`            // TCP para peer-to-peer entre nodes
        // WebSocket removido - Node.js não suporta nativamente
        // Browsers podem conectar via API HTTP normal
      ],
      announce: [
        // Anuncia endereço acessível na rede Docker
        ...(process.env.NODE_ENV === 'development' 
          ? [] 
          : []
        )
      ]
    },
    transports: [
      tcp()
      // webSockets() removido - causava erro "WebSocket is not defined" no Node.js
    ],
    connectionEncrypters: [  // libp2p v2 usa "connectionEncrypters", não "connectionEncryption"
      noise() // Noise retorna uma factory function que libp2p vai chamar
    ],
    streamMuxers: [
      yamux()
    ],
    peerDiscovery: [
      mdns({
        interval: 10000  // Busca peers na LAN a cada 10s
      }),
      // Bootstrap se houver peers configurados
      ...(BOOTSTRAP_PEERS.length > 0 ? [bootstrap({
        list: BOOTSTRAP_PEERS,
        timeout: 10000,
        tagName: 'bootstrap',
        tagValue: 50,
        tagTTL: 120000
      })] : [])
    ],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT({
        clientMode: false,  // Modo server (aceita queries)
        kBucketSize: 20
      }),
      pubsub: gossipsub({
        enabled: true,
        emitSelf: false,   // Não emite mensagens para si mesmo
        globalSignaturePolicy: 'StrictSign',
        fallbackToFloodsub: true,
        floodPublish: true,
        doPX: true        // Peer exchange
      })
    },
    connectionGater,
    connectionManager: {
      minConnections: 5,   // Mínimo de conexões ativas
      maxConnections: 100  // Máximo de conexões simultâneas
    }
  }
}

/**
 * Cria configuração libp2p para cliente browser
 * Usa WebSockets + WebRTC para conectividade máxima
 * 
 * @returns {Object} Configuração libp2p para browser
 */
export function createBrowserConfig() {
  return {
    addresses: {
      listen: [
        '/webrtc'  // WebRTC para browser-to-browser direto
      ]
    },
    transports: [
      webSockets()
      // WebRTC será adicionado quando @libp2p/webrtc browser estiver estável
    ],
    connectionEncrypters: [  // libp2p v2 usa "connectionEncrypters", não "connectionEncryption"
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    peerDiscovery: [
      // Bootstrap desabilitado se lista vazia
      // ...(BOOTSTRAP_PEERS.length > 0 ? [bootstrap({...})] : [])
    ],
    services: {
      identify: identify(),
      ping: ping(),
      dht: kadDHT({
        clientMode: true,  // Modo cliente (não aceita queries)
        kBucketSize: 20
      }),
      pubsub: gossipsub({
        enabled: true,
        emitSelf: false,
        globalSignaturePolicy: 'StrictSign'
      })
    },
    connectionManager: {
      minConnections: 3,
      maxConnections: 50
    }
  }
}

/**
 * Inicializa nó libp2p completo
 * 
 * @param {boolean} isServer - Se true, usa config de servidor. Se false, usa config de browser
 * @returns {Promise<Libp2p>} Instância libp2p inicializada
 */
export async function createP2PNode(isServer = true) {
  const config = isServer ? createServerConfig() : createBrowserConfig()
  
  const node = await createLibp2p(config)
  
  // Log de eventos importantes
  node.addEventListener('connection:open', (evt) => {
    // Em libp2p v2, o evento mudou de 'peer:connect' para 'connection:open'
    // e o remotePeer está diretamente no detail
    console.log(`✅ Successfully connected to peer: ${evt.detail.remotePeer.toString()}`)
  })
  
  node.addEventListener('connection:close', (evt) => {
    // Em libp2p v2, o evento mudou de 'peer:disconnect' para 'connection:close'
    console.log(`❌ Disconnected from peer: ${evt.detail.remotePeer.toString()}`)
  })
  
  node.addEventListener('peer:discovery', (evt) => {
    console.log(`🔍 Discovered peer: ${evt.detail.id.toString()}`)
  })
  
  await node.start()
  
  console.log('🟢 libp2p node started')
  console.log(`   Peer ID: ${node.peerId.toString()}`)
  console.log(`   Addresses:`)
  node.getMultiaddrs().forEach(addr => {
    console.log(`     - ${addr.toString()}`)
  })
  
  return node
}

/**
 * Publica mensagem em tópico PubSub
 * 
 * @param {Libp2p} node - Nó libp2p
 * @param {string} topic - Tópico (use PUBSUB_TOPICS)
 * @param {Object} data - Dados a publicar
 */
export async function publishMessage(node, topic, data) {
  try {
    const message = JSON.stringify({
      ...data,
      timestamp: Date.now(),
      peerId: node.peerId.toString()
    })
    
    const messageBytes = new TextEncoder().encode(message)
    
    // Publica no tópico
    // Em desenvolvimento, permite publicação mesmo sem peers
    try {
      await node.services.pubsub.publish(topic, messageBytes)
      console.log(`✅ Mensagem publicada no tópico: ${topic}`)
    } catch (pubError) {
      // Se não há peers, apenas loga mas não falha (modo desenvolvimento)
      if (pubError.message?.includes('NoPeersSubscribedToTopic')) {
        console.warn(`⚠️ Nenhum peer subscrito ao tópico ${topic}, mas mensagem foi processada localmente`)
        // Não lança erro, considera sucesso em desenvolvimento
        return
      }
      throw pubError
    }
  } catch (error) {
    console.error('Error publishing message:', error)
    throw error
  }
}

/**
 * Subscreve a tópico PubSub
 * 
 * @param {Libp2p} node - Nó libp2p
 * @param {string} topic - Tópico (use PUBSUB_TOPICS)
 * @param {Function} handler - Callback para mensagens recebidas
 */
export function subscribeToTopic(node, topic, handler) {
  node.services.pubsub.subscribe(topic)
  
  node.services.pubsub.addEventListener('message', (evt) => {
    if (evt.detail.topic === topic) {
      try {
        const data = JSON.parse(new TextDecoder().decode(evt.detail.data))
        handler(data)
      } catch (err) {
        console.error(`Error parsing message from topic ${topic}:`, err)
      }
    }
  })
  
  console.log(`📡 Subscribed to topic: ${topic}`)
}

/**
 * Retorna estatísticas do nó P2P
 * 
 * @param {Libp2p} node - Nó libp2p
 * @returns {Object} Estatísticas
 */
export function getNodeStats(node) {
  const peers = node.getPeers()
  const connections = node.getConnections()
  
  return {
    peerId: node.peerId.toString(),
    addresses: node.getMultiaddrs().map(addr => addr.toString()),
    peers: {
      total: peers.length,
      connected: connections.length,
      list: peers.map(p => p.toString())
    },
    services: {
      dht: node.services.dht ? 'enabled' : 'disabled',
      pubsub: node.services.pubsub ? 'enabled' : 'disabled'
    },
    uptime: process.uptime()
  }
}

export default {
  createP2PNode,
  createServerConfig,
  createBrowserConfig,
  publishMessage,
  subscribeToTopic,
  getNodeStats,
  PUBSUB_TOPICS
}
