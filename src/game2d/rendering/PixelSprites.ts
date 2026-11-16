/**
 * PixelSprites.ts
 * Procedural pixel-art sprite generator and cache for Wish Me Cat 2D.
 * Creates authentic 2D pixel-art spritesheets and icons with pixel-perfect resolution.
 */

import { CatBreed, CreatureRarity, CreatureVariant } from '../../types/game';

// Standard 2D Color Palettes
export const PALETTE = {
  void: '#070514',
  deepNavy: '#0c0a24',
  midnightPurple: '#181238',
  cosmicBlue: '#1e245a',
  twilightLavender: '#6d5a9e',
  lavenderLight: '#b8a9e0',
  starlightWhite: '#f8fafc',
  softCream: '#fef3c7',
  warmGold: '#fbbf24',
  solarOrange: '#f97316',
  rubyPink: '#f43f5e',
  twilightPink: '#f472b6',
  cosmicCyan: '#38bdf8',
  softTurquoise: '#2dd4bf',
  emeraldGreen: '#10b981',
  shadowBlack: '#05030a',
  translucentShadow: 'rgba(5, 3, 10, 0.35)',

  // Island Terrain
  grassDark: '#1a2254',
  grassBase: '#263174',
  grassHighlight: '#3b4b9b',
  shoreSandDark: '#443c68',
  shoreSandBase: '#635985',
  shoreSandLight: '#897ea8',
  stoneDark: '#2a2845',
  stoneBase: '#434066',
  stoneLight: '#686494',
  woodDark: '#3d251e',
  woodBase: '#6b4423',
  woodLight: '#946338',
  sakuraLeafDark: '#c026d3',
  sakuraLeafBase: '#e879f9',
  sakuraLeafLight: '#f5d0fe',
};

// Helper: create an offscreen pixel canvas
export function createPixelCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

