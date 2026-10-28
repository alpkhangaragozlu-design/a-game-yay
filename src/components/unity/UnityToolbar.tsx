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
  Layers,
  Volume2,
  VolumeX,
  Activity,
  Sliders,
  Tv,
  Eye,
  Columns
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
  isMaximized,
}) => {
  return (
    <div className="h-10 bg-[#1e1e1e] border-b border-[#303030] text-[#c4c4c4] flex items-center justify-between px-3 text-xs select-none shadow-sm z-30">
      {/* Left: Unity Tools (Hand, Move, Rotate, Scale, Rect) */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center bg-[#282828] rounded border border-[#3c3c3c] p-0.5">
          <button
            onClick={() => onSelectTool('hand')}
            title="Hand Tool (Q)"
            className={`p-1.5 rounded transition ${activeTool === 'hand' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#383838] text-[#8e8e8e]'}`}
          >
            <Hand size={14} />
          </button>
          <button
            onClick={() => onSelectTool('move')}
            title="Move Tool (W)"
            className={`p-1.5 rounded transition ${activeTool === 'move' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#383838] text-[#8e8e8e]'}`}
          >
            <Move size={14} />
          </button>
          <button
            onClick={() => onSelectTool('rotate')}
            title="Rotate Tool (E)"
            className={`p-1.5 rounded transition ${activeTool === 'rotate' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#383838] text-[#8e8e8e]'}`}
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={() => onSelectTool('scale')}
            title="Scale Tool (R)"
            className={`p-1.5 rounded transition ${activeTool === 'scale' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#383838] text-[#8e8e8e]'}`}
          >
            <Box size={14} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#3a3a3a] mx-2" />

        {/* Pivot / Global */}
        <div className="hidden sm:flex items-center space-x-1">
          <span className="px-2 py-1 bg-[#282828] border border-[#3a3a3a] rounded text-[11px] font-medium text-[#aaaaaa]">
            Pivot
          </span>
          <span className="px-2 py-1 bg-[#282828] border border-[#3a3a3a] rounded text-[11px] font-medium text-[#aaaaaa]">
            Global
          </span>
        </div>
      </div>

      {/* Center: Unity Play / Pause / Step Controls */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center bg-[#252525] border border-[#3a3a3a] rounded p-0.5 shadow-inner">
          <button
            onClick={onPlayToggle}
            title={isPlaying ? 'Stop Game' : 'Play Game (Ctrl+P)'}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition font-semibold ${
              isPlaying
                ? 'bg-[#2b6cb0] text-white shadow-sm ring-1 ring-[#4299e1]'
                : 'hover:bg-[#383838] text-[#999999]'
            }`}
          >
            <Play size={13} fill={isPlaying ? 'currentColor' : 'none'} />
            <span className="text-[11px] tracking-wide">{isPlaying ? 'PLAYING' : 'PLAY'}</span>
          </button>

          <button
            onClick={onPauseToggle}
            title="Pause (Ctrl+Shift+P)"
            className={`p-1.5 rounded transition ${
              isPaused ? 'bg-[#c53030] text-white' : 'hover:bg-[#383838] text-[#888888]'
            }`}
          >
            <Pause size={13} />
          </button>

          <button
            onClick={onStep}
            title="Step One Frame"
            className="p-1.5 rounded hover:bg-[#383838] text-[#888888] transition"
          >
            <SkipForward size={13} />
          </button>
        </div>
      </div>

      {/* Right: Viewport mode, Stats, Layout & Audio */}
      <div className="flex items-center space-x-2">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#282828] border border-[#3c3c3c] rounded p-0.5">
          <button
            onClick={() => onSelectViewMode('game')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] transition ${
              viewMode === 'game' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#353535] text-[#9e9e9e]'
            }`}
            title="Game View (Minecraft Player)"
          >
            <Tv size={12} />
            <span className="hidden md:inline">Game</span>
          </button>
          <button
            onClick={() => onSelectViewMode('scene')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] transition ${
              viewMode === 'scene' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#353535] text-[#9e9e9e]'
            }`}
            title="Scene View (Unity Editor Camera)"
          >
            <Eye size={12} />
            <span className="hidden md:inline">Scene</span>
          </button>
          <button
            onClick={() => onSelectViewMode('split')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] transition ${
              viewMode === 'split' ? 'bg-[#3b5998] text-white' : 'hover:bg-[#353535] text-[#9e9e9e]'
            }`}
            title="Split View (Scene & Game)"
          >
            <Columns size={12} />
            <span className="hidden md:inline">Split</span>
          </button>
        </div>

        {/* Stats overlay toggle */}
        <button
          onClick={onToggleStats}
          title="Toggle Unity Stats Profiler"
          className={`p-1.5 rounded border border-[#3c3c3c] transition ${
            showStats ? 'bg-[#2b6cb0] text-white' : 'bg-[#282828] hover:bg-[#383838] text-[#8e8e8e]'
          }`}
        >
          <Activity size={13} />
        </button>

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className={`p-1.5 rounded border border-[#3c3c3c] transition ${
            isMuted ? 'bg-[#822727] text-white' : 'bg-[#282828] hover:bg-[#383838] text-[#8e8e8e]'
          }`}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {/* Maximize Toggle */}
        <button
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restore Unity Windows' : 'Maximize Minecraft Viewport'}
          className={`p-1.5 rounded border border-[#3c3c3c] transition ${
            isMaximized ? 'bg-[#3b5998] text-white' : 'bg-[#282828] hover:bg-[#383838] text-[#8e8e8e]'
          }`}
        >
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
};
