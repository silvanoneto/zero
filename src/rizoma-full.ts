/**
 * RIZOMA - Visualização Tridimensional de Conceitos Relacionais
 * 
 * Usa Three.js para criar um grafo 3D interativo onde os conceitos
 * flutuam em uma esfera, evitando colisões através da terceira dimensão.
 */

// @ts-nocheck - Desabilita verificação temporária durante migração

// ============================================================================
// IMPORTS
// ============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Concept, Relation, NodeUserData, LineUserData, ViewMode, Layer } from './types';
import { LAYER_NAMES } from './constants';

// ============================================================================
// TEMA (SINCRONIZADO COM INDEX.HTML)
// ============================================================================

// Aplicar tema salvo do localStorage (mesma chave que index.html)
const savedTheme = localStorage.getItem('crio-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// ============================================================================
// DADOS DO RIZOMA
// ============================================================================

// Conceitos e relações serão carregados dos arquivos JSON
let concepts = [];
let relations = []; // Nomes das relações entre conceitos
let clusterMetadata = null; // Metadados de clusters para visualização (opcional)

// Cache de conexões para performance
let connectionCache = new Map(); // conceptName -> array de nomes conectados
let degreeCache = new Map(); // conceptName -> número total de conexões
let sameLayerDegreeCache = new Map(); // "conceptName|layer" -> número de conexões na mesma camada

// Cache dinâmico de metadados de clusters (calculado em tempo real)
let dynamicClusterMetadata = new Map(); // layer -> { density, avgDegree, hubs }

// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================

let scene, camera, renderer, raycaster, mouse, controls;
let nodes = [];
let lines = [];
let selectedNode = null;
let hoveredNode = null;
let isAnimating = true;
let showAllConnections = false;
let autoRotate = true;
let viewMode = '3d'; // '3d' or 'cards'
let cameraMode = 'outside'; // 'inside' (dentro do caos) ou 'outside' (fora do caos)
let animationSpeed = 1.0; // Velocidade da animação
let rotationSpeed = 0.001; // Velocidade de rotação
let selectedCards = new Set(); // Conjunto de cards/nós selecionados (seleção múltipla)
// Gerar direção aleatória normalizada
const randomAngle = Math.random() * Math.PI * 2;
let rotationDirection = { x: Math.cos(randomAngle), z: Math.sin(randomAngle) }; // Direção aleatória de rotação
let rotationAngle = 0; // Ângulo atual de rotação
let cameraLookAtTarget = null; // Ponto onde a câmera está olhando (null = centro)
let pulseIntensity = 0.0; // Intensidade do pulso (ativado apenas para hover/seleção)
let userInteracting = false; // Flag para saber se usuário está interagindo
let autoRotateTimeout = null; // Timer para retomar rotação automática
let labelsVisible = true; // Controle de visibilidade de labels para otimização
let lastAnimationTime = 0; // Para throttling de animações
let frameCount = 0; // Contador de frames para otimização
let performanceMode = false; // Modo de performance reduzida
let fpsHistory = []; // Histórico de FPS para auto-ajuste
let lastFPSCheck = 0;
let lastTopologyUpdate = 0; // Controle de atualização topológica
let lastFieldUpdate = 0; // Controle de atualização de campos

// Superfície esférica
let sphereMesh = null;
let sphereVisible = false;

// Variáveis para controle de drag
let isDragging = false;
let hasDragged = false; // Flag para distinguir clique de arrasto
let mouseDownPosition = { x: 0, y: 0 };
let previousMousePosition = { x: 0, y: 0 };
const dragThreshold = 5; // pixels mínimos para considerar como arrasto

// Detectar tema claro/escuro
const isLightTheme = () => document.body.classList.contains('light-theme');
const getGlowColor = () => isLightTheme() ? 0x1a1a1a : 0xffffff;

// Opacidades para indicar seleção - vidro colorizado
const SELECTED_OPACITY = 1.0;      // Totalmente opaco quando selecionado
const CONNECTED_OPACITY_L1 = 0.9;  // Nível 1 - bem opaco
const CONNECTED_OPACITY_L2 = 0.85; // Nível 2 - levemente transparente
const CONNECTED_OPACITY_L3 = 0.8;  // Nível 3 - mais transparente
const BASE_OPACITY = 0.7;          // Estado base - vidro semi-transparente
const DIMMED_OPACITY = 0.08;       // Nós distantes - drasticamente reduzido para quase invisível

// ============================================================================
// SISTEMA AVANÇADO DE FÍSICA QUÂNTICA RELACIONAL
// ============================================================================

// CAMPOS QUÂNTICOS - Superposição e Entrelaçamento
const quantumFields = new Map(); // Map<nodeId, {waveFunction, entanglement, coherence}>
const SUPERPOSITION_STATES = 8; // Número de estados simultâneos
const ENTANGLEMENT_RANGE = 450; // Alcance do entrelaçamento quântico (toda esfera + margem)
const DECOHERENCE_RATE = 0.0005; // Taxa de perda de coerência (reduzida)
const COHERENCE_RESTORATION_RATE = 0.002; // Taxa de restauração por entrelaçamento
const QUANTUM_TUNNELING_PROB = 0.05; // Probabilidade de tunelamento

// ANÁLISE TOPOLÓGICA EM TEMPO REAL
const topologyMetrics = new Map(); // Map<nodeId, {betweenness, closeness, eigenvector, pageRank}>
const communityStructure = new Map(); // Detecção de comunidades (Louvain)
const networkFlow = new Map(); // Fluxo de informação entre nós
let globalTopologyVersion = 0; // Versão da topologia para cache invalidation
const TOPOLOGY_UPDATE_INTERVAL = 5000; // Atualizar métricas a cada 5s

// CAMPOS DE FORÇA ADAPTATIVOS
const adaptiveFields = new Map(); // Map<nodeId, {localDensity, flowVector, curvature, radialFlow, tangentialFlow}>
const tensorFields = new Map(); // Campos tensoriais para geometria não-euclidiana
const FIELD_RESOLUTION = 20; // Resolução da grade de campos
const CURVATURE_INFLUENCE = 0.3; // Influência da curvatura espacial

// SISTEMA DE MEMÓRIA E APRENDIZADO
const memoryTraces = new Map(); // Map<nodeId, {visitFrequency, pathHistory, importance}>
const emergentPatterns = new Map(); // Padrões emergentes detectados
const MEMORY_DECAY = 0.98; // Taxa de decaimento da memória
const PATTERN_THRESHOLD = 0.7; // Limiar para reconhecimento de padrões

// AGENTE EXPLORADOR AUTÔNOMO
let explorerAgent = {
    currentNodeId: null,
    targetNodeId: null,
    position: new THREE.Vector3(),
    progress: 0,
    speed: 0.02,
    active: false,
    visitHistory: [],
    maxHistorySize: 100
};

// VISUALIZAÇÃO MULTI-DIMENSIONAL
let dimensionalProjection = '3d'; // '3d', '4d-hypersphere', '5d-manifold', 'topology-space'
const higherDimensions = new Map(); // Coordenadas em dimensões superiores
const manifoldCurvature = 0.5; // Curvatura da variedade (0=plano, 1=esfera)

// FÍSICA RELATIVÍSTICA
const relativisticEffects = new Map(); // Dilatação temporal e contração espacial
const lightConeConstraints = new Map(); // Cone de luz para causalidade
const SPEED_OF_LIGHT = 10.0; // Velocidade máxima de propagação
const TIME_DILATION_FACTOR = 0.1; // Fator de dilatação temporal

// MODO TURBO - Convergência acelerada temporária
let turboMode = {
    active: false,
    smoothingFactor: 0.6,  // α mais alto = convergência mais rápida
    startTime: 0,
    duration: 10000  // 10 segundos
};

// SISTEMA DE MOVIMENTO SOBRE A REDE (CAOS)
const nodeMovement = new Map(); // Map<nodeId, {targetNode, progress, speed}>
const WALK_SPEED = 0.006; // Velocidade aumentada - mais dinâmico
const MAX_VELOCITY = 5.0; // Velocidade máxima permitida
const PATH_CHANGE_INTERVAL = 2500; // Trocar de direção mais frequentemente

// PROPORÇÃO ÁUREA - Base da harmonia gravitacional
const PHI = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618034
const PHI_INVERSE = 1 / PHI; // 1/φ ≈ 0.618034

// DANÇA PAÊBIRÚ - Oscilações harmônicas que previnem colapso
// "O caminho que se faz caminhando" - movimento orgânico e emergente
const nodeOscillations = new Map(); // Map<nodeId, {phase, frequency, amplitude}>
const OSCILLATION_BASE_FREQ = 0.0001; // Frequência mínima (respiração lenta)
const OSCILLATION_AMPLITUDE = 3; // Amplitude quase imperceptível

// FORÇAS RELACIONAIS BALANCEADAS - Hierarquia Áurea (φ) - MOVIMENTO GLACIAL
// PRINCÍPIO: Atração = Repulsão (equilíbrio perfeito), demais derivadas por φ
// φ ≈ 1.618, φ⁻¹ ≈ 0.618, φ⁻² ≈ 0.382, φ⁻³ ≈ 0.236
const ATTRACTION_FORCE = 0.05; // Força muito reduzida (ultra suave)
const REPULSION_FORCE = 0.05; // Igual à atração (equilíbrio perfeito)
const SPRING_STRENGTH = 0.02; // Elasticidade mínima (anti-tremulidade)
const LAYER_COHESION = 0.015; // Coesão quase inexistente

// GRAVITAÇÃO RADIAL - Hierarquia sutil DENTRO da esfera (contenção visual)
const SPHERE_RADIUS = 300; // Raio base da esfera
const HUB_GRAVITY_STRENGTH = 0.45; // Força gravitacional aumentada (prioridade)
const MIN_HUB_RADIUS = 250; // Interior da esfera (nós periféricos)
const MAX_HUB_RADIUS = 340; // Camada externa sutil (super-hubs)
const ESCAPE_VELOCITY_BONUS = 0.25; // Velocidade moderada para contenção
const VISUAL_CONTAINMENT = true; // Limita expansão para visualização

// DISTÂNCIAS - Campos em proporção áurea
const ATTRACTION_DISTANCE = 150; // Campo de atração (base)
const REPULSION_DISTANCE = 243; // 150 × φ (campo maior)
const LAYER_COHESION_DISTANCE = 393; // 243 × φ (campo mais amplo)

// LOD (Level of Detail) - Renderização baseada em distância
const MAX_RENDER_DISTANCE = 1200; // Distância máxima para renderizar linhas
const LOD_FADE_START = 800; // Início do fade out
const LOD_FADE_END = 1200; // Fim do fade out (invisível)

// MOLAS RELACIONAIS - Amortecimento máximo (quase congelado)
const MIN_EDGE_LENGTH = 40; // Compressão mínima
const MAX_EDGE_LENGTH = 200; // Extensão máxima
const SPRING_DAMPING = 0.3; // Amortecimento ultra alto (suaviza tremores)
const DAMPING = 0.75; // Fricção máxima (movimento ultra glacial)

// ANTI-COLAPSO - Velocidade mínima para manter movimento constante
const MIN_VELOCITY = 0.1; // Nós nunca param completamente

let lastPathChange = 0;
let repulsionCounter = 0; // Contador para aplicar repulsão com menos frequência

// NORMALIZAÇÃO DE PESO (para repulsão entre 0 e 1)
let minConnections = Infinity;
let maxConnections = 0;

// CORES POR CAMADA
const LAYER_COLORS: Record<string, number> = {
    // Camadas base (mantidas para compatibilidade)
    'ontologica': 0x66ccff,
    'politica': 0xff6666,
    'pratica': 0x99ccff,
    'fundacional': 0x9966ff,
    'epistemica': 0xff9966,
    'ecologica': 0x66ff99,
    'temporal': 0xcccccc,
    'etica': 0xffff66,
    
    // Subcamadas ontologica (azul claro: escuro → claro)
    'ontologica-0': 0x3399ff,  // Geral - azul escuro
    'ontologica-1': 0x4db8ff,  // Relacional - azul médio-escuro
    'ontologica-2': 0x66ccff,  // Prática - azul médio-claro
    'ontologica-3': 0x99ddff,  // Mista - azul claro
    
    // Subcamadas politica (vermelho: escuro → claro)
    'politica-0': 0xcc3333,    // Geral - vermelho escuro
    'politica-1': 0xff4d4d,    // Relacional - vermelho médio-escuro
    'politica-2': 0xff6666,    // Prática - vermelho médio-claro
    'politica-3': 0xff9999,    // Mista - vermelho claro
    
    // Subcamadas pratica (azul muito claro: escuro → claro)
    'pratica-0': 0x6699ff,     // Geral - azul escuro
    'pratica-1': 0x80bdff,     // Relacional - azul médio-escuro
    'pratica-2': 0x99ccff,     // Prática - azul médio-claro
    'pratica-3': 0xcce6ff,     // Mista - azul claro
    
    // Subcamadas fundacional (roxo: escuro → claro)
    'fundacional-0': 0x6633cc,  // Geral - roxo escuro
    'fundacional-1': 0x8052ff,  // Relacional - roxo médio-escuro
    'fundacional-2': 0x9966ff,  // Prática - roxo médio-claro
    'fundacional-3': 0xc299ff,  // Mista - roxo claro
    
    // Subcamadas epistemica (laranja: escuro → claro)
    'epistemica-0': 0xcc6633,   // Geral - laranja escuro
    'epistemica-1': 0xff8552,   // Relacional - laranja médio-escuro
    'epistemica-2': 0xff9966,   // Prática - laranja médio-claro
    'epistemica-3': 0xffc299,   // Mista - laranja claro
    
    // Subcamadas ecologica (verde: escuro → claro)
    'ecologica-0': 0x33cc66,    // Geral - verde escuro
    'ecologica-1': 0x52ff85,    // Relacional - verde médio-escuro
    'ecologica-2': 0x66ff99,    // Prática - verde médio-claro
    'ecologica-3': 0x99ffc2,    // Mista - verde claro
    
    // Subcamadas temporal (cinza: escuro → claro)
    'temporal-0': 0x999999,     // Geral - cinza escuro
    'temporal-1': 0xb8b8b8,     // Relacional - cinza médio-escuro
    'temporal-2': 0xcccccc,     // Prática - cinza médio-claro
    'temporal-3': 0xe0e0e0,     // Mista - cinza claro
    
    // Subcamadas etica (amarelo: escuro → claro)
    'etica-0': 0xcccc33,        // Geral - amarelo escuro
    'etica-1': 0xffff4d,        // Relacional - amarelo médio-escuro
    'etica-2': 0xffff66,        // Prática - amarelo médio-claro
    'etica-3': 0xffff99         // Mista - amarelo claro
};

/**
 * Obtém a cor de um conceito baseado na sua camada
 * Suporta subcamadas com variações cromáticas
 */
function getColorForLayer(layer: string): number {
    // Tenta match exato primeiro
    if (LAYER_COLORS[layer]) {
        return LAYER_COLORS[layer];
    }
    
    // Se é uma subcamada não mapeada, usa a cor base
    const baseLayer = getBaseLayer(layer);
    
    // Usar cores dos cluster metadata se disponíveis
    if (clusterMetadata?.layer_clusters?.[baseLayer]?.color) {
        return parseInt(clusterMetadata.layer_clusters[baseLayer].color.replace('#', '0x'));
    }
    
    return LAYER_COLORS[baseLayer] || 0xffffff; // Branco como fallback
}

/**
 * Extrai a camada base de uma subcamada (ex: "ontologica-0" -> "ontologica")
 */
function getBaseLayer(layer: string): string {
    return layer.replace(/-[0-3]$/, '');
}

/**
 * Calcula dinamicamente o grau (número de conexões) de um conceito
 * Usa cache para performance
 */
function getConceptDegree(conceptId: string | number): number {
    const id = String(conceptId);
    return degreeCache.get(id) || 0;
}

/**
 * Calcula dinamicamente o grau dentro da mesma camada
 * Usa cache para performance
 */
function getSameLayerDegree(conceptId: string | number, layer: string): number {
    const id = String(conceptId);
    const cacheKey = `${id}|${layer}`;
    return sameLayerDegreeCache.get(cacheKey) || 0;
}

/**
 * Calcula dinamicamente se um conceito é hub (> média + 1 desvio padrão)
 */
function isHub(conceptId: string | number, layer: string): boolean {
    const id = String(conceptId);
    const concept = concepts.find(c => String(c.id) === id);
    if (!concept) return false;
    
    // Calcular média e desvio padrão das conexões na mesma camada
    const layerConcepts = concepts.filter(c => c.layer === layer);
    const degrees = layerConcepts.map(c => getSameLayerDegree(c.id, layer));
    
    const mean = degrees.reduce((a, b) => a + b, 0) / degrees.length;
    const variance = degrees.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / degrees.length;
    const stdDev = Math.sqrt(variance);
    
    const threshold = mean + stdDev; // 1 desvio padrão acima da média
    const conceptDegree = getSameLayerDegree(concept.id, layer);
    
    return conceptDegree > threshold;
}

/**
 * Verifica se um conceito é ponte (conecta camadas diferentes)
 * Usa cache para performance
 */
function isBridge(conceptId: string | number): boolean {
    const id = String(conceptId);
    const concept = concepts.find(c => String(c.id) === id);
    if (!concept) return false;
    
    const conceptLayer = concept.layer;
    const connections = connectionCache.get(id) || [];
    
    // Criar mapa id -> camada
    const idToLayer = new Map();
    concepts.forEach(c => {
        idToLayer.set(c.id, c.layer);
    });
    
    // Contar conexões cross-layer
    const crossLayerCount = connections.filter(connId => {
        const connLayer = idToLayer.get(connId);
        return connLayer && connLayer !== conceptLayer;
    }).length;
    
    return crossLayerCount >= 2;
}

/**
 * Obtém o cluster score de um conceito (normalizado 0-1)
 */
function getClusterScore(conceptId: string | number, layer: string): number {
    const id = String(conceptId);
    const concept = concepts.find(c => String(c.id) === id);
    if (!concept) return 0;
    
    const sameLayerDegree = getSameLayerDegree(concept.id, layer);
    const totalDegree = getConceptDegree(concept.id);
    
    if (totalDegree === 0) return 0;
    
    // Score baseado na proporção de conexões na mesma camada
    // Quanto mais conectado dentro da camada, maior o score (0-1)
    const layerCohesion = sameLayerDegree / totalDegree;
    
    // Normalizar pelo grau total (conceitos muito conectados têm score maior)
    const maxDegree = Math.max(...concepts.map(c => getConceptDegree(c.id)));
    const degreeNormalized = totalDegree / maxDegree;
    
    // Score final: combinação de coesão e conectividade
    return (layerCohesion * 0.6 + degreeNormalized * 0.4);
}

// ============================================================================

// Detectar dispositivo fraco automaticamente (apenas se tiver 2 cores ou menos)
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    performanceMode = true;
}

// Intervalo para atualização em tempo real de stats
let statsInterval: number | null = null;

// Flag para controlar se mouse está sobre UI
let isMouseOverUI = false;

const infoPanel = document.getElementById('info-panel');
const loading = document.getElementById('loading');
const container = document.getElementById('container');
const cardsContainer = document.getElementById('cards-container');
const cardsGrid = document.getElementById('cards-grid');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const statusIndicator = document.getElementById('status-indicator');
const speedValue = document.getElementById('speed-value');
const rotationValue = document.getElementById('rotation-value');
const pulseValue = document.getElementById('pulse-value');

// ============================================================================
// FUNÇÕES AUXILIARES DE COR
// ============================================================================

// Interpolar entre duas cores (formato hexadecimal)
function lerpColor(color1, color2, t) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, t);
}

// Clarear uma cor (tornar mais próxima do branco)
function lightenColor(color, amount) {
    return lerpColor(color, 0xffffff, amount);
}

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================

async function loadConcepts() {
    try {
        const response = await fetch('assets/concepts.json');
        const data = await response.json();
        
        // Atribuir cores baseadas na camada (não mais no JSON)
        concepts = data.map(concept => ({
            ...concept,
            color: getColorForLayer(concept.layer)
        }));
    } catch (error) {
        console.error('❌ Erro ao carregar assets/concepts.json:', error);
        loading.innerHTML = '<p style="color: #ff0066;">Erro ao carregar conceitos. Verifique o arquivo assets/concepts.json</p>';
    }
}

async function loadRelations() {
    try {
        const response = await fetch('assets/relations.json');
        relations = await response.json();
        
        // Construir cache de conexões para performance
        buildConnectionCache();
    } catch (error) {
        console.error('❌ Erro ao carregar assets/relations.json:', error);
        relations = [];
    }
}

/**
 * Constrói cache de conexões para otimizar queries
 */
function buildConnectionCache() {
    connectionCache.clear();
    degreeCache.clear();
    sameLayerDegreeCache.clear();
    
    // Criar mapas id -> conceito e id -> camada
    const idToConcept = new Map();
    const idToLayer = new Map();
    
    concepts.forEach(c => {
        idToConcept.set(c.id, c);
        idToLayer.set(c.id, c.layer);
        // Inicializar cache com array vazio para cada conceito (por ID)
        connectionCache.set(c.id, []);
    });
    
    // Processar todas as relações (agora usam IDs)
    relations.forEach(rel => {
        const fromId = rel.from;
        const toId = rel.to;
        
        // Adicionar conexões bidirecionais (usando IDs)
        if (connectionCache.has(fromId)) {
            connectionCache.get(fromId).push(toId);
        }
        if (connectionCache.has(toId)) {
            connectionCache.get(toId).push(fromId);
        }
    });
    
    // Calcular graus e cache de same-layer
    concepts.forEach(c => {
        const connections = connectionCache.get(c.id) || [];
        
        // Cache de grau total (por ID)
        degreeCache.set(c.id, connections.length);
        
        // Cache de grau same-layer
        const sameLayerCount = connections.filter(connId => {
            return idToLayer.get(connId) === c.layer;
        }).length;
        
        const cacheKey = `${c.id}|${c.layer}`;
        sameLayerDegreeCache.set(cacheKey, sameLayerCount);
    });
}

/**
 * Obtém as conexões de um conceito a partir do cache
 */
function getConceptConnections(conceptId: string): string[] {
    // Buscar diretamente por ID
    const connections = connectionCache.get(conceptId);
    return connections || [];
}

/**
 * Calcula metadados de cluster dinamicamente para uma camada
 */
function calculateDynamicClusterMetadata(layer) {
    const cacheKey = layer;
    
    // Retorna do cache se já calculado
    if (dynamicClusterMetadata.has(cacheKey)) {
        return dynamicClusterMetadata.get(cacheKey);
    }
    
    // Filtra conceitos dessa camada (usar 'layer', não 'camada')
    const layerConcepts = concepts.filter(c => c.layer === layer);
    const layerSize = layerConcepts.length;
    
    if (layerSize === 0) {
        return { density: 0, avgDegree: 0, hubs: [] };
    }
    
    // Calcula grau médio e encontra hubs (usando IDs)
    const degrees = layerConcepts.map(c => {
        const sameLayerKey = `${c.id}|${layer}`;
        const degree = sameLayerDegreeCache.get(sameLayerKey) || 0;
        return { id: c.id, name: c.name, degree };
    });
    
    const totalDegree = degrees.reduce((sum, d) => sum + d.degree, 0);
    const avgDegree = totalDegree / layerSize;
    
    // Densidade: conexões atuais / conexões possíveis
    // Conexões possíveis = n * (n-1) / 2 (grafo não-direcionado)
    const possibleConnections = layerSize * (layerSize - 1) / 2;
    const actualConnections = totalDegree / 2; // Cada aresta é contada 2x
    const density = possibleConnections > 0 ? actualConnections / possibleConnections : 0;
    
    // Identifica hubs (top 3 conceitos por grau)
    const hubs = degrees
        .sort((a, b) => b.degree - a.degree)
        .slice(0, 3)
        .map(d => d.id);
    
    const metadata = { density, avgDegree, hubs };
    dynamicClusterMetadata.set(cacheKey, metadata);
    
    return metadata;
}

async function loadClusterMetadata() {
    try {
        const response = await fetch('assets/cluster_metadata.json');
        clusterMetadata = await response.json();
        // console.log('✅ Metadados de cluster carregados (modo estático)');
    } catch (error) {
        // console.log('ℹ️ Usando cálculo dinâmico de clusters (arquivo não encontrado)');
        // Cluster metadata é opcional - será calculado dinamicamente
        clusterMetadata = null;
    }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

/**
 * Centraliza a câmera no nó com mais conexões
 */
function centerOnMostConnectedNode() {
    if (nodes.length === 0 || concepts.length === 0) return;
    
    // Encontrar o conceito com mais conexões usando relations
    const targetConcept = concepts.reduce((prev, current) => {
        const prevDegree = getConceptDegree(prev.id);
        const currentDegree = getConceptDegree(current.id);
        return currentDegree > prevDegree ? current : prev;
    });
    
    // Encontrar o nó correspondente
    const targetNode = nodes.find(n => n.userData.id === targetConcept.id);
    
    if (targetNode) {
        // NÃO rotacionar a cena - isso quebra a distribuição esférica!
        // Em vez disso, posicionar a câmera para olhar para o nó
        
        const nodePos = targetNode.position.clone();
        
        // Calcular posição da câmera: na direção oposta ao nó, mantendo distância
        const cameraDistance = cameraMode === 'inside' ? 0 : 900;
        const direction = nodePos.clone().normalize();
        
        if (cameraMode === 'outside') {
            // Câmera olha de fora para o nó no centro da tela
            camera.position.copy(direction.multiplyScalar(cameraDistance));
            camera.lookAt(nodePos);
        } else {
            // Câmera no centro, olhando para o nó
            camera.position.set(0, 0, 0);
            camera.lookAt(nodePos);
        }
        
        cameraLookAtTarget = nodePos;
    }
}

async function init() {
    // Carregar conceitos e relações primeiro
    await loadConcepts();
    await loadRelations();
    await loadClusterMetadata();
    
    if (concepts.length === 0) {
        console.error('❌ Nenhum conceito carregado. Abortando inicialização.');
        return;
    }
    // Scene com cores baseadas no tema
    const isLight = document.body.classList.contains('light-theme');
    const bgColor = isLight ? 0xf0f0f0 : 0x0a0a0a;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 500, 1500);

    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.z = 900; // Mesma posição do modo 'outside'

    // Renderer com otimizações
    renderer = new THREE.WebGLRenderer({ 
        antialias: window.innerWidth > 768, // Antialiasing apenas em desktop
        alpha: false,
        powerPreference: "high-performance",
        stencil: false, // Desabilita stencil buffer (não usado)
        depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Limita pixel ratio para melhor performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Exposição neutra (era 2.2 - muito brilhante)
    document.getElementById('container').appendChild(renderer.domElement);

    // OrbitControls para navegação melhorada
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Suavização do movimento
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7; // Velocidade de rotação
    controls.zoomSpeed = 1.2; // Velocidade de zoom
    controls.panSpeed = 0.8; // Velocidade de pan
    controls.minDistance = 100; // Distância mínima de zoom
    controls.maxDistance = 1500; // Distância máxima de zoom
    controls.enablePan = true; // Permitir pan (arrastar com botão direito ou dois dedos)
    controls.screenSpacePanning = true; // Pan no espaço da tela (mais intuitivo)
    controls.keyPanSpeed = 20; // Velocidade de pan com teclado
    controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp', 
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    };
    
    // Listener para pausar auto-rotação durante interação
    controls.addEventListener('start', () => {
        userInteracting = true;
        if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    });
    
    controls.addEventListener('end', () => {
        if (autoRotate && !selectedNode && selectedCards.size === 0) {
            autoRotateTimeout = setTimeout(() => {
                userInteracting = false;
            }, 2000);
        }
    });

    // Raycaster para detecção de cliques
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Criar nós em distribuição esférica
    createNodes();
    
    // Calcular min/max conexões para normalização
    calculateConnectionRange();
    
    // Criar conexões
    createConnections();
    
    // Criar superfície esférica (inicialmente invisível)
    createSphere();
    
    // Inicializar movimento dos nós sobre a rede
    initializeNodeMovement();
    
    // Centralizar no nó com mais conexões
    centerOnMostConnectedNode();
    
    // Atualizar cores das linhas baseado no tema atual
    updateLineColors();

    // Adicionar luzes (MeshStandardMaterial precisa de iluminação adequada mas sutil)
    const ambientLight = new THREE.AmbientLight(isLight ? 0xffffff : 0x404040, isLight ? 0.4 : 0.3);
    scene.add(ambientLight);

    // Luzes direcionais sutis para melhor iluminação dos materiais físicos
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x8080ff, 0.3);
    directionalLight2.position.set(-1, -0.5, -1);
    scene.add(directionalLight2);

    // ====================================================================
    // BLOQUEIO DE EVENTOS SOBRE UI - DEVE VIR ANTES DOS OUTROS LISTENERS
    // ====================================================================
    
    // Configurar listeners de mouseenter/mouseleave nos painéis
    [infoPanel, cardsContainer, searchContainer].forEach(panel => {
        if (panel) {
            panel.addEventListener('mouseenter', () => {
                isMouseOverUI = true;
                controls.enabled = false;
            });
            panel.addEventListener('mouseleave', () => {
                isMouseOverUI = false;
                controls.enabled = true;
            });
        }
    });
    
    // Interceptar eventos quando mouse sobre UI (capture phase)
    window.addEventListener('wheel', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });
    
    window.addEventListener('mousedown', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true });
    
    window.addEventListener('mouseup', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true });
    
    window.addEventListener('mousemove', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true });
    
    window.addEventListener('touchstart', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });
    
    window.addEventListener('touchmove', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });
    
    window.addEventListener('touchend', (e) => {
        if (isMouseOverUI) {
            e.stopImmediatePropagation();
        }
    }, { capture: true });
    
    window.addEventListener('gesturestart', (e) => {
        if (isMouseOverUI) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });
    
    window.addEventListener('gesturechange', (e) => {
        if (isMouseOverUI) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });
    
    window.addEventListener('gestureend', (e) => {
        if (isMouseOverUI) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, { capture: true, passive: false });

    // ====================================================================
    // EVENT LISTENERS NORMAIS (vêm depois dos bloqueadores)
    // ====================================================================
    
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    // Event listeners para busca
    searchInput.addEventListener('input', handleSearch);

    // Click no canvas 3D (não em window para evitar conflito com UI)
    renderer.domElement.addEventListener('click', onClick);

    // Controles de câmera agora gerenciados pelo OrbitControls
    // Mantemos apenas o tracking de drag para distinguir clique de arrasto
    renderer.domElement.addEventListener('mousedown', (e) => {
        hasDragged = false;
        mouseDownPosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        const totalDelta = Math.sqrt(
            Math.pow(e.clientX - mouseDownPosition.x, 2) + 
            Math.pow(e.clientY - mouseDownPosition.y, 2)
        );
        
        if (totalDelta > dragThreshold) {
            hasDragged = true;
        }
    });

    renderer.domElement.addEventListener('mouseup', () => {
        // Resetar estado após soltar o mouse
        setTimeout(() => {
            hasDragged = false;
        }, 10);
    });

    // Controles touch - simplificados, OrbitControls cuida da navegação
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            hasDragged = false;
            const touch = e.touches[0];
            mouseDownPosition = { x: touch.clientX, y: touch.clientY };
            
            // Atualizar raycasting para detectar o nó tocado
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            performRaycast();
        }
    }, { passive: true });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            
            const totalDelta = Math.sqrt(
                Math.pow(touch.clientX - mouseDownPosition.x, 2) + 
                Math.pow(touch.clientY - mouseDownPosition.y, 2)
            );
            
            if (totalDelta > dragThreshold) {
                hasDragged = true;
            }
        }
    }, { passive: true });

    renderer.domElement.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            const wasNotDragged = !hasDragged;
            
            // Se foi um tap (não arrasto), processar como clique
            if (wasNotDragged) {
                // Processar o tap imediatamente usando o hoveredNode já detectado no touchstart
                if (hoveredNode) {
                    focusOnNode(hoveredNode);
                } else {
                    // Clicou no vazio - desmarcar tudo
                    if (selectedCards.size > 0 || selectedNode) {
                        nodes.forEach(n => {
                            n.material.emissiveIntensity = n.userData.originalEmissive || 0.2;
                            if (n.userData.innerLight) {
                                n.userData.innerLight.intensity = 0.1;
                            }
                            n.scale.setScalar(n.userData.baseScale || 1); // Preservar escala de hub
                            resetConnectedNodes(n);
                        });
                        
                        selectedNode = null;
                        resetConnectionFilter();
                        infoPanel.classList.remove('visible');
                        
                        // Retomar animação e rotação automática
                        cameraLookAtTarget = null;
                        userInteracting = false;
                        autoRotate = true;
                        isAnimating = true;
                        
                        showNotification('Seleção removida');
                    }
                }
            }
            
            hasDragged = false;
        }
    }, { passive: true });

    // Zoom com scroll - OrbitControls já gerencia, mas mantemos lógica de auto-rotação
    renderer.domElement.addEventListener('wheel', (e) => {
        // OrbitControls já gerencia o zoom, apenas pausamos auto-rotação
        if (autoRotate && !selectedNode && selectedCards.size === 0) {
            userInteracting = true;
            if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
            autoRotateTimeout = setTimeout(() => {
                userInteracting = false;
            }, 2000);
        }
    }, { passive: true });

    // Criar cards
    renderCards();
    
    // Event listeners dos controles
    const btnCards = document.getElementById('btn-cards');
    const btnSpeed = document.getElementById('btn-speed');
    
    if (btnCards) btnCards.addEventListener('click', toggleViewMode);
    if (btnSpeed) btnSpeed.addEventListener('click', toggleSpeedMenu);
    
    // Event listener da busca
    searchInput.addEventListener('input', handleSearch);
    
    // Event listeners da legenda
    setupLegendListeners();
    
    // Atualizar contagens iniciais da legenda
    updateLegendCounts();

    loading.style.display = 'none';
    
    // ============================================================================
    // INICIALIZAR SISTEMAS AVANÇADOS
    // ============================================================================
    // console.log('🌌 Inicializando sistemas avançados...');
    
    // Inicializar campos quânticos (rápido)
    initializeQuantumFields();
    // console.log(`   ⚛️  Campos quânticos: ${quantumFields.size} nós`);
    
    // Inicializar memória (rápido)
    updateMemoryTraces();
    // console.log(`   🧠 Memória: ${memoryTraces.size} traços`);
    
    // Sistemas pesados: calcular assincronamente após 2 segundos
    setTimeout(() => {
        // console.log('🔬 Calculando métricas topológicas...');
        
        // Calcular métricas topológicas
        computeTopologyMetrics();
        // console.log(`   🕸️  Topologia: ${topologyMetrics.size} métricas`);
        
        // Detectar comunidades
        detectCommunities();
        // const numCommunities = new Set(Array.from(communityStructure.values())).size;
        // console.log(`   🏘️  Comunidades: ${numCommunities} detectadas`);
        
        // Calcular fluxo de rede
        computeNetworkFlow();
        // console.log(`   🌊 Fluxo: ${networkFlow.size} vetores`);
        
        // Inicializar campos adaptativos
        computeAdaptiveFields();
        // console.log(`   📐 Geometria: ${adaptiveFields.size} campos`);
        
        // Inicializar coordenadas superiores
        projectToHigherDimensions();
        // console.log(`   🎭 Dimensões: ${higherDimensions.size} projeções`);
        
        // console.log('✨ Sistemas avançados online!');
    }, 2000);
    
    animate();
    
    // Processar hash da URL para seleção automática
    checkUrlHashAndFocus();
}

