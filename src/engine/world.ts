import * as THREE from 'three';
import { BlockType, RaycastHit } from './types';
import { BLOCK_DEFINITIONS } from './blocks';
import { Chunk, CHUNK_WIDTH, CHUNK_DEPTH, CHUNK_HEIGHT, getOrCreateTextureAtlas } from './chunk';
import { TerrainGenerator, TerrainConfig, DEFAULT_TERRAIN_CONFIG } from './terrain';
import { soundEngine } from './audio';

export class VoxelWorld {
  public scene: THREE.Group;
  public chunks = new Map<string, Chunk>();
  public terrainGen: TerrainGenerator;
  public renderDistance: number = 2; // radius in chunks: (2*2+1)^2 = 25 chunks (80x80 voxels)
  public particleGroup: THREE.Group;

  // Shared Materials
  private atlasMaterial: THREE.MeshStandardMaterial;
  private transparentMaterial: THREE.MeshStandardMaterial;

  // Day/Night & Lighting
  public timeOfDay: number = 10.0; // 0 to 24 hours (10:00 AM start)
  public daySpeed: number = 0.05;  // hours per second (approx 8 min full cycle)
  public sunLight: THREE.DirectionalLight;
  public moonLight: THREE.DirectionalLight;
  public ambientLight: THREE.HemisphereLight;
  public skyColor: THREE.Color = new THREE.Color(0x87ceeb);
  public fog: THREE.FogExp2;

  // Sun and Moon billboard meshes (Minecraft style!)
  private sunMesh: THREE.Mesh;
  private moonMesh: THREE.Mesh;

