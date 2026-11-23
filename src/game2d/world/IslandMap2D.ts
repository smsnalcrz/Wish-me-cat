/**
 * IslandMap2D.ts
 * Handcrafted 2D Pixel-Art Celestial Island Map for Wish Me Cat.
 * Full Multi-World Environment Engine:
 * Dynamically renders unique playable environments for every map:
 * - Moonpool Cove: Crescent moon, tranquil galaxy tides, sakura trees, Kasuga stone lamps
 * - Nebula Lagoon: Giant swirling dual-core planetary nebula, glowing alien water, coral trees, bio-spores
 * - Comet Falls: Cascading starlight waterfalls, continuous shooting comet showers, meteor crags, rushing embers
 * - Saturn's Ringwater: Massive Saturn gas giant with tilted concentric rings & orbiting moonlets, crystalline ice spires, diamond dust
 * - Aurora Deep: Undulating multi-layer emerald/teal/violet aurora curtains, abyssal spires, spectral ghost mist
 * - Eclipse Well: Total solar eclipse with radiant golden corona, solar prominences & gravitational distortion, obsidian ruin pillars, void embers
 */

import { Camera2D } from '../core/Camera2D';
import { StarpondWater2D } from './StarpondWater2D';
import { StationManager2D, InteractiveStation2D } from './Station2D';
import { PixelCat } from '../entities/PixelCat';
import { WORLD_ENVIRONMENTS, WorldEnvironmentData, WorldPropDef } from './WorldEnvironmentConfig';
import {
  generateSakuraTreeSprite,
  generatePineTreeSprite,
  generateCrystalClusterSprite,
  generateStoneLanternSprite,
  generateWeepingWillowSprite,
  generateBioluminescentMushroomSprite,
  generateCoralTreeSprite,
  generateAlienMushroomSprite,
  generateMeteorCragSprite,
  generateIceSpireSprite,
  generateIceClusterSprite,
  generateAbyssalSpireSprite,
  generateEclipsePillarSprite,
  generateVoidMonolithSprite
} from '../rendering/PixelSprites';

export interface TreeProp {
  x: number;
  y: number;
  radius: number;
  type: string;
}

export interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  size: number;
  color: string;
  phase: number;
}

export class IslandMap2D {
  public width: number = 720;
  public height: number = 620;
  public islandRadiusX: number = 300;
  public islandRadiusY: number = 250;

  public water: StarpondWater2D;
  public stationManager: StationManager2D;

  // Active Environment Props
  public trees: WorldPropDef[] = [];
  private spaceStars: { x: number; y: number; size: number; speed: number; alpha: number; color: string }[] = [];
  private ambientParticles: AmbientParticle[] = [];
  private shootingStars: { x: number; y: number; vx: number; vy: number; len: number; alpha: number; timer: number; color: string }[] = [];
  private fireflies: { x: number; y: number; baseX: number; baseY: number; phase: number; speed: number; color: string }[] = [];

  // Ground Grass Tufts & Wildflowers
  private grassTufts: { x: number; y: number; color: string; width: number; height: number; type: 'grass' | 'flower' }[] = [];
  private cobblestones: { x: number; y: number; w: number; h: number; color: string }[] = [];

  // Cached Pixel Sprites
  private sakuraCanvas: HTMLCanvasElement | null = null;
  private pineCanvas: HTMLCanvasElement | null = null;
  private crystalCanvas: HTMLCanvasElement | null = null;
  private lampCanvas: HTMLCanvasElement | null = null;
  private willowCanvas: HTMLCanvasElement | null = null;
  private mushroomCanvas: HTMLCanvasElement | null = null;
  private coralCanvas: HTMLCanvasElement | null = null;
  private alienMushroomCanvas: HTMLCanvasElement | null = null;
  private meteorCanvas: HTMLCanvasElement | null = null;
  private iceSpireCanvas: HTMLCanvasElement | null = null;
  private iceClusterCanvas: HTMLCanvasElement | null = null;
  private abyssalSpireCanvas: HTMLCanvasElement | null = null;
  private eclipsePillarCanvas: HTMLCanvasElement | null = null;
  private voidMonolithCanvas: HTMLCanvasElement | null = null;

  // Current Regional Theme
  public currentRegionId: string = 'region_moonpool';
  private simTime: number = 0;

  constructor() {
    this.water = new StarpondWater2D(0, 0);
    this.stationManager = new StationManager2D();
    this.initSprites();
    this.setRegion('region_moonpool');
  }

  private initSprites(): void {
    this.sakuraCanvas = generateSakuraTreeSprite();
    this.pineCanvas = generatePineTreeSprite();
    this.crystalCanvas = generateCrystalClusterSprite();
    this.lampCanvas = generateStoneLanternSprite();
    this.willowCanvas = generateWeepingWillowSprite();
    this.mushroomCanvas = generateBioluminescentMushroomSprite();
    this.coralCanvas = generateCoralTreeSprite();
    this.alienMushroomCanvas = generateAlienMushroomSprite();
    this.meteorCanvas = generateMeteorCragSprite();
    this.iceSpireCanvas = generateIceSpireSprite();
    this.iceClusterCanvas = generateIceClusterSprite();
    this.abyssalSpireCanvas = generateAbyssalSpireSprite();
    this.eclipsePillarCanvas = generateEclipsePillarSprite();
    this.voidMonolithCanvas = generateVoidMonolithSprite();
  }

