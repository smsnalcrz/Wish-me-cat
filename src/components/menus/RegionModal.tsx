import React from 'react';
import { SaveData, RegionData } from '../../types/game';
import { REGIONS } from '../../data/regions';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelRegionIcon, PixelStardustIcon } from '../ui/PixelIcons';
import { WORLD_ENVIRONMENTS } from '../../game2d/world/WorldEnvironmentConfig';

interface RegionModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
  onTravel: (region: RegionData) => void;
}

export const RegionModal: React.FC<RegionModalProps> = ({ saveData, onClose, onUpdateSave, onTravel }) => {
  const audio = AudioManager.getInstance();

  const handleUnlock = (region: RegionData) => {
    if (saveData.unlockedRegionIds.includes(region.id)) return;
    if (saveData.playerLevel < region.requiredLevel) return;
    if (saveData.stardust < region.stardustCost) return;

    const newSave = {
      ...saveData,
      stardust: saveData.stardust - region.stardustCost,
      unlockedRegionIds: [...saveData.unlockedRegionIds, region.id]
    };

    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.playCoin();
  };

  const handleTravel = (region: RegionData) => {
    if (!saveData.unlockedRegionIds.includes(region.id)) return;
    const newSave = {
      ...saveData,
      currentRegionId: region.id
    };
    SaveManager.save(newSave);
    onUpdateSave(newSave);
    onTravel(region);
    audio.playClick();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '780px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', zIndex: 10, paddingBottom: '10px' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelRegionIcon size={22} />
            <span>COSMIC REALM GATEWAY</span>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        <div className="responsive-card-grid" style={{ marginTop: '6px' }}>
          {REGIONS.map((region) => {
            const isUnlocked = saveData.unlockedRegionIds.includes(region.id);
            const isCurrent = saveData.currentRegionId === region.id;
            const canUnlock = !isUnlocked && saveData.playerLevel >= region.requiredLevel && saveData.stardust >= region.stardustCost;
            const levelLocked = saveData.playerLevel < region.requiredLevel;
            const env = WORLD_ENVIRONMENTS[region.id];

            // Celestial Badge / Visual Iconography per world
            let celestialGlyph = '🌙';
            let themeGradient = 'linear-gradient(135deg, #060412 0%, #1a2254 100%)';
            let accentColor = '#38bdf8';

            if (region.id === 'region_nebula_lagoon') {
              celestialGlyph = '🌌';
              themeGradient = 'linear-gradient(135deg, #080214 0%, #180633 50%, #0c2738 100%)';
              accentColor = '#22d3ee';
            } else if (region.id === 'region_comet_falls') {
              celestialGlyph = '☄️';
              themeGradient = 'linear-gradient(135deg, #040b17 0%, #0a1a33 50%, #173656 100%)';
              accentColor = '#f97316';
            } else if (region.id === 'region_saturn_rings') {
              celestialGlyph = '🪐';
              themeGradient = 'linear-gradient(135deg, #0a0814 0%, #1a1306 50%, #232947 100%)';
              accentColor = '#facc15';
            } else if (region.id === 'region_aurora_deep') {
              celestialGlyph = '✨';
              themeGradient = 'linear-gradient(135deg, #020e0d 0%, #041f1a 50%, #0c3829 100%)';
              accentColor = '#34d399';
            } else if (region.id === 'region_eclipse_well') {
              celestialGlyph = '☀️';
              themeGradient = 'linear-gradient(135deg, #030206 0%, #160f26 50%, #291b52 100%)';
              accentColor = '#fbbf24';
            }

            return (
              <div
                key={region.id}
                style={{
                  background: isCurrent ? '#16204a' : '#0c0a20',
                  border: isCurrent
                    ? `2px solid ${accentColor}`
                    : (isUnlocked ? '2px solid #3b2c68' : '2px solid #1e1b38'),
                  boxShadow: isCurrent ? `0 0 14px ${accentColor}44` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  opacity: !isUnlocked && levelLocked ? 0.75 : 1.0,
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                {/* Visual Environment Thumbnail Banner */}
                <div
                  style={{
                    height: '68px',
                    background: themeGradient,
                    position: 'relative',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{celestialGlyph}</span>
                      <span style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: accentColor, letterSpacing: '0.5px' }}>
                        {env?.subtitle?.toUpperCase() || 'CELESTIAL REALM'}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span style={{ fontSize: '9px', background: '#0284c7', color: '#fff', padding: '2px 8px', fontFamily: 'var(--font-heading)', borderRadius: '2px' }}>
                        ACTIVE
                      </span>
                    ) : isUnlocked ? (
                      <span style={{ fontSize: '9px', background: '#059669', color: '#fff', padding: '2px 6px', fontFamily: 'var(--font-heading)', borderRadius: '2px' }}>
                        UNLOCKED
                      </span>
                    ) : (
                      <span style={{ fontSize: '9px', background: '#475569', color: '#cbd5e1', padding: '2px 6px', fontFamily: 'var(--font-heading)', borderRadius: '2px' }}>
                        LOCKED
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#f8fafc', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {region.name.toUpperCase()}
                  </div>
                </div>

                {/* Card Content & World Description */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '10px' }}>
                    {region.description}
                  </p>

                  {/* Requirements & Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                    {!isUnlocked ? (
                      <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px', color: levelLocked ? '#f43f5e' : '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                        <span>REQ LEVEL {region.requiredLevel}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <PixelStardustIcon size={11} />
                          {region.stardustCost} STARDUST
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-heading)' }}>
                        FAUNA: {env?.creatures?.length || 4} SPECIES
                      </div>
                    )}

                    <div>
                      {isCurrent ? (
                        <button className="cosmic-button" disabled style={{ padding: '6px 14px', fontSize: '10px', opacity: 0.8 }}>
                          CURRENT REALM
                        </button>
                      ) : isUnlocked ? (
                        <button
                          className="cosmic-button"
                          onClick={() => handleTravel(region)}
                          style={{ padding: '6px 16px', fontSize: '10px', background: '#0284c7' }}
                        >
                          ✦ TRAVEL ✦
                        </button>
                      ) : (
                        <button
                          className="cosmic-button"
                          disabled={!canUnlock}
                          onClick={() => handleUnlock(region)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '10px',
                            background: canUnlock ? '#7c3aed' : '#334155',
                            cursor: canUnlock ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {levelLocked ? `LV.${region.requiredLevel} REQ` : `UNLOCK (${region.stardustCost} ⭐)`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
