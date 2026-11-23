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
        O: '#1c1917', // Outline
        F: '#fef3c7', // Fur primary (warm ivory)
        S: '#ea580c', // Calico ginger spots
        K: '#292524', // Calico dark chocolate spots
        E: '#10b981', // Eyes (emerald jade)
        P: '#f472b6', // Inner ear / nose pink
        C: '#ef4444', // Collar (crimson)
        B: '#fbbf24', // Bell/charm (gold suzu)
        H: '#ffffff', // Eye specular highlight
        D: '#78350f', // Fur shadow / tail accent
        W: '#ffffff', // Whiskers
      };
    case 'kuro':
      return {
        O: '#09090b', // Outline
        F: '#27272a', // Fur primary (silky midnight black)
        S: '#3f3f46', // Fur highlight
        K: '#18181b', // Fur deep shadow
        E: '#facc15', // Eyes (mystical topaz gold)
        P: '#fb7185', // Rose inner ears & nose
        C: '#9333ea', // Collar (violet)
        B: '#f43f5e', // Ruby moon pendant charm
        H: '#ffffff', // Eye specular highlight
        D: '#0f0f12', // Fur shadow
        W: '#ffffff', // Whiskers
      };
    case 'cloud':
      return {
        O: '#334155', // Outline
        F: '#f8fafc', // Fur primary (fluffy pure cloud white)
        S: '#ffffff', // Fur bright white highlight
        K: '#cbd5e1', // Fur soft silver shading
        E: '#c084fc', // Eyes (amethyst lavender)
        P: '#f472b6', // Pink inner ears & nose
        C: '#a855f7', // Collar (royal purple ribbon)
        B: '#38bdf8', // Bell/charm (sapphire star bell)
        H: '#ffffff', // Eye specular highlight
        D: '#94a3b8', // Fur shadow
        W: '#ffffff', // Whiskers
      };
    case 'celestial':
    default:
      return {
        O: '#130f2c', // Outline
        F: '#5b3e9b', // Fur primary (vibrant celestial purple)
        S: '#8262c9', // Fur highlight (soft lilac)
        K: '#382465', // Fur deep shading
        E: '#38bdf8', // Eyes (luminous cyan starlight)
        P: '#f472b6', // Nose & inner ear pink
        C: '#f59e0b', // Collar (celestial gold)
        B: '#fef08a', // Bell/charm (sparkling star)
        H: '#ffffff', // Eye specular highlight
        D: '#2a174d', // Fur shadow
        W: '#ffffff', // Whiskers
      };
  }
}

