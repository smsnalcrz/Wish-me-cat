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
    lastAction: null
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
        this.biteWaitTime = Math.max(1.2, 3.6 * (1.0 - baitBonus * 0.5) + (Math.random() - 0.5) * 1.2);
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

  // Roll Celestial Creature based on active region and player level
  private rollCelestialCreature(): CelestialCreature {
    const saveData = SaveManager.getData();
    const regionId = saveData.currentRegionId || 'region_moonpool';

    const pool = CREATURES.filter(c =>
      c.eligibleRegions.includes(regionId) &&
      saveData.playerLevel >= c.minPlayerLevel
    );

    const activePool = pool.length > 0 ? pool : [CREATURES[0]];
    const totalWeight = activePool.reduce((acc, c) => acc + c.spawnWeight, 0);
    let r = Math.random() * totalWeight;

    for (const c of activePool) {
      r -= c.spawnWeight;
      if (r <= 0) return c;
    }
    return activePool[0];
  }

  private launchMinigame(): void {
    if (!this.candidateCreature) return;

    const saveData = SaveManager.getData();
    const lineBonus = getStatValue('line', saveData.lineLevel);
    const baseWidth = Math.max(0.18, 0.32 - this.candidateCreature.catchDifficulty * 0.16);
    const safeZoneWidth = Math.min(0.55, baseWidth + (lineBonus / 100) * 0.15);

    const missesLeft = 3 + Math.floor((saveData.bobberLevel - 1) * 0.34);

    this.minigame = {
      cursor: 0,
      direction: 1,
      speed: 1.5 + this.candidateCreature.catchDifficulty * 1.6,
      safeZoneCenter: 0.35 + Math.random() * 0.3,
      safeZoneWidth,
      currentSuccesses: 0,
      requiredSuccesses: 3,
      missesLeft,
      maxMisses: missesLeft,
      lastAction: null,
      creatureName: this.candidateCreature.name,
      creatureRarity: this.candidateCreature.rarity
    };

    this.bobber.isReeling = true;
    this.cat.setAnimState('fish_reel');
    this.setState('minigame');
    this.onMinigameUpdate?.({ ...this.minigame });
  }

  private updateMinigame(delta: number): void {
    // Ping-pong moving cursor back and forth
    this.minigame.cursor += this.minigame.direction * this.minigame.speed * delta;

    if (this.minigame.cursor >= 1.0) {
      this.minigame.cursor = 1.0;
      this.minigame.direction = -1;
    } else if (this.minigame.cursor <= 0.0) {
      this.minigame.cursor = 0.0;
      this.minigame.direction = 1;
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
    const isPerfect = Math.abs(cursor - center) <= halfWidth * 0.4;

    if (isHit) {
      this.minigame.currentSuccesses += 1;
      this.minigame.lastAction = isPerfect ? 'perfect' : 'hit';
      this.audio.playMinigameHit(isPerfect);
      this.water.triggerRipple(this.bobber.x, this.bobber.y, 22);

      // Reposition safe zone
      this.minigame.safeZoneCenter = 0.25 + Math.random() * 0.5;

      if (this.minigame.currentSuccesses >= this.minigame.requiredSuccesses) {
        this.completeCatch();
        return;
      }
    } else {
      this.minigame.missesLeft -= 1;
      this.minigame.lastAction = 'miss';
      this.audio.playMinigameMiss();

      if (this.minigame.missesLeft <= 0) {
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
    const variant = rollVariant(creature);
    const weight = rollWeight(creature, variant);
    const earnedStardust = calculateStardustReward(creature, variant, weight);
    const earnedExp = calculateExpReward(creature, variant);

    // Save Manager Records
    const { isNewDiscovery, isNewRecord } = SaveManager.recordCatch(creature.id, variant, weight);
    const saveData = SaveManager.getData();

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
      reqExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
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
