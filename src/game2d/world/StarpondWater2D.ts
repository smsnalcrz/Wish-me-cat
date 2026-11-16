/**
 * StarpondWater2D.ts
 * Handcrafted 2D Pixel-Art Celestial Galaxy Pond for Wish Me Cat.
 * Features stepped pixel shoreline rocks, animated pixel water foam,
 * swimming animated pixel koi pair, lotus lilypads, and sparkling starlight glints.
 */

import { Camera2D } from '../core/Camera2D';
import { generateCelestialKoiSpriteSheet, generateLotusLilypadSprite } from '../rendering/PixelSprites';

export interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export interface LilyPad {
  x: number;
  y: number;
  angle: number;
}

export class StarpondWater2D {
  public centerX: number = 0;
  public centerY: number = 0;
  public radiusX: number = 135; // Pixel-proportioned cosmic pond
  public radiusY: number = 115;

  // Pixel Assets
  private koiFrames: HTMLCanvasElement[] = [];
  private lilypadCanvas: HTMLCanvasElement | null = null;

  // Starlight Water Particles & Shimmers
  private glints: { x: number; y: number; size: number; speed: number; alpha: number; phase: number }[] = [];
  private ripples: WaterRipple[] = [];
  private lilypads: LilyPad[] = [];
  private shorelineRocks: { angle: number; dist: number; width: number; height: number; color: string; highlight: string }[] = [];