// 24x24 Handcrafted Pixel-Art Cat Matrix Templates (Clear Pointed Ears, Big Expressive Anime Eyes, Whiskers, Paws, Curled Tail)
const CAT_MATRICES = {
  idleDown1: [
    '........................',
    '.....OO..........OO.....',
    '....OFPO........OPFO....',
    '...OFFPPO......OPPFFO...',
    '...OFFPPFO.OO.OFPPFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFSFFFFFFFFFFSFFFO..',
    '..OFFOHEOFFFFFFOHEOFFO..',
    '..OFFOEEOFFPPFFOEEOFFO..',
    '.WOOFFFFFFFFFFFFFFFFOOW.',
    '..OFFFFFFFOOOOFFFFFFFO..',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OCCCCBBBBCCCCO......',
    '.....OFFFBBBBFFFO...OO..',
    '....OFFFFFFFFFFFFO.OFFO.',
    '...OFFFFFFFFFFFFFFOFFFO.',
    '...OFFFOOFFFFFFOFFOFFFO.',
    '...OFFFO.OFFFFO.OFOFFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '...OFFHO.OFFFFO.OFFHO...',
    '....OOO...OOOO...OOO....',
    '........................',
    '........................'
  ],

  idleDown2: [
    '........................',
    '.....OO..........OO.....',
    '....OFPO........OPFO....',
    '...OFFPPO......OPPFFO...',
    '...OFFPPFO.OO.OFPPFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFSFFFFFFFFFFSFFFO..',
    '..OFFOHEOFFFFFFOHEOFFO..',
    '..OFFOEEOFFPPFFOEEOFFO..',
    '.WOOFFFFFFFFFFFFFFFFOOW.',
    '..OFFFFFFFOOOOFFFFFFFO..',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OCCCCBBBBCCCCO..OO..',
    '.....OFFFBBBBFFFO..OFFO.',
    '....OFFFFFFFFFFFFO.OFFO.',
    '...OFFFFFFFFFFFFFFOFFFO.',
    '...OFFFOOFFFFFFOFFOFFFO.',
    '...OFFFO.OFFFFO.OFOFFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '...OFFHO.OFFFFO.OFFHO...',
    '....OOO...OOOO...OOO....',
    '........................',
    '........................'
  ],

  walkDown1: [
    '........................',
    '.....OO..........OO.....',
    '....OFPO........OPFO....',
    '...OFFPPO......OPPFFO...',
    '...OFFPPFO.OO.OFPPFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFSFFFFFFFFFFSFFFO..',
    '..OFFOHEOFFFFFFOHEOFFO..',
    '..OFFOEEOFFPPFFOEEOFFO..',
    '.WOOFFFFFFFFFFFFFFFFOOW.',
    '..OFFFFFFFOOOOFFFFFFFO..',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OCCCCBBBBCCCCO......',
    '.....OFFFBBBBFFFO...OO..',
    '....OFFFFFFFFFFFFO.OFFO.',
    '...OFFFFFFFFFFFFFFOFFFO.',
    '...OFFFOOFFFFFFOFFOFFFO.',
    '...OFFHO.OFFFFO.OFOFFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '....OOO..OFFHO...OOO....',
    '..........OOO...........',
    '........................',
    '........................'
  ],

  walkDown2: [
    '........................',
    '.....OO..........OO.....',
    '....OFPO........OPFO....',
    '...OFFPPO......OPPFFO...',
    '...OFFPPFO.OO.OFPPFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFSFFFFFFFFFFSFFFO..',
    '..OFFOHEOFFFFFFOHEOFFO..',
    '..OFFOEEOFFPPFFOEEOFFO..',
    '.WOOFFFFFFFFFFFFFFFFOOW.',
    '..OFFFFFFFOOOOFFFFFFFO..',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OCCCCBBBBCCCCO..OO..',
    '.....OFFFBBBBFFFO..OFFO.',
    '....OFFFFFFFFFFFFO.OFFO.',
    '...OFFFFFFFFFFFFFFOFFFO.',
    '...OFFFOOFFFFFFOFFOFFFO.',
    '...OFFFO.OFFFFO.OFOFFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '...OFFHO..OFFHO..OOO....',
    '....OOO...OOOO..........',
    '........................',
    '........................'
  ],

  idleUp: [
    '........................',
    '.....OO..........OO.....',
    '....OFFO........OFFO....',
    '...OFFFFO......OFFFFO...',
    '...OFFFFFO.OO.OFFFFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '...OFFFFFFFFFFFFFFFFO...',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OFFFFFFFFFFFFO......',
    '....OFFFFFFFFFFFFO..OO..',
    '...OFFFFFFFFFFFFFFO.OFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFOOFFFFFFOFFFOFO..',
    '...OFFFO.OFFFFO.OFFHO...',
    '...OFFHO.OFFFFO.OFFHO...',
    '....OOO...OOOO...OOO....',
    '........................',
    '........................',
    '........................'
  ],

  walkUp1: [
    '........................',
    '.....OO..........OO.....',
    '....OFFO........OFFO....',
    '...OFFFFO......OFFFFO...',
    '...OFFFFFO.OO.OFFFFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '...OFFFFFFFFFFFFFFFFO...',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OFFFFFFFFFFFFO......',
    '....OFFFFFFFFFFFFO..OO..',
    '...OFFFFFFFFFFFFFFO.OFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFOOFFFFFFOFFFOFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '...OFFHO..OFFHO..OOO....',
    '....OOO...OOOO..........',
    '........................',
    '........................',
    '........................'
  ],

  walkUp2: [
    '........................',
    '.....OO..........OO.....',
    '....OFFO........OFFO....',
    '...OFFFFO......OFFFFO...',
    '...OFFFFFO.OO.OFFFFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '...OFFFFFFFFFFFFFFFFO...',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OFFFFFFFFFFFFO......',
    '....OFFFFFFFFFFFFO..OO..',
    '...OFFFFFFFFFFFFFFO.OFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFFFFFFFFFFFFFOFFFO',
    '...OFFFOOFFFFFFOFFFOFO..',
    '...OFFHO.OFFFFO.OFFHO...',
    '....OOO..OFFHO...OOO....',
    '..........OOO...........',
    '........................',
    '........................',
    '........................'
  ],

  idleSide: [
    '........................',
    '..............OO........',
    '.............OFPO..OO...',
    '............OFFPPO.OFFO.',
    '............OFFPPFOOFFFF',
    '..OO.......OFFFFFFFFFFFF',
    '.OFFO......OFFFFFFFFFFFF',
    '.OFFO.....OFFFFFFFFOHEFF',
    '..OFO.....OFFFFFFFFOEEPO',
    '..OFO.....OFFFFFFFFOFOOW',
    '...OOOOOO.OFFFFFFFFFOOOW',
    '..OFFFFFFOFFFCCCCFFFO...',
    '.OFFFFFFFFFFCCCBBFFFO...',
    '.OFFFFFFFFFFFFFBBFFFO...',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFFO.',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................'
  ],

  walkSide1: [
    '........................',
    '..............OO........',
    '.............OFPO..OO...',
    '............OFFPPO.OFFO.',
    '............OFFPPFOOFFFF',
    '..OO.......OFFFFFFFFFFFF',
    '.OFFO......OFFFFFFFFFFFF',
    '.OFFO.....OFFFFFFFFOHEFF',
    '..OFO.....OFFFFFFFFOEEPO',
    '..OFO.....OFFFFFFFFOFOOW',
    '...OOOOOO.OFFFFFFFFFOOOW',
    '..OFFFFFFOFFFCCCCFFFO...',
    '.OFFFFFFFFFFCCCBBFFFO...',
    '.OFFFFFFFFFFFFFBBFFFO...',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFHO.OFFFFO.OFFFOFO..',
    '...OOO..OFFFFO..OFFHO...',
    '........OFFFFO...OOO....',
    '.........OOOO...........',
    '........................',
    '........................',
    '........................'
  ],

  walkSide2: [
    '........................',
    '..............OO........',
    '.............OFPO..OO...',
    '............OFFPPO.OFFO.',
    '............OFFPPFOOFFFF',
    '.OO........OFFFFFFFFFFFF',
    'OFO........OFFFFFFFFFFFF',
    '.OFFO.....OFFFFFFFFOHEFF',
    '..OFO.....OFFFFFFFFOEEPO',
    '..OFO.....OFFFFFFFFOFOOW',
    '...OOOOOO.OFFFFFFFFFOOOW',
    '..OFFFFFFOFFFCCCCFFFO...',
    '.OFFFFFFFFFFCCCBBFFFO...',
    '.OFFFFFFFFFFFFFBBFFFO...',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '...OFFFOOFFFFO.OFFHOFO..',
    '...OFFHO.OOOO...OOOO....',
    '....OOO.................',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  fishCast: [
    '..................RR....',
    '.................RR.....',
    '..............OO.RR.....',
    '.............OFPORR..OO.',
    '............OFFRR..O.OFF',
    '............OFFPFRFOOFFF',
    '..OO.......OFFFRFFFFFFFF',
    '.OFFO......OFFFRFFFFOHEF',
    '.OFFO.....OFFRRFFFFFOEEP',
    '..OFO.....OFFFRFFFFFFFOO',
    '...OOOOOO.OFFFFFFFFFFRRR',
    '..OFFFFFFOFFFCCCCFFFRR..',
    '.OFFFFFFFFFFCCCBBFFFORR.',
    '.OFFFFFFFFFFFFFBBFFFO.RR',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  fishWait: [
    '........................',
    '........................',
    '..............OO........',
    '.............OFPO..OO...',
    '............OFFPPO.OFFO.',
    '............OFFPPFOOFFFF',
    '..OO.......OFFFFFFFFFFFF',
    '.OFFO......OFFFFFFFFOHEF',
    '.OFFO.....OFFFFFFFFFOEEP',
    '..OFO.....OFFFFFFFFFOFOO',
    '...OOOOOO.OFFFFFFFFFFRRR',
    '..OFFFFFFOFFFCCCCFFFRR..',
    '.OFFFFFFFFFFCCCBBFFFORR.',
    '.OFFFFFFFFFFFFFBBFFFO.RR',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  fishBite: [
    '...................RR...',
    '..................RR....',
    '..............OO.RR.....',
    '.............OFPORR..OO.',
    '............OFFPPR.O.OFF',
    '............OFFPPFRFOFFF',
    '..OO.......OFFFRFFFFFFFF',
    '.OFFO......OFFFRFFFFOHHF',
    '.OFFO.....OFFRRFFFFFOEEP',
    '..OFO.....OFFFRFFFFFFFOO',
    '...OOOOOO.OFFFFFFFFFFRRR',
    '..OFFFFFFOFFFCCCCFFFRR..',
    '.OFFFFFFFFFFCCCBBFFFORR.',
    '.OFFFFFFFFFFFFFBBFFFO.RR',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  fishReel1: [
    '..................RR....',
    '.................RR.....',
    '..............OO.RR.....',
    '.............OFPORR..OO.',
    '............OFFRR..O.OFF',
    '............OFFPFRFOOFFF',
    '..OO.......OFFFRFFFFFFFF',
    '.OFFO......OFFFRFFFFOHEF',
    '.OFFO.....OFFRRFFFFFOEEP',
    '..OFO.....OFFFRFFFFFFFOO',
    '...OOOOOO.OFFFFFFFFFFRRR',
    '..OFFFFFFOFFFCCCCFFFRR..',
    '.OFFFFFFFFFFCCCBBFFFORR.',
    '.OFFFFFFFFFFFFFBBFFFO.RR',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  fishReel2: [
    '...................RR...',
    '..................RR....',
    '..............OO.RR.....',
    '.............OFP.RR..OO.',
    '............OFFPPR.O.OFF',
    '............OFFPPFRFOFFF',
    '..OO.......OFFFFFFFFFFFF',
    '.OFFO......OFFFFFFFFOHEF',
    '.OFFO.....OFFFFFFFFFOEEP',
    '..OFO.....OFFFFFFFFFOFOO',
    '...OOOOOO.OFFFFFFFFFFRRR',
    '..OFFFFFFOFFFCCCCFFFRR..',
    '.OFFFFFFFFFFCCCBBFFFORR.',
    '.OFFFFFFFFFFFFFBBFFFO.RR',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '.OFFFFFFFFFFFFFFFFFFFO..',
    '..OFFFOOFFFFFFOFFFOFFO..',
    '..OFFFO.OFFFFO.OFFFOFO..',
    '..OFFHO.OFFFFO.OFFHO....',
    '...OOO...OOOO...OOO.....',
    '........................',
    '........................',
    '........................',
    '........................'
  ],

  celebrate: [
    '........................',
    '.....OO..........OO.....',
    '....OFPO........OPFO....',
    '...OFFPPO......OPPFFO...',
    '...OFFPPFO.OO.OFPPFFO...',
    '..OFFFFFFFOFFOFFFFFFFO..',
    '..OFFFFFFFFFFFFFFFFFFO..',
    '..OFFFSFFFFFFFFFFSFFFO..',
    '..OFFO^^OFFFFFFO^^OFFO..',
    '..OFFO^^OFFPPFFO^^OFFO..',
    '.WOOFFFFFFFFFFFFFFFFOOW.',
    '..OFFFFFFFOOOOFFFFFFFO..',
    '...OFFFCCCCCCCCCCFFFO...',
    '....OCCCCBBBBCCCCO......',
    '.....OFFFBBBBFFFO...OO..',
    '..OOFFFFFFFFFFFFOOF.OFFO',
    '.OFFHFFFFFFFFFFFFHFOFFFO',
    '.OFFHFOOFFFFFFOFFHFOFFFO',
    '..OOO..OFFFFO...OOO.OFO.',
    '.......OFFHO.....OFFHO..',
    '.......OFFHO.....OFFHO..',
    '........OOO.......OOO...',
    '........................',
    '........................'
  ]
};

// Generate Full Spritesheet for a Given Cat Breed
export function generateCatSpriteSheet(breed: CatBreed = 'celestial', rodColor?: string): CatSpriteSheet {
  const colors = getCatBreedColors(breed);
  colors['R'] = rodColor || '#f59e0b'; // Dynamic or golden fishing rod
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

  // Walk frames with alternating paw step animations
  const walkDown = [
    make(CAT_MATRICES.walkDown1),
    make(CAT_MATRICES.walkDown2),
  ];

  const walkUp = [
    make(CAT_MATRICES.walkUp1),
    make(CAT_MATRICES.walkUp2),
  ];

  const walkSide = [
    make(CAT_MATRICES.walkSide1),
    make(CAT_MATRICES.walkSide2),
  ];

  const fishCast = make(CAT_MATRICES.fishCast);
  const fishWait = make(CAT_MATRICES.fishWait);
  const fishBite = make(CAT_MATRICES.fishBite);
  const fishReel = [
    make(CAT_MATRICES.fishReel1),
    make(CAT_MATRICES.fishReel2)
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

// Celestial Wishing Fountain (56x52)
export function generateWishingFountainSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(56, 52);

  // Soft Contact Drop Shadow
  ctx.fillStyle = 'rgba(5, 3, 12, 0.45)';
  ctx.beginPath();
  ctx.ellipse(28, 46, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer Basin Rim (Stone tiers)
  ctx.fillStyle = '#1e1b4b'; // Deep void navy
  ctx.fillRect(6, 28, 44, 18);
  ctx.fillStyle = '#312e81'; // Midtone stone
  ctx.fillRect(8, 26, 40, 4);

  // Basin Stone Blocks & Glyphs
  ctx.fillStyle = '#4338ca';
  ctx.fillRect(10, 32, 36, 12);
  ctx.fillStyle = '#38bdf8'; // Glowing ancient glyphs
  ctx.fillRect(16, 36, 4, 3);
  ctx.fillRect(26, 35, 4, 4);
  ctx.fillRect(36, 36, 4, 3);

  // Water Pool inside Basin
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(10, 24, 36, 5);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(12, 25, 32, 3);
  ctx.fillStyle = '#fef08a'; // Glimmering coin/stardust reflections
  ctx.fillRect(18, 26, 2, 2);
  ctx.fillRect(28, 25, 2, 2);
  ctx.fillRect(34, 26, 2, 2);

  // Center Tiered Pillar Pedestal
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(22, 14, 12, 14);
  ctx.fillStyle = '#3730a3';
  ctx.fillRect(24, 12, 8, 14);

  // Upper Fountain Bowl
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(18, 10, 20, 4);
  ctx.fillStyle = '#4338ca';
  ctx.fillRect(20, 8, 16, 3);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(22, 6, 12, 3);

  // Overflow Cascading Starlight Water
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(19, 12, 2, 13);
  ctx.fillRect(35, 12, 2, 13);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(27, 4, 2, 8);

  return canvas;
}

// Swimming Celestial Koi Sprite Sheet (4 Frames: 24x16 each)
// Authored with Volumetric 3D Directional Shading (Dorsal Spine Highlight & Ventral Shadow)
export function generateCelestialKoiSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];

  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(24, 16);
    // Explicit clean transparent background
    ctx.clearRect(0, 0, 24, 16);

    const tailOffset = Math.sin((f / 4) * Math.PI * 2) * 2;

    // 1. Pectoral Fins (flowing translucent fins beneath body)
    ctx.fillStyle = 'rgba(254, 215, 170, 0.75)';
    ctx.fillRect(8, 2, 5, 2);
    ctx.fillRect(8, 12, 5, 2);

    // 2. Dorsal Spine Top Highlight (Directional 3D lighting from above)
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(7, 4, 8, 2);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(9, 4, 4, 1);

    // 3. Main Mid-Body (Vibrant Golden Celestial Orange)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(6, 6, 11, 4);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(7, 5, 9, 6);

    // 4. Ventral Lower Shadow (Rounded 3D cylinder form)
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(6, 10, 10, 2);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(7, 11, 8, 1);

    // 5. Cream Belly & Starlight Markings
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(10, 7, 4, 3);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(13, 8, 2, 2);

    // 6. Glowing Starlight Eyes (Luminous White)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 5, 1, 1);
    ctx.fillRect(14, 10, 1, 1);
    ctx.fillStyle = '#38bdf8'; // Cyan iris twinkle
    ctx.fillRect(13, 5, 1, 1);
    ctx.fillRect(13, 10, 1, 1);

    // 7. Undulating Caudal Tail Fin
    const ty = Math.round(7 + tailOffset);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(4, ty, 3, 2);
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(2, ty - 1, 3, 4);
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(0, ty - 1, 2, 4);

    frames.push(canvas);
  }

  return frames;
}

// Deep Abyssal Shadow Fish Sprite Sheet (4 Frames: 28x14 each)
// Semi-submerged ancient celestial creature for deep water tiers
export function generateDeepFishSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];

  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(28, 14);
    ctx.clearRect(0, 0, 28, 14);

    const tailWag = Math.sin((f / 4) * Math.PI * 2) * 2;

    // 1. Deep Oceanic Silhouette Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(7, 4, 14, 6);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, 3, 11, 8);

    // 2. Faint Starlight Dorsal Ridge
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(10, 3, 7, 1);

    // 3. Bioluminescent Eye
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(17, 5, 1, 1);
    ctx.fillRect(17, 8, 1, 1);

    // 4. Undulating Fin
    const ty = Math.round(6 + tailWag);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, ty, 3, 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(1, ty - 1, 3, 4);

    frames.push(canvas);
  }

  return frames;
}

// Lilypad with Lotus Flower Sprite (20x20)
// Authored with multi-toned emerald disc, leaf veins, and blooming pink lotus petals
export function generateLotusLilypadSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(20, 20);
  ctx.clearRect(0, 0, 20, 20);

  // 1. Deep Emerald Pad Base Rim
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(2, 4, 16, 12);
  ctx.fillRect(4, 2, 12, 16);

  // 2. Lush Jade Body
  ctx.fillStyle = '#059669';
  ctx.fillRect(3, 5, 14, 10);
  ctx.fillRect(5, 3, 10, 14);

  // 3. Leaf Vein Highlights
  ctx.fillStyle = '#34d399';
  ctx.fillRect(6, 4, 2, 6);
  ctx.fillRect(12, 4, 2, 6);
  ctx.fillRect(4, 8, 6, 2);

  // 4. V-Notch cut
  ctx.clearRect(10, 10, 8, 5);

  // 5. Layered Blooming Pink Lotus Flower (Reference Image benchmark)
  // Outer deep rose petals
  ctx.fillStyle = '#db2777';
  ctx.fillRect(6, 6, 8, 8);

  // Mid pink petals
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(7, 7, 6, 6);

  // Soft blossom highlights
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(8, 8, 4, 4);

  // Warm golden pollen heart
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(9, 9, 2, 2);

  return canvas;
}

