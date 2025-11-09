/**
 * Funções utilitárias
 */

import * as THREE from 'three';

// ============================================================================
// TEMA
// ============================================================================

export function isLightTheme(): boolean {
  return document.body.classList.contains('light-theme');
}

export function getGlowColor(): number {
  return isLightTheme() ? 0x1a1a1a : 0xffffff;
}

export function getSceneBackground(): number {
  return isLightTheme() ? 0xf5f5f5 : 0x0a0a0a;
}

// ============================================================================
// CORES
// ============================================================================

/**
 * Interpola entre duas cores hexadecimais
 */
export function lerpColor(color1: number, color2: number, t: number): number {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  c1.lerp(c2, t);
  return c1.getHex();
}

/**
 * Clareia uma cor em direção ao branco
 */
export function lightenColor(color: number, amount: number): number {
  const c = new THREE.Color(color);
  c.lerp(new THREE.Color(0xffffff), amount);
  return c.getHex();
}

/**
 * Escurece uma cor em direção ao preto
 */
export function darkenColor(color: number, amount: number): number {
  const c = new THREE.Color(color);
  c.lerp(new THREE.Color(0x000000), amount);
  return c.getHex();
}

// ============================================================================
// MATEMÁTICA
// ============================================================================

/**
 * Clamp valor entre min e max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Mapeia valor de um range para outro
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ============================================================================
// GEOMETRIA
// ============================================================================

/**
 * Gera posição aleatória na superfície de uma esfera
 */
export function randomSpherePoint(radius: number): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

/**
 * Verifica se dois pontos estão muito próximos
 */
export function isTooClose(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3,
  minDistance: number
): boolean {
  return pos1.distanceTo(pos2) < minDistance;
}

// ============================================================================
// UI
// ============================================================================

/**
 * Mostra notificação temporária
 */
export function showNotification(message: string, duration: number = 2000): void {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.classList.add('visible');
  
  setTimeout(() => {
    notification.classList.remove('visible');
  }, duration);
}

/**
 * Formata número com separador de milhares
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================================================
// PERFORMANCE
// ============================================================================

/**
 * Detecta se é dispositivo de baixo desempenho
 */
export function isLowEndDevice(): boolean {
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  return false;
}

/**
 * Calcula FPS médio de um histórico
 */
export function calculateAverageFPS(fpsHistory: number[]): number {
  if (fpsHistory.length === 0) return 60;
  const sum = fpsHistory.reduce((a, b) => a + b, 0);
  return sum / fpsHistory.length;
}

// ============================================================================
// DOM
// ============================================================================

/**
 * Obtém elemento DOM com verificação de tipo
 */
export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

/**
 * Obtém elemento DOM ou retorna null
 */
export function getElementOrNull<T extends HTMLElement>(id: string): T | null {
  const element = document.getElementById(id);
  return element as T | null;
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Verifica se valor é Layer válida
 */
export function isValidLayer(value: string): boolean {
  const validLayers = [
    'fundacional',
    'ontologica',
    'epistemologica',
    'ecologica-material',
    'politica',
    'pedagogica',
    'indigena-comunitaria',
    'temporal',
    'pratica-institucional'
  ];
  return validLayers.includes(value);
}
