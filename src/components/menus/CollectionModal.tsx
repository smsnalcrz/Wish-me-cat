import React, { useState } from 'react';
import { SaveData, CelestialCreature } from '../../types/game';
import { CREATURES } from '../../data/creatures';
import { generateCreatureSprite } from '../../game2d/rendering/PixelSprites';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelAlmanacIcon } from '../ui/PixelIcons';

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
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PixelAlmanacIcon size={22} />
              <span>STAR ALMANAC</span>
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {discoveredCount} / {totalCount} SPECIES CATALOGED ({Math.round((discoveredCount/totalCount)*100)}%)
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        {/* Content Body: Left Grid & Right Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
          {/* Left Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {CREATURES.map((creature) => {
              const discovered = saveData.discoveredCreatureIds.includes(creature.id);
              const isSelected = selectedCreature.id === creature.id;

              return (
                <div
                  key={creature.id}
                  onClick={() => { setSelectedCreature(creature); audio.playClick(); }}
                  style={{
                    padding: '10px',
                    border: isSelected ? '2px solid #38bdf8' : '2px solid #281f4a',
                    background: isSelected ? '#1e245a' : '#100d24',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#090817',
                      border: '1px solid #392b61',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {discovered ? (
                      <img
                        src={generateCreatureSprite(creature.modelType, creature.rarity).toDataURL()}
                        alt={creature.name}
                        style={{ width: '28px', height: '28px', imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', color: '#64748b' }}>?</span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: discovered ? '#f8fafc' : '#64748b' }}>
                      {discovered ? creature.name.toUpperCase() : '???'}
                    </div>
                    <span className={`rarity-badge rarity-${creature.rarity}`} style={{ fontSize: '9px', padding: '1px 6px', marginTop: '2px', display: 'inline-block' }}>
                      {discovered ? creature.rarity : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Inspector Box */}
          <div style={{ background: '#0a081a', padding: '16px', border: '2px solid #281f4a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isSelectedDiscovered ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <img
                    src={generateCreatureSprite(selectedCreature.modelType, selectedCreature.rarity).toDataURL()}
                    alt={selectedCreature.name}
                    style={{ width: '64px', height: '64px', imageRendering: 'pixelated', filter: `drop-shadow(0 0 10px ${selectedCreature.glowColor})` }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', color: selectedCreature.glowColor }}>
                    {selectedCreature.name.toUpperCase()}
                  </div>
                  <span className={`rarity-badge rarity-${selectedCreature.rarity}`}>
                    {selectedCreature.rarity}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {selectedCreature.description}
                </p>

                <div style={{ borderTop: '2px solid #281f4a', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-heading)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>TOTAL CATCHES:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedRecord?.count || 1}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>RECORD WEIGHT:</span>
                    <strong style={{ color: '#fbbf24' }}>{selectedRecord?.maxWeight || selectedCreature.minWeight} LG</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>VARIANTS:</span>
                    <strong style={{ color: '#c084fc' }}>
                      {selectedRecord?.variants.length ? selectedRecord.variants.join(', ').toUpperCase() : 'NORMAL'}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px', color: '#475569', fontFamily: 'var(--font-heading)' }}>?</span>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', color: '#94a3b8' }}>MYSTERY STAR ENTITY</div>
                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                  Cast your line into the Starpond with better cosmic bait to catalog this celestial creature!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
