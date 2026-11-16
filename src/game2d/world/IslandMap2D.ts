/**
 * IslandMap2D.ts
 * Handcrafted 2D Pixel-Art Celestial Island Map for Wish Me Cat.
 * Features stepped crag cliff walls, multi-toned cosmic turf with pixel grass tufts and wildflowers,
 * individual cobblestone flagstone pathways, handcrafted sakura/pine trees, crystals, and lanterns.
 */

import { Camera2D } from '../core/Camera2D';
import { StarpondWater2D } from './StarpondWater2D';
import { StationManager2D, InteractiveStation2D } from './Station2D';
import { PixelCat } from '../entities/PixelCat';
import { REGIONS } from '../../data/regions';
import {
  generateSakuraTreeSprite,
  generatePineTreeSprite,
  generateCrystalClusterSprite,
  generateStoneLanternSprite
} from '../rendering/PixelSprites';

export interface TreeProp {
  x: number;
  y: number;
  radius: number;
  type: 'sakura' | 'pine' | 'crystal' | 'lamp';
}

export class IslandMap2D {
  public width: number = 720;
  public height: number = 620;
  public islandRadiusX: number = 300;
  public islandRadiusY: number = 250;

  public water: StarpondWater2D;
  public stationManager: StationManager2D;

  // Environment Props
  public trees: TreeProp[] = [];
  private spaceStars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];
  private fallingPetals: { x: number; y: number; vx: number; vy: number; rot: number; color: string }[] = [];

  // Ground Grass Tufts & Wildflowers
  private grassTufts: { x: number; y: number; color: string; width: number; height: number }[] = [];
  private cobblestones: { x: number; y: number; w: number; h: number; color: string }[] = [];

  // Cached Pixel Tree/Prop Sprites
  private sakuraCanvas: HTMLCanvasElement | null = null;
  private pineCanvas: HTMLCanvasElement | null = null;
  private crystalCanvas: HTMLCanvasElement | null = null;
  private lampCanvas: HTMLCanvasElement | null = null;

  // Current Regional Theme
  public currentRegionId: string = 'region_moonpool';

  constructor() {
    this.water = new StarpondWater2D(0, 0);
    this.stationManager = new StationManager2D();
    this.initSprites();

    // Environment Props around the island
    this.trees = [
      // Sakura Trees
      { x: -140, y: -150, radius: 24, type: 'sakura' },
      { x: 140, y: -150, radius: 24, type: 'sakura' },
      { x: -170, y: 50, radius: 24, type: 'sakura' },
      { x: 180, y: 50, radius: 24, type: 'sakura' },
      { x: -70, y: 195, radius: 20, type: 'sakura' },
      { x: 70, y: 195, radius: 20, type: 'sakura' },

      // Celestial Pines
      { x: -240, y: -80, radius: 18, type: 'pine' },
      { x: 240, y: -80, radius: 18, type: 'pine' },
      { x: -80, y: -220, radius: 18, type: 'pine' },
      { x: 80, y: -220, radius: 18, type: 'pine' },

      // Glowing Crystal Clusters
      { x: -225, y: 10, radius: 14, type: 'crystal' },
      { x: 225, y: 10, radius: 14, type: 'crystal' },
      { x: -110, y: 145, radius: 14, type: 'crystal' },
      { x: 110, y: 145, radius: 14, type: 'crystal' },

      // Starlight Kasuga Lanterns
      { x: -45, y: 95, radius: 8, type: 'lamp' },
      { x: 45, y: 95, radius: 8, type: 'lamp' },
      { x: -105, y: -35, radius: 8, type: 'lamp' },
      { x: 105, y: -35, radius: 8, type: 'lamp' },
      { x: 0, y: -175, radius: 8, type: 'lamp' }
    ];

    // Distant Parallax Stars
    for (let i = 0; i < 90; i++) {
      this.spaceStars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        size: Math.random() > 0.8 ? 2 : 1,
        speed: 0.1 + Math.random() * 0.3,
        alpha: 0.2 + Math.random() * 0.8
      });
    }

    // Drifting Sakura Flower Petals
    for (let i = 0; i < 28; i++) {
      this.fallingPetals.push({
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 400,
        vx: 8 + Math.random() * 12,
        vy: 12 + Math.random() * 16,
        rot: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#f472b6' : '#e879f9'
      });
    }

    // Generate Ground Grass Tufts & Star Flowers on playable turf
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.38;
      const x = Math.cos(angle) * this.islandRadiusX * r;
      const y = Math.sin(angle) * this.islandRadiusY * r;

      const tuftColors = ['#38bdf8', '#c084fc', '#fde047', '#4ade80', '#818cf8'];
      this.grassTufts.push({
        x,
        y,
        color: tuftColors[i % tuftColors.length],
        width: 3 + (i % 3) * 2,
        height: 2 + (i % 2) * 2
      });
    }

    // Generate Handcrafted Cobblestones along pathways
    this.generatePathCobblestones();
  }

  private initSprites(): void {
    this.sakuraCanvas = generateSakuraTreeSprite();
    this.pineCanvas = generatePineTreeSprite();
    this.crystalCanvas = generateCrystalClusterSprite();
    this.lampCanvas = generateStoneLanternSprite();
  }

  private generatePathCobblestones(): void {
    // Generate stepping stones around the pond ring
    const ringCount = 64;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const dist = 1.14 + (Math.sin(i * 4) * 0.03);
      const x = Math.cos(angle) * this.water.radiusX * dist;
      const y = Math.sin(angle) * this.water.radiusY * dist;
      const stoneColors = ['#3b3658', '#4b456e', '#595282', '#322d4d'];
      this.cobblestones.push({
        x,
        y,
        w: 6 + (i % 4) * 2,
        h: 5 + ((i + 1) % 3) * 2,
        color: stoneColors[i % stoneColors.length]
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
            color: s % 2 === 0 ? '#4b456e' : '#3b3658'
          });
        }
      }
    });
  }

  public setRegion(regionId: string): void {
    this.currentRegionId = regionId;
  }

  public update(delta: number): void {
    this.water.update(delta);

    // Drifting Sakura Petals
    for (const petal of this.fallingPetals) {
      petal.x += petal.vx * delta;
      petal.y += petal.vy * delta;
      petal.rot += delta * 2;
      if (petal.y > 300) petal.y = -300;
      if (petal.x > 350) petal.x = -350;
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

    if (distOuterSq > 1.0) {
      const dist = Math.sqrt(distOuterSq);
      nextX = (normX / dist) * this.islandRadiusX * 0.98;
      nextY = (normY / dist) * this.islandRadiusY * 0.98;
    }

    // 2. Starpond Shoreline Boundary (Prevent entering water unless standing on a wooden pier!)
    let onPier = false;
    for (const pier of this.stationManager.stations) {
      if (pier.type === 'pier') {
        const d = Math.hypot(nextX - pier.x, nextY - pier.y);
        if (d < pier.radius + 6) {
          onPier = true;
          break;
        }
      }
    }

    if (!onPier) {
      const pNormX = nextX / (this.water.radiusX + cat.radius);
      const pNormY = nextY / (this.water.radiusY + cat.radius);
      const distPondSq = pNormX * pNormX + pNormY * pNormY;

      if (distPondSq < 1.0) {
        const d = Math.sqrt(distPondSq);
        nextX = (pNormX / d) * (this.water.radiusX + cat.radius + 1);
        nextY = (pNormY / d) * (this.water.radiusY + cat.radius + 1);
      }
    }

    // 3. Station Building Colliders
    for (const st of this.stationManager.stations) {
      if (st.type !== 'pier') {
        const d = Math.hypot(nextX - st.x, nextY - st.y);
        const minDist = 18 + cat.radius;
        if (d < minDist && d > 0.001) {
          nextX = st.x + ((nextX - st.x) / d) * minDist;
          nextY = st.y + ((nextY - st.y) / d) * minDist;
        }
      }
    }

    cat.x = nextX;
    cat.y = nextY;
  }

  // Render Background and Base Terrain (Layers 0, 1, 2)
  public renderBase(ctx: CanvasRenderingContext2D, camera: Camera2D, time: number): void {
    const reg = REGIONS.find(r => r.id === this.currentRegionId) || REGIONS[0];
    const scale = camera.zoom;

    // Layer 0: Deep Cosmic Space Backdrop
    ctx.fillStyle = reg.skyColor || '#070514';
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    // Distant Parallax Stars
    this.spaceStars.forEach(st => {
      const screenX = ((st.x - camera.x * 0.2) % camera.viewportWidth + camera.viewportWidth) % camera.viewportWidth;
      const screenY = ((st.y - camera.y * 0.2) % camera.viewportHeight + camera.viewportHeight) % camera.viewportHeight;
      const alpha = st.alpha * (0.6 + Math.sin(time * st.speed * 4) * 0.4);
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(Math.floor(screenX), Math.floor(screenY), st.size, st.size);
    });

    const centerScreen = camera.worldToScreen(0, 0);
    const rx = this.islandRadiusX * scale;
    const ry = this.islandRadiusY * scale;

    // Layer 1: Floating Island Rock Cliff Base & Drop Shadow
    ctx.fillStyle = '#05030c';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 16 * scale, rx + 10 * scale, ry + 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepped Island Cliff Wall (Dark crag rock with rim)
    ctx.fillStyle = '#1c1733';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 10 * scale, rx + 2 * scale, ry + 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#29224d';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 4 * scale, rx, ry + 2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Island Top Surface Turf (Rich Cosmic Grass Palette)
    ctx.fillStyle = '#1a2254'; // Outer dark turf
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#263174'; // Main lush cosmic grass
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.88, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e3d8c'; // Inner warm highlight grass
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Handcrafted Stepping Cobblestone Paths
    this.renderCobblestones(ctx, camera);

    // Decorative Grass Tufts & Star Flowers
    this.grassTufts.forEach(tuft => {
      const p = camera.worldToScreen(tuft.x, tuft.y);
      ctx.fillStyle = tuft.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(tuft.width * scale), Math.floor(tuft.height * scale));
    });

    // Layer 2: Handcrafted Celestial Starpond Water
    this.water.render(ctx, camera, time);

    // Layer 3: Wooden Pier Decks (planks and water stilts rendered under standing characters)
    this.stationManager.renderPierDecks(ctx, camera);
  }

  // Render individual cobblestone pavers
  private renderCobblestones(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    const scale = camera.zoom;
    this.cobblestones.forEach(stone => {
      const p = camera.worldToScreen(stone.x, stone.y);
      const sw = stone.w * scale;
      const sh = stone.h * scale;

      // Shadow below stone
      ctx.fillStyle = '#18152e';
      ctx.fillRect(Math.floor(p.x - sw / 2 + 1 * scale), Math.floor(p.y - sh / 2 + 1 * scale), Math.floor(sw), Math.floor(sh));

      // Stone face
      ctx.fillStyle = stone.color;
      ctx.fillRect(Math.floor(p.x - sw / 2), Math.floor(p.y - sh / 2), Math.floor(sw), Math.floor(sh));

      // Top Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(Math.floor(p.x - sw / 2), Math.floor(p.y - sh / 2), Math.floor(sw - 1 * scale), Math.max(1, Math.floor(1 * scale)));
    });
  }

  // Render Props, Trees, Stations and Foreground Y-Sorted Entities
  public renderYSorted(ctx: CanvasRenderingContext2D, camera: Camera2D, cat: PixelCat, nearestStation: InteractiveStation2D | null, time: number): void {
    const scale = camera.zoom;

    // Collect all entities to sort by Y: Cat, Stations, Trees
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

    // Trees & Props (Using Handcrafted Pixel Sprites!)
    this.trees.forEach(tree => {
      drawList.push({
        y: tree.y,
        draw: () => {
          const tScreen = camera.worldToScreen(tree.x, tree.y);

          if (tree.type === 'sakura' && this.sakuraCanvas) {
            const w = 48 * scale;
            const h = 64 * scale;
            ctx.drawImage(this.sakuraCanvas, tScreen.x - w / 2, tScreen.y - h + 10 * scale, w, h);
          } else if (tree.type === 'pine' && this.pineCanvas) {
            const w = 32 * scale;
            const h = 48 * scale;
            ctx.drawImage(this.pineCanvas, tScreen.x - w / 2, tScreen.y - h + 8 * scale, w, h);
          } else if (tree.type === 'crystal' && this.crystalCanvas) {
            const w = 24 * scale;
            const h = 32 * scale;
            ctx.drawImage(this.crystalCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          } else if (tree.type === 'lamp' && this.lampCanvas) {
            const w = 16 * scale;
            const h = 28 * scale;
            ctx.drawImage(this.lampCanvas, tScreen.x - w / 2, tScreen.y - h + 6 * scale, w, h);
          }
        }
      });
    });

    // Sort by Y ascending (back to front) and draw
    drawList.sort((a, b) => a.y - b.y);
    drawList.forEach(item => item.draw());

    // Layer 5: Drifting Sakura Blossom Petals
    this.fallingPetals.forEach(petal => {
      const pScreen = camera.worldToScreen(petal.x, petal.y);
      ctx.save();
      ctx.translate(pScreen.x, pScreen.y);
      ctx.rotate(petal.rot);
      ctx.fillStyle = petal.color;
      ctx.fillRect(Math.floor(-1.5 * scale), Math.floor(-1 * scale), Math.floor(3 * scale), Math.floor(2 * scale));
      ctx.restore();
    });
  }
}
