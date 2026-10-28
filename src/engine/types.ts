export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  COBBLESTONE = 4,
  OAK_LOG = 5,
  OAK_LEAVES = 6,
  OAK_PLANKS = 7,
  SAND = 8,
  GLASS = 9,
  BRICK = 10,
  DIAMOND_ORE = 11,
  GOLD_ORE = 12,
  COAL_ORE = 13,
  TNT = 14,
  BOOKSHELF = 15,
  BEDROCK = 16,
  WATER = 17,
}

export interface BlockConfig {
  id: BlockType;
  name: string;
  hardness: number; // seconds to break with hand
  transparent?: boolean;
  solid: boolean;
  color: string;
  sideColor?: string;
  topColor?: string;
  bottomColor?: string;
  textureCanvas?: HTMLCanvasElement;
  description: string;
}

export interface RaycastHit {
  hit: boolean;
  point: [number, number, number];
  normal: [number, number, number];
  blockPos: [number, number, number];
  adjacentPos: [number, number, number];
  blockType: BlockType;
  distance: number;
}

export interface UnityLog {
  id: string;
  type: 'log' | 'warning' | 'error';
  message: string;
  time: string;
  stack?: string;
}

export type UnityTool = 'hand' | 'move' | 'rotate' | 'scale' | 'rect';
export type EditorViewMode = 'game' | 'scene' | 'split';

export interface GameObject {
  id: string;
  name: string;
  active: boolean;
  tag: string;
  layer: string;
  isStatic: boolean;
  children?: GameObject[];
  components: UnityComponent[];
}

export interface UnityComponent {
  type: 'Transform' | 'Light' | 'CharacterController' | 'VoxelWorld' | 'Skybox' | 'MeshRenderer' | 'AudioListener';
  properties: Record<string, any>;
}

export interface EngineStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  loadedChunks: number;
  totalVoxels: number;
  playerPos: [number, number, number];
  timeOfDay: number;
}
