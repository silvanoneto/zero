/**
 * Proposals Routes - API para acessar propostas geradas
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data/seed');

/**
 * GET /api/proposals - Lista todas as propostas
 */
router.get('/', async (req, res) => {
  try {
    const proposalsPath = path.join(DATA_DIR, 'proposals.json');
    const data = await fs.readFile(proposalsPath, 'utf-8');
    const proposals = JSON.parse(data);
    
    // Filtros opcionais
    const { priority, daoTheme, source, voteType } = req.query;
    
    let filtered = proposals;
    
    if (priority) {
      filtered = filtered.filter(p => p.priority === priority);
    }
    if (daoTheme) {
      filtered = filtered.filter(p => p.daoTheme === daoTheme);
    }
    if (source) {
      filtered = filtered.filter(p => p.source === source);
    }
    if (voteType) {
      filtered = filtered.filter(p => p.voteType === voteType);
    }
    
    res.json({
      success: true,
      count: filtered.length,
      proposals: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/proposals/stats - Estatísticas das propostas
 */
router.get('/stats', async (req, res) => {
  try {
    const statsPath = path.join(DATA_DIR, 'stats.json');
    const data = await fs.readFile(statsPath, 'utf-8');
    const stats = JSON.parse(data);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/proposals/by-theme - Propostas agrupadas por tema
 */
router.get('/by-theme', async (req, res) => {
  try {
    const themesPath = path.join(DATA_DIR, 'proposals-by-theme.json');
    const data = await fs.readFile(themesPath, 'utf-8');
    const grouped = JSON.parse(data);
    
    res.json({
      success: true,
      themes: grouped
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/proposals/by-theme/:theme - Propostas de um tema específico
 */
router.get('/by-theme/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    const themesPath = path.join(DATA_DIR, 'proposals-by-theme.json');
    const data = await fs.readFile(themesPath, 'utf-8');
    const grouped = JSON.parse(data);
    
    if (!grouped[theme]) {
      return res.status(404).json({
        success: false,
        error: `Tema '${theme}' não encontrado`
      });
    }
    
    res.json({
      success: true,
      theme,
      count: grouped[theme].length,
      proposals: grouped[theme]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/proposals/:id - Detalhes de uma proposta específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposalsPath = path.join(DATA_DIR, 'proposals.json');
    const data = await fs.readFile(proposalsPath, 'utf-8');
    const proposals = JSON.parse(data);
    
    const proposal = proposals.find(p => p.id === id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: `Proposta '${id}' não encontrada`
      });
    }
    
    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/proposals/last-run - Info da última execução do seed
 */
router.get('/meta/last-run', async (req, res) => {
  try {
    const lastRunPath = path.join(DATA_DIR, 'last-run.json');
    const data = await fs.readFile(lastRunPath, 'utf-8');
    const lastRun = JSON.parse(data);
    
    res.json({
      success: true,
      lastRun
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
