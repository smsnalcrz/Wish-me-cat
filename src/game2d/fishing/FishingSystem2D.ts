/**
 * FishingSystem2D.ts
 * Pure 2D Fishing Mechanics & Progression Controller for Wish Me Cat.
 * Preserves 100% of game progression, loot tables, upgrades, and minigame timing.
 */

import { PixelCat } from '../entities/PixelCat';
import { Bobber2D } from '../entities/Bobber2D';
import { StarpondWater2D } from '../world/StarpondWater2D';
import { InteractiveStation2D } from '../world/Station2D';
import { CREATURES, rollVariant, rollWeight, calculateStardustReward, calculateExpReward } from '../../data/creatures';
import { EQUIPMENT, getStatValue } from '../../data/equipment';
import { CONSTELLATIONS } from '../../data/constellations';
import { SaveManager } from '../../systems/save/SaveManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { WishManager } from '../../systems/wishing/WishManager';
import { GameState, CatchResult, CelestialCreature, CreatureVariant } from '../../types/game';

export interface MinigameState2D {
  cursor: number; // 0 to 1
  direction: number; // 1 or -1
  speed: number;
  safeZoneCenter: number;
  safeZoneWidth: number;
  currentSuccesses: number;
  requiredSuccesses: number;
  missesLeft: number;
  maxMisses: number;
  lastAction: 'hit' | 'perfect' | 'miss' | null;
  creatureName?: string;
  creatureRarity?: string;
  tension: number; // 0 to 100
  fishStruggle: 'calm' | 'thrashing' | 'tired';
  combo: number;
}

export class FishingSystem2D {
  public state: GameState = 'exploring';
  public cat: PixelCat;
  public bobber: Bobber2D;
  public water: StarpondWater2D;
  private audio: AudioManager;

  // Active Fishing Spot
  private activePier: InteractiveStation2D | null = null;

  // Timers
  private biteTimer: number = 0;
  private biteWaitTime: number = 3.5;
  private candidateCreature: CelestialCreature | null = null;
  private struggleTimer: number = 0;

  // Minigame
  public minigame: MinigameState2D = {
    cursor: 0,
    direction: 1,
    speed: 1.8,
    safeZoneCenter: 0.5,
    safeZoneWidth: 0.25,
    currentSuccesses: 0,
    requiredSuccesses: 3,
    missesLeft: 3,
    maxMisses: 3,
    lastAction: null,
    tension: 10,
    fishStruggle: 'calm',
    combo: 0
  };

  // UI Event Callbacks
  public onStateChange?: (state: GameState) => void;
  public onMinigameUpdate?: (mg: MinigameState2D) => void;
  public onCatchSuccess?: (result: CatchResult) => void;
  public onNotification?: (title: string, msg: string) => void;

  constructor(cat: PixelCat, bobber: Bobber2D, water: StarpondWater2D) {
    this.cat = cat;
    this.bobber = bobber;
    this.water = water;
    this.audio = AudioManager.getInstance();
  }