// Weeping Celestial Willow Tree (64x64)
export function generateWeepingWillowSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(64, 64);
  ctx.fillStyle = 'rgba(5, 3, 15, 0.4)';
  ctx.beginPath();
  ctx.ellipse(32, 60, 22, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(28, 38, 8, 22);
  ctx.fillStyle = '#292524';
  ctx.fillRect(29, 40, 6, 20);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(28, 48, 2, 6);

  ctx.fillStyle = '#064e3b';
  ctx.fillRect(16, 14, 32, 26);
  ctx.fillStyle = '#047857';
  ctx.fillRect(18, 12, 28, 26);

  const vineColors = ['#10b981', '#34d399', '#6ee7b7', '#38bdf8'];
  for (let x = 12; x <= 52; x += 4) {
    const len = 20 + ((x * 7) % 18);
    ctx.fillStyle = vineColors[(x / 4) % vineColors.length];
    ctx.fillRect(x, 26, 2, len);
    ctx.fillStyle = '#cffafe';
    ctx.fillRect(x, 26 + len - 2, 2, 2);
  }

  ctx.fillStyle = '#6ee7b7';
  ctx.fillRect(24, 14, 16, 8);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillRect(28, 16, 8, 4);

  return canvas;
}

// Bioluminescent Mushroom Cluster (24x20)
export function generateBioluminescentMushroomSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(24, 20);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
  ctx.beginPath();
  ctx.ellipse(12, 17, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(10, 10, 4, 8);
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(6, 6, 12, 6);
  ctx.fillStyle = '#c084fc';
  ctx.fillRect(7, 5, 10, 4);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8, 7, 2, 2);
  ctx.fillRect(13, 6, 2, 2);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(4, 13, 2, 5);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(2, 10, 6, 4);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(3, 11, 2, 2);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(17, 12, 3, 6);
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(15, 9, 7, 4);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(17, 10, 2, 2);

  return canvas;
}

