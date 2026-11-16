import React, { useState } from 'react';
import { SaveData, EquipmentType } from '../../types/game';
import { EQUIPMENT, getUpgradeCost, getStatValue } from '../../data/equipment';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';

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
      <div className="cosmic-panel modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">Cosmic Angler Equipment Shop</div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {(['rod', 'line', 'bait', 'bobber'] as EquipmentType[]).map((type) => {
            const eq = EQUIPMENT[type];
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => { setSelectedType(type); audio.playClick(); }}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {eq.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Item Details Box */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            {data.name}
          </div>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
            {data.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', color: '#e2e8f0' }}>Tier Level:</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#fbbf24' }}>
              Level {currentLevel} {isMaxLevel && '(MAX)'}
            </span>
          </div>

          {/* Stat Progression comparison */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Current {data.statName}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>
                {currentStat}{data.statUnit}
              </div>
            </div>

            {!isMaxLevel && (
              <>
                <ArrowRight size={20} color="#a855f7" />
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Next Tier</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>
                    {nextStat}{data.statUnit}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer with Cost & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Upgrade Cost:</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: canAfford ? '#fbbf24' : '#f43f5e' }}>
              {isMaxLevel ? 'Maximum Level Reached' : `${cost.toLocaleString()} Stardust`}
            </div>
          </div>

          <button
            className="cosmic-button"
            disabled={!canAfford}
            onClick={handleUpgrade}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            {isMaxLevel ? 'MAX TIER' : 'Upgrade Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
};
