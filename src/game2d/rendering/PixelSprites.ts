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
