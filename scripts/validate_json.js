#!/usr/bin/env node

import { readFileSync } from 'fs';

console.log('🔍 Validando estrutura do Rizoma...\n');

// Carregar arquivos
let concepts, relations;

try {
  concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));
  console.log('✅ concepts.json carregado com sucesso');
  console.log(`   ${concepts.length} conceitos encontrados\n`);
} catch (e) {
  console.error('❌ Erro ao carregar concepts.json:', e.message);
  process.exit(1);
}

try {
  relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));
  console.log('✅ relations.json carregado com sucesso');
  console.log(`   ${relations.length} relações encontradas\n`);
} catch (e) {
  console.error('❌ Erro ao carregar relations.json:', e.message);
  process.exit(1);
}

// Criar índice de IDs de conceitos
const conceptIds = new Set(concepts.map(c => c.id));
console.log('📋 CONCEITOS ÚNICOS:\n');
console.log(`   Total de IDs únicos: ${conceptIds.size}`);
console.log(`   Total de conceitos: ${concepts.length}`);
if (conceptIds.size !== concepts.length) {
  console.log(`   ⚠️  ${concepts.length - conceptIds.size} IDs duplicados!\n`);
} else {
  console.log(`   ✅ Nenhuma duplicação\n`);
}

// Verificar estrutura dos conceitos
console.log('🔬 ESTRUTURA DOS CONCEITOS:\n');
let invalidConcepts = 0;
const requiredFields = ['id', 'name', 'description', 'layer'];

concepts.forEach((concept, idx) => {
  const missing = requiredFields.filter(field => !concept[field]);
  if (missing.length > 0) {
    console.log(`   ⚠️  Conceito #${idx}: faltam campos [${missing.join(', ')}]`);
    invalidConcepts++;
  }
});

if (invalidConcepts === 0) {
  console.log('   ✅ Todos os conceitos têm campos obrigatórios\n');
} else {
  console.log(`   ❌ ${invalidConcepts} conceitos com campos faltando\n`);
}

// Verificar estrutura das relações
console.log('🔗 ESTRUTURA DAS RELAÇÕES:\n');
let invalidRelations = 0;
const relationFields = ['from', 'to', 'name', 'description'];

relations.forEach((relation, idx) => {
  const missing = relationFields.filter(field => !relation[field]);
  if (missing.length > 0) {
    console.log(`   ⚠️  Relação #${idx}: faltam campos [${missing.join(', ')}]`);
    invalidRelations++;
  }
});

if (invalidRelations === 0) {
  console.log('   ✅ Todas as relações têm campos obrigatórios\n');
} else {
  console.log(`   ❌ ${invalidRelations} relações com campos faltando\n`);
}

// Verificar integridade referencial
console.log('🔍 INTEGRIDADE REFERENCIAL:\n');
let brokenRefs = 0;
const brokenRelations = [];

relations.forEach((relation, idx) => {
  if (!conceptIds.has(relation.from)) {
    brokenRelations.push({ idx, field: 'from', id: relation.from });
    brokenRefs++;
  }
  if (!conceptIds.has(relation.to)) {
    brokenRelations.push({ idx, field: 'to', id: relation.to });
    brokenRefs++;
  }
});

if (brokenRefs === 0) {
  console.log('   ✅ Todas as relações referenciam conceitos válidos\n');
} else {
  console.log(`   ❌ ${brokenRefs} referências quebradas encontradas:\n`);
  brokenRelations.slice(0, 10).forEach(br => {
    console.log(`      Relação #${br.idx}: campo "${br.field}" → "${br.id}" não existe`);
  });
  if (brokenRelations.length > 10) {
    console.log(`      ... e mais ${brokenRelations.length - 10} erros\n`);
  } else {
    console.log('');
  }
}

// Estatísticas de conectividade
console.log('📊 ESTATÍSTICAS DE CONECTIVIDADE:\n');
const connectivity = new Map();
conceptIds.forEach(id => connectivity.set(id, { in: 0, out: 0 }));

relations.forEach(rel => {
  if (conceptIds.has(rel.from)) {
    connectivity.get(rel.from).out++;
  }
  if (conceptIds.has(rel.to)) {
    connectivity.get(rel.to).in++;
  }
});

const isolated = Array.from(connectivity.entries())
  .filter(([_, conn]) => conn.in === 0 && conn.out === 0)
  .map(([id, _]) => id);

const lowConnectivity = Array.from(connectivity.entries())
  .filter(([_, conn]) => conn.in + conn.out <= 2 && conn.in + conn.out > 0)
  .map(([id, conn]) => ({ id, total: conn.in + conn.out }));

console.log(`   Conceitos isolados: ${isolated.length}`);
if (isolated.length > 0 && isolated.length <= 10) {
  isolated.forEach(id => console.log(`      - ${id}`));
}

console.log(`   Conceitos com baixa conectividade (≤2): ${lowConnectivity.length}`);
if (lowConnectivity.length > 0 && lowConnectivity.length <= 10) {
  lowConnectivity.forEach(c => console.log(`      - ${c.id} (${c.total} conexões)`));
}

// Distribuição por camadas
console.log('\n🌐 DISTRIBUIÇÃO POR CAMADAS:\n');
const layerCounts = {};
concepts.forEach(c => {
  layerCounts[c.layer] = (layerCounts[c.layer] || 0) + 1;
});

Object.entries(layerCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([layer, count]) => {
    console.log(`   ${layer}: ${count} conceitos`);
  });

// Resumo final
console.log('\n' + '='.repeat(50));
console.log('📈 RESUMO:\n');
console.log(`   ✓ ${concepts.length} conceitos`);
console.log(`   ✓ ${conceptIds.size} IDs únicos`);
console.log(`   ✓ ${relations.length} relações`);
console.log(`   ${brokenRefs === 0 ? '✓' : '✗'} Integridade referencial`);
console.log(`   ${invalidConcepts === 0 && invalidRelations === 0 ? '✓' : '✗'} Estrutura válida`);
console.log('='.repeat(50) + '\n');

process.exit(brokenRefs > 0 || invalidConcepts > 0 || invalidRelations > 0 ? 1 : 0);
