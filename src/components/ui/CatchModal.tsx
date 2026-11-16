import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CatchResult } from '../../types/game';
import { generateCreatureSprite } from '../../game2d/rendering/PixelSprites';
import { Sparkles, Award } from 'lucide-react';

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
    // Launch celebratory confetti fireworks
    confetti({
      particleCount: creature.rarity === 'mythic' ? 120 : 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [creature]);

  const rarityClass = `rarity-${creature.rarity}`;

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '520px', textAlign: 'center' }}>
        <div style={{ color: '#fbbf24', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>
          ★ CELESTIAL CATCH SUCCESSFUL! ★
        </div>

        <div className="catch-showcase">
          {/* Glowing 2D Pixel Creature Showcase */}
          <div
            className="creature-glow-orb"
            style={{
              color: creature.glowColor,
              background: `radial-gradient(circle, ${creature.glowColor} 0%, ${creature.secondaryColor} 60%, transparent 80%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={spriteDataUrl}
              alt={creature.name}
              style={{
                width: '88px',
                height: '88px',
                imageRendering: 'pixelated',
                filter: `drop-shadow(0 0 12px ${creature.glowColor})`
              }}
            />
          </div>

          <div style={{ fontSize: '30px', fontWeight: 700, color: '#fff' }}>
            {creature.name}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
            <span className={`rarity-badge ${rarityClass}`}>
              {creature.rarity}
            </span>

            {variant !== 'normal' && (
              <span style={{ color: '#f472b6', fontWeight: 700, fontSize: '13px', background: 'rgba(244, 114, 182, 0.2)', padding: '4px 10px', borderRadius: '15px', border: '1px solid #f472b6' }}>
                ★ {variant.toUpperCase()} VARIANT ★
              </span>
            )}
          </div>

          <div style={{ fontSize: '15px', color: '#cbd5e1' }}>
            Weight: <strong>{weight}</strong> light-grams
          </div>

          {/* New tags */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {isNewDiscovery && (
              <div style={{ background: '#3b82f6', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                NEW ALMANAC DISCOVERY!
              </div>
            )}
            {isNewRecord && (
              <div style={{ background: '#eab308', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                NEW WEIGHT RECORD!
              </div>
            )}
          </div>

          {/* Reward pills */}
          <div className="rewards-row">
            <div className="reward-pill" style={{ color: '#fbbf24' }}>
              +{stardust} Stardust
            </div>
            <div className="reward-pill" style={{ color: '#38bdf8' }}>
              +{exp} EXP
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '400px', lineHeight: 1.5 }}>
            {creature.description}
          </p>

          <button className="cosmic-button" onClick={onClose} style={{ marginTop: '10px', width: '100%' }}>
            Collect Celestial Star
          </button>
        </div>
      </div>
    </div>
  );
};
