import React from 'react';
import { SaveData, RegionData } from '../../types/game';
import { REGIONS } from '../../data/regions';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelRegionIcon, PixelStardustIcon } from '../ui/PixelIcons';

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
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelRegionIcon size={22} />
            <span>COSMIC REALM GATEWAY</span>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {REGIONS.map((region) => {
            const isUnlocked = saveData.unlockedRegionIds.includes(region.id);
            const isCurrent = saveData.currentRegionId === region.id;
            const canUnlock = !isUnlocked && saveData.playerLevel >= region.requiredLevel && saveData.stardust >= region.stardustCost;
            const levelLocked = saveData.playerLevel < region.requiredLevel;

            return (
              <div
                key={region.id}
                style={{
                  background: isCurrent ? '#16204a' : '#0c0a20',
                  padding: '14px 16px',
                  border: isCurrent ? '2px solid #38bdf8' : (isUnlocked ? '2px solid #3b2c68' : '2px solid #201b38'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                      {region.name.toUpperCase()}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '9px', background: '#0284c7', color: '#fff', padding: '2px 6px', fontFamily: 'var(--font-heading)' }}>
                        CURRENT
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    {region.description}
                  </p>

                  {!isUnlocked && (
                    <div style={{ fontSize: '10px', display: 'flex', gap: '10px', color: levelLocked ? '#f43f5e' : '#fbbf24', fontFamily: 'var(--font-heading)' }}>
                      <span>REQ LVL {region.requiredLevel}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PixelStardustIcon size={12} />
                        COST: {region.stardustCost} STARDUST
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {isCurrent ? (
                    <button className="cosmic-button" disabled style={{ padding: '6px 14px', fontSize: '10px' }}>
                      HERE
                    </button>
                  ) : isUnlocked ? (
                    <button
                      className="cosmic-button"
                      onClick={() => handleTravel(region)}
                      style={{ padding: '6px 14px', fontSize: '10px' }}
                    >
                      ✦ TRAVEL ✦
                    </button>
                  ) : (
                    <button
                      className="cosmic-button"
                      disabled={!canUnlock}
                      onClick={() => handleUnlock(region)}
                      style={{ padding: '6px 14px', fontSize: '10px', background: canUnlock ? '#6d28d9' : '#334155' }}
                    >
                      {levelLocked ? `LOCKED (LV.${region.requiredLevel})` : `UNLOCK (${region.stardustCost} ⭐)`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
