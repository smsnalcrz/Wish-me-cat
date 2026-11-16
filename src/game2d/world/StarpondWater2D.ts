/**
 * StarpondWater2D.ts
 * Handcrafted 2D Pixel-Art Celestial Galaxy Pond with True 2.5D Sunken Depth for Wish Me Cat.
 * Features:
 * - 2.5D Sunken Basin with northern crag embankment cliff wall & cast drop shadow
 * - 4-Tier Depth Stratification (Shoreline Silt -> Aqua Shallows -> Twilight Sapphire -> Abyssal Void)
 * - Submerged river stones & moss pebbles scattered across the shallow floor
 * - Deep-water shadow fish silhouettes swimming with undulating tails in the abyss
 * - Swimming celestial koi pair with submerged floor shadow & water absorption tint
 * - Stepped animated pixel-art light caustics with sinusoidal optical refraction
 * - Floating lotus lilypads with projected floor shadows
 * - Rising bioluminescent celestial plankton motes & starlight glints
 * - Handcrafted perimeter shoreline rocks with wet waterline bases & dry highlighted tops
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

export interface ShadowFish {
  angle: number;
  orbitRx: number;
  orbitRy: number;
  speed: number;
  length: number;
  width: number;
  depthTier: 'abyss' | 'mid';
  tailPhase: number;
}

export interface SubmergedPebble {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  highlight: string;
}

export interface BioMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  size: number;
}

export class StarpondWater2D {
  public centerX: number = 0;
  public centerY: number = 0;
  public radiusX: number = 135; // Pixel-proportioned cosmic pond
  public radiusY: number = 115;
  public cliffHeight: number = 14; // Sunken basin cliff drop

  // Pixel Assets
  private koiFrames: HTMLCanvasElement[] = [];
  private lilypadCanvas: HTMLCanvasElement | null = null;

  // Starlight Water Particles & Shimmers
  private glints: { x: number; y: number; size: number; speed: number; alpha: number; phase: number }[] = [];
  private ripples: WaterRipple[] = [];
  private lilypads: LilyPad[] = [];
  private shorelineRocks: { angle: number; dist: number; width: number; height: number; color: string; highlight: string; wetColor: string }[] = [];

  // Enhanced Depth Features
  private submergedPebbles: SubmergedPebble[] = [];
  private shadowFish: ShadowFish[] = [];
  private biomotes: BioMote[] = [];

  constructor(centerX: number = 0, centerY: number = 0) {
    this.centerX = centerX;
    this.centerY = centerY;

    this.koiFrames = generateCelestialKoiSpriteSheet();
    this.lilypadCanvas = generateLotusLilypadSprite();

    // 1. Generate Starlight Glints
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.82;
      this.glints.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        size: Math.random() > 0.6 ? 2 : 1,
        speed: 0.3 + Math.random() * 0.5,
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 2. Submerged River Pebbles on the Shallow Shelf
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (Math.sin(i * 2.3) * 0.1);
      const dist = 0.80 + (Math.sin(i * 3.7) * 0.09);
      const px = Math.cos(angle) * this.radiusX * dist;
      const py = Math.sin(angle) * this.radiusY * dist;
      const colors = [
        { color: '#223354', highlight: '#3b5585' },
        { color: '#1a2845', highlight: '#2e4570' },
        { color: '#2a3b5c', highlight: '#46618e' },
      ];
      const c = colors[i % colors.length];
      this.submergedPebbles.push({
        x: px,
        y: py,
        w: 3 + (i % 3) * 2,
        h: 2 + ((i + 1) % 2) * 2,
        color: c.color,
        highlight: c.highlight
      });
    }

    // 3. Deep Shadow Fish Silhouettes in the Abyss & Mid Tiers
    this.shadowFish = [
      // 1 Large Ancient Leviathan in the deepest trench
      {
        angle: 0,
        orbitRx: this.radiusX * 0.28,
        orbitRy: this.radiusY * 0.24,
        speed: 0.16,
        length: 32,
        width: 12,
        depthTier: 'abyss',
        tailPhase: 0
      },
      // 2 Agile Astral Minnow shadows cruising the mid shelf
      {
        angle: Math.PI * 0.7,
        orbitRx: this.radiusX * 0.52,
        orbitRy: this.radiusY * 0.48,
        speed: 0.28,
        length: 18,
        width: 7,
        depthTier: 'mid',
        tailPhase: 1.5
      },
      {
        angle: Math.PI * 1.5,
        orbitRx: this.radiusX * 0.58,
        orbitRy: this.radiusY * 0.50,
        speed: 0.24,
        length: 16,
        width: 6,
        depthTier: 'mid',
        tailPhase: 3.2
      }
    ];

    // 4. Rising Bioluminescent Stardust Plankton Motes
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.65;
      this.biomotes.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        vx: (Math.random() - 0.5) * 4,
        vy: -(4 + Math.random() * 8),
        alpha: Math.random() * 0.8,
        maxAlpha: 0.4 + Math.random() * 0.5,
        size: Math.random() > 0.7 ? 2 : 1
      });
    }

    // 5. Hand-placed floating lotus lilypads around the pond
    const padAngles = [0.45, 1.25, 2.15, 2.9, 3.8, 4.65, 5.5];
    padAngles.forEach((angle, i) => {
      const dist = 0.52 + (i % 3) * 0.14;
      this.lilypads.push({
        x: Math.cos(angle) * this.radiusX * dist,
        y: Math.sin(angle) * this.radiusY * dist,
        angle: (i * 0.9)
      });
    });

    // 6. 48 Interlocking Handcrafted Shoreline Stones with Wet Waterline Bases
    const rockCount = 48;
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
      const palettes = [
        { color: '#383256', highlight: '#5b5088', wet: '#1e1a33' },
        { color: '#443c68', highlight: '#685d9c', wet: '#24203e' },
        { color: '#2d2747', highlight: '#4b4074', wet: '#18152b' },
        { color: '#4e4574', highlight: '#7366aa', wet: '#2a2544' }
      ];
      const p = palettes[i % palettes.length];
      this.shorelineRocks.push({
        angle,
        dist: 0.98 + (Math.sin(i * 3.5) * 0.035),
        width: 10 + (i % 4) * 3,
        height: 8 + ((i + 2) % 3) * 2,
        color: p.color,
        highlight: p.highlight,
        wetColor: p.wet
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
    // 1. Update Water Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += rip.speed * delta;
      rip.alpha = Math.max(0, 1 - rip.radius / rip.maxRadius);
      if (rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // 2. Update Rising Bioluminescent Plankton Motes
    this.biomotes.forEach(mote => {
      mote.y += mote.vy * delta;
      mote.x += mote.vx * delta;
      mote.alpha += delta * 0.3;
      if (mote.alpha > mote.maxAlpha) {
        mote.alpha = mote.maxAlpha;
      }

      // Reset when floating too high or drifting out of pond
      const dx = mote.x / (this.radiusX * 0.65);
      const dy = mote.y / (this.radiusY * 0.65);
      if (mote.y < -this.radiusY * 0.6 || dx * dx + dy * dy > 1.0) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.45;
        mote.x = Math.cos(angle) * this.radiusX * r;
        mote.y = Math.sin(angle) * this.radiusY * r + 15;
        mote.alpha = 0.05;
      }
    });

    // 3. Update Deep Shadow Fish Patrols
    this.shadowFish.forEach(fish => {
      fish.angle += fish.speed * delta;
      fish.tailPhase += delta * 6;
    });

    // 4. Occasional Natural Water Drops / Splashes
    if (Math.random() < 0.025) {
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
    const drop = this.cliffHeight * scale;

    ctx.save();

    // =========================================================================
    // STEP 1: SUNKEN BASIN NORTHERN CLIFF DROP-OFF (Z-Depth Perspective)
    // =========================================================================
    // Outer drop shadow pit
    ctx.fillStyle = '#060410';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 6 * scale, rx + 10 * scale, ry + drop + 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped inner rock cliff along northern half of basin (angles 180° to 360°)
    for (let step = Math.floor(drop); step > 0; step -= Math.max(1, Math.floor(2 * scale))) {
      const t = step / drop;
      const r = Math.floor(24 + (1 - t) * 22);
      const g = Math.floor(20 + (1 - t) * 18);
      const b = Math.floor(48 + (1 - t) * 38);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = Math.max(1, Math.floor(2.5 * scale));
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y - 2 * scale + step, rx + 1 * scale, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // =========================================================================
    // STEP 2: MAIN WATER SURFACE BASE (Shifted slightly down into basin)
    // =========================================================================
    const waterScreenY = centerScreen.y + drop * 0.45;

    // Deep water bed base (Twilight Navy Teal)
    ctx.fillStyle = '#0a1324';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clip to water boundary for all liquid effects
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.clip();

    // =========================================================================
    // STEP 3: 4-TIER DEPTH STRATIFICATION
    // =========================================================================
    // Tier 1: Shallow Sand & Aqua Silt Shelf (Along shoreline)
    ctx.fillStyle = '#132342';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY + 2 * scale, rx * 0.93, ry * 0.93, 0, 0, Math.PI * 2);
    ctx.fill();

    // Submerged River Stones & Moss Pebbles on the shallow bed
    this.submergedPebbles.forEach(peb => {
      const ps = camera.worldToScreen(this.centerX + peb.x, this.centerY + peb.y + drop * 0.45 / scale);
      const pw = peb.w * scale;
      const ph = peb.h * scale;

      ctx.fillStyle = peb.color;
      ctx.fillRect(Math.floor(ps.x - pw / 2), Math.floor(ps.y - ph / 2), Math.floor(pw), Math.floor(ph));
      ctx.fillStyle = peb.highlight;
      ctx.fillRect(Math.floor(ps.x - pw / 2 + 1 * scale), Math.floor(ps.y - ph / 2 + 1 * scale), Math.floor(pw - 2 * scale), Math.max(1, Math.floor(ph * 0.4)));
    });

    // Tier 2: Mid-Depth Cosmic Shelf (Twilight Sapphire, offset northward)
    ctx.fillStyle = '#181e52';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY - 5 * scale, rx * 0.74, ry * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tier 3: Abyssal Heart Void Trench (Deep Midnight Violet)
    ctx.fillStyle = '#080518';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY - 10 * scale, rx * 0.50, ry * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Core black starlit trench
    ctx.fillStyle = '#04020c';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY - 12 * scale, rx * 0.34, ry * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Celestial Stardust Nebula Bands in the Deep Trench
    const swirlAlpha = 0.16 + Math.sin(time * 0.8) * 0.05;
    ctx.fillStyle = `rgba(168, 85, 247, ${swirlAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      centerScreen.x + Math.sin(time * 0.5) * 8 * scale,
      waterScreenY - 10 * scale,
      rx * 0.42,
      ry * 0.28,
      time * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = `rgba(56, 189, 248, ${swirlAlpha * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(
      centerScreen.x,
      waterScreenY - 8 * scale + Math.cos(time * 0.6) * 6 * scale,
      rx * 0.32,
      ry * 0.36,
      -time * 0.14,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // =========================================================================
    // STEP 4: DEEP SHADOW FISH SILHOUETTES IN THE ABYSS
    // =========================================================================
    this.shadowFish.forEach(fish => {
      const fx = this.centerX + Math.cos(fish.angle) * fish.orbitRx;
      const fy = this.centerY + Math.sin(fish.angle) * fish.orbitRy;
      const fs = camera.worldToScreen(fx, fy + (drop * 0.45) / scale);

      const heading = fish.angle + Math.PI / 2;
      const tailOsc = Math.sin(time * 7 + fish.tailPhase) * (2.5 * scale);
      const fl = fish.length * scale;
      const fw = fish.width * scale;

      ctx.save();
      ctx.translate(fs.x, fs.y);
      ctx.rotate(heading);

      if (fish.depthTier === 'abyss') {
        ctx.fillStyle = 'rgba(7, 4, 18, 0.72)'; // Deep dark silhouette
      } else {
        ctx.fillStyle = 'rgba(18, 28, 64, 0.65)'; // Mid shelf silhouette
      }

      // Torpedo fish body
      ctx.beginPath();
      ctx.ellipse(0, 0, fl * 0.45, fw * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Undulating caudal fin
      ctx.beginPath();
      ctx.moveTo(-fl * 0.38, 0);
      ctx.lineTo(-fl * 0.65, -fw * 0.4 + tailOsc);
      ctx.lineTo(-fl * 0.65, fw * 0.4 + tailOsc);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // =========================================================================
    // STEP 5: SWIMMING CELESTIAL KOI PAIR (Mid-water with floor shadow)
    // =========================================================================
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
        const koiScreen = camera.worldToScreen(kx, ky + (drop * 0.45) / scale);

        const heading = koiAngle + Math.PI / 2;
        const kw = 24 * scale;
        const kh = 16 * scale;

        // 1. Projected shadow on pond floor
        ctx.save();
        ctx.fillStyle = 'rgba(6, 10, 24, 0.55)';
        ctx.beginPath();
        ctx.ellipse(koiScreen.x + 3 * scale, koiScreen.y + 6 * scale, kw * 0.4, kh * 0.3, heading, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Koi Sprite with subtle liquid immersion
        ctx.save();
        ctx.translate(koiScreen.x, koiScreen.y);
        ctx.rotate(heading);
        ctx.drawImage(koiImg, -kw / 2, -kh / 2, kw, kh);

        // Water absorption tint over koi
        ctx.fillStyle = 'rgba(14, 116, 144, 0.18)';
        ctx.fillRect(-kw / 2, -kh / 2, kw, kh);
        ctx.restore();
      }
    }

    // =========================================================================
    // STEP 6: ANIMATED PIXEL WATER CAUSTICS (Optical refractions)
    // =========================================================================
    const causticStep = Math.max(3, Math.floor(4 * scale));
    const startX = Math.floor(centerScreen.x - rx);
    const endX = Math.ceil(centerScreen.x + rx);
    const startY = Math.floor(waterScreenY - ry);
    const endY = Math.ceil(waterScreenY + ry);

    for (let py = startY; py < endY; py += causticStep) {
      for (let px = startX; px < endX; px += causticStep) {
        const ndx = (px - centerScreen.x) / rx;
        const ndy = (py - waterScreenY) / ry;
        const distSq = ndx * ndx + ndy * ndy;

        if (distSq < 0.94) {
          const distNorm = Math.sqrt(distSq);
          // Dual wave interference formula
          const c1 = Math.sin(px * 0.05 + time * 1.4) * Math.cos(py * 0.06 - time * 0.9);
          const c2 = Math.sin((px + py) * 0.04 + time * 0.8);
          const caustic = c1 + c2;

          if (caustic > 0.65) {
            // Bright in shallows, fading over deep abyss
            const alpha = Math.min(0.35, (0.15 + distNorm * 0.3) * (caustic - 0.65) * 1.5);
            ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
            const sz = Math.max(1, Math.floor(2 * scale));
            ctx.fillRect(px, py, sz, sz);
          }
        }
      }
    }

    // =========================================================================
    // STEP 7: NORTHERN BANK OVERHANG CAST SHADOW (Recesses water below bank)
    // =========================================================================
    const shadowSteps = 16;
    for (let step = 0; step < shadowSteps; step++) {
      const alpha = (1 - step / shadowSteps) * 0.55;
      ctx.strokeStyle = `rgba(4, 2, 12, ${alpha})`;
      ctx.lineWidth = Math.max(1, Math.floor(2 * scale));
      ctx.beginPath();
      ctx.arc(
        centerScreen.x,
        waterScreenY - ry * 0.98 + step * 1.2 * scale,
        rx * 0.96,
        Math.PI * 1.05,
        Math.PI * 1.95
      );
      ctx.stroke();
    }

    // =========================================================================
    // STEP 8: RISING BIOLUMINESCENT PLANKTON MOTES & STARLIGHT GLINTS
    // =========================================================================
    this.biomotes.forEach(mote => {
      const ms = camera.worldToScreen(this.centerX + mote.x, this.centerY + mote.y + (drop * 0.45) / scale);
      ctx.fillStyle = `rgba(125, 211, 252, ${mote.alpha})`;
      ctx.fillRect(Math.floor(ms.x), Math.floor(ms.y), Math.floor(mote.size * scale), Math.floor(mote.size * scale));
    });

    this.glints.forEach(st => {
      const alpha = 0.25 + Math.sin(time * st.speed + st.phase) * 0.45;
      ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`;
      const screenPos = camera.worldToScreen(this.centerX + st.x, this.centerY + st.y + (drop * 0.45) / scale);
      ctx.fillRect(Math.floor(screenPos.x), Math.floor(screenPos.y), Math.floor(st.size * scale), Math.floor(st.size * scale));
    });

    // =========================================================================
    // STEP 9: STEPPED PIXEL WATER FOAM FRINGE (Shoreline Lapping)
    // =========================================================================
    const foamFrame = Math.floor(time * 2.8) % 4;
    const foamCount = 48;
    const foamColors = [
      'rgba(125, 211, 252, 0.40)',
      'rgba(186, 230, 253, 0.55)',
      'rgba(224, 242, 254, 0.65)',
      'rgba(125, 211, 252, 0.35)'
    ];
    ctx.fillStyle = foamColors[foamFrame];

    for (let i = 0; i < foamCount; i++) {
      const a = (i / foamCount) * Math.PI * 2 + (foamFrame * 0.04);
      const fx = centerScreen.x + Math.cos(a) * (rx - 4 * scale);
      const fy = waterScreenY + Math.sin(a) * (ry - 4 * scale);
      const fSize = (2 + ((i + foamFrame) % 3)) * scale;
      ctx.fillRect(Math.floor(fx), Math.floor(fy), Math.floor(fSize), Math.floor(fSize));
    }

    // =========================================================================
    // STEP 10: RADIATING STEPPED PIXEL WATER RIPPLES
    // =========================================================================
    this.ripples.forEach(rip => {
      const rScreen = camera.worldToScreen(rip.x, rip.y + (drop * 0.45) / scale);
      ctx.strokeStyle = `rgba(125, 211, 252, ${rip.alpha * 0.85})`;
      ctx.lineWidth = Math.max(1, Math.floor(1.5 * scale));
      ctx.beginPath();
      ctx.ellipse(rScreen.x, rScreen.y, rip.radius * scale, rip.radius * 0.65 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // =========================================================================
    // STEP 11: FLOATING LOTUS LILYPADS WITH PROJECTED FLOOR SHADOWS
    // =========================================================================
    if (this.lilypadCanvas) {
      const padImg = this.lilypadCanvas;
      this.lilypads.forEach((lp, idx) => {
        const lpScreen = camera.worldToScreen(this.centerX + lp.x, this.centerY + lp.y + (drop * 0.45) / scale);
        const bobY = Math.sin(time * 1.6 + idx) * 1.5 * scale;
        const padSize = 18 * scale;

        // Lilypad cast shadow on floor
        ctx.save();
        ctx.fillStyle = 'rgba(6, 12, 26, 0.50)';
        ctx.beginPath();
        ctx.ellipse(lpScreen.x + 2 * scale, lpScreen.y + 4 * scale, padSize * 0.45, padSize * 0.35, lp.angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Lilypad on surface
        ctx.save();
        ctx.translate(lpScreen.x, lpScreen.y + bobY);
        ctx.rotate(lp.angle);
        ctx.drawImage(padImg, -padSize / 2, -padSize / 2, padSize, padSize);
        ctx.restore();
      });
    }

    ctx.restore(); // End clipping

    // =========================================================================
    // STEP 12: HANDCRAFTED PERIMETER SHORELINE ROCKS (Dry top & Wet base)
    // =========================================================================
    this.shorelineRocks.forEach(rock => {
      const wx = this.centerX + Math.cos(rock.angle) * this.radiusX * rock.dist;
      const wy = this.centerY + Math.sin(rock.angle) * this.radiusY * rock.dist;
      const rockScreen = camera.worldToScreen(wx, wy + (drop * 0.45) / scale);

      const rw = rock.width * scale;
      const rh = rock.height * scale;

      // 1. Base Ground Contact Shadow
      ctx.fillStyle = '#0c0a1a';
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2 + 1 * scale), Math.floor(rockScreen.y - rh / 2 + 2 * scale), Math.floor(rw), Math.floor(rh));

      // 2. Main Rock Body
      ctx.fillStyle = rock.color;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2), Math.floor(rockScreen.y - rh / 2), Math.floor(rw), Math.floor(rh));

      // 3. Dark Wet Waterline Base (Lower 35% where rock meets water)
      ctx.fillStyle = rock.wetColor;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2), Math.floor(rockScreen.y + rh * 0.15), Math.floor(rw), Math.floor(rh * 0.35));

      // 4. Stepped Moonlight Top Highlight
      ctx.fillStyle = rock.highlight;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2 + 1 * scale), Math.floor(rockScreen.y - rh / 2 + 1 * scale), Math.floor(rw - 2 * scale), Math.max(1, Math.floor(rh * 0.35)));
    });

    ctx.restore();
  }
}
