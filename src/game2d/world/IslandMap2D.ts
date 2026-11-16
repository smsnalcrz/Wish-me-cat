/**
 * IslandMap2D.ts
 * 2D Island Map, Environmental Layers, and Collision Boundaries for Wish Me Cat.
 * Manages the floating celestial island, space background, stone paths, trees, and depth sorting.
 */

import { Camera2D } from '../core/Camera2D';
import { StarpondWater2D } from './StarpondWater2D';
import { StationManager2D, InteractiveStation2D } from './Station2D';
import { PixelCat } from '../entities/PixelCat';
import { REGIONS } from '../../data/regions';

export interface TreeProp {
  x: number;
  y: number;
  radius: number;
  type: 'sakura' | 'crystal' | 'lamp';
}

export class IslandMap2D {
  public width: number = 720;
  public height: number = 620;
  public islandRadiusX: number = 310;
  public islandRadiusY: number = 260;

  public water: StarpondWater2D;
  public stationManager: StationManager2D;

  // Environment Props
  public trees: TreeProp[] = [];
  private spaceStars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];
  private fallingPetals: { x: number; y: number; vx: number; vy: number; rot: number; color: string }[] = [];

  // Current Regional Theme
  public currentRegionId: string = 'region_moonpool';

  constructor() {
    this.water = new StarpondWater2D(0, 0);
    this.stationManager = new StationManager2D();

    // Populate decorative trees, crystal clusters, and lanterns
    this.trees = [
      // Sakura Trees
      { x: -130, y: -160, radius: 24, type: 'sakura' },
      { x: 130, y: -160, radius: 24, type: 'sakura' },
      { x: -160, y: 50, radius: 24, type: 'sakura' },
      { x: 170, y: 50, radius: 24, type: 'sakura' },
      { x: -60, y: 190, radius: 20, type: 'sakura' },
      { x: 60, y: 190, radius: 20, type: 'sakura' },

      // Glowing Crystal Clusters
      { x: -220, y: -10, radius: 14, type: 'crystal' },
      { x: 220, y: -10, radius: 14, type: 'crystal' },
      { x: -100, y: 150, radius: 14, type: 'crystal' },
      { x: 100, y: 150, radius: 14, type: 'crystal' },

      // Starlight Lanterns along paths
      { x: -50, y: 100, radius: 8, type: 'lamp' },
      { x: 50, y: 100, radius: 8, type: 'lamp' },
      { x: -110, y: -40, radius: 8, type: 'lamp' },
      { x: 110, y: -40, radius: 8, type: 'lamp' },
      { x: 0, y: -180, radius: 8, type: 'lamp' }
    ];

    // Background cosmic space stars (distant parallax)
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

    // Layer 0: Cosmic Space Gradient Backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, camera.viewportHeight);
    bgGrad.addColorStop(0, reg.skyColor || '#070514');
    bgGrad.addColorStop(1, '#0c0a24');
    ctx.fillStyle = bgGrad;
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
    const rx = this.islandRadiusX * camera.zoom;
    const ry = this.islandRadiusY * camera.zoom;

    // Layer 1: Floating Island Rock Cliff Base & Drop Shadow
    ctx.fillStyle = 'rgba(5, 3, 12, 0.65)';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 18 * camera.zoom, rx + 14 * camera.zoom, ry + 16 * camera.zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Island Cliff Wall
    ctx.fillStyle = '#211c3b';
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y + 10 * camera.zoom, rx + 2 * camera.zoom, ry + 8 * camera.zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Island Top Surface Turf (Cozy Cosmic Grass)
    const turfGrad = ctx.createRadialGradient(centerScreen.x, centerScreen.y, rx * 0.1, centerScreen.x, centerScreen.y, rx);
    turfGrad.addColorStop(0, '#273377'); // brighter inner grass
    turfGrad.addColorStop(0.75, '#1e255e');
    turfGrad.addColorStop(1, '#151945'); // dark outer rim

    ctx.fillStyle = turfGrad;
    ctx.beginPath();
    ctx.ellipse(centerScreen.x, centerScreen.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Pathways connecting spawn, piers, and stations
    this.renderStonePaths(ctx, camera);

    // Layer 2: Celestial Starpond Water
    this.water.render(ctx, camera, time);
  }

  // Render stone pathways on the grass
  private renderStonePaths(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    ctx.save();
    ctx.fillStyle = '#4a436e';
    const scale = camera.zoom;

    // Center circular cobblestone ring around the pond
    const ringRadiusX = (this.water.radiusX + 16) * scale;
    const ringRadiusY = (this.water.radiusY + 16) * scale;
    const c = camera.worldToScreen(0, 0);

    ctx.strokeStyle = '#3e375d';
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Paths branching to stations
    this.stationManager.stations.forEach(st => {
      const pScreen = camera.worldToScreen(st.x, st.y);
      ctx.strokeStyle = '#4a436e';
      ctx.lineWidth = 10 * scale;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(pScreen.x, pScreen.y);
      ctx.stroke();
    });

    ctx.restore();
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

    // Stations
    this.stationManager.stations.forEach(st => {
      drawList.push({
        y: st.y,
        draw: () => this.stationManager.renderStation(ctx, camera, st, nearestStation?.id === st.id, time)
      });
    });

    // Trees & Props
    this.trees.forEach(tree => {
      drawList.push({
        y: tree.y,
        draw: () => {
          const tScreen = camera.worldToScreen(tree.x, tree.y);

          if (tree.type === 'sakura') {
            // Shadow
            ctx.fillStyle = 'rgba(10, 8, 25, 0.35)';
            ctx.beginPath();
            ctx.ellipse(tScreen.x, tScreen.y + 4 * scale, 14 * scale, 6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Trunk
            ctx.fillStyle = '#452b1f';
            ctx.fillRect(tScreen.x - 3 * scale, tScreen.y - 18 * scale, 6 * scale, 20 * scale);

            // Pink Sakura Foliage Canopy
            const sway = Math.sin(time * 1.5 + tree.x) * 1.5 * scale;
            ctx.fillStyle = '#c026d3';
            ctx.beginPath();
            ctx.arc(tScreen.x + sway, tScreen.y - 28 * scale, 22 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(tScreen.x + sway - 3 * scale, tScreen.y - 30 * scale, 17 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.arc(tScreen.x + sway + 3 * scale, tScreen.y - 32 * scale, 10 * scale, 0, Math.PI * 2);
            ctx.fill();
          } else if (tree.type === 'crystal') {
            // Glowing Crystal Formation
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(tScreen.x, tScreen.y - 22 * scale);
            ctx.lineTo(tScreen.x + 6 * scale, tScreen.y);
            ctx.lineTo(tScreen.x - 6 * scale, tScreen.y);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#7dd3fc';
            ctx.beginPath();
            ctx.moveTo(tScreen.x - 3 * scale, tScreen.y - 16 * scale);
            ctx.lineTo(tScreen.x, tScreen.y);
            ctx.lineTo(tScreen.x - 8 * scale, tScreen.y);
            ctx.closePath();
            ctx.fill();
          } else if (tree.type === 'lamp') {
            // Starlight Post Lamp
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(tScreen.x - 1.5 * scale, tScreen.y - 16 * scale, 3 * scale, 18 * scale);

            // Glowing Lantern Bulb
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(tScreen.x, tScreen.y - 18 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
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
      ctx.beginPath();
      ctx.ellipse(0, 0, 3 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
