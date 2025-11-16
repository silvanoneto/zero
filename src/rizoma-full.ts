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
let clusterMetadata = null; // Metadados de clusters para visualização

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
// SISTEMA DE MOVIMENTO SOBRE A REDE (CAOS)
// ============================================================================
const nodeMovement = new Map(); // Map<nodeId, {targetNode, progress, speed}>
const WALK_SPEED = 0.006; // Velocidade aumentada - mais dinâmico
const MAX_VELOCITY = 5.0; // Velocidade máxima permitida
const PATH_CHANGE_INTERVAL = 2500; // Trocar de direção mais frequentemente

// FORÇAS RELACIONAIS - Sistema de gravitação conceitual
const REPULSION_FORCE = 5; // Repulsão muito suave - permite clusters densos
const REPULSION_DISTANCE = 50; // Distância mínima reduzida
const ATTRACTION_FORCE = 0.28; // Atração forte - puxa conectados para perto
const ATTRACTION_DISTANCE = 130; // Distância ótima compacta

// MOLAS RELACIONAIS - Vínculos elásticos entre conceitos (TENSIONALIDADE DOS FIOS)
const MIN_EDGE_LENGTH = 25; // Tensão mínima - permite maior compressão
const MAX_EDGE_LENGTH = 170; // Tensão máxima - limite mais rígido
const SPRING_STRENGTH = 0.20; // Elasticidade aumentada - molas mais responsivas
const SPRING_DAMPING = 0.88; // Amortecimento reduzido - movimento mais vivo
const DAMPING = 0.85; // Amortecimento geral reduzido - mais movimento orgânico

// COESÃO DE CAMADA - Atração adicional entre conceitos da mesma camada ontológica
const LAYER_COHESION = 0.12; // Força de coesão aumentada - camadas mais coesas
const LAYER_COHESION_DISTANCE = 170; // Distância reduzida - coesão mais próxima

let lastPathChange = 0;
let repulsionCounter = 0; // Contador para aplicar repulsão com menos frequência

// NORMALIZAÇÃO DE PESO (para repulsão entre 0 e 1)
let minConnections = Infinity;
let maxConnections = 0;

// CORES POR CAMADA
const LAYER_COLORS = {
    'ontologica': 0x66ccff,    // Azul claro
    'politica': 0xff6666,      // Vermelho
    'pratica': 0x99ccff,       // Azul mais claro
    'fundacional': 0x9966ff,   // Roxo
    'epistemica': 0xff9966,    // Laranja
    'ecologica': 0x66ff99,     // Verde
    'temporal': 0xcccccc,      // Cinza
    'etica': 0xffff66          // Amarelo
};

/**
 * Obtém a cor de um conceito baseado na sua camada
 */
function getColorForLayer(layer: string): number {
    // Usar cores dos cluster metadata se disponíveis
    if (clusterMetadata?.layer_clusters?.[layer]?.color) {
        return parseInt(clusterMetadata.layer_clusters[layer].color.replace('#', '0x'));
    }
    // Fallback para cores estáticas
    return LAYER_COLORS[layer] || 0xffffff; // Branco como fallback
}

/**
 * Verifica se um conceito é um hub (nó central) dentro de seu cluster
 */
function isHub(conceptId: string, layer: string): boolean {
    if (!clusterMetadata?.layer_clusters?.[layer]?.hubs) return false;
    return clusterMetadata.layer_clusters[layer].hubs.some(hub => hub.id === conceptId);
}

/**
 * Verifica se um conceito é uma ponte (bridge) entre camadas
 */
function isBridge(conceptId: string): boolean {
    if (!clusterMetadata?.bridges) return false;
    return clusterMetadata.bridges.some(bridge => bridge.id === conceptId);
}

/**
 * Obtém o cluster score de um conceito (para dimensionamento de hubs)
 */
