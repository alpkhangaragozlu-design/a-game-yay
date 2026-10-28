import * as THREE from 'three';
import { BlockType } from './types';
import { BLOCK_DEFINITIONS, getBlockTexture } from './blocks';

export const CHUNK_WIDTH = 16;
export const CHUNK_DEPTH = 16;
export const CHUNK_HEIGHT = 32;

// Directions for 6 faces: [dx, dy, dz, faceName]
// 0: +X (Right)
// 1: -X (Left)
// 2: +Y (Top)
// 3: -Y (Bottom)
// 4: +Z (Front)
// 5: -Z (Back)
const NEIGHBOR_OFFSETS: [number, number, number, 'top' | 'side' | 'bottom'][] = [
  [1, 0, 0, 'side'],   // +X right
  [-1, 0, 0, 'side'],  // -X left
  [0, 1, 0, 'top'],    // +Y top
  [0, -1, 0, 'bottom'],// -Y bottom
  [0, 0, 1, 'side'],   // +Z front
  [0, 0, -1, 'side'],  // -Z back
];

// Face vertex offsets (two triangles = 6 vertices per face)
const FACE_VERTICES = [
  // +X
  [
    [1, 0, 0], [1, 1, 0], [1, 1, 1],
    [1, 0, 0], [1, 1, 1], [1, 0, 1]
  ],
  // -X
  [
    [0, 0, 1], [0, 1, 1], [0, 1, 0],
    [0, 0, 1], [0, 1, 0], [0, 0, 0]
  ],
  // +Y (Top)
  [
    [0, 1, 0], [0, 1, 1], [1, 1, 1],
    [0, 1, 0], [1, 1, 1], [1, 1, 0]
  ],
  // -Y (Bottom)
  [
    [0, 0, 1], [0, 0, 0], [1, 0, 0],
    [0, 0, 1], [1, 0, 0], [1, 0, 1]
  ],
  // +Z (Front)
  [
    [1, 0, 1], [1, 1, 1], [0, 1, 1],
    [1, 0, 1], [0, 1, 1], [0, 0, 1]
  ],
  // -Z (Back)
  [
    [0, 0, 0], [0, 1, 0], [1, 1, 0],
    [0, 0, 0], [1, 1, 0], [1, 0, 0]
  ]
];

const FACE_NORMALS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

const FACE_UVS = [
  [0, 0], [0, 1], [1, 1],
  [0, 0], [1, 1], [1, 0]
];

export class Chunk {
  public chunkX: number;
  public chunkZ: number;
  public voxels: Uint8Array;
  public isDirty: boolean = true;
  public group: THREE.Group;
  private opaqueMesh?: THREE.Mesh;
  private transparentMesh?: THREE.Mesh;

