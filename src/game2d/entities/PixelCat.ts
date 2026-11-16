/**
 * PixelCat.ts
 * 2D Pixel-Art Cat mascot for Wish Me Cat.
 * Manages 4-way direction, high-definition character pack animations,
 * movement physics, and fishing states for all 4 feline breeds.
 */

import { CatBreed } from '../../types/game';
import { CatSpriteSheet, generateCatSpriteSheet } from '../rendering/PixelSprites';
import { CharacterPackLoader, CharacterAnimationName, ANIMATION_METADATA } from '../rendering/CharacterPackLoader';
import { Camera2D } from '../core/Camera2D';

export type CatFacing = 'down' | 'up' | 'left' | 'right';
export type CatAnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'fish_cast'
  | 'fish_wait'
  | 'fish_bite'
  | 'fish_reel'
  | 'celebrate'
  | 'sit'
  | 'sleep';

export class PixelCat {
  public x: number = 0;
  public y: number = 180; // Spawn near south pier
  public vx: number = 0;
  public vy: number = 0;

  // Speeds
  public walkSpeed: number = 110; // pixels per second
  public runSpeed: number = 185;

  // Direction & Animation
  public facing: CatFacing = 'up';
  public animState: CatAnimState = 'idle';
  private animTimer: number = 0;
  private animFrame: number = 0;

  // Character Pack Loader
  private loader: CharacterPackLoader;

  // Breed Spritesheet
  public breed: CatBreed = 'celestial';
  private spriteSheet: CatSpriteSheet;

  // Collision Box
  public radius: number = 12;

  constructor(breed: CatBreed = 'celestial', initialX: number = 0, initialY: number = 180) {
    this.breed = breed;
    this.x = initialX;
    this.y = initialY;
    this.loader = CharacterPackLoader.getInstance();
    this.loader.preloadBreed(breed);
    this.spriteSheet = generateCatSpriteSheet(breed);
  }

  public setBreed(newBreed: CatBreed): void {
    if (this.breed !== newBreed) {
      this.breed = newBreed;
      this.loader.preloadBreed(newBreed);
      this.spriteSheet = generateCatSpriteSheet(newBreed);
    }
  }

  public setAnimState(state: CatAnimState): void {
    if (this.animState !== state) {
      this.animState = state;
      this.animTimer = 0;
      this.animFrame = 0;
    }
  }