// ============================================================================
// 6. MULTI-WORLD REGIONAL ENVIRONMENT PIXEL SPRITES
// ============================================================================

export function generateCoralTreeSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(48, 64);
  ctx.fillStyle = 'rgba(5, 2, 18, 0.45)';
  ctx.beginPath();
  ctx.ellipse(24, 60, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e0836';
  ctx.fillRect(21, 46, 6, 14);
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(22, 47, 4, 12);

  const branches = [
    { x: 14, y: 32, w: 6, h: 16, c1: '#0e7490', c2: '#06b6d4', c3: '#67e8f9' },
    { x: 28, y: 30, w: 6, h: 18, c1: '#86198f', c2: '#c026d3', c3: '#f0abfc' },
    { x: 8, y: 18, w: 8, h: 18, c1: '#0891b2', c2: '#22d3ee', c3: '#a5f3fc' },
    { x: 32, y: 16, w: 8, h: 18, c1: '#a21caf', c2: '#e879f9', c3: '#fdf4ff' },
    { x: 20, y: 10, w: 8, h: 22, c1: '#0284c7', c2: '#38bdf8', c3: '#bae6fd' },
    { x: 16, y: 4, w: 16, h: 10, c1: '#c026d3', c2: '#f472b6', c3: '#fce7f3' },
  ];

  branches.forEach(b => {
    ctx.fillStyle = b.c1;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = b.c2;
    ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    ctx.fillStyle = b.c3;
    ctx.fillRect(b.x + 2, b.y + 1, 2, 3);
  });

  ctx.fillStyle = '#67e8f9';
  ctx.fillRect(10, 16, 3, 3);
  ctx.fillRect(36, 14, 3, 3);
  ctx.fillRect(22, 2, 4, 4);
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(12, 17, 1, 1);
  ctx.fillRect(38, 15, 1, 1);
  ctx.fillRect(23, 3, 2, 2);

  return canvas;
}

