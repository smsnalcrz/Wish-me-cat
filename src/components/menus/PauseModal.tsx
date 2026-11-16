import React from 'react';
import { SaveData } from '../../types/game';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, Play, RotateCcw, Save, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
  onNotify: (title: string, msg: string) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ saveData, onClose, onUpdateSave, onNotify }) => {
  const audio = AudioManager.getInstance();

  const handleVolumeChange = (type: 'masterVolume' | 'bgmVolume' | 'sfxVolume', val: number) => {
    const newSave = { ...saveData, [type]: val };
    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.setVolumes(newSave.masterVolume, newSave.bgmVolume, newSave.sfxVolume);
  };

  const handleSensitivityChange = (val: number) => {
    const newSave = { ...saveData, cameraSensitivity: val };
    SaveManager.save(newSave);
    onUpdateSave(newSave);
  };

  const handleManualSave = () => {
    SaveManager.save();
    audio.playCoin();
    onNotify('GAME SAVED', 'Your cosmic adventure has been safely preserved!');
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your cosmic journey? All stars and progression will be cleared!')) {
      const fresh = SaveManager.reset();
      onUpdateSave(fresh);
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-title">GAME PAUSED</div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        {/* Audio Volume Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span>Master Volume</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span>Music Volume</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.bgmVolume}
              onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span>Sound Effects</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span>Camera Sensitivity</span>
              <span style={{ color: '#38bdf8' }}>{saveData.cameraSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={saveData.cameraSensitivity}
              onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Controls Quick Guide */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
          <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>Cosmic Cat Controls:</div>
          <div>• <strong>W, A, S, D</strong> : Move Cat Character</div>
          <div>• <strong>Shift</strong> : Sprint / Gallop</div>
          <div>• <strong>Mouse</strong> : Rotate Third-Person Camera | <strong>Scroll</strong> : Zoom</div>
          <div>• <strong>E</strong> or <strong>Click</strong> : Interact & Fish</div>
          <div>• <strong>Space</strong> or <strong>Left Click</strong> : Reeling Minigame Action</div>
        </div>

        {/* Action Buttons */}
        <button
          className="cosmic-button"
          onClick={() => {
            onClose();
            window.dispatchEvent(new CustomEvent('open-modal', { detail: 'wardrobe' }));
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', fontWeight: 700 }}
        >
          <span>🐱 Cat Wardrobe & Breed Selector</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button className="cosmic-button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Play size={18} /> Resume Game
          </button>
          <button className="cosmic-button" onClick={handleManualSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            <Save size={18} /> Save Progress
          </button>
        </div>

        <button
          onClick={handleResetProgress}
          style={{
            background: 'transparent',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            padding: '10px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={15} /> Reset Save Progress
        </button>
      </div>
    </div>
  );
};
