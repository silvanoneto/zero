import express from 'express';
import { getContent } from '../utils/helia.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get content by CID
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const content = await getContent(cid);
    
    // Try to detect content type
    const contentType = req.query.type || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(content);
  } catch (error) {
    logger.error('Content retrieval error:', error);
    res.status(404).json({ error: 'Content not found' });
  }
});

// Get content as JSON
router.get('/:cid/json', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const content = await getContent(cid);
    const json = JSON.parse(content.toString());
    
    res.json(json);
  } catch (error) {
    logger.error('JSON retrieval error:', error);
    res.status(404).json({ error: 'Content not found or not valid JSON' });
  }
});

export default router;
