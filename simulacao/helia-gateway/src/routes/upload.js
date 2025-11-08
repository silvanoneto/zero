import express from 'express';
import multer from 'multer';
import { uploadFile, uploadJSON } from '../utils/helia.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Upload file endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadFile(req.file.buffer, req.file.originalname);
    
    res.json({
      success: true,
      cid: result.cid,
      url: `${process.env.HELIA_GATEWAY_URL || process.env.IPFS_GATEWAY_URL}/helia/${result.cid}`,
      size: result.size,
      filename: req.file.originalname,
      type: req.file.mimetype,
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload JSON endpoint
router.post('/json', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const result = await uploadJSON(req.body);
    
    res.json({
      success: true,
      cid: result.cid,
      url: `${process.env.HELIA_GATEWAY_URL || process.env.IPFS_GATEWAY_URL}/helia/${result.cid}`,
      size: result.size,
      data: req.body,
    });
  } catch (error) {
    logger.error('JSON upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload multiple files
router.post('/batch', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = await Promise.all(
      req.files.map(file => uploadFile(file.buffer, file.originalname))
    );

    res.json({
      success: true,
      files: results.map((result, index) => ({
        cid: result.cid,
        url: `${process.env.HELIA_GATEWAY_URL || process.env.IPFS_GATEWAY_URL}/helia/${result.cid}`,
        size: result.size,
        filename: req.files[index].originalname,
        type: req.files[index].mimetype,
      })),
    });
  } catch (error) {
    logger.error('Batch upload error:', error);
    res.status(500).json({ error: 'Batch upload failed' });
  }
});

export default router;
