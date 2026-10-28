import React, { useEffect, useState } from 'react';
import { BlockType } from '../../engine/types';
import { BLOCK_DEFINITIONS, getBlockTexture } from '../../engine/blocks';

interface MinecraftHUDProps {
  hotbar: BlockType[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
  digProgress: number; // 0 to 1
  isPointerLocked: boolean;
  onLockPointer: () => void;
  flyMode: boolean;
  creativeMode: boolean;
}

export const MinecraftHUD: React.FC<MinecraftHUDProps> = ({
  hotbar,
  selectedSlot,
  onSelectSlot,
  digProgress,
  isPointerLocked,
  onLockPointer,
  flyMode,
  creativeMode,
}) => {
  const [showItemLabel, setShowItemLabel] = useState(true);
  const currentBlock = hotbar[selectedSlot] || BlockType.GRASS;
  const currentDef = BLOCK_DEFINITIONS[currentBlock];

  useEffect(() => {
    setShowItemLabel(true);
    const timer = setTimeout(() => setShowItemLabel(false), 2200);
    return () => clearTimeout(timer);
  }, [selectedSlot]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 flex flex-col justify-between">
      {/* Top Banner / Controls Help */}
      <div className="pt-2 px-3 flex justify-between items-start">
        {/* Play mode / fly indicator */}
        <div className="flex items-center space-x-2">
          {flyMode && (
            <span className="bg-[#2b6cb0cc] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              FLY MODE ACTIVE (F)
            </span>
          )}
          {creativeMode && (
            <span className="bg-[#2f855acc] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              CREATIVE (INSTANT BREAK)
            </span>
          )}
        </div>

        {/* Pointer lock hint */}
        {!isPointerLocked ? (
          <div
            onClick={onLockPointer}
            className="pointer-events-auto cursor-pointer bg-[#111111bb] border border-[#444444] hover:border-white text-white px-3 py-1.5 rounded shadow-lg text-xs flex items-center space-x-2 transition animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-semibold">Click to Lock Mouse &amp; Play</span>
            <span className="text-[#a1a1a6] text-[10px]">(⎋ ESC to release)</span>
          </div>
        ) : (
          <div className="text-[10px] text-[#ffffffbb] bg-[#00000077] px-2.5 py-0.5 rounded-full font-mono flex items-center space-x-1.5 border border-[#ffffff20]">
            <span>⎋ ESC to release cursor</span>
            <span>·</span>
            <span>⌘P pause</span>
          </div>
        )}
      </div>

      {/* Center Screen: Crosshair & Mining Crack Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Simple crisp Minecraft crosshair */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div className="absolute w-4 h-[2px] bg-white opacity-85 shadow-[0_0_1px_black]" />
          <div className="absolute h-4 w-[2px] bg-white opacity-85 shadow-[0_0_1px_black]" />
        </div>

        {/* Mining break crack progress indicator */}
        {digProgress > 0 && (
          <div className="absolute w-12 h-12 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-black/50"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white"
                strokeDasharray={`${Math.floor(digProgress * 100)}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-bold text-white shadow-sm">
              {Math.floor(digProgress * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Bottom Area: Health, Hunger, Item Label, Hotbar */}
      <div className="pb-3 flex flex-col items-center pointer-events-auto">
        {/* Block Label popup on change */}
        {showItemLabel && currentDef && (
          <div className="mb-1 text-white text-xs font-semibold px-2 py-0.5 bg-[#00000099] rounded border border-[#333333] shadow transition-opacity duration-300">
            {currentDef.name}
          </div>
        )}

        {/* Survival Hearts & Hunger (authentic Minecraft icons) */}
        <div className="flex justify-between w-72 mb-1 px-1">
          {/* 10 Hearts */}
          <div className="flex space-x-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-red-500 text-[10px] leading-none drop-shadow">
                ❤️
              </span>
            ))}
          </div>

          {/* 10 Drumsticks / Hunger */}
          <div className="flex space-x-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-amber-500 text-[10px] leading-none drop-shadow">
                🍗
              </span>
            ))}
          </div>
        </div>

        {/* Hotbar (9 slots) */}
        <div className="flex items-center bg-[#1f1f1fe6] border-2 border-[#383838] p-1 rounded shadow-2xl space-x-1">
          {hotbar.map((blockType, idx) => {
            const isSelected = selectedSlot === idx;
            const def = BLOCK_DEFINITIONS[blockType];

            return (
              <button
                key={idx}
                onClick={() => onSelectSlot(idx)}
                title={`${def ? def.name : 'Empty'} (Press ${idx + 1})`}
                className={`w-9 h-9 rounded flex items-center justify-center relative transition ${
                  isSelected
                    ? 'bg-[#3b599888] border-2 border-white scale-110 shadow-lg z-10'
                    : 'bg-[#2a2a2abb] border border-[#444444] hover:border-[#888888]'
                }`}
              >
                {/* Slot index number label */}
                <span className="absolute top-0.5 left-1 text-[8px] text-[#888888] font-mono leading-none">
                  {idx + 1}
                </span>

                {/* Block preview image */}
                {def && def.id !== BlockType.AIR && (
                  <img
                    src={getBlockTexture(def.id, 'side').image?.toDataURL?.()}
                    alt={def.name}
                    className="w-6 h-6 [image-rendering:pixelated] shadow"
                  />
                )}

                {/* Creative infinite symbol */}
                <span className="absolute bottom-0.5 right-1 text-[8px] text-[#ffffffbb] font-mono leading-none">
                  ∞
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
