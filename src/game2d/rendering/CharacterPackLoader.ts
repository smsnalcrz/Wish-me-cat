/**
 * CharacterPackLoader.ts
 * High-performance 2D Sprite Loader & Animator for Wish Me Cat.
 * Manages the WishMeCat_Pixel_Character_Pack sprite sheets and portraits
 * for all 4 feline breeds (Celestial, Calico, Kuro, Cloud).
 */

import { CatBreed } from '../../types/game';

export type CharacterAnimationName =
  | 'idle'
  | 'walk'
  | 'walk_up'
  | 'walk_down'
  | 'run'
  | 'run_up'
  | 'run_down'
  | 'sit'
  | 'sleep'
  | 'happy'
  | 'petting'
  | 'fishing'
  | 'fishing_reaction'
  | 'jump';

export type CharacterPortraitName = 'front' | 'side' | 'back' | 'icon';

export interface AnimationMeta {
  frameCount: number;
  fps: number;
  loop: boolean;
}

export const ANIMATION_METADATA: Record<CharacterAnimationName, AnimationMeta> = {
  idle: { frameCount: 8, fps: 8, loop: true },
  walk: { frameCount: 8, fps: 10, loop: true },
  walk_up: { frameCount: 8, fps: 10, loop: true },
  walk_down: { frameCount: 8, fps: 10, loop: true },
  run: { frameCount: 8, fps: 14, loop: true },
  run_up: { frameCount: 8, fps: 14, loop: true },
  run_down: { frameCount: 8, fps: 14, loop: true },
  sit: { frameCount: 6, fps: 8, loop: false },
  sleep: { frameCount: 8, fps: 6, loop: true },
  happy: { frameCount: 8, fps: 10, loop: true },
  petting: { frameCount: 8, fps: 8, loop: true },
  fishing: { frameCount: 8, fps: 8, loop: true },
  fishing_reaction: { frameCount: 8, fps: 12, loop: false },
  jump: { frameCount: 8, fps: 12, loop: false },
};

export class CharacterPackLoader {
  private static instance: CharacterPackLoader | null = null;

  // Cached HTMLImageElement instances
  // Key format: `${breed}_${animOrPortrait}`
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadedMap: Map<string, boolean> = new Map();

  public static getInstance(): CharacterPackLoader {
    if (!CharacterPackLoader.instance) {
      CharacterPackLoader.instance = new CharacterPackLoader();
    }
    return CharacterPackLoader.instance;
  }

  constructor() {
    this.preloadBreed('celestial');
  }

  // Preload all sheets and portraits for a breed
  public preloadBreed(breed: CatBreed): void {
    const anims: CharacterAnimationName[] = [
      'idle', 'walk', 'walk_up', 'walk_down', 'run', 'run_up', 'run_down',
      'sit', 'sleep', 'happy', 'petting', 'fishing', 'fishing_reaction', 'jump'
    ];
    for (const anim of anims) {
      this.getSpriteSheet(breed, anim);
    }

    const portraits: CharacterPortraitName[] = ['front', 'side', 'back', 'icon'];
    for (const portrait of portraits) {
      this.getPortrait(breed, portrait);
    }
  }

  // Retrieve or create HTMLImageElement for an animation sprite sheet
  public getSpriteSheet(breed: CatBreed, anim: CharacterAnimationName): HTMLImageElement {
    const key = `sheet_${breed}_${anim}`;
    let img = this.imageCache.get(key);
    if (!img) {
      img = new Image();
      img.src = `/assets/character/${breed}/SpriteSheets/${anim}.png`;
      img.onload = () => {
        this.loadedMap.set(key, true);
      };
      this.imageCache.set(key, img);
    }
    return img;
  }

  // Retrieve or create HTMLImageElement for a portrait
  public getPortrait(breed: CatBreed, portrait: CharacterPortraitName): HTMLImageElement {
    const key = `portrait_${breed}_${portrait}`;
    let img = this.imageCache.get(key);
    if (!img) {
      img = new Image();
      img.src = `/assets/character/${breed}/CharacterPortraits/${portrait}.png`;
      img.onload = () => {
        this.loadedMap.set(key, true);
      };
      this.imageCache.set(key, img);
    }
    return img;
  }

  public isLoaded(breed: CatBreed, anim: CharacterAnimationName): boolean {
    const key = `sheet_${breed}_${anim}`;
    const img = this.imageCache.get(key);
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  /**
   * Render an animation frame to a Canvas context.
   * Frame size in authoring grid: 128x128
   * Anchor point: (64, 108) px
   */
  public drawFrame(
    ctx: CanvasRenderingContext2D,
    breed: CatBreed,
    anim: CharacterAnimationName,
    frameIndex: number,
    destX: number,
    destY: number,
    destSize: number,
    flipX: boolean = false
  ): boolean {
    const img = this.getSpriteSheet(breed, anim);
    if (!img.complete || img.naturalWidth === 0) {
      return false; // Not loaded yet
    }

    const meta = ANIMATION_METADATA[anim] || { frameCount: 8 };
    const frameW = 128;
    const frameH = 128;
    const currentFrame = meta.loop
      ? Math.floor(frameIndex) % meta.frameCount
      : Math.min(Math.floor(frameIndex), meta.frameCount - 1);

    const srcX = currentFrame * frameW;
    const srcY = 0;

    // Anchor: Center pivot = 64/128, Ground baseline = 108/128
    const drawX = Math.round(destX - (64 / 128) * destSize);
    const drawY = Math.round(destY - (108 / 128) * destSize);

    ctx.save();
    ctx.imageSmoothingEnabled = false; // Crisp pixel art

    if (flipX) {
      ctx.translate(Math.round(destX), 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        srcX, srcY, frameW, frameH,
        Math.round(-(64 / 128) * destSize), drawY, destSize, destSize
      );
    } else {
      ctx.drawImage(
        img,
        srcX, srcY, frameW, frameH,
        drawX, drawY, destSize, destSize
      );
    }

    ctx.restore();
    return true;
  }

  /**
   * Draw directional portrait (front, side, back) centered on given baseline.
   */
  public drawPortrait(
    ctx: CanvasRenderingContext2D,
    breed: CatBreed,
    portrait: CharacterPortraitName,
    destX: number,
    destY: number,
    destSize: number,
    flipX: boolean = false
  ): boolean {
    const img = this.getPortrait(breed, portrait);
    if (!img.complete || img.naturalWidth === 0) {
      return false;
    }

    const frameW = 128;
    const frameH = 128;
    const drawX = Math.round(destX - (64 / 128) * destSize);
    const drawY = Math.round(destY - (108 / 128) * destSize);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(Math.round(destX), 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        0, 0, frameW, frameH,
        Math.round(-(64 / 128) * destSize), drawY, destSize, destSize
      );
    } else {
      ctx.drawImage(
        img,
        0, 0, frameW, frameH,
        drawX, drawY, destSize, destSize
      );
    }

    ctx.restore();
    return true;
  }
}
