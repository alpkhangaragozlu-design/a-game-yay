import React from 'react';

interface UnitySceneGizmoProps {
  rotation: [number, number, number]; // yaw, pitch
}

export const UnitySceneGizmo: React.FC<UnitySceneGizmoProps> = ({ rotation }) => {
  const yaw = rotation[1];
  const pitch = rotation[0];

  // Rotate 3D vector coordinates
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  // Project unit axes
  const project = (x: number, y: number, z: number) => {
    // Yaw around Y
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    // Pitch around X
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;
    return {
      x: 40 + x1 * 26,
      y: 40 - y2 * 26,
      depth: z2,
    };
  };

  const center = { x: 40, y: 40 };
  const xAxis = project(1, 0, 0);
  const yAxis = project(0, 1, 0);
  const zAxis = project(0, 0, 1);

  return (
    <div className="absolute top-3 right-3 w-20 h-20 bg-[#1a1a1abb] border border-[#383838] rounded-full pointer-events-none z-10 flex items-center justify-center shadow-lg">
      <svg className="w-full h-full" viewBox="0 0 80 80">
        {/* Origin dot */}
        <circle cx={center.x} cy={center.y} r="3" fill="#ffffff" />

        {/* X Axis - Red */}
        <line
          x1={center.x}
          y1={center.y}
          x2={xAxis.x}
          y2={xAxis.y}
          stroke="#f87171"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={xAxis.x} cy={xAxis.y} r="3.5" fill="#ef4444" />
        <text
          x={xAxis.x + (xAxis.x > center.x ? 4 : -8)}
          y={xAxis.y + 3}
          fill="#ef4444"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          X
        </text>

        {/* Y Axis - Green */}
        <line
          x1={center.x}
          y1={center.y}
          x2={yAxis.x}
          y2={yAxis.y}
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={yAxis.x} cy={yAxis.y} r="3.5" fill="#22c55e" />
        <text
          x={yAxis.x + 3}
          y={yAxis.y - 3}
          fill="#22c55e"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          Y
        </text>

        {/* Z Axis - Blue */}
        <line
          x1={center.x}
          y1={center.y}
          x2={zAxis.x}
          y2={zAxis.y}
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={zAxis.x} cy={zAxis.y} r="3.5" fill="#3b82f6" />
        <text
          x={zAxis.x - 7}
          y={zAxis.y + 4}
          fill="#3b82f6"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          Z
        </text>
      </svg>
      <span className="absolute bottom-1 text-[8px] font-mono font-bold text-[#888888]">
        PERSPECTIVE
      </span>
    </div>
  );
};
