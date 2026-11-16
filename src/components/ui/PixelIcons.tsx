import React from 'react';

interface PixelIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Crisp pixelated SVG icons using shapeRendering="crispEdges" on 16x16 pixel grids

export const PixelStardustIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#fbbf24', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* 4-point twinkling star */}
    <rect x="7" y="1" width="2" height="3" fill="#fffbeb" />
    <rect x="7" y="12" width="2" height="3" fill="#d97706" />
    <rect x="1" y="7" width="3" height="2" fill="#fde68a" />
    <rect x="12" y="7" width="3" height="2" fill="#d97706" />
    {/* Diagonal rays */}
    <rect x="4" y="4" width="2" height="2" fill="#fde047" />
    <rect x="10" y="4" width="2" height="2" fill="#f59e0b" />
    <rect x="4" y="10" width="2" height="2" fill="#f59e0b" />
    <rect x="10" y="10" width="2" height="2" fill="#b45309" />
    {/* Center core */}
    <rect x="6" y="5" width="4" height="6" fill={color} />
    <rect x="5" y="6" width="6" height="4" fill={color} />
    <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
  </svg>
);

export const PixelCatIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#c084fc', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Ears */}
    <rect x="2" y="2" width="3" height="2" fill="#7e22ce" />
    <rect x="11" y="2" width="3" height="2" fill="#7e22ce" />
    <rect x="3" y="3" width="1" height="1" fill="#f472b6" />
    <rect x="12" y="3" width="1" height="1" fill="#f472b6" />
    {/* Head */}
    <rect x="2" y="4" width="12" height="8" fill={color} />
    <rect x="1" y="6" width="14" height="5" fill={color} />
    {/* Eyes */}
    <rect x="4" y="6" width="2" height="2" fill="#38bdf8" />
    <rect x="10" y="6" width="2" height="2" fill="#38bdf8" />
    <rect x="4" y="6" width="1" height="1" fill="#ffffff" />
    <rect x="10" y="6" width="1" height="1" fill="#ffffff" />
    {/* Nose & Mouth */}
    <rect x="7" y="9" width="2" height="1" fill="#f43f5e" />
    <rect x="6" y="10" width="1" height="1" fill="#3b0764" />
    <rect x="9" y="10" width="1" height="1" fill="#3b0764" />
    {/* Collar & Golden Bell */}
    <rect x="3" y="12" width="10" height="2" fill="#ea580c" />
    <rect x="7" y="13" width="2" height="2" fill="#fbbf24" />
  </svg>
);

export const PixelShopIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#f59e0b', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Awning stripes */}
    <rect x="2" y="2" width="12" height="4" fill="#a855f7" />
    <rect x="4" y="2" width="3" height="4" fill="#fbbf24" />
    <rect x="9" y="2" width="3" height="4" fill="#fbbf24" />
    {/* Counter */}
    <rect x="2" y="6" width="12" height="2" fill="#78350f" />
    <rect x="3" y="8" width="10" height="6" fill="#92400e" />
    {/* Displayed Rod / Coin */}
    <rect x="5" y="10" width="6" height="3" fill="#fde047" />
    <rect x="6" y="11" width="4" height="1" fill="#b45309" />
  </svg>
);

export const PixelQuestIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Scroll parchment */}
    <rect x="3" y="2" width="10" height="12" fill="#fef3c7" />
    <rect x="2" y="3" width="1" height="10" fill="#d97706" />
    <rect x="13" y="3" width="1" height="10" fill="#d97706" />
    {/* Scroll text lines */}
    <rect x="5" y="4" width="6" height="1" fill="#78350f" />
    <rect x="5" y="7" width="5" height="1" fill="#78350f" />
    <rect x="5" y="10" width="6" height="1" fill="#78350f" />
    {/* Red seal / Starlight pin */}
    <rect x="10" y="9" width="3" height="3" fill="#ef4444" />
    <rect x="11" y="10" width="1" height="1" fill="#fef08a" />
  </svg>
);

export const PixelAlmanacIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#818cf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Book Cover */}
    <rect x="2" y="2" width="12" height="12" fill="#4338ca" />
    <rect x="1" y="2" width="2" height="12" fill="#312e81" />
    {/* Gold trim */}
    <rect x="4" y="3" width="9" height="10" fill="#3730a3" />
    {/* Star Emblem on cover */}
    <rect x="8" y="5" width="2" height="6" fill="#fbbf24" />
    <rect x="6" y="7" width="6" height="2" fill="#fbbf24" />
    <rect x="8" y="7" width="2" height="2" fill="#fffbeb" />
  </svg>
);

