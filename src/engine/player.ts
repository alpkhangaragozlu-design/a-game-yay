import * as THREE from 'three';
import { BlockType, RaycastHit } from './types';
import { VoxelWorld } from './world';
import { soundEngine } from './audio';
import { BLOCK_DEFINITIONS } from './blocks';

export interface PlayerConfig {
  moveSpeed: number;
  sprintMultiplier: number;
  jumpForce: number;
  gravity: number;
  flyMode: boolean;
  reachDistance: number;
  creativeMode: boolean;
}

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  moveSpeed: 4.8,
  sprintMultiplier: 1.45,
  jumpForce: 7.8,
  gravity: 22.0,
  flyMode: false,
  reachDistance: 5.5,
  creativeMode: true,
};

export class MinecraftPlayer {
  public position = new THREE.Vector3(16, 20, 16);
  public velocity = new THREE.Vector3(0, 0, 0);
  public rotation = new THREE.Euler(0, 0, 0, 'YXZ'); // pitch (x), yaw (y)

  public camera: THREE.PerspectiveCamera;
  public cameraGroup: THREE.Group; // Eyes position

  public config: PlayerConfig;
  public isGrounded: boolean = false;
  public isMoving: boolean = false;
  public isSprinting: boolean = false;

  // Digging state
  public digTarget: RaycastHit | null = null;
  public digProgress: number = 0; // 0 to 1
  public handSwingAngle: number = 0; // 0 to 1
  private handSwingActive: boolean = false;
  private stepTimer: number = 0;

  // Selected hotbar item (BlockType)
  public selectedBlock: BlockType = BlockType.GRASS;
  public hotbar: BlockType[] = [
    BlockType.GRASS,
    BlockType.DIRT,
    BlockType.COBBLESTONE,
    BlockType.OAK_LOG,
    BlockType.OAK_PLANKS,
    BlockType.GLASS,
    BlockType.BRICK,
    BlockType.DIAMOND_ORE,
    BlockType.TNT,
  ];
  public selectedHotbarSlot: number = 0;

  // Hand Viewmodel
  public handGroup: THREE.Group;
  private handMesh: THREE.Mesh;

  // Outline box for targeted voxel
  public selectionBox: THREE.LineSegments;

  constructor(camera: THREE.PerspectiveCamera, config: Partial<PlayerConfig> = {}) {
    this.camera = camera;
    this.config = { ...DEFAULT_PLAYER_CONFIG, ...config };

    this.cameraGroup = new THREE.Group();
    this.cameraGroup.name = 'PlayerCameraGroup';
    this.cameraGroup.add(this.camera);

    // Hand mesh setup
    this.handGroup = new THREE.Group();
    this.handGroup.name = 'PlayerHandViewmodel';

    // Minecraft Steve / Block held in hand
    const handGeo = new THREE.BoxGeometry(0.2, 0.45, 0.2);
    const handMat = new THREE.MeshStandardMaterial({
      color: 0xc89870, // arm skin tone
      roughness: 0.8,
    });
    this.handMesh = new THREE.Mesh(handGeo, handMat);
    this.handMesh.position.set(0.28, -0.32, -0.5);
    this.handMesh.rotation.set(-0.2, -0.3, 0.2);
    this.handGroup.add(this.handMesh);
    this.camera.add(this.handGroup);

    // Selection box for hover highlighting
    const boxGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.selectionBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    this.selectionBox.visible = false;
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
    this.cameraGroup.position.set(x, y + 1.62, z);
  }

