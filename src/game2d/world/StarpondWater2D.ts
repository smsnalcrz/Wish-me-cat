/**
 * StarpondWater2D.ts
 * Handcrafted 2D Pixel-Art Celestial Galaxy Pond for Wish Me Cat.
 * Upgraded with Organic Layered Water Depth, Sky Clearing Reflections,
 * Clustered Lilypads with Floor Shadows, Floating Petals, Warm Lantern Reflections,
 * and Volumetric 3D Shaded Fish with Dynamic Cast Shadows across Multi-Depth Tiers.
 */

import { Camera2D } from '../core/Camera2D';
import {
  generateCelestialKoiSpriteSheet,
  generateLotusLilypadSprite,
  generateDeepFishSpriteSheet
} from '../rendering/PixelSprites';

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
  sizeScale: number;
}

export interface SwimmingFish {
  type: 'koi' | 'deep';
  depth: number; // 0.88 = surface, 0.58 = mid, 0.25 = deep
  angle: number;
  speed: number;
  orbitRx: number;
  orbitRy: number;
  orbitCenterX: number;
  orbitCenterY: number;
  baseWidth: number;
  baseHeight: number;
  tailPhase: number;
}

export interface FloatingPetal {
  x: number;
  y: number;
  color: string;
  phase: number;
  size: number;
  driftVx: number;
  driftVy: number;
}

export interface LanternReflection {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export class StarpondWater2D {
  public centerX: number = 0;
  public centerY: number = 0;
  public radiusX: number = 135; // Pixel-proportioned cosmic pond
  public radiusY: number = 115;
  public cliffHeight: number = 14; // Sunken basin cliff drop

  // Pixel Assets
  private koiFrames: HTMLCanvasElement[] = [];
  private deepFishFrames: HTMLCanvasElement[] = [];
  private lilypadCanvas: HTMLCanvasElement | null = null;

  // Starlight Water Particles & Shimmers
  private glints: { x: number; y: number; size: number; speed: number; alpha: number; phase: number }[] = [];
  private ripples: WaterRipple[] = [];
  private lilypads: LilyPad[] = [];
  private petals: FloatingPetal[] = [];
  private shorelineRocks: { angle: number; dist: number; width: number; height: number; color: string; highlight: string; wetColor: string }[] = [];

  // Enhanced Multi-Depth Swimming Fish
  private fishRoster: SwimmingFish[] = [];

  // Pier Lantern Reflection Coordinates (relative to pond center)
  private lanternReflections: LanternReflection[] = [
    { x: 10, y: 110, rx: 24, ry: 16 },   // South Pier Lantern
    { x: 10, y: -110, rx: 24, ry: 16 },  // North Pier Lantern
    { x: 125, y: -8, rx: 16, ry: 24 },   // East Pier Lantern
    { x: -125, y: -8, rx: 16, ry: 24 },  // West Pier Lantern
  ];

