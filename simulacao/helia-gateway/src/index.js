// Load polyfills first
import './polyfills.js';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import uploadRoutes from './routes/upload.js';
import heliaRoutes from './routes/helia.js';
import pinRoutes from './routes/pin.js';
import statsRoutes from './routes/stats.js';
import proposalsRoutes from './routes/proposals.js';
import p2pRoutes from './routes/p2p.js';
import { logger } from './utils/logger.js';
import { testConnection } from './utils/helia.js';
import { initializeNodeManager, getNodeManager } from './p2p/node-manager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration - permite requisições do frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['Content-Type']
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting - Configuração mais permissiva para desenvolvimento
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 min (reduzido de 15 min)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests (aumentado de 100)
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  skip: (req) => {
    // Desabilita rate limiting em desenvolvimento
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('⚠️ Rate limiting desabilitado (modo desenvolvimento)');
      return true;
    }
    return false;
  }
});

app.use('/api', limiter);

// API Key authentication (opcional)
const apiKeyAuth = (req, res, next) => {
  if (process.env.API_KEY_ENABLED === 'true') {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
};

// Routes
app.use('/api/upload', apiKeyAuth, uploadRoutes);
app.use('/helia', heliaRoutes);
app.use('/api/pin', apiKeyAuth, pinRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/p2p', p2pRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const connected = await testConnection();
    const nodeManager = getNodeManager();
    const p2pStats = nodeManager.isInitialized ? nodeManager.getStats() : null;
    
    res.json({
      status: 'ok',
      helia: connected ? 'connected' : 'disconnected',
      p2p: p2pStats ? {
        status: p2pStats.status,
        peers: p2pStats.peers?.total || 0
      } : { status: 'not-initialized' },
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      helia: 'disconnected',
      uptime: process.uptime(),
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize P2P node and start server
async function startServer() {
  try {
    // Inicializa nó P2P
    logger.info('🚀 Initializing P2P node...');
    await initializeNodeManager();
    logger.info('✅ P2P node ready');
    
    // Inicia servidor HTTP
    app.listen(PORT, () => {
      logger.info(`Helia Gateway running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Gateway URL: ${process.env.HELIA_GATEWAY_URL || process.env.IPFS_GATEWAY_URL}`);
      
      const nodeManager = getNodeManager();
      const stats = nodeManager.getStats();
      logger.info(`P2P Status:`);
      logger.info(`  Peer ID: ${stats.peerId}`);
      logger.info(`  Connected Peers: ${stats.peers?.total || 0}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  const nodeManager = getNodeManager();
  await nodeManager.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  const nodeManager = getNodeManager();
  await nodeManager.stop();
  process.exit(0);
});

startServer();

export default app;
