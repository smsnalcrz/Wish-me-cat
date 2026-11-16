import * as THREE from 'three';
import { CatCharacter } from '../player/CatCharacter';
import { PlayerController } from '../player/PlayerController';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera';
import { WORLD_LAYOUT, FishingAnchor } from '../../data/worldLayout';
import { CREATURES, rollVariant, rollWeight, calculateStardustReward, calculateExpReward } from '../../data/creatures';
import { EQUIPMENT, getStatValue } from '../../data/equipment';
import { CONSTELLATIONS } from '../../data/constellations';
import { SaveManager } from '../save/SaveManager';
import { AudioManager } from '../audio/AudioManager';
import { GameState, CatchResult, CelestialCreature, CreatureVariant } from '../../types/game';

export interface MinigameState {
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

export class FishingSystem {
  public state: GameState = 'exploring';
  private scene: THREE.Scene;
  private cat: CatCharacter;
  private player: PlayerController;
  private audio: AudioManager;
  public cameraCtrl?: ThirdPersonCamera;
  public onTriggerRipple?: (pos: THREE.Vector3) => void;
  private lastActionTime: number = 0;

  // Active Fishing Anchor
  private activeAnchor: FishingAnchor | null = null;

  // Bobber & Line 3D objects
  private bobberGroup: THREE.Group;
  private bobberMesh: THREE.Mesh;
  private lineMesh: THREE.Line;
  private lineGeometry: THREE.BufferGeometry;
  private targetWaterPos: THREE.Vector3 = new THREE.Vector3();
  private castStartPos: THREE.Vector3 = new THREE.Vector3();
  private isBobberInWater: boolean = false;
  private castProgress: number = 0;
  private castDuration: number = 0.75;

  // Bite timers
  private biteTimer: number = 0;
  private biteWaitTime: number = 3.5;
  private biteWindowDuration: number = 2.4;
  private biteReactionElapsed: number = 0;

  // Candidate creature
  private candidateCreature: CelestialCreature | null = null;

  // Minigame
  public minigame: MinigameState = {
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

  // Callbacks to UI
  public onStateChange?: (state: GameState) => void;
  public onMinigameUpdate?: (mg: MinigameState) => void;
  public onCatchSuccess?: (result: CatchResult) => void;
  public onNotification?: (title: string, msg: string) => void;

  constructor(
    scene: THREE.Scene,
    cat: CatCharacter,
    player: PlayerController,
    onTriggerRipple?: (pos: THREE.Vector3) => void,
    cameraCtrl?: ThirdPersonCamera
  ) {
    this.scene = scene;
    this.cat = cat;
    this.player = player;
    this.audio = AudioManager.getInstance();
    this.onTriggerRipple = onTriggerRipple;
    this.cameraCtrl = cameraCtrl;

    // 1. Create Star Bobber
    this.bobberGroup = new THREE.Group();
    this.bobberGroup.visible = false;
    this.scene.add(this.bobberGroup);

    // Glowing Star Bobber Mesh (faceted octahedron with golden core)
    const bobberGeo = new THREE.OctahedronGeometry(0.18);
    const bobberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.5
    });
    this.bobberMesh = new THREE.Mesh(bobberGeo, bobberMat);
    this.bobberGroup.add(this.bobberMesh);

    // Light attached to bobber
    const bLight = new THREE.PointLight(0xfbbf24, 0.85, 3.0);
    this.bobberGroup.add(bLight);

