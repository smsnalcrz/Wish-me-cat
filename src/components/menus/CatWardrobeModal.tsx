import React, { useState, useEffect, useRef } from 'react';
import { SaveData, CatBreed, CatAccessoryType } from '../../types/game';
import { CAT_BREEDS, CatBreedData } from '../../data/catBreeds';
import {
  WishManager,
  CAT_ACCESSORIES
} from '../../systems/wishing/WishManager';
import { getEquippedRod } from '../../data/equipment';
import {
  generateCatSpriteSheet,
  generateAccessorySprite
} from '../../game2d/rendering/PixelSprites';
import { CharacterPackLoader } from '../../game2d/rendering/CharacterPackLoader';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import {
  PixelCloseIcon,
  PixelCatIcon,
  PixelCheckIcon,
  PixelFishingRodIcon
} from '../ui/PixelIcons';

interface CatWardrobeModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
  onSelectBreed: (breed: CatBreed) => void;
}

export const CatWardrobeModal: React.FC<CatWardrobeModalProps> = ({
  saveData,
  onClose,
  onUpdateSave,
  onSelectBreed
}) => {
  const [activeTab, setActiveTab] = useState<'breeds' | 'accessories'>('breeds');
  const [accessoryFilter, setAccessoryFilter] = useState<'all' | 'hat' | 'cape' | 'charm'>('all');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentBreed = saveData.catBreed || 'celestial';
  const audio = AudioManager.getInstance();
  const unlockedAccSet = new Set(saveData.unlockedAccessories || []);
  const equipped = saveData.equippedAccessories || {};
  const equippedRod = getEquippedRod(saveData);

  // Equip / switch cat breed
  const handleEquipBreed = (breedId: CatBreed) => {
    if (breedId === currentBreed) return;

    const newSave: SaveData = {
      ...saveData,
      catBreed: breedId
    };

    SaveManager.save(newSave);
    onUpdateSave(newSave);
    onSelectBreed(breedId);
    audio.playLevelUp();
  };

  // Equip / unequip accessory slot
  const handleToggleAccessory = (type: CatAccessoryType, id: string) => {
    if (equipped[type] === id) {
      WishManager.unequipAccessory(type);
    } else {
      WishManager.equipAccessory(type, id);
    }
    const updated = SaveManager.getData();
    onUpdateSave({ ...updated });
    audio.playClick();
  };

  // Render Real-Time Cosmic Dressing Mirror Canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 2.4;
    const centerX = canvas.width / 2;
    const baselineY = canvas.height - 18;

    // 1. Soft Cosmic Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(10, 8, 25, 0.65)';
    ctx.beginPath();
    ctx.ellipse(centerX, baselineY, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Equipped Cape (behind body for front facing)
    if (equipped.cape) {
      const capeCanvas = generateAccessorySprite(equipped.cape);
      const capeW = 22 * scale;
      const capeH = 18 * scale;
      ctx.drawImage(capeCanvas, Math.round(centerX - capeW / 2), Math.round(baselineY - 21 * scale), Math.round(capeW), Math.round(capeH));
    }

    // 3. Cat Sprite (Character Pack or procedural fallback)
    const loader = CharacterPackLoader.getInstance();
    const drawn = loader.drawFrame(
      ctx,
      currentBreed,
      'idle',
      0,
      centerX,
      baselineY,
      44 * scale,
      false,
      equippedRod.id
    );

    if (!drawn) {
      const fallbackSheet = generateCatSpriteSheet(currentBreed, equippedRod.lineColor);
      const sz = 24 * scale;
      ctx.drawImage(
        fallbackSheet.idleDown,
        Math.round(centerX - sz / 2),
        Math.round(baselineY - sz + 8 * scale),
        Math.round(sz),
        Math.round(sz)
      );
    }

    // 4. Equipped Charm (around collar)
    if (equipped.charm) {
      const charmCanvas = generateAccessorySprite(equipped.charm);
      const charmSz = 13 * scale;
      ctx.drawImage(
        charmCanvas,
        Math.round(centerX - charmSz / 2),
        Math.round(baselineY - 14 * scale),
        Math.round(charmSz),
        Math.round(charmSz)
      );
    }

    // 5. Equipped Hat (on top of head)
    if (equipped.hat) {
      const hatCanvas = generateAccessorySprite(equipped.hat);
      const hatW = 24 * scale;
      const hatH = 16 * scale;
      ctx.drawImage(
        hatCanvas,
        Math.round(centerX - hatW / 2),
        Math.round(baselineY - 30 * scale),
        Math.round(hatW),
        Math.round(hatH)
      );
    }
  }, [currentBreed, equipped.hat, equipped.cape, equipped.charm, equippedRod.id, equippedRod.lineColor]);

  // Filter accessories list
  const allAccessories = Object.values(CAT_ACCESSORIES);
  const filteredAccessories = allAccessories.filter(acc => {
    if (accessoryFilter === 'all') return true;
    return acc.type === accessoryFilter;
  });

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'mythic': return '#f43f5e';
      case 'legendary': return '#facc15';
      case 'epic': return '#c084fc';
      case 'rare': return '#38bdf8';
      case 'uncommon': return '#4ade80';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '860px', width: '94%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '10px' }}>
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PixelCatIcon size={22} />
              <span>CAT DRESSING ROOM</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              CUSTOMIZE YOUR FELINE HERO WITH BREEDS, HATS, CAPES & CHARMS
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Wardrobe">
            <PixelCloseIcon size={18} />
          </button>
        </div>

        {/* Live Dressing Mirror & Status Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '14px',
          background: 'linear-gradient(135deg, #0f0c29, #1b1442)',
          border: '2px solid #38bdf8',
          padding: '12px 16px',
          marginBottom: '12px'
        }}>
          {/* Live Preview Canvas */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '110px',
            background: '#070514',
            border: '2px solid #6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 16px rgba(99, 102, 241, 0.3)'
          }}>
            <canvas
              ref={previewCanvasRef}
              width={120}
              height={110}
              style={{ imageRendering: 'pixelated', width: '120px', height: '110px' }}
            />
            <span style={{
              position: 'absolute',
              bottom: '2px',
              fontSize: '8px',
              color: '#38bdf8',
              fontFamily: 'var(--font-heading)',
              background: 'rgba(7, 5, 20, 0.85)',
              padding: '1px 4px'
            }}>
              LIVE MIRROR
            </span>
          </div>

          {/* Current Outfit Summary */}
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#fef08a', fontFamily: 'var(--font-heading)' }}>
                ACTIVE GEAR LOADOUT
              </span>
              <span style={{ fontSize: '9px', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                {unlockedAccSet.size} / {allAccessories.length} ACCESSORIES UNLOCKED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
              {/* Breed */}
              <div style={{ background: '#09081a', padding: '5px 8px', border: '1px solid #312e81', fontSize: '10px' }}>
                <span style={{ color: '#94a3b8' }}>BREED: </span>
                <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{currentBreed.toUpperCase()}</span>
              </div>
              {/* Hat */}
              <div style={{ background: '#09081a', padding: '5px 8px', border: '1px solid #312e81', fontSize: '10px' }}>
                <span style={{ color: '#94a3b8' }}>HAT: </span>
                <span style={{ color: equipped.hat ? '#facc15' : '#64748b', fontWeight: 'bold' }}>
                  {equipped.hat ? (CAT_ACCESSORIES[equipped.hat]?.name || 'EQUIPPED') : 'NONE'}
                </span>
              </div>
              {/* Cape */}
              <div style={{ background: '#09081a', padding: '5px 8px', border: '1px solid #312e81', fontSize: '10px' }}>
                <span style={{ color: '#94a3b8' }}>CAPE: </span>
                <span style={{ color: equipped.cape ? '#c084fc' : '#64748b', fontWeight: 'bold' }}>
                  {equipped.cape ? (CAT_ACCESSORIES[equipped.cape]?.name || 'EQUIPPED') : 'NONE'}
                </span>
              </div>
              {/* Charm */}
              <div style={{ background: '#09081a', padding: '5px 8px', border: '1px solid #312e81', fontSize: '10px' }}>
                <span style={{ color: '#94a3b8' }}>CHARM: </span>
                <span style={{ color: equipped.charm ? '#38bdf8' : '#64748b', fontWeight: 'bold' }}>
                  {equipped.charm ? (CAT_ACCESSORIES[equipped.charm]?.name || 'EQUIPPED') : 'NONE'}
                </span>
              </div>
            </div>

            {/* Active Rod Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#cbd5e1' }}>
              <PixelFishingRodIcon size={14} />
              <span>ROD: <strong style={{ color: equippedRod.lineColor }}>{equippedRod.name}</strong></span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#38bdf8' }}>{equippedRod.passiveTitle}</span>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #281f4a', paddingBottom: '8px', marginBottom: '12px' }}>
          <button
            className={`pixel-btn ${activeTab === 'breeds' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '7px 16px' }}
            onClick={() => setActiveTab('breeds')}
          >
            🐱 FELINE BREEDS ({CAT_BREEDS.length})
          </button>
          <button
            className={`pixel-btn ${activeTab === 'accessories' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '11px', padding: '7px 16px' }}
            onClick={() => setActiveTab('accessories')}
          >
            👑 ACCESSORIES & COSMETICS ({allAccessories.length})
          </button>
        </div>

        {/* TAB 1: FELINE BREEDS */}
        {activeTab === 'breeds' && (
          <div className="responsive-card-grid" style={{
            maxHeight: '48vh',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {CAT_BREEDS.map((breed: CatBreedData) => {
              const isEquipped = currentBreed === breed.id;

              return (
                <div
                  key={breed.id}
                  style={{
                    padding: '14px',
                    border: isEquipped ? '2px solid #38bdf8' : '2px solid #281f4a',
                    background: isEquipped ? '#141c3d' : '#0c0a20',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    {/* Top Badge & Swatches */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-heading)',
                        padding: '3px 6px',
                        background: isEquipped ? '#0284c7' : '#1e1b4b',
                        color: isEquipped ? '#f8fafc' : '#94a3b8'
                      }}>
                        {breed.badge.toUpperCase()}
                      </span>

                      {/* Color Swatches */}
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span title="Fur Color" style={{ width: '12px', height: '12px', background: breed.primaryColorHex, border: '1px solid #000' }} />
                        <span title="Eye Color" style={{ width: '12px', height: '12px', background: breed.eyeColorHex, border: '1px solid #000' }} />
                        <span title="Collar Color" style={{ width: '12px', height: '12px', background: breed.collarColorHex, border: '1px solid #000' }} />
                      </div>
                    </div>

                    {/* Breed Name & Title with 2D Pixel Sprite Preview */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        background: '#070514',
                        border: `2px solid ${isEquipped ? '#38bdf8' : breed.primaryColorHex}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img
                          src={`/assets/character/${breed.id}/CharacterPortraits/front.png`}
                          alt={breed.name}
                          onError={(e) => {
                            e.currentTarget.src = generateCatSpriteSheet(breed.id).idleDown.toDataURL();
                          }}
                          style={{ width: '46px', height: '46px', imageRendering: 'pixelated', objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#f8fafc' }}>
                          {breed.name.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                          {breed.title.toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <img
                            src={`/assets/character/${breed.id}/CharacterPortraits/side.png`}
                            alt={`${breed.name} profile`}
                            title="Side Profile"
                            style={{ width: '22px', height: '22px', imageRendering: 'pixelated' }}
                          />
                          <img
                            src={`/assets/character/${breed.id}/CharacterPortraits/icon.png`}
                            alt={`${breed.name} icon`}
                            title="Badge Icon"
                            style={{ width: '22px', height: '22px', imageRendering: 'pixelated' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lore */}
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                      {breed.lore}
                    </div>
                  </div>

                  {/* Equip Button */}
                  <button
                    onClick={() => handleEquipBreed(breed.id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: isEquipped ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: isEquipped ? '#15803d' : '#0369a1',
                      color: '#ffffff',
                      boxShadow: isEquipped
                        ? '0 -2px 0 0 #22c55e, 0 2px 0 0 #14532d, -2px 0 0 0 #22c55e, 2px 0 0 0 #14532d'
                        : '0 -2px 0 0 #38bdf8, 0 2px 0 0 #0c4a6e, -2px 0 0 0 #38bdf8, 2px 0 0 0 #0c4a6e'
                    }}
                  >
                    {isEquipped ? (
                      <>
                        <PixelCheckIcon size={14} color="#ffffff" />
                        <span>EQUIPPED</span>
                      </>
                    ) : (
                      <span>SELECT {breed.name.toUpperCase()}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: ACCESSORIES & COSMETICS */}
        {activeTab === 'accessories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Sub-filter pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {(['all', 'hat', 'cape', 'charm'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setAccessoryFilter(filter)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-heading)',
                    border: '1px solid',
                    borderColor: accessoryFilter === filter ? '#38bdf8' : '#312e81',
                    background: accessoryFilter === filter ? '#0284c7' : '#09081a',
                    color: accessoryFilter === filter ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {filter.toUpperCase()} {filter === 'all' ? `(${allAccessories.length})` : `(${allAccessories.filter(a => a.type === filter).length})`}
                </button>
              ))}
            </div>

            {/* Accessories Grid */}
            <div className="responsive-card-grid" style={{
              maxHeight: '44vh',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {filteredAccessories.map(acc => {
                const isUnlocked = unlockedAccSet.has(acc.id);
                const isEquipped = equipped[acc.type] === acc.id;

                return (
                  <div
                    key={acc.id}
                    className="cosmic-panel"
                    style={{
                      padding: '12px',
                      border: '1px solid',
                      borderColor: isEquipped ? '#facc15' : isUnlocked ? '#312e81' : '#1e1b4b',
                      background: isUnlocked ? (isEquipped ? '#181530' : '#09081a') : 'rgba(5, 4, 12, 0.55)',
                      opacity: isUnlocked ? 1 : 0.65,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      {/* Top Bar: Icon, Slot & Rarity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '22px' }}>{acc.icon}</span>
                          <span style={{ fontSize: '8px', color: '#94a3b8', background: '#1e1b4b', padding: '2px 5px' }}>
                            {acc.type.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span className={`rarity-badge rarity-${acc.rarity}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                            {acc.rarity}
                          </span>
                          {isEquipped && (
                            <span style={{ background: '#facc15', color: '#09081a', padding: '2px 5px', fontSize: '8px', fontWeight: 'bold' }}>
                              EQUIPPED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Lore */}
                      <div style={{ fontSize: '12px', color: isUnlocked ? '#f8fafc' : '#64748b', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '6px' }}>
                        {acc.description}
                      </div>

                      {/* Perk Bonus */}
                      <div style={{
                        fontSize: '10px',
                        color: isUnlocked ? '#38bdf8' : '#64748b',
                        borderTop: '1px solid #1e1b4b',
                        paddingTop: '6px'
                      }}>
                        ✦ PERK: {acc.bonusDescription}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isUnlocked ? (
                      <button
                        className={`pixel-btn ${isEquipped ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onClick={() => handleToggleAccessory(acc.type, acc.id)}
                      >
                        {isEquipped ? (
                          <>
                            <PixelCheckIcon size={12} color="#ffffff" />
                            <span>UNEQUIP {acc.type.toUpperCase()}</span>
                          </>
                        ) : (
                          <span>EQUIP {acc.type.toUpperCase()}</span>
                        )}
                      </button>
                    ) : (
                      <div style={{
                        fontSize: '9px',
                        color: '#64748b',
                        textAlign: 'center',
                        padding: '6px',
                        background: '#070514',
                        border: '1px dashed #281f4a'
                      }}>
                        🔒 UNLOCK VIA CELESTIAL FOUNTAIN
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
