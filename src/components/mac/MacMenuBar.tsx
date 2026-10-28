import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Search,
  SlidersHorizontal,
  Check,
  Command,
  HelpCircle,
  Folder,
  Layers,
  Box,
  Play
} from 'lucide-react';
import { EditorViewMode } from '../../engine/types';

interface MacMenuBarProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onOpenBuildSettings: () => void;
  onOpenAbout: () => void;
  onSaveScene: () => void;
  onSelectViewMode: (mode: EditorViewMode) => void;
  viewMode: EditorViewMode;
  onToggleStats: () => void;
  showStats: boolean;
}

export const MacMenuBar: React.FC<MacMenuBarProps> = ({
  isPlaying,
  onPlayToggle,
  onOpenBuildSettings,
  onOpenAbout,
  onSaveScene,
  onSelectViewMode,
  viewMode,
  onToggleStats,
  showStats,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const date = now.getDate();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${dayName} ${monthName} ${date}  ${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.mac-menu-container')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  return (
    <div className="h-7 bg-[#1c1c1ee6] backdrop-blur-md border-b border-[#323236] text-[#e5e5ea] px-3 flex items-center justify-between text-[13px] font-sans select-none z-50 relative mac-menu-container">
      {/* Left Menu Items */}
      <div className="flex items-center space-x-1">
        {/* Apple Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('apple')}
            className={`px-2 py-0.5 rounded transition flex items-center justify-center ${
              activeMenu === 'apple' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            {/* Apple Logo SVG */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.64-14.01-6.1-9.46-10.9-20.12-14.4-31.98-3.5-11.87-5.25-23.23-5.25-34.1 0-14.02 3.65-25.79 10.96-35.31 7.3-9.52 16.48-14.38 27.53-14.58 5.66 0 11.75 1.52 18.27 4.57 6.53 3.05 10.74 4.63 12.65 4.75 1.74 0 6.13-1.63 13.17-4.89 7.03-3.26 13.06-4.7 18.08-4.32 13.88.76 24.8 5.48 32.76 14.16-12.18 7.39-18.15 17.51-17.92 30.34.22 10.23 4.13 18.82 11.74 25.78 3.59 3.26 7.6 5.76 12.04 7.5-2.61 7.61-5.77 15.12-9.48 22.52zM119.22 31.84c0-7.72 2.72-15.01 8.16-21.86 5.44-6.85 12.18-10.99 20.22-12.43.22 1.09.33 2.17.33 3.26 0 7.72-2.83 15.12-8.49 22.19-5.66 7.07-12.45 11.2-20.38 12.4-0.11-.98-.16-2.17-.16-3.56z" />
            </svg>
          </button>

          {activeMenu === 'apple' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  onOpenAbout();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>About UnityCraft (Mac)</span>
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  onOpenBuildSettings();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>System Settings...</span>
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Restart Unity Engine</span>
                <span className="text-[11px] opacity-60">⌘R</span>
              </button>
            </div>
          )}
        </div>

        {/* Unity Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('unity')}
            className={`font-semibold px-2 py-0.5 rounded transition ${
              activeMenu === 'unity' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            Unity
          </button>

          {activeMenu === 'unity' && (
            <div className="absolute left-0 mt-1 w-64 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  onOpenAbout();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>About Unity 2026 for Mac</span>
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  onOpenBuildSettings();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Preferences...</span>
                <span className="text-[11px] opacity-60">⌘,</span>
              </button>
              <button
                onClick={() => {
                  onToggleStats();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Metal GPU Profiler</span>
                {showStats && <Check size={12} className="text-blue-400" />}
              </button>
            </div>
          )}
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('file')}
            className={`px-2 py-0.5 rounded transition ${
              activeMenu === 'file' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            File
          </button>

          {activeMenu === 'file' && (
            <div className="absolute left-0 mt-1 w-64 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  window.location.reload();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>New Scene</span>
                <span className="text-[11px] opacity-60">⌘N</span>
              </button>
              <button
                onClick={() => {
                  onSaveScene();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Save Scene</span>
                <span className="text-[11px] opacity-60">⌘S</span>
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  onOpenBuildSettings();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between text-amber-300"
              >
                <span>Build Settings (macOS .app)...</span>
                <span className="text-[11px] opacity-60">⇧⌘B</span>
              </button>
              <button
                onClick={() => {
                  onOpenBuildSettings();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Build And Run</span>
                <span className="text-[11px] opacity-60">⌘B</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('edit')}
            className={`px-2 py-0.5 rounded transition ${
              activeMenu === 'edit' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            Edit
          </button>

          {activeMenu === 'edit' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  onPlayToggle();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>{isPlaying ? 'Pause Simulation' : 'Play Game'}</span>
                <span className="text-[11px] opacity-60">⌘P</span>
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  onOpenBuildSettings();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Project Settings...</span>
              </button>
            </div>
          )}
        </div>

        {/* Window Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('window')}
            className={`px-2 py-0.5 rounded transition ${
              activeMenu === 'window' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            Window
          </button>

          {activeMenu === 'window' && (
            <div className="absolute left-0 mt-1 w-56 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  onSelectViewMode('game');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Game View</span>
                {viewMode === 'game' && <Check size={12} className="text-blue-400" />}
              </button>
              <button
                onClick={() => {
                  onSelectViewMode('scene');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Scene View</span>
                {viewMode === 'scene' && <Check size={12} className="text-blue-400" />}
              </button>
              <button
                onClick={() => {
                  onSelectViewMode('split');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Split View</span>
                {viewMode === 'split' && <Check size={12} className="text-blue-400" />}
              </button>
              <div className="h-[1px] bg-[#3a3a3c] my-1" />
              <button
                onClick={() => {
                  onToggleStats();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Metal Engine Stats</span>
                {showStats && <Check size={12} className="text-blue-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('help')}
            className={`px-2 py-0.5 rounded transition ${
              activeMenu === 'help' ? 'bg-[#3a3a3c] text-white' : 'hover:bg-[#2c2c2e]'
            }`}
          >
            Help
          </button>

          {activeMenu === 'help' && (
            <div className="absolute left-0 mt-1 w-64 bg-[#252528f2] backdrop-blur-xl border border-[#3e3e42] rounded-lg shadow-2xl py-1 z-50 text-[12.5px] text-[#e5e5ea]">
              <button
                onClick={() => {
                  onOpenAbout();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Unity for macOS Documentation</span>
              </button>
              <button
                onClick={() => {
                  alert('Minecraft Controls:\n• Click to lock mouse & look\n• WASD: Walk / Fly\n• Space: Jump / Fly Up\n• Shift: Sprint / Fly Down\n• Left Click (hold): Mine block\n• Right Click: Place block\n• 1-9: Select hotbar slot\n• F: Toggle Fly mode\n• ESC: Release mouse pointer');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[#007aff] hover:text-white transition flex items-center justify-between"
              >
                <span>Minecraft Keyboard Controls</span>
                <span className="text-[11px] opacity-60">?</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Menu Items (macOS Status Icons) */}
      <div className="flex items-center space-x-3 text-[#d1d1d6] text-[12px]">
        {/* Apple Silicon / Metal Badge */}
        <span className="px-2 py-0.5 bg-[#323236] rounded-full text-[10.5px] font-medium text-cyan-300 border border-[#48484a] hidden sm:inline-flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Metal 3 · Apple Silicon</span>
        </span>

        {/* Battery */}
        <div className="flex items-center space-x-1" title="100% Battery (Power Adapter Connected)">
          <Battery size={14} className="text-[#a1a1a6]" />
        </div>

        {/* Wi-Fi */}
        <div className="flex items-center" title="Wi-Fi Connected">
          <Wifi size={13} className="text-[#a1a1a6]" />
        </div>

        {/* Spotlight */}
        <div className="cursor-pointer hover:text-white" title="Spotlight">
          <Search size={13} />
        </div>

        {/* Control Center */}
        <div className="cursor-pointer hover:text-white" title="Control Center">
          <SlidersHorizontal size={13} />
        </div>

        {/* Current Date & Time */}
        <span className="font-medium tracking-tight text-[12px] text-[#e5e5ea] pl-1">
          {currentTime || 'Wed Oct 28  5:42 AM'}
        </span>
      </div>
    </div>
  );
};