export function generateAlienMushroomSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 28);
  ctx.fillStyle = 'rgba(5, 2, 18, 0.45)';
  ctx.beginPath();
  ctx.ellipse(14, 25, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(12, 14, 4, 11);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(13, 15, 2, 9);

  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(4, 8, 20, 8);
  ctx.fillRect(6, 6, 16, 12);
  ctx.fillRect(8, 4, 12, 14);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(6, 8, 16, 7);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8, 6, 12, 6);

  ctx.fillStyle = '#f0abfc';
  ctx.fillRect(7, 9, 3, 2);
  ctx.fillRect(18, 9, 3, 2);
  ctx.fillRect(12, 6, 4, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(13, 7, 2, 1);

  return canvas;
}

export function generateMeteorCragSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(44, 56);
  ctx.fillStyle = 'rgba(3, 8, 18, 0.55)';
  ctx.beginPath();
  ctx.ellipse(22, 52, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#090d16';
  ctx.fillRect(8, 20, 28, 32);
  ctx.fillRect(12, 10, 20, 42);
  ctx.fillRect(16, 4, 12, 48);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(10, 22, 24, 28);
  ctx.fillRect(14, 12, 16, 38);
  ctx.fillRect(18, 6, 8, 44);

  ctx.fillStyle = '#334155';
  ctx.fillRect(14, 14, 6, 32);
  ctx.fillRect(20, 8, 4, 38);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(18, 22, 2, 18);
  ctx.fillRect(24, 28, 2, 12);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(18, 24, 2, 14);
  ctx.fillRect(24, 30, 2, 8);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(19, 26, 1, 8);
  ctx.fillRect(25, 32, 1, 4);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(10, 36, 4, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(11, 37, 2, 2);

  return canvas;
}

export function generateIceSpireSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(32, 56);
  ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
  ctx.beginPath();
  ctx.ellipse(16, 52, 13, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(8, 24, 16, 28);
  ctx.fillRect(11, 12, 10, 40);
  ctx.fillRect(14, 3, 4, 49);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(10, 26, 12, 24);
  ctx.fillRect(12, 14, 8, 36);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(13, 16, 4, 32);
  ctx.fillRect(14, 6, 3, 42);

  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(14, 4, 2, 18);
  ctx.fillRect(13, 24, 1, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(15, 3, 1, 6);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(4, 36, 5, 14);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(5, 37, 3, 12);

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(23, 38, 5, 12);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(24, 39, 3, 10);

  return canvas;
}

export function generateIceClusterSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(24, 28);
  ctx.fillStyle = 'rgba(8, 12, 24, 0.4)';
  ctx.beginPath();
  ctx.ellipse(12, 25, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(4, 10, 16, 15);
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(6, 12, 12, 12);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8, 8, 8, 14);
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(10, 6, 4, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(11, 4, 2, 4);

  return canvas;
}

export function generateAbyssalSpireSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(44, 64);
  ctx.fillStyle = 'rgba(2, 10, 7, 0.55)';
  ctx.beginPath();
  ctx.ellipse(22, 60, 18, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#020c09';
  ctx.fillRect(12, 16, 20, 44);
  ctx.fillRect(16, 6, 12, 54);

  ctx.fillStyle = '#06241a';
  ctx.fillRect(14, 18, 16, 40);
  ctx.fillRect(18, 8, 8, 50);

  ctx.fillStyle = '#047857';
  ctx.fillRect(12, 38, 4, 18);
  ctx.fillRect(26, 26, 4, 24);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(13, 40, 2, 14);
  ctx.fillRect(27, 28, 2, 20);

  ctx.fillStyle = '#34d399';
  ctx.fillRect(19, 20, 4, 2);
  ctx.fillRect(20, 22, 2, 6);
  ctx.fillRect(19, 34, 4, 2);
  ctx.fillRect(20, 36, 2, 8);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillRect(20, 21, 2, 2);
  ctx.fillRect(20, 35, 2, 2);

  ctx.fillStyle = '#6ee7b7';
  ctx.fillRect(21, 2, 3, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(22, 2, 1, 1);

  return canvas;
}

export function generateEclipsePillarSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(40, 64);
  ctx.fillStyle = 'rgba(3, 2, 6, 0.6)';
  ctx.beginPath();
  ctx.ellipse(20, 60, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#06040b';
  ctx.fillRect(10, 14, 20, 46);
  ctx.fillRect(8, 12, 24, 4);
  ctx.fillRect(8, 56, 24, 4);

  ctx.fillStyle = '#160f26';
  ctx.fillRect(12, 16, 16, 40);
  ctx.fillStyle = '#261a42';
  ctx.fillRect(14, 16, 4, 40);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(18, 22, 4, 4);
  ctx.fillRect(19, 28, 2, 14);
  ctx.fillRect(17, 34, 6, 2);
  ctx.fillRect(18, 44, 4, 4);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(19, 23, 2, 2);
  ctx.fillRect(19, 29, 2, 12);
  ctx.fillRect(18, 34, 4, 2);
  ctx.fillRect(19, 45, 2, 2);

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(19, 23, 1, 1);
  ctx.fillRect(19, 34, 2, 1);

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(20, 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#06040b';
  ctx.beginPath();
  ctx.arc(20, 6, 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

export function generateVoidMonolithSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(44, 60);
  ctx.fillStyle = 'rgba(3, 2, 6, 0.45)';
  ctx.beginPath();
  ctx.ellipse(22, 56, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#080512';
  ctx.fillRect(10, 16, 24, 30);
  ctx.fillRect(14, 12, 16, 38);

  ctx.fillStyle = '#1c1330';
  ctx.fillRect(12, 18, 20, 26);
  ctx.fillRect(16, 14, 12, 34);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(20, 22, 4, 18);
  ctx.fillRect(15, 29, 14, 4);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(21, 23, 2, 16);
  ctx.fillRect(16, 30, 12, 2);

  return canvas;
}

export function generateIceFloeSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(22, 22);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(4, 5, 14, 12);
  ctx.fillRect(6, 3, 10, 16);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(5, 6, 12, 10);
  ctx.fillRect(7, 4, 8, 14);

  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(6, 6, 10, 8);
  ctx.fillStyle = '#f0f9ff';
  ctx.fillRect(7, 5, 6, 6);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(8, 6, 2, 2);

  return canvas;
}

export function generateAbyssalLilySprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(20, 20);
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(3, 5, 14, 10);
  ctx.fillRect(5, 3, 10, 14);
  ctx.fillStyle = '#059669';
  ctx.fillRect(4, 6, 12, 8);

  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(6, 6, 8, 8);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(7, 7, 6, 6);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillRect(8, 8, 4, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(9, 9, 2, 2);

  return canvas;
}

export function generateSolarDiskSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(20, 20);
  ctx.fillStyle = '#0f0728';
  ctx.fillRect(4, 5, 12, 10);
  ctx.fillRect(5, 4, 10, 12);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(5, 5, 10, 10);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(6, 6, 8, 8);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(7, 7, 6, 6);
  ctx.fillStyle = '#06040b';
  ctx.fillRect(9, 9, 2, 2);

  return canvas;
}

export function generateJellyfishSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(22, 20);
    const pulse = Math.sin((f / 4) * Math.PI * 2);
    const capW = Math.round(14 + pulse * 2);
    const capH = Math.round(8 - pulse * 1);
    const cx = 11;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.fillRect(cx - capW / 2, 4, capW, capH);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillRect(cx - (capW - 4) / 2, 3, capW - 4, capH);

    ctx.fillStyle = '#f0abfc';
    ctx.fillRect(cx - 2, 5, 4, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, 6, 2, 2);

    const tentacleColors = ['#67e8f9', '#c084fc', '#38bdf8'];
    for (let t = -3; t <= 3; t += 2) {
      const tx = cx + t;
      const sway = Math.sin((f / 4) * Math.PI * 2 + t) * 2;
      ctx.fillStyle = tentacleColors[(t + 3) % tentacleColors.length];
      ctx.fillRect(tx + Math.round(sway), 4 + capH, 1, 6 + Math.abs(t));
    }
    frames.push(canvas);
  }
  return frames;
}

export function generateCometFishSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(26, 12);
    const tailWag = Math.sin((f / 4) * Math.PI * 2) * 2;

    ctx.fillStyle = 'rgba(251, 146, 60, 0.45)';
    ctx.fillRect(0, 5 + Math.round(tailWag), 6, 2);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.fillRect(4, 5 + Math.round(tailWag * 0.7), 4, 2);

    ctx.fillStyle = '#b45309';
    ctx.fillRect(8, 4, 14, 4);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(10, 3, 12, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(14, 4, 8, 4);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 5, 3, 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(21, 4, 1, 1);

    frames.push(canvas);
  }
  return frames;
}

export function generateGhostFishSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(26, 16);
    const tailWag = Math.sin((f / 4) * Math.PI * 2) * 2;

    ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
    ctx.fillRect(6, 4, 14, 8);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.fillRect(8, 3, 12, 10);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.fillRect(12, 5, 8, 6);

    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(18, 5, 2, 2);
    ctx.fillRect(18, 9, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19, 5, 1, 1);
    ctx.fillRect(19, 9, 1, 1);

    const ty = Math.round(7 + tailWag);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.fillRect(3, ty - 1, 4, 4);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
    ctx.fillRect(0, ty - 2, 4, 6);

    frames.push(canvas);
  }
  return frames;
}

