/**
 * WishManager.ts
 * Celestial Wishing Well & Blessings Controller for Wish Me Cat.
 * Manages cosmic gacha wishes, timed celestial blessings, and collectible cat wardrobe accessories.
 */

import {
  SaveData,
  ActiveBlessing,
  BlessingType,
  CatAccessory,
  CatAccessoryType,
  WishReward,
  CreatureRarity
} from '../../types/game';
import { SaveManager } from '../save/SaveManager';
import { AudioManager } from '../audio/AudioManager';

export const CAT_ACCESSORIES: Record<string, CatAccessory> = {
  // HATS
  hat_straw_fisherman: {
    id: 'hat_straw_fisherman',
    name: 'Straw Fisherman Hat',
    description: 'A breezy woven hat smelling of morning dew and lake reeds.',
    type: 'hat',
    icon: '🌾',
    rarity: 'uncommon',
    bonusDescription: '+15% Stardust from common catches'
  },
  hat_star_beret: {
    id: 'hat_star_beret',
    name: 'Starry Night Beret',
    description: 'A velvet navy beret adorned with a miniature glowing star.',
    type: 'hat',
    icon: '✨',
    rarity: 'rare',
    bonusDescription: '+20% Player EXP gain from all catches'
  },
  hat_wizard_hood: {
    id: 'hat_wizard_hood',
    name: 'Cosmic Wizard Hood',
    description: 'Pointed cowl woven from nebula fibers. Whispers cosmic secrets.',
    type: 'hat',
    icon: '🔮',
    rarity: 'epic',
    bonusDescription: '+0.4s bite reaction anticipation window'
  },
  hat_cosmic_crown: {
    id: 'hat_cosmic_crown',
    name: 'Crown of the Supernova',
    description: 'A radiant coronal diadem forged from stellar flares.',
    type: 'hat',
    icon: '👑',
    rarity: 'legendary',
    bonusDescription: '+35% attraction chance for rare and epic species'
  },

  // CAPES
  cape_aurora_mantle: {
    id: 'cape_aurora_mantle',
    name: 'Aurora Silk Mantle',
    description: 'Flowing silk shimmering with gentle emerald and cyan light waves.',
    type: 'cape',
    icon: '🧣',
    rarity: 'rare',
    bonusDescription: 'Leaves a subtle luminous trail while walking'
  },
  cape_nebula_cloak: {
    id: 'cape_nebula_cloak',
    name: 'Drifting Nebula Cloak',
    description: 'Deep violet mantle containing a cluster of tiny spiraling galaxies.',
    type: 'cape',
    icon: '🌌',
    rarity: 'epic',
    bonusDescription: '+15% reeling safe zone stability'
  },
  cape_comet_tail: {
    id: 'cape_comet_tail',
    name: 'Comet Stardust Scarf',
    description: 'Fluffy celestial scarf that billows with glowing stardust sparks.',
    type: 'cape',
    icon: '🌠',
    rarity: 'legendary',
    bonusDescription: '+25% Cat movement sprint speed'
  },

  // CHARMS
  charm_starlight_bell: {
    id: 'charm_starlight_bell',
    name: 'Starlight Brass Bell',
    description: 'A warm golden bell that jingles softly with every step.',
    type: 'charm',
    icon: '🔔',
    rarity: 'common',
    bonusDescription: 'Pleasant harmonic jingle on movement'
  },
  charm_lunar_pearl: {
    id: 'charm_lunar_pearl',
    name: 'Luminescent Moon Pearl',
    description: 'A soothing pearl harvested from the reflections of the Moonpool.',
    type: 'charm',
    icon: '⚪',
    rarity: 'rare',
    bonusDescription: '+1 extra tension miss allowed during reeling'
  },
  charm_solar_amulet: {
    id: 'charm_solar_amulet',
    name: 'Solaris Sun Amulet',
    description: 'An ancient medallion radiating endless warmth and optimism.',
    type: 'charm',
    icon: '☀️',
    rarity: 'legendary',
    bonusDescription: '+25% wider minigame safe zone'
  }
};

