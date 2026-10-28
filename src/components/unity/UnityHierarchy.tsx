import React, { useState } from 'react';
import {
  Sun,
  Moon,
  User,
  Box,
  CloudFog,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

export interface HierarchyItem {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  active: boolean;
  tag?: string;
  layer?: string;
}

interface UnityHierarchyProps {
  selectedId: string;
  onSelect: (id: string) => void;
  items: HierarchyItem[];
  onToggleActive: (id: string) => void;
}

export const UnityHierarchy: React.FC<UnityHierarchyProps> = ({
  selectedId,
  onSelect,
  items,
  onToggleActive,
}) => {
  const [search, setSearch] = useState('');
  const [isSceneExpanded, setIsSceneExpanded] = useState(true);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#202020] text-[#c0c0c0] text-xs border-r border-[#303030] select-none">
      {/* Panel Tab Header */}
      <div className="h-7 bg-[#252525] border-b border-[#323232] px-3 flex items-center justify-between">
        <span className="font-semibold text-[11px] text-[#e0e0e0] uppercase tracking-wider">
          Hierarchy
        </span>
        <button
          className="p-1 hover:bg-[#383838] rounded text-[#888888] transition"
          title="Create New GameObject"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-1.5 border-b border-[#2d2d2d] bg-[#222222]">
        <div className="flex items-center bg-[#1a1a1a] rounded px-2 py-1 border border-[#333333]">
          <Search size={11} className="text-[#666666] mr-1.5" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-[#cccccc] text-[11px]"
          />
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Scene Root Node */}
        <div
          onClick={() => setIsSceneExpanded(!isSceneExpanded)}
          className="flex items-center px-2 py-1 hover:bg-[#2c2c2c] cursor-pointer text-[#8fa8d6] font-medium"
        >
          {isSceneExpanded ? <ChevronDown size={13} className="mr-1" /> : <ChevronRight size={13} className="mr-1" />}
          <Box size={13} className="mr-1.5 text-[#5e81ac]" />
          <span>Minecraft_Overworld</span>
        </div>

        {/* Children GameObjects */}
        {isSceneExpanded && (
          <div className="pl-4 space-y-0.5">
            {filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${
                    isSelected
                      ? 'bg-[#2b6cb0] text-white font-medium shadow-sm'
                      : 'hover:bg-[#2a2a2a] text-[#b8b8b8]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className={isSelected ? 'text-white' : 'text-[#888888]'}>
                      {item.icon}
                    </span>
                    <span className="truncate text-[11.5px]">{item.name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive(item.id);
                    }}
                    title={item.active ? 'Disable GameObject' : 'Enable GameObject'}
                    className={`opacity-0 group-hover:opacity-100 transition p-0.5 rounded ${
                      isSelected ? 'text-white' : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    {item.active ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
