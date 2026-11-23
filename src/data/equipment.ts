import { EquipmentData, EquipmentType, RodModelData, SaveData } from '../types/game';

export const EQUIPMENT: Record<EquipmentType, EquipmentData> = {
  rod: {
    type: 'rod',
    name: 'Starlight Caster Rod',
    description: 'A graceful cosmic rod forged from crystallized stardust. Extends your casting range into deep celestial pools.',
    maxLevel: 10,
    baseCost: 50,
    costMultiplier: 1.55,
    statName: 'Casting Distance',
    baseStat: 6.0,
    statPerLevel: 1.4,
    statUnit: 'm'
  },
  line: {
    type: 'line',
    name: 'Nebula Silk Line',
    description: 'Spun from interstellar nebulae. Broadens the reeling safe zone to secure elusive and heavy stars.',
    maxLevel: 10,
    baseCost: 45,
    costMultiplier: 1.5,
    statName: 'Safe Zone Width',
    baseStat: 22,
    statPerLevel: 2.2,
    statUnit: '%'
  },
  bait: {
    type: 'bait',
    name: 'Astral Krill Bait',
    description: 'Glows with irresistible celestial plankton. Lures living stars much faster and attracts rarer species.',
    maxLevel: 10,
    baseCost: 40,
    costMultiplier: 1.45,
    statName: 'Bite Speed Bonus',
    baseStat: 0,
    statPerLevel: 8,
    statUnit: '%'
  },
  bobber: {
    type: 'bobber',
    name: 'Nova Beacon Bobber',
    description: 'A luminous gravitational anchor that pulses when a bite occurs, extending your reaction window and line forgiveness.',
    maxLevel: 10,
    baseCost: 55,
    costMultiplier: 1.55,
    statName: 'Line Tension Hearts',
    baseStat: 3,
    statPerLevel: 0.34,
    statUnit: ' Misses'
  }
};

export const EQUIPMENT_VISUALS: Record<EquipmentType, { sprite: string; label: string; accentColor: string; bgGradient: string }> = {
  rod: {
    sprite: '/assets/gear/gear_rod.png',
    label: 'COSMIC CASTER',
    accentColor: '#38bdf8',
    bgGradient: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(15,23,42,0) 70%)'
  },
  line: {
    sprite: '/assets/gear/gear_line.png',
    label: 'NEBULA WEAVE',
    accentColor: '#c084fc',
    bgGradient: 'radial-gradient(circle, rgba(192,132,252,0.2) 0%, rgba(15,23,42,0) 70%)'
  },
  bait: {
    sprite: '/assets/gear/gear_bait.png',
    label: 'ASTRAL ESSENCE',
    accentColor: '#2dd4bf',
    bgGradient: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, rgba(15,23,42,0) 70%)'
  },
  bobber: {
    sprite: '/assets/gear/gear_bobber.png',
    label: 'NOVA BEACON',
    accentColor: '#fbbf24',
    bgGradient: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(15,23,42,0) 70%)'
  }
};