export const CELESTIAL_BLESSINGS: Record<BlessingType, { name: string; description: string; icon: string; durationMinutes: number }> = {
  starfall_abundance: {
    name: 'Starfall Abundance',
    description: '2x Stardust earned from all celestial catches.',
    icon: '⭐',
    durationMinutes: 5
  },
  celestial_clarity: {
    name: 'Celestial Clarity',
    description: '+50% wider reeling safe zone and reduced cursor speed.',
    icon: '👁️',
    durationMinutes: 5
  },
  abyssal_magnet: {
    name: 'Abyssal Magnet',
    description: '+60% chance to attract rare, epic, and mythic fish.',
    icon: '🧲',
    durationMinutes: 5
  },
  swift_paws: {
    name: 'Swift Paws',
    description: '+30% movement speed and instant bite attraction.',
    icon: '🐾',
    durationMinutes: 5
  },
  aurora_fortune: {
    name: 'Aurora Fortune',
    description: '3x higher chance of Shiny, Golden, and Rainbow variants.',
    icon: '🌈',
    durationMinutes: 5
  }
};

export class WishManager {
  public static SINGLE_WISH_STARDUST = 75;
  public static TENFOLD_WISH_STARDUST = 650;

  // Prune expired blessings and save
  public static getActiveBlessings(): ActiveBlessing[] {
    const data = SaveManager.getData();
    const now = Date.now();
    const valid = (data.activeBlessings || []).filter(b => b.expiresAt > now);
    if (valid.length !== (data.activeBlessings || []).length) {
      data.activeBlessings = valid;
      SaveManager.save(data);
    }
    return valid;
  }

  public static hasBlessing(type: BlessingType): boolean {
    const blessings = this.getActiveBlessings();
    return blessings.some(b => b.id === type);
  }

  // Grant a blessing to player
  public static grantBlessing(type: BlessingType): ActiveBlessing {
    const meta = CELESTIAL_BLESSINGS[type];
    const durationMs = meta.durationMinutes * 60 * 1000;
    const expiresAt = Date.now() + durationMs;

    const data = SaveManager.getData();
    data.activeBlessings = data.activeBlessings || [];

    // Replace if already present
    data.activeBlessings = data.activeBlessings.filter(b => b.id !== type);

    const blessing: ActiveBlessing = {
      id: type,
      name: meta.name,
      description: meta.description,
      icon: meta.icon,
      durationSeconds: meta.durationMinutes * 60,
      expiresAt
    };

    data.activeBlessings.push(blessing);
    SaveManager.save(data);
    return blessing;
  }

  // Perform a single wish
  public static performWish(useTokens: boolean): { reward: WishReward; error?: string } {
    const data = SaveManager.getData();

    if (useTokens) {
      if ((data.wishTokens || 0) < 1) {
        return { reward: null as any, error: 'Not enough Wish Tokens! Catch celestial fish or complete quests to earn more.' };
      }
      data.wishTokens -= 1;
    } else {
      if (data.stardust < this.SINGLE_WISH_STARDUST) {
        return { reward: null as any, error: `Need at least ${this.SINGLE_WISH_STARDUST} Stardust to make a Star Wish!` };
      }
      data.stardust -= this.SINGLE_WISH_STARDUST;
    }

    data.totalWishesMade = (data.totalWishesMade || 0) + 1;
    SaveManager.save(data);

    const reward = this.rollReward(data);
    this.applyReward(reward);

    return { reward };
  }

  // Perform a tenfold wish
  public static performTenfoldWish(useTokens: boolean): { rewards: WishReward[]; error?: string } {
    const data = SaveManager.getData();

    if (useTokens) {
      if ((data.wishTokens || 0) < 10) {
        return { rewards: [], error: 'Need 10 Wish Tokens for a Tenfold Constellation Wish!' };
      }
      data.wishTokens -= 10;
    } else {
      if (data.stardust < this.TENFOLD_WISH_STARDUST) {
        return { rewards: [], error: `Need ${this.TENFOLD_WISH_STARDUST} Stardust for a Tenfold Wish!` };
      }
      data.stardust -= this.TENFOLD_WISH_STARDUST;
    }

    data.totalWishesMade = (data.totalWishesMade || 0) + 10;
    SaveManager.save(data);

    const rewards: WishReward[] = [];
    for (let i = 0; i < 10; i++) {
      const reward = this.rollReward(data, i === 9); // Guarantee at least rare+ on 10th
      this.applyReward(reward);
      rewards.push(reward);
    }

    return { rewards };
  }

