import express from 'express';
import { listPins } from '../utils/helia.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory stats (em produção, usar Redis ou DB)
let requestCount = 0;
let totalUploads = 0;
let totalSize = 0;

// Increment request counter (middleware)
export const trackRequest = (req, res, next) => {
  requestCount++;
  next();
};

// Track upload
export const trackUpload = (size) => {
  totalUploads++;
  totalSize += size;
};

// Get stats
router.get('/', async (req, res) => {
  try {
    const pins = await listPins();
    
    res.json({
      success: true,
      stats: {
        totalPins: pins.length,
        totalUploads,
        totalSize,
        requests: requestCount,
        uptime: process.uptime(),
      },
    });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