export const ROD_MODELS: Record<string, RodModelData> = {
  rod_starlight: {
    id: 'rod_starlight',
    name: 'Starlight Caster',
    title: 'Balanced Cosmic Rod',
    description: 'A graceful cosmic rod forged from crystallized stardust and silver meteor alloy. Balanced handling for celestial fishers.',
    cost: 0,
    rarity: 'common',
    spriteUrl: '/assets/gear/rod_starlight.png',
    lineColor: '#38bdf8',
    rodColor: '#cbd5e1',
    passiveTitle: 'Starlight Affinity',
    passiveDesc: '+10% All baseline stats & crystal clarity',
    bonusCastRangePct: 0.10,
    bonusSafeZonePct: 0.10,
  },
  rod_bamboo: {
    id: 'rod_bamboo',
    name: 'Moonlit Bamboo Pole',
    title: 'Zen Heritage Cane',
    description: 'Harvested from celestial bamboo groves nourished by lunar dew. Possesses ancient harmonic resonance and tranquility.',
    cost: 250,
    rarity: 'uncommon',
    spriteUrl: '/assets/gear/rod_bamboo.png',
    lineColor: '#86efac',
    rodColor: '#22c55e',
    passiveTitle: 'Lunar Harmony',
    passiveDesc: '+35% Player EXP gained from all catches & serene reeling',
    bonusExpPct: 0.35,
    bonusBiteSpeedPct: 0.15,
  },
  rod_nebula: {
    id: 'rod_nebula',
    name: 'Nebula Silk Threader',
    title: 'Interstellar Weaver',
    description: 'Woven with braided interstellar nebula dust. Vibrates at harmonic gravitational frequencies to steady the line.',
    cost: 600,
    rarity: 'rare',
    spriteUrl: '/assets/gear/rod_nebula.png',
    lineColor: '#c084fc',
    rodColor: '#a855f7',
    passiveTitle: 'Warp Tension',
    passiveDesc: '+35% Minigame Safe Zone width for effortlessly reeling elusive catches',
    bonusSafeZonePct: 0.35,
  },
  rod_abyssal: {
    id: 'rod_abyssal',
    name: 'Abyssal Titan Harvester',
    title: 'Deep Trench Relic',
    description: 'Forged from deep-sea volcanic obsidian with a bioluminescent azure lure that resonates into the deepest cosmic trenches.',
    cost: 1100,
    rarity: 'epic',
    spriteUrl: '/assets/gear/rod_abyssal.png',
    lineColor: '#06b6d4',
    rodColor: '#334155',
    passiveTitle: 'Leviathan Allure',
    passiveDesc: '+65% Higher chance to attract Rare, Epic, and Mythic celestial species',
    bonusRareWeightPct: 0.65,
    bonusCastRangePct: 0.20,
  },
  rod_solaris: {
    id: 'rod_solaris',
    name: 'Solaris Flare Caster',
    title: 'Sunburst Furnace Rod',
    description: 'Forged within the corona furnace of a newborn star. Glows with solar magnetism that distills raw stardust from the waters.',
    cost: 1800,
    rarity: 'legendary',
    spriteUrl: '/assets/gear/rod_solaris.png',
    lineColor: '#f97316',
    rodColor: '#f59e0b',
    passiveTitle: 'Solar Bounty',
    passiveDesc: '+40% Bonus Stardust earned on every catch & 20% faster bites',
    bonusStardustPct: 0.40,
    bonusBiteSpeedPct: 0.20,
  },
  rod_supernova: {
    id: 'rod_supernova',
    name: 'Supernova Pulsar Staff',
    title: 'Cosmic Singularity Staff',
    description: 'An ancient relic containing an orbiting micro-pulsar. Transcends spatial bounds to reach the farthest edges of the cosmos.',
    cost: 3000,
    rarity: 'mythic',
    spriteUrl: '/assets/gear/rod_supernova.png',
    lineColor: '#f43f5e',
    rodColor: '#ec4899',
    passiveTitle: 'Cosmic Singularity',
    passiveDesc: '+50% Max casting range, +1 extra Line Tension heart, +25% Stardust & EXP',
    bonusCastRangePct: 0.50,
    bonusTensionHearts: 1,
    bonusStardustPct: 0.25,
    bonusExpPct: 0.25,
  }
};

export function getUpgradeCost(type: EquipmentType, currentLevel: number): number {
  const data = EQUIPMENT[type];
  if (currentLevel >= data.maxLevel) return 0;
  return Math.round(data.baseCost * Math.pow(data.costMultiplier, currentLevel - 1));
}

export function getStatValue(type: EquipmentType, level: number): number {
  const data = EQUIPMENT[type];
  const val = data.baseStat + (level - 1) * data.statPerLevel;
  return Number(val.toFixed(1));
}

export function getEquippedRod(saveData: SaveData): RodModelData {
  const id = saveData.equippedRodId || 'rod_starlight';
  return ROD_MODELS[id] || ROD_MODELS.rod_starlight;
}
