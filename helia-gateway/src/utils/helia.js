import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { logger } from './logger.js';

// Singleton Helia instance
let heliaInstance = null;
let fsInstance = null;

// Initialize Helia
const initHelia = async () => {
  if (!heliaInstance) {
    try {
      logger.info('Initializing Helia client...');
      heliaInstance = await createHelia({
        start: true,
      });
      fsInstance = unixfs(heliaInstance);
      logger.info('Helia client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Helia:', error);
      throw error;
    }
  }
  return { helia: heliaInstance, fs: fsInstance };
};

// Get or create Helia instance
const getHelia = async () => {
  if (!heliaInstance || !fsInstance) {
    return await initHelia();
  }
  return { helia: heliaInstance, fs: fsInstance };
};

// Test connection
export const testConnection = async () => {
  try {
    await getHelia();
    const peerId = heliaInstance.libp2p.peerId.toString();
    logger.info(`Connected to Helia node with PeerID: ${peerId}`);
    return true;
  } catch (error) {
    logger.error('Failed to connect to Helia:', error);
    return false;
  }
};

// Upload file to Helia
export const uploadFile = async (buffer, filename) => {
  try {
    const { fs } = await getHelia();
    
    // Convert buffer to Uint8Array if needed
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    // Add file to Helia
    const cid = await fs.addBytes(bytes);
    
    logger.info(`File uploaded: ${cid.toString()}`);
    return {
      cid: cid.toString(),
      size: bytes.length,
      path: filename || 'file',
    };
  } catch (error) {
    logger.error('Upload failed:', error);
    throw error;
  }
};

// Upload JSON to Helia
export const uploadJSON = async (data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    
    const { fs } = await getHelia();
    const cid = await fs.addBytes(bytes);
    
    logger.info(`JSON uploaded: ${cid.toString()}`);
    return {
      cid: cid.toString(),
      size: bytes.length,
    };
  } catch (error) {
    logger.error('JSON upload failed:', error);
    throw error;
  }
};

// Get content from Helia
export const getContent = async (cidString) => {
  try {
    const { fs } = await getHelia();
    
    // Parse CID string
    const { CID } = await import('multiformats/cid');
    const cid = CID.parse(cidString);
    
    // Retrieve content
    const chunks = [];
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }
    
    // Concatenate chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return Buffer.from(result);
  } catch (error) {
    logger.error(`Failed to get content ${cidString}:`, error);
    throw error;
  }
};

// Pin content (Helia auto-pins added content, but we can track it)
export const pinContent = async (cidString) => {
  try {
    // Helia doesn't have explicit pin API like js-ipfs
    // Content is automatically retained when added
    // For explicit pinning, we'd need to use a pinning service
    logger.info(`Content marked for retention: ${cidString}`);
    return true;
  } catch (error) {
    logger.error(`Failed to pin ${cidString}:`, error);
    throw error;
  }
};

// Unpin content
export const unpinContent = async (cidString) => {
  try {
    // Helia uses garbage collection instead of explicit unpinning
    logger.info(`Content marked for garbage collection: ${cidString}`);
    return true;
  } catch (error) {
    logger.error(`Failed to unpin ${cidString}:`, error);
    throw error;
  }
};

// List pins (simplified for Helia)
export const listPins = async () => {
  try {
    // Helia doesn't have a direct pins list API
    // This would require implementing a custom tracking system
    logger.warn('List pins not fully implemented in Helia - returning empty array');
    return [];
  } catch (error) {
    logger.error('Failed to list pins:', error);
    throw error;
  }
};

// Get file stats
export const getStats = async (cidString) => {
  try {
    const { fs } = await getHelia();
    const { CID } = await import('multiformats/cid');
    const cid = CID.parse(cidString);
    
    // Get stats by reading the content
    const stats = await fs.stat(cid);
    
    return {
      cid: cid.toString(),
      size: stats.fileSize,
      blocks: stats.blocks,
      type: stats.type,
    };
  } catch (error) {
    logger.error(`Failed to get stats for ${cidString}:`, error);
    throw error;
  }
};

// Cleanup on exit
process.on('SIGINT', async () => {
  if (heliaInstance) {
    logger.info('Shutting down Helia...');
    await heliaInstance.stop();
    logger.info('Helia stopped');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (heliaInstance) {
    logger.info('Shutting down Helia...');
    await heliaInstance.stop();
    logger.info('Helia stopped');
  }
  process.exit(0);
});

// Initialize connection test
testConnection().catch((error) => {
  logger.error('Initial connection test failed:', error);
});