/**
 * Check URL hash and focus on concept if present
 */
function checkUrlHashAndFocus() {
    const hash = decodeURIComponent(window.location.hash.substring(1)); // Remove '#' e decode
    if (hash) {
        // Aguardar um pouco para garantir que os nós foram criados
        setTimeout(() => {
            const targetNode = nodes.find(node => node.userData.id === hash);
            if (targetNode) {
                focusOnNode(targetNode);
                showNotification(`Focando em: ${targetNode.userData.name}`);
            }
        }, 500);
    }
}

// Listen for hash changes (when navigating back/forward)
window.addEventListener('hashchange', checkUrlHashAndFocus);

// ============================================================================
// CRIAÇÃO DE NÓS
// ============================================================================

function createNodes() {
    const radius = 300; // Raio da esfera de distribuição
    
    // Geometria compartilhada com menos segmentos para melhor performance
    const sharedGeometry = new THREE.SphereGeometry(20, 16, 16); // Reduz de 32 para 16 segmentos

    // Agrupar conceitos por camada
    const conceptsByLayer = new Map();
    concepts.forEach(concept => {
        const layer = concept.layer || 'undefined';
        if (!conceptsByLayer.has(layer)) {
            conceptsByLayer.set(layer, []);
        }
        conceptsByLayer.get(layer).push(concept);
    });

    const layers = Array.from(conceptsByLayer.keys());

    // DISTRIBUIÇÃO HÍBRIDA: Clusters por camada com raio proporcional ao número de conceitos
    // Calcular raio do cluster baseado na proporção de conceitos e densidade da camada
    const calculateClusterRadius = (layerSize: number, totalSize: number, layer: string): number => {
        // Raio proporcional à raiz cúbica do número de conceitos (volume esférico)
        // Volume de esfera = 4/3 * π * r³
        // Para distribuir área uniformemente: r ∝ ³√(n)
        const proportion = Math.cbrt(layerSize / totalSize);
        
        // Ajustar baseado na densidade do cluster
        let densityFactor = 1.0;
        
        // Tenta usar metadados estáticos primeiro, senão calcula dinamicamente
        let density = clusterMetadata?.layer_clusters?.[layer]?.density;
        if (density === undefined) {
            const dynamicMetadata = calculateDynamicClusterMetadata(layer);
            density = dynamicMetadata.density;
        }
        
        if (density > 0) {
            // Densidade alta = raio menor (mais compacto)
            // Densidade baixa = raio maior (mais espalhado)
            // Inverter: densidade 0.345 → fator 0.7, densidade 0.122 → fator 1.3
            densityFactor = 1.0 / (0.5 + density); // Range aproximado: 0.74 a 1.47
        }
        
        // Raio mínimo de 0.3 para evitar clusters muito pequenos que causam NaN
        const calculatedRadius = proportion * 0.85 * densityFactor;
        return Math.max(0.3, calculatedRadius); // Garantir raio mínimo
    };

    // Posicionar centros dos clusters uniformemente na esfera usando Fibonacci melhorado
    const layerCenters = new Map();
    
    // Usar Fibonacci sphere com golden ratio para máxima uniformidade
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    layers.forEach((layer, idx) => {
        // Fibonacci sphere melhorado
        const i = idx + 0.5;
        const phi = Math.acos(1 - 2 * i / layers.length);
        const theta = 2 * Math.PI * i / goldenRatio;
        
        const layerSize = conceptsByLayer.get(layer).length;
        const clusterRadius = calculateClusterRadius(layerSize, concepts.length, layer);
        
        // Obter densidade do cluster se disponível
        const density = clusterMetadata?.layer_clusters?.[layer]?.density || 0;
        
        layerCenters.set(layer, {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi),
            radius: clusterRadius,
            density: density
        });
    });

    concepts.forEach((concept, i) => {
        const layer = concept.layer || 'undefined';
        const layerConcepts = conceptsByLayer.get(layer);
        const layerIndex = layerConcepts.indexOf(concept);
        
        // Centro e raio do cluster da camada
        const center = layerCenters.get(layer);
        const clusterRadius = center.radius;
        
        // DISTRIBUIÇÃO MELHORADA: Fibonacci sphere com jitter controlado
        // Usar golden ratio para distribuição mais uniforme
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const goldenAngle = 2 * Math.PI / (goldenRatio * goldenRatio);
        
        // Índice normalizado [0, 1]
        const t = layerIndex / Math.max(1, layerConcepts.length - 1);
        
        // Ângulo polar com pequeno jitter para evitar padrões regulares
        const jitter = (Math.random() - 0.5) * 0.05; // ±2.5% de variação
        const phi = Math.acos(1 - 2 * (t + jitter));
        
        // Ângulo azimutal usando golden angle
        const theta = goldenAngle * layerIndex;
        
        // Raio com variação baseada na densidade (hubs mais centrais, bridges mais periféricos)
        let radiusMultiplier = clusterRadius;
        if (isHub(concept.id, layer)) {
            // Hubs tendem ao centro do cluster (80-100% do raio)
            radiusMultiplier *= 0.8 + Math.random() * 0.2;
        } else if (isBridge(concept.id)) {
            // Bridges tendem à periferia (90-110% do raio)
            radiusMultiplier *= 0.9 + Math.random() * 0.2;
        } else {
            // Nós normais distribuídos uniformemente (70-100% do raio)
            radiusMultiplier *= 0.7 + Math.random() * 0.3;
        }
        
        // Posição local dentro do cluster (esfera menor)
        const localX = radiusMultiplier * Math.sin(phi) * Math.cos(theta);
        const localY = radiusMultiplier * Math.sin(phi) * Math.sin(theta);
        const localZ = radiusMultiplier * Math.cos(phi);
        
        // Posição global: centro do cluster + offset local
        let x = (center.x + localX) * radius;
        let y = (center.y + localY) * radius;
        let z = (center.z + localZ) * radius;
        
        // Normalização suave para manter na superfície esférica sem distorcer muito
        const currentLength = Math.sqrt(x * x + y * y + z * z);
        const targetLength = radius;
        const epsilon = 0.001;
        
        let finalX, finalY, finalZ;
        
        // Verificar se a posição calculada é válida
        if (currentLength < epsilon || !isFinite(currentLength)) {
            // Posição no centro ou inválida - usar Fibonacci simples como fallback
            const fallbackPhi = Math.acos(1 - 2 * i / concepts.length);
            const fallbackTheta = 2 * Math.PI * i / ((1 + Math.sqrt(5)) / 2);
            finalX = radius * Math.sin(fallbackPhi) * Math.cos(fallbackTheta);
            finalY = radius * Math.sin(fallbackPhi) * Math.sin(fallbackTheta);
            finalZ = radius * Math.cos(fallbackPhi);
        } else {
            // PERMITIR PROFUNDIDADE 3D: menos projeção, mais liberdade volumétrica
            // Interpolar entre posição calculada e projeção perfeita (60% projeção, 40% liberdade)
            const normalizedX = (x / currentLength) * targetLength;
            const normalizedY = (y / currentLength) * targetLength;
            const normalizedZ = (z / currentLength) * targetLength;
            
            const blend = 0.6; // 60% de aderência à esfera (era 90%)
            finalX = normalizedX * blend + x * (1 - blend);
            finalY = normalizedY * blend + y * (1 - blend);
            finalZ = normalizedZ * blend + z * (1 - blend);
        }

        // Cores e intensidades neutras - independente do tema
        // O riz∅ma transcende polaridades (luz/trevas)
        const nodeColor = concept.color;
        
        // Detectar se é hub ou bridge
        const hubStatus = isHub(concept.id, layer);
        const bridgeStatus = isBridge(concept.id);
        const clusterScore = getClusterScore(concept.id, layer);
        
        // Ajustar tamanho baseado em status de hub - PROPORÇÃO ÁUREA
        // Periféricos: φ⁻¹ (≈0.618), Hubs: φ + clusterScore×φ² (até φ³ ≈ 4.236)
        const baseScale = PHI_INVERSE; // ≈ 0.618 (nós periféricos em harmonia áurea)
        const hubScale = hubStatus ? PHI + (clusterScore * PHI * PHI) : 1.0; // Hubs: φ até φ³
        const nodeScale = baseScale * hubScale;
        
        // Ajustar emissividade para hubs (mais sutil para evitar rizoma muito aceso)
        const emissiveIntensity = hubStatus ? 0.3 + (clusterScore * 0.2) : 0.08;
        
        // Opacidade diferenciada - hubs mais opacos mas não totalmente sólidos
        const nodeOpacity = hubStatus ? 
            Math.min(BASE_OPACITY + 0.15 + (clusterScore * 0.1), 0.95) : // Hubs: até 0.95 (quase opaco)
            BASE_OPACITY * 0.8; // Periféricos: mais transparentes
        
        // Material tipo vidro colorizado - transparente e reflexivo
        // Temporariamente usando MeshStandardMaterial para melhor compatibilidade
        const material = new THREE.MeshStandardMaterial({
            color: nodeColor,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: nodeOpacity,
            emissive: nodeColor,
            emissiveIntensity: emissiveIntensity
        });

        
        const sphere = new THREE.Mesh(sharedGeometry, material);
        
        // Validar que não temos NaN
        if (!isFinite(finalX) || !isFinite(finalY) || !isFinite(finalZ)) {
            // Fallback silencioso: posição simples na esfera
            const fallbackPhi = Math.acos(1 - 2 * i / concepts.length);
            const fallbackTheta = 2 * Math.PI * i / ((1 + Math.sqrt(5)) / 2);
            sphere.position.set(
                radius * Math.sin(fallbackPhi) * Math.cos(fallbackTheta),
                radius * Math.sin(fallbackPhi) * Math.sin(fallbackTheta),
                radius * Math.cos(fallbackPhi)
            );
        } else {
            sphere.position.set(finalX, finalY, finalZ);
        }
        
        sphere.scale.setScalar(nodeScale); // Aplicar escala baseada em hub status
        
        // DESABILITAR FRUSTUM CULLING - nós sempre visíveis
        sphere.frustumCulled = false;
        
        // Dados customizados (usar posição do sphere que já foi validada)
        sphere.userData = {
            ...concept,
            originalColor: concept.color,
            originalEmissive: emissiveIntensity,
            originalOpacity: nodeOpacity, // Salvar opacidade original (hubs têm opacidade diferente)
            originalPosition: sphere.position.clone(), // Usar posição validada do sphere
            layerCenter: center, // Centro do cluster para referência visual
            isHub: hubStatus,
            isBridge: bridgeStatus,
            clusterScore: clusterScore,
            baseScale: nodeScale
        };

        scene.add(sphere);
        nodes.push(sphere);
        
        // Remover luz interna para reduzir carga de processamento
        // (a emissão do material já fornece o brilho necessário)

        // Adicionar label (sprite de texto)
        createLabel(concept.name, sphere);
    });
    
    // Aplicar relaxamento cibernético: auto-organização através de feedback iterativo
    // Mais iterações = maior elasticidade, força decresce = homeostase emergente
    applyForceDirectedRelaxation(8); // 8 iterações para elasticidade cibernética
}

/**
 * Aplica relaxamento baseado em forças para melhorar distribuição espacial
 * PRINCÍPIO CIBERNÉTICO: Auto-organização através de feedback iterativo
 * - Força decresce exponencialmente (damping natural)
 * - Sistema converge para equilíbrio dinâmico sem oscilar
 * - Emergência de ordem sem controle central
 */
function applyForceDirectedRelaxation(iterations: number = 12) {
    const radius = 300;
    const minDistance = 35; // Distância mínima entre nós
    const baseRepulsion = 2.5; // Força base AUMENTADA para maior separação (era 0.8)
    const epsilon = 0.001; // Evitar divisão por zero
    
    for (let iter = 0; iter < iterations; iter++) {
        const forces = new Map(); // Armazena forças acumuladas para cada nó
        
        // DAMPING EXPONENCIAL SUAVE: e^(-t) com decay lento
        // Mantém força residual até o fim (nunca chega a zero)
        const t = iter / (iterations - 1); // 0 → 1
        const dampingFactor = Math.exp(-1.5 * t); // 1.0 → 0.22 (muito suave)
        const repulsionStrength = baseRepulsion * dampingFactor;
        
        // Inicializar forças
        nodes.forEach(node => {
            forces.set(node.userData.id, new THREE.Vector3(0, 0, 0));
        });
        
        // Calcular forças de repulsão entre nós próximos
        // FEEDBACK: Cada par influencia mutuamente (ação-reação)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                
                // Calcular distância
                const delta = new THREE.Vector3().subVectors(nodeA.position, nodeB.position);
                const distance = delta.length();
                
                // Aplicar repulsão se muito próximos (evitar divisão por zero)
                if (distance < minDistance && distance > epsilon) {
                    // Lei de potência: força inversamente proporcional à distância
                    // Elasticidade aumenta com proximidade (não-linear)
                    const normalizedDist = distance / minDistance; // 0 → 1
                    const elasticity = 1.0 - normalizedDist; // 1 → 0 (mais elástico quando próximo)
                    const repulsion = repulsionStrength * elasticity * elasticity; // Quadrático para suavidade
                    
                    const forceDir = delta.normalize();
                    
                    // Verificar se normalize() não gerou NaN
                    if (isFinite(forceDir.x) && isFinite(forceDir.y) && isFinite(forceDir.z)) {
                        forceDir.multiplyScalar(repulsion);
                        
                        // Aplicar força (ação-reação: feedback bidirecional)
                        const forceA = forces.get(nodeA.userData.id);
                        const forceB = forces.get(nodeB.userData.id);
                        
                        forceA.add(forceDir);
                        forceB.sub(forceDir);
                    }
                }
            }
        }
        
        // HOMEOSTASE: Aplicar forças e reprojetar na esfera (manter coesão)
        // Sistema busca equilíbrio entre repulsão (separação) e atração (esfera)
        nodes.forEach(node => {
            const force = forces.get(node.userData.id);
            
            if (force && force.length() > epsilon) {
                // Movimento proporcional à força acumulada
                // Damping implícito: forças diminuem a cada iteração
                node.position.add(force);
                
                // ATRATOR ESFÉRICO SUAVE: Tender à superfície sem forçar completamente
                // Permitir variação radial de ±15% para profundidade 3D
                const length = node.position.length();
                if (length > epsilon) {
                    const targetRadius = radius + (Math.random() - 0.5) * radius * 0.3; // ±15%
                    node.position.normalize().multiplyScalar(targetRadius);
                    
                    // Validar resultado antes de salvar
                    if (isFinite(node.position.x) && isFinite(node.position.y) && isFinite(node.position.z)) {
                        // Atualizar posição original (memória do sistema)
                        node.userData.originalPosition.copy(node.position);
                    }
                }
            }
        });
    }
    
}

// ============================================================================
// CÁLCULO DE RANGE DE CONEXÕES
// ============================================================================

/**
 * Calcula min/max número de conexões para normalização da repulsão
 */
function calculateConnectionRange() {
    minConnections = Infinity;
    maxConnections = 0;
    
    nodes.forEach(node => {
        const connCount = getConceptConnections(node.userData.id).length;
        minConnections = Math.min(minConnections, connCount);
        maxConnections = Math.max(maxConnections, connCount);
    });
}

/**
 * Normaliza o número de conexões para um valor entre 0 e 1
 * 0 = mínimo de conexões (repulsão mínima)
 * 1 = máximo de conexões (repulsão máxima)
 */
function normalizeConnectionWeight(connectionCount) {
    if (maxConnections === minConnections) return 0.5; // Todos têm mesmo peso
    return (connectionCount - minConnections) / (maxConnections - minConnections);
}

// ============================================================================
// CRIAÇÃO DE LABELS
// ============================================================================

function createLabel(text, node) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Reduzir tamanho da fonte para melhor performance
    context.font = 'Bold 32px Arial';
    
    // Quebrar texto em múltiplas linhas se necessário
    const words = text.split(' ');
    let line1, line2;
    
    // Tentar ajustar as linhas para melhor visualização
    if (words.length <= 2) {
        line1 = text;
        line2 = '';
    } else if (words.length === 3) {
        line1 = words.slice(0, 2).join(' ');
        line2 = words[2];
    } else {
        // 4 ou mais palavras: dividir ao meio
        const mid = Math.ceil(words.length / 2);
        line1 = words.slice(0, mid).join(' ');
        line2 = words.slice(mid).join(' ');
    }
    
    // Medir largura necessária
    const line1Width = context.measureText(line1).width;
    const line2Width = line2 ? context.measureText(line2).width : 0;
    const maxWidth = Math.max(line1Width, line2Width);
    
    // Canvas menor para melhor performance
    canvas.width = Math.max(200, Math.min(400, maxWidth + 40));
    canvas.height = line2 ? 100 : 60;
    
    // Redesenhar com novo tamanho
    const fontSize = canvas.width < 250 ? 28 : 32;
    context.font = `Bold ${fontSize}px Arial`;
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar borda sutil
    context.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    if (line2) {
        context.fillText(line1, canvas.width / 2, canvas.height * 0.35);
        context.fillText(line2, canvas.width / 2, canvas.height * 0.65);
    } else {
        context.fillText(line1, canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    
    // DESABILITAR FRUSTUM CULLING - labels sempre visíveis
    sprite.frustumCulled = false;
    
    // Escala menor para labels
    const scale = canvas.width / 400 * 70;
    sprite.scale.set(scale, scale * (canvas.height / canvas.width), 1);
    sprite.position.copy(node.position);
    sprite.position.y += 28;

    scene.add(sprite);
    node.userData.label = sprite;
}

// ============================================================================
// CRIAÇÃO DE CONEXÕES
// ============================================================================

function createConnections() {
    const SPHERE_RADIUS = 300; // Mesmo raio usado em createNodes
    
    // Criar set para evitar duplicatas
    const processedPairs = new Set();
    
    concepts.forEach((concept) => {
        const sourceNode = nodes.find(n => n.userData.id === concept.id);
        if (!sourceNode) return;
        
        const connections = connectionCache.get(concept.id) || [];
        
        connections.forEach((connId) => {
            // Encontrar o conceito conectado pelo ID
            const targetConcept = concepts.find(c => c.id === connId);
            if (!targetConcept) return;
            
            const targetNode = nodes.find(n => n.userData.id === targetConcept.id);
            if (!targetNode) return;
            
            // Evitar duplicatas (processar cada par apenas uma vez)
            const pairKey = [concept.id, targetConcept.id].sort().join('|');
            if (processedPairs.has(pairKey)) return;
            processedPairs.add(pairKey);
                // Detectar se esta é uma conexão de ponte (cross-layer)
                const isCrossLayer = sourceNode.userData.layer !== targetNode.userData.layer;
                const sourceBridge = sourceNode.userData.isBridge;
                const targetBridge = targetNode.userData.isBridge;
                const isBridgeConnection = isCrossLayer && (sourceBridge || targetBridge);
                
                // Criar linha usando LineSegments (muito mais leve)
                const isDark = !isLightTheme();
                // Modo claro: opacidade completa para melhor visibilidade
                let lineOpacity = isDark ? (showAllConnections ? 0.8 : 0.6) : (showAllConnections ? 1.0 : 1.0);
                
                // Aumentar opacidade para conexões de ponte
                if (isBridgeConnection) {
                    lineOpacity = Math.min(1.0, lineOpacity * 1.3);
                }
                
                // Cor da linha: mistura das cores dos dois nós conectados
                const sourceColor = new THREE.Color(sourceNode.userData.originalColor);
                const targetColor = new THREE.Color(targetNode.userData.originalColor);
                const lineColor = sourceColor.clone().lerp(targetColor, 0.5); // Média das cores
                
                // No modo claro, escurecer ligeiramente a cor para melhor contraste
                if (!isDark) {
                    lineColor.multiplyScalar(0.7); // Reduz brilho em 30% no modo claro
                }
                
                // Para pontes, adicionar destaque visual (cor mais intensa)
                if (isBridgeConnection) {
                    lineColor.multiplyScalar(1.2); // Aumentar intensidade em 20%
                }
                
                const material = new THREE.LineBasicMaterial({
                    color: lineColor,
                    transparent: true,
                    opacity: lineOpacity,
                    blending: isLightTheme() ? THREE.NormalBlending : THREE.AdditiveBlending,
                    linewidth: isBridgeConnection ? 3 : 2 // Linhas mais grossas para pontes
                });

                // Usar geometria de linha simples (BufferGeometry)
                const sourcePos = sourceNode.userData.originalPosition || sourceNode.position;
                const targetPos = targetNode.userData.originalPosition || targetNode.position;
                
                // Validar que as posições são válidas
                const isSourceValid = isFinite(sourcePos.x) && isFinite(sourcePos.y) && isFinite(sourcePos.z);
                const isTargetValid = isFinite(targetPos.x) && isFinite(targetPos.y) && isFinite(targetPos.z);
                
                if (!isSourceValid || !isTargetValid) {
                    return; // Pular esta conexão silenciosamente
                }
                
                const points = [
                    sourcePos.clone(),
                    targetPos.clone()
                ];
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                
                // Buscar nome da relação usando IDs
                const relation = relations.find(r => 
                    (r.from === concept.id && r.to === targetConcept.id) ||
                    (r.from === targetConcept.id && r.to === concept.id)
                );
                
                line.userData = {
                    source: sourceNode,
                    target: targetNode,
                    from: concept.id,
                    to: targetConcept.id,
                    isConnection: true,
                    isBridge: isBridgeConnection,
                    isCrossLayer: isCrossLayer,
                    relationName: relation ? relation.name : null,
                    relationDescription: relation ? relation.description : null,
                    originalColor: lineColor // Salvar a cor misturada como original
                };

                scene.add(line);
                lines.push(line);
                
                // Criar label da relação (se existir)
                if (relation && relation.name) {
                    createEdgeLabel(line, relation.name, sourceNode, targetNode);
                }
        });
    });
}

// ============================================================================
// SUPERFÍCIE ESFÉRICA
// ============================================================================

function createSphere() {
    const SPHERE_RADIUS = 300; // Mesmo raio dos nós
    
    // Criar geometria esférica com wireframe
    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
    
    const isDark = !isLightTheme();
    
    // Material semi-transparente com wireframe
    // No modo claro: cor mais escura e opacidade maior para melhor visibilidade
    const material = new THREE.MeshBasicMaterial({
        color: isDark ? 0x00ff88 : 0x0066aa,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.15 : 0.35,
        side: THREE.DoubleSide
    });
    
    sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.visible = false; // Inicialmente invisível
    scene.add(sphereMesh);
}

function updateSphereTheme() {
    if (!sphereMesh) return;
    
    const isDark = !isLightTheme();
    // Modo claro: cor mais escura e opacidade maior
    sphereMesh.material.color.setHex(isDark ? 0x00ff88 : 0x0066aa);
    sphereMesh.material.opacity = isDark ? 0.15 : 0.35;
}

function toggleSphere() {
    if (!sphereMesh) {
        createSphere();
    }
    
    sphereVisible = !sphereVisible;
    sphereMesh.visible = sphereVisible;
    
    // Atualizar cor baseado no tema atual
    updateSphereTheme();
    
    // Ajustar opacidade das arestas
    const isDark = !isLightTheme();
    lines.forEach(line => {
        if (sphereVisible) {
            // Reduzir opacidade quando esfera está ativa
            const reducedOpacity = isDark ? 
                (line.userData.isGlow ? 0.3 : 0.4) : 
                (line.userData.isGlow ? 0.6 : 0.7);
            line.material.opacity = reducedOpacity;
        } else {
            // Restaurar opacidade normal
            const normalOpacity = isDark ? 
                (line.userData.isGlow ? 0.6 : 0.8) : 
                (line.userData.isGlow ? 1.0 : 1.0);
            line.material.opacity = normalOpacity;
        }
    });
    
    // Atualizar ícone do botão
    const sphereToggle = document.getElementById('sphere-toggle');
    if (sphereToggle) {
        const icon = sphereToggle.querySelector('.btn-icon');
        if (icon) {
            icon.textContent = sphereVisible ? '●' : '○';
        }
    }
    
    showNotification(sphereVisible ? 'Superfície esférica ativada' : 'Superfície esférica desativada');
}

// Expor função para HTML
window.toggleSphere = toggleSphere;

/**
 * Cria uma curva geodésica (arco) na superfície de uma esfera
 * NOTA: Função mantida para compatibilidade, mas não mais usada
 */
function createGeodesicCurve(start, end, radius) {
    const startNorm = start.clone().normalize();
    const endNorm = end.clone().normalize();
    
    return new THREE.QuadraticBezierCurve3(
        start.clone(),
        new THREE.Vector3()
            .addVectors(start, end)
            .multiplyScalar(0.5)
            .normalize()
            .multiplyScalar(radius * 1.1),
        end.clone()
    );
}

// Criar label para uma aresta (relação entre nós)
function createEdgeLabel(line, relationName, sourceNode, targetNode) {
    // Calcular posição no meio da linha
    const midpoint = new THREE.Vector3().addVectors(
        sourceNode.position,
        targetNode.position
    ).multiplyScalar(0.5);
    
    // Criar canvas para o texto
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    // Background semi-transparente
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto
    context.font = 'Bold 16px Arial';
    context.fillStyle = '#00ff88';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(relationName, canvas.width / 2, canvas.height / 2);
    
    // Criar sprite
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; // Desabilitar mipmaps para evitar warnings
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        depthTest: true,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(40, 10, 1);
    sprite.position.copy(midpoint);
    
    // Guardar referência no userData da linha
    line.userData.label = sprite;
    
    // Inicialmente invisível (só aparece quando linha está ativa)
    sprite.visible = false;
    
    scene.add(sprite);
}

// Função para atualizar cores das linhas quando tema muda
function updateLineColors() {
    const useNormalBlending = isLightTheme();
    
    lines.forEach(line => {
        line.material.blending = useNormalBlending ? THREE.NormalBlending : THREE.AdditiveBlending;
        line.material.needsUpdate = true;
    });
}

// ============================================================================
// MOVIMENTO DOS NÓS SOBRE A REDE (CAOS)
// ============================================================================

/**
 * Aplica forças de mola nas arestas para manter distâncias min/max
 * OTIMIZADO: Cálculo preciso com hierarquia radial e tensão relacional
 * - Ajusta distâncias ideais baseado em camadas radiais
 * - Considera peso dos nós (conectividade) para inércia
 * - Tensão não-linear para estabilidade
 */
function applyEdgeSpringForces(SPHERE_RADIUS) {
    const springForces = new Map(); // Map<nodeId, Vector3>
    
    // Inicializar forças para todos os nós
    nodes.forEach(node => {
        springForces.set(node.userData.id, new THREE.Vector3(0, 0, 0));
    });
    
    // Calcular forças de mola para cada aresta
    lines.forEach(line => {
        const sourceNode = line.userData.source;
        const targetNode = line.userData.target;
        
        if (sourceNode && targetNode) {
            const sourcePos = sourceNode.position;
            const targetPos = targetNode.position;
            const currentDistance = sourcePos.distanceTo(targetPos);
            
            if (currentDistance < 0.1) return; // Skip se muito próximos
            
            const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
            
            // ===== HIERARQUIA RADIAL REFINADA =====
            const sourceRadius = sourcePos.length();
            const targetRadius = targetPos.length();
            const avgRadius = (sourceRadius + targetRadius) / 2;
            const radiusDiff = Math.abs(sourceRadius - targetRadius);
            
            // Fator de camada: nós na mesma camada ficam mais próximos
            const layerSimilarity = Math.exp(-radiusDiff / 30);
            
            // Fator radial: nós externos toleram mais distância
            const radialFactor = 0.8 + (avgRadius / SPHERE_RADIUS) * 0.4;
            
            // ===== DISTÂNCIAS IDEAIS AJUSTADAS =====
            const baseMinLength = MIN_EDGE_LENGTH * radialFactor;
            const baseMaxLength = MAX_EDGE_LENGTH * radialFactor;
            
            // Bônus de proximidade para nós na mesma camada
            const adjustedMinLength = baseMinLength * (0.9 + layerSimilarity * 0.1);
            const adjustedMaxLength = baseMaxLength * (0.85 + layerSimilarity * 0.15);
            const idealLength = (adjustedMinLength + adjustedMaxLength) / 2;
            
            // ===== CÁLCULO DE FORÇA NÃO-LINEAR =====
            let force = 0;
            
            if (currentDistance < adjustedMinLength) {
                // COMPRESSÃO: Força repulsiva suave (reduzida para evitar pulos)
                const compressionRatio = (adjustedMinLength - currentDistance) / adjustedMinLength;
                force = -(compressionRatio * compressionRatio * SPRING_STRENGTH * 2.0);
            }
            else if (currentDistance > adjustedMaxLength) {
                // ESTIRAMENTO: Força atrativa suave (reduzida para evitar pulos)
                const stretchRatio = (currentDistance - adjustedMaxLength) / adjustedMaxLength;
                force = (stretchRatio * stretchRatio * SPRING_STRENGTH * 1.5);
            }
            else {
                // EQUILÍBRIO: Força muito suave para comprimento ideal
                const deviation = currentDistance - idealLength;
                force = deviation * SPRING_STRENGTH * 0.15;
            }
            
            if (Math.abs(force) < 0.002) return; // Skip forças muito pequenas
            
            direction.normalize().multiplyScalar(force);
            
            // Validar normalização
            if (!isFinite(direction.x) || !isFinite(direction.y) || !isFinite(direction.z)) {
                return;
            }
            
            // ===== MULTIPLICADOR RELACIONAL REFINADO =====
            const sourceConnCount = getConceptConnections(sourceNode.userData.id).length;
            const targetConnCount = getConceptConnections(targetNode.userData.id).length;
            const sourceWeightNorm = normalizeConnectionWeight(sourceConnCount);
            const targetWeightNorm = normalizeConnectionWeight(targetConnCount);
            
            // Relacionalidade média da aresta (0 a 1)
            const edgeRelationality = (sourceWeightNorm + targetWeightNorm) / 2;
            
            // Multiplicador ULTRA moderado (0.8× a 1.1×) - anti-tremulidade
            const relationalMultiplier = 0.8 + edgeRelationality * 0.3;
            
            // Bônus para arestas entre nós da mesma camada (mínimo)
            const layerBonus = 1.0 + layerSimilarity * 0.1;
            
            // Força final ajustada
            const finalStrength = force * relationalMultiplier * layerBonus;
            direction.normalize().multiplyScalar(finalStrength);
            
            // Validar novamente
            if (!isFinite(direction.x) || !isFinite(direction.y) || !isFinite(direction.z)) {
                return;
            }
            
            // ===== DISTRIBUIÇÃO COM INÉRCIA RELACIONAL =====
            // Nós com mais conexões = mais massa = menos aceleração
            const sourceWeight = Math.max(1, sourceConnCount);
            const targetWeight = Math.max(1, targetConnCount);
            const totalWeight = sourceWeight + targetWeight;
            
            // Proporção inversa: nó mais leve recebe mais força
            const sourceRatio = targetWeight / totalWeight;
            const targetRatio = sourceWeight / totalWeight;
            
            // Aplicar forças aos nós
            const sourceForce = springForces.get(sourceNode.userData.id);
            const targetForce = springForces.get(targetNode.userData.id);
            
            if (sourceForce) sourceForce.add(direction.clone().multiplyScalar(sourceRatio));
            if (targetForce) targetForce.sub(direction.clone().multiplyScalar(targetRatio));
        }
    });
    
    // ===== APLICAR FORÇAS COM AMORTECIMENTO =====
    nodes.forEach(node => {
        const force = springForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.001) {
            // Amortecimento para estabilizar oscilações
            force.multiplyScalar(SPRING_DAMPING);
            node.position.add(force);
            
            // Projeção esférica PROPORCIONAL à relacionalidade
            const length = node.position.length();
            if (length > 0.001) {
                const connectionCount = getConceptConnections(node.userData.id).length;
                const weightNormalized = normalizeConnectionWeight(connectionCount);
                
                const currentRadius = length;
                const targetRadius = SPHERE_RADIUS * (0.9 + Math.random() * 0.2);
                // Hubs: até 25% de força centrípeta, Periféricos: 5%
                const blendFactor = 0.05 + weightNormalized * 0.20;
                const newRadius = currentRadius * (1 - blendFactor) + targetRadius * blendFactor;
                node.position.normalize().multiplyScalar(newRadius);
            }
        }
    });
}

