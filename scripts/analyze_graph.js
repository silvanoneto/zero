#!/usr/bin/env node

import { readFileSync } from 'fs';

const concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));
const relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));

console.log('📊 ANÁLISE DETALHADA DO GRAFO DE CONHECIMENTO\n');
console.log('='.repeat(60) + '\n');

// 1. Estatísticas básicas
console.log('📈 ESTATÍSTICAS BÁSICAS:\n');
console.log(`   Conceitos: ${concepts.length}`);
console.log(`   Relações: ${relations.length}`);
console.log(`   Densidade: ${(relations.length / (concepts.length * concepts.length) * 100).toFixed(2)}%`);
console.log(`   Média de relações por conceito: ${(relations.length * 2 / concepts.length).toFixed(2)}\n`);

// 2. Análise de conectividade
const connectivity = new Map();
concepts.forEach(c => connectivity.set(c.id, { in: 0, out: 0, inRels: [], outRels: [] }));

relations.forEach(rel => {
  if (connectivity.has(rel.from)) {
    connectivity.get(rel.from).out++;
    connectivity.get(rel.from).outRels.push(rel);
  }
  if (connectivity.has(rel.to)) {
    connectivity.get(rel.to).in++;
    connectivity.get(rel.to).inRels.push(rel);
  }
});

const connArray = Array.from(connectivity.entries()).map(([id, conn]) => ({
  id,
  in: conn.in,
  out: conn.out,
  total: conn.in + conn.out
}));

console.log('🔗 ANÁLISE DE CONECTIVIDADE:\n');

// Top 10 mais conectados
const top10 = connArray.sort((a, b) => b.total - a.total).slice(0, 10);
console.log('   Top 10 conceitos mais conectados:');
top10.forEach((c, i) => {
  const concept = concepts.find(con => con.id === c.id);
  console.log(`   ${i + 1}. ${concept.name}`);
  console.log(`      ID: ${c.id}`);
  console.log(`      Total: ${c.total} (${c.in} entrada / ${c.out} saída)\n`);
});

// Distribuição de conectividade
const connDistribution = {
  isolated: connArray.filter(c => c.total === 0).length,
  low: connArray.filter(c => c.total > 0 && c.total <= 5).length,
  medium: connArray.filter(c => c.total > 5 && c.total <= 15).length,
  high: connArray.filter(c => c.total > 15 && c.total <= 30).length,
  veryHigh: connArray.filter(c => c.total > 30).length
};

console.log('\n   Distribuição de conectividade:');
console.log(`   Isolados (0): ${connDistribution.isolated}`);
console.log(`   Baixa (1-5): ${connDistribution.low}`);
console.log(`   Média (6-15): ${connDistribution.medium}`);
console.log(`   Alta (16-30): ${connDistribution.high}`);
console.log(`   Muito Alta (>30): ${connDistribution.veryHigh}\n`);

// 3. Análise de verbos (tipos de relação)
console.log('🔤 ANÁLISE DE VERBOS:\n');
const verbCounts = {};
relations.forEach(rel => {
  verbCounts[rel.name] = (verbCounts[rel.name] || 0) + 1;
});

const topVerbs = Object.entries(verbCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

console.log('   Top 15 verbos mais usados:');
topVerbs.forEach(([verb, count], i) => {
  const percentage = (count / relations.length * 100).toFixed(1);
  console.log(`   ${i + 1}. "${verb}": ${count} (${percentage}%)`);
});

console.log(`\n   Total de verbos únicos: ${Object.keys(verbCounts).length}\n`);

// 4. Análise por camadas
console.log('🌐 CONECTIVIDADE POR CAMADA:\n');
const layerStats = {};

concepts.forEach(c => {
  if (!layerStats[c.layer]) {
    layerStats[c.layer] = { concepts: 0, totalConn: 0 };
  }
  layerStats[c.layer].concepts++;
  const conn = connectivity.get(c.id);
  layerStats[c.layer].totalConn += (conn.in + conn.out);
});

Object.entries(layerStats)
  .map(([layer, stats]) => ({
    layer,
    concepts: stats.concepts,
    avgConn: (stats.totalConn / stats.concepts).toFixed(1)
  }))
  .sort((a, b) => b.avgConn - a.avgConn)
  .slice(0, 10)
  .forEach(({ layer, concepts, avgConn }) => {
    console.log(`   ${layer}: ${avgConn} conexões/conceito (${concepts} conceitos)`);
  });

// 5. Análise de hubs (conceitos centrais)
console.log('\n\n🎯 HUBS DO RIZOMA (Conceitos Centrais):\n');
const hubs = connArray
  .filter(c => c.total > 20)
  .sort((a, b) => b.total - a.total);

hubs.forEach(hub => {
  const concept = concepts.find(c => c.id === hub.id);
  console.log(`   📍 ${concept.name}`);
  console.log(`      Layer: ${concept.layer}`);
  console.log(`      Conexões: ${hub.total} (${hub.in}↓ / ${hub.out}↑)`);
  
  // Principais conexões de saída
  const outConns = connectivity.get(hub.id).outRels;
  const topOut = outConns
    .reduce((acc, rel) => {
      acc[rel.name] = (acc[rel.name] || 0) + 1;
      return acc;
    }, {});
  const topOutVerbs = Object.entries(topOut)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([v, c]) => `${v}(${c})`)
    .join(', ');
  console.log(`      Verbos de saída: ${topOutVerbs}`);
  console.log('');
});

console.log('\n' + '='.repeat(60));
console.log('✅ Análise concluída!\n');