export function generateSolarDragonFishSpriteSheet(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  for (let f = 0; f < 4; f++) {
    const { canvas, ctx } = createPixelCanvas(32, 18);
    const wave = Math.sin((f / 4) * Math.PI * 2) * 2;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.fillRect(10, 1, 8, 3);
    ctx.fillRect(10, 14, 8, 3);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(8, 6, 18, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(10, 5, 16, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(14, 6, 10, 6);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(24, 3, 2, 3);
    ctx.fillRect(26, 2, 2, 2);
    ctx.fillRect(26, 11, 4, 1);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 6, 2, 2);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(23, 6, 1, 1);

    const ty = Math.round(8 + wave);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(4, ty - 1, 5, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(1, ty - 2, 4, 6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(0, ty - 1, 2, 4);

    frames.push(canvas);
  }
  return frames;
}

// ============================================================================
// 7. CAT ACCESSORIES & LIVING EMOTE PIXEL SPRITES
// ============================================================================

export function generateStrawHatSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 18);
  ctx.fillStyle = '#b45309';
  ctx.fillRect(8, 4, 12, 6);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(9, 3, 10, 6);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(10, 2, 8, 4);

  ctx.fillStyle = '#059669';
  ctx.fillRect(8, 8, 12, 2);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(10, 8, 4, 1);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(2, 10, 24, 3);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(3, 9, 22, 2);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(4, 9, 20, 1);

  return canvas;
}

export function generateStarBeretSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(26, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(4, 6, 18, 8);
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(5, 5, 17, 7);
  ctx.fillStyle = '#312e81';
  ctx.fillRect(6, 4, 15, 6);
  ctx.fillStyle = '#4338ca';
  ctx.fillRect(8, 3, 11, 4);

  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(13, 1, 2, 3);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(6, 7, 3, 3);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(7, 6, 1, 5);
  ctx.fillRect(5, 8, 5, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 8, 1, 1);

  return canvas;
}

export function generateWizardHoodSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 24);
  ctx.fillStyle = '#2e1065';
  ctx.fillRect(8, 2, 4, 3);
  ctx.fillRect(10, 4, 5, 4);
  ctx.fillRect(9, 7, 8, 4);
  ctx.fillRect(7, 10, 12, 5);

  ctx.fillStyle = '#581c87';
  ctx.fillRect(9, 3, 2, 2);
  ctx.fillRect(11, 5, 3, 3);
  ctx.fillRect(10, 8, 6, 3);
  ctx.fillRect(8, 11, 10, 4);

  ctx.fillStyle = '#fde047';
  ctx.fillRect(6, 1, 3, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 2, 1, 1);

  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(5, 15, 16, 4);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(7, 16, 2, 2);
  ctx.fillRect(12, 16, 2, 2);
  ctx.fillRect(17, 16, 2, 2);

  return canvas;
}

