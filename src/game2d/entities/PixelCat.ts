/**
 * PixelCat.ts
 * 2D Pixel-Art Cat mascot for Wish Me Cat.
 * Manages 4-way direction, sprite animations, movement physics, and fishing states.
 */

import { CatBreed } from '../../types/game';
import { CatSpriteSheet, generateCatSpriteSheet } from '../rendering/PixelSprites';
import { Camera2D } from '../core/Camera2D';

export type CatFacing = 'down' | 'up' | 'left' | 'right';
export type CatAnimState = 'idle' | 'walk' | 'fish_cast' | 'fish_wait' | 'fish_bite' | 'fish_reel' | 'celebrate';

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

  // Breed Spritesheet
  public breed: CatBreed = 'celestial';
  private spriteSheet: CatSpriteSheet;

  // Collision Box
  public radius: number = 12;

  constructor(breed: CatBreed = 'celestial', initialX: number = 0, initialY: number = 180) {
    this.breed = breed;
    this.x = initialX;
    this.y = initialY;
    this.spriteSheet = generateCatSpriteSheet(breed);
  }

  public setBreed(newBreed: CatBreed): void {
    if (this.breed !== newBreed) {
      this.breed = newBreed;
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
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else {
      this.facing = dy > 0 ? 'down' : 'up';
    }
  }

  public update(delta: number, moveVector: { dx: number; dy: number; isRunning: boolean }): void {
    const isMoving = Math.hypot(moveVector.dx, moveVector.dy) > 0.05;

    // Movement Physics
    if (isMoving && this.animState !== 'fish_cast' && this.animState !== 'fish_wait' && this.animState !== 'fish_bite' && this.animState !== 'celebrate') {
      const speed = moveVector.isRunning ? this.runSpeed : this.walkSpeed;
      this.vx = moveVector.dx * speed;
      this.vy = moveVector.dy * speed;

      this.x += this.vx * delta;
      this.y += this.vy * delta;

      // Update 4-way facing direction
      if (Math.abs(moveVector.dx) > Math.abs(moveVector.dy)) {
        this.facing = moveVector.dx > 0 ? 'right' : 'left';
      } else {
        this.facing = moveVector.dy > 0 ? 'down' : 'up';
      }

      this.animState = 'walk';
    } else {
      this.vx = 0;
      this.vy = 0;
      if (this.animState === 'walk') {
        this.animState = 'idle';
      }
    }

    // Advance Animation Timer
    this.animTimer += delta;
    const frameRate = this.animState === 'walk' ? 0.15 : 0.45;
    if (this.animTimer >= frameRate) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  // Get current fishing rod tip coordinate in world space for line attachment
  public getRodTipWorldPos(): { x: number; y: number } {
    let offsetX = 0;
    let offsetY = -8;

    if (this.facing === 'up') {
      offsetX = 6;
      offsetY = -18;
    } else if (this.facing === 'down') {
      offsetX = 6;
      offsetY = 12;
    } else if (this.facing === 'right') {
      offsetX = 16;
      offsetY = -6;
    } else if (this.facing === 'left') {
      offsetX = -16;
      offsetY = -6;
    }

    return { x: this.x + offsetX, y: this.y + offsetY };
  }

  // Render Cat with Pixel-Art Shadow and Sprite
  public render(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    const screen = camera.worldToScreen(this.x, this.y);
    const scale = camera.zoom;

    // 1. Cozy Drop Shadow Underneath
    ctx.save();
    ctx.fillStyle = 'rgba(10, 8, 25, 0.4)';
    ctx.beginPath();
    ctx.ellipse(screen.x, screen.y + 7 * scale, 10 * scale, 4.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Determine Sprite to Draw
    let sprite: HTMLCanvasElement;
    let flipX = false;

    if (this.animState === 'fish_cast' || this.animState === 'fish_bite') {
      sprite = this.spriteSheet.fishCast;
      if (this.facing === 'left') flipX = true;
    } else if (this.animState === 'fish_wait' || this.animState === 'fish_reel') {
      sprite = this.animState === 'fish_reel' ? this.spriteSheet.fishReel[this.animFrame] : this.spriteSheet.fishWait;
      if (this.facing === 'left') flipX = true;
    } else if (this.animState === 'celebrate') {
      sprite = this.spriteSheet.celebrate;
    } else if (this.animState === 'walk') {
      if (this.facing === 'down') sprite = this.spriteSheet.walkDown[this.animFrame];
      else if (this.facing === 'up') sprite = this.spriteSheet.walkUp[this.animFrame];
      else {
        sprite = this.spriteSheet.walkSide[this.animFrame];
        if (this.facing === 'left') flipX = true;
      }
    } else {
      // Idle
      if (this.facing === 'down') sprite = this.spriteSheet.idleDown;
      else if (this.facing === 'up') sprite = this.spriteSheet.idleUp;
      else {
        sprite = this.spriteSheet.idleSide;
        if (this.facing === 'left') flipX = true;
      }
    }

    // 3. Draw Cat Sprite (centered on screen position)
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

    // 4. Bite Reaction Exclamation Mark (!) (Pixel Bubble)
    if (this.animState === 'fish_bite') {
      ctx.save();
      const jumpY = Math.sin(performance.now() * 0.02) * 4 * scale;
      const bubbleX = screen.x;
      const bubbleY = drawY - 14 * scale + jumpY;

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
}