/**
 * NOVA FUNÇÃO: Aplica força de ATRAÇÃO entre nós conectados
 * Conceitos relacionados se aproximam suavemente
 * MELHORADO: Considera hierarquia radial
 */
function applyAttractionForces(SPHERE_RADIUS) {
    const attractionForces = new Map();
    
    // Inicializar forças
    nodes.forEach(node => {
        attractionForces.set(node.userData.id, new THREE.Vector3(0, 0, 0));
    });
    
    // Para cada aresta (relação), aplicar atração mútua
    lines.forEach(line => {
        const sourceNode = line.userData.source;
        const targetNode = line.userData.target;
        
        if (sourceNode && targetNode) {
            const sourcePos = sourceNode.position;
            const targetPos = targetNode.position;
            const currentDistance = sourcePos.distanceTo(targetPos);
            
            // Atração apenas se estiverem além da distância ótima
            if (currentDistance > ATTRACTION_DISTANCE) {
                const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
                
                // HIERARQUIA RADIAL: Nós na mesma camada radial se atraem mais
                const sourceRadius = sourcePos.length();
                const targetRadius = targetPos.length();
                const radiusDiff = Math.abs(sourceRadius - targetRadius);
                const sameLayerBonus = 1.0 + Math.exp(-radiusDiff / 50); // Bonus se radios similares
                
                const distanceRatio = (currentDistance - ATTRACTION_DISTANCE) / SPHERE_RADIUS;
                
                // ATRAÇÃO RELACIONAL: Força proporcional à conectividade
                const sourceConnCount = getConceptConnections(sourceNode.userData.id).length;
                const targetConnCount = getConceptConnections(targetNode.userData.id).length;
                const sourceWeightNorm = normalizeConnectionWeight(sourceConnCount);
                const targetWeightNorm = normalizeConnectionWeight(targetConnCount);
                
                // Relacionalidade média (0 a 1)
                const edgeRelationality = (sourceWeightNorm + targetWeightNorm) / 2;
                
                // Hubs atraem moderadamente (0.7× a 1.8×)
                const relationalMultiplier = 0.7 + edgeRelationality * 1.1;
                const strength = ATTRACTION_FORCE * Math.min(distanceRatio, 1.0) * 
                               relationalMultiplier * sameLayerBonus;
                
                direction.normalize().multiplyScalar(strength);
                
                // Validar normalização
                if (!isFinite(direction.x) || !isFinite(direction.y) || !isFinite(direction.z)) {
                    return;
                }
                
                // Aplicar atração com inércia relacional (F = ma → a = F/m)
                // Nó com mais conexões = mais massa = recebe MENOS aceleração
                const sourceWeight = Math.max(1, sourceConnCount);
                const targetWeight = Math.max(1, targetConnCount);
                const totalWeight = sourceWeight + targetWeight;
                
                // Proporção inversa: nó mais leve recebe mais força
                const sourceRatio = targetWeight / totalWeight; // source recebe proporcional ao peso do target
                const targetRatio = sourceWeight / totalWeight; // target recebe proporcional ao peso do source
                
                const sourceForce = attractionForces.get(sourceNode.userData.id);
                const targetForce = attractionForces.get(targetNode.userData.id);
                
                if (sourceForce) sourceForce.add(direction.clone().multiplyScalar(sourceRatio));
                if (targetForce) targetForce.sub(direction.clone().multiplyScalar(targetRatio));
            }
        }
    });
    
    // Aplicar forças de atração (já distribuídas com disputa gravitacional)
    nodes.forEach(node => {
        const force = attractionForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.001) {
            node.position.add(force);
            
            // Projeção esférica PROPORCIONAL à relacionalidade
            const length = node.position.length();
            if (length > 0.001) {
                const connectionCount = getConceptConnections(node.userData.id).length;
                const weightNormalized = normalizeConnectionWeight(connectionCount);
                
                const targetRadius = SPHERE_RADIUS * (0.9 + Math.random() * 0.2);
                // Hubs: até 40% de força centrípeta, Periféricos: 10%
                const blendFactor = 0.10 + weightNormalized * 0.30;
                const newRadius = length * (1 - blendFactor) + targetRadius * blendFactor;
                node.position.normalize().multiplyScalar(newRadius);
            }
        }
    });
}

/**
 * NOVA FUNÇÃO: Aplica força de COESÃO entre conceitos da mesma camada ontológica
 * Cria agrupamentos naturais por camada (fundacional, ontológica, etc.)
 * REFINADA: Força progressiva baseada em distância ao centróide
 */
function applyLayerCohesion(SPHERE_RADIUS) {
    const cohesionForces = new Map();
    
    // Inicializar forças
    nodes.forEach(node => {
        cohesionForces.set(node.userData.id, new THREE.Vector3(0, 0, 0));
    });
    
    // Agrupar nós por camada
    const nodesByLayer = new Map();
    nodes.forEach(node => {
        const layer = node.userData.layer || 'undefined';
        if (!nodesByLayer.has(layer)) {
            nodesByLayer.set(layer, []);
        }
        nodesByLayer.get(layer).push(node);
    });
    
    // Para cada camada, aplicar atração suave entre seus membros
    nodesByLayer.forEach((layerNodes, layer) => {
        if (layerNodes.length < 2) return; // Skip camadas com 1 ou 0 nós
        
        // Calcular centróide da camada
        const centroid = new THREE.Vector3(0, 0, 0);
        layerNodes.forEach(node => {
            centroid.add(node.position);
        });
        centroid.divideScalar(layerNodes.length);
        
        // Normalizar centróide para superfície esférica
        const centroidLength = centroid.length();
        if (centroidLength > 0.001) {
            centroid.normalize().multiplyScalar(SPHERE_RADIUS);
        } else {
            // Se centróide está na origem, usar posição padrão
            centroid.set(SPHERE_RADIUS, 0, 0);
        }
        
        // Aplicar força progressiva em direção ao centróide para cada nó da camada
        layerNodes.forEach(node => {
            const distance = node.position.distanceTo(centroid);
            
            // Força progressiva: quanto mais longe, mais forte a atração
            if (distance > LAYER_COHESION_DISTANCE) {
                const direction = new THREE.Vector3().subVectors(centroid, node.position);
                const distanceRatio = Math.min((distance - LAYER_COHESION_DISTANCE) / SPHERE_RADIUS, 1.0);
                
                // COESÃO RELACIONAL: Hubs têm mais força de coesão (MODERADA)
                const connectionCount = getConceptConnections(node.userData.id).length;
                const weightNormalized = normalizeConnectionWeight(connectionCount);
                
                // Hubs se mantêm próximos (0.5× a 1.5×) - era 0.3× a 2×
                const relationalMultiplier = 0.5 + weightNormalized * 1.0;
                
                // Força quadrática amplificada pela relacionalidade
                const strength = LAYER_COHESION * distanceRatio * distanceRatio * 1.5 * relationalMultiplier;
                direction.normalize().multiplyScalar(strength);
                
                // Validar normalização
                if (isFinite(direction.x) && isFinite(direction.y) && isFinite(direction.z)) {
                    const force = cohesionForces.get(node.userData.id);
                    if (force) force.add(direction);
                }
            } else if (distance < LAYER_COHESION_DISTANCE * 0.5) {
                // Repulsão suave se muito próximo ao centróide (evita colapso no centro)
                const direction = new THREE.Vector3().subVectors(node.position, centroid);
                const proximityRatio = 1.0 - (distance / (LAYER_COHESION_DISTANCE * 0.5));
                const strength = LAYER_COHESION * 0.3 * proximityRatio;
                direction.normalize().multiplyScalar(strength);
                
                // Validar normalização
                if (isFinite(direction.x) && isFinite(direction.y) && isFinite(direction.z)) {
                    const force = cohesionForces.get(node.userData.id);
                    if (force) force.add(direction);
                }
            }
        });
    });
    
    // Aplicar forças de coesão com inércia relacional (F = ma → a = F/m)
    nodes.forEach(node => {
        const force = cohesionForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.0001) {
            const connectionCount = getConceptConnections(node.userData.id).length;
            const mass = Math.max(1, connectionCount); // Massa proporcional às conexões
            
            // Aceleração = Força / Massa (hubs movem menos com mesma força)
            const acceleration = force.clone().multiplyScalar(1.0 / mass);
            
            // Validar para evitar NaN
            if (!isFinite(acceleration.x) || !isFinite(acceleration.y) || !isFinite(acceleration.z)) {
                return;
            }
            
            node.position.add(acceleration);
            
            // Projeção esférica PROPORCIONAL à relacionalidade
            const length = node.position.length();
            if (length > 0.001) {
                const weightNormalized = normalizeConnectionWeight(connectionCount);
                
                const targetRadius = SPHERE_RADIUS * (0.9 + Math.random() * 0.2);
                // Hubs: até 30% de força centrípeta, Periféricos: 8%
                const blendFactor = 0.08 + weightNormalized * 0.22;
                const newRadius = length * (1 - blendFactor) + targetRadius * blendFactor;
                node.position.normalize().multiplyScalar(newRadius);
            }
        }
    });
}

/**
 * Calcula força de repulsão entre nós (antigravidade)
 * OTIMIZADO: Verifica apenas vizinhos próximos usando grid espacial
 * NORMALIZADO: Repulsão varia de 0 (min conexões) a 1 (max conexões)
 */
function applyRepulsionForces(node, allNodes, SPHERE_RADIUS) {
    const repulsionForce = new THREE.Vector3(0, 0, 0);
    let repulsionCount = 0;
    
    // Peso normalizado do nó atual (0 a 1)
    const nodeConnectionCount = getConceptConnections(node.userData.id).length;
    const nodeWeightNormalized = normalizeConnectionWeight(nodeConnectionCount);
    
    // Otimização: limitar número de verificações
    for (let i = 0; i < allNodes.length && repulsionCount < 5; i++) {
        const otherNode = allNodes[i];
        if (otherNode === node) continue;
        
        const distance = node.position.distanceTo(otherNode.position);
        
        // Aplicar repulsão se estiver dentro do campo
        if (distance < REPULSION_DISTANCE && distance > 0.1) {
            const direction = new THREE.Vector3().subVectors(node.position, otherNode.position);
            direction.normalize();
            
            // Validar normalização
            if (!isFinite(direction.x) || !isFinite(direction.y) || !isFinite(direction.z)) {
                continue;
            }
            
            // LEI DO INVERSO DO QUADRADO (Lei de Coulomb para cargas elétricas)
            // F = k × (q1 × q2) / d²
            // Quanto mais próximo, MUITO mais forte a repulsão
            const distanceSquared = distance * distance;
            const inverseLaw = REPULSION_DISTANCE * REPULSION_DISTANCE / distanceSquared;
            
            // REPULSÃO RELACIONAL: "Carga elétrica" moderada
            const otherConnectionCount = getConceptConnections(otherNode.userData.id).length;
            const otherWeightNormalized = normalizeConnectionWeight(otherConnectionCount);
            
            // Relacionalidade moderada (0.5× a 1.5×) - era 0.25× a 2.25×
            // Fórmula modificada: carga base + peso normalizado
            const chargeFactor = (0.5 + nodeWeightNormalized * 0.5) * (0.5 + otherWeightNormalized * 0.5);
            
            // FORÇA ELETROMAGNÉTICA: F = k × q₁×q₂ / d²
            // Inversamente proporcional ao quadrado da distância + carga relacional
            const strength = REPULSION_FORCE * inverseLaw * chargeFactor;
            
            // Limitar força máxima moderadamente (era 50×, agora 20×)
            const clampedStrength = Math.min(strength, REPULSION_FORCE * 20);
            
            direction.multiplyScalar(clampedStrength);
            
            repulsionForce.add(direction);
            repulsionCount++;
        }
    }
    
    // Aplicar força de repulsão com inércia relacional (F = ma → a = F/m)
    // Nó com mais conexões = mais massa = recebe MENOS aceleração
    if (repulsionForce.lengthSq() > 0) {
        const connectionCount = getConceptConnections(node.userData.id).length;
        const mass = Math.max(1, connectionCount); // Massa proporcional às conexões
        
        // Aceleração = Força / Massa (hubs movem menos com mesma força)
        const acceleration = repulsionForce.clone().multiplyScalar(1.0 / mass);
        
        // Validar para evitar NaN
        if (!isFinite(acceleration.x) || !isFinite(acceleration.y) || !isFinite(acceleration.z)) {
            return;
        }
        
        node.position.add(acceleration);
        
        // Projeção esférica PROPORCIONAL à relacionalidade
        const length = node.position.length();
        if (length > 0.001) {
            const weightNormalized = normalizeConnectionWeight(connectionCount);
            
            const targetRadius = SPHERE_RADIUS * (0.9 + Math.random() * 0.2);
            // Hubs: até 35% de força centrípeta, Periféricos: 5%
            const blendFactor = 0.05 + weightNormalized * 0.30;
            const newRadius = length * (1 - blendFactor) + targetRadius * blendFactor;
            node.position.normalize().multiplyScalar(newRadius);
        }
    }
}

/**
 * Inicializa oscilações PAÊBIRÚ - cada nó tem sua frequência única
 * "O caminho que se faz caminhando" - movimento orgânico emergente
 */
function initializeNodeOscillations() {
    nodes.forEach(node => {
        const connectionCount = getConceptConnections(node.userData.id).length;
        const weightNormalized = normalizeConnectionWeight(connectionCount);
        
        // Hubs oscilam mais lentamente (mais massa, mais inércia)
        // Periféricos oscilam mais rápido (menos massa, mais ágeis)
        const frequencyFactor = PHI - weightNormalized; // φ - peso (varia de ~0.6 a ~1.6)
        
        nodeOscillations.set(node.userData.id, {
            phase: Math.random() * Math.PI * 2, // Fase inicial aleatória
            frequency: OSCILLATION_BASE_FREQ * frequencyFactor,
            amplitude: OSCILLATION_AMPLITUDE * (PHI_INVERSE + weightNormalized * 0.4), // Hubs oscilam menos
            axis: new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize() // Eixo de oscilação único
        });
    });
}

/**
 * Inicializa movimento dos nós - cada nó escolhe um vizinho aleatório para caminhar
 */
function initializeNodeMovement() {
    // Inicializar oscilações PAÊBIRÚ
    initializeNodeOscillations();
    
    nodes.forEach(node => {
        const connections = getConceptConnections(node.userData.id);
        if (connections.length > 0) {
            // Escolher vizinho aleatório
            const randomTargetId = connections[Math.floor(Math.random() * connections.length)];
            
            // Armazenar apenas IDs, não referências (para evitar bugs de posição)
            nodeMovement.set(node.userData.id, {
                startNodeId: node.userData.id,
                targetNodeId: randomTargetId,
                progress: Math.random() * 0.3, // Começar no início do caminho (0-30%)
                speed: WALK_SPEED * (0.8 + Math.random() * 0.4), // Velocidade variável
                previousNodeId: null, // Memória do nó anterior (evitar volta imediata)
                pathHistory: [] // Histórico de caminhos recentes
            });
        }
    });
}

/**
 * Atualiza posições dos nós caminhando sobre as arestas
 */
function updateNodeMovement(deltaTime) {
    // Não mover nós se animação estiver pausada
    if (!isAnimating) return;
    
    const currentTime = Date.now();
    
    nodeMovement.forEach((movement, nodeId) => {
        const { startNodeId, targetNodeId, speed } = movement;
        let { progress } = movement;
        
        // Encontrar os nós
        const currentNode = nodes.find(n => n.userData.id === nodeId);
        const startNode = nodes.find(n => n.userData.id === startNodeId);
        const targetNode = nodes.find(n => n.userData.id === targetNodeId);
        
        if (!currentNode || !startNode || !targetNode) return;
        
        // Avançar ao longo da aresta
        progress += speed * deltaTime * 0.06 * animationSpeed;
        
        // Se chegou ao destino, escolher próximo vizinho
        if (progress >= 1.0) {
            const connections = getConceptConnections(targetNode.userData.id);
            if (connections.length > 0) {
                // Filtrar conexões para EVITAR voltar pro nó anterior
                const previousNodeId = movement.previousNodeId;
                const pathHistory = movement.pathHistory || [];
                
                let availableConnections = connections.filter(connId => {
                    // Não voltar para o nó anterior
                    if (connId === previousNodeId) return false;
                    // Não repetir últimos 3 nós visitados
                    if (pathHistory.includes(connId)) return false;
                    return true;
                });
                
                // Se filtrou tudo (ciclo), permitir qualquer exceto o anterior imediato
                if (availableConnections.length === 0) {
                    availableConnections = connections.filter(connId => connId !== previousNodeId);
                }
                
                // Se ainda está vazio, usar todas
                if (availableConnections.length === 0) {
                    availableConnections = connections;
                }
                
                // Escolher aleatório entre as opções filtradas (mais natural que sempre o mais próximo)
                const nextTargetId = availableConnections[Math.floor(Math.random() * availableConnections.length)];
                
                // Atualizar histórico de caminho
                pathHistory.push(targetNodeId);
                if (pathHistory.length > 3) {
                    pathHistory.shift(); // Manter apenas últimos 3
                }
                
                // Salvar a posição atual do nó como ponto de partida da próxima aresta
                // Isso evita "pulos" ao mudar de aresta
                movement.lastPosition = currentNode.position.clone();
                
                // Atualizar IDs mantendo o targetNode como novo startNode
                movement.previousNodeId = startNodeId;
                movement.startNodeId = targetNodeId;
                movement.targetNodeId = nextTargetId;
                movement.pathHistory = pathHistory;
                movement.progress = 0;
                progress = 0;
            } else {
                progress = 0; // Resetar se não há conexões
            }
        }
        
        // Salvar progresso atualizado
        movement.progress = progress;
        
        // MOVIMENTO COM VARIAÇÃO RADIAL:
        // Aplicar easing para transições mais suaves (evita mudanças bruscas)
        const easedProgress = progress < 0.5 
            ? 2 * progress * progress  // Ease in (aceleração suave)
            : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease out (desaceleração suave)
        
        const SPHERE_RADIUS = 300;
        
        // Usar posição salva quando mudamos de aresta (evita glitch)
        // ou posição original do nó de origem
        const startOriginal = movement.lastPosition || startNode.userData.originalPosition;
        const targetOriginal = targetNode.userData.originalPosition;
        
        // Interpolação usando o progresso suavizado
        const interpolatedPos = new THREE.Vector3().lerpVectors(
            startOriginal,
            targetOriginal,
            easedProgress
        );
        
        // PERMITIR PROFUNDIDADE 3D - não forçar superfície exata
        // Tender à esfera mas permitir variação radial
        const length = interpolatedPos.length();
        if (length > 0.001) {
            // Raio alvo com variação baseada na posição original
            const startRadius = startOriginal.length();
            const targetRadius = targetOriginal.length();
            const interpolatedRadius = startRadius + (targetRadius - startRadius) * easedProgress;
            
            // Normalizar direção mas usar raio interpolado (mantém profundidade)
            const newPos = interpolatedPos.normalize().multiplyScalar(interpolatedRadius);
            
            // APLICAR DANÇA PAÊBIRÚ - oscilação harmônica anti-colapso
            const oscillation = nodeOscillations.get(nodeId);
            if (oscillation) {
                const time = Date.now();
                const phase = oscillation.phase + time * oscillation.frequency;
                
                // Oscilação senoidal no eixo único do nó
                const displacement = oscillation.axis.clone()
                    .multiplyScalar(Math.sin(phase) * oscillation.amplitude);
                
                newPos.add(displacement);
            }
            
            // Validar resultado
            if (isFinite(newPos.x) && isFinite(newPos.y) && isFinite(newPos.z)) {
                currentNode.position.copy(newPos);
            }
        }
    });
    
    // Atualizar labels após movimento
    nodes.forEach(node => {
        if (node.userData.label) {
            node.userData.label.position.copy(node.position);
            node.userData.label.position.y += 28;
        }
    });
    
    // APLICAR FORÇAS FÍSICAS RELACIONAIS (a cada frame)
    const SPHERE_RADIUS = 300;
    
    // 1. Força de REPULSÃO (SEMPRE, PRIORIDADE MÁXIMA - evita colapso!)
    nodes.forEach(node => {
        applyRepulsionForces(node, nodes, SPHERE_RADIUS);
    });
    
    // 2. Força de ATRAÇÃO entre conceitos conectados (aproxima relacionados)
    applyAttractionForces(SPHERE_RADIUS);
    
    // 3. Força de MOLA nas arestas (mantém distâncias min/max)
    applyEdgeSpringForces(SPHERE_RADIUS);
    
    // 4. Força de COESÃO entre conceitos da mesma camada ontológica (agrupa por camada)
    // Aplicar apenas a cada 2 frames para performance
    if (frameCount % 2 === 0) {
        applyLayerCohesion(SPHERE_RADIUS);
    }
    
    // ATUALIZAR LINHAS - os nós arrastam as arestas
    updateConnectionLines();
}

/**
 * Atualiza as posições das linhas de conexão baseadas nas novas posições dos nós
 * Os nós arrastam as arestas enquanto caminham na superfície esférica
 */
let lineUpdateThrottle = 0;
function updateConnectionLines() {
    // Atualizar apenas a cada 2 frames
    lineUpdateThrottle++;
    if (lineUpdateThrottle < 2) {
        return;
    }
    lineUpdateThrottle = 0;
    
    lines.forEach(line => {
        const sourceNode = line.userData.source;
        const targetNode = line.userData.target;
        
        if (sourceNode && targetNode && line.geometry) {
            // Verificar se é uma linha simples (BufferGeometry com 2 pontos) ou cilindro
            const positions = line.geometry.attributes.position?.array;
            
            if (positions && positions.length === 6) {
                // Linha simples - atualizar os 2 pontos
                positions[0] = sourceNode.position.x;
                positions[1] = sourceNode.position.y;
                positions[2] = sourceNode.position.z;
                
                positions[3] = targetNode.position.x;
                positions[4] = targetNode.position.y;
                positions[5] = targetNode.position.z;
                
                line.geometry.attributes.position.needsUpdate = true;
                
                // Atualizar label
                if (line.userData.label) {
                    const midpoint = new THREE.Vector3(
                        (positions[0] + positions[3]) / 2,
                        (positions[1] + positions[4]) / 2,
                        (positions[2] + positions[5]) / 2
                    );
                    line.userData.label.position.copy(midpoint);
                }
            } else if (line.geometry.type === 'CylinderGeometry') {
                // Cilindro (gradiente) - reposicionar e reorientar
                const sourcePos = sourceNode.position;
                const targetPos = targetNode.position;
                const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
                const length = direction.length();
                
                // Atualizar tamanho do cilindro se mudou
                if (Math.abs(line.geometry.parameters.height - length) > 0.01) {
                    const lineRadius = 0.5;
                    const isGradient = line.material.vertexColors;
                    
                    if (isGradient) {
                        // Recriar gradiente com novo tamanho
                        const sourceColor = line.userData.source.userData.originalColor;
                        const targetColor = line.userData.target.userData.originalColor;
                        updateLineGradient(line, sourceColor, targetColor);
                    } else {
                        // Recriar cilindro simples com novo tamanho
                        line.geometry.dispose();
                        line.geometry = new THREE.CylinderGeometry(lineRadius, lineRadius, length, 8, 1);
                    }
                }
                
                // Atualizar posição e orientação
                line.position.copy(sourcePos).add(direction.clone().multiplyScalar(0.5));
                line.quaternion.setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    direction.normalize()
                );
                
                // Atualizar label
                if (line.userData.label) {
                    line.userData.label.position.copy(line.position);
                }
            }
        }
    });
}

// Função para criar gradiente de cor na linha entre dois nós
function updateLineGradient(line, sourceColor, targetColor) {
    // Para cilindros, criar geometria com cores por vértice ao longo do comprimento
    const sourcePos = line.userData.source.position;
    const targetPos = line.userData.target.position;
    
    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos);
    const length = direction.length();
    const lineRadius = 0.5;
    
    // Criar cilindro com gradiente
    const segments = 20; // Mais segmentos para gradiente suave
    const radialSegments = 8;
    const geometry = new THREE.CylinderGeometry(lineRadius, lineRadius, length, radialSegments, segments);
    
    // Adicionar cores por vértice
    const colors = [];
    const positions = geometry.attributes.position;
    const sourceColorObj = new THREE.Color(sourceColor);
    const targetColorObj = new THREE.Color(targetColor);
    
    for (let i = 0; i < positions.count; i++) {
        // Y vai de -length/2 a +length/2 no cilindro
        const y = positions.getY(i);
        const t = (y + length / 2) / length; // 0 a 1
        
        const color = sourceColorObj.clone().lerp(targetColorObj, t);
        colors.push(color.r, color.g, color.b);
    }
    
    // Atualizar geometria
    line.geometry.dispose();
    line.geometry = geometry;
    line.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Reposicionar e reorientar
    line.position.copy(sourcePos).add(direction.clone().multiplyScalar(0.5));
    line.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );
    
    // Ativar cores por vértice
    line.material.vertexColors = true;
    line.material.needsUpdate = true;
}

// Função para resetar linha para geometria original (linha simples)
function resetLineColor(line, color) {
    const sourcePos = line.userData.source.position;
    const targetPos = line.userData.target.position;
    
    // Validar posições antes de criar geometria
    const isSourceValid = isFinite(sourcePos.x) && isFinite(sourcePos.y) && isFinite(sourcePos.z);
    const isTargetValid = isFinite(targetPos.x) && isFinite(targetPos.y) && isFinite(targetPos.z);
    
    if (!isSourceValid || !isTargetValid) {
        console.warn('⚠️ Posições inválidas ao resetar linha, pulando');
        return; // Não atualizar geometria inválida
    }
    
    // Voltar para geometria de linha simples (BufferGeometry com 2 pontos)
    const points = [sourcePos.clone(), targetPos.clone()];
    
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Resetar posição e rotação para identidade
    line.position.set(0, 0, 0);
    line.quaternion.identity();
    
    // Desativar cores por vértice e usar cor única
    line.material.vertexColors = false;
    line.material.color.set(color);
    line.material.needsUpdate = true;
}

// ============================================================================
// FÍSICA QUÂNTICA RELACIONAL
// ============================================================================

/**
 * Inicializa campos quânticos para todos os nós
 */
function initializeQuantumFields() {
    nodes.forEach(node => {
        const id = node.userData.id;
        const connections = getConceptConnections(id);
        const degree = connections.length;
        
        // Coerência inicial varia com conectividade:
        // - Conceitos mais conectados têm maior coerência (mais "estáveis")
        // - Normalizado entre 0.3 e 1.0
        const maxDegree = Math.max(...nodes.map(n => getConceptConnections(n.userData.id).length), 1);
        const normalizedDegree = degree / maxDegree;
        const initialCoherence = 0.3 + (normalizedDegree * 0.7); // 0.3 a 1.0
        
        quantumFields.set(id, {
            waveFunction: new Array(SUPERPOSITION_STATES).fill(0).map(() => 
                ({ amplitude: Math.random(), phase: Math.random() * Math.PI * 2 })
            ),
            entanglement: new Map(), // Map<nodeId, entanglementStrength>
            coherence: initialCoherence,
            spinState: Math.random() * Math.PI * 2,
            quantumNumber: Math.floor(Math.random() * 10)
        });
    });
    
    // Criar entrelaçamentos baseados em proximidade e relacionalidade
    nodes.forEach(node => {
        const field = quantumFields.get(node.userData.id);
        const connections = getConceptConnections(node.userData.id);
        
        connections.forEach(connId => {
            const connNode = nodes.find(n => n.userData.id === connId);
            if (connNode) {
                const distance = node.position.distanceTo(connNode.position);
                if (distance < ENTANGLEMENT_RANGE) {
                    const strength = 1.0 - (distance / ENTANGLEMENT_RANGE);
                    field.entanglement.set(connId, strength);
                }
            }
        });
    });
}

/**
 * Atualiza entrelaçamentos baseados em proximidade atual
 * Chamado periodicamente para manter entrelaçamentos sincronizados com posições
 */
