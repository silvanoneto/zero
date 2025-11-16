#!/usr/bin/env node

import { readFileSync } from 'fs';

const relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));
const concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));

const conceptIds = new Set(concepts.map(c => c.id));
const conceptNames = new Map(concepts.map(c => [c.name, c.id]));

// Verificar padrões nas referências quebradas
const brokenFroms = new Set();
const brokenTos = new Set();

relations.forEach(rel => {
  if (!conceptIds.has(rel.from)) brokenFroms.add(rel.from);
  if (!conceptIds.has(rel.to)) brokenTos.add(rel.to);
});

console.log('Exemplos de referências quebradas no campo FROM:');
Array.from(brokenFroms).slice(0, 10).forEach(ref => {
  const hasName = conceptNames.has(ref);
  console.log(`  '${ref}' - ${hasName ? 'É um NAME (ID: ' + conceptNames.get(ref) + ')' : 'Não encontrado'}`);
});

console.log('\nExemplos de referências quebradas no campo TO:');
Array.from(brokenTos).slice(0, 10).forEach(ref => {
  const hasName = conceptNames.has(ref);
  console.log(`  '${ref}' - ${hasName ? 'É um NAME (ID: ' + conceptNames.get(ref) + ')' : 'Não encontrado'}`);
});

console.log(`\nTotal de referências quebradas FROM: ${brokenFroms.size}`);
console.log(`Total de referências quebradas TO: ${brokenTos.size}`);
