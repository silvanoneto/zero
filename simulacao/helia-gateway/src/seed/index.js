#!/usr/bin/env node
/**
 * Seed Script - Inicializa sistema com rizoma, análise de logs e autopropostas
 * Executado automaticamente no startup do container
 */

import { ProposalGenerator } from './proposal-generator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  🌀 REVOLUÇÃO CIBERNÉTICA - SISTEMA DE SEED  ', 'bright');
  log('  Cybersyn 2.0 | Governança Biomimética', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
}

async function main() {
  banner();
  
  try {
    const generator = new ProposalGenerator();
    
    // 1. Inicializar loaders
    log('📦 FASE 1: Carregando dados do sistema...', 'blue');
    const { logAnalysis } = await generator.initialize();
    
    // 2. Gerar propostas
    log('\n🧠 FASE 2: Gerando autopropostas...', 'blue');
    const proposals = await generator.generateProposals(logAnalysis);
    
    // 3. Agrupar por tema
    log('\n📊 FASE 3: Organizando propostas por tema DAO...', 'blue');
    const grouped = generator.groupProposalsByTheme(proposals);
    const stats = generator.getProposalStats(proposals);
    
    // 4. Salvar propostas
    log('\n💾 FASE 4: Salvando propostas...', 'blue');
    await saveProposals(proposals, grouped, stats);
    
    // 5. Exibir resumo
    log('\n📈 RESUMO DA EXECUÇÃO:', 'green');
    displaySummary(stats, logAnalysis);
    
    log('\n✅ Seed concluído com sucesso!', 'green');
    log('='.repeat(70) + '\n', 'cyan');
    
    return { proposals, stats, logAnalysis };
  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Salva propostas em arquivos JSON
 */
async function saveProposals(proposals, grouped, stats) {
  const outputDir = path.join(__dirname, '../data/seed');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    // Propostas completas
    await fs.writeFile(
      path.join(outputDir, 'proposals.json'),
      JSON.stringify(proposals, null, 2)
    );
    log('   ✓ proposals.json salvo', 'green');
    
    // Agrupadas por tema
    await fs.writeFile(
      path.join(outputDir, 'proposals-by-theme.json'),
      JSON.stringify(grouped, null, 2)
    );
    log('   ✓ proposals-by-theme.json salvo', 'green');
    
    // Estatísticas
    await fs.writeFile(
      path.join(outputDir, 'stats.json'),
      JSON.stringify(stats, null, 2)
    );
    log('   ✓ stats.json salvo', 'green');
    
    // Timestamp da última execução
    await fs.writeFile(
      path.join(outputDir, 'last-run.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        proposalCount: proposals.length
      }, null, 2)
    );
    log('   ✓ last-run.json salvo', 'green');
    
  } catch (error) {
    log(`   ✗ Erro ao salvar arquivos: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Exibe resumo da execução
 */
function displaySummary(stats, logAnalysis) {
  log(`\n   Total de propostas: ${stats.total}`, 'yellow');
  
  log('\n   Por Prioridade:', 'yellow');
  log(`      • Critical: ${stats.byPriority.critical}`);
  log(`      • High: ${stats.byPriority.high}`);
  log(`      • Medium: ${stats.byPriority.medium}`);
  log(`      • Low: ${stats.byPriority.low}`);
  
  log('\n   Por Fonte:', 'yellow');
  log(`      • Análise de Logs: ${stats.bySource.log_analysis}`);
  log(`      • Análise do Rizoma: ${stats.bySource.rizoma_analysis}`);
  log(`      • Análise de Lacunas: ${stats.bySource.gap_analysis}`);
  log(`      • Cybersyn 2.0: ${stats.bySource.constitution_2_0}`);
  
  log('\n   Por Tipo de Votação:', 'yellow');
  log(`      • Linear: ${stats.byVoteType.LINEAR}`);
  log(`      • Quadrática: ${stats.byVoteType.QUADRATIC}`);
  log(`      • Logarítmica: ${stats.byVoteType.LOGARITHMIC}`);
  log(`      • Consenso: ${stats.byVoteType.CONSENSUS}`);
  
  log('\n   Por Tema DAO:', 'yellow');
  Object.entries(stats.byTheme).forEach(([theme, proposals]) => {
    if (proposals.length > 0) {
      log(`      • ${theme}: ${proposals.length} proposta(s)`);
    }
  });
  
  if (logAnalysis?.summary) {
    log('\n   Análise de Logs:', 'yellow');
    log(`      • Erros: ${logAnalysis.summary.totalErrors || 0}`);
    log(`      • Avisos: ${logAnalysis.summary.totalWarnings || 0}`);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export { main as runSeed };
