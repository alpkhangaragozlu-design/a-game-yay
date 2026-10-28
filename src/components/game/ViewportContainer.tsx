import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EditorViewMode, EngineStats, BlockType, UnityLog, UnityTool } from '../../engine/types';
import { VoxelWorld } from '../../engine/world';
import { MinecraftPlayer, PlayerConfig } from '../../engine/player';
import { WorldGeneratorType } from '../../engine/terrain';
import { MinecraftHUD } from './MinecraftHUD';
import { UnitySceneGizmo } from '../unity/UnitySceneGizmo';
import { UnityStats } from '../unity/UnityStats';
import { soundEngine } from '../../engine/audio';
import { BLOCK_DEFINITIONS } from '../../engine/blocks';

interface ViewportContainerProps {
  viewMode: EditorViewMode;
  isPlaying: boolean;
  isPaused: boolean;
  activeTool: UnityTool;
  showStats: boolean;
  onToggleStats: () => void;

  // Player & World settings
  playerConfig: PlayerConfig;
  worldGenType: WorldGeneratorType;
  worldSeed: number;
  renderDistance: number;
  timeOfDay: number;
  daySpeed: number;
  sunIntensity: number;

  onStatsUpdate: (stats: EngineStats) => void;
  onLog: (type: 'log' | 'warning' | 'error', message: string) => void;
  onPlayerPosChange: (pos: [number, number, number], rot: [number, number, number]) => void;

  // External trigger for hotbar equip from Project panel
  equippedBlock?: BlockType;
}

