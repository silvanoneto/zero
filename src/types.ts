// Tipos para os dados do projeto
import * as THREE from 'three';

export interface Concept {
  id: string;
  name: string;
  description: string;
  layer: Layer;
  color: number | string;
}

export type Layer = 
  | 'fundacional'
  | 'ontologica'
  | 'epistemologica'
  | 'ecologica-material'
  | 'politica'
  | 'pedagogica'
  | 'indigena-comunitaria'
  | 'temporal'
  | 'pratica-institucional';

export interface Relation {
  from: string;
  to: string;
  name: string;
  description: string;
}

export interface NodeUserData {
  id: string;
  name: string;
  description: string;
  connections: string[];
  layer: Layer;
  color: number;
  label?: THREE.Sprite;
  innerLight?: THREE.PointLight;
  illuminated?: boolean;
}

export interface LineUserData {
  source: THREE.Mesh;
  target: THREE.Mesh;
  relationName: string;
  relationDescription: string;
  originalColor: number;
  isGlow?: boolean;
  label?: THREE.Sprite;
}

export type ViewMode = '3d' | 'cards';

export interface LayerNames {
  [key: string]: string;
}

export const LAYER_NAMES: LayerNames = {
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
