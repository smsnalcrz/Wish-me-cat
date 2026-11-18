import React, { useState, useEffect } from 'react';
import { SaveData, WishReward, CatAccessoryType } from '../../types/game';
import {
  WishManager,
  CAT_ACCESSORIES,
  CELESTIAL_BLESSINGS
} from '../../systems/wishing/WishManager';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import {
  PixelCloseIcon,
  PixelStardustIcon,
  PixelCheckIcon
} from '../ui/PixelIcons';

interface WishModalProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdateSave: (newSave: SaveData) => void;
}

export const WishModal: React.FC<WishModalProps> = ({
  saveData,
  onClose,
  onUpdateSave
}) => {
  const [activeTab, setActiveTab] = useState<'wish' | 'blessings' | 'wardrobe'>('wish');
  const [isWishing, setIsWishing] = useState(false);
  const [wishResults, setWishResults] = useState<WishReward[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setTimerTick] = useState(0);

  const audio = AudioManager.getInstance();

  // Tick active blessings countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBlessings = WishManager.getActiveBlessings();
  const unlockedAccSet = new Set(saveData.unlockedAccessories || []);
  const equipped = saveData.equippedAccessories || {};

  const handleSingleWish = (useTokens: boolean) => {
    setErrorMessage(null);
    const res = WishManager.performWish(useTokens);
    if (res.error) {
      setErrorMessage(res.error);
      audio.playMinigameMiss();
      return;
    }

    setIsWishing(true);
    audio.playLevelUp();

    setTimeout(() => {
      setIsWishing(false);
      setWishResults([res.reward]);
      audio.playCatchCelebration(res.reward.rarity);
      onUpdateSave({ ...SaveManager.getData() });
    }, 900);
  };

  const handleTenfoldWish = (useTokens: boolean) => {
    setErrorMessage(null);
    const res = WishManager.performTenfoldWish(useTokens);
    if (res.error) {
      setErrorMessage(res.error);
      audio.playMinigameMiss();
      return;
    }

    setIsWishing(true);
    audio.playLevelUp();

    setTimeout(() => {
      setIsWishing(false);
      setWishResults(res.rewards);
      audio.playCatchCelebration('legendary');
      onUpdateSave({ ...SaveManager.getData() });
    }, 1200);
  };

  const handleToggleAccessory = (type: CatAccessoryType, id: string) => {
    if (equipped[type] === id) {
      WishManager.unequipAccessory(type);
    } else {
      WishManager.equipAccessory(type, id);
    }
    audio.playClick();
    onUpdateSave({ ...SaveManager.getData() });
  };

  const formatRemainingTime = (expiresAt: number) => {
    const sec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="modal-backdrop">
      <div className="cosmic-panel modal-card pixel-panel" style={{ maxWidth: '820px', width: '92%', minHeight: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🌟</span>
              <span>CELESTIAL WISHING FOUNTAIN</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
              OFFER STARDUST & WISH TOKENS TO SUMMON CELESTIAL BLESSINGS & RARE ACCESSORIES
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Currency Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#09081a', padding: '6px 14px', border: '1px solid #312e81' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>⭐</span>
                <span style={{ color: '#fef08a', fontFamily: 'var(--font-heading)', fontSize: '13px' }}>
                  {saveData.wishTokens || 0} TOKENS
                </span>
              </div>
              <div style={{ width: '1px', height: '14px', background: '#312e81' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PixelStardustIcon size={16} />
                <span style={{ color: '#38bdf8', fontFamily: 'var(--font-heading)', fontSize: '13px' }}>
                  {saveData.stardust}
                </span>
              </div>
            </div>

            <button className="close-btn" onClick={onClose} title="Close Wishing Fountain">
              <PixelCloseIcon size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #1e1b4b', paddingBottom: '10px', marginTop: '12px' }}>
          <button
            className={`pixel-btn ${activeTab === 'wish' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '11px' }}
            onClick={() => { setActiveTab('wish'); setWishResults(null); }}
          >
            ⭐ MAKE A WISH
          </button>
          <button
            className={`pixel-btn ${activeTab === 'blessings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setActiveTab('blessings'); setWishResults(null); }}
          >
            <span>✨ ACTIVE BLESSINGS</span>
            {activeBlessings.length > 0 && (
              <span style={{ background: '#38bdf8', color: '#09081a', borderRadius: '50%', padding: '1px 5px', fontSize: '9px', fontWeight: 'bold' }}>
                {activeBlessings.length}
              </span>
            )}
          </button>
          <button
            className={`pixel-btn ${activeTab === 'wardrobe' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '11px' }}
            onClick={() => { setActiveTab('wardrobe'); setWishResults(null); }}
          >
            👑 CAT ACCESSORIES ({unlockedAccSet.size}/{Object.keys(CAT_ACCESSORIES).length})
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{ margin: '12px 0 0', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '11px', fontFamily: 'var(--font-heading)' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* TAB 1: MAKE A WISH */}
        {activeTab === 'wish' && !wishResults && !isWishing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {/* Visual Center Banner */}
            <div style={{
              background: 'linear-gradient(180deg, #100f2e 0%, #060515 100%)',
              border: '2px solid #3730a3',
              borderRadius: '2px',
              padding: '24px 20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '42px', marginBottom: '8px', filter: 'drop-shadow(0 0 12px #facc15)' }}>
                ⛲ ✨
              </div>
              <h2 style={{ fontSize: '18px', color: '#fef08a', fontFamily: 'var(--font-heading)', margin: '0 0 6px' }}>
                THE ANCIENT CELESTIAL FOUNTAIN
              </h2>
              <p style={{ fontSize: '12px', color: '#cbd5e1', maxWidth: '520px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                Cast a wish into the starlight waters. Unearth mythical cat hats, cosmic capes, harmonic charms, and powerful timed celestial blessings!
              </p>

              <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(15, 23, 42, 0.75)', padding: '6px 14px', border: '1px solid #38bdf8' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                  GUARANTEE: AT LEAST 1 RARE+ PERK / ACCESSORY EVERY 10 WISHES!
                </span>
              </div>
            </div>

            {/* Wish Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Single Star Wish Card */}
              <div className="cosmic-panel" style={{ padding: '16px', border: '1px solid #312e81', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#fef08a', fontFamily: 'var(--font-heading)' }}>
                      1x STAR WISH
                    </span>
                    <span className="rarity-badge rarity-uncommon">SINGLE</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 16px', lineHeight: 1.4 }}>
                    Draw 1 celestial reward from the stars.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="pixel-btn btn-primary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '11px' }}
                    onClick={() => handleSingleWish(true)}
                  >
                    ⭐ 1 TOKEN
                  </button>
                  <button
                    className="pixel-btn btn-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    onClick={() => handleSingleWish(false)}
                  >
                    <PixelStardustIcon size={14} />
                    <span>75 STARDUST</span>
                  </button>
                </div>
              </div>

              {/* Tenfold Constellation Wish Card */}
              <div className="cosmic-panel" style={{ padding: '16px', border: '2px solid #7c3aed', background: '#0e0c29', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#c084fc', fontFamily: 'var(--font-heading)' }}>
                      10x CONSTELLATION WISH
                    </span>
                    <span className="rarity-badge rarity-legendary">GUARANTEED RARE+</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 16px', lineHeight: 1.4 }}>
                    Summon a meteor shower of 10 celestial wishes with discount!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="pixel-btn btn-primary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '11px', background: '#7c3aed', borderColor: '#a855f7' }}
                    onClick={() => handleTenfoldWish(true)}
                  >
                    ⭐ 10 TOKENS
                  </button>
                  <button
                    className="pixel-btn btn-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    onClick={() => handleTenfoldWish(false)}
                  >
                    <PixelStardustIcon size={14} />
                    <span>650 STARDUST</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WISHING ANIMATION STATE */}
        {isWishing && (
          <div style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div style={{ fontSize: '48px', animation: 'spin 2s infinite linear' }}>
              💫
            </div>
            <div style={{ color: '#fef08a', fontFamily: 'var(--font-heading)', fontSize: '16px', letterSpacing: '2px' }}>
              COMMUNING WITH THE STARS...
            </div>
            <div style={{ color: '#38bdf8', fontSize: '12px' }}>
              Drawing celestial blessings and cosmic relics...
            </div>
          </div>
        )}

        {/* WISH REVEAL RESULTS */}
        {wishResults && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '14px', color: '#fef08a', fontFamily: 'var(--font-heading)' }}>
                ✦ THE STARS HAVE ANSWERED! ({wishResults.length} REWARD{wishResults.length > 1 ? 'S' : ''})
              </div>
              <button
                className="pixel-btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setWishResults(null)}
              >
                COLLECT ALL
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: wishResults.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {wishResults.map((reward, i) => (
                <div
                  key={i}
                  className="cosmic-panel"
                  style={{
                    padding: '14px',
                    border: '1px solid',
                    borderColor: reward.rarity === 'legendary' ? '#eab308' : reward.rarity === 'epic' ? '#9333ea' : reward.rarity === 'rare' ? '#0284c7' : '#475569',
                    background: '#09081a'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {reward.accessory?.icon || reward.blessing?.icon || '⭐'}
                    </span>
                    <span className={`rarity-badge rarity-${reward.rarity}`}>
                      {reward.rarity}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                    {reward.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '8px' }}>
                    {reward.description}
                  </div>

                  {reward.type === 'accessory' && (
                    <div style={{ fontSize: '10px', color: '#38bdf8', borderTop: '1px solid #1e1b4b', paddingTop: '6px' }}>
                      ✦ BONUS: {reward.accessory?.bonusDescription}
                    </div>
                  )}

                  {reward.type === 'blessing' && (
                    <div style={{ fontSize: '10px', color: '#a855f7', borderTop: '1px solid #1e1b4b', paddingTop: '6px' }}>
                      ✦ ACTIVE: 5 MINUTES CELESTIAL BUFF
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE BLESSINGS */}
        {activeTab === 'blessings' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>
              CURRENT ACTIVE CELESTIAL BUFFS & BLESSINGS
            </div>

            {activeBlessings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌙</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px' }}>NO ACTIVE BLESSINGS</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Make a wish at the fountain to invoke powerful star blessings!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {activeBlessings.map(b => (
                  <div key={b.id} className="cosmic-panel" style={{ padding: '14px', border: '1px solid #38bdf8', background: '#09081a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '22px' }}>{b.icon}</span>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
                        ⏳ {formatRemainingTime(b.expiresAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#fef08a', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {b.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAT ACCESSORIES & WARDROBE */}
        {activeTab === 'wardrobe' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>
              EQUIP UNLOCKED HATS, CAPES & CHARMS TO ENHANCE YOUR ADVENTURE
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
              {Object.values(CAT_ACCESSORIES).map(acc => {
                const isUnlocked = unlockedAccSet.has(acc.id);
                const isEquipped = equipped[acc.type] === acc.id;

                return (
                  <div
                    key={acc.id}
                    className="cosmic-panel"
                    style={{
                      padding: '14px',
                      border: '1px solid',
                      borderColor: isEquipped ? '#facc15' : isUnlocked ? '#312e81' : '#1e1b4b',
                      background: isUnlocked ? '#09081a' : 'rgba(5, 4, 12, 0.6)',
                      opacity: isUnlocked ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '26px' }}>{acc.icon}</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span className={`rarity-badge rarity-${acc.rarity}`}>{acc.rarity}</span>
                        {isEquipped && (
                          <span style={{ background: '#facc15', color: '#09081a', padding: '2px 6px', fontSize: '9px', fontWeight: 'bold' }}>
                            EQUIPPED
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: isUnlocked ? '#f8fafc' : '#64748b', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '8px' }}>
                      {acc.description}
                    </div>

                    <div style={{ fontSize: '10px', color: '#38bdf8', borderTop: '1px solid #1e1b4b', paddingTop: '6px', marginBottom: '10px' }}>
                      ✦ {acc.bonusDescription}
                    </div>

                    {isUnlocked ? (
                      <button
                        className={`pixel-btn ${isEquipped ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%', padding: '6px', fontSize: '10px' }}
                        onClick={() => handleToggleAccessory(acc.type, acc.id)}
                      >
                        {isEquipped ? 'UNEQUIP' : 'EQUIP'}
                      </button>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', padding: '6px' }}>
                        🔒 UNLOCK VIA FOUNTAIN WISHES
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
