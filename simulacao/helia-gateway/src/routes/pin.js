import express from 'express';
import { pinContent, unpinContent, listPins, getStats } from '../utils/helia.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Pin content
router.post('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    await pinContent(cid);
    const stats = await getStats(cid);
    
    res.json({
      success: true,
      cid,
      pinned: true,
      size: stats.size,
    });
  } catch (error) {
    logger.error('Pin error:', error);
    res.status(500).json({ error: 'Failed to pin content' });
  }
});

// Unpin content
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    await unpinContent(cid);
    
    res.json({
      success: true,
      cid,
      pinned: false,
    });
  } catch (error) {
    logger.error('Unpin error:', error);
    res.status(500).json({ error: 'Failed to unpin content' });
  }
});

// List all pins
router.get('/', async (req, res) => {
  try {
    const pins = await listPins();
    
    res.json({
      success: true,
      count: pins.length,
      pins,
    });
  } catch (error) {
    logger.error('List pins error:', error);
    res.status(500).json({ error: 'Failed to list pins' });
  }
});

// Get pin stats
router.get('/:cid/stats', async (req, res) => {
  try {
    const { cid } = req.params;
    const stats = await getStats(cid);
    
    res.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(404).json({ error: 'Content not found' });
  }
});

export default router;
