import React from 'react';
import {
  Sliders,
  Sun,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Box,
  Eye,
  Check
} from 'lucide-react';
import { WorldGeneratorType } from '../../engine/terrain';
import { PlayerConfig } from '../../engine/player';

interface UnityInspectorProps {
  selectedId: string;
  // Player state
  playerPos: [number, number, number];
  playerRot: [number, number, number];
  playerConfig: PlayerConfig;
  onUpdatePlayerConfig: (config: Partial<PlayerConfig>) => void;
  onTeleportPlayer: (pos: [number, number, number]) => void;

  // World state
  worldGenType: WorldGeneratorType;
  worldSeed: number;
  renderDistance: number;
  timeOfDay: number;
  daySpeed: number;
  sunIntensity: number;
  onUpdateWorldGen: (type: WorldGeneratorType) => void;
  onUpdateSeed: (seed: number) => void;
  onUpdateRenderDistance: (dist: number) => void;
  onUpdateTimeOfDay: (time: number) => void;
  onUpdateDaySpeed: (speed: number) => void;
  onUpdateSunIntensity: (intensity: number) => void;
  onRegenerateWorld: () => void;
}

export const UnityInspector: React.FC<UnityInspectorProps> = ({
  selectedId,
  playerPos,
  playerRot,
  playerConfig,
  onUpdatePlayerConfig,
  onTeleportPlayer,
  worldGenType,
  worldSeed,
  renderDistance,
  timeOfDay,
  daySpeed,
  sunIntensity,
  onUpdateWorldGen,
  onUpdateSeed,
  onUpdateRenderDistance,
  onUpdateTimeOfDay,
  onUpdateDaySpeed,
  onUpdateSunIntensity,
  onRegenerateWorld,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#202020] text-[#c0c0c0] text-xs border-l border-[#303030] select-none overflow-y-auto">
      {/* Header Tab */}
      <div className="h-7 bg-[#252525] border-b border-[#323232] px-3 flex items-center justify-between">
        <span className="font-semibold text-[11px] text-[#e0e0e0] uppercase tracking-wider">
          Inspector
        </span>
        <Sliders size={12} className="text-[#888888]" />
      </div>

      {/* GameObject Identity Header */}
      <div className="p-3 border-b border-[#2d2d2d] bg-[#222222] space-y-2">
        <div className="flex items-center space-x-2">
          <input type="checkbox" defaultChecked className="rounded accent-[#3b5998]" />
          <span className="font-bold text-sm text-white tracking-wide">
            {selectedId === 'player'
              ? 'Player (Steve)'
              : selectedId === 'world'
              ? 'VoxelWorld'
              : selectedId === 'sun'
              ? 'Directional Light (Sun)'
              : selectedId === 'moon'
              ? 'Directional Light (Moon)'
              : selectedId === 'sky'
              ? 'Skybox & Dynamic Fog'
              : 'GameObject'}
          </span>
          <span className="text-[10px] bg-[#333333] text-[#8e8e8e] px-1.5 py-0.5 rounded font-mono ml-auto">
            Static
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="text-[#808080] w-10">Tag:</span>
            <select
              value={selectedId === 'player' ? 'Player' : 'Untagged'}
              onChange={() => {}}
              className="bg-[#181818] border border-[#333333] text-[#bbbbbb] rounded px-1.5 py-0.5 w-full text-[11px] outline-none"
            >
              <option>Untagged</option>
              <option>Player</option>
              <option>MainCamera</option>
              <option>GameController</option>
            </select>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[#808080] w-12">Layer:</span>
            <select
              className="bg-[#181818] border border-[#333333] text-[#bbbbbb] rounded px-1.5 py-0.5 w-full text-[11px] outline-none"
            >
              <option>Default</option>
              <option>TransparentFX</option>
              <option>Ignore Raycast</option>
              <option>Water</option>
              <option>VoxelWorld</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Transform Component (Applies to all) */}
        <div className="bg-[#242424] border border-[#333333] rounded overflow-hidden">
          <div className="bg-[#292929] px-2.5 py-1.5 border-b border-[#333333] font-semibold text-[11.5px] text-[#e0e0e0] flex items-center justify-between">
            <span>Transform</span>
            <span className="text-[10px] text-[#777777] font-mono">Component</span>
          </div>
          <div className="p-2.5 space-y-2 text-[11px]">
            {/* Position */}
            <div className="flex items-center">
              <span className="w-16 text-[#888888]">Position</span>
              <div className="grid grid-cols-3 gap-1.5 flex-1 font-mono">
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-red-400 font-bold mr-1 text-[10px]">X</span>
                  <input
                    type="number"
                    value={selectedId === 'player' ? Math.round(playerPos[0] * 10) / 10 : 0}
                    onChange={(e) => {
                      if (selectedId === 'player') {
                        onTeleportPlayer([parseFloat(e.target.value) || 0, playerPos[1], playerPos[2]]);
                      }
                    }}
                    className="w-full bg-transparent outline-none text-[#cccccc]"
                  />
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-green-400 font-bold mr-1 text-[10px]">Y</span>
                  <input
                    type="number"
                    value={selectedId === 'player' ? Math.round(playerPos[1] * 10) / 10 : 0}
                    onChange={(e) => {
                      if (selectedId === 'player') {
                        onTeleportPlayer([playerPos[0], parseFloat(e.target.value) || 0, playerPos[2]]);
                      }
                    }}
                    className="w-full bg-transparent outline-none text-[#cccccc]"
                  />
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-blue-400 font-bold mr-1 text-[10px]">Z</span>
                  <input
                    type="number"
                    value={selectedId === 'player' ? Math.round(playerPos[2] * 10) / 10 : 0}
                    onChange={(e) => {
                      if (selectedId === 'player') {
                        onTeleportPlayer([playerPos[0], playerPos[1], parseFloat(e.target.value) || 0]);
                      }
                    }}
                    className="w-full bg-transparent outline-none text-[#cccccc]"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="flex items-center">
              <span className="w-16 text-[#888888]">Rotation</span>
              <div className="grid grid-cols-3 gap-1.5 flex-1 font-mono">
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-red-400 font-bold mr-1 text-[10px]">X</span>
                  <span className="text-[#999999]">
                    {selectedId === 'player' ? Math.round((playerRot[0] * 180) / Math.PI) : 0}°
                  </span>
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-green-400 font-bold mr-1 text-[10px]">Y</span>
                  <span className="text-[#999999]">
                    {selectedId === 'player' ? Math.round((playerRot[1] * 180) / Math.PI) : 0}°
                  </span>
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-blue-400 font-bold mr-1 text-[10px]">Z</span>
                  <span className="text-[#999999]">0°</span>
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="flex items-center">
              <span className="w-16 text-[#888888]">Scale</span>
              <div className="grid grid-cols-3 gap-1.5 flex-1 font-mono">
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-red-400 font-bold mr-1 text-[10px]">X</span>
                  <span className="text-[#cccccc]">1.0</span>
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-green-400 font-bold mr-1 text-[10px]">Y</span>
                  <span className="text-[#cccccc]">1.0</span>
                </div>
                <div className="flex items-center bg-[#181818] border border-[#333333] rounded px-1.5 py-0.5">
                  <span className="text-blue-400 font-bold mr-1 text-[10px]">Z</span>
                  <span className="text-[#cccccc]">1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PLAYER INSPECTOR */}
        {selectedId === 'player' && (
          <>
            {/* Character Controller */}
            <div className="bg-[#242424] border border-[#333333] rounded overflow-hidden">
              <div className="bg-[#292929] px-2.5 py-1.5 border-b border-[#333333] font-semibold text-[11.5px] text-[#e0e0e0] flex items-center justify-between">
                <span>CharacterController</span>
                <span className="text-[10px] text-[#777777] font-mono">Physics</span>
              </div>
              <div className="p-2.5 space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Slope Limit</span>
                  <span className="font-mono text-[#bbbbbb]">45.0°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Step Offset</span>
                  <span className="font-mono text-[#bbbbbb]">0.5 m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Skin Width</span>
                  <span className="font-mono text-[#bbbbbb]">0.08 m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">Center (X, Y, Z)</span>
                  <span className="font-mono text-[#bbbbbb]">0, 0.9, 0</span>
                </div>
              </div>
            </div>

            {/* Minecraft Player Controller Script */}
            <div className="bg-[#242424] border border-[#333333] rounded overflow-hidden">
              <div className="bg-[#292929] px-2.5 py-1.5 border-b border-[#333333] font-semibold text-[11.5px] text-[#90caf9] flex items-center justify-between">
                <span>MinecraftPlayerController (Script)</span>
                <span className="text-[10px] text-[#777777] font-mono">C#</span>
              </div>
              <div className="p-2.5 space-y-2.5 text-[11px]">
                {/* Move Speed */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#888888]">Move Speed</span>
                    <span className="font-mono text-white">{playerConfig.moveSpeed.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={playerConfig.moveSpeed}
                    onChange={(e) => onUpdatePlayerConfig({ moveSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-[#3b5998]"
                  />
                </div>

                {/* Jump Force */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#888888]">Jump Force</span>
                    <span className="font-mono text-white">{playerConfig.jumpForce.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    step="0.5"
                    value={playerConfig.jumpForce}
                    onChange={(e) => onUpdatePlayerConfig({ jumpForce: parseFloat(e.target.value) })}
                    className="w-full accent-[#3b5998]"
                  />
                </div>

                {/* Gravity */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#888888]">Gravity Acceleration</span>
                    <span className="font-mono text-white">{playerConfig.gravity.toFixed(1)} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={playerConfig.gravity}
                    onChange={(e) => onUpdatePlayerConfig({ gravity: parseFloat(e.target.value) })}
                    className="w-full accent-[#3b5998]"
                  />
                </div>

                {/* Reach Distance */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#888888]">Reach Distance</span>
                    <span className="font-mono text-white">{playerConfig.reachDistance.toFixed(1)} blocks</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={playerConfig.reachDistance}
                    onChange={(e) => onUpdatePlayerConfig({ reachDistance: parseFloat(e.target.value) })}
                    className="w-full accent-[#3b5998]"
                  />
                </div>

                {/* Toggles: Fly Mode & Creative Mode */}
                <div className="pt-2 border-t border-[#333333] space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerConfig.flyMode}
                      onChange={(e) => onUpdatePlayerConfig({ flyMode: e.target.checked })}
                      className="rounded accent-[#3b5998]"
                    />
                    <span className="text-[#cccccc] font-medium">Fly Mode (Press F in game)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playerConfig.creativeMode}
                      onChange={(e) => onUpdatePlayerConfig({ creativeMode: e.target.checked })}
                      className="rounded accent-[#3b5998]"
                    />
                    <span className="text-[#cccccc] font-medium">Creative Mode (Instant Break)</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VOXEL WORLD INSPECTOR */}
        {selectedId === 'world' && (
          <div className="bg-[#242424] border border-[#333333] rounded overflow-hidden">
            <div className="bg-[#292929] px-2.5 py-1.5 border-b border-[#333333] font-semibold text-[11.5px] text-[#90caf9] flex items-center justify-between">
              <span>VoxelWorldManager (Script)</span>
              <span className="text-[10px] text-[#777777] font-mono">C#</span>
            </div>
            <div className="p-2.5 space-y-3 text-[11px]">
              {/* World Generator Type */}
              <div>
                <span className="text-[#888888] block mb-1">Terrain Generator</span>
                <select
                  value={worldGenType}
                  onChange={(e) => onUpdateWorldGen(e.target.value as WorldGeneratorType)}
                  className="w-full bg-[#181818] border border-[#333333] text-white rounded px-2 py-1 outline-none text-xs"
                >
                  <option value="plains">Plains & Rolling Hills</option>
                  <option value="mountains">High Jagged Mountains</option>
                  <option value="islands">Floating Sky Islands</option>
                  <option value="desert">Desert Dunes & Sand</option>
                  <option value="flat">Classic Superflat</option>
                </select>
              </div>

              {/* Seed */}
              <div className="flex items-center justify-between">
                <span className="text-[#888888]">World Seed</span>
                <input
                  type="number"
                  value={worldSeed}
                  onChange={(e) => onUpdateSeed(parseInt(e.target.value) || 0)}
                  className="bg-[#181818] border border-[#333333] rounded px-2 py-0.5 text-white font-mono w-28 text-right text-xs"
                />
              </div>

              {/* Render Distance */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#888888]">Render Distance (Radius)</span>
                  <span className="font-mono text-white">{renderDistance} chunks ({(renderDistance * 2 + 1) ** 2} total)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={renderDistance}
                  onChange={(e) => onUpdateRenderDistance(parseInt(e.target.value))}
                  className="w-full accent-[#3b5998]"
                />
              </div>

              {/* Regenerate World Button */}
              <button
                onClick={onRegenerateWorld}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#2b6cb0] hover:bg-[#3182ce] text-white font-medium rounded transition shadow-sm mt-2 text-xs"
              >
                <RefreshCw size={12} />
                <span>Regenerate World Terrain</span>
              </button>
            </div>
          </div>
        )}

        {/* SUN LIGHT INSPECTOR */}
        {(selectedId === 'sun' || selectedId === 'sky') && (
          <div className="bg-[#242424] border border-[#333333] rounded overflow-hidden">
            <div className="bg-[#292929] px-2.5 py-1.5 border-b border-[#333333] font-semibold text-[11.5px] text-[#e0e0e0] flex items-center justify-between">
              <span>Day/Night Lighting Rig</span>
              <span className="text-[10px] text-[#777777] font-mono">Lighting</span>
            </div>
            <div className="p-2.5 space-y-3 text-[11px]">
              {/* Time of Day */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#888888]">Time of Day</span>
                  <span className="font-mono text-white font-semibold">
                    {Math.floor(timeOfDay).toString().padStart(2, '0')}:
                    {Math.floor((timeOfDay % 1) * 60).toString().padStart(2, '0')}
                    {' '}({timeOfDay >= 6 && timeOfDay < 18 ? '☀️ Day' : '🌑 Night'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.1"
                  value={timeOfDay}
                  onChange={(e) => onUpdateTimeOfDay(parseFloat(e.target.value))}
                  className="w-full accent-[#e2b714]"
                />
              </div>

              {/* Day Cycle Speed */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#888888]">Cycle Speed</span>
                  <span className="font-mono text-white">{daySpeed === 0 ? 'Paused' : `${daySpeed.toFixed(2)} hrs/s`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={daySpeed}
                  onChange={(e) => onUpdateDaySpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#3b5998]"
                />
              </div>

              {/* Sun Intensity */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#888888]">Sun Intensity</span>
                  <span className="font-mono text-white">{sunIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={sunIntensity}
                  onChange={(e) => onUpdateSunIntensity(parseFloat(e.target.value))}
                  className="w-full accent-[#3b5998]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Component Button */}
        <button
          className="w-full py-2 bg-[#282828] hover:bg-[#303030] border border-[#383838] rounded text-[#aaaaaa] font-medium transition text-xs flex items-center justify-center space-x-1"
        >
          <Plus size={13} />
          <span>Add Component</span>
        </button>
      </div>
    </div>
  );
};
