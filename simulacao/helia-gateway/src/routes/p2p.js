/**
 * @fileoverview Rotas HTTP para gerenciamento P2P
 * @module routes/p2p
 * 
 * Endpoints para:
 * - Consultar peers conectados
 * - Estatísticas do nó
 * - Publicar propostas/votos via P2P
 * - Conectar a peers específicos
 */

import express from 'express'
import { getNodeManager } from '../p2p/node-manager.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * GET /p2p/status
 * Retorna status geral do nó P2P
 */
router.get('/status', (req, res) => {
  try {
    const nodeManager = getNodeManager()
    const stats = nodeManager.getStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    logger.error('Error getting P2P status:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /p2p/peers
 * Lista todos os peers conectados
 */
router.get('/peers', (req, res) => {
  try {
    const nodeManager = getNodeManager()
    const peers = nodeManager.getPeers()
    
    res.json({
      success: true,
      count: peers.length,
      peers
    })
  } catch (error) {
    logger.error('Error getting peers:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /p2p/metrics
 * Retorna métricas detalhadas do nó
 */
router.get('/metrics', (req, res) => {
  try {
    const nodeManager = getNodeManager()
    const stats = nodeManager.getStats()
    
    res.json({
      success: true,
      metrics: {
        uptime: stats.uptime,
        peersConnected: stats.peers?.total || 0,
        messagesReceived: stats.metrics?.messagesReceived || 0,
        messagesSent: stats.metrics?.messagesSent || 0,
        proposalsProcessed: stats.metrics?.proposalsProcessed || 0,
        votesProcessed: stats.metrics?.votesProcessed || 0,
        peersDiscovered: stats.metrics?.peersDiscovered || 0
      }
    })
  } catch (error) {
    logger.error('Error getting metrics:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /p2p/connect
 * Conecta a um peer específico
 * Body: { multiaddr: "/ip4/..." }
 */
router.post('/connect', async (req, res) => {
  try {
    const { multiaddr } = req.body
    
    if (!multiaddr) {
      return res.status(400).json({
        success: false,
        error: 'multiaddr is required'
      })
    }
    
    const nodeManager = getNodeManager()
    const result = await nodeManager.connectToPeer(multiaddr)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    logger.error('Error connecting to peer:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /p2p/publish/proposal
 * Publica nova proposta na rede P2P
 * Body: { id, title, description, voteType, ... }
 */
router.post('/publish/proposal', async (req, res) => {
  try {
    const proposal = req.body
    
    if (!proposal.id || !proposal.title) {
      return res.status(400).json({
        success: false,
        error: 'id and title are required'
      })
    }
    
    const nodeManager = getNodeManager()
    await nodeManager.publishProposal(proposal)
    
    res.json({
      success: true,
      message: 'Proposal published to P2P network',
      proposalId: proposal.id
    })
  } catch (error) {
    logger.error('Error publishing proposal:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /p2p/publish/vote
 * Publica novo voto na rede P2P
 * Body: { proposalId, voter, choice, tokens, ... }
 */
router.post('/publish/vote', async (req, res) => {
  try {
    const vote = req.body
    
    if (!vote.proposalId || !vote.voter || !vote.choice) {
      return res.status(400).json({
        success: false,
        error: 'proposalId, voter, and choice are required'
      })
    }
    
    const nodeManager = getNodeManager()
    await nodeManager.publishVote(vote)
    
    res.json({
      success: true,
      message: 'Vote published to P2P network',
      proposalId: vote.proposalId
    })
  } catch (error) {
    logger.error('Error publishing vote:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /p2p/addresses
 * Retorna os endereços multiaddr do nó
 */
router.get('/addresses', (req, res) => {
  try {
    const nodeManager = getNodeManager()
    const stats = nodeManager.getStats()
    
    res.json({
      success: true,
      peerId: stats.peerId,
      addresses: stats.addresses || []
    })
  } catch (error) {
    logger.error('Error getting addresses:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * WebSocket upgrade para streaming de eventos P2P em tempo real
 * TODO: Implementar com express-ws ou socket.io
 */

export default router