// Convert a 2D string matrix to pixel drawing
export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: string[],
  colorMap: Record<string, string>,
  offsetX: number = 0,
  offsetY: number = 0,
  pixelSize: number = 1
): void {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char !== '.' && colorMap[char]) {
        ctx.fillStyle = colorMap[char];
        ctx.fillRect(offsetX + c * pixelSize, offsetY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// ============================================================================
// 1. CAT CHARACTER PIXEL SPRITESHEET (4 Directions x Animation Frames)
// ============================================================================
export interface CatSpriteSheet {
  idleDown: HTMLCanvasElement;
  idleUp: HTMLCanvasElement;
  idleSide: HTMLCanvasElement;
  walkDown: HTMLCanvasElement[];
  walkUp: HTMLCanvasElement[];
  walkSide: HTMLCanvasElement[];
  fishCast: HTMLCanvasElement;
  fishWait: HTMLCanvasElement;
  fishBite: HTMLCanvasElement;
  fishReel: HTMLCanvasElement[];
  celebrate: HTMLCanvasElement;
}

export function getCatBreedColors(breed: CatBreed = 'celestial'): Record<string, string> {
  switch (breed) {
    case 'calico':
      return {
        O: '#1a1829', // Outline
        F: '#fcfaf7', // Fur primary (warm white)
        S: '#f97316', // Calico ginger spots
        K: '#2b273b', // Calico dark spots
        E: '#f59e0b', // Eyes (amber)
        P: '#f472b6', // Nose/paws (pink)
        C: '#ef4444', // Collar (crimson)
        B: '#fbbf24', // Bell/charm (gold suzu)
        H: '#ffffff', // Eye highlight
        D: '#e4dfd8', // Fur shadow
      };
    case 'kuro':
      return {
        O: '#0a0914', // Outline
        F: '#1f1d2e', // Fur primary (midnight void black)
        S: '#2e2b42', // Fur highlight
        K: '#151322', // Fur deep shadow
        E: '#10b981', // Eyes (glowing emerald)
        P: '#f472b6', // Nose/paws
        C: '#a855f7', // Collar (violet)
        B: '#e2e8f0', // Bell/charm (silver moon)
        H: '#ffffff', // Eye highlight
        D: '#12101c', // Fur shadow
      };
    case 'cloud':
      return {
        O: '#1e1c38', // Outline
        F: '#fef3c7', // Fur primary (fluffy cloud cream)
        S: '#ffffff', // Fur highlight
        K: '#fde68a', // Fur soft gold shading
        E: '#38bdf8', // Eyes (celestial sapphire)
        P: '#fb7185', // Nose/paws
        C: '#f43f5e', // Collar (rose pink)
        B: '#fbbf24', // Bell/charm (gold)
        H: '#ffffff', // Eye highlight
        D: '#f3e8c8', // Fur shadow
      };
    case 'celestial':
    default:
      return {
        O: '#161331', // Outline
        F: '#9d8ec9', // Fur primary (cosmic lilac)
        S: '#c5b8e8', // Fur highlight (soft lavender)
        K: '#7b6ca8', // Fur deep shading
        E: '#38bdf8', // Eyes (luminous cyan starlight)
        P: '#f472b6', // Nose/paws (twilight pink)
        C: '#f59e0b', // Collar (celestial gold)
        B: '#fde047', // Bell/charm (sparkling star)
        H: '#ffffff', // Eye highlight
        D: '#675892', // Fur shadow
      };
  }
}

// 24x24 Pixel Art Cat Matrix Templates
const CAT_MATRICES = {
  // Facing Down (towards camera)
  idleDown1: [
    "........OOOOOO..........",
    ".......OFFFFFFO.........",
    "......OFFFFFFFFO........",
    ".....OFFOOFFOOFFO.......",
    "....OFEHOFFEOHFFO.......",
    "....OFEEOFFEEOFFO.......",
    "...OFFFFFFPFFFFFFO......",
    "...OFFFFFFOFFFFFFO......",
    "...OFFFOOOOOOFFFO.......",
    "....OFFCCCCCCFFO........",
    ".....OFFFBBFFFO.........",
    "....OFFFFFFFFFO.........",
    "...OFFFFFFFFFFFFO.......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFOOFFFFOOFFFO......",
    "..OFFFO.OFFO.OFFFO......",
    "...OOO...OO...OOO.......",
    "........................",
    "........................"
  ],
  idleDown2: [
    "........OOOOOO..........",
    ".......OFFFFFFO.........",
    "......OFFFFFFFFO........",
    ".....OFFOOFFOOFFO.......",
    "....OFEHOFFEOHFFO.......",
    "....OFEEOFFEEOFFO.......",
    "...OFFFFFFPFFFFFFO......",
    "...OFFFFFFOFFFFFFO......",
    "...OFFFOOOOOOFFFO.......",
    "....OFFCCCCCCFFO........",
    ".....OFFFBBFFFO.........",
    "....OFFFFFFFFFO.........",
    "...OFFFFFFFFFFFFO.......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFOOFFFFOOFFFO......",
    "..OFFFO.OFFO.OFFFO......",
    "...OOO...OO...OOO.......",
    "........................",
    "........................"
  ],

  // Facing Up (back to camera)
  idleUp: [
    "........OOOOOO..........",
    ".......OFFFFFFO.........",
    "......OFFFFFFFFO........",
    ".....OFFFFFFFFFFO.......",
    "....OFFFFFFFFFFFFO......",
    "....OFFFFFFFFFFFFO......",
    "...OFFFFFFFFFFFFFFO.....",
    "...OFFFFFFFFFFFFFFO.....",
    "...OFFFOOOOOOFFFO.......",
    "....OFFCCCCCCFFO........",
    "....OFFFFFFFFFO.........",
    "...OFFFFFFFFFFFFO.......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFFFFFFFFFFFFO......",
    "..OFFFOOFFFFOOFFFO......",
    "..OFFFO.OFFO.OFFFO......",
    "...OOO...OO...OOO.......",
    "......OOO...............",
    ".....OFFFO..............",
    "......OOO..............."
  ],

  // Facing Side (Right - flip horizontally for Left)
  idleSide: [
    "..........OOOOOO........",
    ".........OFFFFFFO.......",
    "........OFFFFFFFFO......",
    ".......OFFOOFFOFFO......",
    "......OFFEHOFFFFFO......",
    "......OFFEEOFFFFPO......",
    ".....OFFFFFFFFFFFFO.....",
    "....OFFFOOOOOOFFFO......",
    "....OFFCCCCCCFFO........",
    "...OFFFFFFFBFFFO........",
    "..OFFFFFFFFFFFFO........",
    ".OFFFFFFFFFFFFFFO.......",
    ".OFFFFFFFFFFFFFFO.......",
    ".OFFFOOFFFOOFFFO........",
    "..OOO..OOO..OOO.........",
    "........................",
    ".....OOOO...............",
    "....OFFFFO..............",
    ".....OOOO..............."
  ],

  // Fishing Cast & Wait
  fishCast: [
    "..........OOOOOO........",
    ".........OFFFFFFO.......",
    "........OFFFFFFFFO......",
    ".......OFFOOFFOFFO......",
    "......OFFEHOFFFFFO.RR...",
    "......OFFEEOFFFFPORRR...",
    ".....OFFFFFFFFFFFFORR...",
    "....OFFFOOOOOOFFFORR....",
    "....OFFCCCCCCFFORR......",
    "...OFFFFFFFBFFFORR......",
    "..OFFFFFFFFFFFFORR......",
    ".OFFFFFFFFFFFFFFORR.....",
    ".OFFFOOFFFOOFFFO.RR.....",
    "..OOO..OOO..OOO...RR....",
    "...................RR...",
    "....................RR..",
    ".....................RR."
  ],

  fishWait: [
    "..........OOOOOO........",
    ".........OFFFFFFO.......",
    "........OFFFFFFFFO......",
    ".......OFFOOFFOFFO......",
    "......OFFEHOFFFFFO......",
    "......OFFEEOFFFFPO.RR...",
    ".....OFFFFFFFFFFFFORRR..",
    "....OFFFOOOOOOFFFORRR...",
    "....OFFCCCCCCFFORR......",
    "...OFFFFFFFBFFFORR......",
    "..OFFFFFFFFFFFFORR......",
    ".OFFFFFFFFFFFFFFORR.....",
    ".OFFFOOFFFOOFFFO.RR.....",
    "..OOO..OOO..OOO...RR....",
    "...................RR..."
  ],

  celebrate: [
    "........OOOOOO..........",
    ".......OFFFFFFO.........",
    "......OFFFFFFFFO........",
    ".....OFFOOFFOOFFO.......",
    "....OF^^OFF^^OFFO.......",
    "....OF^^OFF^^OFFO.......",
    "...OFFFFFFPFFFFFFO......",
    "...OFFFFFFOFFFFFFO......",
    "...OFFFOOOOOOFFFO.......",
    "....OFFCCCCCCFFO........",
    "...OOFFFFBBFFFFOO.......",
    "..OOFFFFFFFFFFFFOO......",
    "..OOFFFFFFFFFFFFOO......",
    "..OFFFOOFFFFOOFFFO......",
    "...OOO...OO...OOO.......",
    "......✨.....✨..........",
    "....✨...🐟...✨........",
    "......✨.....✨.........."
  ]
};

// Generate Full Spritesheet for a Given Cat Breed
export function generateCatSpriteSheet(breed: CatBreed = 'celestial'): CatSpriteSheet {
  const colors = getCatBreedColors(breed);
  // Add fishing rod and celebration colors
  colors['R'] = '#f59e0b'; // Golden fishing rod
  colors['^'] = '#38bdf8'; // Happy closed crescent eyes

  const make = (matrix: string[], flipX: boolean = false): HTMLCanvasElement => {
    const { canvas, ctx } = createPixelCanvas(24, 24);
    drawPixelMatrix(ctx, matrix, colors, 0, 0, 1);
    if (flipX) {
      const { canvas: flipped, ctx: fCtx } = createPixelCanvas(24, 24);
      fCtx.translate(24, 0);
      fCtx.scale(-1, 1);
      fCtx.drawImage(canvas, 0, 0);
      return flipped;
    }
    return canvas;
  };

  const idleDown = make(CAT_MATRICES.idleDown1);
  const idleUp = make(CAT_MATRICES.idleUp);
  const idleSide = make(CAT_MATRICES.idleSide);

  // Walk frames with subtle paw bob
  const walkDown = [
    make(CAT_MATRICES.idleDown1),
    make(CAT_MATRICES.idleDown2),
  ];

  const walkUp = [
    make(CAT_MATRICES.idleUp),
    make(CAT_MATRICES.idleUp),
  ];

  const walkSide = [
    make(CAT_MATRICES.idleSide),
    make(CAT_MATRICES.idleSide),
  ];

  const fishCast = make(CAT_MATRICES.fishCast);
  const fishWait = make(CAT_MATRICES.fishWait);
  const fishBite = make(CAT_MATRICES.fishCast);
  const fishReel = [
    make(CAT_MATRICES.fishWait),
    make(CAT_MATRICES.fishCast)
  ];
  const celebrate = make(CAT_MATRICES.celebrate);

  return {
    idleDown,
    idleUp,
    idleSide,
    walkDown,
    walkUp,
    walkSide,
    fishCast,
    fishWait,
    fishBite,
    fishReel,
    celebrate,
  };
}

// ============================================================================
// 2. CELESTIAL CREATURES PIXEL ART ICONS & SPRITES
// ============================================================================
export interface CreatureSprites {
  icon32: HTMLCanvasElement;
  swimSprite: HTMLCanvasElement;
}

const CREATURE_PIXEL_MATRICES: Record<string, string[]> = {
  // Flicker Star (cute glowing baby star with smile)
  flicker_star: [
    "........YY........",
    ".......YYYY.......",
    "......YYYYYY......",
    "..YY..YYYYYY..YY..",
    ".YYYYYYYYYYYYYYYY.",
    "..YYYYBBYYBBYYYY..",
    "...YYYBBYYBBYYY...",
    "....YYYYYYYYYY....",
    ".....YYYPPYYY.....",
    "....YYYYYYYYYY....",
    "...YYYY.YYYY.YYYY.",
    "..YYYY...YY...YYYY",
    ".YYY............YY"
  ],

  // Moonchip (crescent moon with celestial dust)
  moonchip: [
    "......CCCCCC......",
    "....CCCCWWCCCC....",
    "...CCCC....CCCC...",
    "..CCCC......CCCC..",
    "..CCC........CCC..",
    ".CCCC.........CC..",
    ".CCCC.B...B...CC..",
    ".CCCC.........CC..",
    "..CCCC...P...CCC..",
    "..CCCC......CCCC..",
    "...CCCC....CCCC...",
    "....CCCCWWCCCC....",
    "......CCCCCC......"
  ],

  // Comet Koi (flowing majestic fish with starlight tail)
  comet_koi: [
    "............BB....",
    "...........BBBB...",
    "..........BBWWBB..",
    ".........BBWWWWBB.",
    "..TT....BBWWWWWWBB",
    ".TTTT..BBBBEWWEWBB",
    "TTTTTT.BBBBEWWEWBB",
    ".TTTT..BBBBWWWWPBB",
    "..TT....BBWWWWWWBB",
    ".........BBWWWWBB.",
    "..........BBWWBB..",
    "...........BBBB...",
    "............BB...."
  ],

  // Nebula Jelly (translucent cosmic jellyfish)
  nebula_jelly: [
    "......MMMMMM......",
    "....MMMMVVMMMM....",
    "...MMMVVVVVVMMM...",
    "..MMMVVWWWWVVMMM..",
    "..MMVVWEWWWEVVMM..",
    "..MMVVWEWWWEVVMM..",
    "..MMMVVWWWWVVMMM..",
    "...MMMVVVVVVMMM...",
    "....MMMMMMMMMM....",
    "....V..V..V..V....",
    "...V...V..V...V...",
    "..V....V..V....V..",
    ".V.....V..V.....V."
  ],

  // Aurora Crown (radiant solar-aurora tiara fish)
  aurora_crown: [
    ".GG...GG..GG...GG.",
    ".GGG..GG..GG..GGG.",
    "..GG.GGG..GGG.GG..",
    "..GGGGGGGGGGGGGG..",
    "...GGGGGGGGGGGG...",
    "..GGGWWEWWWEWGGG..",
    "..GGGWWEWWWEWGGG..",
    "...GGGGGGGGGGGG...",
    "....GGGGGGGGGG....",
    ".....GGGGGGGG.....",
    "....GG.GGGG.GG....",
    "...GG...GG...GG...",
    "..G............G.."
  ],

  // Prism Eternal (hyper-dimensional cosmic prism entity)
  prism_eternal: [
    "........PP........",
    ".......PPPP.......",
    "......PPCCPP......",
    ".....PPCCCCPP.....",
    "....PPCCWWCCPP....",
    "...PPCCWEEWCCPP...",
    "..PPCCWWEEWWCCPP..",
    "...PPCCWEEWCCPP...",
    "....PPCCWWCCPP....",
    ".....PPCCCCPP.....",
    "......PPCCPP......",
    ".......PPPP.......",
    "........PP........"
  ]
};

export function getVariantColors(rarity: CreatureRarity, variant: CreatureVariant = 'normal'): Record<string, string> {
  // Base Palette
  const map: Record<string, string> = {
    '.': 'transparent',
    W: '#ffffff',
    B: '#0f172a',
    E: '#38bdf8',
    P: '#f472b6',
    Y: '#facc15',
    C: '#7dd3fc',
    T: '#00f2fe',
    M: '#c084fc',
    V: '#818cf8',
    G: '#4ade80'
  };

  if (variant === 'golden') {
    map['Y'] = '#fef08a';
    map['C'] = '#fde047';
    map['M'] = '#eab308';
    map['G'] = '#facc15';
    map['T'] = '#fbbf24';
    map['W'] = '#fffbeb';
  } else if (variant === 'shiny') {
    map['Y'] = '#e0f2fe';
    map['C'] = '#38bdf8';
    map['M'] = '#7dd3fc';
    map['G'] = '#0284c7';
    map['T'] = '#38bdf8';
    map['W'] = '#ffffff';
  } else if (variant === 'rainbow') {
    map['Y'] = '#f43f5e';
    map['C'] = '#f59e0b';
    map['M'] = '#10b981';
    map['G'] = '#3b82f6';
    map['T'] = '#8b5cf6';
    map['W'] = '#ec4899';
  } else if (variant === 'ancient') {
    map['Y'] = '#a855f7';
    map['C'] = '#6366f1';
    map['M'] = '#4338ca';
    map['G'] = '#312e81';
    map['T'] = '#818cf8';
    map['W'] = '#c7d2fe';
  }

  return map;
}

export function generateCreatureSprite(modelType: string, rarity: CreatureRarity, variant: CreatureVariant = 'normal'): HTMLCanvasElement {
  const matrix = CREATURE_PIXEL_MATRICES[modelType] || CREATURE_PIXEL_MATRICES['flicker_star'];
  const colors = getVariantColors(rarity, variant);

  const { canvas, ctx } = createPixelCanvas(32, 32);
  const size = 18;
  const offsetX = Math.floor((32 - size) / 2);
  const offsetY = Math.floor((32 - size) / 2);

  // Soft glowing aura behind sprite
  ctx.fillStyle = variant === 'ancient' ? 'rgba(168, 85, 247, 0.25)' :
                  variant === 'golden' ? 'rgba(250, 204, 21, 0.3)' :
                  variant === 'rainbow' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.25)';
  ctx.beginPath();
  ctx.arc(16, 16, 13, 0, Math.PI * 2);
  ctx.fill();

  drawPixelMatrix(ctx, matrix, colors, offsetX, offsetY, 1);
  return canvas;
}

// ============================================================================
// 3. 2D PIXEL BOBBER SPRITE
// ============================================================================
export function generateStarBobberSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  const matrix = [
    "......YY......",
    ".....YYYY.....",
    "....YYYYYY....",
    "...YYWWWWYY...",
    "..YYWWWWWWYY..",
    "...YYWWWWYY...",
    "....YYYYYY....",
    ".....YYYY.....",
    "......YY......"
  ];
  const colors = {
    Y: '#f59e0b',
    W: '#fef08a'
  };
  drawPixelMatrix(ctx, matrix, colors, 1, 3, 1);
  return canvas;
}