  constructor(chunkX: number, chunkZ: number) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.voxels = new Uint8Array(CHUNK_WIDTH * CHUNK_DEPTH * CHUNK_HEIGHT);
    this.group = new THREE.Group();
    this.group.name = `Chunk_${chunkX}_${chunkZ}`;
    this.group.position.set(chunkX * CHUNK_WIDTH, 0, chunkZ * CHUNK_DEPTH);
  }

  public getIndex(x: number, y: number, z: number): number {
    return x + z * CHUNK_WIDTH + y * (CHUNK_WIDTH * CHUNK_DEPTH);
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) {
      return BlockType.AIR;
    }
    return this.voxels[this.getIndex(x, y, z)];
  }

  public setBlock(x: number, y: number, z: number, type: BlockType): void {
    if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_DEPTH || y < 0 || y >= CHUNK_HEIGHT) {
      return;
    }
    this.voxels[this.getIndex(x, y, z)] = type;
    this.isDirty = true;
  }

  // Generate meshes with face-culling and texture atlas or multi-material
  public buildMesh(getNeighborBlock: (worldX: number, y: number, worldZ: number) => BlockType, sharedAtlasMaterial: THREE.Material, sharedTransMaterial: THREE.Material): void {
    if (!this.isDirty) return;

    // Remove old meshes
    if (this.opaqueMesh) {
      this.group.remove(this.opaqueMesh);
      this.opaqueMesh.geometry.dispose();
      this.opaqueMesh = undefined;
    }
    if (this.transparentMesh) {
      this.group.remove(this.transparentMesh);
      this.transparentMesh.geometry.dispose();
      this.transparentMesh = undefined;
    }

    const opaquePositions: number[] = [];
    const opaqueNormals: number[] = [];
    const opaqueUvs: number[] = [];
    const opaqueColors: number[] = [];

    const transPositions: number[] = [];
    const transNormals: number[] = [];
    const transUvs: number[] = [];
    const transColors: number[] = [];

    const baseWorldX = this.chunkX * CHUNK_WIDTH;
    const baseWorldZ = this.chunkZ * CHUNK_DEPTH;

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_DEPTH; z++) {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
          const block = this.getBlock(x, y, z);
          if (block === BlockType.AIR) continue;

          const def = BLOCK_DEFINITIONS[block];
          const isTransparentBlock = def.transparent || block === BlockType.WATER || block === BlockType.GLASS || block === BlockType.OAK_LEAVES;

          // Check each of the 6 faces
          for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
            const [dx, dy, dz] = NEIGHBOR_OFFSETS[faceIdx];
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            let neighborBlock: BlockType;
            if (nx >= 0 && nx < CHUNK_WIDTH && nz >= 0 && nz < CHUNK_DEPTH && ny >= 0 && ny < CHUNK_HEIGHT) {
              neighborBlock = this.getBlock(nx, ny, nz);
            } else {
              neighborBlock = getNeighborBlock(baseWorldX + nx, ny, baseWorldZ + nz);
            }

            const neighborDef = BLOCK_DEFINITIONS[neighborBlock];
            // Render face if neighbor is air or transparent (and not same transparent type, e.g. water next to water)
            const shouldRenderFace =
              neighborBlock === BlockType.AIR ||
              (!isTransparentBlock && neighborDef.transparent) ||
              (isTransparentBlock && neighborDef.transparent && neighborBlock !== block);

            if (!shouldRenderFace) continue;

            const faceVerts = FACE_VERTICES[faceIdx];
            const faceNorm = FACE_NORMALS[faceIdx];

            // Ambient Occlusion / Face shading
            let shade = 1.0;
            if (faceIdx === 2) shade = 1.0; // Top
            else if (faceIdx === 3) shade = 0.55; // Bottom
            else if (faceIdx === 0 || faceIdx === 1) shade = 0.8; // Left/Right
            else shade = 0.7; // Front/Back

            // Base color tint
            const colorR = (block === BlockType.GRASS && faceIdx === 2) ? 0.45 : 1.0;
            const colorG = (block === BlockType.GRASS && faceIdx === 2) ? 0.85 : 1.0;
            const colorB = (block === BlockType.GRASS && faceIdx === 2) ? 0.35 : 1.0;

            const targetPos = isTransparentBlock ? transPositions : opaquePositions;
            const targetNorm = isTransparentBlock ? transNormals : opaqueNormals;
            const targetUvs = isTransparentBlock ? transUvs : opaqueUvs;
            const targetCol = isTransparentBlock ? transColors : opaqueColors;

            // Texture Atlas mapping coordinates (16 block rows x 16 cols)
            // We map block ID and face into UV space
            const faceType = NEIGHBOR_OFFSETS[faceIdx][3];
            const atlasCoords = getBlockAtlasCoords(block, faceType);

            for (let v = 0; v < 6; v++) {
              const vert = faceVerts[v];
              targetPos.push(x + vert[0], y + vert[1], z + vert[2]);
              targetNorm.push(faceNorm[0], faceNorm[1], faceNorm[2]);

              // UV calculation based on atlas coordinates
              const uOffset = atlasCoords.u;
              const vOffset = atlasCoords.v;
              const uSize = 1 / 16;
              const vSize = 1 / 16;
              const rawU = FACE_UVS[v][0];
              const rawV = FACE_UVS[v][1];

              targetUvs.push(uOffset + rawU * uSize, vOffset + (1 - rawV) * vSize);

              targetCol.push(colorR * shade, colorG * shade, colorB * shade);
            }
          }
        }
      }
    }

    if (opaquePositions.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(opaquePositions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(opaqueNormals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(opaqueUvs, 2));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(opaqueColors, 3));
      this.opaqueMesh = new THREE.Mesh(geo, sharedAtlasMaterial);
      this.opaqueMesh.castShadow = true;
      this.opaqueMesh.receiveShadow = true;
      this.group.add(this.opaqueMesh);
    }

    if (transPositions.length > 0) {
      const transGeo = new THREE.BufferGeometry();
      transGeo.setAttribute('position', new THREE.Float32BufferAttribute(transPositions, 3));
      transGeo.setAttribute('normal', new THREE.Float32BufferAttribute(transNormals, 3));
      transGeo.setAttribute('uv', new THREE.Float32BufferAttribute(transUvs, 2));
      transGeo.setAttribute('color', new THREE.Float32BufferAttribute(transColors, 3));
      this.transparentMesh = new THREE.Mesh(transGeo, sharedTransMaterial);
      this.transparentMesh.renderOrder = 1;
      this.group.add(this.transparentMesh);
    }

    this.isDirty = false;
  }

  public dispose(): void {
    if (this.opaqueMesh) {
      this.group.remove(this.opaqueMesh);
      this.opaqueMesh.geometry.dispose();
    }
    if (this.transparentMesh) {
      this.group.remove(this.transparentMesh);
      this.transparentMesh.geometry.dispose();
    }
  }
}

