import { ConstellationData } from '../types/game';

export const CONSTELLATIONS: ConstellationData[] = [
  {
    id: 'const_felis_major',
    name: 'Felis Major (The Great Cosmic Cat)',
    lore: 'An ancient star constellation whose watchful feline eyes bless devoted cosmic anglers with boundless celestial fortune.',
    nodes: [
      {
        starId: 'node_01',
        requiredCreatureId: 'creature_flicker_star',
        label: 'Left Whisker Star',
        x: 25,
        y: 40
      },
      {
        starId: 'node_02',
        requiredCreatureId: 'creature_moonchip',
        label: 'Crown of the Cat',
        x: 50,
        y: 20
      },
      {
        starId: 'node_03',
        requiredCreatureId: 'creature_comet_koi',
        label: 'Right Whisker Star',
        x: 75,
        y: 40
      },
      {
        starId: 'node_04',
        requiredCreatureId: 'creature_nebula_jelly',
        label: 'Heart of the Nebula',
        x: 50,
        y: 65
      }
    ],
    stardustBonusPct: 20,
    rareBonusPct: 15,
    castingDistBonus: 2.0
  }
];