  public facePoint(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx > 0.05 && absDx >= absDy * 0.7) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }
  }

  public update(delta: number, moveVector: { dx: number; dy: number; isRunning: boolean }): void {
    const isMoving = Math.hypot(moveVector.dx, moveVector.dy) > 0.05;

    // Movement Physics
    const isFishingOrCelebrating =
      this.animState === 'fish_cast' ||
      this.animState === 'fish_wait' ||
      this.animState === 'fish_bite' ||
      this.animState === 'fish_reel' ||
      this.animState === 'celebrate';

    if (isMoving && !isFishingOrCelebrating) {
      const speed = moveVector.isRunning ? this.runSpeed : this.walkSpeed;
      this.vx = moveVector.dx * speed;
      this.vy = moveVector.dy * speed;

      this.x += this.vx * delta;
      this.y += this.vy * delta;

      // Update 4-way facing direction:
      // Diagonals (W+A, W+D, S+A, S+D) and pure horizontals (A, D) prioritize left/right facing
      // so the character strides forward in its horizontal direction of travel, eliminating moonwalking.
      // Pure or dominant vertical movement (W, S) faces 'up' or 'down'.
      const absDx = Math.abs(moveVector.dx);
      const absDy = Math.abs(moveVector.dy);

      if (absDx > 0.05 && absDx >= absDy * 0.7) {
        this.facing = moveVector.dx > 0 ? 'right' : 'left';
      } else if (absDy > 0.05) {
        this.facing = moveVector.dy > 0 ? 'down' : 'up';
      }

      this.animState = moveVector.isRunning ? 'run' : 'walk';
    } else {
      this.vx = 0;
      this.vy = 0;
      if (this.animState === 'walk' || this.animState === 'run') {
        this.animState = 'idle';
      }
    }

    // Determine target animation metadata for frame timing
    const packAnim = this.getPackAnimationName();
    const meta = ANIMATION_METADATA[packAnim] || { frameCount: 8, fps: 8, loop: true };

    this.animTimer += delta;
    const frameDuration = 1 / meta.fps;
    if (this.animTimer >= frameDuration) {
      this.animTimer -= frameDuration;
      if (meta.loop) {
        this.animFrame = (this.animFrame + 1) % meta.frameCount;
      } else {
        this.animFrame = Math.min(this.animFrame + 1, meta.frameCount - 1);
      }
    }
  }

  // Map internal game state to character pack animation sheet
  private getPackAnimationName(): CharacterAnimationName {
    switch (this.animState) {
      case 'walk':
        if (this.facing === 'up') return 'walk_up';
        if (this.facing === 'down') return 'walk_down';
        return 'walk';
      case 'run':
        if (this.facing === 'up') return 'run_up';
        if (this.facing === 'down') return 'run_down';
        return 'run';
      case 'fish_cast':
      case 'fish_wait':
      case 'fish_reel':
        return 'fishing';
      case 'fish_bite':
        return 'fishing_reaction';
      case 'celebrate':
        return 'happy';
      case 'sit':
        return 'sit';
      case 'sleep':
        return 'sleep';
      case 'idle':
      default:
        return 'idle';
    }
  }

  // Get current fishing rod tip coordinate in world space for line attachment
  public getRodTipWorldPos(): { x: number; y: number } {
    const isFlipped = this.facing === 'left';
    // Anchored to the exact wooden rod tip in fishing.png & fishing_reaction.png
    const offsetX = isFlipped ? -17 : 17;
    const offsetY = -23;
    return { x: this.x + offsetX, y: this.y + offsetY };
  }

  // Render Cat with Pixel-Art Shadow and Character Pack Sprite
  public render(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    const screen = camera.worldToScreen(this.x, this.y);
    const scale = camera.zoom;

    // 1. Cozy Drop Shadow Underneath Paws
    ctx.save();
    ctx.fillStyle = 'rgba(10, 8, 25, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screen.x, screen.y, 14 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Render High-Definition Character Pack Sprite
    const destSize = 44 * scale;
    const flipX = this.facing === 'left';
    const packAnim = this.getPackAnimationName();

    let drawn = false;

    // For stationary idle facing directly up, draw the back portrait
    if (this.animState === 'idle' && this.facing === 'up') {
      drawn = this.loader.drawPortrait(ctx, this.breed, 'back', screen.x, screen.y, destSize);
    } else {
      drawn = this.loader.drawFrame(
        ctx,
        this.breed,
        packAnim,
        this.animFrame,
        screen.x,
        screen.y,
        destSize,
        flipX
      );
    }

    // 3. Fallback to procedural sprite if image asset is not yet loaded
    if (!drawn) {
      this.renderFallbackSprite(ctx, screen, scale, flipX);
    }

    // 4. Bite Reaction Exclamation Mark (!) (Pixel Bubble)
    if (this.animState === 'fish_bite') {
      ctx.save();
      const jumpY = Math.sin(performance.now() * 0.02) * 4 * scale;
      const bubbleX = screen.x;
      const bubbleY = screen.y - 38 * scale + jumpY;

      // Pixel Bubble Box
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bubbleX - 8 * scale, bubbleY - 8 * scale, 16 * scale, 16 * scale);
      ctx.fillStyle = '#ffffff';
      ctx.strokeRect(bubbleX - 8 * scale, bubbleY - 8 * scale, 16 * scale, 16 * scale);

      ctx.font = `bold ${Math.max(10, Math.floor(10 * scale))}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', bubbleX, bubbleY);
      ctx.restore();
    }
  }

  // Graceful fallback to procedural canvas matrix
  private renderFallbackSprite(
    ctx: CanvasRenderingContext2D,
    screen: { x: number; y: number },
    scale: number,
    flipX: boolean
  ): void {
    let sprite: HTMLCanvasElement;
    if (this.animState === 'fish_cast' || this.animState === 'fish_bite') {
      sprite = this.spriteSheet.fishCast;
    } else if (this.animState === 'fish_wait' || this.animState === 'fish_reel') {
      sprite = this.animState === 'fish_reel' ? this.spriteSheet.fishReel[this.animFrame % 2] : this.spriteSheet.fishWait;
    } else if (this.animState === 'celebrate') {
      sprite = this.spriteSheet.celebrate;
    } else if (this.animState === 'walk' || this.animState === 'run') {
      if (this.facing === 'down') sprite = this.spriteSheet.walkDown[this.animFrame % 2];
      else if (this.facing === 'up') sprite = this.spriteSheet.walkUp[this.animFrame % 2];
      else sprite = this.spriteSheet.walkSide[this.animFrame % 2];
    } else {
      if (this.facing === 'down') sprite = this.spriteSheet.idleDown;
      else if (this.facing === 'up') sprite = this.spriteSheet.idleUp;
      else sprite = this.spriteSheet.idleSide;
    }

    const drawW = 24 * scale;
    const drawH = 24 * scale;
    const drawX = Math.round(screen.x - drawW / 2);
    const drawY = Math.round(screen.y - drawH + 8 * scale);

    ctx.save();
    if (flipX) {
      ctx.translate(drawX + drawW, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0, drawW, drawH);
    } else {
      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    }
    ctx.restore();
  }
}