// Generate a 256x256 Texture Atlas dynamically containing all block faces!
let cachedAtlasTexture: THREE.CanvasTexture | null = null;
const atlasIndexMap = new Map<string, { u: number; v: number }>();

export function getOrCreateTextureAtlas(): THREE.CanvasTexture {
  if (cachedAtlasTexture) return cachedAtlasTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const allBlocks = [
    BlockType.GRASS,
    BlockType.DIRT,
    BlockType.STONE,
    BlockType.COBBLESTONE,
    BlockType.OAK_LOG,
    BlockType.OAK_LEAVES,
    BlockType.OAK_PLANKS,
    BlockType.SAND,
    BlockType.GLASS,
    BlockType.BRICK,
    BlockType.DIAMOND_ORE,
    BlockType.GOLD_ORE,
    BlockType.COAL_ORE,
    BlockType.TNT,
    BlockType.BOOKSHELF,
    BlockType.BEDROCK,
    BlockType.WATER,
  ];

  let slot = 0;
  for (const block of allBlocks) {
    const faces: ('top' | 'side' | 'bottom')[] =
      block === BlockType.GRASS || block === BlockType.OAK_LOG
        ? ['top', 'side', 'bottom']
        : ['side'];

    for (const f of faces) {
      const tileX = slot % 16;
      const tileY = Math.floor(slot / 16);
      const subCanvas = getBlockTexture(block, f).image as HTMLCanvasElement;
      ctx.drawImage(subCanvas, tileX * 16, tileY * 16);

      atlasIndexMap.set(`${block}_${f}`, {
        u: tileX / 16,
        v: 1 - (tileY + 1) / 16, // Flip Y for WebGL UV coordinate convention
      });
      slot++;
    }
  }

  cachedAtlasTexture = new THREE.CanvasTexture(canvas);
  cachedAtlasTexture.magFilter = THREE.NearestFilter;
  cachedAtlasTexture.minFilter = THREE.NearestFilter;
  cachedAtlasTexture.generateMipmaps = false;
  cachedAtlasTexture.colorSpace = THREE.SRGBColorSpace;
  return cachedAtlasTexture;
}

function getBlockAtlasCoords(block: BlockType, face: 'top' | 'side' | 'bottom'): { u: number; v: number } {
  const directKey = `${block}_${face}`;
  if (atlasIndexMap.has(directKey)) {
    return atlasIndexMap.get(directKey)!;
  }
  const fallbackKey = `${block}_side`;
  if (atlasIndexMap.has(fallbackKey)) {
    return atlasIndexMap.get(fallbackKey)!;
  }
  return { u: 0, v: 0 };
}
