import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  type GachaPhase = 'idle' | 'meteor' | 'burst' | 'reveal' | 'summary';
  const [activeTab, setActiveTab] = useState<'wish' | 'blessings' | 'wardrobe'>('wish');
  const [gachaPhase, setGachaPhase] = useState<GachaPhase>('idle');
  const [currentRewards, setCurrentRewards] = useState<WishReward[]>([]);
  const [highestRarity, setHighestRarity] = useState<string>('common');
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setTimerTick] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audio = AudioManager.getInstance();

  // Tick active blessings countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(t => t + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const activeBlessings = WishManager.getActiveBlessings();
  const unlockedAccSet = new Set(saveData.unlockedAccessories || []);
  const equipped = saveData.equippedAccessories || {};

  const getHighestRarity = (rewards: WishReward[]): string => {
    const ranks: Record<string, number> = {
      mythic: 5,
      legendary: 4,
      epic: 3,
      rare: 2,
      uncommon: 1,
      common: 0
    };
    let highest = 'common';
    let maxRank = 0;
    rewards.forEach(r => {
      const rank = ranks[r.rarity] || 0;
      if (rank > maxRank) {
        maxRank = rank;
        highest = r.rarity;
      }
    });
    return highest;
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'mythic': return '#f43f5e';
      case 'legendary': return '#facc15';
      case 'epic': return '#c084fc';
      case 'rare': return '#38bdf8';
      case 'uncommon': return '#4ade80';
      default: return '#94a3b8';
    }
  };

  const handleSingleWish = (useTokens: boolean) => {
    setErrorMessage(null);
    const res = WishManager.performWish(useTokens);
    if (res.error) {
      setErrorMessage(res.error);
      audio.playMinigameMiss();
      return;
    }

    // Immediately synchronize React state so currency deduction is visible right away!
    onUpdateSave({ ...SaveManager.getData() });

    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    const reward = res.reward;
    const maxR = reward.rarity;
    setCurrentRewards([reward]);
    setHighestRarity(maxR);
    setRevealedCount(0);
    setGachaPhase('meteor');
    audio.playGachaMeteorLaunch(maxR);

    // Meteor impacts at 1350ms
    const t1 = setTimeout(() => {
      setGachaPhase('burst');
      audio.playGachaImpact();
      if (maxR === 'legendary' || maxR === 'epic') {
        confetti({
          particleCount: maxR === 'legendary' ? 80 : 45,
          spread: 75,
          origin: { y: 0.55 },
          colors: maxR === 'legendary' ? ['#facc15', '#fef08a', '#fb923c'] : ['#c084fc', '#e879f9', '#38bdf8']
        });
      }

      // Transition to card reveal at 1750ms
      const t2 = setTimeout(() => {
        setGachaPhase('reveal');
        setRevealedCount(1);
        audio.playCatchCelebration(maxR);
      }, 400);

      timersRef.current.push(t2);
    }, 1350);

    timersRef.current.push(t1);
  };

  const handleTenfoldWish = (useTokens: boolean) => {
    setErrorMessage(null);
    const res = WishManager.performTenfoldWish(useTokens);
    if (res.error) {
      setErrorMessage(res.error);
      audio.playMinigameMiss();
      return;
    }

    // Immediately synchronize React state so currency deduction is visible right away!
    onUpdateSave({ ...SaveManager.getData() });

    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    const rewards = res.rewards;
    const maxR = getHighestRarity(rewards);
    setCurrentRewards(rewards);
    setHighestRarity(maxR);
    setRevealedCount(0);
    setGachaPhase('meteor');
    audio.playGachaMeteorLaunch(maxR);

    // Meteor impacts at 1350ms
    const t1 = setTimeout(() => {
      setGachaPhase('burst');
      audio.playGachaImpact();
      if (maxR === 'legendary' || maxR === 'epic') {
        confetti({
          particleCount: 90,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#facc15', '#c084fc', '#38bdf8', '#f472b6']
        });
      }

      // Transition to sequential reveal at 1750ms
      const t2 = setTimeout(() => {
        setGachaPhase('reveal');
        // Roll cards sequentially every 160ms
        rewards.forEach((_, idx) => {
          const t = setTimeout(() => {
            setRevealedCount(c => Math.max(c, idx + 1));
            audio.playClick();
            if (idx === rewards.length - 1) {
              audio.playCatchCelebration(maxR);
            }
          }, idx * 160);
          timersRef.current.push(t);
        });
      }, 400);

      timersRef.current.push(t2);
    }, 1350);

    timersRef.current.push(t1);
  };

  const handleSkip = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setRevealedCount(currentRewards.length);
    setGachaPhase('summary');
    audio.playCatchCelebration(highestRarity);
    onUpdateSave({ ...SaveManager.getData() });
  };

  const handleFinishGacha = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setGachaPhase('idle');
    setCurrentRewards([]);
    onUpdateSave({ ...SaveManager.getData() });
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
            <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'var(--font-pixel)', marginTop: '4px', letterSpacing: '0.5px', lineHeight: '1.4' }}>
              OFFER STARDUST & WISH TOKENS TO SUMMON CELESTIAL BLESSINGS & RARE ACCESSORIES
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Currency Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#09081a', padding: '6px 14px', border: '1px solid #312e81', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '14px' }}>⭐</span>
                <span style={{ color: '#fef08a', fontFamily: 'var(--font-heading)', fontSize: '11px', whiteSpace: 'nowrap', lineHeight: '1.3' }}>
                  {saveData.wishTokens || 0} TOKENS
                </span>
              </div>
              <div style={{ width: '1px', height: '14px', background: '#312e81' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <PixelStardustIcon size={14} />
                <span style={{ color: '#38bdf8', fontFamily: 'var(--font-heading)', fontSize: '11px', whiteSpace: 'nowrap', lineHeight: '1.3' }}>
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
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e1b4b', paddingBottom: '10px', marginTop: '12px' }}>
          <button
            className={`pixel-tab-btn ${activeTab === 'wish' ? 'active' : ''}`}
            onClick={() => { setActiveTab('wish'); setGachaPhase('idle'); }}
          >
            ⭐ MAKE A WISH
          </button>
          <button
            className={`pixel-tab-btn ${activeTab === 'blessings' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setActiveTab('blessings'); setGachaPhase('idle'); }}
          >
            <span>✨ ACTIVE BLESSINGS</span>
            {activeBlessings.length > 0 && (
              <span style={{ background: '#38bdf8', color: '#09081a', borderRadius: '2px', padding: '1px 5px', fontSize: '9px', fontWeight: 'bold' }}>
                {activeBlessings.length}
              </span>
            )}
          </button>
          <button
            className={`pixel-tab-btn ${activeTab === 'wardrobe' ? 'active' : ''}`}
            onClick={() => { setActiveTab('wardrobe'); setGachaPhase('idle'); }}
          >
            👑 CAT ACCESSORIES ({unlockedAccSet.size}/{Object.keys(CAT_ACCESSORIES).length})
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{ margin: '12px 0 0', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '11px', fontFamily: 'var(--font-heading)', lineHeight: '1.4' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* TAB 1: MAKE A WISH */}
        {activeTab === 'wish' && gachaPhase === 'idle' && (
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
              <h2 style={{ fontSize: '16px', color: '#fef08a', fontFamily: 'var(--font-heading)', margin: '0 0 6px', letterSpacing: '1px', lineHeight: '1.4' }}>
                THE ANCIENT CELESTIAL FOUNTAIN
              </h2>
              <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '520px', margin: '0 auto 16px', lineHeight: '1.6', fontFamily: 'var(--font-pixel)' }}>
                Cast a wish into the starlight waters. Unearth mythical cat hats, cosmic capes, harmonic charms, and powerful timed celestial blessings!
              </p>

              <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 14px', border: '1px solid #38bdf8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)' }}>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', lineHeight: '1.4' }}>
                  GUARANTEE: AT LEAST 1 RARE+ PERK / ACCESSORY EVERY 10 WISHES!
                </span>
              </div>
            </div>

            {/* Wish Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Single Star Wish Card */}
              <div className="cosmic-panel" style={{ padding: '16px', border: '1px solid #312e81', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#fef08a', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', lineHeight: '1.4' }}>
                      1x STAR WISH
                    </span>
                    <span className="rarity-badge rarity-uncommon">SINGLE</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 16px', lineHeight: '1.5', fontFamily: 'var(--font-pixel)' }}>
                    Draw 1 celestial reward from the stars.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="pixel-btn btn-primary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '10px' }}
                    onClick={() => handleSingleWish(true)}
                  >
                    ⭐ 1 TOKEN
                  </button>
                  <button
                    className="pixel-btn btn-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#c084fc', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', lineHeight: '1.5', flex: 1 }}>
                      10x CONSTELLATION WISH
                    </span>
                    <span className="rarity-badge rarity-legendary" style={{ fontSize: '8px', padding: '3px 6px', whiteSpace: 'nowrap' }}>
                      GUARANTEED RARE+
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 16px', lineHeight: '1.5', fontFamily: 'var(--font-pixel)' }}>
                    Summon a meteor shower of 10 celestial wishes with discount!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="pixel-btn btn-primary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '10px', background: '#7c3aed', borderColor: '#a855f7' }}
                    onClick={() => handleTenfoldWish(true)}
                  >
                    ⭐ 10 TOKENS
                  </button>
                  <button
                    className="pixel-btn btn-secondary"
                    style={{ flex: 1, padding: '10px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
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

        {/* GACHA PHASE 1 & 2: METEOR DESCENT & IMPACT BURST */}
        {activeTab === 'wish' && (gachaPhase === 'meteor' || gachaPhase === 'burst') && (
          <div className="gacha-stage">
            <button className="gacha-skip-btn" onClick={handleSkip}>
              SKIP ⏭
            </button>

            {/* Meteor Trail */}
            <div className="gacha-meteor-container">
              <div
                className="gacha-meteor"
                style={{
                  color: getRarityColor(highestRarity),
                  background: `linear-gradient(to right, ${getRarityColor(highestRarity)}, rgba(255, 255, 255, 0.9), transparent)`
                }}
              >
                <div className="gacha-meteor-head" />
              </div>
            </div>

            {/* Impact Flash */}
            {gachaPhase === 'burst' && <div className="gacha-impact-flash" />}

            {/* Starlight Constellation Pulse */}
            <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '54px', animation: 'spin 3s infinite linear' }}>
                🌟
              </div>
              <div style={{ color: '#fef08a', fontFamily: 'var(--font-heading)', fontSize: '14px', letterSpacing: '2px', textShadow: '0 0 12px rgba(254, 240, 138, 0.5)' }}>
                ✦ COMMUNING WITH THE CONSTELLATIONS ✦
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Highest Star Resonance:</span>
                <span className={`rarity-badge rarity-${highestRarity}`}>
                  {highestRarity}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* GACHA PHASE 3: REVEAL (SINGLE OR 10-PULL REEL) */}
        {activeTab === 'wish' && gachaPhase === 'reveal' && (
          <div className="gacha-stage">
            <button className="gacha-skip-btn" onClick={handleSkip}>
              {currentRewards.length === 1 ? 'SKIP ⏭' : 'REVEAL ALL ⏭'}
            </button>

            {/* Single Wish Card Reveal */}
            {currentRewards.length === 1 && (
              <>
                {(highestRarity === 'legendary' || highestRarity === 'epic') && (
                  <div className="gacha-sunburst" />
                )}
                <div
                  className="gacha-reveal-card"
                  style={{
                    borderColor: getRarityColor(currentRewards[0].rarity),
                    boxShadow: `0 0 28px ${getRarityColor(currentRewards[0].rarity)}40`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>✦ STAR REWARD ✦</span>
                    <span className={`rarity-badge rarity-${currentRewards[0].rarity}`}>
                      {currentRewards[0].rarity}
                    </span>
                  </div>

                  <div style={{ fontSize: '48px', margin: '8px 0 14px', filter: `drop-shadow(0 0 16px ${getRarityColor(currentRewards[0].rarity)})` }}>
                    {currentRewards[0].accessory?.icon || currentRewards[0].blessing?.icon || (currentRewards[0].type === 'cosmic_event' ? '🎫' : '✨')}
                  </div>

                  <div style={{ fontSize: '14px', color: '#f8fafc', fontFamily: 'var(--font-heading)', marginBottom: '8px', lineHeight: '1.4' }}>
                    {currentRewards[0].name}
                  </div>

                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px', fontFamily: 'var(--font-pixel)' }}>
                    {currentRewards[0].description}
                  </div>

                  {currentRewards[0].type === 'accessory' && (
                    <div style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', border: '1px solid #0284c7', width: '100%', marginBottom: '16px' }}>
                      ✦ BONUS: {currentRewards[0].accessory?.bonusDescription}
                    </div>
                  )}

                  {currentRewards[0].type === 'blessing' && (
                    <div style={{ fontSize: '11px', color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)', padding: '6px 12px', border: '1px solid #7c3aed', width: '100%', marginBottom: '16px' }}>
                      ✦ ACTIVE: 5 MINUTES CELESTIAL BUFF
                    </div>
                  )}

                  <button
                    className="pixel-btn btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '11px' }}
                    onClick={handleFinishGacha}
                  >
                    ✦ COLLECT REWARD ✦
                  </button>
                </div>
              </>
            )}

            {/* Tenfold Sequential Reel Grid */}
            {currentRewards.length === 10 && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '680px', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#fef08a', fontFamily: 'var(--font-heading)' }}>
                    ✦ CONSTELLATION REVEAL ({Math.min(revealedCount, 10)} / 10)
                  </div>
                  {revealedCount < 10 && (
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      Click unrevealed stars to crack them open!
                    </div>
                  )}
                </div>

                <div className="gacha-tenfold-grid">
                  {currentRewards.map((reward, i) => {
                    const isRevealed = i < revealedCount;
                    return (
                      <div
                        key={i}
                        className={`gacha-slot-card ${isRevealed ? 'revealed' : 'unrevealed'}`}
                        style={isRevealed ? {
                          borderColor: getRarityColor(reward.rarity),
                          boxShadow: `0 0 12px ${getRarityColor(reward.rarity)}30`
                        } : {}}
                        onClick={() => {
                          if (!isRevealed) {
                            setRevealedCount(c => Math.max(c, i + 1));
                            audio.playClick();
                          }
                        }}
                      >
                        {isRevealed ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span style={{ fontSize: '8px', color: '#64748b' }}>#{i + 1}</span>
                              <span className={`rarity-badge rarity-${reward.rarity}`} style={{ fontSize: '7px', padding: '1px 4px' }}>
                                {reward.rarity}
                              </span>
                            </div>
                            <div style={{ fontSize: '26px', margin: '4px 0' }}>
                              {reward.accessory?.icon || reward.blessing?.icon || (reward.type === 'cosmic_event' ? '🎫' : '✨')}
                            </div>
                            <div style={{ fontSize: '10px', color: '#f8fafc', fontFamily: 'var(--font-heading)', lineHeight: '1.2', maxHeight: '28px', overflow: 'hidden' }}>
                              {reward.name}
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
                            <span style={{ fontSize: '22px', animation: 'spin 4s infinite linear' }}>⭐</span>
                            <span style={{ fontSize: '9px', color: '#6366f1', fontFamily: 'var(--font-heading)' }}>#{i + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {revealedCount >= 10 && (
                  <button
                    className="pixel-btn btn-primary"
                    style={{ padding: '10px 28px', fontSize: '11px', marginTop: '6px' }}
                    onClick={handleFinishGacha}
                  >
                    ✦ COLLECT ALL REWARDS ✦
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* GACHA PHASE 4: SUMMARY OVERVIEW */}
        {activeTab === 'wish' && gachaPhase === 'summary' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '14px', color: '#fef08a', fontFamily: 'var(--font-heading)' }}>
                ✦ THE STARS HAVE ANSWERED! ({currentRewards.length} REWARD{currentRewards.length > 1 ? 'S' : ''})
              </div>
              <button
                className="pixel-btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={handleFinishGacha}
              >
                COLLECT ALL
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: currentRewards.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '6px'
            }}>
              {currentRewards.map((reward, i) => (
                <div
                  key={i}
                  className="cosmic-panel"
                  style={{
                    padding: '14px',
                    border: '1px solid',
                    borderColor: getRarityColor(reward.rarity),
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

                  <div style={{ fontSize: '12px', color: '#f8fafc', fontFamily: 'var(--font-heading)', marginBottom: '4px', lineHeight: '1.4' }}>
                    {reward.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '8px', fontFamily: 'var(--font-pixel)' }}>
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
