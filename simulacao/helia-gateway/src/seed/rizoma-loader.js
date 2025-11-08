/**
 * Rizoma Loader - Carrega o rizoma de conceitos da Revolução Cibernética
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RizomaLoader {
  constructor() {
    this.rizoma = null;
    this.concepts = new Map();
    this.connections = new Map();
  }

  /**
   * Carrega o arquivo JSON do rizoma
   */
  async load() {
    try {
      const rizomaPath = path.join(__dirname, '../../../docs/rizoma-revolucao-cibernetica.json');
      const data = await fs.readFile(rizomaPath, 'utf-8');
      this.rizoma = JSON.parse(data);

      console.log('📊 Rizoma carregado:');
      console.log(`   → Total de conceitos: ${this.rizoma.nodes.length}`);
      console.log(`   → Total de conexões: ${this.rizoma.edges.length}`);
      console.log(`   → Versão: ${this.rizoma.meta.version}`);

      // Indexar conceitos para busca rápida
      this.indexConcepts();
      
      return this.rizoma;
    } catch (error) {
      console.error('❌ Erro ao carregar rizoma:', error.message);
      throw error;
    }
  }

  /**
   * Indexa os conceitos para busca rápida
   */
  indexConcepts() {
    this.rizoma.nodes.forEach(node => {
      this.concepts.set(node.id, node);
      
      // Indexar conexões
      if (node.connections && node.connections.length > 0) {
        this.connections.set(node.id, node.connections);
      }
    });

    console.log(`   → Conceitos indexados: ${this.concepts.size}`);
  }

  /**
   * Busca conceitos por palavra-chave
   */
  searchConcepts(keyword) {
    const results = [];
    const lowerKeyword = keyword.toLowerCase();

    for (const [id, node] of this.concepts.entries()) {
      const nameMatch = node.name.toLowerCase().includes(lowerKeyword);
      const descMatch = node.description && node.description.toLowerCase().includes(lowerKeyword);
      const categoryMatch = node.category && node.category.toLowerCase().includes(lowerKeyword);

      if (nameMatch || descMatch || categoryMatch) {
        results.push(node);
      }
    }

    return results;
  }

  /**
   * Obtém conceitos relacionados a um conceito específico
   */
  getRelatedConcepts(conceptId, depth = 1) {
    const related = new Set();
    const visited = new Set();
    
    const traverse = (id, currentDepth) => {
      if (currentDepth > depth || visited.has(id)) return;
      visited.add(id);

      const connections = this.connections.get(id) || [];
      connections.forEach(connId => {
        const concept = this.concepts.get(connId);
        if (concept) {
          related.add(concept);
          traverse(connId, currentDepth + 1);
        }
      });
    };

    traverse(conceptId, 0);
    return Array.from(related);
  }

  /**
   * Obtém conceitos por categoria
   */
  getConceptsByCategory(category) {
    const results = [];
    for (const [id, node] of this.concepts.entries()) {
      if (node.category === category) {
        results.push(node);
      }
    }
    return results;
  }

  /**
   * Obtém conceitos por capítulo
   */
  getConceptsByChapter(chapter) {
    const results = [];
    for (const [id, node] of this.concepts.entries()) {
      if (node.chapter === chapter) {
        results.push(node);
      }
    }
    return results;
  }

  /**
   * Análise de densidade conceitual por categoria
   */
  analyzeCategoryDensity() {
    const density = {};
    
    for (const node of this.concepts.values()) {
      if (!density[node.category]) {
        density[node.category] = {
          count: 0,
          concepts: [],
          avgConnections: 0
        };
      }
      
      density[node.category].count++;
      density[node.category].concepts.push(node.name);
      
      const connections = this.connections.get(node.id) || [];
      density[node.category].avgConnections += connections.length;
    }

    // Calcular média de conexões
    for (const category in density) {
      density[category].avgConnections = 
        Math.round(density[category].avgConnections / density[category].count);
    }

    return density;
  }

  /**
   * Identifica hubs conceituais (conceitos com mais conexões)
   */
  findConceptualHubs(limit = 10) {
    const hubs = [];
    
    for (const [id, connections] of this.connections.entries()) {
      const concept = this.concepts.get(id);
      if (concept) {
        hubs.push({
          id,
          name: concept.name,
          category: concept.category,
          connections: connections.length
        });
      }
    }

    return hubs
      .sort((a, b) => b.connections - a.connections)
      .slice(0, limit);
  }

  /**
   * Obtém estatísticas do rizoma
   */
  getStats() {
    return {
      totalConcepts: this.concepts.size,
      totalConnections: this.rizoma.edges.length,
      version: this.rizoma.meta.version,
      date: this.rizoma.meta.date,
      categories: this.analyzeCategoryDensity(),
      hubs: this.findConceptualHubs(5)
    };
  }
}

export default RizomaLoader;
