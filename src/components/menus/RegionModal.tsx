import React from 'react';
import { SaveData, RegionData } from '../../types/game';
import { REGIONS } from '../../data/regions';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, Lock, CheckCircle, Navigation } from 'lucide-react';

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
      <div className="cosmic-panel modal-card" style={{ maxWidth: '740px' }}>
        <div className="modal-header">
          <div className="modal-title">Cosmic Region Gateway</div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {REGIONS.map((region) => {
            const isUnlocked = saveData.unlockedRegionIds.includes(region.id);
            const isCurrent = saveData.currentRegionId === region.id;
            const canUnlock = !isUnlocked && saveData.playerLevel >= region.requiredLevel && saveData.stardust >= region.stardustCost;
            const levelLocked = saveData.playerLevel < region.requiredLevel;

            return (
              <div
                key={region.id}
                style={{
                  background: isCurrent ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0,0,0,0.3)',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: isCurrent ? '2px solid #38bdf8' : (isUnlocked ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                      {region.name}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        CURRENT LOCATION
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                    {region.description}
                  </p>

                  {!isUnlocked && (
                    <div style={{ fontSize: '12px', display: 'flex', gap: '12px', color: levelLocked ? '#f43f5e' : '#fbbf24' }}>
                      <span>Requires Level {region.requiredLevel}</span>
                      <span>•</span>
                      <span>Unlock Cost: {region.stardustCost} Stardust</span>
                    </div>
                  )}
                </div>

                <div>
                  {isCurrent ? (
                    <button className="cosmic-button" disabled style={{ padding: '8px 20px', fontSize: '14px' }}>
                      Here
                    </button>
                  ) : isUnlocked ? (
                    <button
                      className="cosmic-button"
                      onClick={() => handleTravel(region)}
                      style={{ padding: '8px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Navigation size={16} /> Travel
                    </button>
                  ) : (
                    <button
                      className="cosmic-button"
                      disabled={!canUnlock}
                      onClick={() => handleUnlock(region)}
                      style={{ padding: '8px 20px', fontSize: '14px' }}
                    >
                      {levelLocked ? `Locked (Lv.${region.requiredLevel})` : `Unlock (${region.stardustCost} ⭐)`}
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
