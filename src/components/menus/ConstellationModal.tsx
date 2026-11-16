import React from 'react';
import { SaveData } from '../../types/game';
import { CONSTELLATIONS } from '../../data/constellations';
import { PixelCloseIcon, PixelConstellationIcon, PixelStardustIcon } from '../ui/PixelIcons';

interface ConstellationModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const ConstellationModal: React.FC<ConstellationModalProps> = ({ saveData, onClose }) => {
  const constel = CONSTELLATIONS[0];
  const isRestored = saveData.completedConstellationIds.includes(constel.id);

  // Compute node completion
  const completedNodesCount = constel.nodes.filter(node => 
    saveData.discoveredCreatureIds.includes(node.requiredCreatureId)
  ).length;

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PixelConstellationIcon size={22} />
              <span>{constel.name.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '10px', color: isRestored ? '#fbbf24' : '#c084fc', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              {isRestored ? '★ CONSTELLATION RESTORED & BLESSED ★' : `${completedNodesCount} / ${constel.nodes.length} CELESTIAL STARS ALIGNED`}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        {/* Constellation Sky Chart */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            background: '#070514',
            border: '2px solid #281f4a',
            overflow: 'hidden'
          }}
        >
          {/* Constellation lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} shapeRendering="crispEdges">
            <line x1="25%" y1="40%" x2="50%" y2="20%" stroke={isRestored ? '#fbbf24' : '#4338ca'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="20%" x2="75%" y2="40%" stroke={isRestored ? '#fbbf24' : '#4338ca'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="20%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#4338ca'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="25%" y1="40%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#4338ca'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="75%" y1="40%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#4338ca'} strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Star Nodes */}
          {constel.nodes.map((node) => {
            const hasStar = saveData.discoveredCreatureIds.includes(node.requiredCreatureId);
            return (
              <div
                key={node.starId}
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    background: hasStar ? '#facc15' : '#1e1b4b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: hasStar ? '2px solid #ffffff' : '2px solid #312e81'
                  }}
                >
                  <PixelStardustIcon size={16} color={hasStar ? '#000000' : '#475569'} />
                </div>
                <span style={{ fontSize: '9px', color: hasStar ? '#f8fafc' : '#64748b', fontFamily: 'var(--font-heading)' }}>
                  {node.label.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lore Description */}
        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
          {constel.lore}
        </p>

        {/* Permanent Blessings Summary */}
        <div style={{ background: '#0a081a', padding: '14px', border: '2px solid #281f4a' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', color: '#fbbf24', marginBottom: '8px' }}>
            PERMANENT CONSTELLATION BLESSINGS:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div style={{ background: '#14102d', padding: '10px', border: '1px solid #281f4a' }}>
              <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#4ade80' }}>+{constel.stardustBonusPct}%</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>STARDUST BONUS</div>
            </div>
            <div style={{ background: '#14102d', padding: '10px', border: '1px solid #281f4a' }}>
              <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#38bdf8' }}>+{constel.rareBonusPct}%</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>RARE ATTRACTION</div>
            </div>
            <div style={{ background: '#14102d', padding: '10px', border: '1px solid #281f4a' }}>
              <div style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', color: '#c084fc' }}>+{constel.castingDistBonus}M</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>CAST DISTANCE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