  private static rollReward(data: SaveData, forceRarePlus: boolean = false): WishReward {
    const rand = Math.random();
    const unlocked = new Set(data.unlockedAccessories || []);

    // Check unowned accessories
    const unownedAccessories = Object.values(CAT_ACCESSORIES).filter(a => !unlocked.has(a.id));

    // Rarity rolls
    // 5% Legendary, 15% Epic, 30% Rare, 35% Uncommon, 15% Common
    let targetRarity: CreatureRarity = 'uncommon';
    if (forceRarePlus || rand < 0.05) {
      targetRarity = rand < 0.05 ? 'legendary' : (rand < 0.20 ? 'epic' : 'rare');
    } else if (rand < 0.20) {
      targetRarity = 'epic';
    } else if (rand < 0.50) {
      targetRarity = 'rare';
    } else if (rand < 0.85) {
      targetRarity = 'uncommon';
    } else {
      targetRarity = 'common';
    }

    // Try to grant an unowned accessory of target rarity
    const matchingAcc = unownedAccessories.filter(a => a.rarity === targetRarity);
    if (matchingAcc.length > 0) {
      const chosen = matchingAcc[Math.floor(Math.random() * matchingAcc.length)];
      return {
        id: `reward_acc_${chosen.id}`,
        name: chosen.name,
        description: chosen.description,
        rarity: chosen.rarity,
        type: 'accessory',
        accessory: chosen
      };
    }

    // Otherwise, grant a powerful Celestial Blessing!
    const blessingKeys: BlessingType[] = ['starfall_abundance', 'celestial_clarity', 'abyssal_magnet', 'swift_paws', 'aurora_fortune'];
    const chosenBlessingKey = blessingKeys[Math.floor(Math.random() * blessingKeys.length)];
    const blessingMeta = CELESTIAL_BLESSINGS[chosenBlessingKey];

    if (Math.random() < 0.65) {
      return {
        id: `reward_blessing_${chosenBlessingKey}`,
        name: blessingMeta.name,
        description: blessingMeta.description,
        rarity: targetRarity,
        type: 'blessing',
        blessing: {
          id: chosenBlessingKey,
          name: blessingMeta.name,
          description: blessingMeta.description,
          icon: blessingMeta.icon,
          durationSeconds: blessingMeta.durationMinutes * 60,
          expiresAt: Date.now() + blessingMeta.durationMinutes * 60 * 1000
        }
      };
    }

    // Or a Stardust Jackpot!
    const jackpotAmounts = {
      legendary: 1200,
      epic: 600,
      rare: 300,
      uncommon: 150,
      common: 100
    };
    const amt = jackpotAmounts[targetRarity] || 150;

    return {
      id: `reward_jackpot_${Date.now()}`,
      name: `Supernova Jackpot (${amt} Stardust)`,
      description: `A burst of cosmic energy showering you with ${amt} Stardust!`,
      rarity: targetRarity,
      type: 'stardust_jackpot',
      stardustAmount: amt
    };
  }

  private static applyReward(reward: WishReward): void {
    const data = SaveManager.getData();

    if (reward.type === 'accessory' && reward.accessory) {
      if (!data.unlockedAccessories.includes(reward.accessory.id)) {
        data.unlockedAccessories.push(reward.accessory.id);
      }
    } else if (reward.type === 'blessing' && reward.blessing) {
      this.grantBlessing(reward.blessing.id);
      return; // grantBlessing already saves
    } else if (reward.type === 'stardust_jackpot' && reward.stardustAmount) {
      data.stardust += reward.stardustAmount;
    }

    SaveManager.save(data);
  }

  public static equipAccessory(type: CatAccessoryType, id: string): void {
    const data = SaveManager.getData();
    data.equippedAccessories = data.equippedAccessories || {};
    data.equippedAccessories[type] = id;
    SaveManager.save(data);
  }

  public static unequipAccessory(type: CatAccessoryType): void {
    const data = SaveManager.getData();
    if (data.equippedAccessories) {
      delete data.equippedAccessories[type];
      SaveManager.save(data);
    }
  }
}
