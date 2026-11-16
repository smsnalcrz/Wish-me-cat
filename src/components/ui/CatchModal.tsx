import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CatchResult } from '../../types/game';
import { generateCreatureSprite } from '../../game2d/rendering/PixelSprites';
import { PixelStardustIcon } from './PixelIcons';

interface CatchModalProps {
  result: CatchResult;
  onClose: () => void;
}

export const CatchModal: React.FC<CatchModalProps> = ({ result, onClose }) => {
  const { creature, variant, weight, stardust, exp, isNewDiscovery, isNewRecord } = result;

  const spriteDataUrl = useMemo(() => {
    const canvas = generateCreatureSprite(creature.modelType, creature.rarity, variant);
    return canvas.toDataURL();
  }, [creature, variant]);

  useEffect(() => {
    confetti({
      particleCount: creature.rarity === 'mythic' ? 120 : 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [creature]);

  const rarityClass = `rarity-${creature.rarity}`;

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ color: '#fbbf24', fontSize: '13px', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
          ★ CATCH SUCCESSFUL! ★
        </div>

        <div className="catch-showcase">
          {/* Glowing 2D Pixel Creature Showcase */}
          <div
            className="creature-glow-orb"
            style={{
              color: creature.glowColor,
              background: `radial-gradient(circle, ${creature.glowColor}44 0%, transparent 75%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '110px',
              height: '110px'
            }}
          >
            <img
              src={spriteDataUrl}
              alt={creature.name}
              style={{
                width: '80px',
                height: '80px',
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 0 10px ${creature.glowColor})`
              }}
            />
          </div>

          <div style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '1px' }}>
            {creature.name}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
            <span className={`rarity-badge ${rarityClass}`}>
              {creature.rarity}
            </span>

            {variant !== 'normal' && (
              <span className="rarity-badge" style={{ color: '#f472b6', borderColor: '#f472b6', background: 'rgba(244, 114, 182, 0.2)' }}>
                ★ {variant.toUpperCase()} ★
              </span>
            )}
          </div>

          <div style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'var(--font-heading)' }}>
            WEIGHT: <strong style={{ color: '#fef08a' }}>{weight}</strong> LG
          </div>

          {/* New tags */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {isNewDiscovery && (
              <div style={{ background: '#0284c7', color: '#fff', fontSize: '10px', fontFamily: 'var(--font-heading)', padding: '4px 8px' }}>
                NEW DISCOVERY!
              </div>
            )}
            {isNewRecord && (
              <div style={{ background: '#ca8a04', color: '#fff', fontSize: '10px', fontFamily: 'var(--font-heading)', padding: '4px 8px' }}>
                NEW RECORD!
              </div>
            )}
          </div>

          {/* Reward pills */}
          <div className="rewards-row">
            <div className="reward-pill" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PixelStardustIcon size={16} />
              <span>+{stardust} STARDUST</span>
            </div>
            <div className="reward-pill" style={{ color: '#38bdf8' }}>
              +{exp} EXP
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', lineHeight: 1.5 }}>
            {creature.description}
          </p>

          <button className="cosmic-button" onClick={onClose} style={{ marginTop: '10px', width: '100%' }}>
            ✦ KEEP CATCH & RESUME ✦
          </button>
        </div>
      </div>
    </div>
  );
};
