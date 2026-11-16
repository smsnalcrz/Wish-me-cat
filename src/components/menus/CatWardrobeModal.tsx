import React from 'react';
import { SaveData, CatBreed } from '../../types/game';
import { CAT_BREEDS, CatBreedData } from '../../data/catBreeds';
import { generateCatSpriteSheet } from '../../game2d/rendering/PixelSprites';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelCatIcon, PixelCheckIcon } from '../ui/PixelIcons';

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
  const currentBreed = saveData.catBreed || 'celestial';
  const audio = AudioManager.getInstance();

  const handleEquip = (breedId: CatBreed) => {
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

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '800px', width: '92%' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PixelCatIcon size={22} />
              <span>CAT WARDROBE</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              CHOOSE YOUR FELINE ADVENTURER (4 BREEDS)
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Wardrobe">
            <PixelCloseIcon size={18} />
          </button>
        </div>

        {/* 4 Breeds Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '12px',
          maxHeight: '62vh',
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

                    {/* Color Swatches (Pixel Squares) */}
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
                          // Fallback to canvas dataURL if needed
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
                  onClick={() => handleEquip(breed.id)}
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
      </div>
    </div>
  );
};
