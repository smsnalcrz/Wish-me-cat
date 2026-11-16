import React, { useState } from 'react';
import { SaveData, EquipmentType } from '../../types/game';
import { EQUIPMENT, getUpgradeCost, getStatValue } from '../../data/equipment';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelStardustIcon, PixelShopIcon } from '../ui/PixelIcons';

interface ShopModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ saveData, onClose, onUpdateSave }) => {
  const [selectedType, setSelectedType] = useState<EquipmentType>('rod');
  const audio = AudioManager.getInstance();

  const data = EQUIPMENT[selectedType];
  const levelKey = `${selectedType}Level` as keyof SaveData;
  const currentLevel = (saveData[levelKey] as number) || 1;
  const isMaxLevel = currentLevel >= data.maxLevel;
  const cost = getUpgradeCost(selectedType, currentLevel);
  const canAfford = saveData.stardust >= cost && !isMaxLevel;

  const currentStat = getStatValue(selectedType, currentLevel);
  const nextStat = getStatValue(selectedType, currentLevel + 1);

  const handleUpgrade = () => {
    if (!canAfford) return;

    const newSave = {
      ...saveData,
      stardust: saveData.stardust - cost,
      [levelKey]: currentLevel + 1
    };

    // Check quest 04 (Upgrade gear)
    if (!newSave.completedQuestIds.includes('quest_04')) {
      newSave.completedQuestIds.push('quest_04');
    }

    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.playCoin();
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelShopIcon size={22} />
            <span>COSMIC GEAR EMPORIUM</span>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {(['rod', 'line', 'bait', 'bobber'] as EquipmentType[]).map((type) => {
            const eq = EQUIPMENT[type];
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => { setSelectedType(type); audio.playClick(); }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  background: isSelected ? '#38bdf8' : '#1e1b4b',
                  color: isSelected ? '#0f172a' : '#cbd5e1',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 -2px 0 0 #7dd3fc, 0 2px 0 0 #0284c7, -2px 0 0 0 #7dd3fc, 2px 0 0 0 #0284c7'
                    : '0 -2px 0 0 #312e81, 0 2px 0 0 #0f172a, -2px 0 0 0 #312e81, 2px 0 0 0 #0f172a'
                }}
              >
                {eq.name.split(' ')[0].toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Item Details Box */}
        <div style={{ background: '#0a081a', padding: '16px', border: '2px solid #281f4a' }}>
          <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#fef08a', marginBottom: '6px' }}>
            {data.name.toUpperCase()}
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '14px' }}>
            {data.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontFamily: 'var(--font-heading)', fontSize: '11px' }}>
            <span style={{ color: '#cbd5e1' }}>TIER LEVEL:</span>
            <span style={{ color: '#fbbf24' }}>
              LEVEL {currentLevel} {isMaxLevel && '(MAX)'}
            </span>
          </div>

          {/* Stat Progression comparison */}
          <div style={{ background: '#14102d', padding: '12px', border: '1px solid #281f4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>CURRENT {data.statName.toUpperCase()}</div>
              <div style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>
                {currentStat}{data.statUnit}
              </div>
            </div>

            {!isMaxLevel && (
              <>
                <span style={{ color: '#a855f7', fontFamily: 'var(--font-heading)' }}>▶</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>NEXT TIER</div>
                  <div style={{ fontSize: '16px', fontFamily: 'var(--font-heading)', color: '#4ade80' }}>
                    {nextStat}{data.statUnit}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer with Cost & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>UPGRADE COST:</div>
            <div style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', color: canAfford ? '#fbbf24' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PixelStardustIcon size={16} />
              <span>{isMaxLevel ? 'MAX TIER' : `${cost.toLocaleString()} STARDUST`}</span>
            </div>
          </div>

          <button
            className="cosmic-button"
            disabled={!canAfford}
            onClick={handleUpgrade}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isMaxLevel ? '✦ MAX TIER ✦' : '✦ UPGRADE GEAR ✦'}
          </button>
        </div>
      </div>
    </div>
  );
};
