import React from 'react';
import { Terminal, Activity, Settings, Trash2, Compass, Grid, Sparkles } from 'lucide-react';

interface MacDockProps {
  isWindowMinimized: boolean;
  onRestoreWindow: () => void;
  onOpenBuildSettings: () => void;
  onOpenAbout: () => void;
  onToggleTerminal: () => void;
}

export const MacDock: React.FC<MacDockProps> = ({
  isWindowMinimized,
  onRestoreWindow,
  onOpenBuildSettings,
  onOpenAbout,
  onToggleTerminal,
}) => {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto">
      <div className="flex items-end space-x-2 bg-[#202025cc] backdrop-blur-2xl border border-[#ffffff20] px-3 py-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
        {/* Finder */}
        <div
          onClick={onRestoreWindow}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#28b2ff] to-[#006ee6] flex items-center justify-center shadow-lg border border-[#ffffff30] overflow-hidden">
            {/* Finder Two-Face */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="w-3.5 h-7 border-r-2 border-white/80 rounded-l-full" />
              <div className="w-3.5 h-7 border-l-2 border-white/80 rounded-r-full" />
              <div className="absolute top-2 left-1.5 w-1 h-1 bg-white rounded-full" />
              <div className="absolute top-2 right-1.5 w-1 h-1 bg-white rounded-full" />
              <div className="absolute bottom-2.5 w-3.5 h-1 border-b-2 border-white rounded-full" />
            </div>
          </div>
          <span className="w-1 h-1 bg-white/70 rounded-full mt-0.5" />
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            Finder
          </span>
        </div>

        {/* Launchpad */}
        <div
          onClick={onOpenAbout}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#7e7e82] to-[#48484a] flex items-center justify-center shadow-lg border border-[#ffffff30]">
            <Grid size={20} className="text-white" />
          </div>
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            Launchpad
          </span>
        </div>

        {/* UnityCraft (Main App) */}
        <div
          onClick={onRestoreWindow}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-115"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] flex items-center justify-center shadow-2xl border-2 border-[#007aff] relative overflow-hidden ring-2 ring-[#007aff50]">
            {/* Minecraft Voxel Cube Icon with Unity branding */}
            <div className="w-8 h-8 rounded bg-[#4d8b36] border border-[#2b591b] flex flex-col overflow-hidden shadow-inner">
              <div className="h-2.5 bg-[#5b9e3f]" />
              <div className="flex-1 bg-[#7a5a3a] flex items-center justify-center">
                <span className="font-extrabold text-[10px] text-white tracking-tighter">U</span>
              </div>
            </div>
            {/* Active shine */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-cyan-400/40 rounded-bl-full" />
          </div>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-0.5 shadow-[0_0_6px_#3b82f6]" />
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap font-medium">
            UnityCraft {isWindowMinimized ? '(Minimized - Click to Open)' : '(Active)'}
          </span>
        </div>

        {/* Terminal */}
        <div
          onClick={onToggleTerminal}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#2c2c2e] to-[#000000] flex items-center justify-center shadow-lg border border-[#ffffff30]">
            <Terminal size={19} className="text-white" />
          </div>
          <span className="w-1 h-1 bg-white/70 rounded-full mt-0.5" />
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            Terminal (Console)
          </span>
        </div>

        {/* Activity Monitor (Stats) */}
        <div
          onClick={onOpenBuildSettings}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#3a3a3c] to-[#242426] flex items-center justify-center shadow-lg border border-[#ffffff30]">
            <Activity size={19} className="text-emerald-400" />
          </div>
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            Metal GPU Profiler
          </span>
        </div>

        {/* System Settings */}
        <div
          onClick={onOpenBuildSettings}
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#8e8e93] to-[#636366] flex items-center justify-center shadow-lg border border-[#ffffff30]">
            <Settings size={19} className="text-white" />
          </div>
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            macOS Build Settings
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-white/20 my-auto mx-1" />

        {/* Trash */}
        <div className="group relative flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-110">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#636366] to-[#3a3a3c] flex items-center justify-center shadow-lg border border-[#ffffff30]">
            <Trash2 size={18} className="text-[#d1d1d6]" />
          </div>
          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 bg-[#1e1e20ee] backdrop-blur border border-[#444] rounded text-[11px] text-white shadow whitespace-nowrap">
            Trash
          </span>
        </div>
      </div>
    </div>
  );
};
