import React from 'react';
import { EngineStats } from '../../engine/types';

interface UnityStatsProps {
  stats: EngineStats;
  onClose: () => void;
}

export const UnityStats: React.FC<UnityStatsProps> = ({ stats, onClose }) => {
  return (
    <div className="absolute top-3 right-3 bg-[#1e1e1ecc] border border-[#3e3e3e] rounded shadow-2xl p-3 text-xs text-[#c0c0c0] font-mono z-20 pointer-events-auto backdrop-blur-none w-56 select-none">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#333333] mb-2 font-sans">
        <span className="font-bold text-[11px] text-[#e0e0e0] uppercase tracking-wider">
          Unity Profiler Stats
        </span>
        <button
          onClick={onClose}
          className="text-[#888888] hover:text-white px-1 text-sm font-bold"
        >
          ×
        </button>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between items-center text-green-400 font-semibold">
          <span>Framerate:</span>
          <span>{stats.fps} FPS ({(1000 / Math.max(stats.fps, 1)).toFixed(1)} ms)</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Draw Calls:</span>
          <span className="text-white">{stats.drawCalls} batches</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Triangles:</span>
          <span className="text-white">{(stats.triangles / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Active Voxels:</span>
          <span className="text-white">{(stats.totalVoxels / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Loaded Chunks:</span>
          <span className="text-white">{stats.loadedChunks}</span>
        </div>

        <div className="pt-1.5 border-t border-[#333333] space-y-1">
          <div className="flex justify-between items-center text-[#888888]">
            <span>Player XYZ:</span>
            <span className="text-white font-mono">
              {stats.playerPos[0].toFixed(1)}, {stats.playerPos[1].toFixed(1)}, {stats.playerPos[2].toFixed(1)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[#888888]">
            <span>Time:</span>
            <span className="text-amber-300">
              {Math.floor(stats.timeOfDay).toString().padStart(2, '0')}:
              {Math.floor((stats.timeOfDay % 1) * 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