// ============================================================================
// 4. HANDCRAFTED 2D PIXEL ENVIRONMENT SPRITES
// ============================================================================

// Sakura Tree Sprite (48x64)
export function generateSakuraTreeSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(48, 64);
  
  // Shadow on ground
  ctx.fillStyle = 'rgba(5, 3, 12, 0.4)';
  ctx.beginPath();
  ctx.ellipse(24, 60, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pixel Matrix for Trunk & Branches
  const trunkMatrix = [
    "........BB........",
    ".......BBBB.......",
    "......BDBDBB......",
    "......BDBDBB......",
    ".....BDDDBBBB.....",
    ".....BDDDBBBB.....",
    "....BBDDDDBBBB....",
    "...BBBDDDDBBBBB...",
    "..BBBBDDDDBBBBBB..",
    ".BBBBBDDDDBBBBBBB.",
    "BBBBBDDDDDDBBBBBBB"
  ];
  const trunkColors = {
    B: '#2d1810',
    D: '#4a2818'
  };
  drawPixelMatrix(ctx, trunkMatrix, trunkColors, 15, 48, 1);

  // Large Foliage Puffs (Stacked pixelated clusters with deep purple, magenta, pink, light cream highlights)
  const drawFoliagePuff = (cx: number, cy: number, rx: number, ry: number) => {
    // Base shadow
    ctx.fillStyle = '#701a75';
    ctx.fillRect(cx - rx, cy - ry + 4, rx * 2, ry * 2);
    // Mid tone
    ctx.fillStyle = '#a21caf';
    ctx.fillRect(cx - rx + 2, cy - ry + 2, rx * 2 - 4, ry * 2 - 4);
    // Pink bloom
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(cx - rx + 3, cy - ry, rx * 2 - 6, ry * 2 - 5);
    // Light highlights & blossom flecks
    ctx.fillStyle = '#fdf4ff';
    ctx.fillRect(cx - rx + 5, cy - ry + 2, 4, 3);
    ctx.fillRect(cx + 2, cy - ry + 4, 5, 3);
    ctx.fillRect(cx - 3, cy - ry + 7, 4, 2);
  };

  // Clustered leafy crowns
  drawFoliagePuff(18, 36, 12, 9);
  drawFoliagePuff(32, 34, 13, 9);
  drawFoliagePuff(14, 24, 13, 10);
  drawFoliagePuff(34, 22, 13, 10);
  drawFoliagePuff(24, 16, 16, 11);
  drawFoliagePuff(24, 8, 11, 7);

  return canvas;
}

