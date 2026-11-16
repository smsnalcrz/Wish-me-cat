import React, { useState } from 'react';
import { SaveData, CelestialCreature } from '../../types/game';
import { CREATURES } from '../../data/creatures';
import { generateCreatureSprite } from '../../game2d/rendering/PixelSprites';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, Sparkles, HelpCircle } from 'lucide-react';

interface CollectionModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({ saveData, onClose }) => {
  const [selectedCreature, setSelectedCreature] = useState<CelestialCreature>(CREATURES[0]);
  const audio = AudioManager.getInstance();

  const discoveredCount = saveData.discoveredCreatureIds.length;
  const totalCount = CREATURES.length;

  const isSelectedDiscovered = saveData.discoveredCreatureIds.includes(selectedCreature.id);
  const selectedRecord = saveData.catchRecords[selectedCreature.id];

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card" style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Star Collection Almanac</div>
            <div style={{ fontSize: '14px', color: '#38bdf8', marginTop: '2px' }}>
              {discoveredCount} / {totalCount} Celestial Species Discovered ({Math.round((discoveredCount/totalCount)*100)}%)
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Content Body: Left Grid & Right Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Left Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {CREATURES.map((creature) => {
              const discovered = saveData.discoveredCreatureIds.includes(creature.id);
              const isSelected = selectedCreature.id === creature.id;

              return (
                <div
                  key={creature.id}
                  onClick={() => { setSelectedCreature(creature); audio.playClick(); }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: discovered ? 'rgba(0,0,0,0.5)' : '#1e1b4b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: discovered ? `0 0 10px ${creature.glowColor}` : 'none',
                      border: discovered ? `1px solid ${creature.glowColor}` : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {discovered ? (
                      <img
                        src={generateCreatureSprite(creature.modelType, creature.rarity).toDataURL()}
                        alt={creature.name}
                        style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <HelpCircle size={22} color="#475569" />
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: discovered ? '#f8fafc' : '#64748b' }}>
                      {discovered ? creature.name : '??? (Unknown Star)'}
                    </div>
                    <span className={`rarity-badge rarity-${creature.rarity}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {discovered ? creature.rarity : 'Uncataloged'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Inspector Box */}
          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isSelectedDiscovered ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <img
                    src={generateCreatureSprite(selectedCreature.modelType, selectedCreature.rarity).toDataURL()}
                    alt={selectedCreature.name}
                    style={{ width: '72px', height: '72px', imageRendering: 'pixelated', filter: `drop-shadow(0 0 10px ${selectedCreature.glowColor})` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: selectedCreature.glowColor }}>
                    {selectedCreature.name}
                  </div>
                  <span className={`rarity-badge rarity-${selectedCreature.rarity}`}>
                    {selectedCreature.rarity}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {selectedCreature.description}
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Total Catches:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedRecord?.count || 1}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Largest Recorded:</span>
                    <strong style={{ color: '#fbbf24' }}>{selectedRecord?.maxWeight || selectedCreature.minWeight} light-grams</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Variants Discovered:</span>
                    <strong style={{ color: '#c084fc' }}>
                      {selectedRecord?.variants.length ? selectedRecord.variants.join(', ') : 'Normal'}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '12px' }}>
                <HelpCircle size={48} color="#475569" />
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#94a3b8' }}>Mystery Star Entity</div>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Cast your line into the Starpond with better cosmic bait to discover this celestial creature!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