function updateQuantumEntanglements() {
    nodes.forEach(node => {
        const field = quantumFields.get(node.userData.id);
        if (!field) return;
        
        // Limpar entrelaçamentos antigos
        field.entanglement.clear();
        
        // Recriar baseado em proximidade atual
        const connections = getConceptConnections(node.userData.id);
        connections.forEach(connId => {
            const connNode = nodes.find(n => n.userData.id === connId);
            if (connNode) {
                const distance = node.position.distanceTo(connNode.position);
                if (distance < ENTANGLEMENT_RANGE) {
                    const strength = 1.0 - (distance / ENTANGLEMENT_RANGE);
                    field.entanglement.set(connId, strength);
                }
            }
        });
    });
}

/**
 * Atualiza estados quânticos (superposição, entrelaçamento, decoerência)
 */
function updateQuantumStates(deltaTime) {
    nodes.forEach(node => {
        const field = quantumFields.get(node.userData.id);
        if (!field) return;
        
        // Evolução da função de onda (equação de Schrödinger simplificada)
        field.waveFunction.forEach(state => {
            // Proteção contra NaN: só evolui se amplitude > threshold
            if (state.amplitude > 0.001) {
                state.phase += deltaTime * state.amplitude * 10.0;
            }
            
            // Normalização robusta: manter fase entre 0 e 2π
            if (!isFinite(state.phase)) {
                state.phase = Math.random() * Math.PI * 2;
            } else {
                // Usar operador módulo de forma segura
                const twoPi = Math.PI * 2;
                state.phase = ((state.phase % twoPi) + twoPi) % twoPi;
            }
        });
        
        // Decoerência (perda de coerência quântica ao longo do tempo)
        field.coherence *= (1.0 - DECOHERENCE_RATE * deltaTime);
        
        // Restauração de coerência por entrelaçamento
        // Conceitos fortemente entrelaçados recuperam coerência
        const entanglementCount = field.entanglement.size;
        if (entanglementCount > 0) {
            const avgEntanglementStrength = Array.from(field.entanglement.values())
                .reduce((sum, s) => sum + s, 0) / entanglementCount;
            
            // Restaura coerência proporcionalmente ao entrelaçamento
            const coherenceBoost = avgEntanglementStrength * COHERENCE_RESTORATION_RATE * deltaTime;
            field.coherence += coherenceBoost;
        }
        
        // Limitar coerência entre 0.1 e 1.0
        field.coherence = Math.max(0.1, Math.min(1.0, field.coherence));
        
        // Propagação de entrelaçamento
        field.entanglement.forEach((strength, entangledId) => {
            const entangledField = quantumFields.get(entangledId);
            if (entangledField) {
                // Sincronização de fases (entrelaçamento quântico)
                const phase1 = field.waveFunction[0].phase;
                const phase2 = entangledField.waveFunction[0].phase;
                
                // Proteção contra NaN e normalização
                if (isFinite(phase1) && isFinite(phase2)) {
                    const phaseDiff = phase1 - phase2;
                    field.waveFunction[0].phase -= phaseDiff * strength * 0.1 * deltaTime;
                    
                    // Normalizar após sincronização usando módulo seguro
                    const twoPi = Math.PI * 2;
                    if (isFinite(field.waveFunction[0].phase)) {
                        field.waveFunction[0].phase = ((field.waveFunction[0].phase % twoPi) + twoPi) % twoPi;
                    } else {
                        field.waveFunction[0].phase = Math.random() * twoPi;
                    }
                }
            }
        });
        
        // Tunelamento quântico (mudança probabilística de posição)
        if (Math.random() < QUANTUM_TUNNELING_PROB * deltaTime) {
            const tunnelVector = new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            node.position.add(tunnelVector.multiplyScalar(field.coherence));
        }
    });
}

// ============================================================================
// ANÁLISE TOPOLÓGICA AVANÇADA
// ============================================================================

/**
 * Calcula métricas topológicas complexas (PageRank, Betweenness, Eigenvector Centrality)
 * OTIMIZADO: Cache de adjacências + amostragem + processamento incremental
 */
function computeTopologyMetrics() {
    const N = nodes.length;
    if (N === 0) return;
    
    // Cache de adjacências (construir uma vez)
    const adjacencyCache = new Map<string, Set<string>>();
    nodes.forEach(node => {
        const id = node.userData.id;
        adjacencyCache.set(id, new Set(getConceptConnections(id)));
    });
    
    // PageRank OTIMIZADO (menos iterações, convergência rápida)
    const pageRank = new Map();
    const dampingFactor = 0.85;
    const iterations = 5; // Reduzido de 20 para 5
    const convergenceThreshold = 0.001;
    
    // Inicializar
    nodes.forEach(node => pageRank.set(node.userData.id, 1.0 / N));
    
    // Pré-calcular out-degrees
    const outDegrees = new Map();
    nodes.forEach(node => {
        const id = node.userData.id;
        outDegrees.set(id, adjacencyCache.get(id)?.size || 0);
    });
    
    // Iterar com early stopping
    for (let iter = 0; iter < iterations; iter++) {
        const newRanks = new Map();
        let maxChange = 0;
        
        nodes.forEach(node => {
            const id = node.userData.id;
            let rank = (1 - dampingFactor) / N;
            
            // Contribuições (usando cache de adjacências)
            nodes.forEach(otherNode => {
                const otherId = otherNode.userData.id;
                const otherAdj = adjacencyCache.get(otherId);
                
                if (otherAdj && otherAdj.has(id)) {
                    const outDegree = outDegrees.get(otherId) || 1;
                    rank += dampingFactor * pageRank.get(otherId) / outDegree;
                }
            });
            
            newRanks.set(id, rank);
            const change = Math.abs(rank - (pageRank.get(id) || 0));
            if (change > maxChange) maxChange = change;
        });
        
        newRanks.forEach((rank, id) => pageRank.set(id, rank));
        
        // Early stopping se convergiu
        if (maxChange < convergenceThreshold) break;
    }
    
    // Degree Centrality (muito rápido - já calculado)
    const degree = new Map();
    nodes.forEach(node => {
        const id = node.userData.id;
        degree.set(id, adjacencyCache.get(id)?.size || 0);
    });
    
    // Closeness SIMPLIFICADO (baseado em grau, não distâncias reais)
    // Aproximação: closeness ≈ degree / N (mais conexões = mais próximo de todos)
    const closeness = new Map();
    nodes.forEach(node => {
        const id = node.userData.id;
        const deg = degree.get(id) || 0;
        closeness.set(id, deg > 0 ? deg / N : 0);
    });
    
    // Betweenness AMOSTRADO (apenas 10% dos nós como fonte)
    const betweenness = new Map();
    nodes.forEach(node => betweenness.set(node.userData.id, 0));
    
    const sampleSize = Math.max(10, Math.floor(N * 0.1)); // 10% ou mínimo 10
    const sampledNodes = [];
    for (let i = 0; i < sampleSize; i++) {
        const idx = Math.floor(Math.random() * N);
        sampledNodes.push(nodes[idx]);
    }
    
    sampledNodes.forEach(source => {
        const distances = new Map();
        const paths = new Map();
        const queue = [source.userData.id];
        
        nodes.forEach(n => {
            distances.set(n.userData.id, Infinity);
            paths.set(n.userData.id, 0);
        });
        
        distances.set(source.userData.id, 0);
        paths.set(source.userData.id, 1);
        
        // BFS com cache de adjacências
        while (queue.length > 0) {
            const current = queue.shift();
            const currentDist = distances.get(current);
            const neighbors = adjacencyCache.get(current) || new Set();
            
            neighbors.forEach(neighbor => {
                const newDist = currentDist + 1;
                
                if (newDist < distances.get(neighbor)) {
                    distances.set(neighbor, newDist);
                    paths.set(neighbor, paths.get(current));
                    queue.push(neighbor);
                } else if (newDist === distances.get(neighbor)) {
                    paths.set(neighbor, paths.get(neighbor) + paths.get(current));
                }
            });
        }
        
        // Acumular betweenness (normalizado pela amostragem)
        distances.forEach((dist, nodeId) => {
            if (dist > 0 && dist < Infinity) {
                const normFactor = N / sampleSize; // Ajustar pela amostragem
                betweenness.set(nodeId, betweenness.get(nodeId) + paths.get(nodeId) * normFactor);
            }
        });
    });
    
    // Salvar métricas
    nodes.forEach(node => {
        const id = node.userData.id;
        topologyMetrics.set(id, {
            pageRank: pageRank.get(id) || 0,
            betweenness: betweenness.get(id) || 0,
            closeness: closeness.get(id) || 0,
            eigenvector: (pageRank.get(id) || 0) * 2, // Aproximação: eigenvector ≈ pageRank
            degree: degree.get(id) || 0
        });
    });
    
    // Inicializar dimensões superiores (sempre, independente do modo de visualização)
    initializeHigherDimensions();
    
    globalTopologyVersion++;
}

/**
 * Detecta comunidades usando algoritmo Louvain (simplificado e otimizado)
 */
function detectCommunities() {
    const N = nodes.length;
    if (N === 0) return;
    
    // Cache de adjacências
    const adjacencyCache = new Map<string, Set<string>>();
    nodes.forEach(node => {
        const id = node.userData.id;
        adjacencyCache.set(id, new Set(getConceptConnections(id)));
    });
    
    // Inicializar: cada nó em sua própria comunidade
    nodes.forEach((node, idx) => communityStructure.set(node.userData.id, idx));
    
    // Otimização: limitar iterações e usar early stopping
    let improved = true;
    let iterations = 0;
    const maxIterations = 3; // Reduzido de 10 para 3
    
    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        
        // Processar nós em ordem aleatória (melhor convergência)
        const shuffledNodes = [...nodes].sort(() => Math.random() - 0.5);
        
        shuffledNodes.forEach(node => {
            const id = node.userData.id;
            const currentCommunity = communityStructure.get(id);
            const neighbors = adjacencyCache.get(id) || new Set();
            
            if (neighbors.size === 0) return; // Nó isolado
            
            // Contar conexões para cada comunidade vizinha
            const communityConnections = new Map();
            
            neighbors.forEach(connId => {
                const connCommunity = communityStructure.get(connId);
                if (connCommunity !== undefined) {
                    communityConnections.set(
                        connCommunity,
                        (communityConnections.get(connCommunity) || 0) + 1
                    );
                }
            });
            
            // Encontrar comunidade com mais conexões
            let bestCommunity = currentCommunity;
            let maxConnections = communityConnections.get(currentCommunity) || 0;
            
            communityConnections.forEach((count, community) => {
                if (count > maxConnections) {
                    maxConnections = count;
                    bestCommunity = community;
                }
            });
            
            // Mover para melhor comunidade se ganho significativo (>20%)
            const currentConnections = communityConnections.get(currentCommunity) || 0;
            if (bestCommunity !== currentCommunity && maxConnections > currentConnections * 1.2) {
                communityStructure.set(id, bestCommunity);
                improved = true;
            }
        });
    }
}

/**
 * Calcula fluxo de informação pela rede (OTIMIZADO)
 */
function computeNetworkFlow() {
    // Cache de adjacências para evitar chamadas repetidas
    const adjacencyCache = new Map<string, string[]>();
    nodes.forEach(node => {
        const id = node.userData.id;
        adjacencyCache.set(id, getConceptConnections(id));
    });
    
    nodes.forEach(node => {
        const id = node.userData.id;
        const connections = adjacencyCache.get(id) || [];
        const metrics = topologyMetrics.get(id);
        
        if (!metrics || connections.length === 0) {
            networkFlow.set(id, {
                vector: new THREE.Vector3(0, 0, 0),
                magnitude: 0,
                direction: new THREE.Vector3(0, 0, 0)
            });
            return;
        }
        
        // Vetor de fluxo baseado em PageRank e conexões
        const flowVector = new THREE.Vector3(0, 0, 0);
        const nodePos = node.position;
        
        // Processar apenas primeiros 20 vizinhos (suficiente para direção geral)
        const limitedConnections = connections.slice(0, 20);
        
        limitedConnections.forEach(connId => {
            const connNode = nodes.find(n => n.userData.id === connId);
            if (connNode) {
                const connMetrics = topologyMetrics.get(connId);
                if (!connMetrics) return;
                
                const direction = new THREE.Vector3()
                    .subVectors(connNode.position, nodePos)
                    .normalize();
                
                const flowStrength = connMetrics.pageRank - metrics.pageRank;
                flowVector.add(direction.multiplyScalar(flowStrength));
            }
        });
        
        const magnitude = flowVector.length();
        
        networkFlow.set(id, {
            vector: flowVector,
            magnitude: magnitude,
            direction: magnitude > 0 ? flowVector.clone().normalize() : new THREE.Vector3(0, 0, 0)
        });
    });
}

// ============================================================================
// CAMPOS ADAPTATIVOS E GEOMETRIA NÃO-EUCLIDIANA
// ============================================================================

/**
 * Calcula campos de força adaptativos baseados em densidade local
 */
function computeAdaptiveFields() {
    const gridSize = FIELD_RESOLUTION;
    const cellSize = 600 / gridSize; // Assumindo espaço 600×600×600
    
    nodes.forEach(node => {
        const id = node.userData.id;
        const pos = node.position;
        
        // Densidade local (número de nós próximos)
        let localDensity = 0;
        nodes.forEach(other => {
            if (other.userData.id === id) return;
            const dist = pos.distanceTo(other.position);
            if (dist < cellSize * 2) {
                localDensity += 1.0 / (1.0 + dist / cellSize);
            }
        });
        
        // Curvatura espacial (derivada segunda da densidade)
        const curvature = Math.tanh(localDensity / 5.0) - 0.5;
        
        // Vetor de fluxo combinado: networkFlow + velocidade física
        const networkFlowData = networkFlow.get(id) || { vector: new THREE.Vector3(0, 0, 0) };
        const relativisticData = relativisticEffects.get(id);
        
        // Combinar fluxo topológico com movimento físico real
        const combinedFlow = networkFlowData.vector.clone();
        if (relativisticData && relativisticData.velocity) {
            // Adicionar componente de velocidade física (escalada para visualização)
            combinedFlow.add(relativisticData.velocity.clone().multiplyScalar(0.1));
        }
        
        // Calcular componente radial do fluxo
        const radialDirection = pos.clone().normalize();
        const radialFlow = combinedFlow.dot(radialDirection); // Projeção na direção radial
        
        adaptiveFields.set(id, {
            localDensity: localDensity,
            flowVector: combinedFlow,
            curvature: curvature,
            radialFlow: radialFlow, // Nova propriedade
            tangentialFlow: Math.sqrt(Math.max(0, combinedFlow.lengthSq() - radialFlow * radialFlow)) // Componente tangencial
        });
    });
}

/**
 * Aplica geometria não-euclidiana (curvatura espacial)
 */
function applyNonEuclideanGeometry() {
    nodes.forEach(node => {
        const id = node.userData.id;
        const field = adaptiveFields.get(id);
        
        if (!field) return;
        
        // Curvatura afeta a métrica local
        const pos = node.position;
        const r = pos.length();
        
        if (r > 0.1) {
            // Geometria de esfera com curvatura variável
            const curvatureFactor = 1.0 + field.curvature * CURVATURE_INFLUENCE;
            const targetR = 300 * curvatureFactor; // Raio adaptativo
            
            // Ajustar suavemente para o raio curvo
            const newR = r * 0.99 + targetR * 0.01;
            node.position.normalize().multiplyScalar(newR);
        }
    });
}

// ============================================================================
// SISTEMA DE MEMÓRIA E APRENDIZADO
// ============================================================================

/**
 * Atualiza traços de memória (visitação, caminhos, importância)
 */
function updateMemoryTraces() {
    nodes.forEach(node => {
        const id = node.userData.id;
        
        if (!memoryTraces.has(id)) {
            memoryTraces.set(id, {
                visitFrequency: 0,
                pathHistory: [],
                importance: 0,
                lastVisited: 0
            });
        }
        
        const memory = memoryTraces.get(id);
        
        // Decaimento temporal
        memory.visitFrequency *= MEMORY_DECAY;
        memory.importance *= MEMORY_DECAY;
        
        // Atualizar importância baseada em topologia
        const metrics = topologyMetrics.get(id);
        if (metrics) {
            memory.importance += metrics.pageRank * 0.01;
            memory.importance = Math.min(1.0, memory.importance);
        }
        
        // Se nó está selecionado, incrementar visitação
        if (selectedNode && selectedNode.userData.id === id) {
            memory.visitFrequency += 1.0;
            memory.lastVisited = Date.now();
        }
        
        // Se agente explorador está neste nó, incrementar visitação
        if (explorerAgent.active && explorerAgent.currentNodeId === id) {
            memory.visitFrequency += 0.5; // Menor peso que seleção manual
            memory.lastVisited = Date.now();
            
            // Adicionar ao histórico de caminhos
            if (memory.pathHistory.length === 0 || 
                memory.pathHistory[memory.pathHistory.length - 1] !== id) {
                memory.pathHistory.push(id);
                
                // Limitar tamanho do histórico
                if (memory.pathHistory.length > 50) {
                    memory.pathHistory.shift();
                }
            }
        }
    });
}

/**
 * Atualiza o agente explorador autônomo (random walk com preferência topológica)
 */
function updateExplorerAgent(deltaTime) {
    if (!explorerAgent.active || nodes.length === 0) return;
    
    // Inicializar agente se necessário
    if (!explorerAgent.currentNodeId) {
        // Começar em um nó aleatório (preferência por hubs)
        const sortedNodes = nodes
            .map(n => ({ id: n.userData.id, pageRank: topologyMetrics.get(n.userData.id)?.pageRank || 0 }))
            .sort((a, b) => b.pageRank - a.pageRank);
        
        explorerAgent.currentNodeId = sortedNodes[Math.floor(Math.random() * Math.min(10, sortedNodes.length))].id;
        explorerAgent.visitHistory = [explorerAgent.currentNodeId];
        
        const currentNode = nodes.find(n => n.userData.id === explorerAgent.currentNodeId);
        if (currentNode) {
            explorerAgent.position.copy(currentNode.position);
        }
    }
    
    // Se não tem alvo, escolher próximo nó
    if (!explorerAgent.targetNodeId) {
        const connections = getConceptConnections(explorerAgent.currentNodeId);
        
        if (connections.length > 0) {
            // Random walk com viés topológico (70% aleatório, 30% preferência PageRank)
            if (Math.random() < 0.7) {
                // Escolha aleatória
                explorerAgent.targetNodeId = connections[Math.floor(Math.random() * connections.length)];
            } else {
                // Preferência por nós importantes
                const sortedConnections = connections
                    .map(id => ({ id, pageRank: topologyMetrics.get(id)?.pageRank || 0 }))
                    .sort((a, b) => b.pageRank - a.pageRank);
                
                explorerAgent.targetNodeId = sortedConnections[0].id;
            }
            
            explorerAgent.progress = 0;
        } else {
            // Nó isolado, teleportar para outro nó
            explorerAgent.currentNodeId = null;
            return;
        }
    }
    
    // Interpolar posição entre nó atual e alvo
    const currentNode = nodes.find(n => n.userData.id === explorerAgent.currentNodeId);
    const targetNode = nodes.find(n => n.userData.id === explorerAgent.targetNodeId);
    
    if (currentNode && targetNode) {
        explorerAgent.progress += explorerAgent.speed * (deltaTime / 16.67); // Normalizar para 60 FPS
        
        if (explorerAgent.progress >= 1.0) {
            // Chegou ao destino
            explorerAgent.currentNodeId = explorerAgent.targetNodeId;
            explorerAgent.targetNodeId = null;
            explorerAgent.progress = 0;
            
            // Registrar visita
            explorerAgent.visitHistory.push(explorerAgent.currentNodeId);
            if (explorerAgent.visitHistory.length > explorerAgent.maxHistorySize) {
                explorerAgent.visitHistory.shift();
            }
            
            explorerAgent.position.copy(targetNode.position);
        } else {
            // Interpolar posição
            explorerAgent.position.lerpVectors(
                currentNode.position,
                targetNode.position,
                explorerAgent.progress
            );
        }
    }
}

/**
 * Detecta padrões emergentes na rede
 */
function detectEmergentPatterns() {
    // Analisar caminhos frequentes
    const pathFrequencies = new Map();
    
    memoryTraces.forEach((memory, nodeId) => {
        memory.pathHistory.forEach((path, idx) => {
            if (idx < memory.pathHistory.length - 1) {
                const edge = `${path}-${memory.pathHistory[idx + 1]}`;
                pathFrequencies.set(edge, (pathFrequencies.get(edge) || 0) + 1);
            }
        });
    });
    
    // Identificar padrões fortes
    emergentPatterns.clear();
    pathFrequencies.forEach((frequency, edge) => {
        if (frequency > PATTERN_THRESHOLD * 10) {
            emergentPatterns.set(edge, {
                strength: frequency / 10,
                type: 'frequent-path',
                timestamp: Date.now()
            });
        }
    });
    
    // Detectar ciclos e motifs
    communityStructure.forEach((community, nodeId) => {
        const communityNodes = Array.from(communityStructure.entries())
            .filter(([_, c]) => c === community)
            .map(([id, _]) => id);
        
        if (communityNodes.length >= 3) {
            emergentPatterns.set(`community-${community}`, {
                strength: communityNodes.length / nodes.length,
                type: 'community-cluster',
                members: communityNodes,
                timestamp: Date.now()
            });
        }
    });
}

// ============================================================================
// PROJEÇÕES DIMENSIONAIS AVANÇADAS
// ============================================================================

/**
 * Inicializa coordenadas em dimensões superiores (sempre, independente do modo)
 */
function initializeHigherDimensions() {
    nodes.forEach(node => {
        const id = node.userData.id;
        const metrics = topologyMetrics.get(id);
        
        if (!higherDimensions.has(id)) {
            // 4ª dimensão: PageRank normalizado (-250 a +250)
            const w = ((metrics?.pageRank || 0) * 500) - 250;
            
            // 5ª dimensão: Betweenness normalizado (0 a 100)
            const v = Math.min(100, (metrics?.betweenness || 0) * 0.1);
            
            higherDimensions.set(id, {
                w: w,
                v: v,
                manifold: new THREE.Vector3(0, 0, 0)
            });
        }
    });
}

/**
 * Projeta rede para dimensões superiores (4D, 5D, variedades)
 */
function projectToHigherDimensions() {
    if (dimensionalProjection === '3d') return;
    
    nodes.forEach(node => {
        const id = node.userData.id;
        const metrics = topologyMetrics.get(id);
        
        if (!higherDimensions.has(id)) {
            higherDimensions.set(id, {
                w: 0, // 4ª dimensão
                v: 0, // 5ª dimensão
                manifold: new THREE.Vector3(0, 0, 0)
            });
        }
        
        const higher = higherDimensions.get(id);
        
        // 4D: Dimensão baseada em PageRank
        higher.w = (metrics?.pageRank || 0) * 500 - 250;
        
        // 5D: Dimensão baseada em Betweenness
        higher.v = (metrics?.betweenness || 0) * 0.1;
        
        // Projeção de volta para 3D com influência das dimensões superiores
        if (dimensionalProjection === '4d-hypersphere') {
            // Rotação 4D -> 3D
            const theta = Date.now() * 0.0001;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);
            
            const x = node.userData.originalPosition.x * cos - higher.w * sin;
            const w = node.userData.originalPosition.x * sin + higher.w * cos;
            
            node.position.x = x;
        }
        
        if (dimensionalProjection === '5d-manifold') {
            // Variedade não-linear (torus em 5D)
            const R = 300; // Raio maior
            const r = 100; // Raio menor
            
            const theta = Math.atan2(node.userData.originalPosition.y, node.userData.originalPosition.x);
            const phi = higher.w / 250 * Math.PI;
            const psi = higher.v * Math.PI;
            
            node.position.x = (R + r * Math.cos(phi)) * Math.cos(theta) * Math.cos(psi);
            node.position.y = (R + r * Math.cos(phi)) * Math.sin(theta) * Math.cos(psi);
            node.position.z = r * Math.sin(phi) * Math.sin(psi);
        }
    });
}

// ============================================================================
// FÍSICA RELATIVÍSTICA
// ============================================================================

/**
 * Aplica efeitos relativísticos (dilatação temporal, cone de luz)
 */
function applyRelativisticEffects(deltaTime) {
    // Verificar se modo turbo expirou
    if (turboMode.active && (Date.now() - turboMode.startTime > turboMode.duration)) {
        turboMode.active = false;
        console.log(`🏁 Modo Turbo desativado automaticamente após ${turboMode.duration/1000}s`);
    }
    
    nodes.forEach(node => {
        const id = node.userData.id;
        
        if (!relativisticEffects.has(id)) {
            relativisticEffects.set(id, {
                properTime: 0,
                velocity: new THREE.Vector3(0, 0, 0),
                gamma: 1.0
            });
        }
        
        const effects = relativisticEffects.get(id);
        
        // Calcular velocidade instantânea
        let instantVelocity = new THREE.Vector3(0, 0, 0);
        if (node.userData.lastPosition) {
            instantVelocity.subVectors(node.position, node.userData.lastPosition)
                .divideScalar(Math.max(deltaTime, 0.001)); // Evitar divisão por zero
            
            // MODO TURBO: Suavização adaptativa
            // Normal: α = 0.15 (convergência lenta)
            // Turbo: α = 0.6 (convergência rápida - 4× mais rápido)
            const alpha = turboMode.active ? turboMode.smoothingFactor : 0.15;
            
            effects.velocity.multiplyScalar(1 - alpha).add(instantVelocity.multiplyScalar(alpha));
            
            // LIMITAR VELOCIDADE à velocidade da luz (com margem)
            const maxSpeed = SPEED_OF_LIGHT * 0.99;
            if (effects.velocity.length() > maxSpeed) {
                effects.velocity.normalize().multiplyScalar(maxSpeed);
            }
        }
        node.userData.lastPosition = node.position.clone();
        
        const speed = effects.velocity.length();
        
        // Fator de Lorentz (γ = 1/√(1 - v²/c²))
        const beta = speed / SPEED_OF_LIGHT;
        const betaClamped = Math.min(0.99, beta); // Segurança numérica
        effects.gamma = 1.0 / Math.sqrt(1.0 - betaClamped * betaClamped);
        
        // Dilatação temporal (tempo próprio avança mais lentamente)
        const dilatedDelta = deltaTime / effects.gamma;
        effects.properTime += dilatedDelta * TIME_DILATION_FACTOR;
        
        // Cone de luz (limita propagação de influência)
        const connections = getConceptConnections(id);
        connections.forEach(connId => {
            const connNode = nodes.find(n => n.userData.id === connId);
            if (connNode) {
                const dist = node.position.distanceTo(connNode.position);
                const maxDist = SPEED_OF_LIGHT * effects.properTime;
                
                // Se fora do cone de luz, não há influência causal
                if (dist > maxDist) {
                    lightConeConstraints.set(`${id}-${connId}`, false);
                } else {
                    lightConeConstraints.set(`${id}-${connId}`, true);
                }
            }
        });
    });
}

// ============================================================================
// GRAVITAÇÃO RADIAL HIERÁRQUICA
// ============================================================================

/**
 * Aplica força gravitacional radial baseada em importância topológica
 * Hubs (alto PageRank) DESCEM ao centro da esfera (hierarquia gravitacional)
 * OTIMIZADO: Cálculo preciso de posição com suavização temporal
 */
function applyRadialGravity(deltaTime: number) {
    nodes.forEach(node => {
        const id = node.userData.id;
        const metrics = topologyMetrics.get(id);
        
        if (!metrics) return;
        
        // ===== CÁLCULO DE IMPORTÂNCIA MULTI-FATORIAL =====
        const pageRankNorm = Math.min((metrics.pageRank || 0) * 1000, 1);
        const degreeNorm = Math.min((metrics.degree || 0) / 50, 1);
        const betweennessNorm = Math.min((metrics.betweenness || 0) / 100, 1);
        
        // Ponderação refinada (PageRank 50%, Degree 35%, Betweenness 15%)
        const importance = (pageRankNorm * 0.5) + (degreeNorm * 0.35) + (betweennessNorm * 0.15);
        const clampedImportance = Math.max(0, Math.min(1, importance));
        
        // ===== DISTRIBUIÇÃO INVERTIDA (HUBS AO CENTRO) =====
        // Quanto maior importância, MENOR o raio (mais próximo do centro)
        // expansionFactor vai de 0.0 (importance=1.0, hub) a 1.0 (importance=0.0, periférico)
        const expansionFactor = Math.pow(1.0 - clampedImportance, 1.8);
        
        // ===== RAIO ALVO COM INTERPOLAÇÃO =====
        const radiusRange = MAX_HUB_RADIUS - MIN_HUB_RADIUS;
        const baseTargetRadius = MIN_HUB_RADIUS + (expansionFactor * radiusRange);
        
        // Suavização baseada em conectividade (evita oscilações)
        const connections = getConceptConnections(id);
        const connectivityFactor = Math.min(connections.length / 30, 1);
        const stabilityBonus = connectivityFactor * 5; // Hubs mais estáveis
        const targetRadius = baseTargetRadius + stabilityBonus;
        
        // ===== POSIÇÃO ATUAL EM COORDENADAS ESFÉRICAS =====
        const currentPos = node.position.clone();
        const currentRadius = currentPos.length();
        
        // Inicialização para nós no centro
        if (currentRadius < 0.1) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            node.position.set(
                Math.sin(phi) * Math.cos(theta) * MIN_HUB_RADIUS,
                Math.sin(phi) * Math.sin(theta) * MIN_HUB_RADIUS,
                Math.cos(phi) * MIN_HUB_RADIUS
            );
            node.userData.targetRadius = targetRadius;
            node.userData.importance = clampedImportance;
            return;
        }
        
        // ===== PRESERVAÇÃO ANGULAR PRECISA =====
        const direction = currentPos.clone().normalize();
        
        // ===== CONVERGÊNCIA ADAPTATIVA SUAVIZADA =====
        const radiusDiff = targetRadius - currentRadius;
        
        // ZONA MORTA AMPLIADA: Parar movimento quando muito próximo do alvo
        if (Math.abs(radiusDiff) > 3.0) {
            // ===== CALIBRAÇÃO RELATIVÍSTICA =====
            // Taxa base MUITO REDUZIDA para respeitar c = 10 unidades/s
            // Exemplo: radiusRange = 500, baseRate = 0.0005
            //   → Movimento/frame = 0.5 × 0.0005 = 0.00025 × 500 = 0.125 unidades
            //   → @ 60 FPS: 0.125 / 0.0167s = 7.5 unidades/s (75% c) ✓
            const diffRatio = Math.abs(radiusDiff) / radiusRange;
            const baseRate = 0.0003 + Math.min(diffRatio * 0.002, 0.001);
            
            // Bônus de velocidade para hubs importantes (máx +0.025)
            const escapeBonus = clampedImportance * (ESCAPE_VELOCITY_BONUS * 0.1);
            
            // Penalidade de estabilidade (REDUZIDA para nova escala)
            const stabilityPenalty = connectivityFactor * 0.0002;
            
            // DAMPING FORTE perto do alvo (reduz velocidade em 90% quando diff < 10)
            const proximityDamping = Math.abs(radiusDiff) < 10 ? 0.1 : 1.0;
            
            // Taxa final de convergência (agora sub-relativística)
            const convergenceRate = (baseRate + escapeBonus - stabilityPenalty) * proximityDamping;
            
            // Normalização temporal (60 FPS = deltaTime ~16.67ms)
            const timeNorm = deltaTime / 16.67;
            
            // Novo raio com interpolação suave
            const newRadius = currentRadius + (radiusDiff * convergenceRate * timeNorm);
            
            // Aplicar nova posição preservando direção angular
            node.position.copy(direction.multiplyScalar(newRadius));
        } else {
            // Fixar no raio alvo quando próximo (evita oscilação)
            node.position.copy(direction.multiplyScalar(targetRadius));
        }
        
        // ===== METADADOS PARA VISUALIZAÇÃO E DEBUG =====
        node.userData.targetRadius = targetRadius;
        node.userData.importance = clampedImportance;
        node.userData.radialLayer = getRadialLayer(targetRadius);
        node.userData.isEscaping = targetRadius > SPHERE_RADIUS;
        node.userData.stabilityFactor = connectivityFactor;
    });
}