  public setState(newState: GameState): void {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  // Begin Fishing Action
  public startFishing(pier?: InteractiveStation2D | null): void {
    if (this.state !== 'exploring') return;

    this.activePier = pier || null;

    // Position and align cat cleanly on pier walkway facing out towards the water
    if (pier) {
      if (pier.pierDirection === 'up') {
        this.cat.x = pier.x;
        this.cat.y = pier.y - 12;
        this.cat.facing = 'up';
      } else if (pier.pierDirection === 'down') {
        this.cat.x = pier.x;
        this.cat.y = pier.y + 12;
        this.cat.facing = 'down';
      } else if (pier.pierDirection === 'left') {
        this.cat.x = pier.x - 12;
        this.cat.y = pier.y;
        this.cat.facing = 'left';
      } else if (pier.pierDirection === 'right') {
        this.cat.x = pier.x + 12;
        this.cat.y = pier.y;
        this.cat.facing = 'right';
      }

      if (pier.castTarget) {
        this.cat.facePoint(pier.castTarget.x, pier.castTarget.y);
      }
    } else {
      this.cat.facePoint(this.water.centerX, this.water.centerY);
    }

    this.cat.setAnimState('fish_cast');
    this.setState('casting');
    this.audio.playClick();

    // Determine 2D water cast target point
    const saveData = SaveManager.getData();
    let targetX = 0;
    let targetY = 0;

    if (pier && pier.castTarget) {
      targetX = pier.castTarget.x;
      targetY = pier.castTarget.y;
    } else {
      // Freeform shore cast: cast into pond center with rod distance
      const dx = this.water.centerX - this.cat.x;
      const dy = this.water.centerY - this.cat.y;
      const dist = Math.hypot(dx, dy);
      const castDist = Math.min(dist * 0.75, 45 + saveData.rodLevel * 8);
      targetX = this.cat.x + (dx / dist) * castDist;
      targetY = this.cat.y + (dy / dist) * castDist;
    }

    const tip = this.cat.getRodTipWorldPos();
    this.bobber.startCast(tip.x, tip.y, targetX, targetY);
  }

  public update(delta: number): void {
    if (this.state === 'casting') {
      this.bobber.update(delta, (landX, landY) => {
        // Bobber landed in water!
        this.audio.playSplash();
        this.water.triggerRipple(landX, landY, 26);

        const saveData = SaveManager.getData();
        const baitBonus = getStatValue('bait', saveData.baitLevel) / 100;
        let waitBase = 3.6 * (1.0 - baitBonus * 0.5) + (Math.random() - 0.5) * 1.2;
        if (WishManager.hasBlessing('swift_paws')) {
          waitBase *= 0.6;
        }
        if (saveData.equippedAccessories?.hat === 'hat_wizard_hood') {
          waitBase *= 0.85;
        }
        this.biteWaitTime = Math.max(0.8, waitBase);
        this.biteTimer = 0;

        this.setState('waiting');
        this.cat.setAnimState('fish_wait');
      });
      return;
    }

    if (this.state === 'waiting') {
      this.bobber.update(delta);
      this.biteTimer += delta;

      // Small nibble ripple before real bite
      if (this.biteTimer > this.biteWaitTime * 0.7 && this.biteTimer < this.biteWaitTime * 0.75) {
        this.water.triggerRipple(this.bobber.x, this.bobber.y, 14);
      }

      if (this.biteTimer >= this.biteWaitTime) {
        // BITE DETECTED!
        this.candidateCreature = this.rollCelestialCreature();
        this.bobber.isBiting = true;
        this.audio.playBiteAlert();
        this.water.triggerRipple(this.bobber.x, this.bobber.y, 32);
        this.cat.setAnimState('fish_bite');
        this.onNotification?.('★ BITE DETECTED! ★', `A ${this.candidateCreature.name} bit the line! Reel it in!`);

        this.launchMinigame();
      }
      return;
    }

    if (this.state === 'minigame') {
      this.bobber.update(delta);
      this.updateMinigame(delta);
      return;
    }
  }

  // Roll Celestial Creature based on active region, blessings, accessories, and player level
  private rollCelestialCreature(): CelestialCreature {
    const saveData = SaveManager.getData();
    const regionId = saveData.currentRegionId || 'region_moonpool';

    const pool = CREATURES.filter(c =>
      c.eligibleRegions.includes(regionId) &&
      saveData.playerLevel >= c.minPlayerLevel
    );

    const activePool = pool.length > 0 ? pool : [CREATURES[0]];

    // Rare Attraction Multipliers (Abyssal Magnet Blessing + Cosmic Crown)
    const hasMagnet = WishManager.hasBlessing('abyssal_magnet');
    const hasCrown = saveData.equippedAccessories?.hat === 'hat_cosmic_crown';
    let rareMultiplier = 1.0;
    if (hasMagnet) rareMultiplier *= 2.2;
    if (hasCrown) rareMultiplier *= 1.35;

    let totalWeight = 0;
    const weights: number[] = [];

    for (const c of activePool) {
      let w = c.spawnWeight;
      if (c.rarity !== 'common' && c.rarity !== 'uncommon') {
        w *= rareMultiplier;
      }
      weights.push(w);
      totalWeight += w;
    }

    let r = Math.random() * totalWeight;

    for (let i = 0; i < activePool.length; i++) {
      r -= weights[i];
      if (r <= 0) return activePool[i];
    }
    return activePool[0];
  }

  private launchMinigame(): void {
    if (!this.candidateCreature) return;

    const saveData = SaveManager.getData();
    const lineBonus = getStatValue('line', saveData.lineLevel);
    const baseWidth = Math.max(0.18, 0.32 - this.candidateCreature.catchDifficulty * 0.16);
    let safeWidth = baseWidth + (lineBonus / 100) * 0.15;

    // Apply Celestial Clarity Blessing & Accessories
    if (WishManager.hasBlessing('celestial_clarity')) {
      safeWidth *= 1.5;
    }
    if (saveData.equippedAccessories?.charm === 'charm_solar_amulet') {
      safeWidth *= 1.25;
    }
    if (saveData.equippedAccessories?.cape === 'cape_nebula_cloak') {
      safeWidth *= 1.15;
    }
    const safeZoneWidth = Math.min(0.70, safeWidth);

    let speed = 1.5 + this.candidateCreature.catchDifficulty * 1.6;
    if (WishManager.hasBlessing('celestial_clarity')) {
      speed *= 0.75;
    }

    let missesLeft = 3 + Math.floor((saveData.bobberLevel - 1) * 0.34);
    if (saveData.equippedAccessories?.charm === 'charm_lunar_pearl') {
      missesLeft += 1;
    }

    this.struggleTimer = 0;
    this.minigame = {
      cursor: 0,
      direction: 1,
      speed,
      safeZoneCenter: 0.35 + Math.random() * 0.3,
      safeZoneWidth,
      currentSuccesses: 0,
      requiredSuccesses: 3 + (this.candidateCreature.rarity === 'legendary' || this.candidateCreature.rarity === 'mythic' ? 1 : 0),
      missesLeft,
      maxMisses: missesLeft,
      lastAction: null,
      creatureName: this.candidateCreature.name,
      creatureRarity: this.candidateCreature.rarity,
      tension: 10,
      fishStruggle: 'calm',
      combo: 0
    };

    this.bobber.isReeling = true;
    this.cat.setAnimState('fish_reel');
    this.setState('minigame');
    this.onMinigameUpdate?.({ ...this.minigame });
  }

  private updateMinigame(delta: number): void {
    this.struggleTimer += delta;

    // Cycle struggle mood every 2.8s
    if (this.struggleTimer > 2.8) {
      this.struggleTimer = 0;
      const moods: ('calm' | 'thrashing' | 'tired')[] = ['calm', 'thrashing', 'tired'];
      const nextMood = moods[Math.floor(Math.random() * moods.length)];
      this.minigame.fishStruggle = nextMood;
      if (nextMood === 'thrashing') {
        this.water.triggerRipple(this.bobber.x, this.bobber.y, 28);
      }
    }

    // Dynamic speed based on struggle mood
    let currentSpeed = this.minigame.speed;
    if (this.minigame.fishStruggle === 'thrashing') currentSpeed *= 1.35;
    if (this.minigame.fishStruggle === 'tired') currentSpeed *= 0.65;

    this.minigame.cursor += this.minigame.direction * currentSpeed * delta;

    if (this.minigame.cursor >= 1.0) {
      this.minigame.cursor = 1.0;
      this.minigame.direction = -1;
    } else if (this.minigame.cursor <= 0.0) {
      this.minigame.cursor = 0.0;
      this.minigame.direction = 1;
    }

    // Dynamic tension balance
    if (this.minigame.fishStruggle === 'thrashing') {
      this.minigame.tension = Math.min(100, this.minigame.tension + 6 * delta);
    } else {
      this.minigame.tension = Math.max(5, this.minigame.tension - 4 * delta);
    }

    this.onMinigameUpdate?.({ ...this.minigame });
  }

  // Handle Player Reeling Action (Click or Spacebar)
  public handleActionInput(): void {
    if (this.state !== 'minigame' || !this.candidateCreature) return;

    const cursor = this.minigame.cursor;
    const center = this.minigame.safeZoneCenter;
    const halfWidth = this.minigame.safeZoneWidth / 2;
    const isHit = Math.abs(cursor - center) <= halfWidth;
    const isPerfect = Math.abs(cursor - center) <= halfWidth * 0.38;

    if (isHit) {
      this.minigame.combo += 1;
      const bonusHit = isPerfect || (this.minigame.combo >= 3 && Math.random() < 0.5);
      this.minigame.currentSuccesses += bonusHit ? 2 : 1;
      this.minigame.lastAction = isPerfect ? 'perfect' : 'hit';
      this.minigame.tension = Math.max(0, this.minigame.tension - 20);

      this.audio.playMinigameHit(isPerfect);
      this.water.triggerRipple(this.bobber.x, this.bobber.y, isPerfect ? 32 : 22);

      // Reposition safe zone
      this.minigame.safeZoneCenter = 0.25 + Math.random() * 0.5;

      if (this.minigame.currentSuccesses >= this.minigame.requiredSuccesses) {
        this.completeCatch();
        return;
      }
    } else {
      this.minigame.combo = 0;
      this.minigame.missesLeft -= 1;
      this.minigame.lastAction = 'miss';
      this.minigame.tension = Math.min(100, this.minigame.tension + 28);
      this.audio.playMinigameMiss();

      if (this.minigame.missesLeft <= 0 || this.minigame.tension >= 100) {
        // Line snapped, creature escaped!
        this.onNotification?.('LINE SNAPPED!', 'The celestial creature broke free!');
        this.cancelFishing();
        return;
      }
    }

    this.onMinigameUpdate?.({ ...this.minigame });
  }

  // Successful Catch Resolution
  private completeCatch(): void {
    if (!this.candidateCreature) return;

    const creature = this.candidateCreature;
    let variant = rollVariant(creature);

    // Aurora Fortune Blessing: Re-roll for shiny/golden if normal
    if (WishManager.hasBlessing('aurora_fortune') && variant === 'normal') {
      const reroll = rollVariant(creature);
      if (reroll !== 'normal') variant = reroll;
    }

    const weight = rollWeight(creature, variant);
    let earnedStardust = calculateStardustReward(creature, variant, weight);
    let earnedExp = calculateExpReward(creature, variant);

    // Save Manager Records
    const { isNewDiscovery, isNewRecord } = SaveManager.recordCatch(creature.id, variant, weight);
    const saveData = SaveManager.getData();

    // Celestial Blessings & Accessory Reward Boosts
    if (WishManager.hasBlessing('starfall_abundance')) {
      earnedStardust *= 2;
    }
    if (saveData.equippedAccessories?.hat === 'hat_star_beret') {
      earnedExp = Math.round(earnedExp * 1.2);
    }
    if (saveData.equippedAccessories?.hat === 'hat_straw_fisherman' && creature.rarity === 'common') {
      earnedStardust = Math.round(earnedStardust * 1.15);
    }

    // Award Wish Tokens!
    let bonusTokens = 0;
    if (creature.rarity === 'epic' || creature.rarity === 'legendary' || creature.rarity === 'mythic') {
      bonusTokens += 1;
    }
    if (isNewDiscovery) {
      bonusTokens += 1;
    }

    // Reward Stardust & Exp
    saveData.stardust += earnedStardust;
    saveData.playerExp += earnedExp;

    // Level up calculation
    let leveledUp = false;
    let reqExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
    while (saveData.playerExp >= reqExp) {
      saveData.playerExp -= reqExp;
      saveData.playerLevel += 1;
      leveledUp = true;
      bonusTokens += 1; // +1 Wish Token per Level Up!
      reqExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
    }

    if (bonusTokens > 0) {
      saveData.wishTokens = (saveData.wishTokens || 0) + bonusTokens;
      this.onNotification?.('✦ WISH TOKEN GRANTED! ✦', `You earned ${bonusTokens} Wish Token${bonusTokens > 1 ? 's' : ''}! Visit the Wishing Fountain!`);
    }

    SaveManager.save(saveData);

    // Quests & Constellations
    this.advanceQuests(creature, variant, earnedStardust);
    this.checkConstellationProgress();

    // Sound FX
    if (leveledUp) {
      this.audio.playLevelUp();
      this.onNotification?.('✦ LEVEL UP! ✦', `You reached Player Level ${saveData.playerLevel}!`);
    } else {
      this.audio.playCatchCelebration(creature.rarity);
    }

    const result: CatchResult = {
      creature,
      variant,
      weight,
      stardust: earnedStardust,
      exp: earnedExp,
      isNewDiscovery,
      isNewRecord
    };

    this.bobber.hide();
    this.cat.setAnimState('celebrate');
    this.setState('celebration');
    this.onCatchSuccess?.(result);
  }

  private advanceQuests(creature: CelestialCreature, variant: CreatureVariant, stardust: number): void {
    const saveData = SaveManager.getData();
    const progress = saveData.questProgress;

    progress['quest_01'] = (progress['quest_01'] || 0) + (creature.id === 'creature_flicker_star' ? 1 : 0);
    if (creature.rarity !== 'common') {
      progress['quest_02'] = (progress['quest_02'] || 0) + 1;
    }
    progress['quest_03'] = (progress['quest_03'] || 0) + stardust;
    progress['quest_05'] = saveData.discoveredCreatureIds.length;

    SaveManager.save(saveData);
  }

  private checkConstellationProgress(): void {
    const saveData = SaveManager.getData();
    CONSTELLATIONS.forEach(constel => {
      if (saveData.completedConstellationIds.includes(constel.id)) return;
      const allNodesMet = constel.nodes.every(node =>
        saveData.discoveredCreatureIds.includes(node.requiredCreatureId)
      );
      if (allNodesMet) {
        saveData.completedConstellationIds.push(constel.id);
        this.onNotification?.('CONSTELLATION RESTORED!', `${constel.name} restored!`);
      }
    });
    SaveManager.save(saveData);
  }

  public cancelFishing(): void {
    this.bobber.hide();
    this.candidateCreature = null;
    this.activePier = null;
    this.cat.setAnimState('idle');
    this.setState('exploring');
  }
}