export function generateCosmicCrownSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(26, 18);
  ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.beginPath();
  ctx.ellipse(13, 9, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b45309';
  ctx.fillRect(4, 11, 18, 4);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(5, 10, 16, 3);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(6, 10, 14, 1);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(6, 5, 3, 5);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(7, 4, 1, 4);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(11, 3, 4, 7);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(12, 2, 2, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(12, 1, 2, 2);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(17, 5, 3, 5);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(18, 4, 1, 4);

  ctx.fillStyle = '#be123c';
  ctx.fillRect(11, 10, 4, 3);
  ctx.fillStyle = '#fda4af';
  ctx.fillRect(12, 10, 1, 1);

  return canvas;
}

export function generateAuroraMantleSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 22);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(12, 2, 4, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(13, 3, 2, 1);

  ctx.fillStyle = '#064e3b';
  ctx.fillRect(7, 5, 14, 11);
  ctx.fillStyle = '#047857';
  ctx.fillRect(8, 4, 12, 12);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(9, 6, 10, 9);

  ctx.fillStyle = '#2dd4bf';
  ctx.fillRect(6, 15, 16, 3);
  ctx.fillStyle = '#67e8f9';
  ctx.fillRect(7, 17, 14, 2);
  ctx.fillStyle = '#cffafe';
  ctx.fillRect(9, 18, 10, 1);

  return canvas;
}