/**
 * Determina a camada radial de um nó baseado no raio
 * CONTENÇÃO VISUAL: Camadas sutis dentro/próximo da esfera
 */
function getRadialLayer(radius: number): string {
    if (radius < 270) return 'inner'; // Interior (nós periféricos)
    if (radius < 300) return 'middle'; // Meio (nós intermediários)
    if (radius < 330) return 'outer'; // Externo (hubs importantes)
    return 'corona'; // Corona (super-hubs - limite visual)
}

/**
 * Atualiza as posições das arestas para acompanhar os nós em movimento
 * OTIMIZADO: Atualiza apenas os atributos do buffer, sem recriar geometria
 */
function updateEdgePositions() {
    lines.forEach(line => {
        const sourceNode = line.userData.source;
        const targetNode = line.userData.target;
        
        if (sourceNode && targetNode) {
            const sourcePos = sourceNode.position;
            const targetPos = targetNode.position;
            
            // Validar posições
            const isSourceValid = isFinite(sourcePos.x) && isFinite(sourcePos.y) && isFinite(sourcePos.z);
            const isTargetValid = isFinite(targetPos.x) && isFinite(targetPos.y) && isFinite(targetPos.z);
            
            if (isSourceValid && isTargetValid) {
                // Atualizar atributos do buffer diretamente (muito mais rápido)
                const positions = line.geometry.attributes.position;
                if (positions) {
                    positions.array[0] = sourcePos.x;
                    positions.array[1] = sourcePos.y;
                    positions.array[2] = sourcePos.z;
                    positions.array[3] = targetPos.x;
                    positions.array[4] = targetPos.y;
                    positions.array[5] = targetPos.z;
                    positions.needsUpdate = true;
                }
            }
        }
    });
}

// ============================================================================
// ANIMAÇÃO
// ============================================================================

function animate() {
    requestAnimationFrame(animate);
    
    // Atualizar OrbitControls
    if (controls) {
        controls.update();
    }

    if (isAnimating) {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastAnimationTime;
        
        // Limitar FPS a 30 para economizar bateria/recursos
        const targetFPS = 30;
        const minFrameTime = 1000 / targetFPS;
        
        if (deltaTime < minFrameTime) {
            // Pular frame se muito rápido
            return;
        }
        
        const time = currentTime * 0.001 * animationSpeed; // Pre-calcula tempo
        
        // Calcular FPS e auto-ajustar performance
        if (currentTime - lastFPSCheck > 1000) { // A cada segundo
            const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
            fpsHistory.push(fps);
            if (fpsHistory.length > 10) fpsHistory.shift();
            
            const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
            
            // Auto-enable performance mode apenas se FPS < 15 (muito baixo)
            if (avgFPS < 15 && !performanceMode) {
                performanceMode = true;
            }
            
            lastFPSCheck = currentTime;
        }
        
        frameCount++;
        
        // Modo performance: reduzir FPS de animações secundárias
        const skipFrame = performanceMode ? frameCount % 3 === 0 : frameCount % 2 === 0;
        
        // Atualizar movimento dos nós sobre a rede (substituindo rotação da câmera)
        if (!userInteracting) {
            updateNodeMovement(deltaTime);
        }
        
        // ATUALIZAR POSIÇÕES DAS ARESTAS - throttle para reduzir flashing
        // Atualizar a cada 2 frames em vez de todo frame
        if (frameCount % 2 === 0) {
            updateEdgePositions();
        }
        
        // Manter câmera olhando para o centro ou nó selecionado
        if (selectedNode && cameraLookAtTarget) {
            camera.lookAt(cameraLookAtTarget);
        } else {
            camera.lookAt(scene.position);
        }
        
        // ============================================================================
        // ATUALIZAR SISTEMAS AVANÇADOS
        // ============================================================================
        
        // Atualizar entrelaçamentos quânticos a cada 5 segundos (baseado em proximidade)
        if (frameCount % 150 === 0) { // 30 FPS × 5s = 150 frames
            updateQuantumEntanglements();
        }
        
        // Atualizar estados quânticos a cada frame
        updateQuantumStates(deltaTime / 1000);
        
        // Atualizar agente explorador autônomo
        updateExplorerAgent(deltaTime);
        
        // Atualizar memória e aprendizado
        updateMemoryTraces();
        
        // Atualizar efeitos relativísticos
        applyRelativisticEffects(deltaTime / 1000);
        
        // GRAVITAÇÃO RADIAL - Hubs descem ao centro
        applyRadialGravity(deltaTime);
        
        // Atualizar topologia periodicamente (a cada 30 segundos - era 5)
        if (currentTime - lastTopologyUpdate > 30000) {
            // Executar em microtask para não bloquear frame
            setTimeout(() => {
                computeTopologyMetrics();
                detectCommunities();
                computeNetworkFlow();
            }, 0);
            lastTopologyUpdate = currentTime;
        }
        
        // Atualizar campos adaptativos periodicamente (a cada 10 segundos - era 2)
        if (currentTime - lastFieldUpdate > 10000) {
            setTimeout(() => {
                computeAdaptiveFields();
                detectEmergentPatterns();
            }, 0);
            lastFieldUpdate = currentTime;
        }
        
        // Aplicar projeções dimensionais se modo não-euclidiano ativo
        if (dimensionalProjection !== '3d') {
            projectToHigherDimensions();
        }

        // ANIMAÇÕES DESABILITADAS POR PADRÃO PARA PERFORMANCE
        // Ativar pulso automaticamente apenas quando há seleção
        const shouldPulse = selectedNode !== null || selectedCards.size > 0;
        
        if (shouldPulse && skipFrame) {
            const basePulse = Math.sin(time * 0.8) * 0.08; // Mais rápido e mais visível
            const pulse = 1.0 + basePulse; // Varia entre 0.92 e 1.08
            
            // Animar APENAS nós selecionados
            if (selectedNode) {
                selectedNode.scale.setScalar(pulse * 1.05); // Pulso mais visível no selecionado
            }
            
            // Animar todos os nós na seleção múltipla
            if (selectedCards.size > 0) {
                nodes.forEach(n => {
                    if (selectedCards.has(n.userData.id)) {
                        n.scale.setScalar(pulse * 1.05); // Pulso mais visível em todos os selecionados
                    }
                });
            }
            
            // Linhas: animar apenas quando há seleção ativa (DESABILITADO - causa flashes)
            // Manter opacidade estática para evitar flashing
            /*
            if (selectedCards.size === 0 && selectedNode) {
                const lightPulse = Math.sin(time * 2) * 0.15 + 0.85;
                const lineOpacity = (showAllConnections ? 0.6 : 0.4) * lightPulse;
                
                // Animar apenas linhas conectadas ao nó selecionado
                lines.forEach(line => {
                    const isConnected = (line.userData.source === selectedNode || 
                                       line.userData.target === selectedNode);
                    if (isConnected) {
                        line.material.opacity = lineOpacity;
                    }
                });
            }
            */
        } else if (!shouldPulse && skipFrame) {
            // Quando não há seleção, garantir que nós voltem ao normal
            if (selectedNode && selectedNode.scale.x !== (selectedNode.userData.baseScale || 1.0)) {
                selectedNode.scale.setScalar(selectedNode.userData.baseScale || 1.0);
            }
        }
        
        // LOD (Level of Detail) - checar apenas a cada 30 frames (~1 segundo)
        if (frameCount % 30 === 0) {
            const cameraDistance = camera.position.length();
            const shouldShowLabels = cameraDistance < 800;
            if (shouldShowLabels !== labelsVisible) {
                labelsVisible = shouldShowLabels;
                nodes.forEach(node => {
                    if (node.userData.label) {
                        // Respeitar visibilidade do nó (filtros de camada)
                        node.userData.label.visible = labelsVisible && node.visible;
                    }
                });
            }
        }

        // Atualizar linhas (só quando necessário e throttled para evitar flashes)
        // Reduzir frequência para a cada 3 frames
        if ((hoveredNode !== null || selectedNode !== null || showAllConnections || selectedCards.size > 0) && frameCount % 3 === 0) {
            updateLines();
        }
        
        lastAnimationTime = currentTime;
    }

    // Só renderizar se estiver no modo 3D
    if (viewMode === '3d') {
        renderer.render(scene, camera);
    }
}

function updateLines() {
    // Cache de nós ativos para evitar comparações repetidas
    const activeNodes = new Set();
    if (hoveredNode) activeNodes.add(hoveredNode);
    if (selectedNode) activeNodes.add(selectedNode);
    
    // Adicionar nós selecionados (selectedCards)
    selectedCards.forEach(cardId => {
        const node = nodes.find(n => n.userData.id === cardId);
        if (node) activeNodes.add(node);
    });
    
    // Calcular opacidade base baseada no tema e showAllConnections
    const isDark = !isLightTheme();
    // Linhas mais grossas e opacas para melhor visibilidade no modo claro
    const baseOpacity = isDark ? (showAllConnections ? 0.8 : 0.6) : (showAllConnections ? 1.0 : 1.0);
    const activeOpacity = 1.0; // Máxima visibilidade quando ativas
    const activeGlowOpacity = 1.0;
    
    // Verificar se há filtros ativos
    const hasActiveFilters = activeLayerFilters.size > 0;
    
    // Posição da câmera para cálculo de distância (LOD)
    const cameraPos = camera.position;
    
    lines.forEach(line => {
        // ===== LOD: Calcular distância da câmera ao ponto médio da linha =====
        const source = line.userData.source;
        const target = line.userData.target;
        const midPoint = new THREE.Vector3().addVectors(source.position, target.position).multiplyScalar(0.5);
        const distanceToCamera = cameraPos.distanceTo(midPoint);
        
        // Se estiver muito longe, não renderizar (performance)
        if (distanceToCamera > MAX_RENDER_DISTANCE) {
            line.visible = false;
            if (line.userData.label) {
                line.userData.label.visible = false;
            }
            return;
        }
        
        // Calcular fator de fade baseado na distância
        let distanceFade = 1.0;
        if (distanceToCamera > LOD_FADE_START) {
            // Fade linear entre LOD_FADE_START e LOD_FADE_END
            distanceFade = 1.0 - ((distanceToCamera - LOD_FADE_START) / (LOD_FADE_END - LOD_FADE_START));
            distanceFade = Math.max(0, Math.min(1, distanceFade)); // Clamp entre 0 e 1
        }
        
        // Verificar se a linha está visível (respeitando filtros de camada)
        if (!line.visible && activeLayerFilters.size > 0) {
            // Linha filtrada - manter invisível e não modificar opacidade
            if (line.userData.label) {
                line.userData.label.visible = false;
            }
            return;
        }
        
        const isActive = activeNodes.has(line.userData.source) ||
                        activeNodes.has(line.userData.target);

        if (isActive) {
            // Se há filtros ativos, verificar se ambos os nós estão em camadas ativas
            if (hasActiveFilters) {
                const sourceLayer = line.userData.source.userData.layer;
                const targetLayer = line.userData.target.userData.layer;
                const sourceActive = activeLayerFilters.has(sourceLayer);
                const targetActive = activeLayerFilters.has(targetLayer);
                
                if (sourceActive && targetActive) {
                    // Ambos ativos - opacidade total e visível (com LOD)
                    line.visible = true;
                    if (!line.userData.isGlow) {
                        line.material.opacity = activeOpacity * distanceFade;
                    } else {
                        line.material.opacity = activeGlowOpacity * distanceFade;
                    }
                    if (line.userData.label) {
                        line.userData.label.visible = distanceFade > 0.3; // Label só aparece se linha bem visível
                    }
                } else {
                    // Cross-layer - FORÇAR INVISÍVEL completamente
                    line.visible = false;
                    line.material.opacity = 0;
                    if (line.userData.label) {
                        line.userData.label.visible = false;
                    }
                }
            } else {
                // Sem filtros - comportamento normal (com LOD)
                line.visible = true;
                if (!line.userData.isGlow) {
                    line.material.opacity = activeOpacity * distanceFade;
                } else {
                    line.material.opacity = activeGlowOpacity * distanceFade;
                }
                if (line.userData.label) {
                    line.userData.label.visible = distanceFade > 0.3;
                }
            }
        } else {
            // Resetar para opacidade base (com LOD)
            line.visible = distanceFade > 0.1; // Só mostrar se minimamente visível
            line.material.opacity = baseOpacity * distanceFade;
            // Ocultar label da relação
            if (line.userData.label) {
                line.userData.label.visible = false;
            }
        }
    });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Ignorar eventos se não estiver no modo 3D
    if (viewMode !== '3d') return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    performRaycast();
}

function onTouchMove(event) {
    // Ignorar eventos se não estiver no modo 3D
    if (viewMode !== '3d') return;
    
    // Apenas processar hover se houver 1 toque e não estiver arrastando
    if (event.touches.length === 1 && !isDragging) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        performRaycast();
    }
}

function performRaycast() {
    raycaster.setFromCamera(mouse, camera);
    
    // Filtrar apenas nós visíveis para o raycaster
    const visibleNodes = nodes.filter(node => node.visible);
    const intersects = raycaster.intersectObjects(visibleNodes);

    // Reset hover anterior (restaura estado apropriado baseado na iluminação)
    if (hoveredNode && hoveredNode !== selectedNode && !selectedCards.has(hoveredNode.userData.id)) {
        const wasIlluminated = hoveredNode.userData.illuminated;
        const currentOpacity = hoveredNode.material.opacity;
        
        if (wasIlluminated) {
            // Restaurar intensidade baseada no nível de opacidade (profundidade)
            if (currentOpacity >= CONNECTED_OPACITY_L1) {
                // Nível 1 - conexão direta
                hoveredNode.material.emissiveIntensity = 0.5;
                hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.10);
            } else if (currentOpacity >= CONNECTED_OPACITY_L2) {
                // Nível 2 - conexão secundária
                hoveredNode.material.emissiveIntensity = 0.4;
                hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.05);
            } else if (currentOpacity >= CONNECTED_OPACITY_L3) {
                // Nível 3 - conexão terciária
                hoveredNode.material.emissiveIntensity = 0.35;
                hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.02);
            }
            if (hoveredNode.userData.innerLight) {
                hoveredNode.userData.innerLight.intensity = 0.3;
            }
        } else {
            // Não iluminado - voltar ao estado base
            hoveredNode.material.emissiveIntensity = hoveredNode.userData.originalEmissive || 0.2;
            hoveredNode.scale.setScalar(hoveredNode.userData.baseScale || 1);
            if (hoveredNode.userData.innerLight) {
                hoveredNode.userData.innerLight.intensity = 0.1;
            }
        }
    }

    if (intersects.length > 0) {
        hoveredNode = intersects[0].object;
        
        // Verificação adicional: se há filtros ativos, verificar se o nó está numa camada ativa
        if (activeLayerFilters.size > 0 && !activeLayerFilters.has(hoveredNode.userData.layer)) {
            hoveredNode = null;
            renderer.domElement.style.cursor = 'grab';
            return;
        }
        
        // Só aumentar brilho no hover se não for nó selecionado
        if (!selectedCards.has(hoveredNode.userData.id)) {
            const wasIlluminated = hoveredNode.userData.illuminated;
            const currentOpacity = hoveredNode.material.opacity;
            
            // Aplicar hover com intensidade apropriada para o nível de conexão
            if (wasIlluminated) {
                if (currentOpacity >= CONNECTED_OPACITY_L1) {
                    // Nível 1 - hover mais intenso
                    hoveredNode.material.emissiveIntensity = 1.2;
                    hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.25);
                } else if (currentOpacity >= CONNECTED_OPACITY_L2) {
                    // Nível 2 - hover médio
                    hoveredNode.material.emissiveIntensity = 1.0;
                    hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.20);
                } else if (currentOpacity >= CONNECTED_OPACITY_L3) {
                    // Nível 3 - hover suave
                    hoveredNode.material.emissiveIntensity = 0.8;
                    hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.15);
                }
                if (hoveredNode.userData.innerLight) {
                    hoveredNode.userData.innerLight.intensity = 0.8;
                }
            } else {
                // Nó não conectado - hover padrão
                hoveredNode.material.emissiveIntensity = 1.5;
                hoveredNode.scale.setScalar((hoveredNode.userData.baseScale || 1.0) * 1.2);
                if (hoveredNode.userData.innerLight) {
                    hoveredNode.userData.innerLight.intensity = 1.0;
                }
            }
        }
        renderer.domElement.style.cursor = 'pointer';
        
        // Não atualizar info panel no hover - apenas quando selecionado
        // updateInfoPanel(hoveredNode.userData);
    } else {
        hoveredNode = null;
        renderer.domElement.style.cursor = 'grab';
        // Info panel permanece visível se houver nó selecionado
        if (!selectedNode) {
            infoPanel.classList.remove('visible');
        }
    }
}

function onClick(event) {
    // Ignorar eventos se não estiver no modo 3D
    if (viewMode !== '3d') return;
    
    // Ignorar se foi um arrasto (não um clique)
    if (hasDragged) {
        hasDragged = false; // Resetar para próximo clique
        return;
    }
    
    // Ignorar cliques na bottom bar
    const controls = document.getElementById('controls');
    if (controls && controls.contains(event.target)) return;
    
    if (hoveredNode) {
        // Sempre chamar focusOnNode - ele gerencia a seleção múltipla internamente
        focusOnNode(hoveredNode);
    } else {
        // Clicou no vazio - desmarcar tudo
        if (selectedCards.size > 0 || selectedNode) {
            // Resetar todos os nós selecionados
            nodes.forEach(n => {
                n.material.emissiveIntensity = n.userData.originalEmissive || 0.2;
                if (n.userData.innerLight) {
                    n.userData.innerLight.intensity = 0.1;
                }
                n.scale.setScalar(n.userData.baseScale || 1); // Preservar escala de hub
                resetConnectedNodes(n);
            });
            
            selectedNode = null;
            resetConnectionFilter();
            infoPanel.classList.remove('visible');
            
            // Recalcular rotationAngle
            const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
            if (currentRadius > 0) {
                const currentX = camera.position.x / currentRadius;
                const currentZ = camera.position.z / currentRadius;
                rotationAngle = Math.atan2(
                    currentZ * rotationDirection.x - currentX * rotationDirection.z,
                    currentX * rotationDirection.x + currentZ * rotationDirection.z
                );
            }
            
            // Retomar animação e rotação automática
            cameraLookAtTarget = null;
            userInteracting = false;
            autoRotate = true;
            isAnimating = true;
            
            showNotification('Seleção removida');
        }
    }
}

function onKeyDown(event) {
    // H sempre funciona (abrir ajuda), mesmo se estiver digitando na busca
    if (event.code === 'KeyH' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        event.stopPropagation();
        toggleHelp();
        return;
    }
    
    // Ignorar outros comandos se estiver digitando na busca
    if (document.activeElement === searchInput) {
        return;
    }
    
    // Ignorar se Ctrl, Cmd/Meta ou Alt estiverem pressionados (atalhos do sistema)
    if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }
    
    // Espaço: pausar/retomar
    if (event.code === 'Space') {
        event.preventDefault();
        toggleAnimation();
    }
    
    // ESC: Fechar modal de ajuda ou resetar seleção
    if (event.code === 'Escape') {
        event.preventDefault();
        
        // Primeiro verificar se o modal de ajuda está aberto
        const helpModal = document.getElementById('help-modal');
        if (helpModal && helpModal.classList.contains('visible')) {
            // Fechar modal de ajuda
            if (typeof (window as any).closeHelp === 'function') {
                (window as any).closeHelp();
            } else {
                helpModal.classList.remove('visible');
                const container = document.getElementById('container');
                if (container) {
                    container.style.pointerEvents = 'auto';
                }
            }
            return;
        }
        
        // Se modal não está aberto, resetar seleção de nós
        if (selectedCards.size > 0 || selectedNode) {
            // Resetar todos os nós selecionados
            nodes.forEach(n => {
                n.material.emissiveIntensity = n.userData.originalEmissive || 0.2;
                if (n.userData.innerLight) {
                    n.userData.innerLight.intensity = 0.1;
                }
                n.scale.setScalar(n.userData.baseScale || 1); // Preservar escala de hub
                resetConnectedNodes(n);
            });
            
            selectedNode = null;
            resetConnectionFilter();
            infoPanel.classList.remove('visible');
            
            // Recalcular rotationAngle
            const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
            if (currentRadius > 0) {
                const currentX = camera.position.x / currentRadius;
                const currentZ = camera.position.z / currentRadius;
                rotationAngle = Math.atan2(
                    currentZ * rotationDirection.x - currentX * rotationDirection.z,
                    currentX * rotationDirection.x + currentZ * rotationDirection.z
                );
            }
            
            // Retomar rotação automática
            cameraLookAtTarget = null;
            userInteracting = false;
            autoRotate = true;
            
            showNotification('Seleção resetada');
        }
    }
    
    // R: Resetar visão
    if (event.code === 'KeyR') {
        event.preventDefault();
        resetView();
    }
    
    // V: Alternar modo de visualização
    if (event.code === 'KeyV') {
        event.preventDefault();
        toggleViewMode();
    }
    
    // C: Alternar modo de câmera (dentro/fora do caos)
    if (event.code === 'KeyC') {
        event.preventDefault();
        toggleCameraMode();
    }
    
    // L: Toggle de visibilidade da legenda
    if (event.code === 'KeyL') {
        event.preventDefault();
        toggleLegend();
    }
    
    // S: Toggle da superfície esférica
    if (event.code === 'KeyS') {
        event.preventDefault();
        toggleSphere();
    }
    
    // Teclas numéricas 1-9 e 0: Focar em conceitos específicos
    const numKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
    const numpadKeys = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9', 'Numpad0'];
    
    if (numKeys.includes(event.code) || numpadKeys.includes(event.code)) {
        event.preventDefault();
        
        // Extrair o número (1-9, 0 = 10)
        const keyNum = event.code.replace('Digit', '').replace('Numpad', '');
        const index = keyNum === '0' ? 9 : parseInt(keyNum) - 1;
        
        if (index < nodes.length) {
            focusOnNode(nodes[index]);
        } else {
            showNotification(`Conceito ${index + 1} não existe`);
        }
    }
    
    // Tab: Focar no próximo nó conectado
    if (event.code === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        
        if (selectedNode) {
            // Navegar entre nós conectados ao nó atual
            const connections = getConceptConnections(selectedNode.userData.id);
            if (connections.length > 0) {
                // Encontrar próximo nó conectado
                const connectedNodes = connections.map(id => nodes.find(n => n.userData.id === id)).filter(n => n);
                if (connectedNodes.length > 0) {
                    // Ciclar entre os nós conectados
                    const lastFocusedId = selectedNode.userData.lastFocusedConnection || null;
                    let nextNode;
                    
                    if (lastFocusedId) {
                        const lastIndex = connectedNodes.findIndex(n => n.userData.id === lastFocusedId);
                        const nextIndex = (lastIndex + 1) % connectedNodes.length;
                        nextNode = connectedNodes[nextIndex];
                    } else {
                        nextNode = connectedNodes[0];
                    }
                    
                    selectedNode.userData.lastFocusedConnection = nextNode.userData.id;
                    focusOnNode(nextNode);
                }
            }
        } else {
            // Se nenhum nó está selecionado, focar no primeiro
            focusOnNode(nodes[0]);
        }
    }
    
    // Shift+Tab: Focar no nó conectado anterior
    if (event.code === 'Tab' && event.shiftKey) {
        event.preventDefault();
        
        if (selectedNode) {
            // Navegar entre nós conectados ao nó atual (direção reversa)
            const connections = getConceptConnections(selectedNode.userData.id);
            if (connections.length > 0) {
                const connectedNodes = connections.map(id => nodes.find(n => n.userData.id === id)).filter(n => n);
                if (connectedNodes.length > 0) {
                    const lastFocusedId = selectedNode.userData.lastFocusedConnection || null;
                    let prevNode;
                    
                    if (lastFocusedId) {
                        const lastIndex = connectedNodes.findIndex(n => n.userData.id === lastFocusedId);
                        const prevIndex = lastIndex <= 0 ? connectedNodes.length - 1 : lastIndex - 1;
                        prevNode = connectedNodes[prevIndex];
                    } else {
                        prevNode = connectedNodes[connectedNodes.length - 1];
                    }
                    
                    selectedNode.userData.lastFocusedConnection = prevNode.userData.id;
                    focusOnNode(prevNode);
                }
            }
        } else {
            // Se nenhum nó está selecionado, focar no último
            focusOnNode(nodes[nodes.length - 1]);
        }
    }
}

function updateInfoPanel(data) {
    if (!data) {
        infoPanel.classList.remove('visible');
        infoPanel.style.removeProperty('--info-color');
        return;
    }

    document.getElementById('concept-title').textContent = data.name;
    document.getElementById('concept-description').textContent = data.description;
    
    // Definir cor do card baseado na cor do conceito
    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    infoPanel.style.setProperty('--info-color', colorHex);
    
    const connectionsList = document.getElementById('concept-connections');
    
    // Buscar conexões reais das lines (não do JSON que pode estar incompleto)
    const connectedLines = lines.filter(line => 
        line.userData.from === data.id || line.userData.to === data.id
    );
    
    if (connectedLines.length > 0) {
        // Extrair IDs dos conceitos conectados
        const connectedIds = connectedLines.map(line => 
            line.userData.from === data.id ? line.userData.to : line.userData.from
        );
        
        // Criar lista clicável de conexões
        const connectionsHTML = connectedIds
            .map(connId => {
                const connectedConcept = concepts.find(c => c.id === connId);
                if (!connectedConcept) return null;
                
                const relation = relations.find(r => 
                    (r.source === data.id && r.target === connId) ||
                    (r.source === connId && r.target === data.id) ||
                    (r.from === data.id && r.to === connId) ||
                    (r.from === connId && r.to === data.id)
                );
                
                const relationName = relation?.name || '';
                const layer = connectedConcept.layer;
                
                return `
                    <div class="connection-item" data-concept-id="${connId}" style="
                        cursor: pointer;
                        padding: 8px 12px;
                        margin: 4px 0;
                        background: var(--glass-bg);
                        border-radius: 8px;
                        border-left: 3px solid ${colorHex};
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='var(--glass-hover)'; this.style.transform='translateX(4px)'" 
                       onmouseout="this.style.background='var(--glass-bg)'; this.style.transform='translateX(0)'">
                        <div style="font-weight: 600; color: var(--text-primary);">${connectedConcept.name}</div>
                        <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 2px;">
                            ${relationName ? `<span style="color: ${colorHex};">→ ${relationName}</span> • ` : ''}
                            <span style="opacity: 0.7;">${layer}</span>
                        </div>
                    </div>
                `;
            })
            .filter(Boolean)
            .join('');
        
        connectionsList.innerHTML = `
            <strong style="display: block; margin-bottom: 8px; color: var(--text-primary);">
                🔗 Conexões (${connectedIds.length}):
            </strong>
            <div style="max-height: 300px; overflow-y: auto; padding-right: 8px;">
                ${connectionsHTML}
            </div>
        `;
        
        // Adicionar event listeners para navegação
        connectionsList.querySelectorAll('.connection-item').forEach(item => {
            item.addEventListener('click', () => {
                const conceptId = item.getAttribute('data-concept-id');
                const targetNode = nodes.find(n => n.userData.id === conceptId);
                if (targetNode) {
                    focusOnNode(targetNode);
                }
            });
        });
    } else {
        connectionsList.innerHTML = '<span style="color: var(--text-secondary); opacity: 0.7;">Sem conexões</span>';
    }
    
    infoPanel.classList.add('visible');
}

// ============================================================================
// CONTROLES
// ============================================================================

function toggleAnimation() {
    isAnimating = !isAnimating;
    
    // Atualizar todos os botões de pause/play
    const allButtons = document.querySelectorAll('.control-btn');
    
    allButtons.forEach(b => {
        const icon = b.querySelector('.btn-icon');
        const text = b.querySelector('.btn-text');
        
        // Verificar se é o botão de animação pelo ícone
        if (icon && (icon.textContent === '⏸' || icon.textContent === '▶')) {
            icon.textContent = isAnimating ? '⏸' : '▶';
            text.textContent = isAnimating ? 'Pausar' : 'Animar';
            
            if (isAnimating) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        }
    });
    
    showNotification(isAnimating ? 'Animação retomada' : 'Animação pausada');
}

function toggleLabels() {
    labelsVisible = !labelsVisible;
    
    // Atualizar visibilidade de todas as labels de nós
    nodes.forEach(node => {
        if (node.userData.label) {
            node.userData.label.visible = labelsVisible;
        }
    });
    
    // Atualizar visibilidade de todas as labels de linhas
    lines.forEach(line => {
        if (line.userData.label) {
            line.userData.label.visible = labelsVisible;
        }
    });
    
    showNotification(labelsVisible ? 'Labels ativadas' : 'Labels desativadas');
}

function resetView() {
    // Resetar posição da câmera de acordo com o modo atual
    if (cameraMode === 'inside') {
        camera.position.set(0, 0, 0); // Centro do caos
    } else {
        camera.position.set(0, 0, 900); // Fora do caos
    }
    
    camera.lookAt(scene.position);
    cameraLookAtTarget = null;
    autoRotate = true;
    userInteracting = false;
    isAnimating = true;
    animationSpeed = 1.0;
    rotationSpeed = 0.001;
    pulseIntensity = 1.0;
    
    if (selectedNode) {
        // Restaurar estado original completo do nó selecionado
        const originalOpacity = selectedNode.userData.originalOpacity !== undefined 
            ? selectedNode.userData.originalOpacity 
            : BASE_OPACITY;
        selectedNode.material.opacity = originalOpacity;
        
        if (selectedNode.userData.originalColor) {
            selectedNode.material.color.set(selectedNode.userData.originalColor);
        }
        
        if (selectedNode.userData.originalEmissive !== undefined) {
            if (selectedNode.userData.originalColor) {
                selectedNode.material.emissive.set(selectedNode.userData.originalColor);
            }
            selectedNode.material.emissiveIntensity = selectedNode.userData.originalEmissive;
        }
        
        selectedNode.scale.setScalar(selectedNode.userData.baseScale || 1);
        
        // Resetar nós conectados
        resetConnectedNodes(selectedNode);
        selectedNode = null;
    }
    
    // Resetar TODOS os nós para garantir estado limpo
    nodes.forEach(node => {
        const originalOpacity = node.userData.originalOpacity !== undefined 
            ? node.userData.originalOpacity 
            : BASE_OPACITY;
        node.material.opacity = originalOpacity;
        
        if (node.userData.originalColor) {
            node.material.color.set(node.userData.originalColor);
        }
        
        if (node.userData.originalEmissive !== undefined) {
            if (node.userData.originalColor) {
                node.material.emissive.set(node.userData.originalColor);
            }
            node.material.emissiveIntensity = node.userData.originalEmissive;
        }
        
        node.scale.setScalar(node.userData.baseScale || 1.0);
        node.userData.illuminated = false;
    });
    
    // Limpar seleção de cards e resetar filtros
    selectedCards.clear();
    resetConnectionFilter();
    updateLegendCounts(); // Atualizar contagens após resetar filtros
    
    infoPanel.classList.remove('visible');
    
    // Esconder status-indicator ao resetar
    if (statusIndicator) {
        statusIndicator.style.opacity = '0';
    }
    
    showNotification('Visão resetada');
}

function updateStatusIndicator() {
    if (!speedValue || !rotationValue || !pulseValue) return;
    
    speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    rotationValue.textContent = (rotationSpeed * 10000).toFixed(1);
    pulseValue.textContent = (pulseIntensity * 100).toFixed(0) + '%';
    
    // Mostrar indicador temporariamente
    statusIndicator.style.opacity = '1';
    
    setTimeout(() => {
        statusIndicator.style.opacity = '0';
    }, 3000);
}

