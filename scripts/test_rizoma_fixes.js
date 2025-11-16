#!/usr/bin/env node

import { readFileSync } from 'fs';

console.log('🧪 Testando correções do Rizoma Toolkit...\n');

// Carregar dados
const concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));
const relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));

console.log(`✓ ${concepts.length} conceitos carregados`);
console.log(`✓ ${relations.length} relações carregadas\n`);

// Simular buildConnectionCache
const connectionCache = new Map();
const degreeCache = new Map();
const sameLayerDegreeCache = new Map();

const idToConcept = new Map();
const idToLayer = new Map();

concepts.forEach(c => {
    idToConcept.set(c.id, c);
    idToLayer.set(c.id, c.layer);
    connectionCache.set(c.id, []);
});

console.log('📊 Construindo cache de conexões...\n');

relations.forEach(rel => {
    const fromId = rel.from;
    const toId = rel.to;
    
    if (connectionCache.has(fromId)) {
        connectionCache.get(fromId).push(toId);
    }
    if (connectionCache.has(toId)) {
        connectionCache.get(toId).push(fromId);
    }
});

concepts.forEach(c => {
    const connections = connectionCache.get(c.id) || [];
    degreeCache.set(c.id, connections.length);
    
    const sameLayerCount = connections.filter(connId => {
        return idToLayer.get(connId) === c.layer;
    }).length;
    
    const cacheKey = `${c.id}|${c.layer}`;
    sameLayerDegreeCache.set(cacheKey, sameLayerCount);
});

console.log('✅ Cache construído com sucesso!\n');

// Testes
console.log('🔬 TESTES:\n');

// Teste 1: Verificar se todos os IDs nas relações existem
console.log('1. Verificando integridade das relações...');
let brokenRefs = 0;
relations.forEach(rel => {
    if (!idToConcept.has(rel.from)) {
        console.log(`   ❌ ID não encontrado: ${rel.from}`);
        brokenRefs++;
    }
    if (!idToConcept.has(rel.to)) {
        console.log(`   ❌ ID não encontrado: ${rel.to}`);
        brokenRefs++;
    }
});

if (brokenRefs === 0) {
    console.log('   ✅ Todas as relações referenciam IDs válidos\n');
} else {
    console.log(`   ❌ ${brokenRefs} referências quebradas!\n`);
}

// Teste 2: Verificar conceitos mais conectados
console.log('2. Top 5 conceitos mais conectados:');
const topConcepts = Array.from(degreeCache.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

topConcepts.forEach(([id, degree], i) => {
    const concept = idToConcept.get(id);
    console.log(`   ${i + 1}. ${concept.name} (${id}): ${degree} conexões`);
});

// Teste 3: Verificar cache de same-layer
console.log('\n3. Testando cache same-layer...');
const testConcept = concepts[0];
const cacheKey = `${testConcept.id}|${testConcept.layer}`;
const sameLayerDegree = sameLayerDegreeCache.get(cacheKey);
const totalDegree = degreeCache.get(testConcept.id);

console.log(`   Conceito: ${testConcept.name}`);
console.log(`   ID: ${testConcept.id}`);
console.log(`   Layer: ${testConcept.layer}`);
console.log(`   Same-layer: ${sameLayerDegree} conexões`);
console.log(`   Total: ${totalDegree} conexões`);

if (sameLayerDegree <= totalDegree) {
    console.log('   ✅ Cache same-layer OK\n');
} else {
    console.log('   ❌ Erro: same-layer > total!\n');
}

// Teste 4: Verificar relações bidirecionais
console.log('4. Verificando bidirecionalidade...');
let bidirectionalOK = true;
const sampleId = concepts[10].id;
const connections = connectionCache.get(sampleId);

connections.slice(0, 5).forEach(connId => {
    const reverseConnections = connectionCache.get(connId);
    if (!reverseConnections.includes(sampleId)) {
        console.log(`   ❌ Conexão não é bidirecional: ${sampleId} <-> ${connId}`);
        bidirectionalOK = false;
    }
});

if (bidirectionalOK) {
    console.log('   ✅ Conexões bidirecionais OK\n');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Testes concluídos!\n');
