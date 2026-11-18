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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <PixelStardustIcon size={20} />
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#fef08a' }}>
            {minigame.creatureName ? `REELING: ${minigame.creatureName.toUpperCase()}` : 'REELING CELESTIAL STAR'}
          </span>
          {minigame.creatureRarity && (
            <span className={`rarity-badge rarity-${minigame.creatureRarity}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
              {minigame.creatureRarity}
            </span>
          )}

          {/* Fish Struggle Mood Badge */}
          {minigame.fishStruggle === 'thrashing' && (
            <span style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444', padding: '2px 6px', fontSize: '9px', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
              ⚡ THRASHING!
            </span>
          )}
          {minigame.fishStruggle === 'tired' && (
            <span style={{ background: '#14532d', color: '#86efac', border: '1px solid #22c55e', padding: '2px 6px', fontSize: '9px', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
              💤 TIRED (STRIKE!)
            </span>
          )}
          {minigame.fishStruggle === 'calm' && (
            <span style={{ background: '#0c4a6e', color: '#7dd3fc', border: '1px solid #0284c7', padding: '2px 6px', fontSize: '9px', fontFamily: 'var(--font-heading)' }}>
              🐟 CALM
            </span>
          )}

          {/* Combo Indicator */}
          {minigame.combo >= 2 && (
            <span style={{ color: '#fef08a', fontSize: '11px', fontFamily: 'var(--font-heading)', textShadow: '0 0 8px #facc15' }}>
              ★ {minigame.combo}x COMBO!
            </span>
          )}
        </div>

        {/* Tension Pixel Blocks */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>TRIES:</span>
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

      {/* Progress & Line Strain Bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        {/* Line Strain Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)', minWidth: '70px' }}>
            LINE STRAIN:
          </span>
          <div className="exp-bar-bg" style={{ flex: 1, height: '6px', background: '#09081a' }}>
            <div
              style={{
                width: `${Math.min(100, minigame.tension || 10)}%`,
                height: '100%',
                background: (minigame.tension || 0) > 75 ? '#ef4444' : (minigame.tension || 0) > 45 ? '#f59e0b' : '#38bdf8',
                transition: 'width 0.15s ease'
              }}
            />
          </div>
          <span style={{ fontSize: '9px', color: (minigame.tension || 0) > 75 ? '#ef4444' : '#94a3b8', fontFamily: 'var(--font-heading)', minWidth: '35px', textAlign: 'right' }}>
            {Math.round(minigame.tension || 10)}%
          </span>
        </div>
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
