/**
 * PixelCat.ts
 * 2D Pixel-Art Cat mascot for Wish Me Cat.
 * Manages 4-way direction, high-definition character pack animations,
 * movement physics, and fishing states for all 4 feline breeds.
 */

import { CatBreed } from '../../types/game';
import {
  CatSpriteSheet,
  generateCatSpriteSheet,
  generateAccessorySprite,
  generateHeartParticleSprite,
  generateZzzBubbleSprite
} from '../rendering/PixelSprites';
import { CharacterPackLoader, CharacterAnimationName, ANIMATION_METADATA } from '../rendering/CharacterPackLoader';
import { Camera2D } from '../core/Camera2D';
import { SaveManager } from '../../systems/save/SaveManager';
import { WishManager } from '../../systems/wishing/WishManager';
import { AudioManager } from '../../systems/audio/AudioManager';
import { getEquippedRod } from '../../data/equipment';

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

export interface CatEffectParticle {
  type: 'zzz' | 'heart' | 'aurora';
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

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

  // Living Cat Behaviors & Particle Systems
  private idleNapTimer: number = 0;
  private purrTimer: number = 0;
  private zzzTimer: number = 0;
  private trailTimer: number = 0;
  private particles: CatEffectParticle[] = [];

  // Accessory Canvas Caches
  private accessoryCache: Map<string, HTMLCanvasElement> = new Map();
  private heartSprite: HTMLCanvasElement | null = null;
  private zzzSprite: HTMLCanvasElement | null = null;

  // Character Pack Loader
  private loader: CharacterPackLoader;

  // Breed Spritesheet
  public breed: CatBreed = 'celestial';
  private spriteSheet: CatSpriteSheet;

  // Collision Box
  public radius: number = 12;

  private currentRodColor?: string;

  constructor(breed: CatBreed = 'celestial', initialX: number = 0, initialY: number = 180, rodColor?: string) {
    this.breed = breed;
    this.currentRodColor = rodColor;
    this.x = initialX;
    this.y = initialY;
    this.loader = CharacterPackLoader.getInstance();
    this.loader.preloadBreed(breed);
    this.spriteSheet = generateCatSpriteSheet(breed, rodColor);
  }

  // Pre-cached procedural accessory generator
  private getAccessorySprite(id: string): HTMLCanvasElement {
    let sprite = this.accessoryCache.get(id);
    if (!sprite) {
      sprite = generateAccessorySprite(id);
      this.accessoryCache.set(id, sprite);
    }
    return sprite;
  }

