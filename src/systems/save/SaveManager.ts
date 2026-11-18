import { SaveData, CreatureVariant } from '../../types/game';

const SAVE_KEY = 'purrseids_save_data';
const CURRENT_VERSION = 1;

export const DEFAULT_SAVE: SaveData = {
  version: CURRENT_VERSION,
  lastSaved: new Date().toISOString(),
  playerLevel: 1,
  playerExp: 0,
  stardust: 100, // cozy starter gift!
  rodLevel: 1,
  lineLevel: 1,
  baitLevel: 1,
  bobberLevel: 1,
  currentRegionId: 'region_moonpool',
  unlockedRegionIds: ['region_moonpool'],
  discoveredCreatureIds: [],
  catchRecords: {},
  completedQuestIds: [],
  claimedQuestIds: [],
  questProgress: {},
  completedConstellationIds: [],
  masterVolume: 1.0,
  bgmVolume: 0.7,
  sfxVolume: 0.9,
  cameraSensitivity: 1.5,
  catBreed: 'celestial',
  bgmTrack: 'space_sprinkles',
  wishTokens: 3, // 3 starter wishes!
  totalWishesMade: 0,
  activeBlessings: [],
  unlockedAccessories: ['charm_starlight_bell'],
  equippedAccessories: {
    charm: 'charm_starlight_bell'
  }
};

export class SaveManager {
  private static data: SaveData = { ...DEFAULT_SAVE };

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.playerLevel === 'number') {
          this.data = {
            ...DEFAULT_SAVE,
            ...parsed,
            wishTokens: typeof parsed.wishTokens === 'number' ? parsed.wishTokens : 3,
            totalWishesMade: parsed.totalWishesMade || 0,
            activeBlessings: Array.isArray(parsed.activeBlessings) ? parsed.activeBlessings : [],
            unlockedAccessories: Array.isArray(parsed.unlockedAccessories) ? parsed.unlockedAccessories : ['charm_starlight_bell'],
            equippedAccessories: parsed.equippedAccessories || { charm: 'charm_starlight_bell' }
          };
          return this.data;
        }
      }
    } catch (e) {
      console.warn('[SaveManager] Failed to read save from localStorage, using default:', e);
    }
    this.data = { ...DEFAULT_SAVE };
    this.save();
    return this.data;
  }

  public static getData(): SaveData {
    return this.data;
  }

  public static save(patch?: Partial<SaveData>): void {
    if (patch) {
      this.data = { ...this.data, ...patch };
    }
    this.data.lastSaved = new Date().toISOString();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[SaveManager] Failed to write to localStorage:', e);
    }
  }

  public static reset(): SaveData {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error(e);
    }
    this.data = { ...DEFAULT_SAVE };
    this.save();
    return this.data;
  }

  public static recordCatch(creatureId: string, variant: CreatureVariant, weight: number): { isNewDiscovery: boolean; isNewRecord: boolean } {
    let isNewDiscovery = false;
    let isNewRecord = false;

    if (!this.data.discoveredCreatureIds.includes(creatureId)) {
      this.data.discoveredCreatureIds.push(creatureId);
      isNewDiscovery = true;
    }

    const currentRecord = this.data.catchRecords[creatureId] || { count: 0, maxWeight: 0, variants: [] };
    currentRecord.count += 1;
    if (weight > currentRecord.maxWeight) {
      currentRecord.maxWeight = weight;
      isNewRecord = true;
    }
    if (!currentRecord.variants.includes(variant)) {
      currentRecord.variants.push(variant);
    }

    this.data.catchRecords[creatureId] = currentRecord;
    this.save();

    return { isNewDiscovery, isNewRecord };
  }
}
