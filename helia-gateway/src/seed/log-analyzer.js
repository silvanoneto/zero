/**
 * Log Analyzer - Analisa logs do sistema para identificar problemas
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LogAnalyzer {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.patterns = {
      error: /ERROR|error|ERRO|erro|failed|Failed|FAILED/i,
      warning: /WARN|warn|WARNING|warning|aviso|atenção/i,
      performance: /slow|lento|timeout|exceeded|excedeu/i,
      security: /unauthorized|forbidden|denied|attack|ataque/i,
      resource: /memory|cpu|disk|space|espaço/i
    };
  }

  /**
   * Carrega e analisa logs do diretório
   */
  async analyzeLogs(logsDir = '../logs') {
    try {
      const logPath = path.join(__dirname, logsDir);
      
      // Verificar se diretório existe
      try {
        await fs.access(logPath);
      } catch {
        console.log('⚠️  Diretório de logs não encontrado, criando...');
        await fs.mkdir(logPath, { recursive: true });
        return { errors: [], warnings: [], analysis: {} };
      }

      const files = await fs.readdir(logPath);
      const logFiles = files.filter(f => f.endsWith('.log') || f.endsWith('.txt'));

      if (logFiles.length === 0) {
        console.log('ℹ️  Nenhum arquivo de log encontrado');
        return { errors: [], warnings: [], analysis: {} };
      }

      console.log(`📋 Analisando ${logFiles.length} arquivo(s) de log...`);

      for (const file of logFiles) {
        const content = await fs.readFile(path.join(logPath, file), 'utf-8');
        this.parseLogFile(content, file);
      }

      const analysis = this.generateAnalysis();
      console.log(`   → Erros encontrados: ${this.errors.length}`);
      console.log(`   → Avisos encontrados: ${this.warnings.length}`);

      return {
        errors: this.errors,
        warnings: this.warnings,
        analysis
      };
    } catch (error) {
      console.error('❌ Erro ao analisar logs:', error.message);
      return { errors: [], warnings: [], analysis: {} };
    }
  }

  /**
   * Parse de arquivo de log
   */
  parseLogFile(content, filename) {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      const entry = {
        line: index + 1,
        file: filename,
        content: line,
        timestamp: this.extractTimestamp(line)
      };

      // Classificar por padrões
      if (this.patterns.error.test(line)) {
        this.errors.push({ ...entry, type: 'error' });
      } else if (this.patterns.warning.test(line)) {
        this.warnings.push({ ...entry, type: 'warning' });
      }

      // Análises específicas
      if (this.patterns.performance.test(line)) {
        this.logs.push({ ...entry, category: 'performance' });
      }
      if (this.patterns.security.test(line)) {
        this.logs.push({ ...entry, category: 'security' });
      }
      if (this.patterns.resource.test(line)) {
        this.logs.push({ ...entry, category: 'resource' });
      }
    });
  }

  /**
   * Extrai timestamp de uma linha de log
   */
  extractTimestamp(line) {
    // Formatos comuns: ISO8601, Unix timestamp, etc
    const isoMatch = line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/);
    if (isoMatch) return new Date(isoMatch[0]);

    const unixMatch = line.match(/\d{10,13}/);
    if (unixMatch) {
      const ts = parseInt(unixMatch[0]);
      return new Date(ts > 9999999999 ? ts : ts * 1000);
    }

    return new Date();
  }

  /**
   * Gera análise consolidada
   */
  generateAnalysis() {
    const analysis = {
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalIssues: this.errors.length + this.warnings.length
      },
      categories: {
        performance: this.logs.filter(l => l.category === 'performance').length,
        security: this.logs.filter(l => l.category === 'security').length,
        resource: this.logs.filter(l => l.category === 'resource').length
      },
      topErrors: this.getTopErrors(5),
      recommendations: this.generateRecommendations()
    };

    return analysis;
  }

  /**
   * Identifica erros mais frequentes
   */
  getTopErrors(limit = 5) {
    const errorCounts = {};

    this.errors.forEach(err => {
      // Simplificar mensagem de erro (remover timestamps, IDs, etc)
      const simplified = err.content
        .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[\.,\d]*/g, '')
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '')
        .replace(/\d+/g, 'N')
        .trim();

      errorCounts[simplified] = (errorCounts[simplified] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  /**
   * Gera recomendações baseadas na análise
   */
  generateRecommendations() {
    const recommendations = [];

    // Performance
    if (this.logs.filter(l => l.category === 'performance').length > 10) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        issue: 'Alto número de problemas de performance detectados',
        suggestion: 'Implementar caching e otimização de queries'
      });
    }

    // Security
    if (this.logs.filter(l => l.category === 'security').length > 0) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        issue: 'Problemas de segurança detectados',
        suggestion: 'Revisar políticas de autenticação e autorização'
      });
    }

    // Resource
    if (this.logs.filter(l => l.category === 'resource').length > 5) {
      recommendations.push({
        category: 'resource',
        priority: 'medium',
        issue: 'Uso elevado de recursos do sistema',
        suggestion: 'Monitorar e otimizar uso de memória e CPU'
      });
    }

    // Errors
    if (this.errors.length > 50) {
      recommendations.push({
        category: 'stability',
        priority: 'high',
        issue: 'Taxa de erros elevada',
        suggestion: 'Implementar melhor tratamento de erros e retry logic'
      });
    }

    return recommendations;
  }
}

export default LogAnalyzer;
