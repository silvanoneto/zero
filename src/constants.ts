/**
 * Constantes globais do Rizoma
 */

// ============================================================================
// OPACIDADES - Sistema de vidro colorizado
// ============================================================================

export const SELECTED_OPACITY = 1.0;      // Totalmente opaco quando selecionado
export const CONNECTED_OPACITY_L1 = 0.9;  // Nível 1 - bem opaco
export const CONNECTED_OPACITY_L2 = 0.85; // Nível 2 - levemente transparente
export const CONNECTED_OPACITY_L3 = 0.8;  // Nível 3 - mais transparente
export const BASE_OPACITY = 0.7;          // Estado base - vidro semi-transparente
export const DIMMED_OPACITY = 0.2;        // Nós distantes - muito transparentes

// ============================================================================
// GEOMETRIA DOS NÓS
// ============================================================================

export const NODE_RADIUS = 1.5;
export const NODE_SEGMENTS = 32;

// ============================================================================
// LINHAS
// ============================================================================

export const LINE_RADIUS = 0.5;
export const LINE_RADIAL_SEGMENTS = 8;
export const LINE_HEIGHT_SEGMENTS = 1;
export const GRADIENT_SEGMENTS = 20; // Segmentos para gradiente suave

// ============================================================================
// ANIMAÇÃO
// ============================================================================

export const DEFAULT_ANIMATION_SPEED = 1.0;
export const DEFAULT_ROTATION_SPEED = 0.001;
export const DRAG_THRESHOLD_PIXELS = 5;
export const AUTO_ROTATE_DELAY_MS = 3000;
export const ANIMATION_THROTTLE_MS = 16; // ~60fps

// ============================================================================
// PERFORMANCE
// ============================================================================

export const LOW_END_CPU_CORES = 4;
export const FPS_HISTORY_SIZE = 60;
export const TARGET_FPS = 60;

// ============================================================================
// CÂMERA
// ============================================================================

export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_INITIAL_Z = 50;
export const CAMERA_MIN_DISTANCE = 20;
export const CAMERA_MAX_DISTANCE = 150;

// ============================================================================
// CONTROLES
// ============================================================================

export const CONTROLS_DAMPING_FACTOR = 0.05;

// ============================================================================
// ILUMINAÇÃO
// ============================================================================

export const AMBIENT_LIGHT_INTENSITY_DARK = 0.4;
export const AMBIENT_LIGHT_INTENSITY_LIGHT = 0.8;
export const DIRECTIONAL_LIGHT_INTENSITY_DARK = 0.6;
export const DIRECTIONAL_LIGHT_INTENSITY_LIGHT = 0.5;

// ============================================================================
// CORES
// ============================================================================

export const SCENE_BG_DARK = 0x0a0a0a;
export const SCENE_BG_LIGHT = 0xf5f5f5;
export const GLOW_COLOR_DARK = 0xffffff;
export const GLOW_COLOR_LIGHT = 0x1a1a1a;

// ============================================================================
// MATERIAL - Propriedades de vidro
// ============================================================================

export const MATERIAL_METALNESS = 0.1;
export const MATERIAL_ROUGHNESS = 0.1;
export const MATERIAL_TRANSMISSION = 0.3;
export const MATERIAL_THICKNESS = 0.5;
export const MATERIAL_CLEARCOAT = 1.0;
export const MATERIAL_CLEARCOAT_ROUGHNESS = 0.1;
export const MATERIAL_IOR = 1.5;
export const MATERIAL_REFLECTIVITY = 0.5;

// ============================================================================
// NOMES DE CAMADAS
// ============================================================================

export const LAYER_NAMES: Record<string, string> = {
  // Camadas base
  'fundacional': 'Fundacional',
  'ontologica': 'Ontológica',
  'epistemica': 'Epistêmica',
  'politica': 'Política',
  'pratica': 'Prática',
  'ecologica': 'Ecológica',
  'temporal': 'Temporal',
  'etica': 'Ética',
  
  // Subcamadas ontologica (variações cromáticas)
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