// Celestial Pine Tree Sprite (32x48)
export function generatePineTreeSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(32, 48);

  // Shadow
  ctx.fillStyle = 'rgba(5, 3, 12, 0.4)';
  ctx.beginPath();
  ctx.ellipse(16, 46, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(14, 34, 4, 12);
  ctx.fillStyle = '#44403c';
  ctx.fillRect(15, 34, 2, 12);

  // 4 Tiers of pine needles (Deep indigo -> Teal -> Cyan starlight tips)
  const drawNeedleTier = (y: number, w: number, h: number) => {
    // dark base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(16 - w / 2, y, w, h);
    // teal mid
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(16 - w / 2 + 1, y, w - 2, h - 2);
    // cyan needles
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(16 - w / 2 + 3, y - 1, w - 6, h - 2);
    // starfrost tip
    ctx.fillStyle = '#cffafe';
    ctx.fillRect(15, y - 2, 2, 2);
  };

  drawNeedleTier(28, 26, 8);
  drawNeedleTier(20, 20, 8);
  drawNeedleTier(12, 14, 8);
  drawNeedleTier(5, 8, 7);

  // Top star
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15, 2, 2, 3);
  ctx.fillRect(14, 3, 4, 1);

  return canvas;
}

// Luminescent Starlight Crystal Cluster (24x32)
export function generateCrystalClusterSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(24, 32);

  // Ambient glow
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.fillRect(3, 8, 18, 22);

  // Main crystal spire
  const mainSpire = [
    "....CC....",
    "...CCCC...",
    "...CWCC...",
    "..CCWCCC..",
    "..CCWCCC..",
    ".CCCWCCCC.",
    ".CCCWCCCC.",
    ".CCCWCCCC.",
    "CCCCWCCCCC",
    "CCCCWCCCCC",
    "CCCCWCCCCC",
    "BBBBWBBBBB"
  ];
  const spireColors = {
    C: '#0284c7',
    W: '#e0f2fe',
    B: '#0369a1'
  };
  drawPixelMatrix(ctx, mainSpire, spireColors, 7, 10, 1);

  // Left smaller crystal
  const leftSpire = [
    "..PP..",
    ".PPPP.",
    ".PWPP.",
    "PPWPPP",
    "PPWPPP",
    "BBWBBB"
  ];
  const leftColors = {
    P: '#9333ea',
    W: '#f5d0fe',
    B: '#7e22ce'
  };
  drawPixelMatrix(ctx, leftSpire, leftColors, 1, 18, 1);

  // Right gem
  const rightSpire = [
    "..CC..",
    ".CCCC.",
    "CCWCCC",
    "CCWCCC",
    "BBWBBB"
  ];
  drawPixelMatrix(ctx, rightSpire, spireColors, 17, 21, 1);

  return canvas;
}