  constructor(centerX: number = 0, centerY: number = 0) {
    this.centerX = centerX;
    this.centerY = centerY;

    this.koiFrames = generateCelestialKoiSpriteSheet();
    this.deepFishFrames = generateDeepFishSpriteSheet();
    this.lilypadCanvas = generateLotusLilypadSprite();

    // 1. Generate Starlight Sparkles in Clearing
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.70;
      this.glints.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        size: Math.random() > 0.6 ? 2 : 1,
        speed: 0.3 + Math.random() * 0.5,
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 2. Multi-Depth Swimming Fish Roster (Varying Depths, Volumetric Shading, Cast Shadows)
    this.fishRoster = [
      // Surface Vibrant Celestial Koi (z = 0.88, crisp, full size, near shadow)
      {
        type: 'koi',
        depth: 0.88,
        angle: 0.4,
        speed: 0.30,
        orbitRx: this.radiusX * 0.48,
        orbitRy: this.radiusY * 0.46,
        orbitCenterX: -6,
        orbitCenterY: 10,
        baseWidth: 26,
        baseHeight: 16,
        tailPhase: 0
      },
      // Mid-Depth Starlight Koi (z = 0.58, slightly softened, medium shadow)
      {
        type: 'koi',
        depth: 0.58,
        angle: 3.4,
        speed: 0.26,
        orbitRx: this.radiusX * 0.42,
        orbitRy: this.radiusY * 0.40,
        orbitCenterX: 8,
        orbitCenterY: -4,
        baseWidth: 24,
        baseHeight: 15,
        tailPhase: 1.8
      },
      // Deep Abyssal Stargazer (z = 0.22, deep shadow silhouette, far shadow, slow undulating swim)
      {
        type: 'deep',
        depth: 0.22,
        angle: 1.8,
        speed: 0.16,
        orbitRx: this.radiusX * 0.32,
        orbitRy: this.radiusY * 0.28,
        orbitCenterX: 0,
        orbitCenterY: -10,
        baseWidth: 32,
        baseHeight: 14,
        tailPhase: 3.5
      },
      // Agile Mid Minnow (z = 0.45, darting orbit)
      {
        type: 'deep',
        depth: 0.45,
        angle: 5.1,
        speed: 0.34,
        orbitRx: this.radiusX * 0.62,
        orbitRy: this.radiusY * 0.52,
        orbitCenterX: -12,
        orbitCenterY: -6,
        baseWidth: 20,
        baseHeight: 10,
        tailPhase: 0.8
      }
    ];

    // 3. Floating Sakura / Lotus Flower Petals on Water Surface (Reference Benchmark)
    const petalColors = ['#f472b6', '#fbcfe8', '#fda4af', '#e879f9', '#f9a8d4'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.70;
      this.petals.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        color: petalColors[i % petalColors.length],
        phase: Math.random() * Math.PI * 2,
        size: Math.random() > 0.5 ? 2.5 : 2.0,
        driftVx: (Math.random() - 0.5) * 2,
        driftVy: (Math.random() - 0.5) * 2
      });
    }

    // 4. Clustered Lily Pads with Lotus Blossoms (Grouped like the reference image!)
    const clusters = [
      // Top-Left Cluster (Near bank waterfall/embankment)
      [
        { ox: -75, oy: -55, s: 1.05 },
        { ox: -60, oy: -48, s: 0.90 },
        { ox: -88, oy: -42, s: 1.00 },
        { ox: -70, oy: -35, s: 0.85 },
        { ox: -52, oy: -60, s: 0.75 }
      ],
      // Bottom-Left Cluster
      [
        { ox: -85, oy: 38, s: 1.00 },
        { ox: -70, oy: 48, s: 0.90 },
        { ox: -92, oy: 58, s: 0.80 },
        { ox: -55, oy: 42, s: 0.85 }
      ],
      // Right Bank Cluster
      [
        { ox: 68, oy: 18, s: 1.05 },
        { ox: 82, oy: 28, s: 0.95 },
        { ox: 62, oy: 36, s: 0.85 },
        { ox: 88, oy: 45, s: 0.75 },
        { ox: 72, oy: -2, s: 0.90 }
      ],
      // Center-Right Accent Cluster
      [
        { ox: 38, oy: 55, s: 0.95 },
        { ox: 52, oy: 65, s: 0.80 },
        { ox: 30, oy: 70, s: 0.70 }
      ]
    ];

    clusters.forEach((group, cIdx) => {
      group.forEach((pad, pIdx) => {
        this.lilypads.push({
          x: pad.ox,
          y: pad.oy,
          angle: (cIdx * 1.5 + pIdx * 0.8),
          sizeScale: pad.s
        });
      });
    });

    // 5. 48 Interlocking Handcrafted Shoreline Stones with Wet Waterline Bases
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

    // 2. Update Swimming Fish
    this.fishRoster.forEach(fish => {
      fish.angle += fish.speed * delta;
      fish.tailPhase += delta * 6.5;
    });

    // 3. Update Drifting Floating Petals
    this.petals.forEach(petal => {
      petal.x += petal.driftVx * delta;
      petal.y += petal.driftVy * delta;

      // Keep inside pond boundaries
      const dx = petal.x / (this.radiusX * 0.85);
      const dy = petal.y / (this.radiusY * 0.85);
      if (dx * dx + dy * dy > 1.0) {
        petal.driftVx = -petal.driftVx;
        petal.driftVy = -petal.driftVy;
      }
    });

