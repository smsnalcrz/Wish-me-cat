import React from 'react';
import { SaveData } from '../../types/game';
import { REGIONS } from '../../data/regions';
import { QUESTS } from '../../data/quests';
import {
  PixelStardustIcon,
  PixelCatIcon,
  PixelShopIcon,
  PixelAlmanacIcon,
  PixelConstellationIcon,
  PixelRegionIcon,
  PixelAudioIcon,
  PixelPauseIcon,
  PixelFishingRodIcon,
  PixelQuestIcon
} from './PixelIcons';

interface HUDProps {
  saveData: SaveData;
  interactionPrompt: string | null;
  onInteract: () => void;
  onOpenShop: () => void;
  onOpenCollection: () => void;
  onOpenQuests: () => void;
  onOpenConstellations: () => void;
  onOpenRegions: () => void;
  onOpenWardrobe: () => void;
  onOpenWishing: () => void;
  onOpenPause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  saveData,
  interactionPrompt,
  onInteract,
  onOpenShop,
  onOpenCollection,
  onOpenQuests,
  onOpenConstellations,
  onOpenRegions,
  onOpenWardrobe,
  onOpenWishing,
  onOpenPause,
  onToggleMute,
  isMuted
}) => {
  // Required EXP formula
  const requiredExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
  const expProgress = Math.min(100, Math.round((saveData.playerExp / Math.max(1, requiredExp)) * 100));

  const currentRegion = REGIONS.find(r => r.id === saveData.currentRegionId) || REGIONS[0];

  // Active uncompleted quest
  const activeQuest = QUESTS.find(q => !saveData.claimedQuestIds.includes(q.id));
  const currentProgress = activeQuest ? (saveData.questProgress[activeQuest.id] || 0) : 0;
  const isQuestDone = activeQuest ? saveData.completedQuestIds.includes(activeQuest.id) : false;

  return (
    <div className="ui-overlay">
      {/* Top HUD */}
      <div className="hud-top">
        {/* Player Level & EXP */}
        <div className="cosmic-panel player-card pointer-events-auto">
          <div className="level-badge">
            <span style={{ fontSize: '15px', color: '#fff', lineHeight: 1 }}>{saveData.playerLevel}</span>
            <small style={{ fontSize: '9px', color: '#fef08a' }}>LVL</small>
          </div>
          <div className="exp-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)' }}>
              <span>EXP</span>
              <span>{saveData.playerExp} / {requiredExp}</span>
            </div>
            <div className="exp-bar-bg">
              <div className="exp-bar-fill" style={{ width: `${expProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Currency & Action shortcuts */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div
            className="cosmic-panel currency-badge pointer-events-auto"
            onClick={onOpenWishing}
            style={{ cursor: 'pointer', background: '#0e0c29', borderColor: '#7c3aed' }}
            title="Celestial Wish Tokens - Click to Visit Fountain"
          >
            <span style={{ fontSize: '15px' }}>⭐</span>
            <span style={{ color: '#fef08a' }}>{saveData.wishTokens || 0} WISHES</span>
          </div>

          <div className="cosmic-panel currency-badge pointer-events-auto">
            <PixelStardustIcon size={20} />
            <span>{saveData.stardust.toLocaleString()} STARDUST</span>
          </div>

          <div className="quick-buttons pointer-events-auto">
            <button
              className="icon-button"
              onClick={onOpenWishing}
              title="Celestial Wishing Fountain (Make Wishes & Buffs)"
              style={{ background: '#3b0764', borderColor: '#a855f7' }}
            >
              <span style={{ fontSize: '18px' }}>🌟</span>
            </button>
            <button className="icon-button" onClick={onOpenWardrobe} title="Cat Wardrobe (Change Breed)">
              <img
                src={`/assets/character/${saveData.catBreed || 'celestial'}/CharacterPortraits/icon.png`}
                alt="Cat Wardrobe"
                style={{ width: '22px', height: '22px', imageRendering: 'pixelated', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
            <button className="icon-button" onClick={onOpenShop} title="Cosmic Gear Emporium">
              <PixelShopIcon size={20} />
            </button>
            <button className="icon-button" onClick={onOpenCollection} title="Star Almanac">
              <PixelAlmanacIcon size={20} />
            </button>
            <button className="icon-button" onClick={onOpenConstellations} title="Constellation Altar">
              <PixelConstellationIcon size={20} />
            </button>
            <button className="icon-button" onClick={onOpenRegions} title="Cosmic Realm Gateway">
              <PixelRegionIcon size={20} />
            </button>
            <button className="icon-button" onClick={onToggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
              <PixelAudioIcon size={20} isMuted={isMuted} />
            </button>
            <button className="icon-button" onClick={onOpenPause} title="Pause Menu">
              <PixelPauseIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Blessings Bar (Directly below top HUD) */}
      {(saveData.activeBlessings || []).filter(b => b.expiresAt > Date.now()).length > 0 && (
        <div style={{ position: 'absolute', top: '70px', right: '20px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', zIndex: 10 }}>
          {(saveData.activeBlessings || [])
            .filter(b => b.expiresAt > Date.now())
            .map(b => {
              const secLeft = Math.max(0, Math.floor((b.expiresAt - Date.now()) / 1000));
              const m = Math.floor(secLeft / 60);
              const s = secLeft % 60;
              return (
                <div
                  key={b.id}
                  className="cosmic-panel pointer-events-auto"
                  onClick={onOpenWishing}
                  style={{
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid #38bdf8',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
                  }}
                  title={`${b.description} (Click to open Wishing Fountain)`}
                >
                  <span style={{ fontSize: '14px' }}>{b.icon}</span>
                  <span style={{ color: '#fef08a', fontFamily: 'var(--font-heading)' }}>{b.name}</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'var(--font-heading)', fontSize: '10px' }}>
                    {m}m {s < 10 ? '0' : ''}{s}s
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {/* Center Dynamic Interaction Prompt */}
      {interactionPrompt && (
        <div style={{ alignSelf: 'center', marginBottom: '20px' }}>
          <div className="prompt-banner pointer-events-auto" onClick={onInteract}>
            {interactionPrompt}
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="hud-bottom">
        {/* Current Region info */}
        <div className="cosmic-panel location-info pointer-events-auto" onClick={onOpenRegions} style={{ cursor: 'pointer' }}>
          <div className="region-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelRegionIcon size={16} />
            <span>{currentRegion.name}</span>
          </div>
          <div className="gear-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PixelFishingRodIcon size={14} />
            <span>Starlight Caster (Lv.{saveData.rodLevel})</span>
          </div>
        </div>

        {/* Mini Quest Tracker */}
        {activeQuest && (
          <div className="cosmic-panel mini-quest-card pointer-events-auto" onClick={onOpenQuests} style={{ cursor: 'pointer' }}>
            <div className="mini-quest-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PixelQuestIcon size={16} />
              <span>ACTIVE QUEST</span>
            </div>
            <div className="mini-quest-desc">{activeQuest.title}</div>
            <div style={{ fontSize: '11px', color: isQuestDone ? '#4ade80' : '#38bdf8', fontFamily: 'var(--font-heading)' }}>
              {isQuestDone ? '★ READY TO CLAIM!' : `PROGRESS: ${currentProgress} / ${activeQuest.targetCount}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
