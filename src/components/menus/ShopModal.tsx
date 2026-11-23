import React, { useState } from 'react';
import { SaveData, EquipmentType, CreatureRarity } from '../../types/game';
import { EQUIPMENT, EQUIPMENT_VISUALS, ROD_MODELS, getUpgradeCost, getStatValue, getEquippedRod } from '../../data/equipment';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelStardustIcon, PixelShopIcon } from '../ui/PixelIcons';

interface ShopModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
}

type ShopTab = 'upgrades' | 'armory';

const RARITY_COLORS: Record<CreatureRarity, { text: string; bg: string; border: string }> = {
  common: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: '#475569' },
  uncommon: { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: '#16a34a' },
  rare: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7' },
  epic: { text: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#7e22ce' },
  legendary: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: '#b45309' },
  mythic: { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.18)', border: '#e11d48' }
};

export const ShopModal: React.FC<ShopModalProps> = ({ saveData, onClose, onUpdateSave }) => {
  const [shopTab, setShopTab] = useState<ShopTab>('upgrades');
  const [selectedType, setSelectedType] = useState<EquipmentType>('rod');
  const [selectedRodId, setSelectedRodId] = useState<string>(saveData.equippedRodId || 'rod_starlight');
  
  const audio = AudioManager.getInstance();

  // Upgrades Logic
  const data = EQUIPMENT[selectedType];
  const visual = EQUIPMENT_VISUALS[selectedType];
  const levelKey = `${selectedType}Level` as keyof SaveData;
  const currentLevel = (saveData[levelKey] as number) || 1;
  const isMaxLevel = currentLevel >= data.maxLevel;
  const upgradeCost = getUpgradeCost(selectedType, currentLevel);
  const canAffordUpgrade = saveData.stardust >= upgradeCost && !isMaxLevel;
  const currentStat = getStatValue(selectedType, currentLevel);
  const nextStat = getStatValue(selectedType, currentLevel + 1);

  // Armory Logic
  const unlockedRods = saveData.unlockedRodIds || ['rod_starlight'];
  const equippedRodId = saveData.equippedRodId || 'rod_starlight';
  const selectedRod = ROD_MODELS[selectedRodId] || ROD_MODELS.rod_starlight;
  const isSelectedUnlocked = unlockedRods.includes(selectedRodId);
  const isSelectedEquipped = equippedRodId === selectedRodId;
  const canAffordRod = saveData.stardust >= selectedRod.cost && !isSelectedUnlocked;
  const rodRarityStyle = RARITY_COLORS[selectedRod.rarity];

  const handleUpgrade = () => {
    if (!canAffordUpgrade) return;

    const newSave = {
      ...saveData,
      stardust: saveData.stardust - upgradeCost,
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

  const handleEquipRod = (rodId: string) => {
    if (!unlockedRods.includes(rodId)) return;
    const newSave: SaveData = {
      ...saveData,
      equippedRodId: rodId
    };
    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.playClick();
  };

  const handleBuyRod = (rodId: string) => {
    const rod = ROD_MODELS[rodId];
    if (!rod || unlockedRods.includes(rodId)) return;
    if (saveData.stardust < rod.cost) return;

    const newUnlocked = [...unlockedRods, rodId];
    const newSave: SaveData = {
      ...saveData,
      stardust: saveData.stardust - rod.cost,
      unlockedRodIds: newUnlocked,
      equippedRodId: rodId // Automatically equip newly forged rod!
    };

    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.playCoin();
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '680px', width: '95%' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '10px' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelShopIcon size={22} />
            <span>COSMIC GEAR EMPORIUM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#070514',
              border: '1px solid #312e81',
              padding: '4px 10px',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              color: '#fbbf24'
            }}>
              <PixelStardustIcon size={14} />
              <span>{saveData.stardust.toLocaleString()}</span>
            </div>
            <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
          </div>
        </div>

        {/* Primary Mode Tabs (Upgrades vs Rod Armory) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => { setShopTab('upgrades'); audio.playClick(); }}
            style={{
              padding: '8px',
              border: 'none',
              background: shopTab === 'upgrades' ? '#38bdf8' : '#1e1b4b',
              color: shopTab === 'upgrades' ? '#0f172a' : '#cbd5e1',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              cursor: 'pointer',
              boxShadow: shopTab === 'upgrades'
                ? '0 -2px 0 0 #7dd3fc, 0 2px 0 0 #0284c7, -2px 0 0 0 #7dd3fc, 2px 0 0 0 #0284c7'
                : '0 -2px 0 0 #312e81, 0 2px 0 0 #0f172a, -2px 0 0 0 #312e81, 2px 0 0 0 #0f172a',
              transition: 'all 0.15s ease'
            }}
          >
            ✦ GEAR UPGRADES (4)
          </button>
          <button
            onClick={() => { setShopTab('armory'); audio.playClick(); }}
            style={{
              padding: '8px',
              border: 'none',
              background: shopTab === 'armory' ? '#a855f7' : '#1e1b4b',
              color: shopTab === 'armory' ? '#ffffff' : '#cbd5e1',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              cursor: 'pointer',
              boxShadow: shopTab === 'armory'
                ? '0 -2px 0 0 #c084fc, 0 2px 0 0 #7e22ce, -2px 0 0 0 #c084fc, 2px 0 0 0 #7e22ce'
                : '0 -2px 0 0 #312e81, 0 2px 0 0 #0f172a, -2px 0 0 0 #312e81, 2px 0 0 0 #0f172a',
              transition: 'all 0.15s ease'
            }}
          >
            ★ ROD ARMORY (6)
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: GEAR UPGRADES (ROD, LINE, BAIT, BOBBER)                           */}
        {/* ========================================================================= */}
        {shopTab === 'upgrades' && (
          <div>
            {/* Category Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
              {(['rod', 'line', 'bait', 'bobber'] as EquipmentType[]).map((type) => {
                const eq = EQUIPMENT[type];
                const isSelected = selectedType === type;
                const v = EQUIPMENT_VISUALS[type];
                return (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); audio.playClick(); }}
                    style={{
                      padding: '8px 4px',
                      border: 'none',
                      background: isSelected ? v.accentColor : '#1e1b4b',
                      color: isSelected ? '#0f172a' : '#cbd5e1',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 -2px 0 0 #f8fafc, 0 2px 0 0 #0f172a, -2px 0 0 0 #f8fafc, 2px 0 0 0 #0f172a'
                        : '0 -2px 0 0 #312e81, 0 2px 0 0 #0f172a, -2px 0 0 0 #312e81, 2px 0 0 0 #0f172a',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {eq.name.split(' ')[0].toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Item Showcase & Details Card */}
            <div className="shop-showcase-grid" style={{
              background: '#0a081a',
              padding: '14px',
              border: '2px solid #281f4a'
            }}>
              {/* Visual Showcase Pedestal */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: visual.bgGradient,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 8px',
                position: 'relative'
              }}>
                <img
                  src={visual.sprite}
                  alt={data.name}
                  style={{
                    width: '76px',
                    height: '76px',
                    imageRendering: 'pixelated',
                    animation: 'gearFloat 3s ease-in-out infinite',
                    filter: `drop-shadow(0 0 10px ${visual.accentColor})`
                  }}
                />
                <div style={{
                  marginTop: '8px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9px',
                  color: visual.accentColor,
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '3px 6px',
                  border: `1px solid ${visual.accentColor}`
                }}>
                  {visual.label}
                </div>
              </div>

              {/* Information & Stats */}
              <div>
                <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#fef08a', marginBottom: '6px' }}>
                  {data.name.toUpperCase()}
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
                  {data.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontFamily: 'var(--font-heading)', fontSize: '11px' }}>
                  <span style={{ color: '#cbd5e1' }}>TIER PROGRESSION:</span>
                  <span style={{ color: '#fbbf24' }}>
                    LEVEL {currentLevel} / {data.maxLevel} {isMaxLevel && '(MAX)'}
                  </span>
                </div>

                {/* Stat Progression comparison */}
                <div style={{ background: '#14102d', padding: '10px 12px', border: '1px solid #281f4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>CURRENT {data.statName.toUpperCase()}</div>
                    <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: visual.accentColor }}>
                      {currentStat}{data.statUnit}
                    </div>
                  </div>

                  {!isMaxLevel && (
                    <>
                      <span style={{ color: '#a855f7', fontFamily: 'var(--font-heading)' }}>▶</span>
                      <div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>NEXT TIER</div>
                        <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#4ade80' }}>
                          {nextStat}{data.statUnit}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Cost & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>UPGRADE COST:</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: canAffordUpgrade ? '#fbbf24' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PixelStardustIcon size={16} />
                  <span>{isMaxLevel ? 'MAX TIER REACHED' : `${upgradeCost.toLocaleString()} STARDUST`}</span>
                </div>
              </div>

              <button
                className="cosmic-button"
                disabled={!canAffordUpgrade}
                onClick={handleUpgrade}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isMaxLevel ? '✦ MAX TIER ✦' : '✦ UPGRADE GEAR ✦'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: ROD ARMORY (COLLECTIBLE CELESTIAL RODS)                           */}
        {/* ========================================================================= */}
        {shopTab === 'armory' && (
          <div>
            {/* Rods Grid Selector */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '6px',
              marginBottom: '10px'
            }}>
              {Object.values(ROD_MODELS).map((rod) => {
                const isSelected = selectedRodId === rod.id;
                const isEquipped = equippedRodId === rod.id;
                const isUnlocked = unlockedRods.includes(rod.id);
                const rStyle = RARITY_COLORS[rod.rarity];

                return (
                  <div
                    key={rod.id}
                    onClick={() => { setSelectedRodId(rod.id); audio.playClick(); }}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#0f0c24',
                      border: `2px solid ${isSelected ? '#38bdf8' : isEquipped ? '#10b981' : '#281f4a'}`,
                      padding: '6px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-3px',
                        background: '#10b981',
                        color: '#022c22',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '7px',
                        padding: '1px 3px',
                        fontWeight: 'bold',
                        zIndex: 2
                      }}>
                        EQ
                      </div>
                    )}

                    <img
                      src={rod.spriteUrl}
                      alt={rod.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        imageRendering: 'pixelated',
                        opacity: isUnlocked ? 1 : 0.45,
                        filter: isSelected ? `drop-shadow(0 0 6px ${rod.lineColor})` : 'none'
                      }}
                    />

                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '8px',
                      color: isSelected ? '#fef08a' : '#cbd5e1',
                      marginTop: '4px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {rod.name.split(' ')[0]}
                    </div>

                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '7px',
                      color: isUnlocked ? '#4ade80' : '#fbbf24',
                      marginTop: '2px'
                    }}>
                      {isUnlocked ? (isEquipped ? 'EQUIPPED' : 'OWNED') : `${rod.cost}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Rod Inspection Panel */}
            <div className="shop-showcase-grid" style={{
              background: '#0a081a',
              padding: '14px',
              border: `2px solid ${rodRarityStyle.border}`
            }}>
              {/* Animated Pedestal */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle, ${selectedRod.lineColor}26 0%, rgba(15,23,42,0) 70%)`,
                border: `1px solid ${rodRarityStyle.border}`,
                padding: '12px 8px'
              }}>
                <img
                  src={selectedRod.spriteUrl}
                  alt={selectedRod.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    imageRendering: 'pixelated',
                    animation: 'gearFloat 3s ease-in-out infinite',
                    filter: `drop-shadow(0 0 10px ${selectedRod.lineColor})`
                  }}
                />
                <div style={{
                  marginTop: '8px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9px',
                  color: rodRarityStyle.text,
                  background: rodRarityStyle.bg,
                  padding: '3px 8px',
                  border: `1px solid ${rodRarityStyle.border}`,
                  textTransform: 'uppercase'
                }}>
                  {selectedRod.rarity}
                </div>
              </div>

              {/* Info, Lore & Passives */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#fef08a' }}>
                      {selectedRod.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: rodRarityStyle.text, marginBottom: '6px' }}>
                      {selectedRod.title}
                    </div>
                  </div>
                  {isSelectedEquipped && (
                    <span style={{
                      background: '#10b981',
                      color: '#022c22',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '9px',
                      padding: '3px 6px',
                      fontWeight: 'bold'
                    }}>
                      ✦ EQUIPPED ✦
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '10px' }}>
                  {selectedRod.description}
                </p>

                {/* Passive Perk Banner */}
                <div style={{
                  background: '#14102d',
                  border: '1px solid #3b2d6a',
                  padding: '8px 10px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: '#38bdf8', marginBottom: '2px' }}>
                    ★ PASSIVE: {selectedRod.passiveTitle.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#f1f5f9', lineHeight: 1.35 }}>
                    {selectedRod.passiveDesc}
                  </div>
                </div>

                {/* Stat Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '9px', fontFamily: 'var(--font-heading)' }}>
                  {selectedRod.bonusCastRangePct && (
                    <span style={{ background: '#1e293b', color: '#38bdf8', padding: '3px 6px', border: '1px solid #0284c7' }}>
                      RANGE +{Math.round(selectedRod.bonusCastRangePct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusSafeZonePct && (
                    <span style={{ background: '#1e293b', color: '#c084fc', padding: '3px 6px', border: '1px solid #7e22ce' }}>
                      SAFE ZONE +{Math.round(selectedRod.bonusSafeZonePct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusBiteSpeedPct && (
                    <span style={{ background: '#1e293b', color: '#4ade80', padding: '3px 6px', border: '1px solid #16a34a' }}>
                      BITE SPEED +{Math.round(selectedRod.bonusBiteSpeedPct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusRareWeightPct && (
                    <span style={{ background: '#1e293b', color: '#f43f5e', padding: '3px 6px', border: '1px solid #e11d48' }}>
                      RARE ATTRACTION +{Math.round(selectedRod.bonusRareWeightPct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusStardustPct && (
                    <span style={{ background: '#1e293b', color: '#fbbf24', padding: '3px 6px', border: '1px solid #b45309' }}>
                      STARDUST +{Math.round(selectedRod.bonusStardustPct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusExpPct && (
                    <span style={{ background: '#1e293b', color: '#86efac', padding: '3px 6px', border: '1px solid #15803d' }}>
                      EXP +{Math.round(selectedRod.bonusExpPct * 100)}%
                    </span>
                  )}
                  {selectedRod.bonusTensionHearts && (
                    <span style={{ background: '#1e293b', color: '#f43f5e', padding: '3px 6px', border: '1px solid #e11d48' }}>
                      +{selectedRod.bonusTensionHearts} TENSION HEART
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Armory Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>ROD STATUS:</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: isSelectedUnlocked ? '#4ade80' : canAffordRod ? '#fbbf24' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSelectedUnlocked ? (
                    <span>{isSelectedEquipped ? '✦ CURRENTLY EQUIPPED' : '✓ UNLOCKED & READY'}</span>
                  ) : (
                    <>
                      <PixelStardustIcon size={16} />
                      <span>{selectedRod.cost.toLocaleString()} STARDUST</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {isSelectedEquipped ? (
                  <button className="cosmic-button" disabled style={{ opacity: 0.8, background: '#065f46', borderColor: '#10b981' }}>
                    ✦ EQUIPPED ✦
                  </button>
                ) : isSelectedUnlocked ? (
                  <button className="cosmic-button" onClick={() => handleEquipRod(selectedRodId)}>
                    ★ EQUIP ROD ★
                  </button>
                ) : (
                  <button
                    className="cosmic-button"
                    disabled={!canAffordRod}
                    onClick={() => handleBuyRod(selectedRodId)}
                  >
                    ✦ FORGE & EQUIP ✦
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
