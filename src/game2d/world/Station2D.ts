/**
 * Station2D.ts
 * 2D Interactive Stations & Fishing Piers for Wish Me Cat.
 * Renders authentic pixel-art buildings, altars, gateways, and piers with proximity interaction indicators.
 */

import { Camera2D } from '../core/Camera2D';
import {
  generateEmporiumShopSprite,
  generateQuestBoardSprite,
  generateConstellationAltarSprite,
  generateAlmanacPedestalSprite,
  generateRealmGatewaySprite,
  generateWishingFountainSprite
} from '../rendering/PixelSprites';

export interface InteractiveStation2D {
  id: string;
  name: string;
  prompt: string;
  x: number;
  y: number;
  radius: number;
  type: 'shop' | 'quest' | 'constellation' | 'almanac' | 'portal' | 'pier' | 'wishing';
  pierDirection?: 'up' | 'down' | 'left' | 'right';
  castTarget?: { x: number; y: number };
}

export class StationManager2D {
  private promptAlphas: Map<string, number> = new Map();
  public stations: InteractiveStation2D[] = [
    // 0. Celestial Wishing Fountain (Northwest of pond)
    {
      id: 'station_wishing',
      name: 'Celestial Wishing Fountain',
      prompt: 'Press [E] to Make a Celestial Wish',
      x: -115,
      y: -145,
      radius: 40,
      type: 'wishing'
    },
    // 1. Cosmic Gear Shop (East-Northeast)
    {
      id: 'station_shop',
      name: 'Cosmic Gear Emporium',
      prompt: 'Press [E] to Browse Equipment Shop',
      x: 210,
      y: -90,
      radius: 40,
      type: 'shop'
    },
    // 2. Celestial Quest Board (West-Northwest)
    {
      id: 'station_quests',
      name: 'Celestial Quest Observatory',
      prompt: 'Press [E] to View Quest Board',
      x: -210,
      y: -90,
      radius: 40,
      type: 'quest'
    },
    // 3. Constellation Altar (Far North)
    {
      id: 'station_constellations',
      name: 'Felis Major Constellation Altar',
      prompt: 'Press [E] to Commune with Constellation Altar',
      x: 0,
      y: -230,
      radius: 42,
      type: 'constellation'
    },
    // 4. Star Almanac Pedestal (Southwest)
    {
      id: 'station_collection',
      name: 'Star Almanac Pedestal',
      prompt: 'Press [E] to Read Star Almanac',
      x: -170,
      y: 130,
      radius: 36,
      type: 'almanac'
    },
    // 5. Realm Gateway Portal (Southeast)
    {
      id: 'station_portal',
      name: 'Cosmic Realm Gateway',
      prompt: 'Press [E] to Enter Realm Gateway',
      x: 230,
      y: 110,
      radius: 42,
      type: 'portal'
    },

    // 4 Cardinal Fishing Piers extending into Starpond
    {
      id: 'pier_south',
      name: 'Starlight South Pier',
      prompt: 'Press [E] to Fish at South Pier',
      x: 0,
      y: 130,
      radius: 32,
      type: 'pier',
      pierDirection: 'up',
      castTarget: { x: 0, y: 35 }
    },
    {
      id: 'pier_north',
      name: 'Aurora North Overlook',
      prompt: 'Press [E] to Fish at North Pier',
      x: 0,
      y: -130,
      radius: 32,
      type: 'pier',
      pierDirection: 'down',
      castTarget: { x: 0, y: -35 }
    },
    {
      id: 'pier_east',
      name: 'Moonlit East Jetty',
      prompt: 'Press [E] to Fish at East Pier',
      x: 145,
      y: 0,
      radius: 32,
      type: 'pier',
      pierDirection: 'left',
      castTarget: { x: 45, y: 0 }
    },
    {
      id: 'pier_west',
      name: 'Twilight West Jetty',
      prompt: 'Press [E] to Fish at West Pier',
      x: -145,
      y: 0,
      radius: 32,
      type: 'pier',
      pierDirection: 'right',
      castTarget: { x: -45, y: 0 }
    }
  ];

