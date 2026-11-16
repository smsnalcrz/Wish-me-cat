import React from 'react';
import { MinigameState2D } from '../../game2d/fishing/FishingSystem2D';
import { PixelStardustIcon } from './PixelIcons';

interface MinigameOverlayProps {
  minigame: MinigameState2D;
  onActionClick: () => void;
}

export const MinigameOverlay: React.FC<MinigameOverlayProps> = ({ minigame, onActionClick }) => {
  const safeZoneLeftPct = Math.max(1, Math.min(99 - minigame.safeZoneWidth * 100, (minigame.safeZoneCenter - minigame.safeZoneWidth * 0.5) * 100));
  const safeZoneWidthPct = minigame.safeZoneWidth * 100;
  const cursorLeftPct = Math.max(1.5, Math.min(98.5, minigame.cursor * 100));

  const progressPct = Math.min(100, Math.round((minigame.currentSuccesses / Math.max(1, minigame.requiredSuccesses)) * 100));

  return (
    <div
      className="cosmic-panel minigame-container pointer-events-auto"
      onPointerDown={(e) => {
        e.stopPropagation();
        onActionClick();
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PixelStardustIcon size={20} />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#fef08a' }}>
            {minigame.creatureName ? `REELING: ${minigame.creatureName.toUpperCase()}` : 'REELING CELESTIAL STAR'}
          </span>
          {minigame.creatureRarity && (
            <span className={`rarity-badge rarity-${minigame.creatureRarity}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
              {minigame.creatureRarity}
            </span>
          )}
        </div>

        {/* Tension Pixel Blocks */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>TENSION:</span>
          {Array.from({ length: minigame.maxMisses }).map((_, i) => (
            <span
              key={i}
              style={{
                width: '14px',
                height: '14px',
                background: i < minigame.missesLeft ? '#f43f5e' : '#1e1b4b',
                boxShadow: i < minigame.missesLeft ? 'inset 0 -2px 0 0 #be123c, inset 0 2px 0 0 #fda4af' : 'none',
                display: 'inline-block'
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="exp-bar-bg" style={{ flex: 1, height: '14px' }}>
          <div
            className="exp-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: '#0284c7',
              boxShadow: 'inset 0 -2px 0 0 #0369a1, inset 0 2px 0 0 #38bdf8'
            }}
          />
        </div>
        <span style={{ color: '#38bdf8', fontSize: '11px', fontFamily: 'var(--font-heading)', minWidth: '45px', textAlign: 'right' }}>
          {minigame.currentSuccesses}/{minigame.requiredSuccesses}
        </span>
      </div>

      {/* REELING TIMING TRACK */}
      <div className="minigame-track">
        {/* Track Tick Guides */}
        <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '2px', background: '#281f4a' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#392b61' }} />
        <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', background: '#281f4a' }} />

        {/* Dynamic Safe Zone (Green/Cyan Target) */}
        <div
          className="minigame-safezone"
          style={{
            left: `${safeZoneLeftPct}%`,
            width: `${safeZoneWidthPct}%`
          }}
        >
          {/* Bullseye Perfect Center Marker */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '4px',
              background: '#fef08a',
              boxShadow: '0 0 8px #facc15',
              transform: 'translateX(-50%)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '9px',
              fontFamily: 'var(--font-heading)',
              color: '#a7f3d0',
              pointerEvents: 'none'
            }}
          >
            CATCH
          </span>
        </div>

        {/* THE MOVING YELLOW BAR (Star Cursor) */}
        <div
          className="minigame-cursor"
          style={{
            left: `${cursorLeftPct}%`
          }}
        >
          <div className="cursor-star-crest">★</div>
          <div className="cursor-hairline" />
        </div>
      </div>

      {/* Action / Feedback Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div style={{ minHeight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '11px' }}>
          {minigame.lastAction === 'perfect' && (
            <span style={{ color: '#facc15' }}>★ PERFECT TIMING! (+2 REEL) ★</span>
          )}
          {minigame.lastAction === 'hit' && (
            <span style={{ color: '#4ade80' }}>GOOD CATCH! (+1 REEL)</span>
          )}
          {minigame.lastAction === 'miss' && (
            <span style={{ color: '#f43f5e' }}>MISS! LINE TENSION DROPPED!</span>
          )}
          {!minigame.lastAction && (
            <span className="minigame-instruction">
              PRESS <strong style={{ color: '#facc15' }}>[SPACE]</strong> OR <strong style={{ color: '#facc15' }}>CLICK</strong> IN CATCH ZONE!
            </span>
          )}
        </div>

        {/* Big Pixel Reel Button */}
        <button
          className="reel-action-button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
        >
          <span>✦ REEL IN! (SPACE / CLICK) ✦</span>
        </button>
      </div>
    </div>
  );
};