// Propagar seleção para nós conectados em múltiplos níveis (usando opacidade)
function propagateLightToConnected(sourceNode, allowedIds = null) {
    const processedIds = new Set([sourceNode.userData.id]);
    const level1Ids = new Set();
    const level2Ids = new Set();
    
    // O riz∅ma propaga-se através de opacidade - vidro tornando-se sólido
    // A estrutura relacional transcende polaridades
    
    // Nível 1: Conexões diretas - muito opacas
    const connectedIds = getConceptConnections(sourceNode.userData.id);
    connectedIds.forEach(connId => {
        if (allowedIds && !allowedIds.has(connId)) return;
        
        const connectedNode = nodes.find(n => n.userData.id === connId);
        if (connectedNode && connectedNode !== selectedNode && !selectedCards.has(connId)) {
            level1Ids.add(connId);
            processedIds.add(connId);
            
            // Tornar mais opaco (menos vidro, mais sólido)
            connectedNode.material.opacity = CONNECTED_OPACITY_L1;
            connectedNode.scale.setScalar((connectedNode.userData.baseScale || 1.0) * 1.10);
            connectedNode.userData.illuminated = true;
        }
    });
    
    // Nível 2: Conexões secundárias - opacidade intermediária
    level1Ids.forEach(level1Id => {
        const level1Node = nodes.find(n => n.userData.id === level1Id);
        if (!level1Node) return;
        
        const secondaryIds = getConceptConnections(level1Node.userData.id);
        secondaryIds.forEach(secondId => {
            if (processedIds.has(secondId)) return;
            if (allowedIds && !allowedIds.has(secondId)) return;
            
            const secondaryNode = nodes.find(n => n.userData.id === secondId);
            if (secondaryNode && secondaryNode !== selectedNode && !selectedCards.has(secondId)) {
                level2Ids.add(secondId);
                processedIds.add(secondId);
                
                secondaryNode.material.opacity = CONNECTED_OPACITY_L2;
                secondaryNode.scale.setScalar((secondaryNode.userData.baseScale || 1.0) * 1.05);
                secondaryNode.userData.illuminated = true;
            }
        });
    });
    
    // Nível 3: Conexões terciárias - levemente mais opaco que a base
    level2Ids.forEach(level2Id => {
        const level2Node = nodes.find(n => n.userData.id === level2Id);
        if (!level2Node) return;
        
        const tertiaryIds = getConceptConnections(level2Node.userData.id);
        tertiaryIds.forEach(thirdId => {
            if (processedIds.has(thirdId)) return;
            if (allowedIds && !allowedIds.has(thirdId)) return;
            
            const tertiaryNode = nodes.find(n => n.userData.id === thirdId);
            if (tertiaryNode && tertiaryNode !== selectedNode && !selectedCards.has(thirdId)) {
                processedIds.add(thirdId);
                
                tertiaryNode.material.opacity = CONNECTED_OPACITY_L3;
                tertiaryNode.scale.setScalar((tertiaryNode.userData.baseScale || 1.0) * 1.02);
                tertiaryNode.userData.illuminated = true;
            }
        });
    });
}

// Resetar nós conectados ao estado normal
function resetConnectedNodes(sourceNode) {
    // O riz∅ma retorna ao estado de vidro semi-transparente
    
    // Resetar todos os nós para estado base (restaurar cores e propriedades originais)
    nodes.forEach(node => {
        if (node !== selectedNode && node !== hoveredNode) {
            // Restaurar opacidade original (hubs têm opacidade diferente de nós comuns)
            const originalOpacity = node.userData.originalOpacity !== undefined 
                ? node.userData.originalOpacity 
                : BASE_OPACITY;
            node.material.opacity = originalOpacity;
            
            // Restaurar cor original
            if (node.userData.originalColor) {
                node.material.color.set(node.userData.originalColor);
            }
            
            // Restaurar emissividade original
            if (node.userData.originalEmissive !== undefined) {
                if (node.userData.originalColor) {
                    node.material.emissive.set(node.userData.originalColor);
                }
                node.material.emissiveIntensity = node.userData.originalEmissive;
            }
            
            // Restaurar escala base preservando hierarquia de hub
            node.scale.setScalar(node.userData.baseScale || 1.0);
            node.userData.illuminated = false;
        }
    });
}

function focusOnNode(node) {
    if (!node) return;
    
    // Salvar ângulo atual antes de pausar rotação
    const currentRadius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
    if (currentRadius > 0) {
        // Calcular o ângulo atual baseado na posição da câmera e direção de rotação
        const currentX = camera.position.x / currentRadius;
        const currentZ = camera.position.z / currentRadius;
        rotationAngle = Math.atan2(
            currentZ * rotationDirection.x - currentX * rotationDirection.z,
            currentX * rotationDirection.x + currentZ * rotationDirection.z
        );
    }
    
    // Pausar animação e auto-rotação durante foco
    userInteracting = true;
    autoRotate = false;
    isAnimating = false;
    
    // Calcular posição ideal da câmera (frente ao nó, olhando para o centro)
    // O nó deve ficar no centro da tela
    const nodeWorldPosition = node.position.clone();
    
    // Vetor do centro (0,0,0) até o nó
    const directionFromCenter = nodeWorldPosition.clone().normalize();
    
    // Posicionar câmera no lado oposto do nó em relação ao centro
    // Isso faz o grafo "girar" para trazer o nó ao centro da visão
    const cameraDistance = 400; // Distância da câmera ao nó
    const targetCameraPosition = nodeWorldPosition.clone().add(
        directionFromCenter.multiplyScalar(cameraDistance)
    );
    
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0);
    const targetLookAt = nodeWorldPosition.clone();
    
    const duration = 1500; // ms - animação mais suave
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic para movimento mais suave
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // Interpolar posição da câmera
        camera.position.lerpVectors(startPosition, targetCameraPosition, eased);
        
        // Interpolar ponto de observação (do centro para o nó)
        const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, targetLookAt, eased);
        camera.lookAt(currentLookAt);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            // Animação completa - manter userInteracting = true para bloquear rotação
            // Salvar o ponto de foco da câmera
            cameraLookAtTarget = nodeWorldPosition.clone();
            
            // Verificar se o nó já está selecionado (múltipla seleção)
            const nodeId = node.userData.id;
            
            if (selectedCards.has(nodeId)) {
                // Desmarcar este nó
                selectedCards.delete(nodeId);
                node.material.emissiveIntensity = node.userData.originalEmissive || 0.2;
                if (node.userData.innerLight) {
                    node.userData.innerLight.intensity = 0.1;
                }
                node.scale.setScalar(node.userData.baseScale || 1); // Preservar escala de hub
                
                // Se não há mais nós selecionados, resetar tudo
                if (selectedCards.size === 0) {
                    selectedNode = null;
                    resetConnectionFilter();
                    userInteracting = false;
                    autoRotate = true;
                    isAnimating = true;
                    showNotification('Seleção removida - mostrando todos os nós');
                    return;
                }
                
                // Recalcular filtro com nós restantes
                const allConnectedIds = new Set();
                selectedCards.forEach(id => {
                    const concept = concepts.find(c => c.id === id);
                    if (concept) {
                        allConnectedIds.add(id);
                        getConceptConnections(concept.id).forEach(connId => allConnectedIds.add(connId));
                    }
                });
                
                // Aplicar filtro de opacidade
                nodes.forEach(n => {
                    if (allConnectedIds.has(n.userData.id)) {
                        n.material.opacity = 1.0;
                        if (n.userData.label) n.userData.label.material.opacity = 0.9;
                        
                        // Destacar nós ainda selecionados - totalmente opacos
                        if (selectedCards.has(n.userData.id)) {
                            n.material.opacity = SELECTED_OPACITY; // Sólido
                            n.scale.setScalar((n.userData.baseScale || 1.0) * 1.3);
                        }
                    } else {
                        n.material.opacity = DIMMED_OPACITY; // Muito transparente
                        if (n.userData.label) n.userData.label.material.opacity = 0.05;
                    }
                });
                
                // Atualizar linhas com destaque para conexões dos nós selecionados
                const isDark = !isLightTheme();
                lines.forEach(line => {
                    const sourceId = line.userData.source.userData.id;
                    const targetId = line.userData.target.userData.id;
                    if (allConnectedIds.has(sourceId) && allConnectedIds.has(targetId)) {
                        line.visible = true;
                        
                        // Destacar linhas conectadas a nós selecionados
                        const sourceSelected = selectedCards.has(sourceId);
                        const targetSelected = selectedCards.has(targetId);
                        
                        if (sourceSelected && targetSelected) {
                            // Ambos os nós selecionados - criar gradiente!
                            const sourceColor = line.userData.source.userData.originalColor;
                            const targetColor = line.userData.target.userData.originalColor;
                            updateLineGradient(line, sourceColor, targetColor);
                            line.material.opacity = 1.0; // Máxima visibilidade
                        } else if (sourceSelected || targetSelected) {
                            // Apenas um selecionado - usar cor única
                            const selectedColor = sourceSelected ? 
                                line.userData.source.userData.originalColor : 
                                line.userData.target.userData.originalColor;
                            resetLineColor(line, selectedColor);
                            line.material.opacity = 1.0; // Máxima visibilidade
                        } else {
                            // Nenhum selecionado - cor original com menor opacidade
                            resetLineColor(line, line.userData.originalColor);
                            const secondaryOpacity = isDark ? 0.5 : 0.85;
                            line.material.opacity = secondaryOpacity;
                        }
                    } else {
                        line.visible = false;
                    }
                });
                
                showNotification(`${selectedCards.size} nó(s) selecionado(s) - ${allConnectedIds.size} visíveis`);
                return;
            }
            
            // Adicionar nó à seleção múltipla
            selectedCards.add(nodeId);
            
            // Desselecionar nó anterior se não estiver na seleção múltipla
            if (selectedNode && !selectedCards.has(selectedNode.userData.id)) {
                selectedNode.material.opacity = BASE_OPACITY; // Voltar para vidro
                selectedNode.scale.setScalar(selectedNode.userData.baseScale || 1); // Preservar escala de hub
            }
            
            selectedNode = node;
            // Nó selecionado fica totalmente opaco (sólido)
            selectedNode.material.opacity = SELECTED_OPACITY;
            selectedNode.scale.setScalar((selectedNode.userData.baseScale || 1.0) * 1.3);
            
            // Calcular união de conexões de todos os nós selecionados
            const allConnectedIds = new Set();
            selectedCards.forEach(id => {
                const concept = concepts.find(c => c.id === id);
                if (concept) {
                    allConnectedIds.add(id);
                    getConceptConnections(concept.id).forEach(connId => allConnectedIds.add(connId));
                }
            });
            
            // Aplicar filtro de opacidade baseado na união
            nodes.forEach(n => {
                if (allConnectedIds.has(n.userData.id)) {
                    n.material.opacity = 1.0;
                    if (n.userData.label) n.userData.label.material.opacity = 0.9;
                    
                    // Destacar nós selecionados - totalmente opacos
                    if (selectedCards.has(n.userData.id)) {
                        n.material.opacity = SELECTED_OPACITY; // Sólido
                        n.scale.setScalar((n.userData.baseScale || 1.0) * 1.3);
                        propagateLightToConnected(n, allConnectedIds);
                    }
                } else {
                    n.material.opacity = DIMMED_OPACITY; // Muito transparente
                    if (n.userData.label) n.userData.label.material.opacity = 0.05;
                }
            });
            
            // Atualizar linhas com destaque especial para conexões diretas dos nós selecionados
            const isDark = !isLightTheme();
            lines.forEach(line => {
                const sourceId = line.userData.source.userData.id;
                const targetId = line.userData.target.userData.id;
                
                // Verificar se a linha conecta nós visíveis
                if (allConnectedIds.has(sourceId) && allConnectedIds.has(targetId)) {
                    line.visible = true;
                    
                    // Destacar linhas que conectam diretamente nós selecionados
                    const sourceSelected = selectedCards.has(sourceId);
                    const targetSelected = selectedCards.has(targetId);
                    
                    if (sourceSelected && targetSelected) {
                        // Ambos os nós selecionados - criar gradiente!
                        const sourceColor = line.userData.source.userData.originalColor;
                        const targetColor = line.userData.target.userData.originalColor;
                        updateLineGradient(line, sourceColor, targetColor);
                        line.material.opacity = 1.0; // Máxima visibilidade
                    } else if (sourceSelected || targetSelected) {
                        // Apenas um selecionado - usar cor única
                        const selectedColor = sourceSelected ? 
                            line.userData.source.userData.originalColor : 
                            line.userData.target.userData.originalColor;
                        resetLineColor(line, selectedColor);
                        line.material.opacity = 1.0; // Máxima visibilidade
                    } else {
                        // Nenhum selecionado - cor original com menor opacidade
                        resetLineColor(line, line.userData.originalColor);
                        const secondaryOpacity = isDark ? 0.5 : 0.85;
                        line.material.opacity = secondaryOpacity;
                    }
                } else {
                    line.visible = false;
                }
            });
            
            updateInfoPanel(node.userData);
            showNotification(`${selectedCards.size} nó(s) selecionado(s) - ${allConnectedIds.size} visíveis`);
        }
    }
    
    animateCamera();
}

function showNotification(message) {
    // Criar elemento de notificação se não existir
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            color: var(--connection);
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s, background-color 0.3s, color 0.3s, border-color 0.3s;
            pointer-events: none;
            border: 1px solid var(--connection);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(notification);
        
        // Adicionar estilos para tema claro
        const style = document.createElement('style');
        style.textContent = `
            body.light-theme #notification {
                background: var(--glass-bg) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 2000);
}

/**
 * Filter nodes and cards by connections to selected node
 * In 3D mode: reduce opacity of unconnected nodes
 * In cards mode: filter to show only connected concepts
 */
function filterByConnections(node) {
    if (!node) return;
    
    const selectedId = node.userData.id;
    const connections = getConceptConnections(node.userData.id);
    
    // Create set of connected IDs (including the selected node itself)
    const connectedIds = new Set([selectedId, ...connections]);
    
    // Save active filter
    activeConnectionFilter = node;
    
    if (viewMode === '3d') {
        // 3D mode: reduce opacity of unconnected nodes
        nodes.forEach(n => {
            if (connectedIds.has(n.userData.id)) {
                // Connected nodes: full opacity
                n.material.opacity = 1.0;
                if (n.userData.label) {
                    n.userData.label.material.opacity = 0.9;
                }
            } else {
                // Unconnected nodes: reduced opacity para melhor contraste
                n.material.opacity = 0.08;
                if (n.userData.label) {
                    n.userData.label.material.opacity = 0.05;
                }
            }
        });
        
        // Filter lines: show only connections involving connected nodes
        const isDark = !isLightTheme();
        lines.forEach(line => {
            const sourceId = line.userData.source.userData.id;
            const targetId = line.userData.target.userData.id;
            
            if (connectedIds.has(sourceId) && connectedIds.has(targetId)) {
                // Both nodes are in the connected set
                line.visible = true;
                // Modo claro: maior opacidade
                const lineOpacity = isDark ? (line.userData.isGlow ? 0.6 : 0.8) : (line.userData.isGlow ? 0.9 : 1.0);
                line.material.opacity = lineOpacity;
            } else {
                // At least one node is not connected
                line.visible = false;
            }
        });
        
        showNotification(`Filtrando por: ${node.userData.name} (${connectedIds.size} conceitos relacionados)`);
    } else if (viewMode === 'cards') {
        // Cards mode: filter cards to show only connected concepts
        const filteredConcepts = concepts.filter(c => connectedIds.has(c.id));
        renderCards(null, filteredConcepts);
    }
}

/**
 * Reset connection filter
 */
function resetConnectionFilter() {
    // Clear active filter and selected cards
    activeConnectionFilter = null;
    selectedCards.clear();
    
    // Reset all nodes to full opacity and visibility
    nodes.forEach(node => {
        node.visible = true;
        node.material.opacity = 1.0;
        if (node.userData.label) {
            node.userData.label.visible = true;
            node.userData.label.material.opacity = 0.9;
        }
    });
    
    // Reset all lines to visible and remove any gradient effects
    const isDark = !isLightTheme();
    lines.forEach(line => {
        line.visible = true;
        
        // Resetar geometria e cor usando a função apropriada
        if (line.userData.originalColor) {
            resetLineColor(line, line.userData.originalColor);
        }
        
        // Modo claro: maior opacidade
        const lineOpacity = isDark ? (line.userData.isGlow ? 0.6 : 0.8) : (line.userData.isGlow ? 0.9 : 1.0);
        line.material.opacity = lineOpacity;
    });
    
    // Reset cards if in cards mode
    if (viewMode === 'cards') {
        const layerFilter = activeLayerFilters.size > 0 ? Array.from(activeLayerFilters) : null;
        renderCards(layerFilter);
    }
}

function toggleLegend() {
    const legend = document.getElementById('legend');
    const toggle = document.getElementById('legend-toggle');
    
    if (!legend) return;
    
    const icon = toggle?.querySelector('.btn-icon');
    
    if (legend.classList.contains('hidden')) {
        legend.classList.remove('hidden');
        if (icon) icon.textContent = '✕';
    } else {
        legend.classList.add('hidden');
        if (icon) icon.textContent = '◫';
    }
}

// Filtro de camada ativo (suporta múltiplas camadas)
let activeLayerFilters = new Set();
let activeConnectionFilter = null;

function setupLegendListeners() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const layer = item.dataset.layer;
            
            // Toggle filter (permite múltiplas seleções)
            if (activeLayerFilters.has(layer)) {
                // Remover da seleção
                activeLayerFilters.delete(layer);
                item.classList.remove('active');
            } else {
                // Adicionar à seleção
                activeLayerFilters.add(layer);
                item.classList.add('active');
            }
            
            // Aplicar filtros
            if (activeLayerFilters.size === 0) {
                // Sem filtros - mostrar tudo
                legendItems.forEach(i => {
                    i.style.opacity = '1';
                    i.classList.remove('active');
                });
                
                // Restaurar opacidade e visibilidade de todos os nós
                nodes.forEach(node => {
                    node.visible = true;
                    node.material.opacity = BASE_OPACITY;
                    if (node.userData.label) {
                        node.userData.label.visible = true;
                        node.userData.label.material.opacity = 0.9;
                    }
                });
                
                // Restaurar todas as linhas
                lines.forEach(line => {
                    line.visible = true;
                });
                
                // Atualizar contagens
                updateLegendCounts();
                
                // Re-renderizar cards sem filtro
                if (viewMode === 'cards') {
                    renderCards(null);
                }
                
                showNotification('Filtros removidos');
            } else {
                // Com filtros ativos
                
                // Destacar itens selecionados
                legendItems.forEach(i => {
                    if (activeLayerFilters.has(i.dataset.layer)) {
                        i.style.opacity = '1';
                    } else {
                        i.style.opacity = '0.4';
                    }
                });
                
                // Filtrar nós
                nodes.forEach(node => {
                    if (activeLayerFilters.has(node.userData.layer)) {
                        // Nó pertence a uma camada ativa - mostrar
                        node.visible = true;
                        node.material.opacity = SELECTED_OPACITY;
                        if (node.userData.label) {
                            node.userData.label.visible = true;
                            node.userData.label.material.opacity = 0.9;
                        }
                    } else {
                        // Nó não pertence a camadas ativas - esconder
                        node.visible = false;
                        if (node.userData.label) {
                            node.userData.label.visible = false;
                        }
                    }
                });
                
                // Filtrar linhas
                const isDark = !isLightTheme();
                lines.forEach(line => {
                    const sourceLayer = line.userData.source.userData.layer;
                    const targetLayer = line.userData.target.userData.layer;
                    
                    const sourceActive = activeLayerFilters.has(sourceLayer);
                    const targetActive = activeLayerFilters.has(targetLayer);
                    
                    if (sourceActive && targetActive) {
                        // Ambos os nós estão nas camadas ativas
                        line.visible = true;
                        const layerOpacity = isDark ? (line.userData.isGlow ? 0.6 : 0.8) : (line.userData.isGlow ? 0.9 : 1.0);
                        line.material.opacity = layerOpacity;
                    } else if (sourceActive || targetActive) {
                        // Apenas um nó está nas camadas ativas - FORÇAR INVISÍVEL
                        line.visible = false;
                        line.material.opacity = 0;
                    } else {
                        // Nenhum nó está nas camadas ativas
                        line.visible = false;
                    }
                });
                
                // Re-renderizar cards com filtro (passar array de camadas)
                if (viewMode === 'cards') {
                    renderCards(Array.from(activeLayerFilters));
                }
                
                // Atualizar contagens
                updateLegendCounts();
                
                // Contar conceitos nas camadas selecionadas
                const count = nodes.filter(n => activeLayerFilters.has(n.userData.layer)).length;
                const layerNames: Record<string, string> = {
                    // Camadas base
                    'fundacional': 'Fundacional',
                    'ontologica': 'Ontológica',
                    'epistemica': 'Epistêmica',
                    'politica': 'Política',
                    'pratica': 'Prática',
                    'ecologica': 'Ecológica',
                    'temporal': 'Temporal',
                    'etica': 'Ética',
                    
                    // Subcamadas ontologica
                    'ontologica-0': 'Ontológica · Mista',
                    'ontologica-1': 'Ontológica · Prática',
                    'ontologica-2': 'Ontológica · Relacional',
                    'ontologica-3': 'Ontológica · Geral',
                    
                    // Subcamadas politica
                    'politica-0': 'Política · Mista',
                    'politica-1': 'Política · Prática',
                    'politica-2': 'Política · Teórica',
                    'politica-3': 'Política · Processual',
                    
                    // Subcamadas pratica
                    'pratica-0': 'Prática · Mista',
                    'pratica-1': 'Prática · Aplicada',
                    'pratica-2': 'Prática · Geral',
                    'pratica-3': 'Prática · Relacional',
                    
                    // Subcamadas fundacional
                    'fundacional-0': 'Fundacional · Mista',
                    'fundacional-1': 'Fundacional · Relacional',
                    'fundacional-2': 'Fundacional · Prática',
                    'fundacional-3': 'Fundacional · Geral'
                };
                
                if (activeLayerFilters.size === 1) {
                    const layer = Array.from(activeLayerFilters)[0];
                    showNotification(`Camada: ${layerNames[layer] || layer} (${count} conceitos)`);
                } else {
                    const selectedNames = Array.from(activeLayerFilters).map(l => layerNames[l] || l).join(', ');
                    showNotification(`${activeLayerFilters.size} camadas selecionadas (${count} conceitos)`);
                }
            }
        });
    });
    
    // Adicionar listeners para os cabeçalhos dos grupos
    const groupHeaders = document.querySelectorAll('.layer-group-header');
    groupHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const target = e.target as HTMLElement;
            
            // Extrair camada base do grupo
            const layerGroup = header.closest('.layer-group');
            if (!layerGroup) return;
            
            const sublayers = layerGroup.querySelectorAll('.legend-item.sublayer');
            if (sublayers.length === 0) return;
            
            const firstLayer = sublayers[0].getAttribute('data-layer');
            if (!firstLayer) return;
            
            const baseLayer = firstLayer.split('-')[0];
            
            // Se clicou no toggle (seta), apenas expandir/colapsar
            if (target.classList.contains('layer-group-toggle')) {
                layerGroup.classList.toggle('collapsed');
                const toggle = header.querySelector('.layer-group-toggle');
                if (toggle) {
                    toggle.textContent = layerGroup.classList.contains('collapsed') ? '▶' : '▼';
                }
                return;
            }
            
            // Clicou no header - filtrar todas as subcamadas do grupo
            const sublayerItems = Array.from(sublayers);
            const sublayerNames = sublayerItems
                .map(item => item.getAttribute('data-layer'))
                .filter(Boolean) as string[];
            
            // Verificar se todas as subcamadas estão ativas
            const allActive = sublayerNames.every(layer => activeLayerFilters.has(layer));
            
            if (allActive) {
                // Desativar todas
                sublayerNames.forEach(layer => activeLayerFilters.delete(layer));
                sublayerItems.forEach(item => item.classList.remove('active'));
            } else {
                // Ativar todas
                sublayerNames.forEach(layer => activeLayerFilters.add(layer));
                sublayerItems.forEach(item => item.classList.add('active'));
            }
            
            // Aplicar filtros
            applyLayerFilters();
        });
    });
}

// Função auxiliar para aplicar filtros de camadas
function applyLayerFilters() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    if (activeLayerFilters.size === 0) {
        // Sem filtros - mostrar tudo
        legendItems.forEach(i => {
            i.style.opacity = '1';
            i.classList.remove('active');
        });
        
        nodes.forEach(node => {
            node.visible = true;
            node.material.opacity = BASE_OPACITY;
            if (node.userData.label) {
                node.userData.label.visible = true;
                node.userData.label.material.opacity = 0.9;
            }
        });
        
        lines.forEach(line => {
            line.visible = true;
        });
        
        updateLegendCounts();
        
        if (viewMode === 'cards') {
            renderCards(null);
        }
        
        showNotification('Filtros removidos');
        return;
    }
    
    // Com filtros ativos
    legendItems.forEach(i => {
        if (activeLayerFilters.has(i.dataset.layer || '')) {
            i.style.opacity = '1';
        } else {
            i.style.opacity = '0.3';
        }
    });
    
    // Filtrar nós e linhas
    const visibleNodeIds = new Set<number>();
    
    nodes.forEach(node => {
        if (activeLayerFilters.has(node.userData.layer)) {
            node.visible = true;
            node.material.opacity = BASE_OPACITY;
            if (node.userData.label) {
                node.userData.label.visible = true;
                node.userData.label.material.opacity = 0.9;
            }
            visibleNodeIds.add(node.userData.id);
        } else {
            node.visible = false;
            if (node.userData.label) {
                node.userData.label.visible = false;
            }
        }
    });
    
    // Filtrar linhas com opacidade graduada
    const isDark = !isLightTheme();
    lines.forEach(line => {
        const sourceLayer = line.userData.source.userData.layer;
        const targetLayer = line.userData.target.userData.layer;
        
        const sourceActive = activeLayerFilters.has(sourceLayer);
        const targetActive = activeLayerFilters.has(targetLayer);
        
        if (sourceActive && targetActive) {
            // Ambos os nós estão nas camadas ativas
            line.visible = true;
            const layerOpacity = isDark ? (line.userData.isGlow ? 0.6 : 0.8) : (line.userData.isGlow ? 0.9 : 1.0);
            line.material.opacity = layerOpacity;
        } else if (sourceActive || targetActive) {
            // Apenas um nó está nas camadas ativas - FORÇAR INVISÍVEL
            line.visible = false;
            line.material.opacity = 0;
        } else {
            // Nenhum nó está nas camadas ativas
            line.visible = false;
        }
    });
    
    updateLegendCounts();
    
    // Atualizar estado visual dos grupos
    const layerGroups = document.querySelectorAll('.layer-group');
    layerGroups.forEach(group => {
        const sublayers = group.querySelectorAll('.legend-item.sublayer');
        const sublayerNames = Array.from(sublayers)
            .map(item => item.getAttribute('data-layer'))
            .filter(Boolean) as string[];
        
        const allActive = sublayerNames.every(layer => activeLayerFilters.has(layer));
        if (allActive && sublayerNames.length > 0) {
            group.classList.add('group-active');
        } else {
            group.classList.remove('group-active');
        }
    });
    
    if (viewMode === 'cards') {
        const filteredConcepts = concepts.filter(c => activeLayerFilters.has(c.layer));
        renderCards(filteredConcepts);
    }
    
    const count = visibleNodeIds.size;
    showNotification(`Filtro aplicado: ${count} conceitos visíveis`);
}

// Atualizar contagens da legenda dinamicamente
function updateLegendCounts() {
    const legendItems = document.querySelectorAll('.legend-item');
    const groupTotals: Record<string, number> = {};
    
    legendItems.forEach(item => {
        const layer = item.dataset.layer;
        const countElement = item.querySelector('.legend-count');
        
        if (!countElement || !layer) return;
        
        let count = 0;
        
        if (activeLayerFilters.size === 0) {
            // Sem filtros: contar todos os nós da camada
            count = nodes.filter(n => n.userData.layer === layer).length;
        } else if (activeLayerFilters.has(layer)) {
            // Camada está selecionada: mostrar total da camada
            count = nodes.filter(n => n.userData.layer === layer).length;
        } else {
            // Camada não selecionada: mostrar quantos conceitos desta camada
            // estão conectados com as camadas selecionadas
            const visibleNodeIds = new Set(
                nodes.filter(n => activeLayerFilters.has(n.userData.layer))
                     .map(n => n.userData.id)
            );
            
            // Encontrar nós desta camada que têm conexão com nós visíveis
            const connectedNodes = nodes.filter(n => {
                if (n.userData.layer !== layer) return false;
                
                // Verificar se tem alguma conexão com nós visíveis
                return getConceptConnections(n.userData.id).some(connId => visibleNodeIds.has(connId));
            });
            
            count = connectedNodes.length;
        }
        
        countElement.textContent = count.toString();
        
        // Atualizar estilo baseado na contagem
        if (count === 0 && activeLayerFilters.size > 0 && !activeLayerFilters.has(layer)) {
            countElement.style.opacity = '0.3';
        } else {
            countElement.style.opacity = '1';
        }
        
        // Acumular total do grupo (camada base)
        const baseLayer = layer.split('-')[0]; // ontologica-0 -> ontologica
        if (!groupTotals[baseLayer]) {
            groupTotals[baseLayer] = 0;
        }
        groupTotals[baseLayer] += count;
    });
    
    // Atualizar totais dos grupos
    Object.keys(groupTotals).forEach(baseLayer => {
        const totalElement = document.getElementById(`${baseLayer}-total`);
        if (totalElement) {
            totalElement.textContent = groupTotals[baseLayer].toString();
        }
    });
}

function toggleHelp() {
    // Usar o modal de ajuda do HTML em vez de criar dinamicamente
    const helpModal = document.getElementById('help-modal');
    
    if (helpModal) {
        const isVisible = helpModal.classList.contains('visible');
        
        if (isVisible) {
            // Fechar modal usando a função global
            if (typeof (window as any).closeHelp === 'function') {
                (window as any).closeHelp();
            } else {
                helpModal.classList.remove('visible');
                const container = document.getElementById('container');
                if (container) {
                    container.style.pointerEvents = 'auto';
                }
            }
        } else {
            // Abrir modal usando a função global
            if (typeof (window as any).openHelp === 'function') {
                (window as any).openHelp(false);
            } else {
                helpModal.classList.add('visible');
                const container = document.getElementById('container');
                if (container) {
                    container.style.pointerEvents = 'none';
                }
                const badge = document.getElementById('first-visit-badge');
                if (badge) {
                    badge.style.display = 'none';
                }
            }
        }
    }
}

function toggleSpeedMenu() {
    let speedMenu = document.getElementById('speed-menu');
    
    if (!speedMenu) {
        speedMenu = document.createElement('div');
        speedMenu.id = 'speed-menu';
        speedMenu.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            border: 2px solid var(--connection);
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            min-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
                transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
        `;
        
        // Adicionar estilos para tema claro
        const style = document.createElement('style');
        style.textContent = `
            body.light-theme #speed-menu {
                background: var(--glass-bg) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            }
            
            #speed-menu input[type="range"] {
                height: 6px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.1);
                outline: none;
                -webkit-appearance: none;
            }
            
            body.light-theme #speed-menu input[type="range"] {
                background: rgba(10, 10, 10, 0.1);
            }
            
            #speed-menu input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--connection);
                cursor: pointer;
                box-shadow: 0 0 10px var(--connection);
            }
            
            #speed-menu input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: var(--connection);
                cursor: pointer;
                border: none;
                box-shadow: 0 0 10px var(--connection);
            }
            
            #speed-menu button {
                transition: all 0.2s ease;
            }
            
            #speed-menu button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4);
            }
            
            body.light-theme #speed-menu button:hover {
                box-shadow: 0 4px 12px rgba(0, 170, 102, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        speedMenu.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: var(--connection); font-size: 1.1rem;">⚡ Controles de Animação</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Velocidade: <span id="speed-display">${animationSpeed.toFixed(1)}x</span>
                </label>
                <input type="range" id="speed-slider" min="0.1" max="3.0" step="0.1" value="${animationSpeed}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Rotação: <span id="rotation-display">${(rotationSpeed * 10000).toFixed(1)}</span>
                </label>
                <input type="range" id="rotation-slider" min="0.1" max="5" step="0.1" value="${rotationSpeed * 10000}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: var(--emergence); font-size: 0.9rem;">
                    Pulso: <span id="pulse-display">${(pulseIntensity * 100).toFixed(0)}%</span>
                </label>
                <input type="range" id="pulse-slider" min="0" max="2.0" step="0.1" value="${pulseIntensity}" 
                    style="width: 100%; accent-color: var(--connection);">
            </div>
            
            <button onclick="document.getElementById('speed-menu').remove()" 
                style="width: 100%; padding: 10px; background: var(--connection); border: none; border-radius: 8px; 
                color: var(--void); font-weight: bold; cursor: pointer; font-size: 0.9rem;">
                Fechar
            </button>
        `;
        
        document.body.appendChild(speedMenu);
        
        // Event listeners para os sliders
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = animationSpeed.toFixed(1) + 'x';
            updateStatusIndicator();
        });
        
        document.getElementById('rotation-slider').addEventListener('input', (e) => {
            rotationSpeed = parseFloat(e.target.value) / 10000;
            document.getElementById('rotation-display').textContent = e.target.value;
            updateStatusIndicator();
        });
        
        document.getElementById('pulse-slider').addEventListener('input', (e) => {
            pulseIntensity = parseFloat(e.target.value);
            document.getElementById('pulse-display').textContent = (pulseIntensity * 100).toFixed(0) + '%';
            updateStatusIndicator();
        });
    } else {
        speedMenu.remove();
    }
}