function getClusterScore(conceptId: string, layer: string): number {
    if (!clusterMetadata?.layer_clusters?.[layer]?.hubs) return 0;
    const hub = clusterMetadata.layer_clusters[layer].hubs.find(h => h.id === conceptId);
    return hub?.cluster_score || 0;
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
    } catch (error) {
        console.error('❌ Erro ao carregar assets/relations.json:', error);
        // Relações são opcionais, então não bloqueia o app
        relations = [];
    }
}

async function loadClusterMetadata() {
    try {
        const response = await fetch('assets/cluster_metadata.json');
        clusterMetadata = await response.json();
    } catch (error) {
        console.error('❌ Erro ao carregar assets/cluster_metadata.json:', error);
        // Cluster metadata é opcional para retrocompatibilidade
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
    
    // Encontrar o conceito com mais conexões
    const targetConcept = concepts.reduce((prev, current) => 
        (current.connections.length > prev.connections.length) ? current : prev
    );
    
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
    renderer.toneMappingExposure = 2.2; // Exposição alta para cores vibrantes
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

    // Adicionar luzes (MeshPhysicalMaterial precisa de iluminação adequada)
    const ambientLight = new THREE.AmbientLight(isLight ? 0xffffff : 0x404040, isLight ? 0.6 : 0.4);
    scene.add(ambientLight);

    // Luzes direcionais para melhor iluminação dos materiais físicos
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x8080ff, 0.4);
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
        
        // Ajustar baseado na densidade do cluster (se disponível)
        let densityFactor = 1.0;
        if (clusterMetadata?.layer_clusters?.[layer]?.density) {
            const density = clusterMetadata.layer_clusters[layer].density;
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
            // Interpolar entre posição calculada e projeção perfeita (90% projeção, 10% liberdade)
            const normalizedX = (x / currentLength) * targetLength;
            const normalizedY = (y / currentLength) * targetLength;
            const normalizedZ = (z / currentLength) * targetLength;
            
            const blend = 0.9; // 90% de aderência à esfera
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
        
        // Ajustar tamanho baseado em status de hub (hubs são maiores)
        const baseScale = 1.0;
        const hubScale = hubStatus ? 1.0 + (clusterScore * 0.5) : 1.0; // Até 50% maior para hubs fortes
        const nodeScale = baseScale * hubScale;
        
        // Ajustar emissividade para hubs (mais brilhantes)
        const emissiveIntensity = hubStatus ? 0.4 : 0.2;
        
        // Material tipo vidro colorizado - transparente e reflexivo
        // Temporariamente usando MeshStandardMaterial para melhor compatibilidade
        const material = new THREE.MeshStandardMaterial({
            color: nodeColor,
            metalness: 0.2,
            roughness: 0.3,
            transparent: true,
            opacity: BASE_OPACITY,
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
    const baseRepulsion = 0.8; // Força base para máxima elasticidade
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
                
                // ATRATOR ESFÉRICO: Reprojetar na superfície (coesão do sistema)
                // Princípio cibernético: restrição global emerge ordem local
                const length = node.position.length();
                if (length > epsilon) {
                    node.position.normalize().multiplyScalar(radius);
                    
                    // Atualizar posição original (memória do sistema)
                    node.userData.originalPosition.copy(node.position);
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
        const connCount = node.userData.connections?.length || 0;
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
    
    concepts.forEach((concept) => {
        const sourceNode = nodes.find(n => n.userData.id === concept.id);
        
        concept.connections.forEach((connId) => {
            const targetNode = nodes.find(n => n.userData.id === connId);
            
            if (sourceNode && targetNode && concept.id < connId) {
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
                
                // Buscar nome da relação
                const relation = relations.find(r => 
                    (r.from === concept.id && r.to === connId) ||
                    (r.from === connId && r.to === concept.id)
                );
                
                line.userData = {
                    source: sourceNode,
                    target: targetNode,
                    from: concept.id,
                    to: connId,
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
 * PONDERADO: Considera o peso dos nós (número de conexões) para inércia
 * TENSIONALIDADE: Os fios do rizoma têm elasticidade própria e resistem a deformações
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
            const currentDistance = sourceNode.position.distanceTo(targetNode.position);
            const direction = new THREE.Vector3().subVectors(targetNode.position, sourceNode.position);
            
            let force = 0;
            
            // TENSÃO DE COMPRESSÃO: fio resiste quando comprimido (muito perto)
            if (currentDistance < MIN_EDGE_LENGTH && currentDistance > 0) {
                const compressionRatio = (MIN_EDGE_LENGTH - currentDistance) / MIN_EDGE_LENGTH;
                // Força não-linear: compressão severa gera força exponencialmente maior
                force = -(compressionRatio * compressionRatio * SPRING_STRENGTH * 2.5);
            }
            // TENSÃO DE ESTIRAMENTO: fio resiste quando esticado (muito longe)
            else if (currentDistance > MAX_EDGE_LENGTH) {
                const stretchRatio = (currentDistance - MAX_EDGE_LENGTH) / MAX_EDGE_LENGTH;
                // Força não-linear: estiramento severo gera força exponencialmente maior
                force = (stretchRatio * stretchRatio * SPRING_STRENGTH * 2.0);
            }
            // ZONA DE EQUILÍBRIO: pequena força de restauração para comprimento ideal
            else {
                // Comprimento ideal é a média entre min e max
                const idealLength = (MIN_EDGE_LENGTH + MAX_EDGE_LENGTH) / 2;
                const deviation = currentDistance - idealLength;
                // Força suave para buscar equilíbrio natural
                force = deviation * SPRING_STRENGTH * 0.3;
            }
            
            if (Math.abs(force) > 0.001) {
                direction.normalize().multiplyScalar(force);
                
                // Pesos dos nós (número de conexões)
                const sourceWeight = Math.max(1, sourceNode.userData.connections?.length || 1);
                const targetWeight = Math.max(1, targetNode.userData.connections?.length || 1);
                
                // Distribuir força inversamente proporcional ao peso (maior peso = menor movimento)
                // Simula inércia: nós com mais conexões são mais "pesados" e movem menos
                const totalWeight = sourceWeight + targetWeight;
                const sourceRatio = targetWeight / totalWeight; // Nó target mais pesado = source move mais
                const targetRatio = sourceWeight / totalWeight; // Nó source mais pesado = target move mais
                
                // Aplicar força proporcional aos pesos (Lei de Newton: F = ma, logo a = F/m)
                const sourceForce = springForces.get(sourceNode.userData.id);
                const targetForce = springForces.get(targetNode.userData.id);
                
                if (sourceForce) sourceForce.add(direction.clone().multiplyScalar(sourceRatio));
                if (targetForce) targetForce.sub(direction.clone().multiplyScalar(targetRatio));
            }
        }
    });
    
    // Aplicar forças acumuladas aos nós com amortecimento específico para molas
    nodes.forEach(node => {
        const force = springForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.01) {
            // Aplicar amortecimento específico para estabilizar oscilações
            force.multiplyScalar(SPRING_DAMPING);
            node.position.add(force);
            
            // Re-projetar na superfície esférica
            node.position.normalize().multiplyScalar(SPHERE_RADIUS);
        }
    });
}

/**
 * NOVA FUNÇÃO: Aplica força de ATRAÇÃO entre nós conectados
 * Conceitos relacionados se aproximam suavemente
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
            const currentDistance = sourceNode.position.distanceTo(targetNode.position);
            
            // Atração apenas se estiverem além da distância ótima
            if (currentDistance > ATTRACTION_DISTANCE) {
                const direction = new THREE.Vector3().subVectors(targetNode.position, sourceNode.position);
                const distanceRatio = (currentDistance - ATTRACTION_DISTANCE) / SPHERE_RADIUS;
                
                // Força aumenta com a distância (até um limite)
                const strength = ATTRACTION_FORCE * Math.min(distanceRatio, 1.0);
                direction.normalize().multiplyScalar(strength);
                
                // Aplicar atração mútua (ação e reação)
                const sourceForce = attractionForces.get(sourceNode.userData.id);
                const targetForce = attractionForces.get(targetNode.userData.id);
                
                if (sourceForce) sourceForce.add(direction);
                if (targetForce) targetForce.sub(direction);
            }
        }
    });
    
    // Aplicar forças de atração
    nodes.forEach(node => {
        const force = attractionForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.001) {
            node.position.add(force);
            
            // Re-projetar na superfície esférica
            node.position.normalize().multiplyScalar(SPHERE_RADIUS);
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
        centroid.normalize().multiplyScalar(SPHERE_RADIUS);
        
        // Aplicar força progressiva em direção ao centróide para cada nó da camada
        layerNodes.forEach(node => {
            const distance = node.position.distanceTo(centroid);
            
            // Força progressiva: quanto mais longe, mais forte a atração
            if (distance > LAYER_COHESION_DISTANCE) {
                const direction = new THREE.Vector3().subVectors(centroid, node.position);
                const distanceRatio = Math.min((distance - LAYER_COHESION_DISTANCE) / SPHERE_RADIUS, 1.0);
                
                // Força quadrática para aumentar efeito em distâncias maiores
                const strength = LAYER_COHESION * distanceRatio * distanceRatio * 1.5;
                direction.normalize().multiplyScalar(strength);
                
                const force = cohesionForces.get(node.userData.id);
                if (force) force.add(direction);
            } else if (distance < LAYER_COHESION_DISTANCE * 0.5) {
                // Repulsão suave se muito próximo ao centróide (evita colapso no centro)
                const direction = new THREE.Vector3().subVectors(node.position, centroid);
                const proximityRatio = 1.0 - (distance / (LAYER_COHESION_DISTANCE * 0.5));
                const strength = LAYER_COHESION * 0.3 * proximityRatio;
                direction.normalize().multiplyScalar(strength);
                
                const force = cohesionForces.get(node.userData.id);
                if (force) force.add(direction);
            }
        });
    });
    
    // Aplicar forças de coesão
    nodes.forEach(node => {
        const force = cohesionForces.get(node.userData.id);
        if (force && force.lengthSq() > 0.0001) {
            node.position.add(force);
            
            // Re-projetar na superfície esférica
            node.position.normalize().multiplyScalar(SPHERE_RADIUS);
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
    const nodeConnectionCount = node.userData.connections?.length || 0;
    const nodeWeightNormalized = normalizeConnectionWeight(nodeConnectionCount);
    
    // Otimização: limitar número de verificações
    for (let i = 0; i < allNodes.length && repulsionCount < 5; i++) {
        const otherNode = allNodes[i];
        if (otherNode === node) continue;
        
        const distance = node.position.distanceTo(otherNode.position);
        
        // Aplicar repulsão se estiver muito próximo
        if (distance < REPULSION_DISTANCE && distance > 0) {
            const direction = new THREE.Vector3().subVectors(node.position, otherNode.position);
            direction.normalize();
            
            // Peso normalizado do outro nó (0 a 1)
            const otherConnectionCount = otherNode.userData.connections?.length || 0;
            const otherWeightNormalized = normalizeConnectionWeight(otherConnectionCount);
            
            // Força combinada: média dos pesos normalizados
            // Varia de 0 (ambos têm mínimo de conexões) a 1 (ambos têm máximo)
            const combinedWeightNormalized = (nodeWeightNormalized + otherWeightNormalized) / 2;
            
            // Força de repulsão proporcional à distância e peso combinado
            // Multiplicador 0.5 para calibração (ajustar conforme necessário)
            const distanceFactor = (1 - distance / REPULSION_DISTANCE);
            const strength = REPULSION_FORCE * distanceFactor * (0.3 + combinedWeightNormalized * 0.7);
            direction.multiplyScalar(strength);
            
            repulsionForce.add(direction);
            repulsionCount++;
        }
    }
    
    // Aplicar força de repulsão (apenas se houver)
    if (repulsionForce.lengthSq() > 0.01) {
        node.position.add(repulsionForce);
        
        // Re-projetar na superfície esférica após aplicar repulsão
        node.position.normalize().multiplyScalar(SPHERE_RADIUS);
    }
}

/**
 * Inicializa movimento dos nós - cada nó escolhe um vizinho aleatório para caminhar
 */
function initializeNodeMovement() {
    nodes.forEach(node => {
        const connections = node.userData.connections || [];
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
            const connections = targetNode.userData.connections || [];
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
        
        // MOVIMENTO NA SUPERFÍCIE ESFÉRICA COM SUAVIZAÇÃO:
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
        
        // PROJETAR de volta para a superfície esférica
        // Normalizar e multiplicar pelo raio - isso garante que sempre fica na superfície
        const newPos = interpolatedPos.normalize().multiplyScalar(SPHERE_RADIUS);
        
        currentNode.position.copy(newPos);
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
    
    // 1. Força de ATRAÇÃO entre conceitos conectados (aproxima relacionados)
    applyAttractionForces(SPHERE_RADIUS);
    
    // 2. Força de MOLA nas arestas (mantém distâncias min/max)
    applyEdgeSpringForces(SPHERE_RADIUS);
    
    // 3. Força de COESÃO entre conceitos da mesma camada ontológica (agrupa por camada)
    // Aplicar apenas a cada 2 frames para performance
    if (frameCount % 2 === 0) {
        applyLayerCohesion(SPHERE_RADIUS);
    }
    
    // 4. Força de REPULSÃO entre não-conectados (evita sobreposição)
    // Aplicar apenas a cada 3 frames para performance
    if (frameCount % 3 === 0) {
        nodes.forEach(node => {
            applyRepulsionForces(node, nodes, SPHERE_RADIUS);
        });
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
        
        // Manter câmera olhando para o centro ou nó selecionado
        if (selectedNode && cameraLookAtTarget) {
            camera.lookAt(cameraLookAtTarget);
        } else {
            camera.lookAt(scene.position);
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
            
            // Linhas: animar apenas quando há seleção ativa
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
                        node.userData.label.visible = labelsVisible;
                    }
                });
            }
        }

        // Atualizar linhas (só quando necessário)
        if (hoveredNode !== null || selectedNode !== null || showAllConnections || selectedCards.size > 0) {
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
    
    lines.forEach(line => {
        const isActive = activeNodes.has(line.userData.source) ||
                        activeNodes.has(line.userData.target);

        if (isActive) {
            // Linhas ativas brilham muito mais
            if (!line.userData.isGlow) {
                line.material.opacity = activeOpacity;
            } else {
                line.material.opacity = activeGlowOpacity;
            }
            // Mostrar label da relação se existir
            if (line.userData.label) {
                line.userData.label.visible = true;
            }
        } else {
            // Resetar para opacidade base
            line.material.opacity = baseOpacity;
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
    const intersects = raycaster.intersectObjects(nodes);

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
            const connections = selectedNode.userData.connections || [];
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
            const connections = selectedNode.userData.connections || [];
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
                const layer = connectedConcept.camada || connectedConcept.layer;
                
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
        selectedNode.material.opacity = BASE_OPACITY; // Voltar para vidro
        selectedNode.scale.setScalar(selectedNode.userData.baseScale || 1); // Preservar escala de hub
        // Resetar nós conectados
        resetConnectedNodes(selectedNode);
        selectedNode = null;
    }
    
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
    const connectedIds = sourceNode.userData.connections || [];
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
        
        const secondaryIds = level1Node.userData.connections || [];
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
        
        const tertiaryIds = level2Node.userData.connections || [];
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
    
    // Resetar todos os nós para estado base
    nodes.forEach(node => {
        if (node !== selectedNode && node !== hoveredNode) {
            node.material.opacity = BASE_OPACITY; // Voltar para vidro semi-transparente
            node.scale.setScalar(node.userData.baseScale || 1.0); // Preservar escala de hub
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
                        (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
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
                    (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
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
    const connections = node.userData.connections || [];
    
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
    const icon = toggle.querySelector('.btn-icon');
    
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
                        // Apenas um nó está nas camadas ativas
                        line.visible = true;
                        const crossOpacity = isDark ? (line.userData.isGlow ? 0.05 : 0.08) : (line.userData.isGlow ? 0.15 : 0.2);
                        line.material.opacity = crossOpacity;
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
                const layerNames = {
                    'fundacional': 'Fundacional',
                    'ontologica': 'Ontológica',
                    'epistemologica': 'Epistemológica',
                    'politica': 'Política',
                    'pedagogica': 'Pedagógica',
                    'indigena-comunitaria': 'Indígena-Comunitária',
                    'ecologica-material': 'Ecológica-Material',
                    'temporal': 'Temporal',
                    'pratica-institucional': 'Prática-Institucional'
                };
                
                if (activeLayerFilters.size === 1) {
                    const layer = Array.from(activeLayerFilters)[0];
                    showNotification(`Camada: ${layerNames[layer]} (${count} conceitos)`);
                } else {
                    const selectedNames = Array.from(activeLayerFilters).map(l => layerNames[l]).join(', ');
                    showNotification(`${activeLayerFilters.size} camadas selecionadas (${count} conceitos)`);
                }
            }
        });
    });
}

// Atualizar contagens da legenda dinamicamente
function updateLegendCounts() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        const layer = item.dataset.layer;
        const countElement = item.querySelector('.legend-count');
        
        if (!countElement) return;
        
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
                return n.userData.connections.some(connId => visibleNodeIds.has(connId));
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
        b.connections.length - a.connections.length
    );
    
    conceptsToShow.forEach(concept => {
        const card = document.createElement('div');
        card.className = 'concept-card';
        card.style.setProperty('--card-color', '#' + concept.color.toString(16).padStart(6, '0'));
        
        // Buscar nomes de conexões usando o Map (O(1) vs O(n))
        const connectedNames = concept.connections
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
                (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
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
            (concept.connections || []).forEach(connId => allConnectedIds.add(connId));
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
        
        // Atualizar botão
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
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
        
        // Atualizar botão
        if (btnCards) {
            const icon = btnCards.querySelector('.btn-icon');
            const text = btnCards.querySelector('.btn-text');
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
    
    // Easter eggs / Funções secretas
    matrix(): void;
    disco(): void;
    breathe(): void;
    constellation(): void;
}

const rizoma: RizomaAPI = {
    info: () => {
        const uniqueLayers = [...new Set(concepts.map(c => c.camada || c.layer))];
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
            const uniqueLayers = [...new Set(concepts.map(c => c.camada || c.layer))];
            const layerStats = uniqueLayers.map(layer => {
                const count = concepts.filter(c => (c.camada || c.layer) === layer).length;
                const density = clusterMetadata?.layer_clusters?.[layer]?.density || 0;
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
            
            const layer = concept.camada || concept.layer;
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
            const layer = concept.camada || concept.layer;
            if (clusterMetadata?.layer_clusters?.[layer]?.hubs?.includes(concept.id)) {
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
        if (clusterMetadata?.bridges && clusterMetadata.bridges.length > 0) {
            const bridge = clusterMetadata.bridges[Math.floor(Math.random() * clusterMetadata.bridges.length)];
            const concept = concepts.find(c => c.id === bridge.id);
            if (concept) {
                console.log(`🌉 Ponte encontrada! Conecta ${bridge.layers_connected} camadas`);
                rizoma.goto(concept.name);
            }
        } else {
            console.log(`🤷 Nenhuma ponte identificada nos metadados.`);
        }
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
        
        const layer = concept.camada || concept.layer;
        
        // Contar conexões reais usando lines
        const connectionCount = lines.filter(line => 
            line.userData.from === concept.id || line.userData.to === concept.id
        ).length;
        
        const isHub = clusterMetadata?.layer_clusters?.[layer]?.hubs?.includes(concept.id);
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
        const uniqueLayers = [...new Set(concepts.map(c => c.camada || c.layer))];
        console.log(`
🎨 Camadas do Rizoma:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${uniqueLayers.map(layer => {
    const count = concepts.filter(c => (c.camada || c.layer) === layer).length;
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
        const uniqueLayers = [...new Set(concepts.map(c => c.camada || c.layer))];
        
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
