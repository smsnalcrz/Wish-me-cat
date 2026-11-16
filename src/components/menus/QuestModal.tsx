import React from 'react';
import { SaveData, QuestData } from '../../types/game';
import { QUESTS } from '../../data/quests';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { X, CheckCircle, Sparkles } from 'lucide-react';

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
      <div className="cosmic-panel modal-card" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div className="modal-title">Cosmic Angler Quest Board</div>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {QUESTS.map((quest) => {
            const current = saveData.questProgress[quest.id] || 0;
            const isCompleted = saveData.completedQuestIds.includes(quest.id);
            const isClaimed = saveData.claimedQuestIds.includes(quest.id);
            const progressPct = Math.min(100, Math.round((current / quest.targetCount) * 100));

            return (
              <div
                key={quest.id}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: isClaimed ? '1px solid rgba(255,255,255,0.05)' : (isCompleted ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                    {quest.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                    {quest.description}
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: isCompleted ? '#4ade80' : '#38bdf8' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                      {Math.min(current, quest.targetCount)} / {quest.targetCount}
                    </span>
                  </div>

                  {/* Rewards tag */}
                  <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#fbbf24' }}>+{quest.rewardStardust} Stardust</span>
                    <span style={{ color: '#38bdf8' }}>+{quest.rewardExp} EXP</span>
                  </div>
                </div>

                {/* Claim / Status Button */}
                <div>
                  {isClaimed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '14px', fontWeight: 700 }}>
                      <CheckCircle size={18} />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <button
                      className="cosmic-button"
                      disabled={!isCompleted}
                      onClick={() => handleClaim(quest)}
                      style={{ padding: '8px 18px', fontSize: '14px' }}
                    >
                      {isCompleted ? 'Claim Reward!' : 'In Progress'}
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
