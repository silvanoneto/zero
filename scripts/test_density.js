#!/usr/bin/env node

import { readFileSync } from 'fs';

console.log('🧪 Testando cálculo de densidade por camada...\n');

// Carregar dados
const concepts = JSON.parse(readFileSync('./assets/concepts.json', 'utf-8'));
const relations = JSON.parse(readFileSync('./assets/relations.json', 'utf-8'));

// Construir cache
const connectionCache = new Map();
const sameLayerDegreeCache = new Map();
const idToLayer = new Map();

concepts.forEach(c => {
    idToLayer.set(c.id, c.layer);
    connectionCache.set(c.id, []);
});

relations.forEach(rel => {
    if (connectionCache.has(rel.from)) {
        connectionCache.get(rel.from).push(rel.to);
    }
    if (connectionCache.has(rel.to)) {
        connectionCache.get(rel.to).push(rel.from);
    }
});

// Calcular same-layer degree
concepts.forEach(c => {
    const connections = connectionCache.get(c.id) || [];
    const sameLayerCount = connections.filter(connId => {
        return idToLayer.get(connId) === c.layer;
    }).length;
    
    const cacheKey = `${c.id}|${c.layer}`;
    sameLayerDegreeCache.set(cacheKey, sameLayerCount);
});

// Função de cálculo de densidade (copiada do rizoma-full.ts)
function calculateDynamicClusterMetadata(layer) {
    const layerConcepts = concepts.filter(c => c.layer === layer);
    const layerSize = layerConcepts.length;
    
    if (layerSize === 0) {
        return { density: 0, avgDegree: 0, hubs: [] };
    }
    
    const degrees = layerConcepts.map(c => {
        const sameLayerKey = `${c.id}|${layer}`;
        const degree = sameLayerDegreeCache.get(sameLayerKey) || 0;
        return { id: c.id, name: c.name, degree };
    });
    
    const totalDegree = degrees.reduce((sum, d) => sum + d.degree, 0);
    const avgDegree = totalDegree / layerSize;
    
    const possibleConnections = layerSize * (layerSize - 1) / 2;
    const actualConnections = totalDegree / 2;
    const density = possibleConnections > 0 ? actualConnections / possibleConnections : 0;
    
    const hubs = degrees
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 3)
        .map(d => d.id);
    
    return { density, avgDegree, hubs };
}

// Testar com algumas camadas
console.log('📊 DENSIDADE POR CAMADA:\n');

const uniqueLayers = [...new Set(concepts.map(c => c.layer))];
const layerStats = uniqueLayers.map(layer => {
    const count = concepts.filter(c => c.layer === layer).length;
    const metadata = calculateDynamicClusterMetadata(layer);
    return {
        layer,
        count,
        density: metadata.density,
        avgDegree: metadata.avgDegree
    };
}).sort((a, b) => b.density - a.density);

console.log('Top 10 camadas com maior densidade:\n');
layerStats.slice(0, 10).forEach((stat, i) => {
    console.log(`${i + 1}. ${stat.layer}`);
    console.log(`   Conceitos: ${stat.count}`);
    console.log(`   Densidade: ${(stat.density * 100).toFixed(1)}%`);
    console.log(`   Grau médio: ${stat.avgDegree.toFixed(1)}\n`);
});

console.log('Camadas com menor densidade:\n');
layerStats.slice(-5).reverse().forEach((stat, i) => {
    console.log(`${layerStats.length - i}. ${stat.layer}`);
    console.log(`   Conceitos: ${stat.count}`);
    console.log(`   Densidade: ${(stat.density * 100).toFixed(1)}%`);
    console.log(`   Grau médio: ${stat.avgDegree.toFixed(1)}\n`);
});

// Estatísticas gerais
const totalDensity = layerStats.reduce((sum, s) => sum + s.density, 0) / layerStats.length;
const totalAvgDegree = layerStats.reduce((sum, s) => sum + s.avgDegree, 0) / layerStats.length;

console.log('📈 ESTATÍSTICAS GERAIS:\n');
console.log(`   Densidade média: ${(totalDensity * 100).toFixed(1)}%`);
console.log(`   Grau médio geral: ${totalAvgDegree.toFixed(1)}`);
console.log(`   Total de camadas: ${uniqueLayers.length}\n`);
