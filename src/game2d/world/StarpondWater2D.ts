/**
 * StarpondWater2D.ts
 * Handcrafted 2D Pixel-Art Celestial Galaxy Pond for Wish Me Cat.
 * Upgraded with Multi-World Regional Theming:
 * Dynamically adjusts water depth gradients, sky clearing reflections, shoreline crag colors,
 * surface debris (sakura petals, bioluminescent spores, comet sparks, ice floes, spirit lilies, solar embers),
 * and aquatic fauna (Celestial Koi, Luminous Jellyfish, Comet Salmon, Ghost Rays, Solar Dragon Koi).
 */

import { Camera2D } from '../core/Camera2D';
import {
  generateCelestialKoiSpriteSheet,
  generateLotusLilypadSprite,
  generateDeepFishSpriteSheet,
  generateIceFloeSprite,
  generateAbyssalLilySprite,
  generateSolarDiskSprite,
  generateJellyfishSpriteSheet,
  generateCometFishSpriteSheet,
  generateGhostFishSpriteSheet,
  generateSolarDragonFishSpriteSheet
} from '../rendering/PixelSprites';
import { WORLD_ENVIRONMENTS, WorldEnvironmentData } from './WorldEnvironmentConfig';

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
  type: 'koi' | 'deep' | 'jellyfish' | 'comet_dart' | 'ghost' | 'dragon';
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
  name?: string;
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

  public currentRegionId: string = 'region_moonpool';

  // Pixel Assets Cache
  private koiFrames: HTMLCanvasElement[] = [];
  private deepFishFrames: HTMLCanvasElement[] = [];
  private jellyfishFrames: HTMLCanvasElement[] = [];
  private cometFishFrames: HTMLCanvasElement[] = [];
  private ghostFishFrames: HTMLCanvasElement[] = [];
  private dragonFishFrames: HTMLCanvasElement[] = [];

  // Pad/Debris Sprite Cache
  private lotusPadCanvas: HTMLCanvasElement | null = null;
  private iceFloeCanvas: HTMLCanvasElement | null = null;
  private abyssalLilyCanvas: HTMLCanvasElement | null = null;
  private solarDiskCanvas: HTMLCanvasElement | null = null;

  // Starlight Water Particles & Shimmers
  private glints: { x: number; y: number; size: number; speed: number; alpha: number; phase: number }[] = [];
  private ripples: WaterRipple[] = [];
  private lilypads: LilyPad[] = [];
  private petals: FloatingPetal[] = [];
  private shorelineRocks: { angle: number; dist: number; width: number; height: number; color: string; highlight: string; wetColor: string }[] = [];

  // Active Regional Swimming Fish Roster
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

    this.initSpriteCache();
    this.setRegion('region_moonpool');
  }

  private initSpriteCache(): void {
    this.koiFrames = generateCelestialKoiSpriteSheet();
    this.deepFishFrames = generateDeepFishSpriteSheet();
    this.jellyfishFrames = generateJellyfishSpriteSheet();
    this.cometFishFrames = generateCometFishSpriteSheet();
    this.ghostFishFrames = generateGhostFishSpriteSheet();
    this.dragonFishFrames = generateSolarDragonFishSpriteSheet();

    this.lotusPadCanvas = generateLotusLilypadSprite();
    this.iceFloeCanvas = generateIceFloeSprite();
    this.abyssalLilyCanvas = generateAbyssalLilySprite();
    this.solarDiskCanvas = generateSolarDiskSprite();
  }

  /**
   * Set regional environment and repopulate water elements according to world configuration
   */
  public setRegion(regionId: string): void {
    this.currentRegionId = regionId;
    const config = WORLD_ENVIRONMENTS[regionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    // 1. Generate Sparkles in Clearing
    this.glints = [];
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

    // 2. Set Up Multi-Depth Swimming Fish Roster from Region Config
    this.fishRoster = [];
    config.creatures.forEach((creature, idx) => {
      this.fishRoster.push({
        type: creature.type,
        depth: creature.depth,
        angle: (idx * 1.6) + Math.random() * 0.4,
        speed: creature.speed,
        orbitRx: this.radiusX * creature.orbitRxRatio,
        orbitRy: this.radiusY * creature.orbitRyRatio,
        orbitCenterX: (idx % 2 === 0 ? -1 : 1) * 8,
        orbitCenterY: (idx % 3 === 0 ? 6 : -6),
        baseWidth: creature.baseWidth,
        baseHeight: creature.baseHeight,
        tailPhase: idx * 1.2,
        name: creature.name
      });
    });

    // 3. Floating Surface Debris Tailored to World (Petals, Spores, Ice Shards, Ember Sparks)
    this.petals = [];
    const debrisColors = config.water.debrisColors;
    const debrisCount = config.water.debrisType === 'comet_sparks' ? 36 : 28;
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.70;
      this.petals.push({
        x: Math.cos(angle) * this.radiusX * r,
        y: Math.sin(angle) * this.radiusY * r,
        color: debrisColors[i % debrisColors.length],
        phase: Math.random() * Math.PI * 2,
        size: Math.random() > 0.5 ? 2.5 : 2.0,
        driftVx: (Math.random() - 0.5) * 2.5,
        driftVy: (Math.random() - 0.5) * 2.5
      });
    }

    // 4. Clustered Lily Pads / Ice Floes / Sun Disks
    this.lilypads = [];
    const clusters = [
      // Top-Left Cluster
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

    // 5. Shoreline Perimeter Rocks with World Color Themes
    this.shorelineRocks = [];
    const rockCount = 48;
    const palettes = config.water.shorelineColors;
    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2;
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

    // 3. Update Drifting Floating Petals / Debris
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
    const config = WORLD_ENVIRONMENTS[this.currentRegionId] || WORLD_ENVIRONMENTS['region_moonpool'];
    const centerScreen = camera.worldToScreen(this.centerX, this.centerY);
    const scale = camera.zoom;
    const rx = this.radiusX * scale;
    const ry = this.radiusY * scale;
    const drop = this.cliffHeight * scale;

    ctx.save();

    // =========================================================================
    // STEP 1: SUNKEN BASIN NORTHERN EMBANKMENT DROP-OFF (Z-Depth Perspective)
    // =========================================================================
    ctx.fillStyle = config.palette.cliffDrop;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 6 * scale, rx + 10 * scale, ry + drop + 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped inner rock cliff wall along northern rim
    const [cr, cg, cb] = config.water.cliffRgb;
    for (let step = Math.floor(drop); step > 0; step -= Math.max(1, Math.floor(2 * scale))) {
      const t = step / drop;
      const r = Math.floor(cr + (1 - t) * 20);
      const g = Math.floor(cg + (1 - t) * 20);
      const b = Math.floor(cb + (1 - t) * 35);
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

    // Deep water bed base
    ctx.fillStyle = config.water.bedColor;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clip to water boundary for all liquid & submerged effects
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, waterScreenY, rx - 1, ry - 1, 0, 0, Math.PI * 2);
    ctx.clip();

    // =========================================================================
    // STEP 3: ORGANIC LAYERED WATER DEPTH GRADIENT
    // =========================================================================
    const waterGrad = ctx.createRadialGradient(
      centerScreen.x - 8 * scale,
      waterScreenY + 6 * scale,
      rx * 0.15,
      centerScreen.x,
      waterScreenY,
      rx
    );
    const stops = config.water.gradientStops;
    waterGrad.addColorStop(0.00, stops[0]);
    waterGrad.addColorStop(0.35, stops[1]);
    waterGrad.addColorStop(0.65, stops[2]);
    waterGrad.addColorStop(0.85, stops[3]);
    waterGrad.addColorStop(1.00, stops[4]);

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
    // STEP 4: ORGANIC SHIMMERING SKY CLEARING REFLECTION
    // =========================================================================
    const skyOx = -8 * scale;
    const skyOy = 12 * scale;
    const skyRx = rx * 0.46;
    const skyRy = ry * 0.42;

    const wavePulse = Math.sin(time * 0.8) * 0.04;
    // Outer sky reflection halo
    ctx.fillStyle = config.water.reflectionHalo;
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

    // Mid sky clearing reflection
    ctx.fillStyle = config.water.reflectionMid;
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

    // Inner luminous sky reflection core
    ctx.fillStyle = config.water.reflectionCore;
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

    // Specular Light Crests in Reflection
    const glintCol = config.water.glintColors[0] || '#ffffff';
    this.glints.forEach(st => {
      const alpha = 0.35 + Math.sin(time * st.speed * 2 + st.phase) * 0.55;
      const gPos = camera.worldToScreen(this.centerX + st.x + skyOx / scale, this.centerY + st.y + (drop * 0.45 + skyOy) / scale);
      ctx.fillStyle = glintCol === '#ffffff' ? `rgba(255, 255, 255, ${alpha})` : `${glintCol}`;
      ctx.fillRect(Math.floor(gPos.x), Math.floor(gPos.y), Math.floor(st.size * scale), Math.floor(st.size * scale));
    });

    // =========================================================================
    // STEP 5: WARM / CELESTIAL PIER LANTERN REFLECTIONS
    // =========================================================================
    this.lanternReflections.forEach((lr, idx) => {
      const lPos = camera.worldToScreen(this.centerX + lr.x, this.centerY + lr.y + (drop * 0.45) / scale);
      const lPulse = Math.sin(time * 1.5 + idx * 1.2) * (2 * scale);
      const lrx = lr.rx * scale + lPulse;
      const lry = lr.ry * scale + lPulse * 0.6;

      ctx.fillStyle = config.palette.lightingColor;
      ctx.beginPath();
      ctx.ellipse(lPos.x, lPos.y, lrx, lry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = config.palette.lightingPulseColor;
      ctx.beginPath();
      ctx.ellipse(lPos.x, lPos.y, lrx * 0.55, lry * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(lPos.x - 1 * scale), Math.floor(lPos.y - 1 * scale), Math.floor(2 * scale), Math.floor(2 * scale));
    });

    // =========================================================================
    // STEP 6: VOLUMETRIC 3D SHADED FISH WITH DYNAMIC CAST SHADOWS (Multi-Depth)
    // =========================================================================
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

      // 2. Select Animated Sprite Frame based on fish type
      let frames: HTMLCanvasElement[] = this.koiFrames;
      if (fish.type === 'deep') frames = this.deepFishFrames;
      else if (fish.type === 'jellyfish') frames = this.jellyfishFrames;
      else if (fish.type === 'comet_dart') frames = this.cometFishFrames;
      else if (fish.type === 'ghost') frames = this.ghostFishFrames;
      else if (fish.type === 'dragon') frames = this.dragonFishFrames;

      if (frames && frames.length > 0) {
        const animIdx = Math.floor(time * 6 + fish.tailPhase) % frames.length;
        const fishCanvas = frames[animIdx];

        ctx.save();
        ctx.translate(fScreen.x, fScreen.y);
        ctx.rotate(heading);

        // Draw volumetric fish sprite
        ctx.drawImage(fishCanvas, -fw / 2, -fh / 2, fw, fh);

        // Water absorption tint for submerged fish
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
    // STEP 8: CLUSTERED LILY PADS / ICE FLOES / SUN DISKS
    // =========================================================================
    let padImg = this.lotusPadCanvas;
    if (config.water.padStyle === 'ice') padImg = this.iceFloeCanvas;
    else if (config.water.padStyle === 'phantom') padImg = this.abyssalLilyCanvas;
    else if (config.water.padStyle === 'ancient_gold') padImg = this.solarDiskCanvas;

    if (padImg) {
      this.lilypads.forEach((lp, idx) => {
        const lpScreen = camera.worldToScreen(this.centerX + lp.x, this.centerY + lp.y + (drop * 0.45) / scale);
        const bobY = Math.sin(time * 1.5 + idx * 0.7) * 1.5 * scale;
        const padSize = 18 * scale * lp.sizeScale;

        // Soft Dark Drop Shadow
        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 14, 0.55)';
        ctx.beginPath();
        ctx.ellipse(lpScreen.x + 2 * scale, lpScreen.y + 4 * scale, padSize * 0.48, padSize * 0.38, lp.angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sprite on Surface
        ctx.save();
        ctx.translate(lpScreen.x, lpScreen.y + bobY);
        ctx.rotate(lp.angle);
        ctx.drawImage(padImg, -padSize / 2, -padSize / 2, padSize, padSize);
        ctx.restore();
      });
    }

    // =========================================================================
    // STEP 9: FLOATING SURFACE DEBRIS (Petals, Spores, Ice Shards, Comet Dust)
    // =========================================================================
    this.petals.forEach(pet => {
      const pScreen = camera.worldToScreen(this.centerX + pet.x, this.centerY + pet.y + (drop * 0.45) / scale);
      const pBob = Math.sin(time * 2.0 + pet.phase) * 1.2 * scale;
      const pSize = pet.size * scale;

      // Contact shadow
      ctx.fillStyle = 'rgba(3, 8, 18, 0.45)';
      ctx.fillRect(Math.floor(pScreen.x + 1 * scale), Math.floor(pScreen.y + 2 * scale), Math.floor(pSize), Math.floor(pSize));

      // Floating body
      ctx.fillStyle = pet.color;
      ctx.fillRect(Math.floor(pScreen.x), Math.floor(pScreen.y + pBob), Math.floor(pSize), Math.floor(pSize));
    });

    // =========================================================================
    // STEP 10: INNER SHORELINE DROP SHADOW
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
    // STEP 12: HANDCRAFTED PERIMETER SHORELINE ROCKS
    // =========================================================================
    this.shorelineRocks.forEach(rock => {
      const wx = this.centerX + Math.cos(rock.angle) * this.radiusX * rock.dist;
      const wy = this.centerY + Math.sin(rock.angle) * this.radiusY * rock.dist;
      const rockScreen = camera.worldToScreen(wx, wy + (drop * 0.45) / scale);

      const rw = rock.width * scale;
      const rh = rock.height * scale;

      // 1. Base Ground Contact Shadow
      ctx.fillStyle = config.palette.cliffDrop;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2 + 1 * scale), Math.floor(rockScreen.y - rh / 2 + 2 * scale), Math.floor(rw), Math.floor(rh));

      // 2. Main Rock Body
      ctx.fillStyle = rock.color;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2), Math.floor(rockScreen.y - rh / 2), Math.floor(rw), Math.floor(rh));

      // 3. Dark Wet Waterline Base
      ctx.fillStyle = rock.wetColor;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2), Math.floor(rockScreen.y + rh * 0.15), Math.floor(rw), Math.floor(rh * 0.35));

      // 4. Stepped Top Highlight
      ctx.fillStyle = rock.highlight;
      ctx.fillRect(Math.floor(rockScreen.x - rw / 2 + 1 * scale), Math.floor(rockScreen.y - rh / 2 + 1 * scale), Math.floor(rw - 2 * scale), Math.max(1, Math.floor(rh * 0.35)));
    });

    ctx.restore();
  }
}