export const ViewportContainer: React.FC<ViewportContainerProps> = ({
  viewMode,
  isPlaying,
  isPaused,
  activeTool,
  showStats,
  onToggleStats,
  playerConfig,
  worldGenType,
  worldSeed,
  renderDistance,
  timeOfDay,
  daySpeed,
  sunIntensity,
  onStatsUpdate,
  onLog,
  onPlayerPosChange,
  equippedBlock,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Engine references
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const worldRef = useRef<VoxelWorld | null>(null);
  const playerRef = useRef<MinecraftPlayer | null>(null);

  // Cameras
  const gameCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneCameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Scene Editor Camera state
  const sceneCamState = useRef({
    pos: new THREE.Vector3(16, 28, 42),
    target: new THREE.Vector3(16, 12, 16),
    yaw: 0,
    pitch: -0.4,
    isRightDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

  // Input states
  const keysRef = useRef<Record<string, boolean>>({});
  const isMouseDownRef = useRef<boolean>(false);
  const mouseButtonRef = useRef<number>(-1);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  // Local HUD state
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [digProgress, setDigProgress] = useState<number>(0);
  const [engineStats, setEngineStats] = useState<EngineStats>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    loadedChunks: 0,
    totalVoxels: 0,
    playerPos: [16, 20, 16],
    timeOfDay: 10,
  });

  // Handle external block equip from Project panel
  useEffect(() => {
    if (equippedBlock && playerRef.current) {
      playerRef.current.hotbar[playerRef.current.selectedHotbarSlot] = equippedBlock;
      playerRef.current.selectedBlock = equippedBlock;
      setSelectedSlot(playerRef.current.selectedHotbarSlot);
      onLog('log', `[Project] Equipped ${BLOCK_DEFINITIONS[equippedBlock]?.name || 'Block'} to slot ${playerRef.current.selectedHotbarSlot + 1}`);
    }
  }, [equippedBlock, onLog]);

  // Update Player config when modified in Inspector
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.config = { ...playerRef.current.config, ...playerConfig };
    }
  }, [playerConfig]);

  // Update Sun intensity / time of day from Inspector
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.timeOfDay = timeOfDay;
      worldRef.current.daySpeed = isPaused ? 0 : daySpeed;
      worldRef.current.sunLight.intensity = sunIntensity;
    }
  }, [timeOfDay, daySpeed, sunIntensity, isPaused]);

  // Regenerate world when seed / gen / renderDistance change
  const rebuildWorld = useCallback(() => {
    if (!worldRef.current) return;
    const startTime = performance.now();
    worldRef.current.terrainGen.setConfig({
      seed: worldSeed,
      generator: worldGenType,
    });
    worldRef.current.renderDistance = renderDistance;
    worldRef.current.initWorld(0, 0);

    // Place player at highest ground
    const surfaceY = worldRef.current.terrainGen.getHeight(16, 16);
    if (playerRef.current) {
      playerRef.current.setPosition(16, surfaceY + 2, 16);
    }

    const elapsed = (performance.now() - startTime).toFixed(1);
    onLog('log', `[VoxelWorld] World regenerated with '${worldGenType}' (Seed: ${worldSeed}) in ${elapsed}ms`);
  }, [worldSeed, worldGenType, renderDistance, onLog]);

  useEffect(() => {
    rebuildWorld();
  }, [rebuildWorld]);

  // INITIALIZE THREE.JS ENGINE
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb);

    // 2. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // 3. Cameras
    const aspect = mount.clientWidth / mount.clientHeight;
    const gameCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 300);
    gameCameraRef.current = gameCamera;

    const sceneCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
    sceneCamera.position.set(16, 30, 45);
    sceneCamera.lookAt(16, 10, 16);
    sceneCameraRef.current = sceneCamera;

    // 4. World
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    const world = new VoxelWorld(worldGroup, { seed: worldSeed, generator: worldGenType });
    worldRef.current = world;
    scene.fog = world.fog;

    // 5. Player
    const player = new MinecraftPlayer(gameCamera);
    playerRef.current = player;
    scene.add(player.selectionBox);

    // Unity Scene Grid plane
    const gridHelper = new THREE.GridHelper(100, 100, 0x4a5568, 0x2d3748);
    gridHelper.position.y = 0.01;
    gridHelper.name = 'UnityEditorGrid';
    scene.add(gridHelper);

    // Player Avatar model for Scene View (so Steve is visible in Scene View!)
    const steveGroup = new THREE.Group();
    steveGroup.name = 'SteveAvatar';

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xcd9a77 });
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMat);
    headMesh.position.y = 1.6;
    steveGroup.add(headMesh);

    // Torso (Cyan shirt)
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00a8a8 });
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.25), torsoMat);
    torsoMesh.position.y = 1.0;
    steveGroup.add(torsoMesh);

    // Legs (Blue pants)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2233aa });
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.75, 0.24), legMat);
    legMesh.position.y = 0.375;
    steveGroup.add(legMesh);

    scene.add(steveGroup);

    // Initial build
    world.initWorld(0, 0);
    const startY = world.terrainGen.getHeight(16, 16);
    player.setPosition(16, startY + 2, 16);

    onLog('log', '[UnityCraft] Engine initialized. Unity 3D & Voxel systems active.');

    // Pre-warm shaders
    renderer.compile(scene, gameCamera);

    // Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    let currentFps = 60;
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      frameCount++;
      fpsTimer += dt;
      if (fpsTimer >= 0.5) {
        currentFps = Math.round((frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
      }

      // Update Steve avatar in Scene View
      steveGroup.position.copy(player.position);
      steveGroup.rotation.y = player.rotation.y;

      // Simulation update (if not paused)
      if (isPlaying && !isPaused) {
        // Player update
        player.update(dt, keysRef.current, world, isPointerLocked);

        // Dig / Mine hold update
        if (isMouseDownRef.current && mouseButtonRef.current === 0 && isPointerLocked) {
          const broke = player.dig(world, dt);
          if (broke && player.digTarget) {
            onLog('log', `[Player] Mined ${BLOCK_DEFINITIONS[player.digTarget.blockType]?.name || 'Block'} at (${player.digTarget.blockPos.join(', ')})`);
          }
          setDigProgress(player.digProgress);
        } else {
          player.digProgress = 0;
          setDigProgress(0);
        }

        // Update Day/Night
        world.updateDayNight(dt, player.position);
        scene.background = world.skyColor;
        gridHelper.visible = viewMode !== 'game';

        // Update modified chunks
        world.updateDirtyChunks();
      }

      // Scene Camera Free-Fly movement (when in Scene View and right clicking)
      if (viewMode !== 'game' && sceneCamState.current.isRightDragging) {
        const cam = sceneCameraRef.current;
        if (cam) {
          const speed = 25 * dt;
          const camDir = new THREE.Vector3();
          cam.getWorldDirection(camDir);
          const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

          if (keysRef.current['KeyW']) cam.position.addScaledVector(camDir, speed);
          if (keysRef.current['KeyS']) cam.position.addScaledVector(camDir, -speed);
          if (keysRef.current['KeyA']) cam.position.addScaledVector(camRight, -speed);
          if (keysRef.current['KeyD']) cam.position.addScaledVector(camRight, speed);
          if (keysRef.current['KeyE']) cam.position.y += speed;
          if (keysRef.current['KeyQ']) cam.position.y -= speed;
        }
      }

      // Render based on view mode
      const w = mount.clientWidth;
      const h = mount.clientHeight;

      if (viewMode === 'game') {
        renderer.setViewport(0, 0, w, h);
        renderer.setScissor(0, 0, w, h);
        renderer.setScissorTest(false);
        renderer.render(scene, gameCamera);
      } else if (viewMode === 'scene') {
        renderer.setViewport(0, 0, w, h);
        renderer.setScissor(0, 0, w, h);
        renderer.setScissorTest(false);
        renderer.render(scene, sceneCamera);
      } else if (viewMode === 'split') {
        // Left half: Scene View, Right half: Game View
        const halfW = Math.floor(w / 2);
        renderer.setScissorTest(true);

        // Left: Scene
        sceneCamera.aspect = halfW / h;
        sceneCamera.updateProjectionMatrix();
        renderer.setViewport(0, 0, halfW, h);
        renderer.setScissor(0, 0, halfW, h);
        gridHelper.visible = true;
        steveGroup.visible = true;
        renderer.render(scene, sceneCamera);

        // Right: Game
        gameCamera.aspect = halfW / h;
        gameCamera.updateProjectionMatrix();
        renderer.setViewport(halfW, 0, halfW, h);
        renderer.setScissor(halfW, 0, halfW, h);
        gridHelper.visible = false;
        renderer.render(scene, gameCamera);
      }

      // Stats snapshot
      const totalVoxels = world.chunks.size * 16 * 16 * 32;
      const statsObj: EngineStats = {
        fps: currentFps,
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        loadedChunks: world.chunks.size,
        totalVoxels,
        playerPos: [player.position.x, player.position.y, player.position.z],
        timeOfDay: world.timeOfDay,
      };
      setEngineStats(statsObj);
      onStatsUpdate(statsObj);
      onPlayerPosChange([player.position.x, player.position.y, player.position.z], [player.rotation.x, player.rotation.y, player.rotation.z]);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      renderer.setSize(nw, nh);
      const na = nw / nh;
      gameCamera.aspect = na;
      gameCamera.updateProjectionMatrix();
      sceneCamera.aspect = na;
      sceneCamera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      world.clearWorld();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []); // Run once

  // Mouse & Pointer Lock Listeners
  const requestPointerLock = () => {
    if (mountRef.current) {
      mountRef.current.requestPointerLock?.();
    }
  };

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === mountRef.current;
      setIsPointerLocked(locked);
      if (locked) {
        onLog('log', '[Input] Cursor locked. Use WASD to move, Mouse to look, Click to dig/place.');
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [onLog]);

  // Global Keydown & Keyup
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Hotbar selection numbers 1..9
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const slot = parseInt(e.code.replace('Digit', '')) - 1;
        if (playerRef.current) {
          playerRef.current.selectHotbarIndex(slot);
          setSelectedSlot(slot);
        }
      }

      // Fly mode toggle
      if (e.code === 'KeyF') {
        if (playerRef.current) {
          playerRef.current.config.flyMode = !playerRef.current.config.flyMode;
          onLog('log', `[Player] Fly mode: ${playerRef.current.config.flyMode ? 'ENABLED' : 'DISABLED'}`);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onLog]);

  // Viewport Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseButtonRef.current = e.button;

    if (viewMode === 'game' || isPointerLocked) {
      if (e.button === 0) {
        // Left click: start dig
        if (playerRef.current && worldRef.current) {
          playerRef.current.dig(worldRef.current, 0.016);
          setDigProgress(playerRef.current.digProgress);
        }
      } else if (e.button === 2) {
        // Right click: place block
        e.preventDefault();
        if (playerRef.current && worldRef.current) {
          const placed = playerRef.current.placeBlock(worldRef.current);
          if (placed && playerRef.current.digTarget) {
            onLog('log', `[Player] Placed ${BLOCK_DEFINITIONS[playerRef.current.selectedBlock]?.name || 'Block'} at (${playerRef.current.digTarget.adjacentPos.join(', ')})`);
          }
        }
      }
    } else {
      // Scene View controls
      if (e.button === 2) {
        // Right click fly
        sceneCamState.current.isRightDragging = true;
        sceneCamState.current.lastMouseX = e.clientX;
        sceneCamState.current.lastMouseY = e.clientY;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    isMouseDownRef.current = false;
    mouseButtonRef.current = -1;
    sceneCamState.current.isRightDragging = false;
    if (playerRef.current) {
      playerRef.current.digProgress = 0;
      setDigProgress(0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPointerLocked && playerRef.current) {
      playerRef.current.onMouseMove(e.movementX, e.movementY);
    } else if (viewMode !== 'game' && sceneCamState.current.isRightDragging && sceneCameraRef.current) {
      // Scene View camera rotation
      const dx = e.clientX - sceneCamState.current.lastMouseX;
      const dy = e.clientY - sceneCamState.current.lastMouseY;
      sceneCamState.current.lastMouseX = e.clientX;
      sceneCamState.current.lastMouseY = e.clientY;

      sceneCamState.current.yaw -= dx * 0.004;
      sceneCamState.current.pitch -= dy * 0.004;
      sceneCamState.current.pitch = Math.max(-1.5, Math.min(1.5, sceneCamState.current.pitch));

      const cam = sceneCameraRef.current;
      const rot = new THREE.Euler(sceneCamState.current.pitch, sceneCamState.current.yaw, 0, 'YXZ');
      cam.quaternion.setFromEuler(rot);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isPointerLocked && playerRef.current) {
      // Mouse wheel switches hotbar in game
      const delta = Math.sign(e.deltaY);
      const nextSlot = ((playerRef.current.selectedHotbarSlot + delta) % 9 + 9) % 9;
      playerRef.current.selectHotbarIndex(nextSlot);
      setSelectedSlot(nextSlot);
    } else if (viewMode !== 'game' && sceneCameraRef.current) {
      // Zoom scene camera
      const dir = new THREE.Vector3();
      sceneCameraRef.current.getWorldDirection(dir);
      sceneCameraRef.current.position.addScaledVector(dir, -Math.sign(e.deltaY) * 2.5);
    }
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative flex-1 w-full h-full bg-[#111111] overflow-hidden select-none cursor-crosshair"
    >
      {/* Minecraft HUD Overlay (Game View or Split View) */}
      {(viewMode === 'game' || viewMode === 'split') && playerRef.current && (
        <MinecraftHUD
          hotbar={playerRef.current.hotbar}
          selectedSlot={selectedSlot}
          onSelectSlot={(slot) => {
            if (playerRef.current) {
              playerRef.current.selectHotbarIndex(slot);
              setSelectedSlot(slot);
            }
          }}
          digProgress={digProgress}
          isPointerLocked={isPointerLocked}
          onLockPointer={requestPointerLock}
          flyMode={playerRef.current.config.flyMode}
          creativeMode={playerRef.current.config.creativeMode}
        />
      )}

      {/* Scene View 3D Orientation Gizmo */}
      {viewMode === 'scene' && (
        <UnitySceneGizmo
          rotation={[sceneCamState.current.pitch, sceneCamState.current.yaw, 0]}
        />
      )}

      {/* Unity Engine Profiler Stats Window */}
      {showStats && (
        <UnityStats
          stats={engineStats}
          onClose={onToggleStats}
        />
      )}

      {/* Scene View Watermark / Help Badge */}
      {viewMode === 'scene' && (
        <div className="absolute top-3 left-3 bg-[#1e1e1ecc] border border-[#3e3e3e] px-2.5 py-1 rounded text-[11px] text-[#aaaaaa] pointer-events-none flex items-center space-x-2">
          <span className="font-bold text-white">Scene View</span>
          <span>| Hold Right-Click + WASD to fly camera | Scroll to zoom</span>
        </div>
      )}
    </div>
  );
};
