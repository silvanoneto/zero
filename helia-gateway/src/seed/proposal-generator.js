/**
 * Proposal Generator - Gera autopropostas baseadas no rizoma, logs e conteúdo
 */

import { RizomaLoader } from './rizoma-loader.js';
import { LogAnalyzer } from './log-analyzer.js';
import { ContentLoader } from './content-loader.js';

export class ProposalGenerator {
  constructor() {
    this.rizomaLoader = new RizomaLoader();
    this.logAnalyzer = new LogAnalyzer();
    this.contentLoader = new ContentLoader();
    
    // Temas das DAOs baseados na Constituição 2.0
    this.daoThemes = {
      biomimetica: {
        name: 'Biomimética',
        keywords: ['natureza', 'evolução', 'adaptação', 'resiliência', 'ecossistema'],
        focus: 'Inspiração em sistemas naturais para governança'
      },
      feedback: {
        name: 'Loops de Feedback',
        keywords: ['feedback', 'iteração', 'aprendizado', 'ajuste', 'ciclo'],
        focus: 'Sistemas de feedback e aprendizado contínuo'
      },
      diversidade: {
        name: 'Diversidade Cognitiva',
        keywords: ['diversidade', 'pluralidade', 'perspectivas', 'inclusão', 'heterogeneidade'],
        focus: 'Valorização de diferentes perspectivas'
      },
      redundancia: {
        name: 'Redundância Adaptativa',
        keywords: ['redundância', 'resiliência', 'backup', 'distribuição', 'descentralização'],
        focus: 'Sistemas resilientes e distribuídos'
      },
      emergencia: {
        name: 'Propriedades Emergentes',
        keywords: ['emergência', 'complexidade', 'auto-organização', 'padrões', 'sistema'],
        focus: 'Comportamentos emergentes em sistemas complexos'
      },
      mutacao: {
        name: 'Mutação Controlada',
        keywords: ['mudança', 'inovação', 'experimento', 'teste', 'evolução'],
        focus: 'Experimentação e inovação controlada'
      },
      simbiose: {
        name: 'Simbiose Sistêmica',
        keywords: ['colaboração', 'parceria', 'cooperação', 'mutualismo', 'sinergia'],
        focus: 'Relações mutuamente benéficas'
      }
    };
  }

  /**
   * Inicializa todos os loaders
   */
  async initialize() {
    console.log('\n🚀 Inicializando gerador de propostas...\n');
    
    try {
      await this.rizomaLoader.load();
      await this.contentLoader.loadJSONL();
      await this.contentLoader.loadXML();
      const logAnalysis = await this.logAnalyzer.analyzeLogs();
      
      console.log('\n✅ Inicialização completa!\n');
      
      return { logAnalysis };
    } catch (error) {
      console.error('❌ Erro na inicialização:', error.message);
      throw error;
    }
  }

  /**
   * Gera propostas automáticas baseadas em análise do sistema
   */
  async generateProposals(logAnalysis) {
    console.log('🧠 Gerando autopropostas...\n');
    
    const proposals = [];

    // 1. Propostas baseadas em problemas de logs
    const logProposals = this.generateLogBasedProposals(logAnalysis);
    proposals.push(...logProposals);

    // 2. Propostas baseadas em temas do rizoma
    const rizomaProposals = this.generateRizomaBasedProposals();
    proposals.push(...rizomaProposals);

    // 3. Propostas baseadas em lacunas conceituais
    const gapProposals = this.generateGapProposals();
    proposals.push(...gapProposals);

    // 4. Propostas de governança da Constituição 2.0
    const govProposals = this.generateGovernanceProposals();
    proposals.push(...govProposals);

    console.log(`✅ ${proposals.length} propostas geradas!\n`);
    
    return proposals;
  }

  /**
   * Gera propostas baseadas em problemas dos logs
   */
  generateLogBasedProposals(logAnalysis) {
    const proposals = [];

    if (!logAnalysis?.recommendations) return proposals;

    logAnalysis.recommendations.forEach((rec, index) => {
      const theme = this.mapCategoryToTheme(rec.category);
      
      proposals.push({
        id: `log-${index + 1}`,
        title: rec.issue,
        description: rec.suggestion,
        category: rec.category,
        priority: rec.priority,
        daoTheme: theme,
        voteType: this.determineVoteType(rec),
        source: 'log_analysis',
        metadata: {
          errorCount: logAnalysis.summary?.totalErrors || 0,
          warningCount: logAnalysis.summary?.totalWarnings || 0
        },
        created: new Date().toISOString()
      });
    });

    return proposals;
  }

  /**
   * Gera propostas baseadas no rizoma
   */
  generateRizomaBasedProposals() {
    const proposals = [];
    const hubs = this.rizomaLoader.findConceptualHubs(10);
    const density = this.rizomaLoader.analyzeCategoryDensity();

    // Propostas para fortalecer hubs conceituais
    hubs.slice(0, 3).forEach((hub, index) => {
      const theme = this.findRelevantTheme(hub.name);
      
      proposals.push({
        id: `rizoma-hub-${index + 1}`,
        title: `Expandir conceito: ${hub.name}`,
        description: `Desenvolver mais conexões e aplicações práticas do conceito "${hub.name}", que atualmente possui ${hub.connections} conexões no rizoma.`,
        category: 'knowledge_expansion',
        priority: 'medium',
        daoTheme: theme,
        voteType: 'QUADRATIC',
        source: 'rizoma_analysis',
        metadata: {
          conceptId: hub.id,
          currentConnections: hub.connections,
          category: hub.category
        },
        created: new Date().toISOString()
      });
    });

    // Propostas para categorias com baixa densidade
    const lowDensity = Object.entries(density)
      .filter(([cat, data]) => data.avgConnections < 3)
      .slice(0, 2);

    lowDensity.forEach(([category, data], index) => {
      const theme = this.findRelevantTheme(category);
      
      proposals.push({
        id: `rizoma-density-${index + 1}`,
        title: `Fortalecer categoria: ${category}`,
        description: `Aumentar conexões entre conceitos da categoria "${category}" (média atual: ${data.avgConnections} conexões). Criar relações com outros temas do projeto.`,
        category: 'knowledge_integration',
        priority: 'low',
        daoTheme: theme,
        voteType: 'LINEAR',
        source: 'rizoma_analysis',
        metadata: {
          category,
          currentAvg: data.avgConnections,
          conceptCount: data.count
        },
        created: new Date().toISOString()
      });
    });

    return proposals;
  }

