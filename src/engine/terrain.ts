import { BlockType } from './types';

// Fast 2D & 3D Simplex/Perlin noise implementation
export class SimplexNoise {
  private p: Uint8Array = new Uint8Array(256);
  private perm: Uint8Array = new Uint8Array(512);

  constructor(seed = 1337) {
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    // Shuffle using seed
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = Math.floor((s / 2147483647) * (i + 1));
      const tmp = this.p[i];
      this.p[i] = this.p[j];
      this.p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad2(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const a = this.perm[X] + Y;
    const aa = this.perm[a];
    const ab = this.perm[a + 1];
    const b = this.perm[X + 1] + Y;
    const ba = this.perm[b];
    const bb = this.perm[b + 1];

    const g1 = this.grad2(this.perm[aa], xf, yf);
    const g2 = this.grad2(this.perm[ba], xf - 1, yf);
    const g3 = this.grad2(this.perm[ab], xf, yf - 1);
    const g4 = this.grad2(this.perm[bb], xf - 1, yf - 1);

    return this.lerp(v, this.lerp(u, g1, g2), this.lerp(u, g3, g4));
  }

  public fbm2D(x: number, y: number, octaves = 4, persistence = 0.5, lacunarity = 2.0): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return total / maxValue;
  }
}

export type WorldGeneratorType = 'plains' | 'mountains' | 'islands' | 'desert' | 'flat';

export interface TerrainConfig {
  seed: number;
  generator: WorldGeneratorType;
  seaLevel: number;
  treeDensity: number;
  caveFrequency: number;
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  seed: 4242,
  generator: 'plains',
  seaLevel: 7,
  treeDensity: 0.02,
  caveFrequency: 0.25,
};

export class TerrainGenerator {
  private noise: SimplexNoise;
  private caveNoise: SimplexNoise;
  private config: TerrainConfig;

  constructor(config: TerrainConfig = DEFAULT_TERRAIN_CONFIG) {
    this.config = { ...config };
    this.noise = new SimplexNoise(this.config.seed);
    this.caveNoise = new SimplexNoise(this.config.seed + 999);
  }

  public setConfig(config: Partial<TerrainConfig>) {
    this.config = { ...this.config, ...config };
    if (config.seed !== undefined) {
      this.noise = new SimplexNoise(this.config.seed);
      this.caveNoise = new SimplexNoise(this.config.seed + 999);
    }
  }

  public getConfig(): TerrainConfig {
    return this.config;
  }

  // Returns base surface height at (worldX, worldZ)
  public getHeight(worldX: number, worldZ: number): number {
    if (this.config.generator === 'flat') {
      return 5;
    }

    if (this.config.generator === 'mountains') {
      const base = this.noise.fbm2D(worldX * 0.02, worldZ * 0.02, 5, 0.55, 2.0);
      const peaks = Math.abs(this.noise.noise2D(worldX * 0.04, worldZ * 0.04));
      return Math.floor(12 + base * 14 + peaks * 10);
    }

    if (this.config.generator === 'islands') {
      const n = this.noise.fbm2D(worldX * 0.04, worldZ * 0.04, 3, 0.5, 2.0);
      return n > 0.1 ? Math.floor(14 + n * 12) : 2;
    }

    if (this.config.generator === 'desert') {
      const dunes = Math.sin(worldX * 0.08) * 2 + Math.cos(worldZ * 0.08) * 2;
      const base = this.noise.fbm2D(worldX * 0.015, worldZ * 0.015, 3, 0.4, 2.0);
      return Math.floor(8 + base * 5 + dunes);
    }

    // Default 'plains'
    const n = this.noise.fbm2D(worldX * 0.03, worldZ * 0.03, 4, 0.5, 2.0);
    return Math.floor(9 + n * 7);
  }

  // Generate voxel column at (x, z) up to maxHeight
  public generateColumn(worldX: number, worldZ: number, maxHeight: number): BlockType[] {
    const blocks: BlockType[] = new Array(maxHeight).fill(BlockType.AIR);
    const height = Math.min(this.getHeight(worldX, worldZ), maxHeight - 8);

    // Bedrock bottom
    blocks[0] = BlockType.BEDROCK;

    if (this.config.generator === 'flat') {
      blocks[1] = BlockType.DIRT;
      blocks[2] = BlockType.DIRT;
      blocks[3] = BlockType.DIRT;
      blocks[4] = BlockType.GRASS;
      return blocks;
    }

    const isDesert = this.config.generator === 'desert';

    for (let y = 1; y <= height; y++) {
      // Cave carving check
      const caveVal = Math.abs(this.caveNoise.fbm2D(worldX * 0.07 + y * 0.03, worldZ * 0.07 + y * 0.03, 2));
      const isCave = y < height - 1 && y > 2 && caveVal < (0.07 * this.config.caveFrequency);

      if (isCave) {
        blocks[y] = BlockType.AIR;
        continue;
      }

      if (y === height) {
        // Top surface
        if (isDesert) {
          blocks[y] = BlockType.SAND;
        } else if (y < this.config.seaLevel) {
          blocks[y] = BlockType.SAND;
        } else {
          blocks[y] = BlockType.GRASS;
        }
      } else if (y >= height - 3) {
        // Sub-surface
        blocks[y] = isDesert ? BlockType.SAND : BlockType.DIRT;
      } else {
        // Underground stone + ore generation
        const oreSeed = Math.sin(worldX * 7.12 + y * 13.56 + worldZ * 29.81);
        if (y <= 5 && oreSeed > 0.94) {
          blocks[y] = BlockType.DIAMOND_ORE;
        } else if (y <= 8 && oreSeed > 0.90) {
          blocks[y] = BlockType.GOLD_ORE;
        } else if (oreSeed > 0.82) {
          blocks[y] = BlockType.COAL_ORE;
        } else {
          blocks[y] = BlockType.STONE;
        }
      }
    }

    // Fill water up to sea level if below
    for (let y = height + 1; y <= this.config.seaLevel; y++) {
      if (y < maxHeight) {
        blocks[y] = BlockType.WATER;
      }
    }

    return blocks;
  }
}