// Kasuga Stone Lantern with Warm Light (16x28)
export function generateStoneLanternSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 28);

  const matrix = [
    "......SS......",
    ".....SSSS.....",
    "....SSSSSS....",
    "...SSSSSSSS...",
    "....SSSSSS....",
    ".....YYYY.....",
    ".....YWWY.....",
    ".....YYYY.....",
    "....SSSSSS....",
    ".....SSSS.....",
    "......SS......",
    "......SS......",
    "......SS......",
    ".....SSSS.....",
    "....SSSSSS...."
  ];
  const colors = {
    S: '#475569',
    Y: '#f59e0b',
    W: '#fffbeb'
  };
  drawPixelMatrix(ctx, matrix, colors, 1, 4, 1);
  return canvas;
}

// Cosmic Gear Emporium Kiosk Sprite (64x52)
export function generateEmporiumShopSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(64, 52);

  // Shadow
  ctx.fillStyle = 'rgba(5, 3, 12, 0.45)';
  ctx.fillRect(4, 46, 56, 6);

  // Wooden Kiosk Backwall
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(8, 16, 48, 30);
  ctx.fillStyle = '#4a2818';
  ctx.fillRect(10, 18, 44, 26);

  // Striped Purple/Gold Pixel Awning
  for (let x = 4; x < 60; x += 8) {
    const isGold = (x / 8) % 2 === 0;
    ctx.fillStyle = isGold ? '#fbbf24' : '#7c3aed';
    ctx.fillRect(x, 4, 8, 12);
    // Scalloped fringe
    ctx.fillStyle = isGold ? '#f59e0b' : '#6d28d9';
    ctx.fillRect(x + 1, 15, 6, 3);
  }

  // Countertop
  ctx.fillStyle = '#78350f';
  ctx.fillRect(6, 32, 52, 6);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(8, 32, 48, 2);

  // Display Goods on counter (Fishing Rods, Spools, Star Bait)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(14, 28, 18, 3); // Golden rod
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(36, 26, 6, 6); // Reel spool
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(46, 27, 5, 5); // Star bait jar

  // Hanging Lantern on roof beam
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(10, 16, 2, 4);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(9, 20, 4, 5);

  return canvas;
}

