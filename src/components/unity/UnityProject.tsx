import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Terminal,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { BlockType, UnityLog } from '../../engine/types';
import { BLOCK_DEFINITIONS, getBlockTexture } from '../../engine/blocks';

interface UnityProjectProps {
  logs: UnityLog[];
  onClearLogs: () => void;
  onEquipBlock: (block: BlockType) => void;
  selectedBlock: BlockType;
}

export const UnityProject: React.FC<UnityProjectProps> = ({
  logs,
  onClearLogs,
  onEquipBlock,
  selectedBlock,
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'console'>('project');
  const [selectedFolder, setSelectedFolder] = useState<string>('Blocks');
  const [logFilter, setLogFilter] = useState<'all' | 'log' | 'warning' | 'error'>('all');

  const blocksList = Object.values(BLOCK_DEFINITIONS).filter((b) => b.id !== BlockType.AIR);

  const filteredLogs = logs.filter((l) => (logFilter === 'all' ? true : l.type === logFilter));

  const errorCount = logs.filter((l) => l.type === 'error').length;
  const warnCount = logs.filter((l) => l.type === 'warning').length;
  const infoCount = logs.filter((l) => l.type === 'log').length;

  return (
    <div className="h-44 bg-[#202020] text-[#c0c0c0] text-xs border-t border-[#303030] flex flex-col select-none">
      {/* Tab Header */}
      <div className="h-7 bg-[#252525] border-b border-[#303030] px-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-1 font-semibold text-[11px] rounded-t flex items-center space-x-1 transition ${
              activeTab === 'project'
                ? 'bg-[#202020] text-[#e0e0e0] border-t-2 border-[#3b5998]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <Folder size={12} />
            <span>Project</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 font-semibold text-[11px] rounded-t flex items-center space-x-1 transition ${
              activeTab === 'console'
                ? 'bg-[#202020] text-[#e0e0e0] border-t-2 border-[#3b5998]'
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            <Terminal size={12} />
            <span>Console</span>
            {logs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#333333] text-[9.5px] rounded-full text-white font-mono">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab-specific toolbar actions */}
        {activeTab === 'console' ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearLogs}
              title="Clear Console"
              className="px-2 py-0.5 bg-[#2c2c2c] hover:bg-[#383838] border border-[#3c3c3c] rounded text-[10.5px] text-[#aaaaaa] transition"
            >
              Clear
            </button>
            <div className="h-3 w-[1px] bg-[#3a3a3a]" />
            <div className="flex items-center space-x-1 text-[10px]">
              <button
                onClick={() => setLogFilter(logFilter === 'log' ? 'all' : 'log')}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border border-[#333333] ${
                  logFilter === 'log' ? 'bg-[#2b6cb0] text-white' : 'hover:bg-[#2c2c2c]'
                }`}
              >
                <Info size={10} className="text-blue-400" />
                <span>{infoCount}</span>
              </button>
              <button
                onClick={() => setLogFilter(logFilter === 'warning' ? 'all' : 'warning')}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border border-[#333333] ${
                  logFilter === 'warning' ? 'bg-[#b7791f] text-white' : 'hover:bg-[#2c2c2c]'
                }`}
              >
                <AlertTriangle size={10} className="text-yellow-400" />
                <span>{warnCount}</span>
              </button>
              <button
                onClick={() => setLogFilter(logFilter === 'error' ? 'all' : 'error')}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border border-[#333333] ${
                  logFilter === 'error' ? 'bg-[#9b2c2c] text-white' : 'hover:bg-[#2c2c2c]'
                }`}
              >
                <AlertCircle size={10} className="text-red-400" />
                <span>{errorCount}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-[#777777] font-mono pr-2">
            Assets &gt; {selectedFolder}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'project' ? (
          <div className="flex h-full">
            {/* Folder sidebar */}
            <div className="w-44 border-r border-[#2d2d2d] bg-[#1e1e1e] p-2 space-y-1 overflow-y-auto">
              <div className="text-[11px] font-semibold text-[#888888] px-1 mb-1">Folders</div>
              {['Blocks', 'Prefabs', 'Scripts', 'Materials'].map((folder) => (
                <div
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded cursor-pointer transition text-[11px] ${
                    selectedFolder === folder
                      ? 'bg-[#2b6cb0] text-white font-medium'
                      : 'hover:bg-[#2a2a2a] text-[#aaaaaa]'
                  }`}
                >
                  {selectedFolder === folder ? (
                    <FolderOpen size={12} className="text-amber-300" />
                  ) : (
                    <Folder size={12} className="text-amber-400" />
                  )}
                  <span>{folder}</span>
                </div>
              ))}
            </div>

            {/* Folder Contents */}
            <div className="flex-1 p-2.5 overflow-y-auto">
              {selectedFolder === 'Blocks' && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {blocksList.map((block) => {
                    const isEquipped = selectedBlock === block.id;
                    return (
                      <div
                        key={block.id}
                        onClick={() => onEquipBlock(block.id)}
                        title={`${block.name} - Click to equip in hand\nHardness: ${block.hardness}s`}
                        className={`group p-1.5 rounded flex flex-col items-center cursor-pointer border transition text-center ${
                          isEquipped
                            ? 'bg-[#2b4c7e] border-[#4299e1] ring-1 ring-[#4299e1]'
                            : 'bg-[#262626] border-[#333333] hover:border-[#555555] hover:bg-[#2e2e2e]'
                        }`}
                      >
                        {/* 16x16 Pixel Texture Canvas Preview */}
                        <div
                          className="w-8 h-8 rounded border border-[#111111] shadow-inner mb-1 flex items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor: block.color.slice(0, 7),
                            backgroundImage: `linear-gradient(45deg, ${block.color.slice(0, 7)} 0%, ${block.color.slice(0, 7)}dd 100%)`,
                          }}
                        >
                          <img
                            src={getBlockTexture(block.id, 'side').image?.toDataURL?.()}
                            alt={block.name}
                            className="w-full h-full object-cover [image-rendering:pixelated]"
                          />
                        </div>
                        <span className="text-[10px] text-[#cccccc] font-medium truncate w-full group-hover:text-white">
                          {block.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedFolder === 'Scripts' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['MinecraftPlayer.cs', 'VoxelWorldManager.cs', 'ChunkMesher.cs', 'TerrainNoise.cs', 'InventorySystem.cs'].map((s) => (
                    <div
                      key={s}
                      className="bg-[#262626] border border-[#333333] p-2 rounded flex items-center space-x-2 text-[11px] text-[#bbbbbb]"
                    >
                      <FileCode size={16} className="text-blue-400" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFolder === 'Prefabs' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['Player_Steve.prefab', 'Oak_Tree.prefab', 'TNT_Cluster.prefab', 'Water_Basin.prefab'].map((p) => (
                    <div
                      key={p}
                      className="bg-[#262626] border border-[#333333] p-2 rounded flex items-center space-x-2 text-[11px] text-[#bbbbbb]"
                    >
                      <Folder size={16} className="text-cyan-400" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFolder === 'Materials' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {['VoxelAtlas_Opaque.mat', 'VoxelAtlas_Transparent.mat', 'WaterSurface.mat', 'SteveSkin.mat'].map((m) => (
                    <div
                      key={m}
                      className="bg-[#262626] border border-[#333333] p-2 rounded flex items-center space-x-2 text-[11px] text-[#bbbbbb]"
                    >
                      <FileText size={16} className="text-amber-400" />
                      <span className="truncate">{m}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Console Log List */
          <div className="h-full overflow-y-auto p-2 space-y-1 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <div className="text-[#666666] italic text-center py-6">No console output.</div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-2 px-2 py-1 rounded border ${
                    log.type === 'error'
                      ? 'bg-[#3b1818] border-[#6b2828] text-red-200'
                      : log.type === 'warning'
                      ? 'bg-[#3b2d18] border-[#6b5228] text-yellow-200'
                      : 'bg-[#222222] border-[#2e2e2e] text-[#cccccc]'
                  }`}
                >
                  <span className="mt-0.5">
                    {log.type === 'error' ? (
                      <AlertCircle size={12} className="text-red-400" />
                    ) : log.type === 'warning' ? (
                      <AlertTriangle size={12} className="text-yellow-400" />
                    ) : (
                      <Info size={12} className="text-blue-400" />
                    )}
                  </span>
                  <span className="text-[#777777] text-[10px] select-none">{log.time}</span>
                  <span className="flex-1 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
