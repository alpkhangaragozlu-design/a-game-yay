import * as THREE from 'three';
import { BlockType, BlockConfig } from './types';

// Helper to create 16x16 pixel procedural canvas
export function createBlockTextureCanvas(blockType: BlockType, face: 'top' | 'side' | 'bottom' = 'side'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  // Pseudo-random deterministic noise based on seed and coords
  const pseudo = (x: number, y: number, seed = 42) => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  switch (blockType) {
    case BlockType.GRASS: {
      if (face === 'top') {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const v = pseudo(x, y, 1);
            const g = Math.floor(140 + v * 50);
            const r = Math.floor(70 + v * 30);
            const b = Math.floor(30 + v * 20);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      } else if (face === 'bottom') {
        // Dirt
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const v = pseudo(x, y, 2);
            const r = Math.floor(115 + v * 30);
            const g = Math.floor(75 + v * 25);
            const b = Math.floor(45 + v * 15);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      } else {
        // Side: Dirt with grass fringe at top
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const fringe = Math.floor(3 + pseudo(x, 0, 7) * 2.5);
            if (y < fringe) {
              const v = pseudo(x, y, 1);
              ctx.fillStyle = `rgb(${Math.floor(70 + v * 30)},${Math.floor(140 + v * 50)},${Math.floor(30 + v * 20)})`;
            } else {
              const v = pseudo(x, y, 2);
              ctx.fillStyle = `rgb(${Math.floor(115 + v * 30)},${Math.floor(75 + v * 25)},${Math.floor(45 + v * 15)})`;
            }
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      break;
    }

    case BlockType.DIRT: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 2);
          const r = Math.floor(115 + v * 30);
          const g = Math.floor(75 + v * 25);
          const b = Math.floor(45 + v * 15);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.STONE: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 3);
          const val = Math.floor(110 + v * 45);
          ctx.fillStyle = `rgb(${val},${val},${val})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.COBBLESTONE: {
      ctx.fillStyle = '#6e6e6e';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 4);
          const isBorder = (x % 4 === 0 && y % 3 === 0) || (x === 0 || y === 0 || x === 15 || y === 15);
          const shade = isBorder ? 60 + v * 25 : 110 + v * 55;
          ctx.fillStyle = `rgb(${Math.floor(shade)},${Math.floor(shade)},${Math.floor(shade)})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.OAK_LOG: {
      if (face === 'top' || face === 'bottom') {
        // Rings
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const dx = x - 7.5;
            const dy = y - 7.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 7) {
              ctx.fillStyle = '#5c3a21'; // Bark outer
            } else if (Math.sin(dist * 1.5) > 0.2) {
              ctx.fillStyle = '#d0a775';
            } else {
              ctx.fillStyle = '#b88f5d';
            }
            ctx.fillRect(x, y, 1, 1);
          }
        }
      } else {
        // Bark sides
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const v = pseudo(x, Math.floor(y / 2), 5);
            const r = Math.floor(95 + v * 40);
            const g = Math.floor(65 + v * 30);
            const b = Math.floor(35 + v * 20);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      break;
    }

    case BlockType.OAK_LEAVES: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 6);
          if (v < 0.15) {
            ctx.clearRect(x, y, 1, 1);
          } else {
            const g = Math.floor(130 + v * 60);
            const r = Math.floor(45 + v * 30);
            const b = Math.floor(25 + v * 15);
            ctx.fillStyle = `rgba(${r},${g},${b}, 0.95)`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      break;
    }

    case BlockType.OAK_PLANKS: {
      ctx.fillStyle = '#b88f5d';
      ctx.fillRect(0, 0, 16, 16);
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const plankIndex = Math.floor(y / 4);
          const isDivider = y % 4 === 3;
          const isPlankBreak = (plankIndex % 2 === 0 && x === 7) || (plankIndex % 2 === 1 && (x === 3 || x === 11));
          const v = pseudo(x, y, 8);
          if (isDivider || isPlankBreak) {
            ctx.fillStyle = '#6b4f2c';
          } else {
            const r = Math.floor(175 + v * 30);
            const g = Math.floor(135 + v * 25);
            const b = Math.floor(85 + v * 20);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.SAND: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 9);
          const r = Math.floor(215 + v * 30);
          const g = Math.floor(205 + v * 25);
          const b = Math.floor(155 + v * 20);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.GLASS: {
      ctx.clearRect(0, 0, 16, 16);
      ctx.strokeStyle = 'rgba(230, 245, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 15, 15);
      // Glare lines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(3, 4, 1, 2);
      ctx.fillRect(11, 11, 2, 2);
      break;
    }

    case BlockType.BRICK: {
      ctx.fillStyle = '#c5ccd0'; // mortar
      ctx.fillRect(0, 0, 16, 16);
      for (let row = 0; row < 4; row++) {
        const yOffset = row * 4;
        const shift = row % 2 === 0 ? 0 : 4;
        for (let col = 0; col < 3; col++) {
          const xOffset = (col * 8 + shift) % 16;
          for (let py = 0; py < 3; py++) {
            for (let px = 0; px < 7; px++) {
              const x = (xOffset + px) % 16;
              const y = yOffset + py;
              const v = pseudo(x, y, 10);
              const r = Math.floor(155 + v * 35);
              const g = Math.floor(60 + v * 20);
              const b = Math.floor(50 + v * 15);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
      break;
    }

    case BlockType.DIAMOND_ORE: {
      // Stone base
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 3);
          const val = Math.floor(110 + v * 40);
          ctx.fillStyle = `rgb(${val},${val},${val})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Diamond flecks
      const flecks = [[3, 4], [4, 4], [4, 5], [10, 2], [11, 3], [7, 9], [8, 9], [8, 10], [12, 11], [13, 12]];
      for (const [fx, fy] of flecks) {
        ctx.fillStyle = '#64f3e8';
        ctx.fillRect(fx, fy, 1, 1);
        ctx.fillStyle = '#d5fffc';
        ctx.fillRect(fx + 1, fy, 1, 1);
      }
      break;
    }

    case BlockType.GOLD_ORE: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 3);
          const val = Math.floor(110 + v * 40);
          ctx.fillStyle = `rgb(${val},${val},${val})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const flecks = [[2, 3], [3, 3], [4, 4], [9, 5], [10, 6], [6, 11], [7, 11], [11, 13], [12, 13]];
      for (const [fx, fy] of flecks) {
        ctx.fillStyle = '#f9d835';
        ctx.fillRect(fx, fy, 1, 1);
        ctx.fillStyle = '#fff4a3';
        ctx.fillRect(fx, fy + 1, 1, 1);
      }
      break;
    }

    case BlockType.COAL_ORE: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 3);
          const val = Math.floor(110 + v * 40);
          ctx.fillStyle = `rgb(${val},${val},${val})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      const flecks = [[3, 3], [4, 3], [4, 4], [9, 4], [10, 4], [6, 9], [7, 9], [7, 10], [11, 11], [12, 11]];
      for (const [fx, fy] of flecks) {
        ctx.fillStyle = '#262626';
        ctx.fillRect(fx, fy, 1, 1);
        ctx.fillStyle = '#3c3c3c';
        ctx.fillRect(fx + 1, fy, 1, 1);
      }
      break;
    }

    case BlockType.TNT: {
      if (face === 'top' || face === 'bottom') {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const dist = Math.abs(x - 7.5) + Math.abs(y - 7.5);
            ctx.fillStyle = dist < 3 ? '#333333' : '#b22222';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      } else {
        // Red with white band
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            if (y >= 6 && y <= 9) {
              ctx.fillStyle = '#ffffff';
            } else {
              const v = pseudo(x, y, 12);
              ctx.fillStyle = `rgb(${Math.floor(190 + v * 40)},30,20)`;
            }
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // "TNT" black font
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 5px monospace';
        ctx.fillText('TNT', 3, 10);
      }
      break;
    }

    case BlockType.BOOKSHELF: {
      if (face === 'top' || face === 'bottom') {
        return createBlockTextureCanvas(BlockType.OAK_PLANKS, face);
      }
      ctx.fillStyle = '#b88f5d'; // wood background
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#4a2f13'; // frame
      ctx.strokeRect(0.5, 0.5, 15, 15);
      ctx.fillRect(0, 7, 16, 2);
      // Row 1 books
      const colors = ['#8b2500', '#2e4a62', '#2f4f2f', '#cda851', '#7b1113'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(1 + i * 3, 1, 2, 6);
      }
      // Row 2 books
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = colors[(i + 2) % colors.length];
        ctx.fillRect(1 + i * 3, 9, 2, 6);
      }
      break;
    }

    case BlockType.BEDROCK: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 13);
          const val = Math.floor(v * 75);
          ctx.fillStyle = `rgb(${val},${val},${val})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    case BlockType.WATER: {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = pseudo(x, y, 14);
          const b = Math.floor(210 + v * 45);
          const g = Math.floor(100 + v * 30);
          ctx.fillStyle = `rgba(30,${g},${b}, 0.7)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }

    default:
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 0, 16, 16);
  }

  return canvas;
}

// Block Registry Configs
export const BLOCK_DEFINITIONS: Record<BlockType, BlockConfig> = {
  [BlockType.AIR]: {
    id: BlockType.AIR,
    name: 'Air',
    hardness: 0,
    transparent: true,
    solid: false,
    color: '#00000000',
    description: 'Empty space',
  },
  [BlockType.GRASS]: {
    id: BlockType.GRASS,
    name: 'Grass Block',
    hardness: 0.6,
    solid: true,
    color: '#5b8e3c',
    sideColor: '#7a5a3a',
    topColor: '#5b8e3c',
    bottomColor: '#7a5a3a',
    description: 'Top layer of soil supporting lush green vegetation',
  },
  [BlockType.DIRT]: {
    id: BlockType.DIRT,
    name: 'Dirt',
    hardness: 0.5,
    solid: true,
    color: '#7a5a3a',
    description: 'Fertile brown earth found beneath grass',
  },
  [BlockType.STONE]: {
    id: BlockType.STONE,
    name: 'Stone',
    hardness: 1.5,
    solid: true,
    color: '#7f7f7f',
    description: 'Standard rock forming the subterranean crust',
  },
  [BlockType.COBBLESTONE]: {
    id: BlockType.COBBLESTONE,
    name: 'Cobblestone',
    hardness: 2.0,
    solid: true,
    color: '#656565',
    description: 'Cracked, rough stone fragments bonded together',
  },
  [BlockType.OAK_LOG]: {
    id: BlockType.OAK_LOG,
    name: 'Oak Log',
    hardness: 1.8,
    solid: true,
    color: '#6f5235',
    sideColor: '#6f5235',
    topColor: '#bfa068',
    bottomColor: '#bfa068',
    description: 'Trunk of an oak tree, raw timber building material',
  },
  [BlockType.OAK_LEAVES]: {
    id: BlockType.OAK_LEAVES,
    name: 'Oak Leaves',
    hardness: 0.2,
    transparent: true,
    solid: true,
    color: '#387326',
    description: 'Foliage canopy of oak trees',
  },
  [BlockType.OAK_PLANKS]: {
    id: BlockType.OAK_PLANKS,
    name: 'Oak Planks',
    hardness: 1.5,
    solid: true,
    color: '#bfa068',
    description: 'Processed wood lumber used for crafting & building',
  },
  [BlockType.SAND]: {
    id: BlockType.SAND,
    name: 'Sand',
    hardness: 0.5,
    solid: true,
    color: '#d9cd9b',
    description: 'Granular sedimentary block found near beaches and deserts',
  },
  [BlockType.GLASS]: {
    id: BlockType.GLASS,
    name: 'Glass',
    hardness: 0.3,
    transparent: true,
    solid: true,
    color: '#c2e7ff88',
    description: 'Transparent silica pane allowing sunlight through',
  },
  [BlockType.BRICK]: {
    id: BlockType.BRICK,
    name: 'Bricks',
    hardness: 2.0,
    solid: true,
    color: '#984335',
    description: 'Hardened clay building bricks aligned in courses',
  },
  [BlockType.DIAMOND_ORE]: {
    id: BlockType.DIAMOND_ORE,
    name: 'Diamond Ore',
    hardness: 3.0,
    solid: true,
    color: '#5be8dd',
    description: 'Extremely rare geological deposit bearing brilliant gems',
  },
  [BlockType.GOLD_ORE]: {
    id: BlockType.GOLD_ORE,
    name: 'Gold Ore',
    hardness: 3.0,
    solid: true,
    color: '#f8d234',
    description: 'Precious metallic vein embedded in deep stone',
  },
  [BlockType.COAL_ORE]: {
    id: BlockType.COAL_ORE,
    name: 'Coal Ore',
    hardness: 2.2,
    solid: true,
    color: '#2d2d2d',
    description: 'Combustible organic mineral rock used for fuel',
  },
  [BlockType.TNT]: {
    id: BlockType.TNT,
    name: 'TNT',
    hardness: 0.1,
    solid: true,
    color: '#d62828',
    description: 'Explosive compound block triggered by strike or redstone',
  },
  [BlockType.BOOKSHELF]: {
    id: BlockType.BOOKSHELF,
    name: 'Bookshelf',
    hardness: 1.5,
    solid: true,
    color: '#8b4513',
    description: 'Wooden shelving packed with arcane knowledge',
  },
  [BlockType.BEDROCK]: {
    id: BlockType.BEDROCK,
    name: 'Bedrock',
    hardness: Infinity,
    solid: true,
    color: '#1a1a1a',
    description: 'Indestructible bottom foundation of the voxel world',
  },
  [BlockType.WATER]: {
    id: BlockType.WATER,
    name: 'Water',
    hardness: 100,
    transparent: true,
    solid: false,
    color: '#2980b988',
    description: 'Fluid water body',
  },
};

// Texture cache
const textureMap = new Map<string, THREE.CanvasTexture>();

export function getBlockTexture(blockType: BlockType, face: 'top' | 'side' | 'bottom' = 'side'): THREE.CanvasTexture {
  const key = `${blockType}_${face}`;
  if (textureMap.has(key)) {
    return textureMap.get(key)!;
  }
  const canvas = createBlockTextureCanvas(blockType, face);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureMap.set(key, texture);
  return texture;
}

// Material cache for meshes
const materialCache = new Map<string, THREE.Material>();

export function getBlockMaterial(blockType: BlockType, face: 'top' | 'side' | 'bottom' = 'side'): THREE.Material {
  const key = `${blockType}_${face}`;
  if (materialCache.has(key)) {
    return materialCache.get(key)!;
  }

  const texture = getBlockTexture(blockType, face);
  const isTransparent = blockType === BlockType.GLASS || blockType === BlockType.OAK_LEAVES || blockType === BlockType.WATER;

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0.1,
    transparent: isTransparent,
    opacity: blockType === BlockType.WATER ? 0.7 : blockType === BlockType.GLASS ? 0.6 : 1.0,
    alphaTest: blockType === BlockType.OAK_LEAVES ? 0.4 : 0,
    side: isTransparent ? THREE.DoubleSide : THREE.FrontSide,
  });

  materialCache.set(key, mat);
  return mat;
}

// Multi-material cube array [Right, Left, Top, Bottom, Front, Back]
export function getCubeMaterials(blockType: BlockType): THREE.Material[] {
  const sideMat = getBlockMaterial(blockType, 'side');
  const topMat = getBlockMaterial(blockType, 'top');
  const bottomMat = getBlockMaterial(blockType, 'bottom');

  return [
    sideMat,   // +X right
    sideMat,   // -X left
    topMat,    // +Y top
    bottomMat, // -Y bottom
    sideMat,   // +Z front
    sideMat,   // -Z back
  ];
}
