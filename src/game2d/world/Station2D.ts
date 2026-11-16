/**
 * Station2D.ts
 * 2D Interactive Stations & Fishing Piers for Wish Me Cat.
 * Renders pixel-art buildings, altars, gateways, and piers with proximity interaction indicators.
 */

import { Camera2D } from '../core/Camera2D';

export interface InteractiveStation2D {
  id: string;
  name: string;
  prompt: string;
  x: number;
  y: number;
  radius: number;
  type: 'shop' | 'quest' | 'constellation' | 'almanac' | 'portal' | 'pier';
  pierDirection?: 'up' | 'down' | 'left' | 'right';
  castTarget?: { x: number; y: number };
}

export class StationManager2D {
  public stations: InteractiveStation2D[] = [
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
      y: 135,
      radius: 32,
      type: 'pier',
      pierDirection: 'up',
      castTarget: { x: 0, y: 40 }
    },
    {
      id: 'pier_north',
      name: 'Aurora North Overlook',
      prompt: 'Press [E] to Fish at North Pier',
      x: 0,
      y: -135,
      radius: 32,
      type: 'pier',
      pierDirection: 'down',
      castTarget: { x: 0, y: -40 }
    },
    {
      id: 'pier_east',
      name: 'Moonlit East Jetty',
      prompt: 'Press [E] to Fish at East Pier',
      x: 155,
      y: 0,
      radius: 32,
      type: 'pier',
      pierDirection: 'left',
      castTarget: { x: 50, y: 0 }
    },
    {
      id: 'pier_west',
      name: 'Whispering West Bank',
      prompt: 'Press [E] to Fish at West Pier',
      x: -155,
      y: 0,
      radius: 32,
      type: 'pier',
      pierDirection: 'right',
      castTarget: { x: -50, y: 0 }
    }
  ];

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

  // Render individual station graphic
  public renderStation(ctx: CanvasRenderingContext2D, camera: Camera2D, station: InteractiveStation2D, isHovered: boolean, time: number): void {
    const screen = camera.worldToScreen(station.x, station.y);
    const scale = camera.zoom;

    ctx.save();

    switch (station.type) {
      case 'pier': {
        // Wooden Pier Planks
        ctx.fillStyle = '#6b4423';
        const w = (station.pierDirection === 'up' || station.pierDirection === 'down') ? 22 * scale : 34 * scale;
        const h = (station.pierDirection === 'up' || station.pierDirection === 'down') ? 34 * scale : 22 * scale;
        ctx.fillRect(screen.x - w / 2, screen.y - h / 2, w, h);

        // Plank separation lines
        ctx.fillStyle = '#3d251e';
        if (station.pierDirection === 'up' || station.pierDirection === 'down') {
          for (let p = -12; p <= 12; p += 6) {
            ctx.fillRect(screen.x - w / 2, screen.y + p * scale, w, 1 * scale);
          }
        } else {
          for (let p = -12; p <= 12; p += 6) {
            ctx.fillRect(screen.x + p * scale, screen.y - h / 2, 1 * scale, h);
          }
        }

        // Lantern on pier post
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shop': {
        // Cosmic Gear Emporium Kiosk
        ctx.fillStyle = '#4c1d95';
        ctx.fillRect(screen.x - 24 * scale, screen.y - 28 * scale, 48 * scale, 34 * scale);

        // Striped awning
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(screen.x - 26 * scale, screen.y - 32 * scale, 52 * scale, 10 * scale);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screen.x - 18 * scale, screen.y - 32 * scale, 8 * scale, 10 * scale);
        ctx.fillRect(screen.x + 10 * scale, screen.y - 32 * scale, 8 * scale, 10 * scale);

        // Counter & Display Goods
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(screen.x - 20 * scale, screen.y - 6 * scale, 40 * scale, 10 * scale);

        // Golden rod display on counter
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screen.x - 12 * scale, screen.y - 12 * scale, 24 * scale, 2 * scale);
        break;
      }

      case 'quest': {
        // Celestial Quest Board Structure
        ctx.fillStyle = '#3d251e';
        ctx.fillRect(screen.x - 4 * scale, screen.y - 30 * scale, 8 * scale, 34 * scale); // post
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(screen.x - 22 * scale, screen.y - 28 * scale, 44 * scale, 26 * scale); // board

        // Parchment notice notices
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(screen.x - 16 * scale, screen.y - 22 * scale, 12 * scale, 14 * scale);
        ctx.fillRect(screen.x + 4 * scale, screen.y - 22 * scale, 12 * scale, 14 * scale);

        // Glowing Star pin
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 24 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'constellation': {
        // Felis Major Altar
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, 28 * scale, 16 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y - 3 * scale, 24 * scale, 13 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Floating glowing constellation crystal
        const floatY = Math.sin(time * 2.2) * 4 * scale;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y - 26 * scale + floatY);
        ctx.lineTo(screen.x + 8 * scale, screen.y - 16 * scale + floatY);
        ctx.lineTo(screen.x, screen.y - 6 * scale + floatY);
        ctx.lineTo(screen.x - 8 * scale, screen.y - 16 * scale + floatY);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'almanac': {
        // Pedestal with open glowing book
        ctx.fillStyle = '#475569';
        ctx.fillRect(screen.x - 8 * scale, screen.y - 18 * scale, 16 * scale, 22 * scale);

        // Book pages
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screen.x - 12 * scale, screen.y - 24 * scale, 24 * scale, 10 * scale);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screen.x - 1 * scale, screen.y - 24 * scale, 2 * scale, 10 * scale); // spine
        break;
      }

      case 'portal': {
        // Dual Obsidian Pillars with Portal Vortex
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(screen.x - 22 * scale, screen.y - 32 * scale, 10 * scale, 36 * scale);
        ctx.fillRect(screen.x + 12 * scale, screen.y - 32 * scale, 10 * scale, 36 * scale);

        // Swirling Portal Core
        const grad = ctx.createRadialGradient(screen.x, screen.y - 16 * scale, 2 * scale, screen.x, screen.y - 16 * scale, 18 * scale);
        grad.addColorStop(0, '#f472b6');
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y - 16 * scale, 16 * scale, 22 * scale, time * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    // 2. Interactive Proximity Indicator Prompt [E]
    if (isHovered) {
      const bobY = Math.sin(time * 4) * 3 * scale;
      const pillY = screen.y - 36 * scale + bobY;

      ctx.fillStyle = 'rgba(15, 12, 35, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5 * scale;

      const text = `[E] ${station.name}`;
      ctx.font = `bold ${10 * scale}px sans-serif`;
      const textMetrics = ctx.measureText(text);
      const pillW = textMetrics.width + 16 * scale;
      const pillH = 18 * scale;

      ctx.beginPath();
      ctx.roundRect(screen.x - pillW / 2, pillY - pillH / 2, pillW, pillH, 8 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, screen.x, pillY);
    }

    ctx.restore();
  }
}
