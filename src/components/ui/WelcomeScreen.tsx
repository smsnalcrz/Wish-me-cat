import React, { useState } from 'react';
import { SaveData } from '../../types/game';
import { DeviceInfo, toggleFullscreen } from '../../utils/deviceDetection';
import { Sparkles, Play, RotateCcw, Volume2, VolumeX, Maximize, Smartphone, Monitor } from 'lucide-react';

interface WelcomeScreenProps {
  deviceInfo: DeviceInfo;
  saveData: SaveData;
  onStartGame: () => void;
  onResetSave: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  deviceInfo,
  saveData,
  onStartGame,
  onResetSave,
  isMuted,
  onToggleMute
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasExistingSave = saveData.playerLevel > 1 || saveData.stardust > 100 || (saveData.discoveredCreatureIds && saveData.discoveredCreatureIds.length > 0);

  const handleFullscreenClick = async () => {
    const fs = await toggleFullscreen();
    setIsFullscreen(fs);
  };

  return (
    <div className="welcome-overlay">
      {/* Background Animated Cosmic Ambient Glow */}
      <div className="welcome-bg-glow" />

      {/* Main Welcome Content Card */}
      <div className="cosmic-panel welcome-card">
        {/* Device & Browser Badge */}
        <div className="platform-badge-container">
          <div className="platform-badge">
            <span className="live-indicator-dot" />
            <span className="platform-icon">{deviceInfo.badgeIcon}</span>
            <span className="platform-text">{deviceInfo.badgeLabel}</span>
          </div>

          <div className="control-mode-pill">
            {deviceInfo.isTouch ? (
              <>
                <Smartphone size={13} />
                <span>Touch Controls Ready</span>
              </>
            ) : (
              <>
                <Monitor size={13} />
                <span>WASD & Mouse Active</span>
              </>
            )}
          </div>
        </div>

        {/* Title Logo & Subtitle */}
        <div className="welcome-header">
          <div className="game-star-crest">
            <span>✨ 🐱 🎣 ✨</span>
          </div>
          <h1 className="welcome-title">PURRSEIDS</h1>
          <div className="welcome-subtitle">THE STARPOND</div>
          <p className="welcome-tagline">
            Cast your line into mystical pools of galaxies and fish for living stars with your celestial cat companion.
          </p>
        </div>

        {/* Save Summary Preview (if returning player) */}
        {hasExistingSave && !showResetConfirm && (
          <div className="save-status-box">
            <div className="save-status-header">
              <span className="save-status-badge">✦ SAVED JOURNEY FOUND</span>
              <span className="save-breed-name">🐱 {saveData.catBreed ? saveData.catBreed.toUpperCase() : 'CELESTIAL'}</span>
            </div>
            <div className="save-stats-row">
              <div className="save-stat">
                <span className="save-stat-label">Level</span>
                <span className="save-stat-val">Lv.{saveData.playerLevel}</span>
              </div>
              <div className="save-stat">
                <span className="save-stat-label">Stardust</span>
                <span className="save-stat-val">⭐ {saveData.stardust.toLocaleString()}</span>
              </div>
              <div className="save-stat">
                <span className="save-stat-label">Species</span>
                <span className="save-stat-val">🐟 {saveData.discoveredCreatureIds ? saveData.discoveredCreatureIds.length : 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="reset-confirm-box">
            <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>Reset all game progress?</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
              This will clear your cat levels, stardust, bestiary, and start from the beginning.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                className="cosmic-button reset-confirm-btn"
                onClick={() => {
                  onResetSave();
                  setShowResetConfirm(false);
                }}
              >
                Yes, Start Fresh
              </button>
              <button
                className="cosmic-button"
                onClick={() => setShowResetConfirm(false)}
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="welcome-actions">
          <button className="cosmic-button start-journey-btn" onClick={onStartGame}>
            <Play size={20} fill="#ffffff" />
            <span>{hasExistingSave ? 'CONTINUE JOURNEY' : 'ENTER THE STARPOND'}</span>
          </button>

          {hasExistingSave && !showResetConfirm && (
            <button
              className="text-action-btn"
              onClick={() => setShowResetConfirm(true)}
              title="Start a new game"
            >
              <RotateCcw size={14} />
              <span>Start New Journey</span>
            </button>
          )}
        </div>

        {/* Quick Settings Bar (Mute & Fullscreen) */}
        <div className="welcome-footer-bar">
          <button className="icon-setting-btn" onClick={onToggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <button className="icon-setting-btn" onClick={handleFullscreenClick} title="Toggle Fullscreen">
            <Maximize size={18} />
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