// ============================================================================
// VISUALIZAÇÃO EM CARDS
// ============================================================================

function renderCards(layerFilter = null, filteredConcepts = null) {
    // Limpar grid
    cardsGrid.innerHTML = '';
    
    // Usar DocumentFragment para otimizar inserções no DOM
    const fragment = document.createDocumentFragment();
    
    // Cache de conceitos por ID para evitar múltiplas buscas
    const conceptsById = new Map(concepts.map(c => [c.id, c]));
    
    // Determinar conceitos a exibir
    let conceptsToShow;
    if (filteredConcepts) {
        // Usar conceitos filtrados por conexão
        conceptsToShow = filteredConcepts;
    } else if (layerFilter) {
        // Filtrar por camada(s) - aceita string ou array
        if (Array.isArray(layerFilter)) {
            conceptsToShow = concepts.filter(c => layerFilter.includes(c.layer));
        } else {
            conceptsToShow = concepts.filter(c => c.layer === layerFilter);
        }
    } else {
        // Mostrar todos
        conceptsToShow = concepts;
    }
    
    // Ordenar por número de conexões (decrescente)
    conceptsToShow = [...conceptsToShow].sort((a, b) => 
        getConceptConnections(b.id).length - getConceptConnections(a.id).length
    );
    
    conceptsToShow.forEach(concept => {
        const card = document.createElement('div');
        card.className = 'concept-card';
        card.style.setProperty('--card-color', '#' + concept.color.toString(16).padStart(6, '0'));
        
        // Buscar nomes de conexões usando o Map (O(1) vs O(n))
        const connectedNames = getConceptConnections(concept.id)
            .map(id => {
                const connected = conceptsById.get(id);
                return connected ? { id: connected.id, name: connected.name } : null;
            })
            .filter(Boolean);
        
        // Construir HTML de tags sem onclick inline (usar event delegation)
        const connectionTagsHTML = connectedNames
            .map(({ id, name }) => `<span class="connection-tag" data-scroll-to="${id}">${name}</span>`)
            .join('');
        
        card.innerHTML = `
            <h3>
                <span class="card-icon"></span>
                ${concept.name}
            </h3>
            <p>${concept.description}</p>
            <div class="card-connections">
                <strong>Conexões Rizomáticas:</strong>
                <div class="connection-tags">
                    ${connectionTagsHTML}
                </div>
            </div>
        `;
        
        // Adicionar dados ao dataset para busca eficiente
        card.dataset.conceptId = concept.id;
        card.dataset.conceptName = concept.name.toLowerCase();
        card.dataset.conceptDescription = concept.description.toLowerCase();
        
        // Adicionar ao fragment em vez de ao DOM diretamente
        fragment.appendChild(card);
    });
    
    // Inserir tudo de uma vez (1 reflow em vez de 33)
    cardsGrid.appendChild(fragment);
    
    // Event delegation: um listener para toda a grid
    cardsGrid.removeEventListener('click', handleCardClick); // Remove se já existir
    cardsGrid.addEventListener('click', handleCardClick);
}

// Handler otimizado com event delegation
function handleCardClick(e) {
    // Check se clicou em connection tag
    const connectionTag = e.target.closest('.connection-tag');
    if (connectionTag) {
        const targetId = connectionTag.dataset.scrollTo;
        scrollToCard(targetId);
        return;
    }
    
    // Check se clicou em card
    const card = e.target.closest('.concept-card');
    if (card) {
        highlightCard(card);
    }
}

