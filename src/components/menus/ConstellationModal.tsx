import React from 'react';
import { SaveData } from '../../types/game';
import { CONSTELLATIONS } from '../../data/constellations';
import { X, Sparkles, Star } from 'lucide-react';

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
      <div className="cosmic-panel modal-card" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{constel.name}</div>
            <div style={{ fontSize: '13px', color: isRestored ? '#fbbf24' : '#c084fc', marginTop: '2px' }}>
              {isRestored ? '★ CONSTELLATION RESTORED & BLESSED ★' : `${completedNodesCount} / ${constel.nodes.length} Celestial Stars Aligned`}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Constellation Sky Chart */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            background: 'radial-gradient(ellipse at center, rgba(30, 27, 75, 0.8) 0%, rgba(10, 8, 26, 0.95) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            overflow: 'hidden'
          }}
        >
          {/* Constellation lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <line x1="25%" y1="40%" x2="50%" y2="20%" stroke={isRestored ? '#fbbf24' : '#6366f1'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="20%" x2="75%" y2="40%" stroke={isRestored ? '#fbbf24' : '#6366f1'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="20%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#6366f1'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="25%" y1="40%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#6366f1'} strokeWidth="2" strokeDasharray="4 4" />
            <line x1="75%" y1="40%" x2="50%" y2="65%" stroke={isRestored ? '#fbbf24' : '#6366f1'} strokeWidth="2" strokeDasharray="4 4" />
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: hasStar ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: hasStar ? '0 0 16px #fbbf24' : 'none',
                    border: hasStar ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Star size={16} color={hasStar ? '#000' : '#64748b'} fill={hasStar ? '#000' : 'none'} />
                </div>
                <span style={{ fontSize: '11px', color: hasStar ? '#f8fafc' : '#64748b', fontWeight: 600 }}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lore Description */}
        <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5 }}>
          {constel.lore}
        </p>

        {/* Permanent Blessings Summary */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
            Permanent Constellation Blessings:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>+{constel.stardustBonusPct}%</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Stardust Earned</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>+{constel.rareBonusPct}%</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Rare Star Attraction</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#c084fc' }}>+{constel.castingDistBonus}m</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Casting Distance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
