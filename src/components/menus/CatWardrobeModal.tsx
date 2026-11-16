import React from 'react';
import { SaveData, CatBreed } from '../../types/game';
import { CAT_BREEDS, CatBreedData } from '../../data/catBreeds';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, Check, Sparkles, Heart } from 'lucide-react';

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
    audio.playLevelUp(); // Joyful celebration chime!
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card" style={{ maxWidth: '820px', width: '92%' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🐱 Celestial Cat Wardrobe</span>
              <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px' }}>
                4 Breeds Available
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Select your favorite feline adventurer to explore the Starpond and fish for living stars!
            </div>
          </div>
          <button className="close-btn" onClick={onClose} title="Close Wardrobe">
            <X size={22} />
          </button>
        </div>

        {/* 4 Breeds Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px',
          maxHeight: '62vh',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {CAT_BREEDS.map((breed: CatBreedData) => {
            const isEquipped = currentBreed === breed.id;

            return (
              <div
                key={breed.id}
                className="cosmic-panel"
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: isEquipped ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isEquipped ? 'rgba(14, 165, 233, 0.12)' : 'rgba(15, 23, 42, 0.65)',
                  boxShadow: isEquipped ? '0 0 24px rgba(56, 189, 248, 0.35)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  {/* Top Badge & Swatches */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: isEquipped ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: isEquipped ? '#38bdf8' : '#cbd5e1'
                    }}>
                      {breed.badge}
                    </span>

                    {/* Color Swatches */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span title="Fur Color" style={{ width: '14px', height: '14px', borderRadius: '50%', background: breed.primaryColorHex, border: '1px solid rgba(255,255,255,0.4)' }} />
                      <span title="Eye Color" style={{ width: '14px', height: '14px', borderRadius: '50%', background: breed.eyeColorHex, border: '1px solid rgba(255,255,255,0.4)', boxShadow: `0 0 6px ${breed.eyeColorHex}` }} />
                      <span title="Collar Color" style={{ width: '14px', height: '14px', borderRadius: '50%', background: breed.collarColorHex, border: '1px solid rgba(255,255,255,0.4)' }} />
                    </div>
                  </div>

                  {/* Breed Name & Title */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.3px' }}>
                      {breed.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
                      {breed.title}
                    </div>
                  </div>

                  {/* Tagline */}
                  <div style={{ fontSize: '12px', color: '#e2e8f0', fontStyle: 'italic', marginTop: '6px' }}>
                    "{breed.tagline}"
                  </div>

                  {/* Lore */}
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.45 }}>
                    {breed.lore}
                  </div>

                  {/* Signature Features */}
                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {breed.features.map((feat, idx) => (
                      <span key={idx} style={{
                        fontSize: '11px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        • {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equip Button */}
                <button
                  onClick={() => handleEquip(breed.id)}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: isEquipped ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isEquipped
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    boxShadow: isEquipped ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isEquipped ? (
                    <>
                      <Check size={18} />
                      <span>EQUIPPED & ACTIVE</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>CHOOSE {breed.name.toUpperCase()}</span>
                    </>
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
