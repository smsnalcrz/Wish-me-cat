/**
 * StarpondWater2D.ts
 * 2D Animated Celestial Galaxy Pond for Wish Me Cat.
 * Features flowing cosmic nebula water, swimming star koi silhouettes, glowing lilypads,
 * radiating water ripples, and decorative shoreline rocks.
 */

import { Camera2D } from '../core/Camera2D';

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
  radius: number;
  angle: number;
  hasFlower: boolean;
  flowerColor: string;
}

export class StarpondWater2D {
  public centerX: number = 0;
  public centerY: number = 0;
  public radiusX: number = 140; // elliptical cosmic pond
  public radiusY: number = 120;

  // Animated Water Particles & Stars
  private stars: { x: number; y: number; size: number; speed: number; alpha: number; phase: number }[] = [];
  private ripples: WaterRipple[] = [];
  private lilypads: LilyPad[] = [];
  private shorelineRocks: { angle: number; dist: number; size: number; color: string }[] = [];

  constructor(centerX: number = 0, centerY: number = 0) {
    this.centerX = centerX;
    this.centerY = centerY;

    // Generate inner galaxy starlight particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.85;
      this.stars.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        size: Math.random() > 0.7 ? 2 : 1,
        speed: 0.2 + Math.random() * 0.4,
        alpha: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Generate floating celestial lilypads
    const padAngles = [0.4, 1.2, 2.1, 2.8, 3.7, 4.6, 5.4];
    padAngles.forEach((angle, i) => {
      const dist = 0.45 + (i % 3) * 0.15;
      this.lilypads.push({
        x: Math.cos(angle) * this.radiusX * dist,
        y: Math.sin(angle) * this.radiusY * dist,
        radius: 7 + (i % 3) * 2,
        angle: Math.random() * Math.PI * 2,
        hasFlower: i % 2 === 0,
        flowerColor: i % 4 === 0 ? '#f472b6' : '#38bdf8'
      });
    });

    // Generate shoreline stones around the pond perimeter
    const rockCount = 52;
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
      const palette = ['#38325a', '#4e4875', '#655e8c', '#2c2748'];
      this.shorelineRocks.push({
        angle,
        dist: 0.98 + (Math.sin(i * 3) * 0.04),
        size: 5 + (i % 4) * 2,
        color: palette[i % palette.length]
      });
    }
  }

  // Trigger a ripple at world coordinates (bobber splash, fish bite, etc.)
  public triggerRipple(x: number, y: number, maxRadius: number = 28): void {
    this.ripples.push({
      x,
      y,
      radius: 2,
      maxRadius,
      alpha: 0.9,
      speed: 24
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

    // Gentle random water ripples
    if (Math.random() < 0.035) {
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
    const rxScreen = this.radiusX * camera.zoom;
    const ryScreen = this.radiusY * camera.zoom;

    ctx.save();

    // 1. Outer shoreline embankment / depth ring
    ctx.fillStyle = '#1e1a38';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rxScreen + 6 * camera.zoom, ryScreen + 6 * camera.zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Cosmic Starpond Body with gradient
    const waterGrad = ctx.createRadialGradient(
      centerScreen.x, centerScreen.y, rxScreen * 0.1,
      centerScreen.x, centerScreen.y, rxScreen
    );
    waterGrad.addColorStop(0, '#2e1f5e'); // center glowing nebula
    waterGrad.addColorStop(0.45, '#191b4a'); // deep midnight pool
    waterGrad.addColorStop(0.85, '#0e1133'); // darker shore transition
    waterGrad.addColorStop(1.0, '#090a21'); // shoreline abyss

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rxScreen, ryScreen, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clip inner water area for galaxy effects
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rxScreen - 1, ryScreen - 1, 0, 0, Math.PI * 2);
    ctx.clip();

    // 3. Swirling Galaxy Nebula Bands inside the water
    const swirlAlpha = 0.15 + Math.sin(time * 0.8) * 0.05;
    ctx.fillStyle = `rgba(168, 85, 247, ${swirlAlpha})`;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x + Math.sin(time * 0.5) * 8 * camera.zoom, centerScreen.y, rxScreen * 0.65, ryScreen * 0.35, time * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(56, 189, 248, ${swirlAlpha * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + Math.cos(time * 0.6) * 6 * camera.zoom, rxScreen * 0.45, ryScreen * 0.55, -time * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // 4. Inner Cosmic Twinkling Stars
    this.stars.forEach(st => {
      const alpha = 0.3 + Math.sin(time * st.speed + st.phase) * 0.4;
      ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`;
      const screenPos = camera.worldToScreen(this.centerX + st.x, this.centerY + st.y);
      ctx.fillRect(screenPos.x, screenPos.y, st.size * camera.zoom, st.size * camera.zoom);
    });

    // 4b. Swimming Celestial Koi Pair (from Starpond Reference)
    const koiSpeed = 0.35;
    for (let k = 0; k < 2; k++) {
      const koiAngle = time * koiSpeed + k * Math.PI;
      const orbitRx = this.radiusX * 0.42;
      const orbitRy = this.radiusY * 0.42;
      const kx = this.centerX + Math.cos(koiAngle) * orbitRx;
      const ky = this.centerY + Math.sin(koiAngle) * orbitRy;
      const koiScreen = camera.worldToScreen(kx, ky);

      // Facing angle tangent to orbit
      const heading = koiAngle + Math.PI / 2;
      const tailWag = Math.sin(time * 3.5 + k * 2) * 0.28;

      ctx.save();
      ctx.translate(koiScreen.x, koiScreen.y);
      ctx.rotate(heading);

      // Koi Body
      const z = camera.zoom;
      ctx.fillStyle = k === 0 ? '#fb923c' : '#f97316'; // vibrant celestial koi orange
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5 * z, 10 * z, 0, 0, Math.PI * 2);
      ctx.fill();

      // Belly/pattern highlights
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.ellipse(0, -2 * z, 2.5 * z, 5 * z, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fins (translucent glowing)
      ctx.fillStyle = 'rgba(254, 215, 170, 0.7)';
      // Left pectoral fin
      ctx.beginPath();
      ctx.ellipse(-4 * z, -1 * z, 3 * z, 1.5 * z, -0.6, 0, Math.PI * 2);
      ctx.fill();
      // Right pectoral fin
      ctx.beginPath();
      ctx.ellipse(4 * z, -1 * z, 3 * z, 1.5 * z, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Flowing tail fin with undulating wag
      ctx.save();
      ctx.translate(0, 8 * z);
      ctx.rotate(tailWag);
      ctx.fillStyle = 'rgba(253, 186, 116, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-1.5 * z, 0);
      ctx.lineTo(-4.5 * z, 6 * z);
      ctx.lineTo(0, 4.5 * z);
      ctx.lineTo(4.5 * z, 6 * z);
      ctx.lineTo(1.5 * z, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // 5. Radiating 2D Water Ripple Rings
    this.ripples.forEach(rip => {
      const rScreen = camera.worldToScreen(rip.x, rip.y);
      ctx.strokeStyle = `rgba(125, 211, 252, ${rip.alpha * 0.75})`;
      ctx.lineWidth = Math.max(1, 1.5 * camera.zoom);
      ctx.beginPath();
      ctx.ellipse(rScreen.x, rScreen.y, rip.radius * camera.zoom, rip.radius * 0.65 * camera.zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 6. Floating Pixel Lilypads
    this.lilypads.forEach(lp => {
      const lpScreen = camera.worldToScreen(this.centerX + lp.x, this.centerY + lp.y);
      const bobY = Math.sin(time * 1.5 + lp.x) * 1.2 * camera.zoom;

      // Green pixel lilypad disc
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(lpScreen.x, lpScreen.y + bobY, lp.radius * camera.zoom, lp.radius * 0.7 * camera.zoom, lp.angle, 0.4, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(lpScreen.x, lpScreen.y + bobY, (lp.radius - 2) * camera.zoom, (lp.radius - 2) * 0.7 * camera.zoom, lp.angle, 0.4, Math.PI * 2);
      ctx.fill();

      // Lotus Flower
      if (lp.hasFlower) {
        ctx.fillStyle = lp.flowerColor;
        ctx.beginPath();
        ctx.arc(lpScreen.x, lpScreen.y + bobY - 2 * camera.zoom, 3 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lpScreen.x, lpScreen.y + bobY - 2 * camera.zoom, 1.2 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore(); // end clip

    // 7. Shoreline Rocks & Stones
    this.shorelineRocks.forEach(rock => {
      const wx = this.centerX + Math.cos(rock.angle) * this.radiusX * rock.dist;
      const wy = this.centerY + Math.sin(rock.angle) * this.radiusY * rock.dist;
      const rockScreen = camera.worldToScreen(wx, wy);

      ctx.fillStyle = rock.color;
      ctx.beginPath();
      ctx.ellipse(rockScreen.x, rockScreen.y, rock.size * camera.zoom, rock.size * 0.75 * camera.zoom, rock.angle, 0, Math.PI * 2);
      ctx.fill();

      // Highlight on top of rock
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(rockScreen.x, rockScreen.y - 1.5 * camera.zoom, (rock.size * 0.6) * camera.zoom, (rock.size * 0.4) * camera.zoom, rock.angle, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}
