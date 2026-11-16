import React, { useState, useEffect } from 'react';
import { SaveData } from '../../types/game';
import { REGIONS } from '../../data/regions';
import { QUESTS } from '../../data/quests';
import { Sparkles, Compass, BookOpen, ShoppingBag, Volume2, VolumeX, Pause, HelpCircle, Lock, Unlock } from 'lucide-react';

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
  onOpenPause,
  onToggleMute,
  isMuted
}) => {
  const [isShiftLock, setIsShiftLock] = useState(false);

  useEffect(() => {
    const handleShiftLockChanged = (e: Event) => {
      setIsShiftLock(Boolean((e as CustomEvent).detail));
    };
    window.addEventListener('shift-lock-changed', handleShiftLockChanged);
    return () => {
      window.removeEventListener('shift-lock-changed', handleShiftLockChanged);
    };
  }, []);

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
            <span>{saveData.playerLevel}</span>
            <small>LVL</small>
          </div>
          <div className="exp-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>EXP</span>
              <span>{saveData.playerExp} / {requiredExp}</span>
            </div>
            <div className="exp-bar-bg">
              <div className="exp-bar-fill" style={{ width: `${expProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Currency & Action shortcuts */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="cosmic-panel currency-badge pointer-events-auto">
            <Sparkles size={22} />
            <span>{saveData.stardust.toLocaleString()} Stardust</span>
          </div>

          <div className="quick-buttons pointer-events-auto">
            <button className="icon-button" onClick={onOpenWardrobe} title="Cat Wardrobe (Change Cat Model)" style={{ position: 'relative' }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>🐱</span>
            </button>
            <button className="icon-button" onClick={onOpenShop} title="Equipment Shop">
              <ShoppingBag size={20} />
            </button>
            <button className="icon-button" onClick={onOpenCollection} title="Star Almanac">
              <BookOpen size={20} />
            </button>
            <button className="icon-button" onClick={onOpenConstellations} title="Constellations">
              <Sparkles size={20} />
            </button>
            <button className="icon-button" onClick={onOpenRegions} title="Region Gateway">
              <Compass size={20} />
            </button>
            <button className="icon-button" onClick={onToggleMute} title={isMuted ? "Unmute Audio" : "Mute Audio"}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button className="icon-button" onClick={onOpenPause} title="Pause / Settings">
              <Pause size={20} />
            </button>
          </div>
        </div>
      </div>

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
          <div className="region-title">{currentRegion.name}</div>
          <div className="gear-subtitle">Rod: Starlight Caster (Lv.{saveData.rodLevel})</div>
        </div>

        {/* Mini Quest Tracker */}
        {activeQuest && (
          <div className="cosmic-panel mini-quest-card pointer-events-auto" onClick={onOpenQuests} style={{ cursor: 'pointer' }}>
            <div className="mini-quest-title">Active Quest</div>
            <div className="mini-quest-desc">{activeQuest.title}</div>
            <div style={{ fontSize: '12px', color: isQuestDone ? '#4ade80' : '#38bdf8', fontWeight: 600 }}>
              {isQuestDone ? '★ Ready to Claim! (Visit Quest Board)' : `Progress: ${currentProgress} / ${activeQuest.targetCount}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