  // Pet / cuddle interaction reaction
  public triggerPet(): void {
    this.idleNapTimer = 0;
    this.purrTimer = 1.8;
    this.setAnimState('celebrate');
    AudioManager.getInstance().playPurr();

    // Spawn 4 floating love hearts around cat
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'heart',
        x: this.x + (Math.random() - 0.5) * 18,
        y: this.y - 12 - Math.random() * 8,
        vx: (Math.random() - 0.5) * 16,
        vy: -18 - Math.random() * 12,
        alpha: 1.0,
        life: 0,
        maxLife: 1.6 + Math.random() * 0.4,
        scale: 0.9 + Math.random() * 0.3
      });
    }
  }

  public setBreed(newBreed: CatBreed, rodColor?: string): void {
    this.breed = newBreed;
    if (rodColor !== undefined) this.currentRodColor = rodColor;
    this.loader.preloadBreed(newBreed);
    this.spriteSheet = generateCatSpriteSheet(newBreed, this.currentRodColor);
  }

  public setEquippedRodColor(rodColor: string): void {
    if (this.currentRodColor !== rodColor) {
      this.currentRodColor = rodColor;
      this.spriteSheet = generateCatSpriteSheet(this.breed, rodColor);
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
    const inputMagnitude = Math.hypot(moveVector.dx, moveVector.dy);
    const isInputActive = inputMagnitude > 0.05;

    // Movement Physics
    const isFishingOrCelebrating =
      this.animState === 'fish_cast' ||
      this.animState === 'fish_wait' ||
      this.animState === 'fish_bite' ||
      this.animState === 'fish_reel' ||
      this.animState === 'celebrate';

    let targetVx = 0;
    let targetVy = 0;

    const curSave = SaveManager.getData();
    let speedMult = 1.0;
    if (curSave.equippedAccessories?.cape === 'cape_comet_tail') {
      speedMult += 0.25;
    }
    if (WishManager.hasBlessing('swift_paws')) {
      speedMult += 0.30;
    }

    if (isInputActive && !isFishingOrCelebrating) {
      this.idleNapTimer = 0;
      if (this.animState === 'sleep') {
        this.setAnimState('idle');
      }

      // Aurora mantle particles trail
      if (curSave.equippedAccessories?.cape === 'cape_aurora_mantle') {
        this.trailTimer += delta;
        if (this.trailTimer >= 0.12) {
          this.trailTimer = 0;
          this.particles.push({
            type: 'aurora',
            x: this.x + (Math.random() - 0.5) * 8,
            y: this.y + (Math.random() - 0.5) * 4,
            vx: 0,
            vy: -4,
            alpha: 0.8,
            life: 0,
            maxLife: 0.6,
            scale: 1
          });
        }
      }

      // Normalize diagonal vectors so cat never moves faster diagonally than cardinally
      const normDx = inputMagnitude > 1 ? moveVector.dx / inputMagnitude : moveVector.dx;
      const normDy = inputMagnitude > 1 ? moveVector.dy / inputMagnitude : moveVector.dy;
      const baseSpeed = moveVector.isRunning ? this.runSpeed : this.walkSpeed;
      const speed = baseSpeed * speedMult;
      targetVx = normDx * speed;
      targetVy = normDy * speed;

      // Update 4-way facing direction:
      const absDx = Math.abs(normDx);
      const absDy = Math.abs(normDy);

      if (absDx > 0.05 && absDx >= absDy * 0.7) {
        this.facing = normDx > 0 ? 'right' : 'left';
      } else if (absDy > 0.05) {
        this.facing = normDy > 0 ? 'down' : 'up';
      }

      this.animState = moveVector.isRunning ? 'run' : 'walk';
    } else {
      if (this.animState === 'walk' || this.animState === 'run') {
        this.animState = 'idle';
      }

      // Stationary idle napping timer
      if (this.animState === 'idle') {
        this.idleNapTimer += delta;
        if (this.idleNapTimer >= 18.0) {
          this.setAnimState('sleep');
        }
      }

      if (this.animState === 'sleep') {
        this.zzzTimer += delta;
        if (this.zzzTimer >= 1.4) {
          this.zzzTimer = 0;
          this.particles.push({
            type: 'zzz',
            x: this.x + (this.facing === 'left' ? -6 : 6),
            y: this.y - 24,
            vx: (Math.random() - 0.2) * 5,
            vy: -14,
            alpha: 1.0,
            life: 0,
            maxLife: 2.2,
            scale: 1.0
          });
        }
      }
    }

    // Purring timer
    if (this.purrTimer > 0) {
      this.purrTimer -= delta;
      if (this.purrTimer <= 0 && this.animState === 'celebrate') {
        this.setAnimState('idle');
      }
    }

    // Particle lifecycle updates
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Responsive acceleration & smooth deceleration (fluid inertia curves)
    const accelRate = isInputActive ? 18.0 : 22.0;
    const lerpFactor = 1.0 - Math.exp(-accelRate * delta);
    this.vx += (targetVx - this.vx) * lerpFactor;
    this.vy += (targetVy - this.vy) * lerpFactor;

    // Zero out tiny residual velocities
    if (!isInputActive && Math.hypot(this.vx, this.vy) < 2.0) {
      this.vx = 0;
      this.vy = 0;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

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

    // Calculate natural animation bob for accessories and headwear
    const isWalkingOrRunning = this.animState === 'walk' || this.animState === 'run';
    const walkBob = isWalkingOrRunning
      ? Math.sin(this.animTimer * (this.animState === 'run' ? 14 : 10) * Math.PI) * 1.5 * scale
      : 0;
    const sleepBob = this.animState === 'sleep'
      ? Math.sin(this.animTimer * 3) * 0.8 * scale
      : 0;
    const netBob = walkBob + sleepBob;

    const curSave = SaveManager.getData();
    const equippedHat = curSave.equippedAccessories?.hat;
    const equippedCape = curSave.equippedAccessories?.cape;
    const equippedCharm = curSave.equippedAccessories?.charm;

    // 2. Underlayer Accessories: Cape behind body when facing down or sideways
    if (equippedCape && this.facing !== 'up') {
      ctx.save();
      const capeSprite = this.getAccessorySprite(equippedCape);
      const capeW = 20 * scale;
      const capeH = 16 * scale;
      let capeX = screen.x - capeW / 2;
      const capeY = screen.y - 18 * scale + netBob;
      if (this.facing === 'left') {
        capeX = screen.x + 3 * scale;
      } else if (this.facing === 'right') {
        capeX = screen.x - capeW - 3 * scale;
      }
      ctx.drawImage(capeSprite, Math.round(capeX), Math.round(capeY), Math.round(capeW), Math.round(capeH));
      ctx.restore();
    }

    // 3. Render High-Definition Character Pack Sprite
    const destSize = 44 * scale;
    const flipX = this.facing === 'left';
    const packAnim = this.getPackAnimationName();
    const equippedRod = getEquippedRod(curSave);

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
        flipX,
        equippedRod.id
      );
    }

    // 4. Fallback to procedural sprite if image asset is not yet loaded
    if (!drawn) {
      this.renderFallbackSprite(ctx, screen, scale, flipX);
    }

    // 5. Overlayer Accessories: Cape over back when facing away from camera
    if (equippedCape && this.facing === 'up') {
      ctx.save();
      const capeSprite = this.getAccessorySprite(equippedCape);
      const capeW = 22 * scale;
      const capeH = 18 * scale;
      const capeX = screen.x - capeW / 2;
      const capeY = screen.y - 19 * scale + netBob;
      ctx.drawImage(capeSprite, Math.round(capeX), Math.round(capeY), Math.round(capeW), Math.round(capeH));
      ctx.restore();
    }

    // 6. Overlayer Accessories: Neck Charm (bell, pearl, amulet) when facing down or sideways
    if (equippedCharm && this.facing !== 'up') {
      ctx.save();
      const charmSprite = this.getAccessorySprite(equippedCharm);
      const charmSize = 12 * scale;
      let charmX = screen.x - charmSize / 2;
      const charmY = screen.y - 13 * scale + netBob;
      if (this.facing === 'left') {
        charmX = screen.x - 5 * scale;
      } else if (this.facing === 'right') {
        charmX = screen.x - 1 * scale;
      }
      ctx.drawImage(charmSprite, Math.round(charmX), Math.round(charmY), Math.round(charmSize), Math.round(charmSize));
      ctx.restore();
    }

    // 7. Overlayer Accessories: Hat (straw hat, beret, wizard hood, crown)
    if (equippedHat) {
      ctx.save();
      const hatSprite = this.getAccessorySprite(equippedHat);
      const hatW = 22 * scale;
      const hatH = 15 * scale;
      let hatX = screen.x - hatW / 2;
      let hatY = screen.y - 27 * scale + netBob;

      if (this.animState === 'sleep') {
        hatY += 5 * scale; // Cat sits/curls lower while sleeping
      } else if (this.animState === 'sit') {
        hatY += 3 * scale;
      }

      if (this.facing === 'left') {
        hatX -= 2 * scale;
      } else if (this.facing === 'right') {
        hatX += 2 * scale;
      }

      ctx.drawImage(hatSprite, Math.round(hatX), Math.round(hatY), Math.round(hatW), Math.round(hatH));
      ctx.restore();
    }

    // 8. Render Equipped Rod Tip Starlight Sparkle & Aura when fishing
    if (this.animState === 'fish_cast' || this.animState === 'fish_wait' || this.animState === 'fish_reel' || this.animState === 'fish_bite') {
      const tipPos = this.getRodTipWorldPos();
      const tipScreen = camera.worldToScreen(tipPos.x, tipPos.y);
      const time = performance.now() * 0.005;

      ctx.save();
      ctx.fillStyle = equippedRod.lineColor;
      ctx.shadowColor = equippedRod.lineColor;
      ctx.shadowBlur = 8 * scale;

      // Pulsing core
      const pulseRadius = (2.2 + Math.sin(time * 3) * 0.8) * scale;
      ctx.beginPath();
      ctx.arc(tipScreen.x, tipScreen.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // White specular center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tipScreen.x, tipScreen.y, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle cross flare
      const flareLen = (3.5 + Math.sin(time * 5) * 1.5) * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, 0.8 * scale);
      ctx.beginPath();
      ctx.moveTo(tipScreen.x - flareLen, tipScreen.y);
      ctx.lineTo(tipScreen.x + flareLen, tipScreen.y);
      ctx.moveTo(tipScreen.x, tipScreen.y - flareLen);
      ctx.lineTo(tipScreen.x, tipScreen.y + flareLen);
      ctx.stroke();

      ctx.restore();
    }

    // 9. Bite Reaction Exclamation Mark (!) (Pixel Bubble)
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

    // 10. Floating Emote & Trail Particles (Hearts, Zzz, Aurora Dust)
    if (this.particles.length > 0) {
      for (const p of this.particles) {
        const pScreen = camera.worldToScreen(p.x, p.y);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.type === 'heart') {
          if (!this.heartSprite) this.heartSprite = generateHeartParticleSprite();
          const sz = 12 * scale * p.scale;
          ctx.drawImage(this.heartSprite, Math.round(pScreen.x - sz / 2), Math.round(pScreen.y - sz / 2), Math.round(sz), Math.round(sz));
        } else if (p.type === 'zzz') {
          if (!this.zzzSprite) this.zzzSprite = generateZzzBubbleSprite();
          const sz = 16 * scale * p.scale;
          ctx.drawImage(this.zzzSprite, Math.round(pScreen.x - sz / 2), Math.round(pScreen.y - sz / 2), Math.round(sz), Math.round(sz));
        } else if (p.type === 'aurora') {
          ctx.fillStyle = '#2dd4bf';
          ctx.shadowColor = '#67e8f9';
          ctx.shadowBlur = 6 * scale;
          ctx.fillRect(Math.round(pScreen.x - 2 * scale), Math.round(pScreen.y - 2 * scale), Math.round(4 * scale), Math.round(4 * scale));
        }
        ctx.restore();
      }
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