  // Cached Pixel Sprites
  private shopCanvas: HTMLCanvasElement | null = null;
  private questCanvas: HTMLCanvasElement | null = null;
  private altarCanvas: HTMLCanvasElement | null = null;
  private almanacCanvas: HTMLCanvasElement | null = null;
  private portalCanvas: HTMLCanvasElement | null = null;
  private wishingCanvas: HTMLCanvasElement | null = null;

  constructor() {
    this.initSprites();
  }

  private initSprites(): void {
    this.shopCanvas = generateEmporiumShopSprite();
    this.questCanvas = generateQuestBoardSprite();
    this.altarCanvas = generateConstellationAltarSprite();
    this.almanacCanvas = generateAlmanacPedestalSprite();
    this.portalCanvas = generateRealmGatewaySprite();
    this.wishingCanvas = generateWishingFountainSprite();
  }

  public getNearestStation(catX: number, catY: number): InteractiveStation2D | null {
    let nearest: InteractiveStation2D | null = null;
    let minDist = Infinity;

    for (const station of this.stations) {
      const dist = Math.hypot(station.x - catX, station.y - catY);
      if (dist <= station.radius && dist < minDist) {
        nearest = station;
        minDist = dist;
      }
    }
    return nearest;
  }

  // Get world-space bounding box for pier walkway corridor
  public getPierWalkwayBounds(station: InteractiveStation2D): { minX: number; maxX: number; minY: number; maxY: number } | null {
    if (station.type !== 'pier') return null;
    const isVertical = station.pierDirection === 'up' || station.pierDirection === 'down';
    const pw = isVertical ? 32 : 48;
    const ph = isVertical ? 48 : 32;
    return {
      minX: station.x - pw / 2,
      maxX: station.x + pw / 2,
      minY: station.y - ph / 2,
      maxY: station.y + ph / 2
    };
  }

  // Render wooden pier decks and stilts in ground layer (under entities)
  public renderPierDecks(ctx: CanvasRenderingContext2D, camera: Camera2D): void {
    const scale = camera.zoom;
    for (const station of this.stations) {
      if (station.type !== 'pier') continue;

      const screen = camera.worldToScreen(station.x, station.y);
      const isVertical = station.pierDirection === 'up' || station.pierDirection === 'down';
      const pw = isVertical ? 28 * scale : 44 * scale;
      const ph = isVertical ? 44 * scale : 28 * scale;

      // Pier Stilt Water Shadows
      ctx.fillStyle = 'rgba(5, 3, 15, 0.6)';
      ctx.fillRect(screen.x - pw / 2 + 2 * scale, screen.y - ph / 2 + 4 * scale, pw, ph);

      // Main Plank Deck
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(screen.x - pw / 2, screen.y - ph / 2, pw, ph);

      // Individual Planks with woodgrain lines
      ctx.fillStyle = '#3d251e';
      if (isVertical) {
        for (let p = -18; p <= 18; p += 6) {
          ctx.fillRect(screen.x - pw / 2, screen.y + p * scale, pw, 1.5 * scale);
          // Nail heads
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(screen.x - pw / 2 + 3 * scale, screen.y + p * scale - 2 * scale, 1.5 * scale, 1.5 * scale);
          ctx.fillRect(screen.x + pw / 2 - 4 * scale, screen.y + p * scale - 2 * scale, 1.5 * scale, 1.5 * scale);
          ctx.fillStyle = '#3d251e';
        }
      } else {
        for (let p = -18; p <= 18; p += 6) {
          ctx.fillRect(screen.x + p * scale, screen.y - ph / 2, 1.5 * scale, ph);
          // Nail heads
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(screen.x + p * scale - 2 * scale, screen.y - ph / 2 + 3 * scale, 1.5 * scale, 1.5 * scale);
          ctx.fillRect(screen.x + p * scale - 2 * scale, screen.y + ph / 2 - 4 * scale, 1.5 * scale, 1.5 * scale);
          ctx.fillStyle = '#3d251e';
        }
      }
    }
  }

