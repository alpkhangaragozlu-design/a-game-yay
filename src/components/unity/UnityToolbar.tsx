import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Hand,
  Move,
  RotateCw,
  Maximize2,
  Box,
  Volume2,
  VolumeX,
  Activity,
  Tv,
  Eye,
  Columns,
  Cpu
} from 'lucide-react';
import { UnityTool, EditorViewMode } from '../../engine/types';

interface UnityToolbarProps {
  isPlaying: boolean;
  isPaused: boolean;
  activeTool: UnityTool;
  viewMode: EditorViewMode;
  showStats: boolean;
  isMuted: boolean;
  onPlayToggle: () => void;
  onPauseToggle: () => void;
  onStep: () => void;
  onSelectTool: (tool: UnityTool) => void;
  onSelectViewMode: (mode: EditorViewMode) => void;
  onToggleStats: () => void;
  onToggleMute: () => void;
  onToggleMaximize: () => void;
  onMinimizeWindow: () => void;
  isMaximized: boolean;
}

export const UnityToolbar: React.FC<UnityToolbarProps> = ({
  isPlaying,
  isPaused,
  activeTool,
  viewMode,
  showStats,
  isMuted,
  onPlayToggle,
  onPauseToggle,
  onStep,
  onSelectTool,
  onSelectViewMode,
  onToggleStats,
  onToggleMute,
  onToggleMaximize,
  onMinimizeWindow,
  isMaximized,
}) => {
  return (
    <div className="h-10 bg-[#1f1f22] border-b border-[#303033] text-[#c4c4c8] flex items-center justify-between px-3 text-xs select-none shadow-sm z-30 font-sans">
      {/* Left: macOS Window Traffic Lights + Unity Tools */}
      <div className="flex items-center space-x-3">
        {/* macOS Traffic Lights */}
        <div className="flex items-center space-x-2 mr-1">
          <button
            onClick={onMinimizeWindow}
            title="Close / Minimize to Dock (⌘W)"
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 flex items-center justify-center group cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-black/80 font-bold text-[8px] leading-none">
              ×
            </span>
          </button>
          <button
            onClick={onMinimizeWindow}
            title="Minimize Window (⌘M)"
            className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] hover:brightness-110 flex items-center justify-center group cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-black/80 font-bold text-[8px] leading-none mb-0.5">
              -
            </span>
          </button>
          <button
            onClick={onToggleMaximize}
            title={isMaximized ? 'Exit Full Screen' : 'Enter Full Screen (⌃⌘F)'}
            className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-110 flex items-center justify-center group cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-black/80 font-bold text-[7px] leading-none">
              +
            </span>
          </button>
        </div>

        {/* Tools Palette */}
        <div className="flex items-center bg-[#28282b] rounded-md border border-[#3c3c40] p-0.5 shadow-inner">
          <button
            onClick={() => onSelectTool('hand')}
            title="Hand Tool (Q)"
            className={`p-1.5 rounded transition ${activeTool === 'hand' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#38383c] text-[#8e8e93]'}`}
          >
            <Hand size={13} />
          </button>
          <button
            onClick={() => onSelectTool('move')}
            title="Move Tool (W)"
            className={`p-1.5 rounded transition ${activeTool === 'move' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#38383c] text-[#8e8e93]'}`}
          >
            <Move size={13} />
          </button>
          <button
            onClick={() => onSelectTool('rotate')}
            title="Rotate Tool (E)"
            className={`p-1.5 rounded transition ${activeTool === 'rotate' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#38383c] text-[#8e8e93]'}`}
          >
            <RotateCw size={13} />
          </button>
          <button
            onClick={() => onSelectTool('scale')}
            title="Scale Tool (R)"
            className={`p-1.5 rounded transition ${activeTool === 'scale' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#38383c] text-[#8e8e93]'}`}
          >
            <Box size={13} />
          </button>
        </div>

        {/* Pivot / Global */}
        <div className="hidden lg:flex items-center space-x-1 text-[11px]">
          <span className="px-2 py-0.5 bg-[#28282b] border border-[#3a3a3e] rounded text-[#a1a1a6]">
            Pivot
          </span>
          <span className="px-2 py-0.5 bg-[#28282b] border border-[#3a3a3e] rounded text-[#a1a1a6]">
            Global
          </span>
        </div>
      </div>

      {/* Center: Unity Play / Pause / Step Controls */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center bg-[#252528] border border-[#3a3a3e] rounded-md p-0.5 shadow-inner">
          <button
            onClick={onPlayToggle}
            title={isPlaying ? 'Stop Game (⌘P)' : 'Play Game (⌘P)'}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition font-semibold ${
              isPlaying
                ? 'bg-[#007aff] text-white shadow-sm ring-1 ring-[#3395ff]'
                : 'hover:bg-[#353538] text-[#999999]'
            }`}
          >
            <Play size={12} fill={isPlaying ? 'currentColor' : 'none'} />
            <span className="text-[11px] tracking-wide">{isPlaying ? 'PLAYING' : 'PLAY'}</span>
          </button>

          <button
            onClick={onPauseToggle}
            title="Pause Simulation (⇧⌘P)"
            className={`p-1.5 rounded transition ${
              isPaused ? 'bg-[#ff3b30] text-white' : 'hover:bg-[#353538] text-[#888888]'
            }`}
          >
            <Pause size={12} />
          </button>

          <button
            onClick={onStep}
            title="Step One Frame (⌥⌘P)"
            className="p-1.5 rounded hover:bg-[#353538] text-[#888888] transition"
          >
            <SkipForward size={12} />
          </button>
        </div>
      </div>

      {/* Right: Viewport mode, Stats, Layout & Audio */}
      <div className="flex items-center space-x-2">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#28282b] border border-[#3c3c40] rounded-md p-0.5">
          <button
            onClick={() => onSelectViewMode('game')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              viewMode === 'game' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#353538] text-[#8e8e93]'
            }`}
            title="Game View (Minecraft Steve)"
          >
            <Tv size={12} />
            <span className="hidden md:inline">Game</span>
          </button>
          <button
            onClick={() => onSelectViewMode('scene')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              viewMode === 'scene' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#353538] text-[#8e8e93]'
            }`}
            title="Scene View (Unity Editor Camera)"
          >
            <Eye size={12} />
            <span className="hidden md:inline">Scene</span>
          </button>
          <button
            onClick={() => onSelectViewMode('split')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
              viewMode === 'split' ? 'bg-[#007aff] text-white shadow-sm' : 'hover:bg-[#353538] text-[#8e8e93]'
            }`}
            title="Split View (Scene &amp; Game)"
          >
            <Columns size={12} />
            <span className="hidden md:inline">Split</span>
          </button>
        </div>

        {/* Metal Engine Profiler toggle */}
        <button
          onClick={onToggleStats}
          title="Metal GPU Profiler &amp; Stats"
          className={`p-1.5 rounded-md border border-[#3c3c40] transition ${
            showStats ? 'bg-[#007aff] text-white shadow-sm' : 'bg-[#28282b] hover:bg-[#38383c] text-[#8e8e93]'
          }`}
        >
          <Activity size={13} />
        </button>

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className={`p-1.5 rounded-md border border-[#3c3c40] transition ${
            isMuted ? 'bg-[#ff3b30] text-white' : 'bg-[#28282b] hover:bg-[#38383c] text-[#8e8e93]'
          }`}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Maximize Toggle */}
        <button
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restore Unity Mac Editor' : 'Maximize Minecraft Viewport (⌃⌘F)'}
          className={`p-1.5 rounded-md border border-[#3c3c40] transition ${
            isMaximized ? 'bg-[#007aff] text-white shadow-sm' : 'bg-[#28282b] hover:bg-[#38383c] text-[#8e8e93]'
          }`}
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};