// Celestial Quest Observatory Board (48x44)
export function generateQuestBoardSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(48, 44);

  // Posts
  ctx.fillStyle = '#2d1810';
  ctx.fillRect(8, 20, 4, 24);
  ctx.fillRect(36, 20, 4, 24);

  // Wooden Board Frame
  ctx.fillStyle = '#4a2818';
  ctx.fillRect(4, 6, 40, 26);
  ctx.fillStyle = '#2d1810';
  ctx.strokeRect(4, 6, 40, 26);

  // Pinned Parchment Notices
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(8, 10, 14, 18);
  ctx.fillRect(26, 10, 14, 18);

  // Text scribbles & Star Pin
  ctx.fillStyle = '#78350f';
  ctx.fillRect(10, 14, 10, 1);
  ctx.fillRect(10, 17, 8, 1);
  ctx.fillRect(10, 20, 9, 1);
  ctx.fillRect(28, 14, 10, 1);
  ctx.fillRect(28, 17, 7, 1);

  // Red/Gold Wax Star Seals
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(14, 8, 2, 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(32, 8, 2, 2);

  // Brass Astrolabe crest at top center
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(22, 2, 4, 4);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(23, 3, 2, 2);

  return canvas;
}

// Felis Major Constellation Altar Dais (64x48)
export function generateConstellationAltarSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(64, 48);

  // Shadow
  ctx.fillStyle = 'rgba(5, 3, 12, 0.45)';
  ctx.beginPath();
  ctx.ellipse(32, 42, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone Dais Base (Tier 1 & Tier 2)
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(8, 30, 48, 12);
  ctx.fillStyle = '#312e81';
  ctx.fillRect(10, 28, 44, 4);

  ctx.fillStyle = '#3730a3';
  ctx.fillRect(14, 20, 36, 10);
  ctx.fillStyle = '#4338ca';
  ctx.fillRect(16, 18, 32, 4);

  // Glowing Constellation Runes on stone
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(20, 24, 24, 2);
  ctx.fillRect(26, 22, 2, 6);
  ctx.fillRect(36, 22, 2, 6);

  // 2 Crystal Pylons
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(12, 14, 4, 14);
  ctx.fillRect(48, 14, 4, 14);

  // Central Levitating Star Orb
  ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
  ctx.fillRect(26, 6, 12, 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(29, 9, 6, 6);
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(31, 11, 2, 2);

  return canvas;
}

// Star Almanac Ancient Book Pedestal (32x40)
export function generateAlmanacPedestalSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(32, 40);

  // Stone Pillar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(10, 16, 12, 20);
  ctx.fillStyle = '#334155';
  ctx.fillRect(8, 34, 16, 4);
  ctx.fillStyle = '#475569';
  ctx.fillRect(8, 14, 16, 4);

  // Open Ancient Tome of Stars
  ctx.fillStyle = '#7c3aed'; // Cover back
  ctx.fillRect(4, 6, 24, 9);

  // Golden page leaves
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(6, 4, 9, 8);
  ctx.fillRect(17, 4, 9, 8);

  // Star rune on page
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(9, 7, 3, 3);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(20, 7, 3, 3);

  return canvas;
}

