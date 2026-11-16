import React, { useState } from 'react';
import { SaveData } from '../../types/game';
import { DeviceInfo, toggleFullscreen } from '../../utils/deviceDetection';
import { PixelStardustIcon, PixelCatIcon, PixelAudioIcon } from './PixelIcons';

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
      <div className="cosmic-panel welcome-card pixel-panel">
        {/* Device & Browser Badge */}
        <div className="platform-badge-container">
          <div className="platform-badge">
            <span className="live-indicator-dot" />
            <span className="platform-text">{deviceInfo.badgeLabel.toUpperCase()}</span>
          </div>

          <div className="control-mode-pill">
            <span>{deviceInfo.isTouch ? 'TOUCH CONTROLS READY' : 'WASD / ARROWS & MOUSE'}</span>
          </div>
        </div>

        {/* Title Logo & Subtitle */}
        <div className="welcome-header">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <PixelStardustIcon size={24} />
            <PixelCatIcon size={24} />
            <PixelStardustIcon size={24} />
          </div>
          <h1 className="welcome-title">WISH ME CAT</h1>
          <div className="welcome-subtitle">PURRSEIDS: THE STARPOND</div>
          <p className="welcome-tagline">
            Cast your line into mystical pools of galaxies and fish for living stars with your celestial cat companion.
          </p>
        </div>

        {/* Save Summary Preview (if returning player) */}
        {hasExistingSave && !showResetConfirm && (
          <div className="save-status-box">
            <div className="save-status-header">
              <span className="save-status-badge">★ SAVED JOURNEY FOUND</span>
              <span className="save-breed-name">{saveData.catBreed ? saveData.catBreed.toUpperCase() : 'CELESTIAL'}</span>
            </div>
            <div className="save-stats-row">
              <div className="save-stat">
                <span className="save-stat-label">LEVEL</span>
                <span className="save-stat-val">LV.{saveData.playerLevel}</span>
              </div>
              <div className="save-stat">
                <span className="save-stat-label">STARDUST</span>
                <span className="save-stat-val">⭐ {saveData.stardust.toLocaleString()}</span>
              </div>
              <div className="save-stat">
                <span className="save-stat-label">SPECIES</span>
                <span className="save-stat-val">🐟 {saveData.discoveredCreatureIds ? saveData.discoveredCreatureIds.length : 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="reset-confirm-box">
            <div style={{ color: '#f87171', fontFamily: 'var(--font-heading)', fontSize: '11px', marginBottom: '6px' }}>RESET ALL PROGRESS?</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '10px' }}>
              This will clear levels, stardust, bestiary, and start fresh.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                className="cosmic-button reset-confirm-btn"
                onClick={() => {
                  onResetSave();
                  setShowResetConfirm(false);
                }}
                style={{ padding: '6px 12px', fontSize: '10px', background: '#dc2626' }}
              >
                YES, RESET
              </button>
              <button
                className="cosmic-button"
                onClick={() => setShowResetConfirm(false)}
                style={{ padding: '6px 12px', fontSize: '10px', background: '#334155' }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="welcome-actions">
          <button className="cosmic-button start-journey-btn" onClick={onStartGame}>
            <span>{hasExistingSave ? '▶ CONTINUE JOURNEY' : '✦ ENTER THE STARPOND ✦'}</span>
          </button>

          {hasExistingSave && !showResetConfirm && (
            <button
              className="text-action-btn"
              onClick={() => setShowResetConfirm(true)}
              title="Start a new game"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '9px' }}
            >
              <span>↺ START NEW JOURNEY</span>
            </button>
          )}
        </div>

        {/* Quick Settings Bar (Mute & Fullscreen) */}
        <div className="welcome-footer-bar">
          <button className="icon-setting-btn" onClick={onToggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
            <PixelAudioIcon size={16} isMuted={isMuted} />
            <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          <button className="icon-setting-btn" onClick={handleFullscreenClick} title="Toggle Fullscreen">
            <span>{isFullscreen ? 'WINDOWED' : 'FULLSCREEN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
