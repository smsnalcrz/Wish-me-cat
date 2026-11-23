/**
 * Bobber2D.ts
 * 2D Animated Celestial Star Bobber and Fishing Line Renderer.
 * Simulates parabolic cast arcs, water floating, ripple generation, and line physics.
 */

import { Camera2D } from '../core/Camera2D';
import { generateStarBobberSprite } from '../rendering/PixelSprites';

export class Bobber2D {
  public x: number = 0;
  public y: number = 0;
  public startX: number = 0;
  public startY: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;

  public isVisible: boolean = false;
  public isInWater: boolean = false;
  public castProgress: number = 0;
  public castDuration: number = 0.65; // seconds

  private sprite: HTMLCanvasElement;
  private floatTimer: number = 0;
  public isBiting: boolean = false;
  public isReeling: boolean = false;

  constructor() {
    this.sprite = generateStarBobberSprite();
  }

  public startCast(fromX: number, fromY: number, toX: number, toY: number): void {
    this.startX = fromX;
    this.startY = fromY;
    this.targetX = toX;
    this.targetY = toY;
    this.x = fromX;
    this.y = fromY;
    this.castProgress = 0;
    this.isVisible = true;
    this.isInWater = false;
    this.isBiting = false;
    this.isReeling = false;
    this.floatTimer = 0;
  }

  public update(delta: number, onLandWater?: (x: number, y: number) => void): void {
    if (!this.isVisible) return;

    if (!this.isInWater) {
      // 2D Parabolic Casting Arc
      this.castProgress += delta / this.castDuration;
      const t = Math.min(1.0, this.castProgress);

      // Linear interpolation between start and target
      const curX = this.startX + (this.targetX - this.startX) * t;
      const curY = this.startY + (this.targetY - this.startY) * t;

      // Parabolic jump height (reaches peak at t = 0.5)
      const arcHeight = -45 * Math.sin(t * Math.PI);

      this.x = curX;
      this.y = curY + arcHeight;

      if (t >= 1.0) {
        this.isInWater = true;
        this.x = this.targetX;
        this.y = this.targetY;
        onLandWater?.(this.x, this.y);
      }
    } else {
      // Gentle Bobbing in Water
      this.floatTimer += delta;
      let bobOffset = Math.sin(this.floatTimer * 3.5) * 2.5;

      if (this.isBiting) {
        // Fast bite vibration
        bobOffset = Math.sin(this.floatTimer * 22) * 5;
      } else if (this.isReeling) {
        // Struggling under tension
        bobOffset = Math.sin(this.floatTimer * 14) * 3 + 2;
      }

      this.y = this.targetY + bobOffset;
    }
  }

  public hide(): void {
    this.isVisible = false;
    this.isInWater = false;
    this.isBiting = false;
    this.isReeling = false;
  }

  // Draw 2D Fishing Line connecting Rod Tip to Bobber
  public renderLine(ctx: CanvasRenderingContext2D, camera: Camera2D, rodTipX: number, rodTipY: number, lineColor?: string): void {
    if (!this.isVisible) return;

    const tipScreen = camera.worldToScreen(rodTipX, rodTipY);
    const bobScreen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.strokeStyle = lineColor || '#93c5fd';
    ctx.lineWidth = Math.max(1, 1.2 * camera.zoom);

    // Quadratic curve with dynamic tension sag: loose when floating, taut & vibrating under bite/reel
    let sag = 8 * camera.zoom;
    if (this.isReeling) {
      sag = 2 * camera.zoom + Math.sin(performance.now() * 0.05) * 1.5 * camera.zoom;
    } else if (this.isBiting) {
      sag = 3 * camera.zoom + Math.sin(performance.now() * 0.08) * 2 * camera.zoom;
    }

    const midX = (tipScreen.x + bobScreen.x) / 2;
    const midY = (tipScreen.y + bobScreen.y) / 2 + (this.isInWater ? sag : -6 * camera.zoom);

    ctx.beginPath();
    ctx.moveTo(tipScreen.x, tipScreen.y);
    ctx.quadraticCurveTo(midX, midY, bobScreen.x, bobScreen.y);
    ctx.stroke();

    ctx.restore();
  }

  // Draw 2D Star Bobber
  public renderBobber(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    if (!this.isVisible) return;

    const screen = camera.worldToScreen(this.x, this.y);
    const scale = camera.zoom;
    const size = 16 * scale;

    ctx.save();

    // Bobber Water Shadow / Reflection
    if (this.isInWater) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y + 3 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Aura
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Sprite
    ctx.drawImage(this.sprite, Math.round(screen.x - size / 2), Math.round(screen.y - size / 2), size, size);

    ctx.restore();
  }
}
