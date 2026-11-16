import { EquipmentData, EquipmentType } from '../types/game';

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
