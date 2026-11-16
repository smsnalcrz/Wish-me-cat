import React from 'react';
import { SaveData } from '../../types/game';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelCatIcon } from '../ui/PixelIcons';

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
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div className="modal-title">GAME PAUSED</div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        {/* Audio Volume Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0a081a', padding: '14px', border: '2px solid #281f4a' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
              <span>MASTER VOLUME</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
              <span>MUSIC VOLUME</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.bgmVolume}
              onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
              <span>SOUND EFFECTS</span>
              <span style={{ color: '#38bdf8' }}>{Math.round(saveData.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>
        </div>

        {/* Controls Quick Guide */}
        <div style={{ background: '#0a081a', padding: '12px 14px', border: '2px solid #281f4a', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
          <div style={{ color: '#fbbf24', fontFamily: 'var(--font-heading)', fontSize: '10px', marginBottom: '6px' }}>2D CONTROLS GUIDE:</div>
          <div>• <strong>WASD / Arrow Keys</strong> : Walk Across Island</div>
          <div>• <strong>Shift</strong> : Sprint / Fast Walk</div>
          <div>• <strong>[E] / Click</strong> : Interact with Piers & Stations</div>
          <div>• <strong>Spacebar / Click</strong> : Timing Reel in Minigame</div>
          <div>• <strong>Esc</strong> : Close Menu / Pause</div>
        </div>

        {/* Action Buttons */}
        <button
          className="cosmic-button"
          onClick={() => {
            onClose();
            window.dispatchEvent(new CustomEvent('open-modal', { detail: 'wardrobe' }));
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#7c3aed' }}
        >
          <PixelCatIcon size={18} />
          <span>CAT WARDROBE (4 BREEDS)</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <button className="cosmic-button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>▶ RESUME GAME</span>
          </button>
          <button className="cosmic-button" onClick={handleManualSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0284c7' }}>
            <span>★ SAVE PROGRESS</span>
          </button>
        </div>

        <button
          onClick={handleResetProgress}
          style={{
            background: 'transparent',
            border: '2px solid #991b1b',
            color: '#fb7185',
            padding: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>⚠ RESET SAVE PROGRESS</span>
        </button>
      </div>
    </div>
  );
};