    // 4. Occasional Natural Water Drops / Splashes
    if (Math.random() < 0.02) {
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
    // STEP 1: SUNKEN BASIN NORTHERN EMBANKMENT DROP-OFF (Z-Depth Perspective)
    // =========================================================================
    // Outer drop shadow pit behind northern rim
    ctx.fillStyle = '#05030c';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 6 * scale, rx + 10 * scale, ry + drop + 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped inner rock cliff wall along northern rim (angles 180° to 360°)
    for (let step = Math.floor(drop); step > 0; step -= Math.max(1, Math.floor(2 * scale))) {
      const t = step / drop;
      const r = Math.floor(22 + (1 - t) * 22);
      const g = Math.floor(18 + (1 - t) * 18);
      const b = Math.floor(46 + (1 - t) * 38);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = Math.max(1, Math.floor(2.5 * scale));
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y - 2 * scale + step, rx + 1 * scale, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // =========================================================================
    // STEP 2: MAIN WATER SURFACE (Shifted down into sunken basin)
    // =========================================================================
    const waterScreenY = centerScreen.y + drop * 0.45;

    // Deep water bed base (Deepest Midnight Teal & Navy)
    ctx.fillStyle = '#06111f';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clip to water boundary for all liquid & submerged effects
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.clip();

    // =========================================================================
    // STEP 3: ORGANIC LAYERED WATER DEPTH GRADIENT (No rigid concentric ovals)
    // =========================================================================
    // Multi-stop smooth radial gradient blending from dark shaded edges to softer indigo/teal
    const waterGrad = ctx.createRadialGradient(
      centerScreen.x - 8 * scale,
      waterScreenY + 6 * scale,
      rx * 0.15,
      centerScreen.x,
      waterScreenY,
      rx
    );
    waterGrad.addColorStop(0.00, '#102742'); // Inner illuminated teal-indigo
    waterGrad.addColorStop(0.35, '#0c2036'); // Soft indigo mid-zone
    waterGrad.addColorStop(0.65, '#081728'); // Deep shaded water
    waterGrad.addColorStop(0.85, '#06111f'); // Midnight navy margin
    waterGrad.addColorStop(1.00, '#040b15'); // Abyssal perimeter

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Organic Shaded Northern Bank (Deep shadow under cliff)
    ctx.fillStyle = 'rgba(4, 8, 18, 0.45)';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY - ry * 0.40, rx * 0.88, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // =========================================================================
    // STEP 4: ORGANIC SHIMMERING SKY CLEARING REFLECTION (Reference Benchmark)
    // =========================================================================
    // In the pond clearing, render bright sky/starlight reflections with organic wave edges
    const skyOx = -8 * scale;
    const skyOy = 12 * scale;
    const skyRx = rx * 0.46;
    const skyRy = ry * 0.42;

    // Outer sky reflection halo (Deep cerulean)
    const wavePulse = Math.sin(time * 0.8) * 0.04;
    ctx.fillStyle = 'rgba(29, 78, 216, 0.35)';
    ctx.beginPath();
    ctx.ellipse(
      centerScreen.x + skyOx,
      waterScreenY + skyOy,
      skyRx * (1.18 + wavePulse),
      skyRy * (1.18 + wavePulse),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Mid sky blue clearing reflection
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.ellipse(
      centerScreen.x + skyOx,
      waterScreenY + skyOy,
      skyRx * (1.00 + wavePulse),
      skyRy * (0.95 + wavePulse),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner luminous sky reflection core (Bright Sky Cyan)
    ctx.fillStyle = 'rgba(125, 211, 252, 0.65)';
    ctx.beginPath();
    ctx.ellipse(
      centerScreen.x + skyOx,
      waterScreenY + skyOy,
      skyRx * (0.72 + wavePulse),
      skyRy * (0.68 + wavePulse),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Dithered Specular Light Crests in Reflection (Sparkling white & cyan glints)
    this.glints.forEach(st => {
      const alpha = 0.35 + Math.sin(time * st.speed * 2 + st.phase) * 0.55;
      const gPos = camera.worldToScreen(this.centerX + st.x + skyOx / scale, this.centerY + st.y + (drop * 0.45 + skyOy) / scale);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(Math.floor(gPos.x), Math.floor(gPos.y), Math.floor(st.size * scale), Math.floor(st.size * scale));
    });

    // =========================================================================
    // STEP 5: WARM LOCALIZED PIER LANTERN REFLECTIONS
    // =========================================================================
    this.lanternReflections.forEach((lr, idx) => {
      const lPos = camera.worldToScreen(this.centerX + lr.x, this.centerY + lr.y + (drop * 0.45) / scale);
      const lPulse = Math.sin(time * 1.5 + idx * 1.2) * (2 * scale);
      const lrx = lr.rx * scale + lPulse;
      const lry = lr.ry * scale + lPulse * 0.6;

      // Outer warm golden glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.beginPath();
      ctx.ellipse(lPos.x, lPos.y, lrx, lry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Core amber reflection
      ctx.fillStyle = 'rgba(254, 240, 138, 0.40)';
      ctx.beginPath();
      ctx.ellipse(lPos.x, lPos.y, lrx * 0.55, lry * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular bright center
      ctx.fillStyle = 'rgba(255, 255, 245, 0.65)';
      ctx.fillRect(Math.floor(lPos.x - 1 * scale), Math.floor(lPos.y - 1 * scale), Math.floor(2 * scale), Math.floor(2 * scale));
    });

    // =========================================================================
    // STEP 6: VOLUMETRIC 3D SHADED FISH WITH DYNAMIC CAST SHADOWS (Multi-Depth)
    // =========================================================================
    // Sort fish so deepest fish render first, surface fish render on top
    const sortedFish = [...this.fishRoster].sort((a, b) => a.depth - b.depth);

    sortedFish.forEach(fish => {
      const fx = this.centerX + fish.orbitCenterX + Math.cos(fish.angle) * fish.orbitRx;
      const fy = this.centerY + fish.orbitCenterY + Math.sin(fish.angle) * fish.orbitRy;
      const fScreen = camera.worldToScreen(fx, fy + (drop * 0.45) / scale);

      const heading = fish.angle + Math.PI / 2;
      const depthScale = 0.65 + fish.depth * 0.35;
      const fw = fish.baseWidth * scale * depthScale;
      const fh = fish.baseHeight * scale * depthScale;

      // 1. Dynamic Cast Shadow onto Deeper Water Bed
      // Deeper fish have shadows offset further down-right; surface fish have tight shadows
      const shadowDistX = (3 + (1.0 - fish.depth) * 6) * scale;
      const shadowDistY = (4 + (1.0 - fish.depth) * 14) * scale;
      const shadowAlpha = 0.25 + fish.depth * 0.35;

      ctx.save();
      ctx.translate(fScreen.x + shadowDistX, fScreen.y + shadowDistY);
      ctx.rotate(heading);
      ctx.fillStyle = `rgba(2, 6, 16, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, fw * 0.45, fh * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Select Animated Sprite Frame
      const frames = fish.type === 'koi' ? this.koiFrames : this.deepFishFrames;
      if (frames.length > 0) {
        const animIdx = Math.floor(time * 6 + fish.tailPhase) % frames.length;
        const fishCanvas = frames[animIdx];

        ctx.save();
        ctx.translate(fScreen.x, fScreen.y);
        ctx.rotate(heading);

        // Draw clean volumetric fish sprite
        ctx.drawImage(fishCanvas, -fw / 2, -fh / 2, fw, fh);

        // Water absorption tint for submerged fish (uses source-atop to NEVER leak a box!)
        if (fish.depth < 0.75) {
          const tintAlpha = (1.0 - fish.depth) * 0.38;
          ctx.globalCompositeOperation = 'source-atop';
          ctx.fillStyle = `rgba(12, 38, 64, ${tintAlpha})`;
          ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
        }

        ctx.restore();
      }
    });

    // =========================================================================
    // STEP 7: GENTLE ANIMATED WATER RIPPLES & SPECULAR LIGHT
    // =========================================================================
    this.ripples.forEach(rip => {
      const rScreen = camera.worldToScreen(rip.x, rip.y + (drop * 0.45) / scale);
      ctx.strokeStyle = `rgba(186, 230, 253, ${rip.alpha * 0.85})`;
      ctx.lineWidth = Math.max(1, Math.floor(1.5 * scale));
      ctx.beginPath();
      ctx.ellipse(rScreen.x, rScreen.y, rip.radius * scale, rip.radius * 0.65 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // =========================================================================
    // STEP 8: CLUSTERED LILY PADS WITH DEEP DROP SHADOWS (Reference Style)
    // =========================================================================
    if (this.lilypadCanvas) {
      const padImg = this.lilypadCanvas;

      this.lilypads.forEach((lp, idx) => {
        const lpScreen = camera.worldToScreen(this.centerX + lp.x, this.centerY + lp.y + (drop * 0.45) / scale);
        const bobY = Math.sin(time * 1.5 + idx * 0.7) * 1.5 * scale;
        const padSize = 18 * scale * lp.sizeScale;

        // 1. Soft Dark Drop Shadow Grounding Lily Pad onto Water Surface
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 14, 0.55)';
        ctx.beginPath();
        ctx.ellipse(lpScreen.x + 2 * scale, lpScreen.y + 4 * scale, padSize * 0.48, padSize * 0.38, lp.angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Lilypad Sprite on Surface
        ctx.save();
        ctx.translate(lpScreen.x, lpScreen.y + bobY);
        ctx.rotate(lp.angle);
        ctx.drawImage(padImg, -padSize / 2, -padSize / 2, padSize, padSize);
        ctx.restore();
      });
    }

    // =========================================================================
    // STEP 9: FLOATING SAKURA / LOTUS FLOWER PETALS (Reference Benchmark)
    // =========================================================================
    this.petals.forEach(pet => {
      const pScreen = camera.worldToScreen(this.centerX + pet.x, this.centerY + pet.y + (drop * 0.45) / scale);
      const pBob = Math.sin(time * 2.0 + pet.phase) * 1.2 * scale;
      const pSize = pet.size * scale;

      // Petal contact shadow
      ctx.fillStyle = 'rgba(3, 8, 18, 0.45)';
      ctx.fillRect(Math.floor(pScreen.x + 1 * scale), Math.floor(pScreen.y + 2 * scale), Math.floor(pSize), Math.floor(pSize));

      // Floating Petal Body
      ctx.fillStyle = pet.color;
      ctx.fillRect(Math.floor(pScreen.x), Math.floor(pScreen.y + pBob), Math.floor(pSize), Math.floor(pSize));
    });

    // =========================================================================
    // STEP 10: INNER SHORELINE DROP SHADOW (Grounds rocks into water)
    // =========================================================================
    const shadowSteps = 16;
    for (let step = 0; step < shadowSteps; step++) {
      const alpha = (1 - step / shadowSteps) * 0.55;
      ctx.strokeStyle = `rgba(3, 2, 10, ${alpha})`;
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
    // STEP 11: STEPPED WATER FOAM FRINGE ALONG INNER SHORELINE
    // =========================================================================
    const foamFrame = Math.floor(time * 2.8) % 4;
    const foamCount = 48;
    const foamColors = [
      'rgba(125, 211, 252, 0.35)',
      'rgba(186, 230, 253, 0.50)',
      'rgba(224, 242, 254, 0.60)',
      'rgba(125, 211, 252, 0.30)'
    ];
    ctx.fillStyle = foamColors[foamFrame];

    for (let i = 0; i < foamCount; i++) {
      const a = (i / foamCount) * Math.PI * 2 + (foamFrame * 0.04);
      const fx = centerScreen.x + Math.cos(a) * (rx - 4 * scale);
      const fy = waterScreenY + Math.sin(a) * (ry - 4 * scale);
      const fSize = (2 + ((i + foamFrame) % 3)) * scale;
      ctx.fillRect(Math.floor(fx), Math.floor(fy), Math.floor(fSize), Math.floor(fSize));
    }

    ctx.restore(); // End clipping

    // =========================================================================
    // STEP 12: HANDCRAFTED PERIMETER SHORELINE ROCKS (Wet base & Dry highlight)
    // =========================================================================
    this.shorelineRocks.forEach(rock => {
      const wx = this.centerX + Math.cos(rock.angle) * this.radiusX * rock.dist;
      const wy = this.centerY + Math.sin(rock.angle) * this.radiusY * rock.dist;
      const rockScreen = camera.worldToScreen(wx, wy + (drop * 0.45) / scale);

      const rw = rock.width * scale;
      const rh = rock.height * scale;

      // 1. Base Ground Contact Shadow
      ctx.fillStyle = '#0a0818';
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
