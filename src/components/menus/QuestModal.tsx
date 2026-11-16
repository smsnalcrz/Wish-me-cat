import React from 'react';
import { SaveData, QuestData } from '../../types/game';
import { QUESTS } from '../../data/quests';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { PixelCloseIcon, PixelQuestIcon, PixelCheckIcon, PixelStardustIcon } from '../ui/PixelIcons';

interface QuestModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ saveData, onClose, onUpdateSave }) => {
  const audio = AudioManager.getInstance();

  const handleClaim = (quest: QuestData) => {
    if (saveData.claimedQuestIds.includes(quest.id)) return;
    if (!saveData.completedQuestIds.includes(quest.id)) return;

    let newLvl = saveData.playerLevel;
    let newExp = saveData.playerExp + quest.rewardExp;
    let reqExp = Math.round(50 * Math.pow(newLvl, 1.45));

    while (newExp >= reqExp) {
      newExp -= reqExp;
      newLvl += 1;
      audio.playLevelUp();
      reqExp = Math.round(50 * Math.pow(newLvl, 1.45));
    }

    const newSave = {
      ...saveData,
      stardust: saveData.stardust + quest.rewardStardust,
      playerLevel: newLvl,
      playerExp: newExp,
      claimedQuestIds: [...saveData.claimedQuestIds, quest.id]
    };

    SaveManager.save(newSave);
    onUpdateSave(newSave);
    audio.playCoin();
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PixelQuestIcon size={22} />
            <span>CELESTIAL QUEST OBSERVATORY</span>
          </div>
          <button className="close-btn" onClick={onClose}><PixelCloseIcon size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {QUESTS.map((quest) => {
            const current = saveData.questProgress[quest.id] || 0;
            const isCompleted = saveData.completedQuestIds.includes(quest.id);
            const isClaimed = saveData.claimedQuestIds.includes(quest.id);
            const progressPct = Math.min(100, Math.round((current / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                style={{
                  background: '#0d0a20',
                  padding: '12px 16px',
                  border: isClaimed ? '2px solid #281f4a' : (isCompleted ? '2px solid #22c55e' : '2px solid #3b2c68'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#f8fafc', marginBottom: '4px' }}>
                    {quest.title.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    {quest.description}
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="exp-bar-bg" style={{ flex: 1, height: '10px' }}>
                      <div
                        className="exp-bar-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: isCompleted ? '#22c55e' : '#0284c7',
                          boxShadow: isCompleted ? 'inset 0 2px 0 0 #86efac' : 'inset 0 2px 0 0 #38bdf8'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#cbd5e1', fontFamily: 'var(--font-heading)' }}>
                      {Math.min(current, quest.targetCount)} / {quest.targetCount}
                    </span>
                  </div>

                  {/* Rewards tag */}
                  <div style={{ marginTop: '6px', fontSize: '10px', fontFamily: 'var(--font-heading)', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PixelStardustIcon size={12} />
                      +{quest.rewardStardust} STARDUST
                    </span>
                    <span style={{ color: '#38bdf8' }}>+{quest.rewardExp} EXP</span>
                  </div>
                </div>

                {/* Claim / Status Button */}
                <div>
                  {isClaimed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '10px', fontFamily: 'var(--font-heading)' }}>
                      <PixelCheckIcon size={14} color="#4ade80" />
                      <span>CLAIMED</span>
                    </div>
                  ) : (
                    <button
                      className="cosmic-button"
                      disabled={!isCompleted}
                      onClick={() => handleClaim(quest)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '10px',
                        background: isCompleted ? '#15803d' : '#334155',
                        boxShadow: isCompleted ? '0 -2px 0 0 #22c55e, 0 2px 0 0 #14532d, -2px 0 0 0 #22c55e, 2px 0 0 0 #14532d' : 'none'
                      }}
                    >
                      {isCompleted ? '✦ CLAIM! ✦' : 'IN PROGRESS'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
