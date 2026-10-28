import React, { useState, useCallback } from 'react';
import {
  Sun,
  User,
  Box,
  CloudFog,
  Sparkles,
  Volume2,
  Sliders,
  Terminal,
  Folder
} from 'lucide-react';
import { UnityToolbar } from './components/unity/UnityToolbar';
import { UnityHierarchy, HierarchyItem } from './components/unity/UnityHierarchy';
import { UnityInspector } from './components/unity/UnityInspector';
import { UnityProject } from './components/unity/UnityProject';
import { ViewportContainer } from './components/game/ViewportContainer';
import { EditorViewMode, UnityTool, UnityLog, BlockType, EngineStats } from './engine/types';
import { WorldGeneratorType } from './engine/terrain';
import { PlayerConfig, DEFAULT_PLAYER_CONFIG } from './engine/player';
import { soundEngine } from './engine/audio';

export default function App() {
  // Unity State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<UnityTool>('move');
  const [viewMode, setViewMode] = useState<EditorViewMode>('game');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Selected GameObject in Hierarchy
  const [selectedObjectId, setSelectedObjectId] = useState<string>('player');

  // Player Settings (synced between Inspector & Viewport)
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig>(DEFAULT_PLAYER_CONFIG);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([16, 20, 16]);
  const [playerRot, setPlayerRot] = useState<[number, number, number]>([0, 0, 0]);

  // World Generation Settings (synced with Inspector)
  const [worldGenType, setWorldGenType] = useState<WorldGeneratorType>('plains');
  const [worldSeed, setWorldSeed] = useState<number>(4242);
  const [renderDistance, setRenderDistance] = useState<number>(2);
  const [timeOfDay, setTimeOfDay] = useState<number>(10.0);
  const [daySpeed, setDaySpeed] = useState<number>(0.05);
  const [sunIntensity, setSunIntensity] = useState<number>(1.4);

  // Active equipped block selected from Project tab
  const [equippedBlock, setEquippedBlock] = useState<BlockType | undefined>(undefined);
  const [selectedBlockInHand, setSelectedBlockInHand] = useState<BlockType>(BlockType.GRASS);

  // Console Logs
  const [logs, setLogs] = useState<UnityLog[]>([
    {
      id: '1',
      type: 'log',
      message: '[Unity] Loaded project "UnityCraft_Minecraft" (Unity Engine 2026.2.4f1)',
      time: '01:30:00',
    },
    {
      id: '2',
      type: 'log',
      message: '[VoxelWorld] Initialized 25 chunk buffers with face-culling mesher.',
      time: '01:30:01',
    },
  ]);

  const addLog = useCallback((type: 'log' | 'warning' | 'error', message: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [
      ...prev.slice(-99), // keep last 100 logs
      {
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        time: timeStr,
      },
    ]);
  }, []);

  // Hierarchy Item list
  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>([
    {
      id: 'player',
      name: 'Player (Steve)',
      type: 'Player',
      icon: <User size={13} className="text-cyan-400" />,
      active: true,
      tag: 'Player',
    },
    {
      id: 'world',
      name: 'VoxelWorld',
      type: 'VoxelWorld',
      icon: <Box size={13} className="text-emerald-400" />,
      active: true,
      tag: 'Untagged',
    },
    {
      id: 'sun',
      name: 'Directional Light (Sun)',
      type: 'Light',
      icon: <Sun size={13} className="text-amber-400" />,
      active: true,
      tag: 'Untagged',
    },
    {
      id: 'sky',
      name: 'Skybox & Dynamic Fog',
      type: 'Skybox',
      icon: <CloudFog size={13} className="text-blue-300" />,
      active: true,
      tag: 'Untagged',
    },
    {
      id: 'particles',
      name: 'ParticleSystem (BlockBreak)',
      type: 'Particles',
      icon: <Sparkles size={13} className="text-purple-400" />,
      active: true,
      tag: 'Untagged',
    },
    {
      id: 'audio',
      name: 'AudioListener',
      type: 'Audio',
      icon: <Volume2 size={13} className="text-rose-400" />,
      active: true,
      tag: 'Untagged',
    },
  ]);

  const handleToggleActive = (id: string) => {
    setHierarchyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
    addLog('log', `[Hierarchy] Toggled active state for GameObject '${id}'`);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#181818] text-[#cccccc] font-sans overflow-hidden select-none">
      {/* Unity Window Title Bar */}
      <div className="h-6 bg-[#161616] border-b border-[#282828] px-3 flex items-center justify-between text-[11px] text-[#8e8e8e]">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="font-medium text-[#aaaaaa]">
            Unity 2026.2.4f1 - Minecraft_Overworld.unity - UnityCraft Voxel Engine (64-bit)
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-[10.5px]">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">Assets</span>
          <span className="hover:text-white cursor-pointer">GameObject</span>
          <span className="hover:text-white cursor-pointer">Component</span>
          <span className="hover:text-white cursor-pointer">Window</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>
      </div>

      {/* Unity Main Toolbar */}
      <UnityToolbar
        isPlaying={isPlaying}
        isPaused={isPaused}
        activeTool={activeTool}
        viewMode={viewMode}
        showStats={showStats}
        isMuted={isMuted}
        onPlayToggle={() => {
          setIsPlaying(!isPlaying);
          addLog('log', isPlaying ? '[Engine] Simulation Stopped.' : '[Engine] Simulation Playing...');
        }}
        onPauseToggle={() => {
          setIsPaused(!isPaused);
          addLog('log', isPaused ? '[Engine] Resumed.' : '[Engine] Paused.');
        }}
        onStep={() => {
          addLog('log', '[Engine] Stepped 1 frame.');
        }}
        onSelectTool={(tool) => setActiveTool(tool)}
        onSelectViewMode={(mode) => {
          setViewMode(mode);
          addLog('log', `[Viewport] Switched view to '${mode.toUpperCase()} VIEW'`);
        }}
        onToggleStats={() => setShowStats(!showStats)}
        onToggleMute={handleToggleMute}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        isMaximized={isMaximized}
      />

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Hierarchy (Hidden if maximized) */}
        {!isMaximized && (
          <div className="w-56 h-full flex flex-col flex-shrink-0">
            <UnityHierarchy
              selectedId={selectedObjectId}
              onSelect={(id) => {
                setSelectedObjectId(id);
                soundEngine.playUIBeep(750);
              }}
              items={hierarchyItems}
              onToggleActive={handleToggleActive}
            />
          </div>
        )}

        {/* Center Panel: Viewport + Bottom Dock */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* 3D WebGL Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <ViewportContainer
              viewMode={viewMode}
              isPlaying={isPlaying}
              isPaused={isPaused}
              activeTool={activeTool}
              showStats={showStats}
              onToggleStats={() => setShowStats(!showStats)}
              playerConfig={playerConfig}
              worldGenType={worldGenType}
              worldSeed={worldSeed}
              renderDistance={renderDistance}
              timeOfDay={timeOfDay}
              daySpeed={daySpeed}
              sunIntensity={sunIntensity}
              onStatsUpdate={() => {}}
              onLog={addLog}
              onPlayerPosChange={(pos, rot) => {
                setPlayerPos(pos);
                setPlayerRot(rot);
              }}
              equippedBlock={equippedBlock}
            />
          </div>

          {/* Bottom Dock: Project (Assets) & Console (Hidden if maximized) */}
          {!isMaximized && (
            <UnityProject
              logs={logs}
              onClearLogs={() => setLogs([])}
              onEquipBlock={(block) => {
                setEquippedBlock(block);
                setSelectedBlockInHand(block);
              }}
              selectedBlock={selectedBlockInHand}
            />
          )}
        </div>

        {/* Right Panel: Inspector (Hidden if maximized) */}
        {!isMaximized && (
          <div className="w-72 h-full flex flex-col flex-shrink-0">
            <UnityInspector
              selectedId={selectedObjectId}
              playerPos={playerPos}
              playerRot={playerRot}
              playerConfig={playerConfig}
              onUpdatePlayerConfig={(newCfg) => setPlayerConfig((prev) => ({ ...prev, ...newCfg }))}
              onTeleportPlayer={(pos) => setPlayerPos(pos)}
              worldGenType={worldGenType}
              worldSeed={worldSeed}
              renderDistance={renderDistance}
              timeOfDay={timeOfDay}
              daySpeed={daySpeed}
              sunIntensity={sunIntensity}
              onUpdateWorldGen={(type) => setWorldGenType(type)}
              onUpdateSeed={(s) => setWorldSeed(s)}
              onUpdateRenderDistance={(d) => setRenderDistance(d)}
              onUpdateTimeOfDay={(t) => setTimeOfDay(t)}
              onUpdateDaySpeed={(spd) => setDaySpeed(spd)}
              onUpdateSunIntensity={(i) => setSunIntensity(i)}
              onRegenerateWorld={() => {
                setWorldSeed((prev) => prev + 1);
                addLog('log', '[VoxelWorld] Triggered world regenerate.');
              }}
            />
          </div>
        )}
      </div>

      {/* Unity Bottom Status Bar */}
      <div className="h-5 bg-[#1a1a1a] border-t border-[#2e2e2e] px-3 flex items-center justify-between text-[10px] text-[#777777]">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="truncate">
            {logs.length > 0 ? logs[logs.length - 1].message : 'Ready'}
          </span>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0 font-mono">
          <span>{viewMode.toUpperCase()} VIEW</span>
          <span>FPS: 60</span>
          <span>Col: 0</span>
        </div>
      </div>
    </div>
  );
}
