import React, { useState, useCallback, useEffect } from 'react';
import {
  Sun,
  User,
  Box,
  CloudFog,
  Sparkles,
  Volume2,
  CheckCircle2,
  ChevronDown,
  Layers,
  Monitor
} from 'lucide-react';
import { MacMenuBar } from './components/mac/MacMenuBar';
import { MacDock } from './components/mac/MacDock';
import { MacBuildModal } from './components/mac/MacBuildModal';
import { MacAboutModal } from './components/mac/MacAboutModal';
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
  // Unity Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<UnityTool>('move');
  const [viewMode, setViewMode] = useState<EditorViewMode>('game');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // macOS Specific State
  const [isWindowMinimized, setIsWindowMinimized] = useState<boolean>(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [isStandaloneMode, setIsStandaloneMode] = useState<boolean>(false);

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
      message: '[Unity macOS] Initialized Unity 2026.2.4f1 for Apple Silicon (ARM64)',
      time: '05:41:00',
    },
    {
      id: '2',
      type: 'log',
      message: '[Metal] Pipeline state configured with Metal 3.1 & Hardware Accelerated Shaders',
      time: '05:41:01',
    },
    {
      id: '3',
      type: 'log',
      message: '[VoxelWorld] Initialized 25 chunk buffers with face-culling mesher.',
      time: '05:41:02',
    },
  ]);

  const addLog = useCallback((type: 'log' | 'warning' | 'error', message: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [
      ...prev.slice(-99),
      {
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        time: timeStr,
      },
    ]);
  }, []);

  // Save Scene Action
  const handleSaveScene = useCallback(() => {
    soundEngine.playUIBeep(880);
    setSaveNotification('Scene Saved: Assets/Scenes/Minecraft_Overworld.unity');
    addLog('log', '[SceneManager] Saved "Minecraft_Overworld.unity" to macOS filesystem');
    setTimeout(() => {
      setSaveNotification(null);
    }, 2800);
  }, [addLog]);

  // Mac Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command (⌘) shortcuts on Mac
      if (e.metaKey || e.ctrlKey) {
        if (e.code === 'KeyP') {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          soundEngine.playUIBeep(700);
        } else if (e.code === 'KeyS') {
          e.preventDefault();
          handleSaveScene();
        } else if (e.code === 'KeyB') {
          e.preventDefault();
          setIsBuildModalOpen(true);
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          setIsWindowMinimized(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveScene]);

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
    <div className="flex flex-col h-screen w-screen bg-[#121214] text-[#cccccc] font-sans overflow-hidden select-none relative">
      {/* 1. macOS Global Menu Bar */}
      <MacMenuBar
        isPlaying={isPlaying}
        onPlayToggle={() => setIsPlaying(!isPlaying)}
        onOpenBuildSettings={() => setIsBuildModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onSaveScene={handleSaveScene}
        onSelectViewMode={(mode) => setViewMode(mode)}
        viewMode={viewMode}
        onToggleStats={() => setShowStats(!showStats)}
        showStats={showStats}
      />

      {/* macOS Save Notification Toast */}
      {saveNotification && (
        <div className="absolute top-9 right-4 bg-[#1e1e24ee] backdrop-blur-xl border border-[#3e3e44] text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center space-x-2.5 z-50 animate-bounce text-xs font-sans">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="font-medium">{saveNotification}</span>
        </div>
      )}

      {/* Standalone macOS App Mode (Launched from Build Settings) */}
      {isStandaloneMode ? (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
          {/* Minimal Mac Window Title for Standalone .app */}
          <div className="h-8 bg-[#1e1e22] border-b border-[#303033] px-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsStandaloneMode(false)}
                className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 flex items-center justify-center text-black font-bold text-[8px]"
                title="Exit Standalone App"
              >
                ×
              </button>
              <span className="font-semibold text-white ml-2">UnityCraft.app (Standalone Mac Player)</span>
            </div>

            <button
              onClick={() => setIsStandaloneMode(false)}
              className="px-2.5 py-0.5 bg-[#323236] hover:bg-[#3e3e42] text-xs rounded text-white transition"
            >
              Back to Unity Editor
            </button>
          </div>

          <div className="flex-1 relative">
            <ViewportContainer
              viewMode="game"
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
        </div>
      ) : isWindowMinimized ? (
        /* macOS Desktop Wallpaper when window is minimized */
        <div
          onClick={() => setIsWindowMinimized(false)}
          className="flex-1 bg-gradient-to-tr from-[#0f172a] via-[#1e1b4b] to-[#311042] flex flex-col items-center justify-center cursor-pointer relative"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] flex items-center justify-center shadow-2xl border-2 border-[#007aff] animate-pulse">
              <div className="w-14 h-14 rounded-lg bg-[#4d8b36] flex flex-col overflow-hidden">
                <div className="h-4 bg-[#5b9e3f]" />
                <div className="flex-1 bg-[#7a5a3a] flex items-center justify-center text-white font-bold">
                  U
                </div>
              </div>
            </div>
            <h2 className="text-white font-semibold text-sm">UnityCraft is Minimized</h2>
            <p className="text-xs text-[#8e8e93]">Click anywhere or click the Dock icon below to restore</p>
          </div>
        </div>
      ) : (
        /* 2. Main macOS Unity Editor Window */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* macOS Unity Window Title Bar with Document Proxy */}
          <div className="h-7 bg-[#1c1c1f] border-b border-[#2d2d30] px-3 flex items-center justify-between text-[11.5px] text-[#8e8e93]">
            <div className="flex items-center space-x-2">
              {/* Document proxy icon */}
              <div className="w-3.5 h-3.5 rounded bg-[#4d8b36] border border-[#2b591b] flex flex-col overflow-hidden">
                <div className="h-1 bg-[#5b9e3f]" />
                <div className="flex-1 bg-[#7a5a3a]" />
              </div>
              <span className="font-medium text-[#d1d1d6]">
                Minecraft_Overworld.unity — Unity 2026.2 (macOS Apple Silicon · Metal 3)
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-3 text-[11px] text-[#a1a1a6]">
              <span className="hover:text-white cursor-pointer" onClick={() => setIsBuildModalOpen(true)}>
                Build Settings (⇧⌘B)
              </span>
              <span>·</span>
              <span className="text-cyan-400 font-mono font-medium">Metal HiDPI</span>
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
            onMinimizeWindow={() => setIsWindowMinimized(true)}
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
          <div className="h-5 bg-[#19191c] border-t border-[#2c2c30] px-3 flex items-center justify-between text-[10px] text-[#77777a]">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate">
                {logs.length > 0 ? logs[logs.length - 1].message : 'Ready'}
              </span>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0 font-mono">
              <span className="text-cyan-400">Metal 3.1</span>
              <span>{viewMode.toUpperCase()} VIEW</span>
              <span>FPS: 60</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. macOS Floating Dock */}
      <MacDock
        isWindowMinimized={isWindowMinimized}
        onRestoreWindow={() => setIsWindowMinimized(false)}
        onOpenBuildSettings={() => setIsBuildModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onToggleTerminal={() => addLog('log', '[Terminal] Opened bash / zsh shell at ~/UnityCraft')}
      />

      {/* 4. macOS Modals */}
      <MacBuildModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        onRunStandalone={() => setIsStandaloneMode(true)}
        onLog={addLog}
      />

      <MacAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