export const PixelConstellationIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#c084fc', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Dark night tile */}
    <rect x="1" y="1" width="14" height="14" fill="#0f172a" />
    {/* Constellation lines */}
    <rect x="4" y="4" width="7" height="1" fill="#64748b" />
    <rect x="10" y="5" width="1" height="6" fill="#64748b" />
    <rect x="5" y="10" width="6" height="1" fill="#64748b" />
    {/* Stars on nodes */}
    <rect x="3" y="3" width="3" height="3" fill="#38bdf8" />
    <rect x="10" y="3" width="3" height="3" fill="#fbbf24" />
    <rect x="9" y="9" width="3" height="3" fill="#f472b6" />
    <rect x="4" y="9" width="3" height="3" fill="#fde047" />
    {/* Centers */}
    <rect x="4" y="4" width="1" height="1" fill="#ffffff" />
    <rect x="11" y="4" width="1" height="1" fill="#ffffff" />
    <rect x="10" y="10" width="1" height="1" fill="#ffffff" />
    <rect x="5" y="10" width="1" height="1" fill="#ffffff" />
  </svg>
);

export const PixelRegionIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Portal arch */}
    <rect x="3" y="3" width="10" height="11" fill="#334155" />
    <rect x="5" y="5" width="6" height="9" fill="#0f172a" />
    {/* Swirling energy */}
    <rect x="6" y="6" width="4" height="7" fill="#0284c7" />
    <rect x="7" y="7" width="2" height="5" fill="#38bdf8" />
    <rect x="7" y="9" width="2" height="1" fill="#ffffff" />
    {/* Arch stones */}
    <rect x="2" y="2" width="12" height="2" fill="#64748b" />
    <rect x="2" y="4" width="2" height="10" fill="#64748b" />
    <rect x="12" y="4" width="2" height="10" fill="#64748b" />
  </svg>
);

export const PixelAudioIcon: React.FC<PixelIconProps & { isMuted?: boolean }> = ({ size = 18, isMuted = false, style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Speaker body */}
    <rect x="2" y="5" width="3" height="6" fill="#cbd5e1" />
    <rect x="5" y="4" width="2" height="8" fill="#94a3b8" />
    <rect x="7" y="3" width="2" height="10" fill="#64748b" />
    {isMuted ? (
      /* Red X */
      <>
        <rect x="11" y="5" width="2" height="2" fill="#ef4444" />
        <rect x="13" y="7" width="2" height="2" fill="#ef4444" />
        <rect x="11" y="9" width="2" height="2" fill="#ef4444" />
        <rect x="13" y="5" width="2" height="2" fill="#ef4444" />
        <rect x="11" y="7" width="2" height="2" fill="#ef4444" />
      </>
    ) : (
      /* Sound waves */
      <>
        <rect x="11" y="6" width="1" height="4" fill="#38bdf8" />
        <rect x="13" y="4" width="1" height="8" fill="#38bdf8" />
      </>
    )}
  </svg>
);

export const PixelPauseIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#cbd5e1', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    <rect x="4" y="3" width="3" height="10" fill={color} />
    <rect x="9" y="3" width="3" height="10" fill={color} />
    {/* Highlights */}
    <rect x="4" y="3" width="1" height="10" fill="#ffffff" />
    <rect x="9" y="3" width="1" height="10" fill="#ffffff" />
  </svg>
);

export const PixelCloseIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#f87171', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    <rect x="3" y="3" width="2" height="2" fill={color} />
    <rect x="5" y="5" width="2" height="2" fill={color} />
    <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
    <rect x="9" y="5" width="2" height="2" fill={color} />
    <rect x="11" y="3" width="2" height="2" fill={color} />
    <rect x="9" y="9" width="2" height="2" fill={color} />
    <rect x="11" y="11" width="2" height="2" fill={color} />
    <rect x="5" y="9" width="2" height="2" fill={color} />
    <rect x="3" y="11" width="2" height="2" fill={color} />
  </svg>
);

export const PixelFishingRodIcon: React.FC<PixelIconProps> = ({ size = 18, style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    {/* Diagonal rod */}
    <rect x="2" y="13" width="2" height="2" fill="#78350f" />
    <rect x="3" y="11" width="2" height="2" fill="#92400e" />
    <rect x="5" y="9" width="2" height="2" fill="#b45309" />
    <rect x="7" y="7" width="2" height="2" fill="#d97706" />
    <rect x="9" y="5" width="2" height="2" fill="#f59e0b" />
    <rect x="11" y="3" width="2" height="2" fill="#fbbf24" />
    <rect x="13" y="1" width="2" height="2" fill="#fef08a" />
    {/* Line & Bobber */}
    <rect x="13" y="3" width="1" height="8" fill="#e2e8f0" />
    <rect x="12" y="11" width="3" height="3" fill="#ef4444" />
    <rect x="13" y="12" width="1" height="1" fill="#ffffff" />
  </svg>
);

export const PixelCheckIcon: React.FC<PixelIconProps> = ({ size = 18, color = '#22c55e', style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated', ...style }} shapeRendering="crispEdges">
    <rect x="2" y="8" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="6" y="12" width="2" height="2" fill={color} />
    <rect x="8" y="10" width="2" height="2" fill={color} />
    <rect x="10" y="8" width="2" height="2" fill={color} />
    <rect x="12" y="6" width="2" height="2" fill={color} />
    <rect x="14" y="4" width="2" height="2" fill={color} />
    {/* Highlight */}
    <rect x="6" y="12" width="1" height="1" fill="#ffffff" />
  </svg>
);
