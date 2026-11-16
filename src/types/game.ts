export type CatBreed = 'celestial' | 'calico' | 'kuro' | 'cloud';

export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type CreatureVariant = 'normal' | 'golden' | 'shiny' | 'rainbow' | 'ancient';

export type EquipmentType = 'rod' | 'line' | 'bait' | 'bobber';

export type QuestType = 'catch_count' | 'catch_rarity' | 'earn_stardust' | 'upgrade_gear' | 'discover_species';

export type GameState = 
  | 'exploring' 
  | 'aiming' 
  | 'casting' 
  | 'waiting' 
  | 'bite' 
  | 'minigame' 
  | 'celebration' 
  | 'paused' 
  | 'modal_open';

export interface CelestialCreature {
  id: string;
  name: string;
  description: string;
  rarity: CreatureRarity;
  baseStardust: number;
  baseExp: number;
  catchDifficulty: number; // 0.1 to 1.0
  spawnWeight: number;
  minPlayerLevel: number;
  eligibleRegions: string[];
  minWeight: number;
  maxWeight: number;
  glowColor: string;
  secondaryColor: string;
  modelType: 'flicker_star' | 'moonchip' | 'comet_koi' | 'nebula_jelly' | 'aurora_crown' | 'prism_eternal';
  goldenChance: number;
  shinyChance: number;
  rainbowChance: number;
  ancientChance: number;
}

export interface EquipmentData {
  type: EquipmentType;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  statName: string;
  baseStat: number;
  statPerLevel: number;
  statUnit: string;
}

export interface RegionData {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  stardustCost: number;
  skyColor: string;
  poolColor: string;
  fogColor: string;
  fogDensity: number;
}

export interface QuestData {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  targetParam: string;
  targetCount: number;
  rewardStardust: number;
  rewardExp: number;
}

export interface ConstellationStarNode {
  starId: string;
  requiredCreatureId: string;
  label: string;
  x: number; // percentage in sky map
  y: number;
}

export interface ConstellationData {
  id: string;
  name: string;
  lore: string;
  nodes: ConstellationStarNode[];
  stardustBonusPct: number;
  rareBonusPct: number;
  castingDistBonus: number;
}

export interface CatchRecord {
  count: number;
  maxWeight: number;
  variants: string[];
}

export interface SaveData {
  version: number;
  lastSaved: string;
  playerLevel: number;
  playerExp: number;
  stardust: number;
  rodLevel: number;
  lineLevel: number;
  baitLevel: number;
  bobberLevel: number;
  currentRegionId: string;
  unlockedRegionIds: string[];
  discoveredCreatureIds: string[];
  catchRecords: Record<string, CatchRecord>;
  completedQuestIds: string[];
  claimedQuestIds: string[];
  questProgress: Record<string, number>;
  completedConstellationIds: string[];
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  cameraSensitivity: number;
  catBreed?: CatBreed;
  bgmTrack?: BGMTrackId;
}

export type BGMTrackId = 'space_sprinkles' | 'mesmerizing_galaxy' | 'cosmic_ambient';

export interface CatchResult {
  creature: CelestialCreature;
  variant: CreatureVariant;
  weight: number;
  stardust: number;
  exp: number;
  isNewDiscovery: boolean;
  isNewRecord: boolean;
}

export interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  remainingTime: number;
  rareMultiplier: number;
  stardustMultiplier: number;
}