  // Handle Mouse Look
  public onMouseMove(deltaX: number, deltaY: number) {
    const sensitivity = 0.0022;
    this.rotation.y -= deltaX * sensitivity;
    this.rotation.x -= deltaY * sensitivity;

    // Clamp pitch between -89 and +89 degrees
    const maxPitch = (Math.PI / 2) - 0.02;
    this.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.rotation.x));

    this.camera.rotation.copy(this.rotation);
  }

  // Trigger hand swing animation
  public triggerHandSwing() {
    this.handSwingActive = true;
    this.handSwingAngle = 1.0;
  }

  public update(
    delta: number,
    keys: Record<string, boolean>,
    world: VoxelWorld,
    isPointerLocked: boolean
  ) {
    if (delta > 0.1) delta = 0.1; // clamp lag spikes

    // 1. Process Movement Inputs if pointer locked or focused
    let moveForward = 0;
    let moveRight = 0;
    let moveUp = 0;

    if (isPointerLocked) {
      if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveRight -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveRight += 1;

      this.isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];

      if (this.config.flyMode) {
        if (keys['Space']) moveUp += 1;
        if (keys['KeyC'] || keys['ControlLeft']) moveUp -= 1;
      } else {
        if (keys['Space'] && this.isGrounded) {
          this.velocity.y = this.config.jumpForce;
          this.isGrounded = false;
          soundEngine.playJumpSound();
        }
      }
    }

    // Calculate movement vector aligned with player yaw
    const forwardVec = new THREE.Vector3(-Math.sin(this.rotation.y), 0, -Math.cos(this.rotation.y));
    const rightVec = new THREE.Vector3(Math.cos(this.rotation.y), 0, -Math.sin(this.rotation.y));

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forwardVec, moveForward);
    moveDir.addScaledVector(rightVec, moveRight);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    const currentSpeed = (this.isSprinting ? this.config.moveSpeed * this.config.sprintMultiplier : this.config.moveSpeed) * (this.config.flyMode ? 2.0 : 1.0);

    if (this.config.flyMode) {
      // Free flight
      this.velocity.x = moveDir.x * currentSpeed;
      this.velocity.z = moveDir.z * currentSpeed;
      this.velocity.y = moveUp * currentSpeed;

      this.position.x += this.velocity.x * delta;
      this.position.y += this.velocity.y * delta;
      this.position.z += this.velocity.z * delta;
    } else {
      // Normal Walking Physics & Voxel Collision
      this.velocity.x = moveDir.x * currentSpeed;
      this.velocity.z = moveDir.z * currentSpeed;

      // Apply Gravity
      this.velocity.y -= this.config.gravity * delta;
      if (this.velocity.y < -35) this.velocity.y = -35; // terminal velocity

      // Resolve voxel collisions in X, Y, Z independently
      this.moveWithCollision(delta, world);

      // Footstep sound tick
      if (this.isMoving && this.isGrounded) {
        this.stepTimer += delta * (this.isSprinting ? 1.6 : 1.0);
        if (this.stepTimer > 0.42) {
          this.stepTimer = 0;
          soundEngine.playStepSound();
        }
      } else {
        this.stepTimer = 0.3;
      }
    }

    // Keep camera synced with player eye position
    this.cameraGroup.position.set(this.position.x, this.position.y + 1.62, this.position.z);
    this.camera.position.copy(this.cameraGroup.position);

    // 2. Hand Animation & Bobbing
    const time = performance.now() * 0.006;
    let bobX = 0;
    let bobY = 0;
    if (this.isMoving && this.isGrounded) {
      bobX = Math.sin(time) * 0.02;
      bobY = Math.abs(Math.cos(time)) * 0.025;
    }

    if (this.handSwingActive) {
      this.handSwingAngle -= delta * 7.0;
      if (this.handSwingAngle <= 0) {
        this.handSwingAngle = 0;
        this.handSwingActive = false;
      }
    }

    const swingRot = Math.sin(this.handSwingAngle * Math.PI) * 0.6;
    this.handMesh.position.set(0.28 + bobX, -0.32 - bobY - swingRot * 0.1, -0.5 + swingRot * 0.15);
    this.handMesh.rotation.set(-0.2 - swingRot * 0.8, -0.3 + swingRot * 0.4, 0.2 - swingRot * 0.3);

    // 3. Raycast for Block Hover Target
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const hit = world.raycast(this.camera.position, dir, this.config.reachDistance);

    if (hit.hit) {
      this.digTarget = hit;
      this.selectionBox.visible = true;
      this.selectionBox.position.set(
        hit.blockPos[0] + 0.5,
        hit.blockPos[1] + 0.5,
        hit.blockPos[2] + 0.5
      );
    } else {
      this.digTarget = null;
      this.selectionBox.visible = false;
    }
  }

  // AABB Collision vs Voxel World
  private moveWithCollision(delta: number, world: VoxelWorld) {
    const halfWidth = 0.3;
    const height = 1.8;

    // Move Y
    const dy = this.velocity.y * delta;
    this.position.y += dy;
    let box = this.getAABB(this.position.x, this.position.y, this.position.z, halfWidth, height);

    if (this.checkCollision(box, world)) {
      if (dy < 0) {
        // Landed on ground
        this.position.y = Math.floor(this.position.y) + 1.0;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else if (dy > 0) {
        // Hit head on ceiling
        this.position.y = Math.floor(this.position.y + height) - height - 0.001;
        this.velocity.y = 0;
      }
    } else {
      if (dy < 0) {
        this.isGrounded = false;
      }
    }

    // Move X
    const dx = this.velocity.x * delta;
    this.position.x += dx;
    box = this.getAABB(this.position.x, this.position.y, this.position.z, halfWidth, height);
    if (this.checkCollision(box, world)) {
      if (dx > 0) {
        this.position.x = Math.floor(this.position.x + halfWidth) - halfWidth - 0.001;
      } else if (dx < 0) {
        this.position.x = Math.floor(this.position.x - halfWidth) + 1.0 + halfWidth + 0.001;
      }
      this.velocity.x = 0;
    }

    // Move Z
    const dz = this.velocity.z * delta;
    this.position.z += dz;
    box = this.getAABB(this.position.x, this.position.y, this.position.z, halfWidth, height);
    if (this.checkCollision(box, world)) {
      if (dz > 0) {
        this.position.z = Math.floor(this.position.z + halfWidth) - halfWidth - 0.001;
      } else if (dz < 0) {
        this.position.z = Math.floor(this.position.z - halfWidth) + 1.0 + halfWidth + 0.001;
      }
      this.velocity.z = 0;
    }

    // Auto-step: if falling below world floor, reset to surface
    if (this.position.y < -5) {
      this.position.set(16, 25, 16);
      this.velocity.set(0, 0, 0);
    }
  }

  private getAABB(px: number, py: number, pz: number, halfW: number, h: number) {
    return {
      minX: px - halfW,
      maxX: px + halfW,
      minY: py,
      maxY: py + h,
      minZ: pz - halfW,
      maxZ: pz + halfW,
    };
  }

  private checkCollision(
    box: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number },
    world: VoxelWorld
  ): boolean {
    const minBx = Math.floor(box.minX);
    const maxBx = Math.floor(box.maxX);
    const minBy = Math.floor(box.minY);
    const maxBy = Math.floor(box.maxY);
    const minBz = Math.floor(box.minZ);
    const maxBz = Math.floor(box.maxZ);

    for (let y = minBy; y <= maxBy; y++) {
      for (let z = minBz; z <= maxBz; z++) {
        for (let x = minBx; x <= maxBx; x++) {
          const block = world.getBlock(x, y, z);
          if (block !== BlockType.AIR) {
            const def = BLOCK_DEFINITIONS[block];
            if (def && def.solid) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Handle Mining Dig Click / Hold
  public dig(world: VoxelWorld, delta: number): boolean {
    if (!this.digTarget || !this.digTarget.hit) {
      this.digProgress = 0;
      return false;
    }

    this.triggerHandSwing();

    const [bx, by, bz] = this.digTarget.blockPos;
    const block = world.getBlock(bx, by, bz);
    if (block === BlockType.AIR || block === BlockType.BEDROCK) {
      this.digProgress = 0;
      return false;
    }

    // Creative mode: Instant Break!
    if (this.config.creativeMode) {
      world.breakBlock(bx, by, bz);
      this.digProgress = 0;
      return true;
    }

    // Survival mode: Progressive hardness
    const def = BLOCK_DEFINITIONS[block];
    const hardness = def ? def.hardness : 1.0;
    this.digProgress += delta / hardness;

    if (Math.random() < 0.25) {
      soundEngine.playHitSound();
    }

    if (this.digProgress >= 1.0) {
      world.breakBlock(bx, by, bz);
      this.digProgress = 0;
      return true;
    }

    return false;
  }

  // Handle Block Placement
  public placeBlock(world: VoxelWorld): boolean {
    if (!this.digTarget || !this.digTarget.hit) return false;

    this.triggerHandSwing();

    const [ax, ay, az] = this.digTarget.adjacentPos;

    // Check if player body intersects placement target
    const halfWidth = 0.35;
    const height = 1.8;
    const pBox = this.getAABB(this.position.x, this.position.y, this.position.z, halfWidth, height);

    if (
      ax >= Math.floor(pBox.minX) && ax <= Math.floor(pBox.maxX) &&
      ay >= Math.floor(pBox.minY) && ay <= Math.floor(pBox.maxY) &&
      az >= Math.floor(pBox.minZ) && az <= Math.floor(pBox.maxZ)
    ) {
      // Block collides with player body
      return false;
    }

    const blockToPlace = this.selectedBlock;
    if (blockToPlace === BlockType.AIR) return false;

    world.setBlock(ax, ay, az, blockToPlace);
    soundEngine.playPlaceSound();
    return true;
  }

  public selectHotbarIndex(idx: number) {
    if (idx >= 0 && idx < this.hotbar.length) {
      this.selectedHotbarSlot = idx;
      this.selectedBlock = this.hotbar[idx];
      soundEngine.playUIBeep(500 + idx * 40);
    }
  }
}
