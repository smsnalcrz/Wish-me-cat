import { CelestialCreature, CreatureVariant } from '../types/game';

export const CREATURES: CelestialCreature[] = [
  {
    id: 'creature_flicker_star',
    name: 'Flicker Star',
    description: 'A playful baby star that dances across galaxy pools with curious twinkle.',
    rarity: 'common',
    baseStardust: 25,
    baseExp: 15,
    catchDifficulty: 0.18,
    spawnWeight: 100,
    minPlayerLevel: 1,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon'],
    minWeight: 0.4,
    maxWeight: 1.8,
    glowColor: '#fff58a',
    secondaryColor: '#ffda33',
    modelType: 'flicker_star',
    goldenChance: 0.05,
    shinyChance: 0.025,
    rainbowChance: 0.01,
    ancientChance: 0.002
  },
  {
    id: 'creature_moonchip',
    name: 'Moonchip',
    description: 'A crescent-shaped celestial being encrusted with sparkling moon dust.',
    rarity: 'uncommon',
    baseStardust: 55,
    baseExp: 35,
    catchDifficulty: 0.32,
    spawnWeight: 60,
    minPlayerLevel: 1,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon'],
    minWeight: 0.8,
    maxWeight: 3.5,
    glowColor: '#7ae2ff',
    secondaryColor: '#c8f1ff',
    modelType: 'moonchip',
    goldenChance: 0.04,
    shinyChance: 0.02,
    rainbowChance: 0.008,
    ancientChance: 0.002
  },
  {
    id: 'creature_comet_koi',
    name: 'Comet Koi',
    description: 'An elegant cosmic fish streaming a brilliant starlight comet tail behind it.',
    rarity: 'rare',
    baseStardust: 130,
    baseExp: 85,
    catchDifficulty: 0.50,
    spawnWeight: 30,
    minPlayerLevel: 2,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon', 'region_comet_falls'],
    minWeight: 1.5,
    maxWeight: 5.5,
    glowColor: '#30b5ff',
    secondaryColor: '#00ffe5',
    modelType: 'comet_koi',
    goldenChance: 0.035,
    shinyChance: 0.018,
    rainbowChance: 0.006,
    ancientChance: 0.0015
  },
  {
    id: 'creature_nebula_jelly',
    name: 'Nebula Jelly',
    description: 'A translucent cosmic jellyfish undulating with interstellar violet gas and auroral tendrils.',
    rarity: 'epic',
    baseStardust: 280,
    baseExp: 190,
    catchDifficulty: 0.68,
    spawnWeight: 14,
    minPlayerLevel: 3,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon'],
    minWeight: 2.2,
    maxWeight: 8.0,
    glowColor: '#d946ef',
    secondaryColor: '#8b5cf6',
    modelType: 'nebula_jelly',
    goldenChance: 0.03,
    shinyChance: 0.015,
    rainbowChance: 0.005,
    ancientChance: 0.001
  },
  {
    id: 'creature_aurora_crown',
    name: 'Aurora Crown',
    description: 'A majestic radiant tiara of pure northern lights woven by ancient solar winds.',
    rarity: 'legendary',
    baseStardust: 650,
    baseExp: 420,
    catchDifficulty: 0.82,
    spawnWeight: 6,
    minPlayerLevel: 4,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon', 'region_aurora_deep'],
    minWeight: 3.5,
    maxWeight: 12.0,
    glowColor: '#facc15',
    secondaryColor: '#34d399',
    modelType: 'aurora_crown',
    goldenChance: 0.025,
    shinyChance: 0.012,
    rainbowChance: 0.004,
    ancientChance: 0.001
  },
  {
    id: 'creature_prism_eternal',
    name: 'Prism Eternal',
    description: 'A mythical hyper-dimensional star crystal holding the radiant genesis of newborn galaxies.',
    rarity: 'mythic',
    baseStardust: 1600,
    baseExp: 1100,
    catchDifficulty: 0.95,
    spawnWeight: 2,
    minPlayerLevel: 5,
    eligibleRegions: ['region_moonpool', 'region_nebula_lagoon'],
    minWeight: 5.0,
    maxWeight: 22.0,
    glowColor: '#ff2d78',
    secondaryColor: '#a855f7',
    modelType: 'prism_eternal',
    goldenChance: 0.02,
    shinyChance: 0.01,
    rainbowChance: 0.003,
    ancientChance: 0.0008
  }
];

export function rollVariant(creature: CelestialCreature): CreatureVariant {
  const roll = Math.random();
  if (roll < creature.ancientChance) return 'ancient';
  if (roll < creature.ancientChance + creature.rainbowChance) return 'rainbow';
  if (roll < creature.ancientChance + creature.rainbowChance + creature.shinyChance) return 'shiny';
  if (roll < creature.ancientChance + creature.rainbowChance + creature.shinyChance + creature.goldenChance) return 'golden';
  return 'normal';
}

export function rollWeight(creature: CelestialCreature, variant: CreatureVariant): number {
  const base = creature.minWeight + Math.random() * (creature.maxWeight - creature.minWeight);
  const mult = variant === 'ancient' ? 2.0 :
               variant === 'rainbow' ? 1.7 :
               variant === 'shiny' ? 1.4 :
               variant === 'golden' ? 1.25 : 1.0;
  return Number((base * mult).toFixed(2));
}

export function calculateStardustReward(creature: CelestialCreature, variant: CreatureVariant, weight: number): number {
  const variantMult = variant === 'ancient' ? 5.0 :
                      variant === 'rainbow' ? 3.5 :
                      variant === 'shiny' ? 2.5 :
                      variant === 'golden' ? 1.8 : 1.0;
  const weightBonus = 1.0 + (weight / Math.max(creature.maxWeight, 1)) * 0.3;
  return Math.round(creature.baseStardust * variantMult * weightBonus);
}

export function calculateExpReward(creature: CelestialCreature, variant: CreatureVariant): number {
  const variantMult = variant === 'ancient' ? 4.0 :
                      variant === 'rainbow' ? 3.0 :
                      variant === 'shiny' ? 2.0 :
                      variant === 'golden' ? 1.5 : 1.0;
  return Math.round(creature.baseExp * variantMult);
}
