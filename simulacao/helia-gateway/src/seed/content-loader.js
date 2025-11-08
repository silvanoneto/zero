/**
 * Content Loader - Carrega JSONL e XML da Revolução Cibernética
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ContentLoader {
  constructor() {
    this.jsonlContent = [];
    this.xmlContent = null;
    this.index = {
      byDocument: new Map(),
      byCategory: new Map(),
      bySection: new Map(),
      fullText: []
    };
  }

  /**
   * Carrega conteúdo JSONL
   */
  async loadJSONL() {
    try {
      const jsonlPath = path.join(__dirname, '../../../docs/revolucao_cibernetica.jsonl');
      const data = await fs.readFile(jsonlPath, 'utf-8');
      
      const lines = data.trim().split('\n');
      this.jsonlContent = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn('⚠️  Linha JSONL inválida:', line.substring(0, 50));
          return null;
        }
      }).filter(Boolean);

      console.log('📝 Conteúdo JSONL carregado:');
      console.log(`   → Total de parágrafos: ${this.jsonlContent.length}`);

      // Indexar por documento
      this.indexJSONL();
      
      return this.jsonlContent;
    } catch (error) {
      console.error('❌ Erro ao carregar JSONL:', error.message);
      throw error;
    }
  }

  /**
   * Indexa conteúdo JSONL para busca rápida
   */
  indexJSONL() {
    this.jsonlContent.forEach(item => {
      // Por documento
      const docType = item.document_type || 'unknown';
      if (!this.index.byDocument.has(docType)) {
        this.index.byDocument.set(docType, []);
      }
      this.index.byDocument.get(docType).push(item);

      // Por categoria (se houver)
      if (item.category) {
        if (!this.index.byCategory.has(item.category)) {
          this.index.byCategory.set(item.category, []);
        }
        this.index.byCategory.get(item.category).push(item);
      }

      // Por seção
      const sectionTitle = item.section_title || 'untitled';
      if (!this.index.bySection.has(sectionTitle)) {
        this.index.bySection.set(sectionTitle, []);
      }
      this.index.bySection.get(sectionTitle).push(item);

      // Texto completo para busca
      this.index.fullText.push({
        id: item.paragraph_id,
        section: sectionTitle,
        text: item.text,
        document: docType
      });
    });

    console.log(`   → Documentos indexados: ${this.index.byDocument.size}`);
    console.log(`   → Seções indexadas: ${this.index.bySection.size}`);
    if (this.index.byCategory.size > 0) {
      console.log(`   → Categorias indexadas: ${this.index.byCategory.size}`);
    }
  }

  /**
   * Carrega conteúdo XML
   */
  async loadXML() {
    try {
      const xmlPath = path.join(__dirname, '../../../docs/revolucao_cibernetica.xml');
      const data = await fs.readFile(xmlPath, 'utf-8');
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true
      });
      
      this.xmlContent = parser.parse(data);

      console.log('📄 Conteúdo XML carregado:');
      
      // Contar elementos
      const stats = this.analyzeXMLStructure();
      console.log(`   → Total de documentos: ${stats.documents}`);
      console.log(`   → Total de seções: ${stats.sections}`);
      console.log(`   → Total de parágrafos: ${stats.paragraphs}`);
      
      return this.xmlContent;
    } catch (error) {
      console.error('❌ Erro ao carregar XML:', error.message);
      throw error;
    }
  }

  /**
   * Analisa estrutura do XML
   */
  analyzeXMLStructure() {
    const stats = {
      documents: 0,
      sections: 0,
      paragraphs: 0,
      quotes: 0,
      lists: 0
    };

    if (!this.xmlContent?.revolution) return stats;

    const docs = this.xmlContent.revolution.document;
    const docArray = Array.isArray(docs) ? docs : [docs];
    
    stats.documents = docArray.length;

    docArray.forEach(doc => {
      if (doc.section) {
        const sections = Array.isArray(doc.section) ? doc.section : [doc.section];
        stats.sections += sections.length;

        sections.forEach(section => {
          if (section.content?.paragraph) {
            const paras = Array.isArray(section.content.paragraph) 
              ? section.content.paragraph 
              : [section.content.paragraph];
            stats.paragraphs += paras.length;
          }

          if (section.quotes?.quote) {
            const quotes = Array.isArray(section.quotes.quote)
              ? section.quotes.quote
              : [section.quotes.quote];
            stats.quotes += quotes.length;
          }

          if (section.lists?.list) {
            const lists = Array.isArray(section.lists.list)
              ? section.lists.list
              : [section.lists.list];
            stats.lists += lists.length;
          }
        });
      }
    });

    return stats;
  }

  /**
   * Busca no conteúdo JSONL
   */
  searchJSONL(query, options = {}) {
    const {
      documentType = null,
      category = null,
      section = null,
      limit = 10
    } = options;

    let results = this.index.fullText;

    // Filtrar por documento
    if (documentType) {
      results = results.filter(r => r.document === documentType);
    }

    // Filtrar por seção
    if (section) {
      results = results.filter(r => r.section === section);
    }

    // Busca textual
    const lowerQuery = query.toLowerCase();
    results = results.filter(r => 
      r.text.toLowerCase().includes(lowerQuery)
    );

    // Limitar resultados
    return results.slice(0, limit);
  }

  /**
   * Extrai texto de uma seção do XML
   */
  extractXMLSection(documentType, sectionTitle) {
    if (!this.xmlContent?.revolution?.document) return null;

    const docs = Array.isArray(this.xmlContent.revolution.document)
      ? this.xmlContent.revolution.document
      : [this.xmlContent.revolution.document];

    const doc = docs.find(d => d['@_type'] === documentType);
    if (!doc?.section) return null;

    const sections = Array.isArray(doc.section) ? doc.section : [doc.section];
    const section = sections.find(s => s.title === sectionTitle);

    if (!section) return null;

    const paragraphs = [];
    if (section.content?.paragraph) {
      const paras = Array.isArray(section.content.paragraph)
        ? section.content.paragraph
        : [section.content.paragraph];
      paragraphs.push(...paras.map(p => typeof p === 'object' ? p['#text'] : p));
    }

    return {
      title: sectionTitle,
      level: section['@_level'],
      paragraphs,
      quotes: this.extractQuotes(section),
      lists: this.extractLists(section)
    };
  }

  /**
   * Extrai citações de uma seção
   */
  extractQuotes(section) {
    if (!section.quotes?.quote) return [];
    
    const quotes = Array.isArray(section.quotes.quote)
      ? section.quotes.quote
      : [section.quotes.quote];
    
    return quotes.map(q => typeof q === 'object' ? q['#text'] : q);
  }

  /**
   * Extrai listas de uma seção
   */
  extractLists(section) {
    if (!section.lists?.list) return [];
    
    const lists = Array.isArray(section.lists.list)
      ? section.lists.list
      : [section.lists.list];
    
    return lists.map(list => {
      const items = Array.isArray(list.item) ? list.item : [list.item];
      return {
        type: list['@_type'],
        items: items.map(i => typeof i === 'object' ? i['#text'] : i)
      };
    });
  }

  /**
   * Obtém todos os documentos disponíveis
   */
  getDocuments() {
    const jsonlDocs = Array.from(this.index.byDocument.keys());
    
    let xmlDocs = [];
    if (this.xmlContent?.revolution?.document) {
      const docs = Array.isArray(this.xmlContent.revolution.document)
        ? this.xmlContent.revolution.document
        : [this.xmlContent.revolution.document];
      xmlDocs = docs.map(d => d['@_type']);
    }

    return {
      jsonl: jsonlDocs,
      xml: xmlDocs
    };
  }

  /**
   * Obtém todas as seções de um documento
   */
  getSections(documentType) {
    const jsonlSections = [];
    const docContent = this.index.byDocument.get(documentType);
    
    if (docContent) {
      const uniqueSections = new Set(docContent.map(c => c.section_title));
      jsonlSections.push(...uniqueSections);
    }

    return jsonlSections;
  }

  /**
   * Obtém estatísticas completas
   */
  getStats() {
    return {
      jsonl: {
        totalParagraphs: this.jsonlContent.length,
        documents: this.index.byDocument.size,
        sections: this.index.bySection.size,
        categories: this.index.byCategory.size
      },
      xml: this.analyzeXMLStructure(),
      documents: this.getDocuments()
    };
  }

  /**
   * Busca semântica (preparação para embeddings futuros)
   */
  semanticSearch(query, limit = 10) {
    // Por enquanto, busca textual simples
    // TODO: Implementar embeddings com modelo de linguagem
    return this.searchJSONL(query, { limit });
  }

  /**
   * Extrai contexto ao redor de um parágrafo específico
   */
  getContext(paragraphId, contextSize = 2) {
    const index = this.jsonlContent.findIndex(p => p.paragraph_id === paragraphId);
    if (index === -1) return null;

    const start = Math.max(0, index - contextSize);
    const end = Math.min(this.jsonlContent.length, index + contextSize + 1);

    return {
      target: this.jsonlContent[index],
      before: this.jsonlContent.slice(start, index),
      after: this.jsonlContent.slice(index + 1, end)
    };
  }
}

export default ContentLoader;
