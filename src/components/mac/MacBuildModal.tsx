import React, { useState } from 'react';
import { Apple, Cpu, ShieldCheck, Play, CheckCircle2, Download, Monitor, X } from 'lucide-react';

interface MacBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunStandalone: () => void;
  onLog: (type: 'log' | 'warning' | 'error', message: string) => void;
}

export const MacBuildModal: React.FC<MacBuildModalProps> = ({
  isOpen,
  onClose,
  onRunStandalone,
  onLog,
}) => {
  const [platform, setPlatform] = useState<'mac' | 'ios' | 'web'>('mac');
  const [architecture, setArchitecture] = useState<'arm64' | 'universal' | 'x86_64'>('arm64');
  const [graphicsApi, setGraphicsApi] = useState<'metal3' | 'metal2'>('metal3');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildDone, setBuildDone] = useState(false);

  if (!isOpen) return null;

  const handleBuildAndRun = () => {
    setIsBuilding(true);
    setBuildProgress(15);
    onLog('log', '[BuildPipeline] Compiling IL2CPP C# scripts for macOS Apple Silicon (arm64)...');

    setTimeout(() => {
      setBuildProgress(45);
      onLog('log', '[BuildPipeline] Generating Metal Shader Library (MSL) & Texture Atlas PBR...');
    }, 500);

    setTimeout(() => {
      setBuildProgress(80);
      onLog('log', '[BuildPipeline] Linking UnityPlayer.dylib & packaging UnityCraft.app bundle...');
    }, 1100);

    setTimeout(() => {
      setBuildProgress(100);
      setIsBuilding(false);
      setBuildDone(true);
      onLog('log', '[BuildPipeline] Build Succeeded: UnityCraft.app (Universal Binary) created successfully!');
    }, 1600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#28282bee] backdrop-blur-2xl border border-[#48484a] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-[#e5e5ea] font-sans">
        {/* macOS Window Header */}
        <div className="h-9 bg-[#202022] border-b border-[#38383a] px-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 flex items-center justify-center text-black/70 text-[9px]"
            >
              ×
            </button>
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>

          <span className="font-semibold text-xs text-[#d1d1d6]">
            Build Settings — macOS Standalone
          </span>

          <div className="w-12" />
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Platform Selection */}
          <div className="grid grid-cols-3 gap-2">
            <div
              onClick={() => setPlatform('mac')}
              className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col items-center text-center ${
                platform === 'mac'
                  ? 'bg-[#007aff25] border-[#007aff] text-white shadow-sm'
                  : 'bg-[#1e1e20] border-[#38383a] hover:border-[#555]'
              }`}
            >
              <Apple size={22} className="mb-1 text-white" />
              <span className="font-semibold">macOS</span>
              <span className="text-[10px] text-[#8e8e93]">Apple Silicon &amp; Intel</span>
            </div>

            <div
              onClick={() => setPlatform('ios')}
              className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col items-center text-center ${
                platform === 'ios'
                  ? 'bg-[#007aff25] border-[#007aff] text-white shadow-sm'
                  : 'bg-[#1e1e20] border-[#38383a] hover:border-[#555]'
              }`}
            >
              <Monitor size={22} className="mb-1 text-blue-400" />
              <span className="font-semibold">iPadOS / iOS</span>
              <span className="text-[10px] text-[#8e8e93]">Metal Native</span>
            </div>

            <div
              onClick={() => setPlatform('web')}
              className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col items-center text-center ${
                platform === 'web'
                  ? 'bg-[#007aff25] border-[#007aff] text-white shadow-sm'
                  : 'bg-[#1e1e20] border-[#38383a] hover:border-[#555]'
              }`}
            >
              <Cpu size={22} className="mb-1 text-emerald-400" />
              <span className="font-semibold">WebGPU / WebGL</span>
              <span className="text-[10px] text-[#8e8e93]">In-Browser</span>
            </div>
          </div>

          {/* macOS Specific Options */}
          <div className="bg-[#1e1e20] border border-[#38383a] rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold block text-[#f2f2f7]">Target Architecture</span>
                <span className="text-[10.5px] text-[#8e8e93]">Optimized for Apple M-Series chips</span>
              </div>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value as any)}
                className="bg-[#2c2c2e] border border-[#48484a] rounded px-2 py-1 text-white text-xs outline-none"
              >
                <option value="arm64">Apple Silicon (arm64 - M1/M2/M3/M4)</option>
                <option value="universal">Universal 2 (Apple Silicon + Intel)</option>
                <option value="x86_64">Intel 64-bit (x86_64)</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#2e2e30]">
              <div>
                <span className="font-semibold block text-[#f2f2f7]">Graphics API</span>
                <span className="text-[10.5px] text-[#8e8e93]">Low-overhead Apple Metal acceleration</span>
              </div>
              <select
                value={graphicsApi}
                onChange={(e) => setGraphicsApi(e.target.value as any)}
                className="bg-[#2c2c2e] border border-[#48484a] rounded px-2 py-1 text-white text-xs outline-none"
              >
                <option value="metal3">Metal 3 (Raytracing &amp; Mesh Shaders)</option>
                <option value="metal2">Metal 2 (Legacy)</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#2e2e30]">
              <div>
                <span className="font-semibold block text-[#f2f2f7]">Retina Display HiDPI</span>
                <span className="text-[10.5px] text-[#8e8e93]">Render at full native 2x display resolution</span>
              </div>
              <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center space-x-1">
                <CheckCircle2 size={13} />
                <span>Enabled</span>
              </span>
            </div>
          </div>

          {/* Build Progress Bar */}
          {isBuilding && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#a1a1a6]">
                <span>Packaging UnityCraft.app for macOS...</span>
                <span>{buildProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#1a1a1c] rounded-full overflow-hidden border border-[#333]">
                <div
                  className="h-full bg-[#007aff] transition-all duration-300 rounded-full"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
            </div>
          )}

          {buildDone && (
            <div className="bg-[#1c3829] border border-[#2f855a] rounded-lg p-2.5 flex items-center justify-between text-[#81e6d9]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="font-medium text-xs text-white">
                  Build Complete: UnityCraft.app Ready!
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRunStandalone();
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs shadow transition"
              >
                Launch Standalone App
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-12 bg-[#202022] border-t border-[#38383a] px-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#323236] hover:bg-[#3e3e42] rounded text-white text-xs transition"
          >
            Cancel
          </button>

          <div className="flex space-x-2">
            <button
              disabled={isBuilding}
              onClick={handleBuildAndRun}
              className="px-4 py-1.5 bg-[#007aff] hover:bg-[#006ee6] disabled:opacity-50 text-white rounded font-medium text-xs flex items-center space-x-1.5 shadow transition"
            >
              <Play size={12} fill="currentColor" />
              <span>{isBuilding ? 'Building...' : 'Build And Run (.app)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