  /**
   * Set regional environment and smoothly transition all visual systems to target world
   */
  public setRegion(regionId: string): void {
    this.currentRegionId = regionId;
    const config = WORLD_ENVIRONMENTS[regionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    // 1. Update Water Environment
    this.water.setRegion(regionId);

    // 2. Set Regional Props
    this.trees = [...config.props];

    // 3. Generate Distant Parallax Stars
    this.spaceStars = [];
    const starColors = config.palette.starColors;
    for (let i = 0; i < 110; i++) {
      this.spaceStars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        size: Math.random() > 0.8 ? 2 : 1,
        speed: 0.1 + Math.random() * 0.3,
        alpha: 0.2 + Math.random() * 0.8,
        color: starColors[i % starColors.length]
      });
    }

    // 4. Generate Regional Ambient Particles (Petals, Spores, Sparks, Diamond Dust, Mist, Embers)
    this.ambientParticles = [];
    const partCfg = config.particles;
    for (let i = 0; i < partCfg.count; i++) {
      this.ambientParticles.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 500,
        vx: partCfg.speedX + (Math.random() - 0.5) * 10,
        vy: partCfg.speedY + (Math.random() - 0.5) * 8,
        rot: Math.random() * Math.PI * 2,
        size: Math.random() > 0.6 ? 3 : 2,
        color: partCfg.colors[i % partCfg.colors.length],
        phase: Math.random() * Math.PI * 2
      });
    }

    // 5. Generate Shooting Stars / Comets (Higher density in Comet Falls)
    this.shootingStars = [];
    const cometCount = regionId === 'region_comet_falls' ? 8 : 3;
    for (let i = 0; i < cometCount; i++) {
      this.shootingStars.push({
        x: -500 + Math.random() * 400,
        y: -400 - Math.random() * 200,
        vx: (regionId === 'region_comet_falls' ? 480 : 340) + Math.random() * 160,
        vy: (regionId === 'region_comet_falls' ? 360 : 240) + Math.random() * 120,
        len: (regionId === 'region_comet_falls' ? 70 : 45) + Math.random() * 30,
        alpha: 0,
        timer: i * (regionId === 'region_comet_falls' ? 1.2 : 3.5) + Math.random() * 1.5,
        color: regionId === 'region_comet_falls' ? (i % 2 === 0 ? '#fde047' : '#f97316') : (i % 2 === 0 ? '#38bdf8' : '#fef08a')
      });
    }

    // 6. Generate Ground Grass Tufts & Wildflowers / Spores with World Palette
    this.grassTufts = [];
    const grassColors = config.palette.grassColors;
    const flowerColors = config.palette.flowerColors;
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.54 + Math.random() * 0.40;
      const x = Math.cos(angle) * this.islandRadiusX * r;
      const y = Math.sin(angle) * this.islandRadiusY * r;

      const isFlower = i % 3 === 0;
      const color = isFlower
        ? flowerColors[Math.floor(i / 3) % flowerColors.length]
        : grassColors[i % grassColors.length];

      this.grassTufts.push({
        x,
        y,
        color,
        width: isFlower ? 3 : 2,
        height: isFlower ? 3 : 4,
        type: isFlower ? 'flower' : 'grass'
      });
    }

    // 7. Generate Handcrafted Cobblestones along pathways with World Palette
    this.cobblestones = [];
    this.generatePathCobblestones(config.palette.pathColors);

    // 8. Regional Atmospheric Floating Wisps
    this.fireflies = [];
    const ffColors = config.particles.colors;
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.45 + Math.random() * 0.45;
      const bx = Math.cos(angle) * this.islandRadiusX * r;
      const by = Math.sin(angle) * this.islandRadiusY * r;
      this.fireflies.push({
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.2,
        color: ffColors[i % ffColors.length]
      });
    }
  }

  private generatePathCobblestones(pathColors: string[]): void {
    // Stepping stones around pond ring
    const ringCount = 64;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const dist = 1.14 + (Math.sin(i * 4) * 0.03);
      const x = Math.cos(angle) * this.water.radiusX * dist;
      const y = Math.sin(angle) * this.water.radiusY * dist;
      this.cobblestones.push({
        x,
        y,
        w: 6 + (i % 4) * 2,
        h: 5 + ((i + 1) % 3) * 2,
        color: pathColors[i % pathColors.length]
      });
    }

    // Stepping stones branching to stations
    this.stationManager.stations.forEach(st => {
      const steps = 10;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = st.x * t;
        const y = st.y * t;
        const dPond = Math.hypot(x / this.water.radiusX, y / this.water.radiusY);
        if (dPond > 1.1) {
          this.cobblestones.push({
            x: x + (Math.sin(s * 2) * 4),
            y: y + (Math.cos(s * 2) * 4),
            w: 5 + (s % 3) * 2,
            h: 4 + (s % 2) * 2,
            color: pathColors[(s + (s % 2)) % pathColors.length]
          });
        }
      }
    });
  }

  public update(delta: number): void {
    this.water.update(delta);
    this.simTime += delta;
    const config = WORLD_ENVIRONMENTS[this.currentRegionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    // Update Ambient Particles
    const swayAmp = config.particles.sway;
    for (const p of this.ambientParticles) {
      const wind = Math.sin(this.simTime * 2.2 + p.phase) * swayAmp;
      p.x += (p.vx + wind) * delta;
      p.y += p.vy * delta;
      p.rot += delta * 1.5;

      // Wrap-around
      if (p.y > 350) p.y = -350;
      if (p.y < -350) p.y = 350;
      if (p.x > 400) p.x = -400;
      if (p.x < -400) p.x = 400;
    }

    // Streaking Shooting Stars / Comets
    for (const ss of this.shootingStars) {
      ss.timer -= delta;
      if (ss.timer <= 0) {
        ss.x += ss.vx * delta;
        ss.y += ss.vy * delta;
        ss.alpha = Math.min(1.0, ss.alpha + delta * 3.0);
        if (ss.y > 550 || ss.x > 850) {
          ss.x = -650 + Math.random() * 400;
          ss.y = -450 - Math.random() * 150;
          ss.alpha = 0;
          ss.timer = (this.currentRegionId === 'region_comet_falls' ? 1.0 : 3.5) + Math.random() * 2.5;
        }
      }
    }

    // Atmospheric Floating Wisps
    for (const ff of this.fireflies) {
      ff.phase += ff.speed * delta;
      ff.x = ff.baseX + Math.sin(ff.phase) * 14;
      ff.y = ff.baseY + Math.cos(ff.phase * 0.8) * 10;
    }
  }

  // Check and resolve 2D player collision with island boundaries and structures
  public resolveCollision(cat: PixelCat): void {
    let nextX = cat.x;
    let nextY = cat.y;

    // 1. Outer Island Perimeter Boundary Clamp
    const normX = nextX / this.islandRadiusX;
    const normY = nextY / this.islandRadiusY;
    const distOuterSq = normX * normX + normY * normY;

    if (distOuterSq > 0.88 * 0.88) {
      const dist = Math.sqrt(distOuterSq);
      const maxDist = 0.88;
      nextX = (normX / dist) * this.islandRadiusX * maxDist;
      nextY = (normY / dist) * this.islandRadiusY * maxDist;
    }

    // 2. Starpond Water Collision with Pier Corridor Openings
    const pondNormX = nextX / (this.water.radiusX + 10);
    const pondNormY = nextY / (this.water.radiusY + 10);
    const distPondSq = pondNormX * pondNormX + pondNormY * pondNormY;

    if (distPondSq < 1.0) {
      let isOnPier = false;
      for (const st of this.stationManager.stations) {
        if (st.type === 'pier') {
          const pierBounds = this.stationManager.getPierWalkwayBounds(st);
          if (pierBounds) {
            if (
              nextX >= pierBounds.minX &&
              nextX <= pierBounds.maxX &&
              nextY >= pierBounds.minY &&
              nextY <= pierBounds.maxY
            ) {
              isOnPier = true;
              break;
            }
          }
        }
      }

      if (!isOnPier) {
        const pondDist = Math.sqrt(distPondSq);
        nextX = (pondNormX / pondDist) * (this.water.radiusX + 10);
        nextY = (pondNormY / pondDist) * (this.water.radiusY + 10);
      }
    }

    // 3. Station Solid Footprint Collisions
    for (const st of this.stationManager.stations) {
      if (st.type === 'pier') continue;
      const dx = nextX - st.x;
      const dy = nextY - (st.y + 10);
      const distSq = dx * dx + dy * dy;
      const minDist = st.radius * 0.65;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 1;
        nextX = st.x + (dx / dist) * minDist;
        nextY = (st.y + 10) + (dy / dist) * minDist;
      }
    }

    // 4. Large Trees & Spire Solid Collisions
    for (const tree of this.trees) {
      const dx = nextX - tree.x;
      const dy = nextY - (tree.y + 6);
      const distSq = dx * dx + dy * dy;
      const minDist = tree.radius * 0.55;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 1;
        nextX = tree.x + (dx / dist) * minDist;
        nextY = (tree.y + 6) + (dy / dist) * minDist;
      }
    }

    cat.x = nextX;
    cat.y = nextY;
  }

  // ===========================================================================
  // RENDER BASE: Space Skybox, Celestial Features, Island Crags, Turf, Pond
  // ===========================================================================
  public renderBase(ctx: CanvasRenderingContext2D, camera: Camera2D, time: number): void {
    const scale = camera.zoom;
    const config = WORLD_ENVIRONMENTS[this.currentRegionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    // 1. Deep Space Skybox Background Gradient
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, camera.viewportHeight);
    spaceGrad.addColorStop(0, config.palette.spaceBgTop);
    spaceGrad.addColorStop(1, config.palette.spaceBgBottom);
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    // 2. Parallax Distant Stars
    this.spaceStars.forEach(st => {
      const screenX = ((st.x - camera.x * 0.15) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const screenY = ((st.y - camera.y * 0.15) % camera.viewportHeight + camera.viewportHeight) % camera.viewportHeight;
      const alpha = st.alpha * (0.6 + Math.sin(time * st.speed * 4) * 0.4);
      ctx.fillStyle = st.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.floor(screenX), Math.floor(screenY), st.size, st.size);
    });
    ctx.globalAlpha = 1.0;

    // 3. Render World-Specific Celestial Phenomenon
    this.renderWorldCelestialPhenomenon(ctx, camera, time, config);

    // 4. Streaking Shooting Stars / Comets
    this.shootingStars.forEach(ss => {
      if (ss.timer <= 0 && ss.alpha > 0.01) {
        const sStart = camera.worldToScreen(ss.x, ss.y);
        const sEnd = camera.worldToScreen(ss.x - ss.vx * 0.08, ss.y - ss.vy * 0.08);

        const grad = ctx.createLinearGradient(sStart.x, sStart.y, sEnd.x, sEnd.y);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        grad.addColorStop(0.3, ss.color === '#f97316' ? `rgba(249, 115, 22, ${ss.alpha * 0.85})` : `rgba(56, 189, 248, ${ss.alpha * 0.85})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = (this.currentRegionId === 'region_comet_falls' ? 3.5 : 2) * scale;
        ctx.beginPath();
        ctx.moveTo(sStart.x, sStart.y);
        ctx.lineTo(sEnd.x, sEnd.y);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sStart.x - 1, sStart.y - 1, 3, 3);
      }
    });

    const centerScreen = camera.worldToScreen(0, 0);
    const rx = this.islandRadiusX * scale;
    const ry = this.islandRadiusY * scale;

    // 5. Floating Island Rock Cliff Base & Drop Shadow
    ctx.fillStyle = config.palette.cliffDrop;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 16 * scale, rx + 10 * scale, ry + 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped Island Cliff Wall (Dark Crag Rock with Mid & Highlight Rim)
    ctx.fillStyle = config.palette.cliffMid;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 10 * scale, rx + 2 * scale, ry + 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = config.palette.cliffHighlight;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 4 * scale, rx, ry + 2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Island Top Surface Turf (World-Specific Multi-Toned Ground)
    ctx.fillStyle = config.palette.turfOuter;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = config.palette.turfMain;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = config.palette.turfInner;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // 7. Handcrafted Stepping Cobblestone Paths
    this.renderCobblestones(ctx, camera);

    // 8. Ground Grass Tufts & Wildflowers / Spores
    this.grassTufts.forEach(tuft => {
      const p = camera.worldToScreen(tuft.x, tuft.y);
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      const s = Math.max(1, Math.floor(scale));

      if (tuft.type === 'flower') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px - s, py + s, 3 * s, 1 * s);
        ctx.fillStyle = tuft.color;
        ctx.fillRect(px - s, py - s, 3 * s, 2 * s);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py - s, 1 * s, 1 * s);
      } else {
        ctx.fillStyle = config.palette.cliffDrop;
        ctx.fillRect(px - s, py + s, 4 * s, 1 * s);
        ctx.fillStyle = tuft.color;
        ctx.fillRect(px, py - 2 * s, 1 * s, 3 * s);
        ctx.fillRect(px + 2 * s, py - 1 * s, 1 * s, 2 * s);
      }
    });

    // 9. Celestial Starpond Water
    this.water.render(ctx, camera, time);

    // 10. Wooden Pier Decks
    this.stationManager.renderPierDecks(ctx, camera);
  }

  // Render individual cobblestone pavers
  private renderCobblestones(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    const scale = camera.zoom;
    const config = WORLD_ENVIRONMENTS[this.currentRegionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    this.cobblestones.forEach(stone => {
      const p = camera.worldToScreen(stone.x, stone.y);
      const sw = stone.w * scale;
      const sh = stone.h * scale;

      // Shadow below stone
      ctx.fillStyle = config.palette.cliffDrop;
      ctx.fillRect(Math.floor(p.x - sw / 2 + 1 * scale), Math.floor(p.y - sh / 2 + 1 * scale), Math.floor(sw), Math.floor(sh));

      // Stone face
      ctx.fillStyle = stone.color;
      ctx.fillRect(Math.floor(p.x - sw / 2), Math.floor(p.y - sh / 2), Math.floor(sw), Math.floor(sh));

      // Top Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(Math.floor(p.x - sw / 2), Math.floor(p.y - sh / 2), Math.floor(sw - 1 * scale), Math.max(1, Math.floor(1 * scale)));
    });
  }

  // ===========================================================================
  // CELESTIAL SKY PHENOMENA PER WORLD
  // ===========================================================================
  private renderWorldCelestialPhenomenon(ctx: CanvasRenderingContext2D, camera: Camera2D, time: number, config: WorldEnvironmentData): void {
    const scale = camera.zoom;
    const type = config.celestial.type;

    // -------------------------------------------------------------------------
    // 0. MOONPOOL COVE: Crescent Moon & Soft Nebula Mist
    // -------------------------------------------------------------------------
    if (type === 'moon') {
      const moonX = ((camera.viewportWidth * 0.75 - camera.x * 0.08) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const moonY = 80;

      // Soft Moon Glow Aura
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 70 * scale);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      moonGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 70 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Golden Crescent Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 26 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = config.palette.spaceBgTop;
      ctx.beginPath();
      ctx.arc(moonX + 10 * scale, moonY - 4 * scale, 24 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Soft Nebula Pulses
      const nebX = ((camera.viewportWidth * 0.3 - camera.x * 0.1) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const nebGrad = ctx.createRadialGradient(nebX, 160, 20, nebX, 160, 260);
      nebGrad.addColorStop(0, config.palette.nebulaPrimary);
      nebGrad.addColorStop(0.7, config.palette.nebulaSecondary);
      nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);
    }

    // -------------------------------------------------------------------------
    // 1. NEBULA LAGOON: Swirling Dual-Core Planetary Nebula & Swimming Mantas
    // -------------------------------------------------------------------------
    else if (type === 'nebula_lagoon') {
      const cx = ((camera.viewportWidth * 0.5 - camera.x * 0.08) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const cy = 130;

      // Core 1: Radiant Magenta Swirl
      const rot = time * 0.15;
      const r1x = cx + Math.cos(rot) * (30 * scale);
      const r1y = cy + Math.sin(rot) * (20 * scale);
      const neb1 = ctx.createRadialGradient(r1x, r1y, 10, r1x, r1y, 220 * scale);
      neb1.addColorStop(0, 'rgba(232, 121, 249, 0.45)');
      neb1.addColorStop(0.5, 'rgba(192, 38, 211, 0.20)');
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

      // Core 2: Luminous Cyan Swirl
      const r2x = cx - Math.cos(rot) * (35 * scale);
      const r2y = cy - Math.sin(rot) * (25 * scale);
      const neb2 = ctx.createRadialGradient(r2x, r2y, 10, r2x, r2y, 240 * scale);
      neb2.addColorStop(0, 'rgba(34, 211, 238, 0.40)');
      neb2.addColorStop(0.5, 'rgba(6, 182, 212, 0.18)');
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

      // Distant Void Swimming Manta Silhouettes
      const mantaX = ((cx + time * 24) % (camera.viewportWidth + 200)) - 100;
      const mantaY = 90 + Math.sin(time * 0.8) * 16;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.beginPath();
      ctx.ellipse(mantaX, mantaY, 24 * scale, 10 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Manta wings
      ctx.fillStyle = 'rgba(232, 121, 249, 0.30)';
      ctx.beginPath();
      ctx.moveTo(mantaX - 16 * scale, mantaY);
      ctx.lineTo(mantaX, mantaY - 14 * scale);
      ctx.lineTo(mantaX + 8 * scale, mantaY);
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // 2. COMET FALLS: Cascading Starlight Waterfalls & Stardust River
    // -------------------------------------------------------------------------
    else if (type === 'comet_falls') {
      // Cascading Vertical Starlight Waterfalls in Upper Sky
      const fallStreams = [
        { xRatio: 0.18, w: 28, flowSpeed: 120 },
        { xRatio: 0.50, w: 42, flowSpeed: 160 },
        { xRatio: 0.82, w: 32, flowSpeed: 140 }
      ];

      fallStreams.forEach(stream => {
        const sx = ((camera.viewportWidth * stream.xRatio - camera.x * 0.1) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
        const grad = ctx.createLinearGradient(sx, 0, sx, camera.viewportHeight * 0.65);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        grad.addColorStop(0.5, 'rgba(253, 224, 71, 0.28)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(sx - (stream.w * scale) / 2, 0, stream.w * scale, camera.viewportHeight * 0.65);

        // Animated Water Shimmer Streaks
        const flowY = (time * stream.flowSpeed) % 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let y = flowY; y < camera.viewportHeight * 0.6; y += 60) {
          ctx.fillRect(sx - (stream.w * 0.3 * scale), y, stream.w * 0.6 * scale, 4 * scale);
        }
      });

      // Floating Cosmic Asteroid Crags in Background
      const astX = ((camera.viewportWidth * 0.35 - camera.x * 0.06) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(astX, 70, 48 * scale, 18 * scale, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(astX - 30 * scale, 64, 40 * scale, 6 * scale);
    }

    // -------------------------------------------------------------------------
    // 3. SATURN'S RINGWATER: Massive Saturn Gas Giant with Concentric Rings
    // -------------------------------------------------------------------------
    else if (type === 'saturn_rings') {
      const px = ((camera.viewportWidth * 0.68 - camera.x * 0.05) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const py = 120;
      const pRad = 65 * scale;

      // Soft Planet Atmosphere Glow
      const pGlow = ctx.createRadialGradient(px, py, pRad * 0.6, px, py, pRad * 1.6);
      pGlow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
      pGlow.addColorStop(0.6, 'rgba(147, 51, 234, 0.15)');
      pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pGlow;
      ctx.beginPath();
      ctx.arc(px, py, pRad * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Back Half of Rings (behind planet)
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.35); // Tilted rings
      // Ring A Outer Sheen
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.40)';
      ctx.lineWidth = 14 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 2.5, pRad * 0.65, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Cassini Division
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 2.2, pRad * 0.58, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Ring B Inner Brilliant Golden Band
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 18 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 1.8, pRad * 0.48, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Planet Sphere with Atmospheric Cloud Bands
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, pRad, 0, Math.PI * 2);
      ctx.clip();

      // Base Amber Gas
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px - pRad, py - pRad, pRad * 2, pRad * 2);

      // Horizontal Cloud Bands
      const bands = [
        { y: -0.6, h: 0.2, c: '#f59e0b' },
        { y: -0.3, h: 0.15, c: '#d97706' },
        { y: -0.1, h: 0.25, c: '#fef08a' },
        { y: 0.2, h: 0.18, c: '#f59e0b' },
        { y: 0.45, h: 0.2, c: '#78350f' },
      ];
      bands.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.fillRect(px - pRad, py + b.y * pRad, pRad * 2, b.h * pRad);
      });

      // Shadow side
      const shadowGrad = ctx.createLinearGradient(px - pRad, py, px + pRad, py);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.7, 'rgba(5, 3, 15, 0.3)');
      shadowGrad.addColorStop(1, 'rgba(5, 3, 15, 0.85)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(px - pRad, py - pRad, pRad * 2, pRad * 2);
      ctx.restore();

      // Front Half of Rings (in front of planet)
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.35);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 14 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 2.5, pRad * 0.65, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 2.2, pRad * 0.58, 0, 0, Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.60)';
      ctx.lineWidth = 18 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, pRad * 1.8, pRad * 0.48, 0, 0, Math.PI);
      ctx.stroke();

      // Orbiting Moonlet
      const mAngle = time * 0.4;
      const mx = Math.cos(mAngle) * pRad * 2.8;
      const my = Math.sin(mAngle) * pRad * 0.7;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(mx, my, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 4. AURORA DEEP: Undulating Multi-Layer Emerald/Teal/Violet Aurora Curtains
    // -------------------------------------------------------------------------
    else if (type === 'aurora_deep') {
      const auroraLayers = [
        { color: 'rgba(16, 185, 129, 0.35)', speed: 0.6, waveH: 45, yBase: 50 },
        { color: 'rgba(45, 212, 191, 0.30)', speed: 0.8, waveH: 35, yBase: 80 },
        { color: 'rgba(139, 92, 246, 0.28)', speed: 0.5, waveH: 40, yBase: 40 },
        { color: 'rgba(52, 211, 153, 0.38)', speed: 0.9, waveH: 30, yBase: 110 }
      ];

      auroraLayers.forEach((layer, idx) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);

        const stepX = 40;
        for (let x = 0; x <= camera.viewportWidth; x += stepX) {
          const wave = Math.sin((x * 0.008) + time * layer.speed + idx * 1.4) * (layer.waveH * scale);
          const wave2 = Math.cos((x * 0.015) - time * (layer.speed * 0.6)) * (15 * scale);
          const y = layer.yBase * scale + wave + wave2;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(camera.viewportWidth, 0);
        ctx.closePath();
        ctx.fill();

        // Vertical Aurora Ray Streaks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let x = 60; x < camera.viewportWidth; x += 120) {
          const rayH = 100 * scale + Math.sin(time * 2 + x) * 30 * scale;
          ctx.fillRect(x, 0, 12 * scale, rayH);
        }
      });
    }

    // -------------------------------------------------------------------------
    // 5. ECLIPSE WELL: Total Solar Eclipse with Radiant Corona & Gravitational Singularity
    // -------------------------------------------------------------------------
    else if (type === 'eclipse_well') {
      const ex = ((camera.viewportWidth * 0.5 - camera.x * 0.06) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const ey = 120;
      const eRadius = 45 * scale;

      // Gravitational Lensing Distortion Rings
      for (let r = 1; r <= 3; r++) {
        const lPulse = 1.0 + Math.sin(time * 2.5 + r) * 0.06;
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.18 / r})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(ex, ey, (eRadius + r * 28 * scale) * lPulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radiant Golden Solar Corona Flare
      const coronaPulse = 1.0 + Math.sin(time * 3.0) * 0.08;
      const corona = ctx.createRadialGradient(ex, ey, eRadius * 0.8, ex, ey, eRadius * 2.8 * coronaPulse);
      corona.addColorStop(0, '#fef08a');
      corona.addColorStop(0.25, '#f59e0b');
      corona.addColorStop(0.55, '#d97706');
      corona.addColorStop(0.85, 'rgba(126, 34, 206, 0.25)');
      corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = corona;
      ctx.beginPath();
      ctx.arc(ex, ey, eRadius * 2.8 * coronaPulse, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Solar Prominences (Solar Flares erupting from lunar rim)
      const flareCount = 8;
      for (let i = 0; i < flareCount; i++) {
        const a = (i / flareCount) * Math.PI * 2 + time * 0.2;
        const flareLen = (14 + Math.sin(time * 4 + i * 2) * 8) * scale;
        const fx1 = ex + Math.cos(a) * eRadius;
        const fy1 = ey + Math.sin(a) * eRadius;
        const fx2 = ex + Math.cos(a) * (eRadius + flareLen);
        const fy2 = ey + Math.sin(a) * (eRadius + flareLen);

        ctx.strokeStyle = i % 2 === 0 ? '#fde047' : '#ea580c';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(fx1, fy1);
        ctx.lineTo(fx2, fy2);
        ctx.stroke();
      }

      // Pitch Black Obsidian Moon Disk
      ctx.fillStyle = '#030206';
      ctx.beginPath();
      ctx.arc(ex, ey, eRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Solar Beaded Corona Edge (Baily's beads)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(ex, ey, eRadius + 0.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ===========================================================================
  // RENDER Y-SORTED: Cat, Stations, Trees/Props, Ambient Particles
  // ===========================================================================
  public renderYSorted(ctx: CanvasRenderingContext2D, camera: Camera2D, cat: PixelCat, nearestStation: InteractiveStation2D | null, time: number): void {
    const scale = camera.zoom;

    interface Renderable {
      y: number;
      draw: () => void;
    }

    const drawList: Renderable[] = [];

    // Cat Entity
    drawList.push({
      y: cat.y,
      draw: () => cat.render(ctx, camera)
    });

    // Stations & Mooring Lanterns
    this.stationManager.stations.forEach(st => {
      const sortY = st.type === 'pier'
        ? st.y + (st.pierDirection === 'up' ? -18 : (st.pierDirection === 'down' ? 18 : -10))
        : st.y;
      drawList.push({
        y: sortY,
        draw: () => this.stationManager.renderStation(ctx, camera, st, nearestStation?.id === st.id, time)
      });
    });

    // Trees & Props (Supporting All Handcrafted Multi-World Sprites!)
    this.trees.forEach(tree => {
      drawList.push({
        y: tree.y,
        draw: () => {
          const tScreen = camera.worldToScreen(tree.x, tree.y);

          // 1. Moonpool Props
          if (tree.type === 'sakura' && this.sakuraCanvas) {
            const w = 48 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.sakuraCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          } else if (tree.type === 'willow' && this.willowCanvas) {
            const w = 64 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.willowCanvas, tScreen.x - w / 2, tScreen.y - h + 12 * scale, w, h);
          } else if (tree.type === 'pine' && this.pineCanvas) {
            const w = 32 * scale;
            const h = 48 * scale;
            ctx.drawImage(this.pineCanvas, tScreen.x - w / 2, tScreen.y - h + 8 * scale, w, h);
          } else if (tree.type === 'crystal' && this.crystalCanvas) {
            const w = 24 * scale;
            const h = 32 * scale;
            ctx.drawImage(this.crystalCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          } else if ((tree.type === 'lamp' || tree.type === 'bio_lamp' || tree.type === 'comet_lamp' || tree.type === 'frost_lamp' || tree.type === 'aurora_lamp' || tree.type === 'eclipse_lamp') && this.lampCanvas) {
            const w = 16 * scale;
            const h = 28 * scale;
            ctx.drawImage(this.lampCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          } else if (tree.type === 'mushroom' && this.mushroomCanvas) {
            const w = 24 * scale;
            const h = 20 * scale;
            ctx.drawImage(this.mushroomCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          }

          // 2. Nebula Lagoon Props
          else if (tree.type === 'coral_tree' && this.coralCanvas) {
            const w = 48 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.coralCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          } else if (tree.type === 'alien_mushroom' && this.alienMushroomCanvas) {
            const w = 28 * scale;
            const h = 28 * scale;
            ctx.drawImage(this.alienMushroomCanvas, tScreen.x - w / 2, tScreen.y - h + 8 * scale, w, h);
          }

          // 3. Comet Falls Props
          else if (tree.type === 'meteor_crag' && this.meteorCanvas) {
            const w = 44 * scale;
            const h = 56 * scale;
            ctx.drawImage(this.meteorCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          }

          // 4. Saturn's Rings Props
          else if (tree.type === 'ice_spire' && this.iceSpireCanvas) {
            const w = 32 * scale;
            const h = 56 * scale;
            ctx.drawImage(this.iceSpireCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          } else if (tree.type === 'ice_cluster' && this.iceClusterCanvas) {
            const w = 24 * scale;
            const h = 28 * scale;
            ctx.drawImage(this.iceClusterCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          }

          // 5. Aurora Deep Props
          else if (tree.type === 'abyssal_spire' && this.abyssalSpireCanvas) {
            const w = 44 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.abyssalSpireCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          }

          // 6. Eclipse Well Props
          else if (tree.type === 'eclipse_pillar' && this.eclipsePillarCanvas) {
            const w = 40 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.eclipsePillarCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          } else if (tree.type === 'void_monolith' && this.voidMonolithCanvas) {
            const w = 44 * scale;
            const h = 60 * scale;
            ctx.drawImage(this.voidMonolithCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          }
        }
      });
    });

    // Sort by Y ascending and render
    drawList.sort((a, b) => a.y - b.y);
    drawList.forEach(item => item.draw());

    // Layer 5: Regional Ambient Particles (Petals, Spores, Comet Sparks, Diamond Dust, Mist, Void Embers)
    this.ambientParticles.forEach(p => {
      const pScreen = camera.worldToScreen(p.x, p.y);
      ctx.save();
      ctx.translate(pScreen.x, pScreen.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.size * scale;
      ctx.fillRect(Math.floor(-s / 2), Math.floor(-s / 2), Math.floor(s), Math.floor(s));
      ctx.restore();
    });

    // Layer 6: Floating Fireflies / Atmospheric Wisps
    this.fireflies.forEach(ff => {
      const p = camera.worldToScreen(ff.x, ff.y);
      const rad = (3 + Math.sin(ff.phase) * 1.5) * scale;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3);
      grad.addColorStop(0, ff.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = ff.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.max(1, Math.floor(2 * scale)), Math.max(1, Math.floor(2 * scale)));
    });
  }

  // ===========================================================================
  // RENDER LIGHTING OVERLAY: Themed Ambient Light Pools & Screen Blend
  // ===========================================================================
  public renderLightingOverlay(ctx: CanvasRenderingContext2D, camera: Camera2D, time: number): void {
    const scale = camera.zoom;
    const config = WORLD_ENVIRONMENTS[this.currentRegionId] || WORLD_ENVIRONMENTS['region_moonpool'];

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Cardinal Pier Mooring Lanterns & Local Lamps
    const lanternPositions = [
      { x: 0, y: 130, radius: 46 },
      { x: 0, y: -130, radius: 46 },
      { x: 150, y: 0, radius: 46 },
      { x: -150, y: 0, radius: 46 },
      { x: -45, y: 95, radius: 36 },
      { x: 45, y: 95, radius: 36 },
      { x: -105, y: -35, radius: 36 },
      { x: 105, y: -35, radius: 36 },
      { x: 0, y: -175, radius: 36 },
    ];

    lanternPositions.forEach(lp => {
      const p = camera.worldToScreen(lp.x, lp.y);
      const rad = lp.radius * scale;
      const pulse = 1.0 + Math.sin(time * 3 + lp.x) * 0.08;
      const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, rad * pulse);
      grad.addColorStop(0, config.palette.lightingColor);
      grad.addColorStop(0.5, config.palette.lightingPulseColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad * pulse, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Tackle & Stars Emporium
    const shop = camera.worldToScreen(205, -70);
    const shopPulse = 1.0 + Math.sin(time * 2.2) * 0.05;
    const shopGrad = ctx.createRadialGradient(shop.x, shop.y, 4, shop.x, shop.y, 75 * scale * shopPulse);
    shopGrad.addColorStop(0, 'rgba(251, 191, 36, 0.30)');
    shopGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.12)');
    shopGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shopGrad;
    ctx.beginPath();
    ctx.arc(shop.x, shop.y, 75 * scale * shopPulse, 0, Math.PI * 2);
    ctx.fill();

    // 3. Felis Major Constellation Altar
    const altar = camera.worldToScreen(-195, 95);
    const altarPulse = 1.0 + Math.sin(time * 2.8) * 0.1;
    const altarGrad = ctx.createRadialGradient(altar.x, altar.y, 4, altar.x, altar.y, 80 * scale * altarPulse);
    altarGrad.addColorStop(0, 'rgba(168, 85, 247, 0.32)');
    altarGrad.addColorStop(0.5, 'rgba(126, 34, 206, 0.10)');
    altarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = altarGrad;
    ctx.beginPath();
    ctx.arc(altar.x, altar.y, 80 * scale * altarPulse, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cosmic Realm Gateway
    const portal = camera.worldToScreen(195, 95);
    const portalPulse = 1.0 + Math.sin(time * 3.5) * 0.12;
    const portalGrad = ctx.createRadialGradient(portal.x, portal.y, 6, portal.x, portal.y, 85 * scale * portalPulse);
    portalGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    portalGrad.addColorStop(0.4, 'rgba(217, 70, 239, 0.15)');
    portalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(portal.x, portal.y, 85 * scale * portalPulse, 0, Math.PI * 2);
    ctx.fill();

    // 5. Celestial Wishing Fountain
    const wishing = camera.worldToScreen(0, -165);
    const wishPulse = 1.0 + Math.sin(time * 2.0) * 0.08;
    const wishGrad = ctx.createRadialGradient(wishing.x, wishing.y, 4, wishing.x, wishing.y, 78 * scale * wishPulse);
    wishGrad.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
    wishGrad.addColorStop(0.5, 'rgba(244, 114, 182, 0.10)');
    wishGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = wishGrad;
    ctx.beginPath();
    ctx.arc(wishing.x, wishing.y, 78 * scale * wishPulse, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bioluminescent / Alien Ground Glows
    this.trees.filter(t => t.type.includes('mushroom') || t.type.includes('crystal')).forEach(m => {
      const mp = camera.worldToScreen(m.x, m.y);
      const mPulse = 1.0 + Math.sin(time * 3 + m.x * 0.2) * 0.15;
      const mGrad = ctx.createRadialGradient(mp.x, mp.y, 1, mp.x, mp.y, 22 * scale * mPulse);
      mGrad.addColorStop(0, config.palette.lightingColor);
      mGrad.addColorStop(0.6, config.palette.lightingPulseColor);
      mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, 22 * scale * mPulse, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}
