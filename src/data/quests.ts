import { QuestData } from '../types/game';

export const QUESTS: QuestData[] = [
  {
    id: 'quest_01',
    title: 'First Celestial Catch',
    description: 'Catch 3 Flicker Stars from the cosmic galaxy pool.',
    type: 'catch_count',
    targetParam: 'creature_flicker_star',
    targetCount: 3,
    rewardStardust: 100,
    rewardExp: 50
  },
  {
    id: 'quest_02',
    title: 'Lunar Harvest',
    description: 'Catch 2 Uncommon or higher celestial creatures.',
    type: 'catch_rarity',
    targetParam: 'uncommon',
    targetCount: 2,
    rewardStardust: 150,
    rewardExp: 80
  },
  {
    id: 'quest_03',
    title: 'Cosmic Wealth',
    description: 'Gather 200 Stardust from your fishing catches.',
    type: 'earn_stardust',
    targetParam: '',
    targetCount: 200,
    rewardStardust: 120,
    rewardExp: 90
  },
  {
    id: 'quest_04',
    title: 'Master Angler Tools',
    description: 'Upgrade any piece of your fishing equipment at the Shop.',
    type: 'upgrade_gear',
    targetParam: '',
    targetCount: 1,
    rewardStardust: 140,
    rewardExp: 100
  },
  {
    id: 'quest_05',
    title: 'Star Cartographer',
    description: 'Discover 3 different celestial species in your Star Almanac.',
    type: 'discover_species',
    targetParam: '',
    targetCount: 3,
    rewardStardust: 250,
    rewardExp: 180
  }
];
