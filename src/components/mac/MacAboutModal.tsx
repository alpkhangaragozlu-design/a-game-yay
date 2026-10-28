import React from 'react';
import { Apple, Cpu, ShieldCheck, Sparkles, X } from 'lucide-react';

interface MacAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MacAboutModal: React.FC<MacAboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#252528f5] backdrop-blur-2xl border border-[#48484a] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden text-[#e5e5ea] font-sans">
        {/* Header with Traffic light close */}
        <div className="h-8 px-3 flex items-center justify-between border-b border-[#38383a]">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 flex items-center justify-center text-black/70 text-[9px]"
          >
            ×
          </button>
          <span className="text-[11px] text-[#8e8e93] font-medium">About This Mac App</span>
          <div className="w-3" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-3">
          {/* App Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] flex items-center justify-center shadow-2xl border-2 border-[#007aff] relative overflow-hidden">
            <div className="w-14 h-14 rounded-lg bg-[#4d8b36] border border-[#2b591b] flex flex-col overflow-hidden shadow-inner">
              <div className="h-4 bg-[#5b9e3f]" />
              <div className="flex-1 bg-[#7a5a3a] flex items-center justify-center">
                <span className="font-extrabold text-sm text-white tracking-tighter">U</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">UnityCraft for Mac</h2>
            <p className="text-xs text-[#a1a1a6]">Unity Engine 2026.2.4f1 (Apple Silicon)</p>
          </div>

          {/* Specs list */}
          <div className="w-full bg-[#1c1c1e] border border-[#38383a] rounded-lg p-3 text-left space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Platform:</span>
              <span className="font-medium text-white">macOS Sequoia / Sonoma (ARM64)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Chipset:</span>
              <span className="font-medium text-white flex items-center space-x-1">
                <span>Apple M-Series GPU</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Graphics API:</span>
              <span className="font-medium text-cyan-300">Metal 3 (Hardware Raytracing)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Memory:</span>
              <span className="font-medium text-white">Unified System Memory Architecture</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8e8e93]">Display:</span>
              <span className="font-medium text-white">Retina Display (HiDPI 2x)</span>
            </div>
          </div>

          <p className="text-[11px] text-[#8e8e93] leading-relaxed">
            Full Minecraft voxel sandbox with chunk face-culling meshing, procedural terrain generation, block mining/placing, and live Unity C# component inspector.
          </p>

          <button
            onClick={onClose}
            className="w-full py-1.5 bg-[#007aff] hover:bg-[#006ee6] text-white font-medium rounded-lg text-xs transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
