import React from 'react';
import { MinigameState } from '../../systems/fishing/FishingSystem';
import { Heart, Sparkles, Zap } from 'lucide-react';

interface MinigameOverlayProps {
  minigame: MinigameState;
  onActionClick: () => void;
}

export const MinigameOverlay: React.FC<MinigameOverlayProps> = ({ minigame, onActionClick }) => {
  // Clamp values cleanly within 2% to 98% of track so borders don't overflow
  const safeZoneLeftPct = THREE_Math_clamp(
    (minigame.safeZoneCenter - minigame.safeZoneWidth * 0.5) * 100,
    1,
    99 - minigame.safeZoneWidth * 100
  );
  const safeZoneWidthPct = minigame.safeZoneWidth * 100;
  const cursorLeftPct = THREE_Math_clamp(minigame.cursor * 100, 1.5, 98.5);

  const progressPct = Math.min(
    100,
    Math.round((minigame.currentSuccesses / Math.max(1, minigame.requiredSuccesses)) * 100)
  );

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
          <Sparkles size={20} color="#fbbf24" style={{ animation: 'spin 4s linear infinite' }} />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fef08a', letterSpacing: '0.5px' }}>
            {minigame.creatureName ? `REELING: ${minigame.creatureName}` : 'REELING CELESTIAL STAR'}
          </span>
          {minigame.creatureRarity && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8'
              }}
            >
              {minigame.creatureRarity}
            </span>
          )}
        </div>

        {/* Tension Hearts */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Tension:</span>
          {Array.from({ length: minigame.maxMisses }).map((_, i) => (
            <Heart
              key={i}
              size={19}
              fill={i < minigame.missesLeft ? '#f43f5e' : 'transparent'}
              color={i < minigame.missesLeft ? '#f43f5e' : '#475569'}
              style={{
                filter: i < minigame.missesLeft ? 'drop-shadow(0 0 6px #f43f5e)' : 'none',
                transition: 'transform 0.15s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '12px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
              boxShadow: '0 0 12px #38bdf8',
              transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
        <span style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 700, minWidth: '45px', textAlign: 'right' }}>
          {minigame.currentSuccesses}/{minigame.requiredSuccesses}
        </span>
      </div>

      {/* REELING TIMING TRACK */}
      <div className="minigame-track">
        {/* Track Tick Guides */}
        <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.08)' }} />

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
              transform: 'translateX(-50%)',
              opacity: 0.85
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#a7f3d0',
              pointerEvents: 'none',
              textShadow: '0 0 5px rgba(0,0,0,0.8)'
            }}
          >
            CATCH ZONE
          </span>
        </div>

        {/* THE MOVING YELLOW BAR (Star Cursor) */}
        <div
          className="minigame-cursor"
          style={{
            left: `${cursorLeftPct}%`
          }}
        >
          {/* Top Star Crest */}
          <div className="cursor-star-crest">★</div>
          {/* Center hairline indicator */}
          <div className="cursor-hairline" />
        </div>
      </div>

      {/* Action / Feedback Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {minigame.lastAction === 'perfect' && (
            <span style={{ color: '#facc15', fontWeight: 800, fontSize: '18px', textShadow: '0 0 14px #facc15' }}>
              ★ PERFECT TIMING! (+2 REEL) ★
            </span>
          )}
          {minigame.lastAction === 'hit' && (
            <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '17px', textShadow: '0 0 10px #4ade80' }}>
              GOOD CATCH! (+1 REEL)
            </span>
          )}
          {minigame.lastAction === 'miss' && (
            <span style={{ color: '#f43f5e', fontWeight: 800, fontSize: '17px', textShadow: '0 0 12px #f43f5e' }}>
              MISS! LINE TENSION DROPPED!
            </span>
          )}
          {!minigame.lastAction && (
            <span className="minigame-instruction">
              PRESS <strong style={{ color: '#facc15' }}>[SPACE]</strong> OR <strong style={{ color: '#facc15' }}>CLICK</strong> WHEN YELLOW BAR IS IN CATCH ZONE!
            </span>
          )}
        </div>

        {/* Big Tactile Reel Button */}
        <button
          className="reel-action-button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onActionClick();
          }}
        >
          <Zap size={18} fill="#facc15" color="#facc15" />
          <span>REEL IN! (SPACE / CLICK)</span>
        </button>
      </div>
    </div>
  );
};

function THREE_Math_clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