function scrollToCard(conceptId) {
    const card = document.querySelector(`[data-concept-id="${conceptId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightCard(card);
    }
}

function highlightCard(card) {
    const conceptId = card.dataset.conceptId;
    
    // Verificar se o card clicado já está marcado
    if (selectedCards.has(conceptId)) {
        // Desmarcar este card específico
        selectedCards.delete(conceptId);
        card.classList.remove('highlighted');
        card.style.transform = '';
        card.style.borderColor = '';
        
        // Se não há mais cards selecionados, resetar tudo
        if (selectedCards.size === 0) {
            resetConnectionFilter();
            showNotification('Filtro removido - mostrando todos os conceitos');
            return;
        }
        
        // Caso contrário, recalcular filtro com os cards restantes
        const allConnectedIds = new Set();
        selectedCards.forEach(id => {
            const concept = concepts.find(c => c.id === id);
            if (concept) {
                allConnectedIds.add(id);
                getConceptConnections(concept.id).forEach(connId => allConnectedIds.add(connId));
            }
        });
        
        const filteredConcepts = concepts.filter(c => allConnectedIds.has(c.id));
        renderCards(null, filteredConcepts);
        
        // Aplicar filtro também no 3D
        apply3DFilter(allConnectedIds);
        
        // Re-aplicar highlights aos cards selecionados
        setTimeout(() => {
            selectedCards.forEach(id => {
                const cardToHighlight = document.querySelector(`[data-concept-id="${id}"]`);
                if (cardToHighlight) {
                    cardToHighlight.classList.add('highlighted');
                    cardToHighlight.style.transform = 'scale(1.02)';
                    cardToHighlight.style.borderColor = cardToHighlight.style.getPropertyValue('--card-color');
                }
            });
        }, 50);
        
        showNotification(`${selectedCards.size} conceito(s) selecionado(s) - ${filteredConcepts.length} disponíveis`);
        return;
    }
    
    // Adicionar novo card à seleção
    selectedCards.add(conceptId);
    
    // Calcular interseção de todas as conexões dos cards selecionados
    const allConnectedIds = new Set();
    selectedCards.forEach(id => {
        const concept = concepts.find(c => c.id === id);
        if (concept) {
            allConnectedIds.add(id);
            getConceptConnections(concept.id).forEach(connId => allConnectedIds.add(connId));
        }
    });
    
    const filteredConcepts = concepts.filter(c => allConnectedIds.has(c.id));
    
    // Re-renderizar cards com filtro
    renderCards(null, filteredConcepts);
    
    // Aplicar filtro também no 3D
    apply3DFilter(allConnectedIds);
    
    // Re-aplicar highlights após re-render
    setTimeout(() => {
        selectedCards.forEach(id => {
            const cardToHighlight = document.querySelector(`[data-concept-id="${id}"]`);
            if (cardToHighlight) {
                cardToHighlight.classList.add('highlighted');
                cardToHighlight.style.transform = 'scale(1.02)';
                cardToHighlight.style.borderColor = cardToHighlight.style.getPropertyValue('--card-color');
                
                // Scroll para o último adicionado
                if (id === conceptId) {
                    cardToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }, 50);
    
    const concept = concepts.find(c => c.id === conceptId);
    showNotification(`${selectedCards.size} conceito(s) selecionado(s) - ${filteredConcepts.length} disponíveis`);
}

/**
 * Aplica filtro de opacidade nos nós 3D baseado nos IDs filtrados
 */
function apply3DFilter(connectedIds) {
    const isDark = !isLightTheme();
    
    // Aplicar filtro de opacidade e visibilidade nos nós
    nodes.forEach(node => {
        if (connectedIds.has(node.userData.id)) {
            // Nó visível
            node.visible = true;
            if (node.userData.label) node.userData.label.visible = true;
            
            if (selectedCards.has(node.userData.id)) {
                // Nó selecionado - totalmente opaco
                node.material.opacity = SELECTED_OPACITY;
                node.scale.setScalar(1.3);
                if (node.userData.label) node.userData.label.material.opacity = 0.9;
            } else {
                // Nó conectado - opaco
                node.material.opacity = 1.0;
                node.scale.setScalar(1.0);
                if (node.userData.label) node.userData.label.material.opacity = 0.9;
            }
        } else {
            // Nó não conectado - esconder completamente
            node.visible = false;
            if (node.userData.label) node.userData.label.visible = false;
        }
    });
    
    // Aplicar filtro nas linhas
    lines.forEach(line => {
        const sourceId = line.userData.source.userData.id;
        const targetId = line.userData.target.userData.id;
        
        if (connectedIds.has(sourceId) && connectedIds.has(targetId)) {
            line.visible = true;
            
            // Destacar linhas conectadas a nós selecionados
            const sourceSelected = selectedCards.has(sourceId);
            const targetSelected = selectedCards.has(targetId);
            
            if (sourceSelected && targetSelected) {
                // Ambos os nós selecionados - criar gradiente!
                const sourceColor = line.userData.source.userData.originalColor;
                const targetColor = line.userData.target.userData.originalColor;
                updateLineGradient(line, sourceColor, targetColor);
                line.material.opacity = 1.0;
            } else if (sourceSelected || targetSelected) {
                // Apenas um selecionado - usar cor única
                const selectedColor = sourceSelected ? 
                    line.userData.source.userData.originalColor : 
                    line.userData.target.userData.originalColor;
                resetLineColor(line, selectedColor);
                line.material.opacity = 1.0;
            } else {
                // Nenhum selecionado - cor original com menor opacidade
                resetLineColor(line, line.userData.originalColor);
                const secondaryOpacity = isDark ? 0.5 : 0.85;
                line.material.opacity = secondaryOpacity;
            }
        } else {
            line.visible = false;
        }
    });
}

// Debounce para otimizar busca em tempo real
let searchDebounceTimer;
function handleSearch(e) {
    // Limpar timer anterior
    clearTimeout(searchDebounceTimer);
    
    // Aguardar 150ms antes de executar busca
    searchDebounceTimer = setTimeout(() => {
        performSearch(e.target.value);
    }, 150);
}

function performSearch(value) {
    const searchTerm = value.toLowerCase().trim();
    const cards = document.querySelectorAll('.concept-card');
    const resultsDiv = document.getElementById('search-results');
    
    if (!searchTerm) {
        // Usar requestAnimationFrame para suavizar mudanças no DOM
        requestAnimationFrame(() => {
            cards.forEach(card => {
                card.style.display = '';
                card.style.opacity = '1';
            });
        });
        resultsDiv.textContent = '';
        return;
    }
    
    let visibleCount = 0;
    const updates = []; // Batch updates
    
    cards.forEach(card => {
        const name = card.dataset.conceptName;
        const description = card.dataset.conceptDescription;
        const matches = name.includes(searchTerm) || description.includes(searchTerm);
        
        if (matches) {
            updates.push({ card, display: '', opacity: '1' });
            visibleCount++;
        } else {
            updates.push({ card, display: 'none', opacity: '0' });
        }
    });
    
    // Aplicar todas as mudanças de uma vez
    requestAnimationFrame(() => {
        updates.forEach(({ card, display, opacity }) => {
            card.style.display = display;
            card.style.opacity = opacity;
        });
    });
    
    resultsDiv.textContent = visibleCount === 0 
        ? 'Nenhum conceito encontrado' 
        : `${visibleCount} conceito${visibleCount > 1 ? 's' : ''} encontrado${visibleCount > 1 ? 's' : ''}`;
}

// ============================================================================
// ALTERNÂNCIA DE MODO
// ============================================================================

function toggleViewMode() {
    const btnCards = document.getElementById('btn-cards');
    const navCardsBtn = document.getElementById('nav-cards-btn');
    const title = document.getElementById('title');
    
    if (viewMode === '3d') {
        // Mudar para cards
        viewMode = 'cards';
        
        // Desativar completamente a renderização 3D
        isAnimating = false;
        
        // Ocultar container 3D e título
        container.classList.add('hidden');
        if (title) title.style.display = 'none';
        cardsContainer.classList.add('visible');
        searchContainer.classList.add('visible');
        infoPanel.classList.remove('visible');
        
        // Atualizar botão da barra de controles
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
            if (icon) icon.textContent = '◈';
            if (text) text.textContent = '3D';
        }
        
        // Atualizar botão do menu de navegação
        if (navCardsBtn) {
            const icon = navCardsBtn.querySelector('.nav-action-icon');
            const text = navCardsBtn.querySelector('.nav-action-text');
            if (icon) icon.textContent = '◈';
            if (text) text.textContent = '3D';
        }
        
        // Desabilitar controles de 3D
        document.querySelectorAll('.control-btn').forEach(b => {
            const text = b.querySelector('.btn-text');
            if (text && (text.textContent.includes('Pausar') || 
                text.textContent.includes('Animar') || 
                text.textContent.includes('Conexões') ||
                text.textContent.includes('Velocidade') ||
                text.textContent.includes('Resetar'))) {
                b.style.opacity = '0.3';
                b.style.pointerEvents = 'none';
            }
        });
        
        showNotification('Modo Cards ativado - Renderização 3D pausada');
        
    } else {
        // Mudar para 3D
        viewMode = '3d';
        
        // Reativar renderização 3D
        isAnimating = true;
        
        // Mostrar container 3D e título
        container.classList.remove('hidden');
        if (title) title.style.display = '';
        cardsContainer.classList.remove('visible');
        searchContainer.classList.remove('visible');
        
        // Atualizar botão da barra de controles
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
            if (icon) icon.textContent = '⊞';
            if (text) text.textContent = 'Cards';
        }
        
        // Atualizar botão do menu de navegação
        if (navCardsBtn) {
            const icon = navCardsBtn.querySelector('.nav-action-icon');
            const text = navCardsBtn.querySelector('.nav-action-text');
            if (icon) icon.textContent = '⊞';
            if (text) text.textContent = 'Cards';
        }
        
        // Reabilitar controles de 3D
        document.querySelectorAll('.control-btn').forEach(b => {
            b.style.opacity = '';
            b.style.pointerEvents = '';
        });
        
        // Limpar busca ao voltar para 3D
        searchInput.value = '';
        if (typeof performSearch === 'function') {
            performSearch('');
        }
        
        showNotification('Modo 3D ativado');
    }
}

// ============================================================================
// ALTERNÂNCIA DE MODO DE CÂMERA (DENTRO/FORA DO CAOS)
// ============================================================================

function toggleCameraMode() {
    if (cameraMode === 'outside') {
        // Mudar para dentro do caos
        cameraMode = 'inside';
        camera.position.set(0, 0, 0); // Centro do emaranhado
        showNotification('Modo: Dentro do Caos');
    } else {
        // Mudar para fora do caos
        cameraMode = 'outside';
        camera.position.set(0, 0, 900); // Visão externa
        showNotification('Modo: Fora do Caos');
    }
    
    // Atualizar lookAt
    if (cameraLookAtTarget) {
        camera.lookAt(cameraLookAtTarget);
    } else {
        camera.lookAt(scene.position);
    }
}

// ============================================================================
// EXPOR FUNÇÕES GLOBALMENTE PARA USO NO HTML
// ============================================================================

(window as any).resetView = resetView;
(window as any).toggleLegend = toggleLegend;
(window as any).toggleHelp = toggleHelp;
(window as any).toggleCameraMode = toggleCameraMode;

// ============================================================================
// API INTERATIVA DO CONSOLE - RIZOMA TOOLKIT 🌐
// ============================================================================

interface RizomaAPI {
    // Informações
    info(): void;
    stats(live?: boolean): void;
    help(): void;
    
    // Navegação
    goto(conceptName: string): void;
    random(): void;
    findHub(): void;
    findBridge(): void;
    
    // Visualização
    toggleMode(): void;
    reset(): void;
    explode(factor?: number): void;
    collapse(): void;
    
    // Análise
    analyze(conceptName: string): void;
    layers(): void;
    bridges(): void;
    hubs(): void;
    
    // Sistemas Avançados
    quantum(): void;
    resetQuantum(): void;
    resetPhysics(): void;
    turbo(duration?: number): void;
    topology(): void;
    entanglement(): void;
    geometry(): void;
    memory(): void;
    explore(speed?: number): void;
    dimensions(mode?: '3d' | '4d-hypersphere' | '5d-manifold' | 'topology-space'): void;
    relativity(): void;
    gravity(): void;
    
    // Easter eggs / Funções secretas
    matrix(): void;
    disco(): void;
    breathe(): void;
    constellation(): void;
}

const rizoma: RizomaAPI = {
    info: () => {
        const uniqueLayers = [...new Set(concepts.map(c => c.layer))];
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   🌐 RIZOMA - Ontologia Relacional            ║
╠═══════════════════════════════════════════════════════════════╣
║  Bem-vindo à interface interativa do Rizoma! 🎉               ║
║                                                               ║
║  📊 Conceitos: ${concepts.length}                                          ║
║  🔗 Relações: ${relations.length}                                        ║
║  🎨 Camadas: ${uniqueLayers.length}                                            ║
║  🌉 Pontes: ${clusterMetadata?.bridges?.length || 0}                                           ║
║                                                               ║
║  Digite rizoma.help() para ver comandos disponíveis          ║
╚═══════════════════════════════════════════════════════════════╝
        `);
    },
    
    stats: (live: boolean = false) => {
        const showStats = () => {
            const uniqueLayers = [...new Set(concepts.map(c => c.layer))];
            const layerStats = uniqueLayers.map(layer => {
                const count = concepts.filter(c => (c.layer) === layer).length;
                
                // Tenta usar metadados estáticos primeiro
                let density = clusterMetadata?.layer_clusters?.[layer]?.density;
                if (density === undefined) {
                    const dynamicMetadata = calculateDynamicClusterMetadata(layer);
                    density = dynamicMetadata.density;
                }
                
                return `  ${layer}: ${count} conceitos (densidade: ${(density * 100).toFixed(1)}%)`;
            }).join('\n');
            
            // Calcular FPS médio
            const avgFPS = fpsHistory.length > 0 
                ? (fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length).toFixed(1)
                : 'N/A';
            
            const statsText = `
📈 Estatísticas do Rizoma (${new Date().toLocaleTimeString()}):
${layerStats}

🎯 Modo de câmera: ${cameraMode === 'outside' ? 'Fora do Caos' : 'Dentro do Caos'}
⚡ Performance: ${performanceMode ? 'Alto desempenho' : 'Normal'}
📊 FPS médio: ${avgFPS}
🎬 Animação: ${isAnimating ? 'Ativa' : 'Pausada'}
            `;
            
            if (live) {
                console.clear();
                console.log(statsText);
                console.log('🔄 Atualizando a cada segundo... (use rizoma.stats(false) para parar)');
            } else {
                console.log(statsText);
            }
        };
        
        // Se já está rodando live stats, parar
        if (statsInterval !== null) {
            clearInterval(statsInterval);
            statsInterval = null;
            console.log('⏹️ Atualização em tempo real parada.');
            return;
        }
        
        // Mostrar stats inicial
        showStats();
        
        // Se live = true, configurar intervalo
        if (live) {
            statsInterval = window.setInterval(showStats, 1000);
            console.log('✅ Modo live ativado! As estatísticas serão atualizadas a cada segundo.');
        }
    },
    
    help: () => {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           🌟 RIZOMA TOOLKIT - Console Interativo              ║
╠═══════════════════════════════════════════════════════════════╣
║  💡 Abra o console com F12 (ou Cmd+Option+I no Mac)          ║
║     e explore o rizoma programaticamente!                     ║
╚═══════════════════════════════════════════════════════════════╝

📖 INFORMAÇÃO:
   rizoma.info()          - Informações sobre o Rizoma
   rizoma.stats()         - Estatísticas detalhadas
   rizoma.stats(true)     - 🔄 Estatísticas em tempo real!
   rizoma.help()          - Esta mensagem (você está aqui! 👋)

🧭 NAVEGAÇÃO:
   rizoma.goto("nome")    - Navegar para um conceito específico
   rizoma.random()        - Ir para um conceito aleatório
   rizoma.findHub()       - Encontrar um hub (conceito central)
   rizoma.findBridge()    - Encontrar uma ponte entre camadas

👁️ VISUALIZAÇÃO:
   rizoma.toggleMode()    - Alternar entre dentro/fora do caos
   rizoma.reset()         - Resetar visualização
   rizoma.explode(2.5)    - Expandir o rizoma (fator opcional)
   rizoma.collapse()      - Colapsar ao estado normal

🔬 ANÁLISE:
   rizoma.analyze("nome") - Análise detalhada de um conceito
   rizoma.layers()        - Informações sobre as camadas
   rizoma.bridges()       - Lista todas as pontes
   rizoma.hubs()          - Lista todos os hubs

🌌 SISTEMAS AVANÇADOS:
   rizoma.quantum()       - Estado quântico do sistema
   rizoma.resetQuantum()  - 🔄 Reinicializar campos quânticos
   rizoma.resetPhysics()  - ⚡ Reinicializar física relativística
   rizoma.turbo(seconds)  - 🚀 Ativar/desativar convergência acelerada
   rizoma.topology()      - Métricas topológicas (PageRank, etc.)
   rizoma.geometry()      - Análise geométrica (curvatura, densidade)
   rizoma.memory()        - 🧠 Traços de memória e padrões emergentes
   rizoma.explore(speed)  - 🤖 Ativar/desativar agente explorador autônomo
   rizoma.dimensions(mode)- 🎭 Projeções dimensionais (3D/4D/5D/topology)
   rizoma.relativity()    - Efeitos relativísticos
   rizoma.gravity()       - 🌍 Hierarquia gravitacional radial

⚛️ FÍSICA QUÂNTICA:
   rizoma.entanglement()     - Mapa de entrelaçamento quântico
   rizoma.waveFunction(name) - Função de onda de um conceito
   rizoma.decohere()         - Análise de decoerência
   rizoma.coherenceAnalysis()- 🔬 Correlação coerência × entrelaçamento

🕸️ TOPOLOGIA:
   rizoma.pageRank()      - Ranking de importância (PageRank)
   rizoma.communities()   - Comunidades detectadas (Louvain)
   rizoma.centrality()    - Centralidade (betweenness, closeness)
   rizoma.networkFlow()   - Fluxo de informação pela rede
   rizoma.flowClusters()  - 🧭 Clusters por direção de fluxo

✨ EASTER EGGS (descubra por conta própria!):
   rizoma.matrix()
   rizoma.disco()
   rizoma.breathe()
   rizoma.constellation()

💡 Dica: Use TAB para autocompletar comandos!
        `);
    },
    
    goto: (conceptName: string) => {
        const concept = concepts.find(c => 
            c.name.toLowerCase().includes(conceptName.toLowerCase())
        );
        
        if (!concept) {
            console.log(`❌ Conceito "${conceptName}" não encontrado. Que tal tentar rizoma.random()?`);
            return;
        }
        
        const node = nodes.find(n => n.userData.id === concept.id);
        if (node) {
            // Focar no nó (destaca conexões e atualiza painel)
            focusOnNode(node);
            
            // Posicionar câmera
            camera.position.copy(node.position);
            camera.position.z += 100;
            camera.lookAt(node.position);
            
            // Contar conexões reais do nó
            const connectionCount = lines.filter(line => 
                line.userData.from === concept.id || line.userData.to === concept.id
            ).length;
            
            const layer = concept.layer;
            console.log(`✅ Navegando para "${concept.name}" (${layer})`);
            if (connectionCount > 0) {
                console.log(`   🔗 ${connectionCount} ${connectionCount === 1 ? 'conexão' : 'conexões'}`);
            }
        }
    },
    
    random: () => {
        const concept = concepts[Math.floor(Math.random() * concepts.length)];
        console.log(`🎲 Escolhendo aleatoriamente...`);
        rizoma.goto(concept.name);
    },
    
    findHub: () => {
        // Procurar em todas as camadas por um hub
        let hubConcept = null;
        for (const concept of concepts) {
            const layer = concept.layer;
            
            // Tenta usar metadados estáticos primeiro
            let hubs = clusterMetadata?.layer_clusters?.[layer]?.hubs;
            
            // Se não houver metadados estáticos, calcula dinamicamente
            if (!hubs || hubs.length === 0) {
                const dynamicMetadata = calculateDynamicClusterMetadata(layer);
                hubs = dynamicMetadata.hubs;
            }
            
            if (hubs?.includes(concept.id)) {
                hubConcept = concept;
                break;
            }
        }
        
        if (hubConcept) {
            console.log(`🎯 Hub encontrado!`);
            rizoma.goto(hubConcept.name);
        } else {
            console.log(`🤔 Nenhum hub marcado nos metadados. Procurando conceito mais conectado...`);
            rizoma.random();
        }
    },
    
    findBridge: () => {
        // Encontrar pontes dinamicamente (conceitos que conectam >= 2 camadas diferentes)
        const bridges = concepts.filter(c => isBridge(c.id));
        
        if (bridges.length === 0) {
            console.log(`🤷 Nenhuma ponte encontrada no grafo.`);
            return;
        }
        
        // Escolher uma ponte aleatória
        const bridge = bridges[Math.floor(Math.random() * bridges.length)];
        
        // Contar quantas camadas diferentes esta ponte conecta
        const connections = connectionCache.get(bridge.id) || [];
        const connectedLayers = new Set(
            connections
                .map(connId => {
                    const connConcept = concepts.find(c => c.id === connId);
                    return connConcept?.layer;
                })
                .filter(layer => layer && layer !== bridge.layer)
        );
        
        console.log(`🌉 Ponte encontrada: ${bridge.name}`);
        console.log(`   Conecta ${connectedLayers.size} camadas diferentes`);
        console.log(`   Total de conexões: ${connections.length}`);
        rizoma.goto(bridge.name);
    },
    
    toggleMode: () => {
        toggleCameraMode();
        console.log(`🔄 Modo alternado para: ${cameraMode === 'outside' ? 'Fora do Caos 🌍' : 'Dentro do Caos 🌀'}`);
    },
    
    reset: () => {
        resetView();
        console.log(`🔄 Visualização resetada. Bem-vindo de volta! 👋`);
    },
    
    explode: (factor: number = 2.0) => {
        nodes.forEach(node => {
            node.position.multiplyScalar(factor);
        });
        console.log(`💥 Rizoma expandido ${factor}x! Use rizoma.collapse() para reverter.`);
    },
    
    collapse: () => {
        resetView();
        console.log(`🎯 Rizoma colapsado ao estado normal.`);
    },
    
    analyze: (conceptName: string) => {
        const concept = concepts.find(c => 
            c.name.toLowerCase().includes(conceptName.toLowerCase())
        );
        
        if (!concept) {
            console.log(`❌ Conceito "${conceptName}" não encontrado.`);
            return;
        }
        
        const layer = concept.layer;
        
        // Contar conexões reais usando lines
        const connectionCount = lines.filter(line => 
            line.userData.from === concept.id || line.userData.to === concept.id
        ).length;
        
        // Verificar se é hub (tenta estático primeiro, depois dinâmico)
        let hubs = clusterMetadata?.layer_clusters?.[layer]?.hubs;
        if (!hubs || hubs.length === 0) {
            const dynamicMetadata = calculateDynamicClusterMetadata(layer);
            hubs = dynamicMetadata.hubs;
        }
        const isHub = hubs?.includes(concept.id);
        
        // Verificar se é ponte (apenas em metadados estáticos por enquanto)
        const isBridge = clusterMetadata?.bridges?.some(b => b.id === concept.id);
        const bridgeInfo = clusterMetadata?.bridges?.find(b => b.id === concept.id);
        
        console.log(`
🔬 Análise Detalhada: "${concept.name}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Camada: ${layer}
🔗 Conexões: ${connectionCount}
${isHub ? '⭐ Status: HUB (conceito central da camada)' : ''}
${isBridge ? `🌉 Status: PONTE (conecta ${bridgeInfo?.layers_connected} camadas)` : ''}

💡 Descrição: ${concept.description || 'Não disponível'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    layers: () => {
        const uniqueLayers = [...new Set(concepts.map(c => c.layer))];
        console.log(`
🎨 Camadas do Rizoma:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${uniqueLayers.map(layer => {
    const count = concepts.filter(c => (c.layer) === layer).length;
    const color = clusterMetadata?.layer_clusters?.[layer]?.color || '#ffffff';
    const density = clusterMetadata?.layer_clusters?.[layer]?.density || 0;
    const hubs = clusterMetadata?.layer_clusters?.[layer]?.hubs?.length || 0;
    return `  ${color} ${layer.toUpperCase()}\n    ${count} conceitos | ${hubs} hubs | densidade: ${(density * 100).toFixed(1)}%`;
}).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    bridges: () => {
        if (!clusterMetadata?.bridges || clusterMetadata.bridges.length === 0) {
            console.log(`🤷 Nenhuma ponte identificada.`);
            return;
        }
        
        console.log(`
🌉 Pontes Inter-Camadas (${clusterMetadata.bridges.length} total):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clusterMetadata.bridges.slice(0, 10).map(bridge => {
    const concept = concepts.find(c => c.id === bridge.id);
    return `  🌉 ${concept?.name || bridge.id}\n     Conecta ${bridge.layers_connected} camadas | ${bridge.connections} conexões`;
}).join('\n\n')}
${clusterMetadata.bridges.length > 10 ? `\n... e mais ${clusterMetadata.bridges.length - 10} pontes` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    hubs: () => {
        const allHubs: Array<{layer: string, conceptId: string, name: string}> = [];
        const uniqueLayers = [...new Set(concepts.map(c => c.layer))];
        
        uniqueLayers.forEach(layer => {
            const hubIds = clusterMetadata?.layer_clusters?.[layer]?.hubs || [];
            hubIds.forEach(id => {
                const concept = concepts.find(c => c.id === id);
                if (concept) {
                    allHubs.push({layer, conceptId: id, name: concept.name});
                }
            });
        });
        
        if (allHubs.length === 0) {
            console.log(`🤷 Nenhum hub identificado.`);
            return;
        }
        
        console.log(`
⭐ Hubs (Conceitos Centrais) - ${allHubs.length} total:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allHubs.map(hub => `  ⭐ ${hub.name}\n     Camada: ${hub.layer}`).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    // Sistemas Avançados
    quantum: () => {
        console.log(`
⚛️ ESTADO QUÂNTICO DO SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Estatísticas Globais:
   • Campos quânticos ativos: ${quantumFields.size}
   • Estados de superposição: ${SUPERPOSITION_STATES} por nó
   • Alcance de entrelaçamento: ${ENTANGLEMENT_RANGE}
   • Taxa de decoerência: ${DECOHERENCE_RATE}
   • Probabilidade de tunelamento: ${QUANTUM_TUNNELING_PROB}

🌊 Amostra de Estados (primeiros 5 nós):
${Array.from(quantumFields.entries()).slice(0, 5).map(([id, field]) => {
    const concept = concepts.find(c => c.id === id);
    const entanglementCount = field.entanglement.size;
    return `   ${concept?.name || id}:
      Coerência: ${(field.coherence * 100).toFixed(1)}%
      Entrelaçamentos: ${entanglementCount}
      Número quântico: ${field.quantumNumber}`;
}).join('\n')}

💡 Use rizoma.entanglement() para ver mapa de entrelaçamento
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    resetQuantum: () => {
        console.log(`🔄 Reinicializando campos quânticos...`);
        initializeQuantumFields();
        console.log(`✅ Campos quânticos restaurados!`);
        console.log(`   Coerência restaurada baseada em conectividade`);
        console.log(`   Entrelaçamentos recalculados`);
        console.log(`\n💡 Use rizoma.quantum() para ver o novo estado`);
    },
    
    resetPhysics: () => {
        console.log(`🔄 Reinicializando física relativística...`);
        
        // Limpar velocidades antigas
        relativisticEffects.clear();
        
        // Reinicializar com velocidade zero
        nodes.forEach(node => {
            const id = node.userData.id;
            relativisticEffects.set(id, {
                properTime: 0,
                velocity: new THREE.Vector3(0, 0, 0),
                gamma: 1.0
            });
            // Resetar lastPosition para recalcular velocidades do zero
            delete node.userData.lastPosition;
            
            // Reinicializar campos quânticos (corrigir NaN)
            const field = quantumFields.get(id);
            if (field) {
                field.waveFunction.forEach(state => {
                    if (!isFinite(state.phase)) {
                        state.phase = Math.random() * Math.PI * 2;
                    }
                    if (!isFinite(state.amplitude)) {
                        state.amplitude = Math.random();
                    }
                });
            }
        });
        
        console.log(`✅ Física relativística restaurada!`);
        console.log(`   Todas as velocidades zeradas`);
        console.log(`   Campos quânticos verificados (NaN corrigidos)`);
        console.log(`   Velocidades vão convergir para movimento radial atual`);
        console.log(`\n💡 Use rizoma.relativity() para ver nova distribuição em ~5s`);
    },
    
    turbo: (duration = 10) => {
        if (turboMode.active) {
            turboMode.active = false;
            console.log(`🏁 Modo Turbo DESATIVADO manualmente`);
            console.log(`   Suavização voltou ao normal (α = 0.15)`);
        } else {
            turboMode.active = true;
            turboMode.startTime = Date.now();
            turboMode.duration = duration * 1000;
            
            console.log(`🚀 MODO TURBO ATIVADO!`);
            console.log(`   Duração: ${duration}s`);
            console.log(`   Suavização acelerada: α = ${turboMode.smoothingFactor} (4× mais rápido)`);
            console.log(`   Convergência estimada: ~${Math.ceil(duration / 3)}s\n`);
            console.log(`⚡ Efeitos do Modo Turbo:`);
            console.log(`   • Velocidades convergem 4× mais rápido`);
            console.log(`   • Distribuição atinge equilíbrio rapidamente`);
            console.log(`   • Modo desativa automaticamente após ${duration}s\n`);
            console.log(`💡 Use rizoma.relativity() para monitorar progresso`);
        }
    },
    
    topology: () => {
        if (topologyMetrics.size === 0) {
            console.log(`⏳ Métricas topológicas sendo calculadas... (atualizam a cada ${TOPOLOGY_UPDATE_INTERVAL}ms)`);
            return;
        }
        
        const metricsArray = Array.from(topologyMetrics.entries())
            .sort((a, b) => (b[1].pageRank || 0) - (a[1].pageRank || 0));
        
        console.log(`
🕸️ ANÁLISE TOPOLÓGICA DA REDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Top 10 por PageRank:
${metricsArray.slice(0, 10).map(([id, metrics], idx) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${idx + 1}. ${concept?.name || id}
      PageRank: ${(metrics.pageRank * 1000).toFixed(3)}
      Betweenness: ${metrics.betweenness.toFixed(1)}
      Closeness: ${metrics.closeness.toFixed(4)}
      Grau: ${metrics.degree}`;
}).join('\n')}

🔬 Versão topológica: ${globalTopologyVersion}
💡 Use rizoma.communities() para ver detecção de comunidades
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    geometry: () => {
        if (adaptiveFields.size === 0) {
            console.log(`📐 Campos geométricos não inicializados ainda...`);
            return;
        }
        
        const fieldsArray = Array.from(adaptiveFields.entries())
            .sort((a, b) => b[1].localDensity - a[1].localDensity);
        
        console.log(`
📐 GEOMETRIA NÃO-EUCLIDIANA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Regiões de Alta Densidade:
${fieldsArray.slice(0, 5).map(([id, field]) => {
    const concept = concepts.find(c => c.id === id);
    const node = nodes.find(n => n.userData.id === id);
    const radius = node ? node.position.length() : 0;
    const radialFlowDirection = (field.radialFlow || 0) > 0 ? '↗️ divergente' : (field.radialFlow || 0) < 0 ? '↘️ convergente' : '⊥ estático';
    
    return `   ${concept?.name || id}:
      Densidade local: ${field.localDensity.toFixed(2)}
      Curvatura espacial: ${field.curvature.toFixed(3)}
      Raio atual: ${radius.toFixed(1)}
      Fluxo radial: ${Math.abs(field.radialFlow || 0).toFixed(3)} ${radialFlowDirection}
      Fluxo tangencial: ${(field.tangentialFlow || 0).toFixed(3)}`;
}).join('\n')}

⚙️ Configuração:
   • Resolução de campo: ${FIELD_RESOLUTION}
   • Influência de curvatura: ${CURVATURE_INFLUENCE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    memory: () => {
        if (memoryTraces.size === 0) {
            console.log(`🧠 Sistema de memória não inicializado...`);
            return;
        }
        
        const memArray = Array.from(memoryTraces.entries())
            .sort((a, b) => b[1].importance - a[1].importance);
        
        const explorerStatus = explorerAgent.active ? 
            `🤖 Agente Explorador: ATIVO
      Nó atual: ${concepts.find(c => c.id === explorerAgent.currentNodeId)?.name || 'N/A'}
      Nós visitados: ${explorerAgent.visitHistory.length}
      Velocidade: ${explorerAgent.speed.toFixed(3)}` :
            `🤖 Agente Explorador: INATIVO (use rizoma.explore() para ativar)`;
        
        console.log(`
🧠 MEMÓRIA E APRENDIZADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Conceitos Mais Importantes (por memória):
${memArray.slice(0, 8).map(([id, mem]) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${concept?.name || id}:
      Importância: ${(mem.importance * 100).toFixed(1)}%
      Visitas: ${mem.visitFrequency.toFixed(1)}
      Caminhos: ${mem.pathHistory.length}`;
}).join('\n')}

${explorerStatus}

🔍 Padrões Emergentes Detectados: ${emergentPatterns.size}
⚙️ Taxa de decaimento: ${MEMORY_DECAY}
💾 Limiar de padrão: ${PATTERN_THRESHOLD}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    explore: (speed = 0.02) => {
        explorerAgent.active = !explorerAgent.active;
        
        if (explorerAgent.active) {
            explorerAgent.speed = speed;
            explorerAgent.currentNodeId = null; // Reiniciar
            console.log(`🤖 Agente Explorador ATIVADO (velocidade: ${speed})`);
        } else {
            console.log(`🤖 Agente Explorador DESATIVADO
📊 Estatísticas da exploração:
   • Nós visitados: ${explorerAgent.visitHistory.length}
   • Nós únicos: ${new Set(explorerAgent.visitHistory).size}
   • Cobertura: ${((new Set(explorerAgent.visitHistory).size / nodes.length) * 100).toFixed(1)}%`);
        }
    },
    
    dimensions: (mode = null) => {
        if (mode && ['3d', '4d-hypersphere', '5d-manifold', 'topology-space'].includes(mode)) {
            dimensionalProjection = mode;
            console.log(`🎭 Modo dimensional alterado para: ${mode}`);
            
            // Salvar posições originais se não existirem
            nodes.forEach(node => {
                if (!node.userData.originalPosition) {
                    node.userData.originalPosition = node.position.clone();
                }
            });
            
            return;
        }
        
        const totalNodes = higherDimensions.size;
        const avgW = totalNodes > 0 ? 
            Array.from(higherDimensions.values()).reduce((sum, c) => sum + c.w, 0) / totalNodes : 0;
        const avgV = totalNodes > 0 ?
            Array.from(higherDimensions.values()).reduce((sum, c) => sum + c.v, 0) / totalNodes : 0;
        
        console.log(`
🎭 PROJEÇÕES DIMENSIONAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌍 Modo Atual: ${dimensionalProjection}

📊 Modos Disponíveis:
   • 3d              - Visualização euclidiana padrão
   • 4d-hypersphere  - Projeção em hiperesfera 4D
   • 5d-manifold     - Variedade toroidal 5D
   • topology-space  - Espaço topológico abstrato
   
💡 Use: rizoma.dimensions('4d-hypersphere') para mudar de modo

${higherDimensions.size > 0 ? `
🔢 Coordenadas Superiores (Top 5 por w):
${Array.from(higherDimensions.entries())
    .sort((a, b) => Math.abs(b[1].w) - Math.abs(a[1].w))
    .slice(0, 5)
    .map(([id, coords]) => {
        const concept = concepts.find(c => c.id === id);
        return `   ${concept?.name || id}:
      4ª dimensão (w): ${coords.w.toFixed(2)} ${coords.w > 0 ? '🔺' : '🔻'}
      5ª dimensão (v): ${coords.v.toFixed(2)}`;
    }).join('\n')}

📈 Estatísticas Dimensionais:
   • Média 4D (w): ${avgW.toFixed(2)}
   • Média 5D (v): ${avgV.toFixed(2)}
   • Nós mapeados: ${totalNodes}` : '⏳ Coordenadas superiores sendo calculadas...'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    relativity: () => {
        if (relativisticEffects.size === 0) {
            console.log(`⚡ Efeitos relativísticos não inicializados...`);
            return;
        }
        
        const relArray = Array.from(relativisticEffects.entries())
            .filter(([_, rel]) => rel.velocity.length() > 0.01) // Filtrar nós quase estáticos
            .sort((a, b) => b[1].gamma - a[1].gamma);
        
        const totalMoving = relArray.length;
        const avgGamma = totalMoving > 0 ? 
            relArray.reduce((sum, [_, rel]) => sum + rel.gamma, 0) / totalMoving : 1.0;
        const maxBeta = totalMoving > 0 ?
            Math.max(...relArray.map(([_, rel]) => rel.velocity.length() / SPEED_OF_LIGHT)) : 0;
        
        // Distribuição de velocidades (histograma)
        const speedRanges = {
            'Muito lento (β < 0.1)': 0,
            'Lento (0.1 ≤ β < 0.3)': 0,
            'Moderado (0.3 ≤ β < 0.5)': 0,
            'Rápido (0.5 ≤ β < 0.7)': 0,
            'Muito rápido (0.7 ≤ β < 0.9)': 0,
            'Relativístico (β ≥ 0.9)': 0
        };
        
        relArray.forEach(([_, rel]) => {
            const beta = rel.velocity.length() / SPEED_OF_LIGHT;
            if (beta < 0.1) speedRanges['Muito lento (β < 0.1)']++;
            else if (beta < 0.3) speedRanges['Lento (0.1 ≤ β < 0.3)']++;
            else if (beta < 0.5) speedRanges['Moderado (0.3 ≤ β < 0.5)']++;
            else if (beta < 0.7) speedRanges['Rápido (0.5 ≤ β < 0.7)']++;
            else if (beta < 0.9) speedRanges['Muito rápido (0.7 ≤ β < 0.9)']++;
            else speedRanges['Relativístico (β ≥ 0.9)']++;
        });
        
        console.log(`
⚡ FÍSICA RELATIVÍSTICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Nós Mais Rápidos (maior fator de Lorentz):
${relArray.slice(0, 5).map(([id, rel]) => {
    const concept = concepts.find(c => c.id === id);
    const speed = rel.velocity.length();
    const beta = speed / SPEED_OF_LIGHT;
    const percentC = (beta * 100).toFixed(1);
    const isNearLight = beta > 0.9 ? '⚡' : beta > 0.5 ? '🔥' : '✓';
    
    return `   ${concept?.name || id}:
      Velocidade: ${speed.toFixed(2)} unidades/s (${percentC}% da luz) ${isNearLight}
      β (v/c): ${beta.toFixed(3)}
      γ (Lorentz): ${rel.gamma.toFixed(3)}
      Tempo próprio: ${(rel.properTime / 1000).toFixed(2)}s`;
}).join('\n')}

📈 Estatísticas Globais:
   • Nós em movimento: ${totalMoving} / ${relativisticEffects.size}
   • γ médio: ${avgGamma.toFixed(3)}
   • β máximo: ${maxBeta.toFixed(3)} (${(maxBeta * 100).toFixed(1)}% da luz)

📊 Distribuição de Velocidades:
${Object.entries(speedRanges).map(([range, count]) => {
    const percentage = totalMoving > 0 ? (count / totalMoving * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.ceil(count / totalMoving * 20));
    return `   ${range}: ${count} (${percentage}%) ${bar}`;
}).join('\n')}

⚙️ Constantes Físicas:
   • Velocidade da luz (c): ${SPEED_OF_LIGHT} unidades/s
   • Velocidade máxima permitida: ${(SPEED_OF_LIGHT * 0.99).toFixed(2)} (99% c)
   • Fator de dilatação temporal: ${TIME_DILATION_FACTOR}
   • Restrições de cone de luz: ${lightConeConstraints.size} ativas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    entanglement: () => {
        if (quantumFields.size === 0) {
            console.log(`⚛️ Campos quânticos não inicializados...`);
            return;
        }
        
        const entangled = Array.from(quantumFields.entries())
            .filter(([_, field]) => field.entanglement.size > 0)
            .sort((a, b) => b[1].entanglement.size - a[1].entanglement.size);
        
        console.log(`
🔗 MAPA DE ENTRELAÇAMENTO QUÂNTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Nós Mais Entrelaçados:
${entangled.slice(0, 5).map(([id, field]) => {
    const concept = concepts.find(c => c.id === id);
    const topEntanglements = Array.from(field.entanglement.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    return `   ${concept?.name || id}:
      Total entrelaçado com: ${field.entanglement.size} nós
      Principais entrelaçamentos:
${topEntanglements.map(([eId, strength]) => {
    const eConcept = concepts.find(c => c.id === eId);
    return `        • ${eConcept?.name || eId}: ${(strength * 100).toFixed(1)}%`;
}).join('\n')}`;
}).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    waveFunction: () => {
        if (quantumFields.size === 0) {
            console.log(`⚛️ Campos quânticos não inicializados...`);
            return;
        }
        
        const randomNode = Array.from(quantumFields.entries())[0];
        const [id, field] = randomNode;
        const concept = concepts.find(c => c.id === id);
        
        console.log(`
🌊 FUNÇÃO DE ONDA (exemplo: ${concept?.name || id})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estados de superposição (${SUPERPOSITION_STATES} estados):
${field.waveFunction.map((state, idx) => 
    `   |ψ${idx}⟩: A=${state.amplitude.toFixed(3)}, φ=${(state.phase / Math.PI).toFixed(2)}π`
).join('\n')}

🎲 Estado de spin: ${(field.spinState / Math.PI).toFixed(2)}π
🔢 Número quântico: ${field.quantumNumber}
💫 Coerência: ${(field.coherence * 100).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    decohere: () => {
        const avgCoherence = Array.from(quantumFields.values())
            .reduce((sum, field) => sum + field.coherence, 0) / quantumFields.size;
        
        const lowCoherence = Array.from(quantumFields.entries())
            .filter(([_, field]) => field.coherence < 0.5)
            .sort((a, b) => a[1].coherence - b[1].coherence);
        
        console.log(`
💨 ANÁLISE DE DECOERÊNCIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Coerência média do sistema: ${(avgCoherence * 100).toFixed(1)}%
⚠️ Nós com baixa coerência (<50%): ${lowCoherence.length}

${lowCoherence.length > 0 ? `
Nós mais decoerentes:
${lowCoherence.slice(0, 5).map(([id, field]) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${concept?.name || id}: ${(field.coherence * 100).toFixed(1)}%`;
}).join('\n')}` : '✨ Todos os nós mantêm boa coerência quântica!'}

⚙️ Taxa de decoerência: ${DECOHERENCE_RATE}/frame

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    coherenceAnalysis: () => {
        // Correlação entre coerência e entrelaçamentos
        const data = Array.from(quantumFields.entries()).map(([id, field]) => {
            const concept = concepts.find(c => c.id === id);
            const connections = getConceptConnections(id).length;
            
            // Calcular distância média aos vizinhos
            const node = nodes.find(n => n.userData.id === id);
            const neighbors = getConceptConnections(id);
            let avgDistance = 0;
            if (neighbors.length > 0 && node) {
                const distances = neighbors.map(connId => {
                    const connNode = nodes.find(n => n.userData.id === connId);
                    return connNode ? node.position.distanceTo(connNode.position) : 0;
                }).filter(d => d > 0);
                avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
            }
            
            return {
                name: concept?.name || id,
                coherence: field.coherence,
                entanglements: field.entanglement.size,
                connections: connections,
                avgDistance: avgDistance
            };
        });
        
        const lowCoherence = data.filter(d => d.coherence < 0.5).sort((a, b) => a.coherence - b.coherence);
        const highCoherence = data.filter(d => d.coherence >= 0.9).sort((a, b) => b.coherence - a.coherence);
        
        console.log(`
🔬 CORRELAÇÃO: COERÊNCIA × ENTRELAÇAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📉 Top 5 Baixa Coerência (<50%):
${lowCoherence.slice(0, 5).map(d => 
    `   ${d.name}
      Coerência: ${(d.coherence * 100).toFixed(1)}%
      Entrelaçamentos: ${d.entanglements} / ${d.connections} conexões (${((d.entanglements/d.connections)*100).toFixed(1)}%)
      Distância média aos vizinhos: ${d.avgDistance.toFixed(1)}`
).join('\n')}

📈 Top 5 Alta Coerência (≥90%):
${highCoherence.slice(0, 5).map(d => 
    `   ${d.name}
      Coerência: ${(d.coherence * 100).toFixed(1)}%
      Entrelaçamentos: ${d.entanglements} / ${d.connections} conexões (${((d.entanglements/d.connections)*100).toFixed(1)}%)
      Distância média aos vizinhos: ${d.avgDistance.toFixed(1)}`
).join('\n')}

💡 Hipótese: Proximidade espacial → Entrelaçamento → Coerência
⚙️ Alcance de entrelaçamento: ${ENTANGLEMENT_RANGE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    pageRank: () => {
        if (topologyMetrics.size === 0) {
            console.log(`⏳ Execute rizoma.topology() primeiro...`);
            return;
        }
        
        const ranked = Array.from(topologyMetrics.entries())
            .sort((a, b) => (b[1].pageRank || 0) - (a[1].pageRank || 0));
        
        console.log(`
🏆 RANKING PAGERANK (Top 15)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ranked.slice(0, 15).map(([id, metrics], idx) => {
    const concept = concepts.find(c => c.id === id);
    const stars = '★'.repeat(Math.min(5, Math.floor(metrics.pageRank * 10000)));
    return `   ${String(idx + 1).padStart(2)}. ${concept?.name || id}
       ${stars} ${(metrics.pageRank * 1000).toFixed(3)}`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    communities: () => {
        if (communityStructure.size === 0) {
            console.log(`⏳ Comunidades sendo detectadas...`);
            return;
        }
        
        const commMap = new Map<number, string[]>();
        communityStructure.forEach((comm, id) => {
            if (!commMap.has(comm)) commMap.set(comm, []);
            const concept = concepts.find(c => c.id === id);
            if (concept) commMap.get(comm)?.push(concept.name);
        });
        
        const sortedComm = Array.from(commMap.entries())
            .sort((a, b) => b[1].length - a[1].length);
        
        console.log(`
🏘️ COMUNIDADES DETECTADAS (Louvain)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total de comunidades: ${commMap.size}

Maiores comunidades:
${sortedComm.slice(0, 5).map(([commId, members]) => {
    return `   Comunidade ${commId}: ${members.length} membros
      ${members.slice(0, 5).join(', ')}${members.length > 5 ? '...' : ''}`;
}).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    centrality: () => {
        if (topologyMetrics.size === 0) {
            console.log(`⏳ Execute rizoma.topology() primeiro...`);
            return;
        }
        
        const byBetweenness = Array.from(topologyMetrics.entries())
            .sort((a, b) => b[1].betweenness - a[1].betweenness);
        
        const byCloseness = Array.from(topologyMetrics.entries())
            .sort((a, b) => b[1].closeness - a[1].closeness);
        
        console.log(`
📍 ANÁLISE DE CENTRALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌉 Top 5 por Betweenness (pontes/conectores):
${byBetweenness.slice(0, 5).map(([id, m], idx) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${idx + 1}. ${concept?.name || id}: ${m.betweenness.toFixed(1)}`;
}).join('\n')}

📍 Top 5 por Closeness (centralização):
${byCloseness.slice(0, 5).map(([id, m], idx) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${idx + 1}. ${concept?.name || id}: ${m.closeness.toFixed(4)}`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    networkFlow: () => {
        if (networkFlow.size === 0) {
            console.log(`⏳ Fluxo de rede não calculado ainda...`);
            return;
        }
        
        const flowArray = Array.from(networkFlow.entries())
            .sort((a, b) => b[1].magnitude - a[1].magnitude);
        
        console.log(`
🌊 FLUXO DE INFORMAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Nós com Maior Fluxo:
${flowArray.slice(0, 8).map(([id, flow]) => {
    const concept = concepts.find(c => c.id === id);
    return `   ${concept?.name || id}:
      Magnitude: ${flow.magnitude.toFixed(3)}
      Direção: (${flow.direction.x.toFixed(2)}, ${flow.direction.y.toFixed(2)}, ${flow.direction.z.toFixed(2)})`;
}).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    flowClusters: () => {
        if (networkFlow.size === 0) {
            console.log(`⏳ Fluxo de rede não calculado ainda...`);
            return;
        }
        
        // Agrupar por direção dominante
        const clusters = {
            vertical_up: [],      // y > 0.7
            vertical_down: [],    // y < -0.7
            horizontal_right: [], // x > 0.7
            horizontal_left: [],  // x < -0.7
            forward: [],          // z > 0.7
            backward: [],         // z < -0.7
            diagonal: []          // nenhum eixo dominante
        };
        
        networkFlow.forEach((flow, id) => {
            const concept = concepts.find(c => c.id === id);
            const name = concept?.name || id;
            const dir = flow.direction;
            const mag = flow.magnitude;
            
            const data = { name, magnitude: mag, direction: dir };
            
            // Classificar por direção dominante
            if (Math.abs(dir.y) > 0.7) {
                if (dir.y > 0) clusters.vertical_up.push(data);
                else clusters.vertical_down.push(data);
            } else if (Math.abs(dir.x) > 0.7) {
                if (dir.x > 0) clusters.horizontal_right.push(data);
                else clusters.horizontal_left.push(data);
            } else if (Math.abs(dir.z) > 0.7) {
                if (dir.z > 0) clusters.forward.push(data);
                else clusters.backward.push(data);
            } else {
                clusters.diagonal.push(data);
            }
        });
        
        // Ordenar por magnitude
        Object.keys(clusters).forEach(key => {
            clusters[key].sort((a, b) => b.magnitude - a.magnitude);
        });
        
        console.log(`
🧭 CLUSTERS DE FLUXO DIRECIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬆️ FLUXO VERTICAL ASCENDENTE (↑ y > 0.7):
   ${clusters.vertical_up.length} conceitos
${clusters.vertical_up.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

⬇️ FLUXO VERTICAL DESCENDENTE (↓ y < -0.7):
   ${clusters.vertical_down.length} conceitos
${clusters.vertical_down.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

➡️ FLUXO HORIZONTAL DIREITA (→ x > 0.7):
   ${clusters.horizontal_right.length} conceitos
${clusters.horizontal_right.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

⬅️ FLUXO HORIZONTAL ESQUERDA (← x < -0.7):
   ${clusters.horizontal_left.length} conceitos
${clusters.horizontal_left.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

⤴️ FLUXO PARA FRENTE (↗ z > 0.7):
   ${clusters.forward.length} conceitos
${clusters.forward.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

⤵️ FLUXO PARA TRÁS (↙ z < -0.7):
   ${clusters.backward.length} conceitos
${clusters.backward.slice(0, 5).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)})`
).join('\n') || '   (nenhum)'}

🌀 FLUXO DIAGONAL/COMPLEXO (nenhum eixo > 0.7):
   ${clusters.diagonal.length} conceitos
${clusters.diagonal.slice(0, 8).map(d => 
    `   • ${d.name} (${d.magnitude.toFixed(3)}) → (${d.direction.x.toFixed(2)}, ${d.direction.y.toFixed(2)}, ${d.direction.z.toFixed(2)})`
).join('\n')}

💡 Conceitos com mesma direção formam correntes de pensamento!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    gravity: () => {
        if (topologyMetrics.size === 0) {
            console.log(`⏳ Aguardando cálculo de métricas topológicas...`);
            return;
        }
        
        // Coletar dados de raio e importância
        const gravityData = nodes.map(node => {
            const id = node.userData.id;
            const metrics = topologyMetrics.get(id);
            const concept = concepts.find(c => c.id === id);
            
            return {
                name: concept?.name || id,
                importance: node.userData.importance || 0,
                currentRadius: node.position.length(),
                targetRadius: node.userData.targetRadius || SPHERE_RADIUS,
                pageRank: metrics?.pageRank || 0,
                degree: metrics?.degree || 0
            };
        }).sort((a, b) => a.currentRadius - b.currentRadius);
        
        // Camadas ajustadas para o sistema radial (250-340)
        const innerCore = gravityData.filter(d => d.currentRadius < 270);  // Próximos ao centro
        const middleLayer = gravityData.filter(d => d.currentRadius >= 270 && d.currentRadius < 300);
        const outerShell = gravityData.filter(d => d.currentRadius >= 300);  // Hubs escapando
        
        const avgRadius = gravityData.reduce((sum, d) => sum + d.currentRadius, 0) / gravityData.length;
        const avgImportance = gravityData.reduce((sum, d) => sum + d.importance, 0) / gravityData.length;
        
        console.log(`
🌍 GRAVITAÇÃO RADIAL HIERÁRQUICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Distribuição por Camada Radial:
   • Núcleo Central (r < 270):      ${innerCore.length} nós (${((innerCore.length/gravityData.length)*100).toFixed(1)}%)
   • Camada Intermediária (270-300): ${middleLayer.length} nós (${((middleLayer.length/gravityData.length)*100).toFixed(1)}%)
   • Casca Externa (r > 300):        ${outerShell.length} nós (${((outerShell.length/gravityData.length)*100).toFixed(1)}%)

📈 Estatísticas:
   • Raio médio: ${avgRadius.toFixed(1)}
   • Importância média: ${(avgImportance * 100).toFixed(1)}%

🔥 Top 10 - Mais Próximos do Centro (maior importância):
${gravityData.slice(0, 10).map((d, idx) => {
    const stars = '★'.repeat(Math.min(5, Math.floor(d.pageRank * 50000)));
    const isConverging = d.currentRadius > d.targetRadius ? '↓' : d.currentRadius < d.targetRadius ? '↑' : '=';
    const direction = d.currentRadius > d.targetRadius ? 'DESCENDO' : d.currentRadius < d.targetRadius ? 'SUBINDO' : 'ESTÁVEL';
    
    return `   ${String(idx + 1).padStart(2)}. ${d.name}
       ${stars} (${direction} ${isConverging})
       Raio: ${d.currentRadius.toFixed(1)} → ${d.targetRadius.toFixed(1)}
       PageRank: ${(d.pageRank * 1000).toFixed(3)}
       Importância: ${(d.importance * 100).toFixed(1)}%
       Conexões: ${d.degree}`;
}).join('\n')}

⚙️ Configuração Gravitacional:
   • Raio da esfera visual: ${SPHERE_RADIUS}
   • Raio mínimo (super-hubs): ${MIN_HUB_RADIUS}
   • Raio máximo (periféricos): ${MAX_HUB_RADIUS}
   • Força gravitacional: ${HUB_GRAVITY_STRENGTH}

💡 Hubs importantes têm raios MENORES (descem ao centro)!
   Quanto maior o PageRank, menor o raio → atração gravitacional

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    },
    
    // Easter eggs
    matrix: () => {
        console.log(`
        ⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀
        ⠀⠀⠀⣿⡏⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⢹⣿⠀⠀⠀
        ⠀⠀⠀⣿⡇⠀⠀VOCÊ⠀ESTÁ⠀NO⠀RIZOMA⠀⠀⢸⣿⠀⠀⠀
        ⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀
        ⠀⠀⠀⠙⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠛⠋⠀⠀⠀
        
        🟢 Sistema: ONLINE
        🟢 Dimensões: 3D
        🟢 Conexões: ${relations.length} ativas
        🟢 Estado: Rizomático
        
        "Siga o conceito branco..." 🐰
        `);
        
        // Efeito matrix nos nós
        let iteration = 0;
        const matrixInterval = setInterval(() => {
            nodes.forEach(node => {
                const material = node.material as THREE.MeshStandardMaterial;
                material.color.setHex(Math.random() > 0.5 ? 0x00ff00 : 0x003300);
            });
            iteration++;
            if (iteration > 20) {
                clearInterval(matrixInterval);
                resetView();
                console.log(`🔄 Matriz resetada. Bem-vindo de volta à realidade!`);
            }
        }, 100);
    },
    
    disco: () => {
        console.log(`🪩 DISCO MODE ACTIVATED! Let's dance! 💃🕺`);
        
        let iteration = 0;
        const discoInterval = setInterval(() => {
            nodes.forEach(node => {
                const material = node.material as THREE.MeshStandardMaterial;
                material.color.setHSL(Math.random(), 1, 0.5);
                material.emissive.setHSL(Math.random(), 1, 0.3);
            });
            iteration++;
            if (iteration > 30) {
                clearInterval(discoInterval);
                resetView();
                console.log(`🎉 Festa encerrada! Foi divertido! 🎊`);
            }
        }, 150);
    },
    
    breathe: () => {
        console.log(`🫁 Iniciando respiração cósmica... Inspire... Expire... 🌬️`);
        
        let growing = true;
        let iteration = 0;
        const breatheInterval = setInterval(() => {
            const factor = growing ? 1.02 : 0.98;
            nodes.forEach(node => {
                node.scale.multiplyScalar(factor);
            });
            
            iteration++;
            if (iteration % 20 === 0) growing = !growing;
            
            if (iteration > 100) {
                clearInterval(breatheInterval);
                resetView();
                console.log(`😌 Namastê. Você está em paz com o rizoma.`);
            }
        }, 50);
    },
    
    constellation: () => {
        console.log(`✨ Transformando em constelação... 🌌`);
        
        nodes.forEach(node => {
            const material = node.material as THREE.MeshStandardMaterial;
            material.color.setHex(0xffffff);
            material.emissive.setHex(0xffffaa);
            material.emissiveIntensity = 0.8;
            node.scale.setScalar(0.3);
        });
        
        console.log(`
        ⭐ Constelação Rizomática ativada!
        
        "Somos feitos de poeira de estrelas... e relações!" ✨
        
        Use rizoma.reset() para voltar ao normal.
        `);
    }
};

// Expor API globalmente
(window as any).rizoma = rizoma;

// Mensagem de boas-vindas
console.log(`
%c🌐 RIZOMA TOOLKIT CARREGADO! 🌐%c

Digite %crizoma.info()%c para começar
ou %crizoma.help()%c para ver todos os comandos

✨ Explore, descubra, conecte! ✨
`, 
'font-size: 16px; font-weight: bold; color: #00ff88;',
'font-size: 12px;',
'font-weight: bold; color: #ffaa00;',
'font-size: 12px;',
'font-weight: bold; color: #ffaa00;',
'font-size: 12px;'
);

// ============================================================================
// INICIAR
// ============================================================================

window.addEventListener('load', init);
