#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Corrigindo referências em relations.json...\n');

const concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));
const relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));

// Criar mapa de nome -> id
const nameToId = new Map(concepts.map(c => [c.name, c.id]));

console.log(`   ${concepts.length} conceitos carregados`);
console.log(`   ${relations.length} relações carregadas\n`);

// Corrigir relações
let fixedFrom = 0;
let fixedTo = 0;
let notFoundFrom = new Set();
let notFoundTo = new Set();

const fixedRelations = relations.map((rel, idx) => {
  const newRel = { ...rel };
  
  // Tentar corrigir 'from'
  if (nameToId.has(rel.from)) {
    newRel.from = nameToId.get(rel.from);
    fixedFrom++;
  } else if (!nameToId.has(rel.from) && !concepts.find(c => c.id === rel.from)) {
    notFoundFrom.add(rel.from);
  }
  
  // Tentar corrigir 'to'
  if (nameToId.has(rel.to)) {
    newRel.to = nameToId.get(rel.to);
    fixedTo++;
  } else if (!nameToId.has(rel.to) && !concepts.find(c => c.id === rel.to)) {
    notFoundTo.add(rel.to);
  }
  
  return newRel;
});

console.log('📊 RESULTADO DA CORREÇÃO:\n');
console.log(`   ✅ ${fixedFrom} referências FROM corrigidas`);
console.log(`   ✅ ${fixedTo} referências TO corrigidas`);

if (notFoundFrom.size > 0) {
  console.log(`\n   ⚠️  ${notFoundFrom.size} referências FROM não encontradas:`);
  Array.from(notFoundFrom).slice(0, 5).forEach(ref => console.log(`      - ${ref}`));
  if (notFoundFrom.size > 5) console.log(`      ... e mais ${notFoundFrom.size - 5}`);
}

if (notFoundTo.size > 0) {
  console.log(`\n   ⚠️  ${notFoundTo.size} referências TO não encontradas:`);
  Array.from(notFoundTo).slice(0, 5).forEach(ref => console.log(`      - ${ref}`));
  if (notFoundTo.size > 5) console.log(`      ... e mais ${notFoundTo.size - 5}`);
}

// Salvar backup
const backupPath = './assets/relations.json.backup_before_fix';
writeFileSync(backupPath, JSON.stringify(relations, null, 2));
console.log(`\n💾 Backup salvo em: ${backupPath}`);

// Salvar arquivo corrigido
writeFileSync('./assets/relations.json', JSON.stringify(fixedRelations, null, 2));
console.log('💾 Arquivo corrigido salvo em: ./assets/relations.json\n');

console.log('✨ Correção concluída!\n');
