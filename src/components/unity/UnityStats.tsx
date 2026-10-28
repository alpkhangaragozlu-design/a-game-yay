import React from 'react';
import { EngineStats } from '../../engine/types';
import { Cpu, Zap } from 'lucide-react';

interface UnityStatsProps {
  stats: EngineStats;
  onClose: () => void;
}

export const UnityStats: React.FC<UnityStatsProps> = ({ stats, onClose }) => {
  return (
    <div className="absolute top-3 right-3 bg-[#1e1e22f0] backdrop-blur-xl border border-[#48484a] rounded-xl shadow-2xl p-3.5 text-xs text-[#c0c0c5] font-mono z-20 pointer-events-auto w-64 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#38383c] mb-2.5 font-sans">
        <div className="flex items-center space-x-1.5">
          <Zap size={13} className="text-cyan-400" />
          <span className="font-bold text-[11px] text-[#f2f2f7] uppercase tracking-wider">
            Metal GPU Profiler
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[#888888] hover:text-white px-1 text-sm font-bold leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-1.5 text-[11px]">
        {/* Apple Silicon Hardware Tag */}
        <div className="bg-[#28282d] p-1.5 rounded-lg border border-[#3e3e44] flex items-center justify-between font-sans mb-1 text-[10px]">
          <span className="text-[#a1a1a6]">Graphics API:</span>
          <span className="font-semibold text-cyan-300">Apple Metal 3.1</span>
        </div>

        <div className="flex justify-between items-center text-emerald-400 font-semibold">
          <span>Framerate:</span>
          <span>{stats.fps} FPS ({(1000 / Math.max(stats.fps, 1)).toFixed(1)} ms)</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Metal Batches:</span>
          <span className="text-white font-mono">{stats.drawCalls} encoders</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Triangles:</span>
          <span className="text-white font-mono">{(stats.triangles / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Voxel Geometry:</span>
          <span className="text-white font-mono">{(stats.totalVoxels / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Loaded Chunks:</span>
          <span className="text-white font-mono">{stats.loadedChunks}</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Unified Memory:</span>
          <span className="text-white font-mono">1.2 GB / 18 GB</span>
        </div>

        <div className="flex justify-between items-center text-[#aaaaaa]">
          <span>Retina Display:</span>
          <span className="text-cyan-400 font-mono">HiDPI (2.0x)</span>
        </div>

        <div className="pt-2 border-t border-[#38383c] space-y-1">
          <div className="flex justify-between items-center text-[#888888]">
            <span>Steve XYZ:</span>
            <span className="text-white font-mono">
              {stats.playerPos[0].toFixed(1)}, {stats.playerPos[1].toFixed(1)}, {stats.playerPos[2].toFixed(1)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[#888888]">
            <span>Sun Time:</span>
            <span className="text-amber-300 font-mono">
              {Math.floor(stats.timeOfDay).toString().padStart(2, '0')}:
              {Math.floor((stats.timeOfDay % 1) * 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