    // 2. Fishing Line (Three.js Line)
    const segments = 16;
    const positions = new Float32Array((segments + 1) * 3);
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.85
    });
    this.lineMesh = new THREE.Line(this.lineGeometry, lineMat);
    this.lineMesh.visible = false;
    this.scene.add(this.lineMesh);
  }

  public setState(newState: GameState): void {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  public startFishing(anchor?: FishingAnchor): void {
    if (this.state !== 'exploring') return;

    this.player.setMovementLocked(true);

    // Find closest anchor if not explicitly provided
    const targetAnchor = anchor || this.player.findNearestFishingAnchor();
    this.activeAnchor = targetAnchor;

    if (targetAnchor) {
      this.player.alignToAnchor(targetAnchor);
      this.cameraCtrl?.setMode('fishing', targetAnchor.direction);
    } else {
      // Freeform lake shoreline fishing: face center of galaxy pond (0, 0, 0)
      const catPos = this.player.getPosition();
      const toCenter = new THREE.Vector3(0, 0, 0).sub(catPos).normalize();
      this.player.facePoint(new THREE.Vector3(0, 0, 0));
      this.cameraCtrl?.setMode('fishing', toCenter);
    }

    this.setState('aiming');
    this.cat.setAnimState('fishing_aim');

    // Automatically trigger casting sequence
    this.castRod();
  }

  public castRod(): void {
    const saveData = SaveManager.getData();
    const rodDist = getStatValue('rod', saveData.rodLevel);

    const catPos = this.player.getPosition();

    if (this.activeAnchor) {
      this.targetWaterPos.copy(this.activeAnchor.castTarget);
    } else {
      const toCenter = new THREE.Vector3(0, 0, 0).sub(catPos);
      toCenter.y = 0;
      const distToCenter = toCenter.length();
      const actualDist = Math.min(rodDist, distToCenter * 0.75);
      this.targetWaterPos = catPos.clone().add(toCenter.normalize().multiplyScalar(actualDist));
    }

    this.targetWaterPos.y = 0.08; // galaxy pool water surface

    this.castStartPos.copy(this.cat.getRodTipWorldPosition());
    this.bobberGroup.position.copy(this.castStartPos);
    this.bobberGroup.visible = true;
    this.lineMesh.visible = true;

    this.castProgress = 0;
    this.isBobberInWater = false;

    this.setState('casting');
    this.audio.playClick();
  }

  public update(delta: number): void {
    if (this.lineMesh.visible) {
      this.updateFishingLine();
    }

    if (this.state === 'casting') {
      this.castProgress += delta / this.castDuration;
      const t = Math.min(1.0, this.castProgress);

      // Parabolic arc: lerp X/Z, arc in Y
      const current = new THREE.Vector3().lerpVectors(this.castStartPos, this.targetWaterPos, t);
      const arcHeight = Math.max(1.8, this.castStartPos.distanceTo(this.targetWaterPos) * 0.35);
      current.y = THREE.MathUtils.lerp(this.castStartPos.y, this.targetWaterPos.y, t) + 4.0 * arcHeight * t * (1.0 - t);

      this.bobberGroup.position.copy(current);

      if (t >= 1.0) {
        // Bobber landed in cosmic water!
        this.isBobberInWater = true;
        this.audio.playSplash();
        this.onTriggerRipple?.(this.targetWaterPos);

        // Calculate bite wait time based on bait upgrade
        const saveData = SaveManager.getData();
        const baitBonus = getStatValue('bait', saveData.baitLevel) / 100;
        this.biteWaitTime = Math.max(1.3, 3.8 * (1.0 - baitBonus * 0.5) + (Math.random() - 0.5) * 1.4);
        this.biteTimer = 0;

        // Bobber reaction window
        this.biteWindowDuration = 1.9 + (saveData.bobberLevel - 1) * 0.25;

        this.setState('waiting');
        this.cat.setAnimState('fishing_wait');
      }
      return;
    }

    if (this.state === 'waiting') {
      // Gentle bobber floating oscillation
      this.biteTimer += delta;
      const bobY = 0.08 + Math.sin(this.biteTimer * 3.5) * 0.04;
      this.bobberGroup.position.y = bobY;
      this.bobberMesh.rotation.y += delta * 1.5;

      // Organic nibble dip right before the real bite
      if (this.biteTimer > this.biteWaitTime * 0.65 && this.biteTimer < this.biteWaitTime * 0.75) {
        this.bobberGroup.position.y = 0.01;
      }

      if (this.biteTimer >= this.biteWaitTime) {
        // BITE OCCURRED! Directly launch active reeling minigame with the moving yellow bar
        this.candidateCreature = this.rollCelestialCreature();
        this.audio.playBiteAlert();
        this.onTriggerRipple?.(this.targetWaterPos);
        this.onNotification?.('★ BITE DETECTED! ★', `A ${this.candidateCreature.name} bit the line! Reel it in!`);
        this.launchMinigame();
      }
      return;
    }

    if (this.state === 'minigame') {
      // Bobber actively fights underwater
      this.bobberGroup.position.y = -0.14 + Math.sin(performance.now() * 0.02) * 0.05;
      this.bobberMesh.rotation.y += delta * 5.0;

      this.updateMinigame(delta);
      return;
    }
  }

  private updateFishingLine(): void {
    const rodTip = this.cat.getRodTipWorldPosition();
    const bobberPos = this.bobberGroup.position;
    const positions = this.lineGeometry.attributes.position.array as Float32Array;
    const count = 16;
    const isTaut = (this.state === 'minigame');
    const sag = isTaut ? 0.02 : 0.35;

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const p = new THREE.Vector3().lerpVectors(rodTip, bobberPos, t);
      p.y -= 4.0 * sag * t * (1.0 - t);

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }

    this.lineGeometry.attributes.position.needsUpdate = true;
  }

  public handleActionInput(): void {
    if (this.state !== 'minigame') return;

    // 180ms input debounce to prevent double-click / mousedown+click race condition!
    const now = performance.now();
    if (now - this.lastActionTime < 180) {
      return;
    }
    this.lastActionTime = now;

    this.evaluateMinigameAction();
  }

  private launchMinigame(): void {
    const saveData = SaveManager.getData();
    const creature = this.candidateCreature || CREATURES[0];

    const diff = creature.catchDifficulty;
    // Speed: smooth readable sweep across the bar (approx 1.2s to 0.8s per sweep)
    const speed = 1.35 + diff * 1.6;
    const required = Math.round(3 + diff * 3);

    // Generous safe zone width
    const lineStat = getStatValue('line', saveData.lineLevel);
    const safeZoneWidth = Math.max(0.18, Math.min(0.52, (lineStat / 100) * (1.15 - diff * 0.3)));

    const maxMisses = Math.round(getStatValue('bobber', saveData.bobberLevel));

    this.minigame = {
      cursor: 0.05,
      direction: 1,
      speed,
      safeZoneCenter: 0.35 + Math.random() * 0.35,
      safeZoneWidth,
      currentSuccesses: 0,
      requiredSuccesses: required,
      missesLeft: maxMisses,
      maxMisses,
      lastAction: null,
      creatureName: creature.name,
      creatureRarity: creature.rarity
    };

    this.setState('minigame');
    this.cat.setAnimState('fishing_reel');
    // Send newly cloned object so React immediately re-renders
    this.onMinigameUpdate?.({ ...this.minigame });
  }

  private updateMinigame(delta: number): void {
    const mg = this.minigame;

    // Move cursor left to right and bounce smoothly
    mg.cursor += mg.direction * mg.speed * delta;
    if (mg.cursor >= 1.0) {
      mg.cursor = 1.0;
      mg.direction = -1;
    } else if (mg.cursor <= 0.0) {
      mg.cursor = 0.0;
      mg.direction = 1;
    }

    // Pass cloned state every frame so React updates the yellow bar's position at 60 FPS
    this.onMinigameUpdate?.({ ...mg });
  }

  private evaluateMinigameAction(): void {
    const mg = this.minigame;
    const min = mg.safeZoneCenter - mg.safeZoneWidth * 0.5;
    const max = mg.safeZoneCenter + mg.safeZoneWidth * 0.5;

    const isHit = mg.cursor >= min && mg.cursor <= max;

    if (isHit) {
      const distFromCenter = Math.abs(mg.cursor - mg.safeZoneCenter);
      const isPerfect = distFromCenter <= (mg.safeZoneWidth * 0.22);

      mg.currentSuccesses += isPerfect ? 2 : 1;
      mg.lastAction = isPerfect ? 'perfect' : 'hit';
      this.audio.playMinigameHit(isPerfect);
      this.onTriggerRipple?.(this.targetWaterPos);

      // Smoothly relocate safe zone for dynamic engagement
      mg.safeZoneCenter = 0.22 + Math.random() * 0.56;

      if (mg.currentSuccesses >= mg.requiredSuccesses) {
        this.resolveCatchVictory();
        return;
      }
    } else {
      mg.missesLeft -= 1;
      mg.lastAction = 'miss';
      this.audio.playMinigameMiss();

      if (mg.missesLeft <= 0) {
        this.onNotification?.('Line Broke!', 'The star fought too hard and escaped into deep space!');
        this.cancelFishing();
        return;
      }
    }

    this.onMinigameUpdate?.({ ...mg });
  }

  private rollCelestialCreature(): CelestialCreature {
    const saveData = SaveManager.getData();
    const playerLvl = saveData.playerLevel;
    const currentRegion = saveData.currentRegionId;

    const eligible = CREATURES.filter(c => 
      c.minPlayerLevel <= playerLvl &&
      (c.eligibleRegions.length === 0 || c.eligibleRegions.includes(currentRegion))
    );

    const pool = eligible.length > 0 ? eligible : CREATURES;

    const baitBonus = getStatValue('bait', saveData.baitLevel) / 100;
    let constellationBonus = 0;
    saveData.completedConstellationIds.forEach(id => {
      const c = CONSTELLATIONS.find(x => x.id === id);
      if (c) constellationBonus += (c.rareBonusPct / 100);
    });

    let totalWeight = 0;
    const weights: number[] = [];

    pool.forEach(c => {
      let w = c.spawnWeight;
      if (c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary' || c.rarity === 'mythic') {
        w *= (1.0 + baitBonus + constellationBonus);
      }
      weights.push(w);
      totalWeight += w;
    });

    const roll = Math.random() * totalWeight;
    let accum = 0;
    for (let i = 0; i < pool.length; i++) {
      accum += weights[i];
      if (roll <= accum) return pool[i];
    }

    return pool[0];
  }

  private resolveCatchVictory(): void {
    const creature = this.candidateCreature || CREATURES[0];
    const variant = rollVariant(creature);
    const weight = rollWeight(creature, variant);

    let earnedStardust = calculateStardustReward(creature, variant, weight);
    const earnedExp = calculateExpReward(creature, variant);

    const saveData = SaveManager.getData();
    saveData.completedConstellationIds.forEach(id => {
      const c = CONSTELLATIONS.find(x => x.id === id);
      if (c) earnedStardust = Math.round(earnedStardust * (1 + c.stardustBonusPct / 100));
    });

    const { isNewDiscovery, isNewRecord } = SaveManager.recordCatch(creature.id, variant, weight);

    saveData.stardust += earnedStardust;
    saveData.playerExp += earnedExp;

    let requiredExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
    while (saveData.playerExp >= requiredExp) {
      saveData.playerExp -= requiredExp;
      saveData.playerLevel += 1;
      this.audio.playLevelUp();
      this.onNotification?.('LEVEL UP!', `You reached Cosmic Angler Level ${saveData.playerLevel}!`);
      requiredExp = Math.round(50 * Math.pow(saveData.playerLevel, 1.45));
    }

    this.advanceQuests(creature, variant, earnedStardust);
    this.checkConstellationProgress();
    SaveManager.save(saveData);

    this.bobberGroup.visible = false;
    this.lineMesh.visible = false;
    this.setState('celebration');
    this.cat.setAnimState('celebration');
    this.audio.playCatchCelebration(creature.rarity);

    const result: CatchResult = {
      creature,
      variant,
      weight,
      stardust: earnedStardust,
      exp: earnedExp,
      isNewDiscovery,
      isNewRecord
    };

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

    if (progress['quest_01'] >= 3 && !saveData.completedQuestIds.includes('quest_01')) {
      saveData.completedQuestIds.push('quest_01');
      this.onNotification?.('QUEST COMPLETE!', 'First Catch complete! Claim at the Quest Board.');
    }
    if (progress['quest_02'] >= 2 && !saveData.completedQuestIds.includes('quest_02')) {
      saveData.completedQuestIds.push('quest_02');
      this.onNotification?.('QUEST COMPLETE!', 'Lunar Harvest complete! Claim at the Quest Board.');
    }
    if (progress['quest_03'] >= 200 && !saveData.completedQuestIds.includes('quest_03')) {
      saveData.completedQuestIds.push('quest_03');
      this.onNotification?.('QUEST COMPLETE!', 'Cosmic Wealth complete! Claim at the Quest Board.');
    }
    if (progress['quest_05'] >= 3 && !saveData.completedQuestIds.includes('quest_05')) {
      saveData.completedQuestIds.push('quest_05');
      this.onNotification?.('QUEST COMPLETE!', 'Star Cartographer complete! Claim at the Quest Board.');
    }

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
        this.onNotification?.('CONSTELLATION RESTORED!', `${constel.name} restored! Permanent celestial blessings granted!`);
      }
    });
    SaveManager.save(saveData);
  }

  public cancelFishing(): void {
    this.bobberGroup.visible = false;
    this.lineMesh.visible = false;
    this.candidateCreature = null;
    this.activeAnchor = null;
    this.player.setMovementLocked(false);
    this.cat.setAnimState('idle');
    this.cameraCtrl?.setMode('exploration');
    this.setState('exploring');
  }
}