  constructor(centerX: number = 0, centerY: number = 0) {
    this.centerX = centerX;
    this.centerY = centerY;

    this.koiFrames = generateCelestialKoiSpriteSheet();
    this.lilypadCanvas = generateLotusLilypadSprite();

    // Generate water starlight glints
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.85;
      this.glints.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        size: Math.random() > 0.6 ? 2 : 1,
        speed: 0.3 + Math.random() * 0.5,
        alpha: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Hand-placed floating lotus lilypads around the pond
    const padAngles = [0.45, 1.25, 2.15, 2.9, 3.8, 4.65, 5.5];
    padAngles.forEach((angle, i) => {
      const dist = 0.48 + (i % 3) * 0.16;
      this.lilypads.push({
        x: Math.cos(angle) * this.radiusX * dist,
        y: Math.sin(angle) * this.radiusY * dist,
        angle: (i * 0.9)
      });
    });

    // 48 Interlocking Handcrafted Shoreline Stones
    const rockCount = 48;
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
      const palettes = [
        { color: '#2d284e', highlight: '#483f7a' },
        { color: '#3a335c', highlight: '#5b508f' },
        { color: '#24203e', highlight: '#3f3868' },
        { color: '#433c69', highlight: '#675c9e' }
      ];
      const p = palettes[i % palettes.length];
      this.shorelineRocks.push({
        angle,
        dist: 0.98 + (Math.sin(i * 3.5) * 0.035),
        width: 10 + (i % 4) * 3,
        height: 8 + ((i + 2) % 3) * 2,
        color: p.color,
        highlight: p.highlight
      });
    }
  }

  // Trigger a ripple at world coordinates (splash, bite, reel)
  public triggerRipple(x: number, y: number, maxRadius: number = 26): void {
    this.ripples.push({
      x,
      y,
      radius: 2,
      maxRadius,
      alpha: 1.0,
      speed: 26
    });
  }

  // Check if a point is inside the water boundary
  public isInsidePond(worldX: number, worldY: number): boolean {
    const dx = (worldX - this.centerX) / this.radiusX;
    const dy = (worldY - this.centerY) / this.radiusY;
    return dx * dx + dy * dy <= 1.0;
  }

  public update(delta: number): void {
    // Update water ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed * delta;
      rip.alpha = Math.max(0, 1 - rip.radius / rip.maxRadius);
      if (rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // Occasional subtle natural water ripples
    if (Math.random() < 0.03) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.random() * 0.6;
      this.triggerRipple(
        this.centerX + Math.cos(angle) * this.radiusX * r,
        this.centerY + Math.sin(angle) * this.radiusY * r,
        14 + Math.random() * 8
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera2D, time: number): void {
    const centerScreen = camera.worldToScreen(this.centerX, this.centerY);
    const scale = camera.zoom;
    const rx = this.radiusX * scale;
    const ry = this.radiusY * scale;

    ctx.save();

    // 1. Shoreline Depth Trench (Dark drop shadow below water rim)
    ctx.fillStyle = '#0a081a';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 4 * scale, rx + 8 * scale, ry + 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Deep Cosmic Water Base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clip to water boundary for all inside effects
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.clip();

    // 3. Cosmic Water Tiers (Deep Midnight Indigo & Astral Cyan)
    ctx.fillStyle = '#172554';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.82, ry * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Galaxy Swirl Bands
    const swirlAlpha = 0.18 + Math.sin(time * 0.8) * 0.06;
    ctx.fillStyle = `rgba(168, 85, 247, ${swirlAlpha})`;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x + Math.sin(time * 0.5) * 8 * scale, centerScreen.y, rx * 0.55, ry * 0.35, time * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(56, 189, 248, ${swirlAlpha * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + Math.cos(time * 0.6) * 6 * scale, rx * 0.42, ry * 0.48, -time * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 4. Stepped Pixel Water Foam Fringe (Animated 2-Frame Pixel Foam where water meets shoreline)
    const foamFrame = Math.floor(time * 2.5) % 2;
    const foamCount = 42;
    ctx.fillStyle = foamFrame === 0 ? 'rgba(125, 211, 252, 0.45)' : 'rgba(186, 230, 253, 0.55)';
    for (let i = 0; i < foamCount; i++) {
      const a = (i / foamCount) * Math.PI * 2 + (foamFrame * 0.05);
      const fx = centerScreen.x + Math.cos(a) * (rx - 4 * scale);
      const fy = centerScreen.y + Math.sin(a) * (ry - 4 * scale);
      const fSize = (2 + ((i + foamFrame) % 3)) * scale;
      ctx.fillRect(Math.floor(fx), Math.floor(fy), Math.floor(fSize), Math.floor(fSize));
    }

    // 5. Starlight Shimmer Glints in water
    this.glints.forEach(st => {
      const alpha = 0.3 + Math.sin(time * st.speed + st.phase) * 0.4;
      ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`;
      const screenPos = camera.worldToScreen(this.centerX + st.x, this.centerY + st.y);
      ctx.fillRect(Math.floor(screenPos.x), Math.floor(screenPos.y), Math.floor(st.size * scale), Math.floor(st.size * scale));
    });

    // 6. Swimming Animated Pixel Celestial Koi Pair
    if (this.koiFrames.length > 0) {
      const koiSpeed = 0.32;
      const animIndex = Math.floor(time * 6) % this.koiFrames.length;
      const koiImg = this.koiFrames[animIndex];

      for (let k = 0; k < 2; k++) {
        const koiAngle = time * koiSpeed + k * Math.PI;
        const orbitRx = this.radiusX * 0.44;
        const orbitRy = this.radiusY * 0.44;
        const kx = this.centerX + Math.cos(koiAngle) * orbitRx;
        const ky = this.centerY + Math.sin(koiAngle) * orbitRy;
        const koiScreen = camera.worldToScreen(kx, ky);

        // Heading tangent to orbit
        const heading = koiAngle + Math.PI / 2;

        ctx.save();
        ctx.translate(koiScreen.x, koiScreen.y);
        ctx.rotate(heading);

        const kw = 24 * scale;
        const kh = 16 * scale;
        ctx.drawImage(koiImg, -kw / 2, -kh / 2, kw, kh);

        ctx.restore();
      }
    }

    // 7. Radiating Stepped Pixel Water Ripples
    this.ripples.forEach(rip => {
      const rScreen = camera.worldToScreen(rip.x, rip.y);
      ctx.strokeStyle = `rgba(125, 211, 252, ${rip.alpha * 0.8})`;
      ctx.lineWidth = Math.max(1, Math.floor(1.5 * scale));
      ctx.beginPath();
      ctx.ellipse(rScreen.x, rScreen.y, rip.radius * scale, rip.radius * 0.65 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 8. Floating Handcrafted Lotus Lilypads
    if (this.lilypadCanvas) {
      const padImg = this.lilypadCanvas;
      this.lilypads.forEach((lp, idx) => {
        const lpScreen = camera.worldToScreen(this.centerX + lp.x, this.centerY + lp.y);
        const bobY = Math.sin(time * 1.6 + idx) * 1.5 * scale;
        const padSize = 18 * scale;

        ctx.save();
        ctx.translate(lpScreen.x, lpScreen.y + bobY);
        ctx.rotate(lp.angle);
        ctx.drawImage(padImg, -padSize / 2, -padSize / 2, padSize, padSize);
        ctx.restore();
      });
    }

    ctx.restore(); // end clip

    // 9. Interlocking Shoreline Stones with Stepped Pixel Highlights
    this.shorelineRocks.forEach(rock => {
      const wx = this.centerX + Math.cos(rock.angle) * this.radiusX * rock.dist;
      const wy = this.centerY + Math.sin(rock.angle) * this.radiusY * rock.dist;
      const rockScreen = camera.worldToScreen(wx, wy);

      const rw = rock.width * scale;
      const rh = rock.height * scale;

      // Base Rock Shadow
      ctx.fillStyle = '#120f26';
      ctx.fillRect(rockScreen.x - rw / 2 + 1 * scale, rockScreen.y - rh / 2 + 2 * scale, rw, rh);

      // Main Rock Body
      ctx.fillStyle = rock.color;
      ctx.fillRect(rockScreen.x - rw / 2, rockScreen.y - rh / 2, rw, rh);

      // Stepped Top Highlight
      ctx.fillStyle = rock.highlight;
      ctx.fillRect(rockScreen.x - rw / 2 + 1 * scale, rockScreen.y - rh / 2 + 1 * scale, rw - 2 * scale, Math.max(1, rh * 0.35));
    });

    ctx.restore();
  }
}