// Cosmic Realm Gateway Portal (56x64)
export function generateRealmGatewaySprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(56, 64);

  // Shadow
  ctx.fillStyle = 'rgba(5, 3, 12, 0.5)';
  ctx.fillRect(4, 58, 48, 6);

  // Stone Archway Pillars
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(8, 14, 8, 46);
  ctx.fillRect(40, 14, 8, 46);

  // Keystone Arch
  ctx.fillRect(8, 8, 40, 8);
  ctx.fillStyle = '#312e81';
  ctx.fillRect(10, 10, 36, 4);

  // Inner Swirling Vortex (Dark void with pulsing starlight rings)
  ctx.fillStyle = '#09081a';
  ctx.fillRect(16, 16, 24, 42);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(18, 20, 20, 34);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(22, 26, 12, 22);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(26, 34, 4, 6);

  // Starlight Runes carved into stone
  ctx.fillStyle = '#a855f7';
  ctx.fillRect(11, 24, 2, 4);
  ctx.fillRect(11, 38, 2, 4);
  ctx.fillRect(43, 24, 2, 4);
  ctx.fillRect(43, 38, 2, 4);

  return canvas;
}

// Swimming Celestial Koi Sprite Sheet (4 Frames: 24x16 each)
export function generateCelestialKoiSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];

  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(24, 16);
    const tailOffset = Math.sin((f / 4) * Math.PI * 2) * 2;

    // Body (Golden / Orange with soft cream belly)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(6, 5, 11, 6);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(7, 4, 9, 8);

    // Cream belly & spots
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(9, 6, 5, 4);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(13, 7, 3, 2);

    // Glowing starlight eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 4, 1, 1);
    ctx.fillRect(14, 11, 1, 1);

    // Pectoral Fins (flowing translucent)
    ctx.fillStyle = 'rgba(254, 215, 170, 0.85)';
    ctx.fillRect(9, 2, 4, 2);
    ctx.fillRect(9, 12, 4, 2);

    // Tail Fin with wagging offset
    const ty = Math.round(7 + tailOffset);
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(3, ty, 3, 2);
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(1, ty - 1, 2, 4);

    frames.push(canvas);
  }

  return frames;
}

// Lilypad with Lotus Flower Sprite (20x20)
export function generateLotusLilypadSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(20, 20);

  // Green Lilypad Disc with Notch
  ctx.fillStyle = '#065f46';
  ctx.fillRect(2, 4, 16, 12);
  ctx.fillRect(4, 2, 12, 16);

  ctx.fillStyle = '#059669';
  ctx.fillRect(3, 5, 14, 10);
  ctx.fillRect(5, 3, 10, 14);

  // V-Notch cut
  ctx.clearRect(10, 10, 8, 4);

  // Lotus Flower at center
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(7, 7, 6, 6);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(8, 8, 4, 4);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(9, 9, 2, 2);

  return canvas;
}