  /**
   * Gera propostas baseadas em lacunas conceituais
   */
  generateGapProposals() {
    const proposals = [];

    // Lacunas identificadas através da análise do conteúdo
    const gaps = [
      {
        area: 'Implementação Prática',
        description: 'Criar guias práticos de implementação dos conceitos teóricos',
        keywords: ['prática', 'implementação', 'aplicação']
      },
      {
        area: 'Métricas e Avaliação',
        description: 'Desenvolver sistema de métricas para avaliar efetividade das DAOs',
        keywords: ['métrica', 'avaliação', 'medição', 'kpi']
      },
      {
        area: 'Resolução de Conflitos',
        description: 'Estabelecer processos claros para resolução de conflitos e disputas',
        keywords: ['conflito', 'disputa', 'mediação']
      }
    ];

    gaps.forEach((gap, index) => {
      const theme = this.findRelevantTheme(gap.area);
      
      proposals.push({
        id: `gap-${index + 1}`,
        title: `Preencher lacuna: ${gap.area}`,
        description: gap.description,
        category: 'system_improvement',
        priority: 'high',
        daoTheme: theme,
        voteType: 'CONSENSUS',
        source: 'gap_analysis',
        metadata: {
          keywords: gap.keywords
        },
        created: new Date().toISOString()
      });
    });

    return proposals;
  }

  /**
   * Gera propostas de governança da Constituição 2.0
   */
  generateGovernanceProposals() {
    const proposals = [];

    // Propostas para cada tema da DAO
    Object.entries(this.daoThemes).forEach(([key, theme], index) => {
      proposals.push({
        id: `gov-${key}`,
        title: `Implementar DAO ${theme.name}`,
        description: `Estabelecer estrutura de governança para ${theme.focus}. Definir processos, responsabilidades e métricas de sucesso.`,
        category: 'governance',
        priority: 'high',
        daoTheme: key,
        voteType: 'QUADRATIC',
        source: 'constitution_2.0',
        metadata: {
          keywords: theme.keywords,
          focus: theme.focus
        },
        created: new Date().toISOString()
      });
    });

    return proposals;
  }

  /**
   * Mapeia categoria de problema para tema de DAO
   */
  mapCategoryToTheme(category) {
    const mapping = {
      performance: 'redundancia',
      security: 'diversidade',
      resource: 'redundancia',
      stability: 'feedback'
    };
    
    return mapping[category] || 'emergencia';
  }

  /**
   * Determina tipo de votação baseado na recomendação
   */
  determineVoteType(recommendation) {
    if (recommendation.priority === 'critical') return 'CONSENSUS';
    if (recommendation.priority === 'high') return 'QUADRATIC';
    if (recommendation.category === 'security') return 'CONSENSUS';
    return 'LINEAR';
  }

  /**
   * Encontra tema relevante baseado em texto
   */
  findRelevantTheme(text) {
    const lowerText = text.toLowerCase();
    
    for (const [key, theme] of Object.entries(this.daoThemes)) {
      if (theme.keywords.some(kw => lowerText.includes(kw))) {
        return key;
      }
    }
    
    return 'emergencia'; // Default
  }

  /**
   * Agrupa propostas por tema de DAO
   */
  groupProposalsByTheme(proposals) {
    const grouped = {};
    
    Object.keys(this.daoThemes).forEach(theme => {
      grouped[theme] = proposals.filter(p => p.daoTheme === theme);
    });
    
    return grouped;
  }

  /**
   * Obtém estatísticas das propostas
   */
  getProposalStats(proposals) {
    return {
      total: proposals.length,
      byPriority: {
        critical: proposals.filter(p => p.priority === 'critical').length,
        high: proposals.filter(p => p.priority === 'high').length,
        medium: proposals.filter(p => p.priority === 'medium').length,
        low: proposals.filter(p => p.priority === 'low').length
      },
      bySource: {
        log_analysis: proposals.filter(p => p.source === 'log_analysis').length,
        rizoma_analysis: proposals.filter(p => p.source === 'rizoma_analysis').length,
        gap_analysis: proposals.filter(p => p.source === 'gap_analysis').length,
        constitution_2_0: proposals.filter(p => p.source === 'constitution_2.0').length
      },
      byVoteType: {
        LINEAR: proposals.filter(p => p.voteType === 'LINEAR').length,
        QUADRATIC: proposals.filter(p => p.voteType === 'QUADRATIC').length,
        LOGARITHMIC: proposals.filter(p => p.voteType === 'LOGARITHMIC').length,
        CONSENSUS: proposals.filter(p => p.voteType === 'CONSENSUS').length
      },
      byTheme: this.groupProposalsByTheme(proposals)
    };
  }
}

export default ProposalGenerator;