  constructor(sceneRoot: THREE.Group, config?: Partial<TerrainConfig>) {
    this.scene = new THREE.Group();
    this.scene.name = 'VoxelWorld';
    sceneRoot.add(this.scene);

    this.particleGroup = new THREE.Group();
    this.particleGroup.name = 'VoxelParticles';
    sceneRoot.add(this.particleGroup);

    this.terrainGen = new TerrainGenerator(config ? { ...DEFAULT_TERRAIN_CONFIG, ...config } : DEFAULT_TERRAIN_CONFIG);

    const atlasTexture = getOrCreateTextureAtlas();

    this.atlasMaterial = new THREE.MeshStandardMaterial({
      map: atlasTexture,
      roughness: 0.9,
      metalness: 0.05,
      vertexColors: true,
      side: THREE.FrontSide,
    });

    this.transparentMaterial = new THREE.MeshStandardMaterial({
      map: atlasTexture,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
      vertexColors: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Lights
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    const d = 40;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    sceneRoot.add(this.sunLight);

    this.moonLight = new THREE.DirectionalLight(0x4060aa, 0.2);
    sceneRoot.add(this.moonLight);

    this.ambientLight = new THREE.HemisphereLight(0x87ceeb, 0x443322, 0.6);
    sceneRoot.add(this.ambientLight);

    this.fog = new THREE.FogExp2(0x87ceeb, 0.012);

    // Create Minecraft square Sun and Moon
    const sunGeo = new THREE.PlaneGeometry(16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffee, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sceneRoot.add(this.sunMesh);

    const moonGeo = new THREE.PlaneGeometry(12, 12);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xddddff, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    sceneRoot.add(this.moonMesh);
  }

  public getChunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;
    const cx = Math.floor(x / CHUNK_WIDTH);
    const cz = Math.floor(z / CHUNK_DEPTH);
    const chunk = this.chunks.get(this.getChunkKey(cx, cz));
    if (!chunk) return BlockType.AIR;

    const lx = ((x % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
    const lz = ((z % CHUNK_DEPTH) + CHUNK_DEPTH) % CHUNK_DEPTH;
    return chunk.getBlock(lx, y, lz);
  }

  public setBlock(x: number, y: number, z: number, type: BlockType): boolean {
    if (y < 0 || y >= CHUNK_HEIGHT) return false;
    const cx = Math.floor(x / CHUNK_WIDTH);
    const cz = Math.floor(z / CHUNK_DEPTH);
    const chunk = this.chunks.get(this.getChunkKey(cx, cz));
    if (!chunk) return false;

    const lx = ((x % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH;
    const lz = ((z % CHUNK_DEPTH) + CHUNK_DEPTH) % CHUNK_DEPTH;
    chunk.setBlock(lx, y, lz, type);

    // Neighbor chunk boundaries dirty check
    if (lx === 0) this.dirtyChunk(cx - 1, cz);
    if (lx === CHUNK_WIDTH - 1) this.dirtyChunk(cx + 1, cz);
    if (lz === 0) this.dirtyChunk(cx, cz - 1);
    if (lz === CHUNK_DEPTH - 1) this.dirtyChunk(cx, cz + 1);

    return true;
  }

  private dirtyChunk(cx: number, cz: number) {
    const neighbor = this.chunks.get(this.getChunkKey(cx, cz));
    if (neighbor) neighbor.isDirty = true;
  }

  // Generate chunks around center
  public initWorld(centerChunkX = 0, centerChunkZ = 0) {
    this.clearWorld();

    // 1. Generate voxel data for each chunk
    for (let cx = centerChunkX - this.renderDistance; cx <= centerChunkX + this.renderDistance; cx++) {
      for (let cz = centerChunkZ - this.renderDistance; cz <= centerChunkZ + this.renderDistance; cz++) {
        const chunk = new Chunk(cx, cz);

        // Fill chunk columns with procedural terrain
        for (let lz = 0; lz < CHUNK_DEPTH; lz++) {
          for (let lx = 0; lx < CHUNK_WIDTH; lx++) {
            const wx = cx * CHUNK_WIDTH + lx;
            const wz = cz * CHUNK_DEPTH + lz;
            const column = this.terrainGen.generateColumn(wx, wz, CHUNK_HEIGHT);
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
              chunk.setBlock(lx, y, lz, column[y]);
            }
          }
        }

        this.chunks.set(this.getChunkKey(cx, cz), chunk);
        this.scene.add(chunk.group);
      }
    }

    // 2. Spawn Trees
    if (this.terrainGen.getConfig().generator !== 'flat' && this.terrainGen.getConfig().generator !== 'desert') {
      this.spawnTrees(centerChunkX, centerChunkZ);
    }

    // 3. Build meshes for all chunks
    this.rebuildAllMeshes();
  }

  private spawnTrees(centerChunkX: number, centerChunkZ: number) {
    const minX = (centerChunkX - this.renderDistance) * CHUNK_WIDTH + 3;
    const maxX = (centerChunkX + this.renderDistance + 1) * CHUNK_WIDTH - 4;
    const minZ = (centerChunkZ - this.renderDistance) * CHUNK_DEPTH + 3;
    const maxZ = (centerChunkZ + this.renderDistance + 1) * CHUNK_DEPTH - 4;

    for (let x = minX; x <= maxX; x += 4) {
      for (let z = minZ; z <= maxZ; z += 4) {
        const seedVal = Math.sin(x * 12.9898 + z * 78.233);
        const rand = seedVal - Math.floor(seedVal);
        if (rand < 0.22) { // Tree spawn chance
          const surfaceY = this.terrainGen.getHeight(x, z);
          const groundBlock = this.getBlock(x, surfaceY, z);
          if (groundBlock === BlockType.GRASS && surfaceY + 6 < CHUNK_HEIGHT) {
            this.growTree(x, surfaceY + 1, z);
          }
        }
      }
    }
  }

  private growTree(x: number, y: number, z: number) {
    const trunkHeight = 4 + Math.floor(Math.sin(x + z) * 1.5 + 1.5);
    // Trunk
    for (let ty = 0; ty < trunkHeight; ty++) {
      this.setBlock(x, y + ty, z, BlockType.OAK_LOG);
    }

    // Canopy leaves
    const topY = y + trunkHeight;
    for (let ly = -2; ly <= 1; ly++) {
      const radius = ly >= 0 ? 1 : 2;
      for (let ox = -radius; ox <= radius; ox++) {
        for (let oz = -radius; oz <= radius; oz++) {
          if (Math.abs(ox) === radius && Math.abs(oz) === radius && (ly === 1 || Math.random() > 0.4)) {
            continue; // round corners
          }
          const current = this.getBlock(x + ox, topY + ly, z + oz);
          if (current === BlockType.AIR) {
            this.setBlock(x + ox, topY + ly, z + oz, BlockType.OAK_LEAVES);
          }
        }
      }
    }
    // Very top leaf cap
    this.setBlock(x, topY + 2, z, BlockType.OAK_LEAVES);
  }

  public rebuildAllMeshes() {
    const getNeighbor = (wx: number, y: number, wz: number) => this.getBlock(wx, y, wz);
    for (const chunk of this.chunks.values()) {
      chunk.buildMesh(getNeighbor, this.atlasMaterial, this.transparentMaterial);
    }
  }

  public updateDirtyChunks() {
    const getNeighbor = (wx: number, y: number, wz: number) => this.getBlock(wx, y, wz);
    for (const chunk of this.chunks.values()) {
      if (chunk.isDirty) {
        chunk.buildMesh(getNeighbor, this.atlasMaterial, this.transparentMaterial);
      }
    }
  }

  public clearWorld() {
    for (const chunk of this.chunks.values()) {
      chunk.dispose();
      this.scene.remove(chunk.group);
    }
    this.chunks.clear();
  }

  // Raycasting for block interaction (mining & placing)
  public raycast(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance = 6.0): RaycastHit {
    const emptyHit: RaycastHit = {
      hit: false,
      point: [0, 0, 0],
      normal: [0, 0, 0],
      blockPos: [0, 0, 0],
      adjacentPos: [0, 0, 0],
      blockType: BlockType.AIR,
      distance: 0,
    };

    let px = origin.x;
    let py = origin.y;
    let pz = origin.z;

    let bx = Math.floor(px);
    let by = Math.floor(py);
    let bz = Math.floor(pz);

    const stepX = Math.sign(direction.x);
    const stepY = Math.sign(direction.y);
    const stepZ = Math.sign(direction.z);

    const tDeltaX = stepX !== 0 ? Math.abs(1 / direction.x) : Infinity;
    const tDeltaY = stepY !== 0 ? Math.abs(1 / direction.y) : Infinity;
    const tDeltaZ = stepZ !== 0 ? Math.abs(1 / direction.z) : Infinity;

    let tMaxX = stepX > 0 ? (bx + 1 - px) * tDeltaX : (px - bx) * tDeltaX;
    let tMaxY = stepY > 0 ? (by + 1 - py) * tDeltaY : (py - by) * tDeltaY;
    let tMaxZ = stepZ > 0 ? (bz + 1 - pz) * tDeltaZ : (pz - bz) * tDeltaZ;

    let normalX = 0;
    let normalY = 0;
    let normalZ = 0;
    let dist = 0;

    while (dist <= maxDistance) {
      const block = this.getBlock(bx, by, bz);
      if (block !== BlockType.AIR && block !== BlockType.WATER) {
        return {
          hit: true,
          point: [px + direction.x * dist, py + direction.y * dist, pz + direction.z * dist],
          normal: [normalX, normalY, normalZ],
          blockPos: [bx, by, bz],
          adjacentPos: [bx + normalX, by + normalY, bz + normalZ],
          blockType: block,
          distance: dist,
        };
      }

      if (tMaxX < tMaxY) {
        if (tMaxX < tMaxZ) {
          bx += stepX;
          dist = tMaxX;
          tMaxX += tDeltaX;
          normalX = -stepX;
          normalY = 0;
          normalZ = 0;
        } else {
          bz += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normalX = 0;
          normalY = 0;
          normalZ = -stepZ;
        }
      } else {
        if (tMaxY < tMaxZ) {
          by += stepY;
          dist = tMaxY;
          tMaxY += tDeltaY;
          normalX = 0;
          normalY = -stepY;
          normalZ = 0;
        } else {
          bz += stepZ;
          dist = tMaxZ;
          tMaxZ += tDeltaZ;
          normalX = 0;
          normalY = 0;
          normalZ = -stepZ;
        }
      }
    }

    return emptyHit;
  }

  // Break block with particles
  public breakBlock(x: number, y: number, z: number): BlockType {
    const block = this.getBlock(x, y, z);
    if (block === BlockType.AIR || block === BlockType.BEDROCK) return BlockType.AIR;

    this.spawnBreakParticles(x, y, z, block);
    this.setBlock(x, y, z, BlockType.AIR);
    soundEngine.playBreakSound();

    // Trigger TNT explosion if TNT broken or detonated
    if (block === BlockType.TNT) {
      this.explode(x, y, z, 3.5);
    }

    return block;
  }

  // Detonate TNT explosion
  public explode(cx: number, cy: number, cz: number, radius = 3.5) {
    soundEngine.playExplosionSound();
    const rInt = Math.ceil(radius);

    for (let x = cx - rInt; x <= cx + rInt; x++) {
      for (let y = cy - rInt; y <= cy + rInt; y++) {
        for (let z = cz - rInt; z <= cz + rInt; z++) {
          const dx = x - cx;
          const dy = y - cy;
          const dz = z - cz;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 <= radius * radius) {
            const b = this.getBlock(x, y, z);
            if (b !== BlockType.AIR && b !== BlockType.BEDROCK) {
              if (Math.random() < 0.3) {
                this.spawnBreakParticles(x, y, z, b);
              }
              this.setBlock(x, y, z, BlockType.AIR);
            }
          }
        }
      }
    }
  }

  // Spawn mini voxel block fragments
  private spawnBreakParticles(x: number, y: number, z: number, block: BlockType) {
    const def = BLOCK_DEFINITIONS[block];
    const color = new THREE.Color(def.color.slice(0, 7) || '#888888');
    const count = 12;

    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const pMat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(
        x + 0.2 + Math.random() * 0.6,
        y + 0.2 + Math.random() * 0.6,
        z + 0.2 + Math.random() * 0.6
      );

      const vx = (Math.random() - 0.5) * 4;
      const vy = Math.random() * 5 + 1;
      const vz = (Math.random() - 0.5) * 4;

      this.particleGroup.add(pMesh);

      const startTime = performance.now();
      const life = 600 + Math.random() * 400; // ms

      const updateP = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed > life) {
          this.particleGroup.remove(pMesh);
          pMesh.geometry.dispose();
          return;
        }
        const dt = 0.016;
        pMesh.position.x += vx * dt;
        pMesh.position.y += vy * dt - 9.8 * 0.5 * dt * dt;
        pMesh.position.z += vz * dt;
        pMesh.rotation.x += 0.2;
        pMesh.rotation.y += 0.2;
        const scale = 1 - elapsed / life;
        pMesh.scale.set(scale, scale, scale);
        requestAnimationFrame(updateP);
      };
      requestAnimationFrame(updateP);
    }
  }

  // Update Day/Night lighting and Sky
  public updateDayNight(deltaSeconds: number, playerPos?: THREE.Vector3) {
    this.timeOfDay = (this.timeOfDay + deltaSeconds * this.daySpeed) % 24;

    // Angle: 6 = sunrise (0 rad), 12 = noon (pi/2), 18 = sunset (pi), 0/24 = midnight (3pi/2)
    const angle = ((this.timeOfDay - 6) / 24) * Math.PI * 2;
    const sunDist = 90;

    const sunX = Math.cos(angle) * sunDist;
    const sunY = Math.sin(angle) * sunDist;
    const sunZ = Math.sin(angle * 0.3) * 30;

    const px = playerPos?.x || 16;
    const pz = playerPos?.z || 16;

    this.sunLight.position.set(px + sunX, Math.max(sunY, -10), pz + sunZ);
    this.sunLight.target.position.set(px, 10, pz);
    this.sunLight.target.updateMatrixWorld();

    this.moonLight.position.set(px - sunX, Math.max(-sunY, -10), pz - sunZ);
    this.moonLight.target.position.set(px, 10, pz);
    this.moonLight.target.updateMatrixWorld();

    this.sunMesh.position.set(px + sunX, sunY, pz + sunZ);
    this.sunMesh.lookAt(px, 10, pz);

    this.moonMesh.position.set(px - sunX, -sunY, pz - sunZ);
    this.moonMesh.lookAt(px, 10, pz);

    // Day/Night Sky Color Blend
    const isDay = sunY > 0;
    const dayFactor = Math.max(0, Math.min(1, sunY / 25)); // 0 = night, 1 = midday

    // Blend from Night Navy (0x0b0e14) to Dawn Orange (0xe07b39) to Noon Azure (0x87ceeb)
    const nightColor = new THREE.Color(0x0c101c);
    const dayColor = new THREE.Color(0x82bcf0);
    const sunsetColor = new THREE.Color(0xda7340);

    if (dayFactor > 0.3) {
      this.skyColor.copy(sunsetColor).lerp(dayColor, (dayFactor - 0.3) / 0.7);
    } else if (dayFactor > 0) {
      this.skyColor.copy(nightColor).lerp(sunsetColor, dayFactor / 0.3);
    } else {
      this.skyColor.copy(nightColor);
    }

    this.fog.color.copy(this.skyColor);

    // Light Intensities
    this.sunLight.intensity = Math.max(0, dayFactor * 1.5);
    this.moonLight.intensity = Math.max(0, (1 - dayFactor) * 0.3);
    this.ambientLight.intensity = 0.2 + dayFactor * 0.5;
    this.ambientLight.color.copy(this.skyColor);
  }
}
