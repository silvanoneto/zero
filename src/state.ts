/**
 * Estado global da aplicação
 */

import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Concept, Relation, ViewMode, Layer } from './types';

// ============================================================================
// DADOS
// ============================================================================

export let concepts: Concept[] = [];
export let relations: Relation[] = [];

export function setConcepts(data: Concept[]): void {
  concepts = data;
}

export function setRelations(data: Relation[]): void {
  relations = data;
}

// ============================================================================
// THREE.JS
// ============================================================================

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let renderer: THREE.WebGLRenderer;
export let raycaster: THREE.Raycaster;
export let mouse: THREE.Vector2;
export let controls: OrbitControls;

export function initThreeState(
  sceneInstance: THREE.Scene,
  cameraInstance: THREE.PerspectiveCamera,
  rendererInstance: THREE.WebGLRenderer,
  raycasterInstance: THREE.Raycaster,
  mouseInstance: THREE.Vector2,
  controlsInstance: OrbitControls
): void {
  scene = sceneInstance;
  camera = cameraInstance;
  renderer = rendererInstance;
  raycaster = raycasterInstance;
  mouse = mouseInstance;
  controls = controlsInstance;
}

// ============================================================================
// NÓS E LINHAS
// ============================================================================

export let nodes: THREE.Mesh[] = [];
export let lines: THREE.Mesh[] = [];

export function addNode(node: THREE.Mesh): void {
  nodes.push(node);
}

export function addLine(line: THREE.Mesh): void {
  lines.push(line);
}

export function clearNodes(): void {
  nodes = [];
}

export function clearLines(): void {
  lines = [];
}

// ============================================================================
// SELEÇÃO E HOVER
// ============================================================================

export let selectedNode: THREE.Mesh | null = null;
export let hoveredNode: THREE.Mesh | null = null;
export let selectedCards: Set<string> = new Set();

export function setSelectedNode(node: THREE.Mesh | null): void {
  selectedNode = node;
}

export function setHoveredNode(node: THREE.Mesh | null): void {
  hoveredNode = node;
}

export function addSelectedCard(id: string): void {
  selectedCards.add(id);
}

export function removeSelectedCard(id: string): void {
  selectedCards.delete(id);
}

export function clearSelectedCards(): void {
  selectedCards.clear();
}

export function hasSelectedCard(id: string): boolean {
  return selectedCards.has(id);
}

// ============================================================================
// CONFIGURAÇÕES DE VISUALIZAÇÃO
// ============================================================================

export let viewMode: ViewMode = '3d';
export let showAllConnections: boolean = false;
export let labelsVisible: boolean = true;
export let performanceMode: boolean = false;

export function setViewMode(mode: ViewMode): void {
  viewMode = mode;
}

export function setShowAllConnections(show: boolean): void {
  showAllConnections = show;
}

export function setLabelsVisible(visible: boolean): void {
  labelsVisible = visible;
}

export function setPerformanceMode(enabled: boolean): void {
  performanceMode = enabled;
}

// ============================================================================
// ANIMAÇÃO
// ============================================================================

export let isAnimating: boolean = true;
export let autoRotate: boolean = true;
export let animationSpeed: number = 1.0;
export let rotationSpeed: number = 0.001;
export let pulseIntensity: number = 0.0;
export let rotationAngle: number = 0;

const randomAngle = Math.random() * Math.PI * 2;
export let rotationDirection = { 
  x: Math.cos(randomAngle), 
  z: Math.sin(randomAngle) 
};

export let cameraLookAtTarget: THREE.Vector3 | null = null;

export function setIsAnimating(animating: boolean): void {
  isAnimating = animating;
}

export function setAutoRotate(rotate: boolean): void {
  autoRotate = rotate;
}

export function setAnimationSpeed(speed: number): void {
  animationSpeed = speed;
}

export function setRotationSpeed(speed: number): void {
  rotationSpeed = speed;
}

export function setPulseIntensity(intensity: number): void {
  pulseIntensity = intensity;
}

export function setRotationAngle(angle: number): void {
  rotationAngle = angle;
}

export function setCameraLookAtTarget(target: THREE.Vector3 | null): void {
  cameraLookAtTarget = target;
}

// ============================================================================
// INTERAÇÃO
// ============================================================================

export let userInteracting: boolean = false;
export let autoRotateTimeout: number | null = null;
export let isDragging: boolean = false;
export let hasDragged: boolean = false;
export let mouseDownPosition = { x: 0, y: 0 };
export let previousMousePosition = { x: 0, y: 0 };

export function setUserInteracting(interacting: boolean): void {
  userInteracting = interacting;
}

export function setAutoRotateTimeout(timeout: number | null): void {
  autoRotateTimeout = timeout;
}

export function setIsDragging(dragging: boolean): void {
  isDragging = dragging;
}

export function setHasDragged(dragged: boolean): void {
  hasDragged = dragged;
}

export function setMouseDownPosition(x: number, y: number): void {
  mouseDownPosition = { x, y };
}

export function setPreviousMousePosition(x: number, y: number): void {
  previousMousePosition = { x, y };
}

// ============================================================================
// PERFORMANCE
// ============================================================================

export let lastAnimationTime: number = 0;
export let frameCount: number = 0;
export let fpsHistory: number[] = [];
export let lastFPSCheck: number = 0;

export function setLastAnimationTime(time: number): void {
  lastAnimationTime = time;
}

export function incrementFrameCount(): void {
  frameCount++;
}

export function resetFrameCount(): void {
  frameCount = 0;
}

export function addFPSToHistory(fps: number): void {
  fpsHistory.push(fps);
  if (fpsHistory.length > 60) {
    fpsHistory.shift();
  }
}

export function setLastFPSCheck(time: number): void {
  lastFPSCheck = time;
}

// ============================================================================
// FILTROS
// ============================================================================

export let activeLayerFilters: Set<Layer> = new Set();
export let activeConnectionFilter: string | null = null;

export function addLayerFilter(layer: Layer): void {
  activeLayerFilters.add(layer);
}

export function removeLayerFilter(layer: Layer): void {
  activeLayerFilters.delete(layer);
}

export function clearLayerFilters(): void {
  activeLayerFilters.clear();
}

export function hasLayerFilter(layer: Layer): boolean {
  return activeLayerFilters.has(layer);
}

export function getLayerFiltersArray(): Layer[] {
  return Array.from(activeLayerFilters);
}

export function setConnectionFilter(filter: string | null): void {
  activeConnectionFilter = filter;
}