export function generateNebulaCloakSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 22);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(12, 2, 4, 3);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(13, 3, 2, 1);

  ctx.fillStyle = '#1e0836';
  ctx.fillRect(6, 4, 16, 13);
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(7, 5, 14, 12);
  ctx.fillStyle = '#581c87';
  ctx.fillRect(9, 6, 10, 10);

  ctx.fillStyle = '#c026d3';
  ctx.fillRect(10, 9, 6, 3);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(12, 8, 4, 4);
  ctx.fillStyle = '#fdf4ff';
  ctx.fillRect(13, 9, 2, 2);

  ctx.fillStyle = '#a855f7';
  ctx.fillRect(6, 16, 16, 2);
  ctx.fillStyle = '#f0abfc';
  ctx.fillRect(8, 17, 12, 1);

  return canvas;
}

export function generateCometScarfSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(28, 20);
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(8, 2, 12, 6);
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(9, 3, 10, 5);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(10, 3, 8, 4);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(11, 4, 6, 2);

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(16, 7, 5, 10);
  ctx.fillRect(19, 10, 6, 8);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(17, 8, 4, 8);
  ctx.fillRect(20, 11, 4, 6);

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(18, 16, 3, 2);
  ctx.fillRect(22, 17, 3, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 17, 1, 1);
  ctx.fillRect(24, 18, 1, 1);

  return canvas;
}

export function generateStarlightBellSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(6, 2, 4, 2);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(4, 4, 8, 7);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(6, 5, 4, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6, 6, 2, 1);

  ctx.fillStyle = '#78350f';
  ctx.fillRect(7, 9, 2, 2);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(7, 11, 2, 2);

  return canvas;
}

export function generateMoonPearlSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.beginPath();
  ctx.arc(8, 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#64748b';
  ctx.fillRect(6, 2, 4, 3);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(6, 5, 4, 6);
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(6, 6, 3, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 6, 2, 2);

  return canvas;
}

export function generateSolarAmuletSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.beginPath();
  ctx.arc(8, 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.fillRect(7, 2, 2, 2);
  ctx.fillRect(7, 12, 2, 2);
  ctx.fillRect(2, 7, 2, 2);
  ctx.fillRect(12, 7, 2, 2);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(6, 6, 4, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 7, 2, 2);

  return canvas;
}

export function generateVoidPrismSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
  ctx.beginPath();
  ctx.arc(8, 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2e1065';
  ctx.fillRect(6, 3, 4, 10);
  ctx.fillRect(4, 5, 8, 6);

  ctx.fillStyle = '#a855f7';
  ctx.fillRect(5, 6, 3, 4);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8, 6, 3, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(7, 7, 2, 2);

  return canvas;
}

export function generateHeartParticleSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(12, 12);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(2, 2, 3, 2);
  ctx.fillRect(7, 2, 3, 2);
  ctx.fillRect(1, 4, 10, 3);
  ctx.fillRect(2, 7, 8, 2);
  ctx.fillRect(4, 9, 4, 1);
  ctx.fillRect(5, 10, 2, 1);

  ctx.fillStyle = '#fecdd3';
  ctx.fillRect(2, 3, 2, 1);
  return canvas;
}

export function generateZzzBubbleSprite(): HTMLCanvasElement {
  const { canvas, ctx } = createPixelCanvas(16, 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(8, 2, 6, 1);
  ctx.fillRect(11, 3, 2, 1);
  ctx.fillRect(9, 4, 2, 1);
  ctx.fillRect(7, 5, 2, 1);
  ctx.fillRect(6, 6, 6, 1);

  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(2, 8, 4, 1);
  ctx.fillRect(4, 9, 1, 1);
  ctx.fillRect(3, 10, 1, 1);
  ctx.fillRect(2, 11, 4, 1);
  return canvas;
}

export function generateAccessorySprite(id: string): HTMLCanvasElement {
  switch (id) {
    case 'hat_straw_fisherman': return generateStrawHatSprite();
    case 'hat_star_beret': return generateStarBeretSprite();
    case 'hat_wizard_hood': return generateWizardHoodSprite();
    case 'hat_cosmic_crown': return generateCosmicCrownSprite();
    case 'cape_aurora_mantle': return generateAuroraMantleSprite();
    case 'cape_nebula_cloak': return generateNebulaCloakSprite();
    case 'cape_comet_tail': return generateCometScarfSprite();
    case 'charm_starlight_bell': return generateStarlightBellSprite();
    case 'charm_lunar_pearl': return generateMoonPearlSprite();
    case 'charm_solar_amulet': return generateSolarAmuletSprite();
    case 'charm_void_prism': return generateVoidPrismSprite();
    default: return generateStarlightBellSprite();
  }
}