  // Render individual station graphic
  public renderStation(ctx: CanvasRenderingContext2D, camera: Camera2D, station: InteractiveStation2D, isHovered: boolean, time: number): void {
    const screen = camera.worldToScreen(station.x, station.y);
    const scale = camera.zoom;

    ctx.save();

    switch (station.type) {
      case 'pier': {
        const isVertical = station.pierDirection === 'up' || station.pierDirection === 'down';
        const pw = isVertical ? 28 * scale : 44 * scale;
        const ph = isVertical ? 44 * scale : 28 * scale;

        // Mooring Post with Brass Lantern placed at railing corner to never block the cat
        const lanternScreenX = isVertical ? screen.x + pw / 2 - 4 * scale : (station.pierDirection === 'left' ? screen.x - pw / 2 + 4 * scale : screen.x + pw / 2 - 4 * scale);
        const lanternScreenY = isVertical ? (station.pierDirection === 'up' ? screen.y - ph / 2 + 4 * scale : screen.y + ph / 2 - 4 * scale) : screen.y - ph / 2 + 4 * scale;

        // Post
        ctx.fillStyle = '#2d1810';
        ctx.fillRect(lanternScreenX - 3 * scale, lanternScreenY - 14 * scale, 6 * scale, 16 * scale);

        // Warm Glowing Lantern Bulb
        ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.fillRect(lanternScreenX - 6 * scale, lanternScreenY - 18 * scale, 12 * scale, 12 * scale);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(lanternScreenX - 2.5 * scale, lanternScreenY - 15 * scale, 5 * scale, 6 * scale);
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(lanternScreenX - 1 * scale, lanternScreenY - 14 * scale, 2 * scale, 2 * scale);

        // Pier-specific Environmental Props
        if (station.id === 'pier_south') {
          // Tackle Box (Red/brass) & Coiled Rope
          const propX = screen.x - pw / 2 + 3 * scale;
          const propY = screen.y + 6 * scale;
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(propX, propY, 8 * scale, 5 * scale);
          ctx.fillStyle = '#fbbf24'; // Brass latch
          ctx.fillRect(propX + 3 * scale, propY + 1 * scale, 2 * scale, 2 * scale);
          // Coiled Rope
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.arc(propX + 4 * scale, propY + 9 * scale, 3 * scale, 0, Math.PI * 2);
          ctx.stroke();
        } else if (station.id === 'pier_north') {
          // Scenic Overlook Mini Telescope
          const propX = screen.x - pw / 2 + 3 * scale;
          const propY = screen.y - 12 * scale;
          ctx.fillStyle = '#d97706';
          ctx.fillRect(propX, propY, 5 * scale, 8 * scale);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(propX + 1 * scale, propY - 2 * scale, 3 * scale, 3 * scale);
        } else if (station.id === 'pier_east') {
          // Fish Drying Rack & Wooden Crate
          const propX = screen.x + 8 * scale;
          const propY = screen.y - ph / 2 + 3 * scale;
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(propX, propY, 7 * scale, 7 * scale);
          ctx.fillStyle = '#38bdf8'; // Starfish hanging
          ctx.fillRect(propX + 2 * scale, propY + 2 * scale, 3 * scale, 3 * scale);
        } else if (station.id === 'pier_west') {
          // Cozy Sitting Cushion & Steaming Tea Kettle
          const propX = screen.x - 14 * scale;
          const propY = screen.y - ph / 2 + 3 * scale;
          ctx.fillStyle = '#7c3aed';
          ctx.fillRect(propX, propY, 8 * scale, 4 * scale);
          ctx.fillStyle = '#1e293b'; // Cast iron kettle
          ctx.fillRect(propX + 2 * scale, propY - 4 * scale, 4 * scale, 4 * scale);
          // Steam puff
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(propX + 3 * scale, propY - 7 * scale, 2 * scale, 2 * scale);
        }
        break;
      }

      case 'shop': {
        if (this.shopCanvas) {
          const w = 80 * scale;
          const h = 64 * scale;
          ctx.drawImage(this.shopCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);
        }
        break;
      }

      case 'quest': {
        if (this.questCanvas) {
          const w = 72 * scale;
          const h = 60 * scale;
          ctx.drawImage(this.questCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);
        }
        break;
      }

      case 'constellation': {
        if (this.altarCanvas) {
          const w = 88 * scale;
          const h = 60 * scale;
          ctx.drawImage(this.altarCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);
        }
        break;
      }

      case 'almanac': {
        if (this.almanacCanvas) {
          const w = 64 * scale;
          const h = 56 * scale;
          ctx.drawImage(this.almanacCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);
        }
        break;
      }

      case 'portal': {
        if (this.portalCanvas) {
          const w = 76 * scale;
          const h = 76 * scale;
          ctx.drawImage(this.portalCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);
        }
        break;
      }

      case 'wishing': {
        if (this.wishingCanvas) {
          const w = 76 * scale;
          const h = 60 * scale;
          ctx.drawImage(this.wishingCanvas, screen.x - w / 2, screen.y - h + 10 * scale, w, h);

          // Animated hovering Wish Star above fountain
          const starBob = Math.sin(time * 3.5) * 4 * scale;
          const starX = screen.x;
          const starY = screen.y - h - 4 * scale + starBob;

          // Star glow
          ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.beginPath();
          ctx.arc(starX, starY, 12 * scale, 0, Math.PI * 2);
          ctx.fill();

          // 4-pointed pixel star
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(starX - 2 * scale, starY - 7 * scale, 4 * scale, 14 * scale);
          ctx.fillRect(starX - 7 * scale, starY - 2 * scale, 14 * scale, 4 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(starX - 2 * scale, starY - 2 * scale, 4 * scale, 4 * scale);
        }
        break;
      }
    }

    // 2. Smoothly Interpolated In-World Proximity Indicator Prompt [E] (Silky Fade-in/Fade-out)
    const currentAlpha = this.promptAlphas.get(station.id) || 0;
    const targetAlpha = isHovered ? 1.0 : 0.0;
    const newAlpha = currentAlpha + (targetAlpha - currentAlpha) * 0.16;
    this.promptAlphas.set(station.id, newAlpha);

    if (newAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = newAlpha;

      const bobY = Math.sin(time * 4) * 3 * scale;
      const pillY = screen.y - 54 * scale + bobY;

      const keyText = '[E] ';
      const nameText = station.name;
      ctx.font = `bold ${Math.max(11, Math.floor(11 * scale))}px 'Pixelify Sans', monospace`;
      const keyWidth = ctx.measureText(keyText).width;
      const nameWidth = ctx.measureText(nameText).width;
      const totalTextWidth = keyWidth + nameWidth;
      const pillW = totalTextWidth + 18 * scale;
      const pillH = 20 * scale;

      // Drop shadow below badge
      ctx.fillStyle = 'rgba(5, 3, 14, 0.75)';
      ctx.fillRect(screen.x - pillW / 2 + 2, pillY - pillH / 2 + 2, pillW, pillH);

      // Deep celestial slate background
      ctx.fillStyle = '#0c1029';
      ctx.fillRect(screen.x - pillW / 2, pillY - pillH / 2, pillW, pillH);

      // Stepped pixel border: Vibrant celestial cyan and indigo
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(screen.x - pillW / 2 - 2 * scale, pillY - pillH / 2 + 2 * scale, 2 * scale, pillH - 4 * scale);
      ctx.fillRect(screen.x + pillW / 2, pillY - pillH / 2 + 2 * scale, 2 * scale, pillH - 4 * scale);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(screen.x - pillW / 2 + 2 * scale, pillY - pillH / 2 - 2 * scale, pillW - 4 * scale, 2 * scale);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(screen.x - pillW / 2 + 2 * scale, pillY + pillH / 2, pillW - 4 * scale, 2 * scale);

      // Text: Warm gold [E] keycap + Crisp starlight title
      ctx.textBaseline = 'middle';
      const textStartX = screen.x - totalTextWidth / 2;
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f59e0b'; // Warm golden action key
      ctx.fillText(keyText, textStartX, pillY);

      ctx.fillStyle = '#f8fafc'; // Crisp starlight station title
      ctx.fillText(nameText, textStartX + keyWidth, pillY);

      ctx.restore();
    }

    ctx.restore();
  }
}
