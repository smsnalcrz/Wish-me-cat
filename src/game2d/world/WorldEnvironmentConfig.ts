/**
 * WorldEnvironmentConfig.ts
 * Comprehensive visual environment and atmospheric configuration for every map in Wish Me Cat.
 * Defines unique palettes, skyboxes, celestial phenomena, island terrain, flora props,
 * water behavior, swimming pond creatures, ambient particles, and lighting overlays.
 */

export interface WorldPalette {
  spaceBgTop: string;
  spaceBgBottom: string;
  nebulaPrimary: string;
  nebulaSecondary: string;
  starColors: string[];
  cliffDrop: string;
  cliffMid: string;
  cliffHighlight: string;
  turfOuter: string;
  turfMain: string;
  turfInner: string;
  pathColors: string[];
  grassColors: string[];
  flowerColors: string[];
  lightingColor: string;
  lightingPulseColor: string;
}

export interface WorldWaterConfig {
  bedColor: string;
  gradientStops: [string, string, string, string, string];
  cliffRgb: [number, number, number];
  reflectionHalo: string;
  reflectionMid: string;
  reflectionCore: string;
  glintColors: string[];
  shorelineColors: { color: string; highlight: string; wet: string }[];
  debrisType: 'sakura' | 'spores' | 'comet_sparks' | 'ice_floes' | 'spirit_lilies' | 'solar_embers';
  debrisColors: string[];
  padStyle: 'lotus' | 'coral' | 'ice' | 'phantom' | 'ancient_gold';
}

export interface WorldPropDef {
  x: number;
  y: number;
  radius: number;
  type: string; // 'sakura' | 'willow' | 'pine' | 'crystal' | 'lamp' | 'mushroom' | 'coral' | 'meteor' | 'ice_spire' | 'abyssal_spire' | 'eclipse_pillar' etc.
}

export interface WorldParticleConfig {
  type: 'petals' | 'spores' | 'comet_sparks' | 'diamond_dust' | 'aurora_mist' | 'void_embers';
  colors: string[];
  count: number;
  speedY: number;
  speedX: number;
  sway: number;
}

export interface WorldCelestialConfig {
  type: 'moon' | 'nebula_lagoon' | 'comet_falls' | 'saturn_rings' | 'aurora_deep' | 'eclipse_well';
  title: string;
  subtitle: string;
}

export interface SwimmingCreatureDef {
  type: 'koi' | 'deep' | 'jellyfish' | 'comet_dart' | 'ghost' | 'dragon';
  depth: number;
  speed: number;
  baseWidth: number;
  baseHeight: number;
  orbitRxRatio: number;
  orbitRyRatio: number;
  name: string;
}

export interface WorldEnvironmentData {
  id: string;
  name: string;
  subtitle: string;
  palette: WorldPalette;
  water: WorldWaterConfig;
  celestial: WorldCelestialConfig;
  props: WorldPropDef[];
  particles: WorldParticleConfig;
  creatures: SwimmingCreatureDef[];
}

// -----------------------------------------------------------------------------
// Handcrafted Prop Distributions for Each Map
// -----------------------------------------------------------------------------

const MOONPOOL_PROPS: WorldPropDef[] = [
  // Sakura Trees
  { x: -140, y: -150, radius: 24, type: 'sakura' },
  { x: 140, y: -150, radius: 24, type: 'sakura' },
  { x: -170, y: 50, radius: 24, type: 'sakura' },
  { x: 180, y: 50, radius: 24, type: 'sakura' },
  { x: -70, y: 195, radius: 20, type: 'sakura' },
  { x: 70, y: 195, radius: 20, type: 'sakura' },
  // Weeping Willows
  { x: -160, y: -65, radius: 26, type: 'willow' },
  { x: 165, y: -65, radius: 26, type: 'willow' },
  { x: -95, y: -130, radius: 26, type: 'willow' },
  { x: 95, y: -130, radius: 26, type: 'willow' },
  // Pines & Crystals
  { x: -240, y: -80, radius: 18, type: 'pine' },
  { x: 240, y: -80, radius: 18, type: 'pine' },
  { x: -80, y: -220, radius: 18, type: 'pine' },
  { x: 80, y: -220, radius: 18, type: 'pine' },
  { x: -225, y: 10, radius: 14, type: 'crystal' },
  { x: 225, y: 10, radius: 14, type: 'crystal' },
  { x: -110, y: 145, radius: 14, type: 'crystal' },
  { x: 110, y: 145, radius: 14, type: 'crystal' },
  // Mushrooms & Kasuga Lamps
  { x: -130, y: -135, radius: 8, type: 'mushroom' },
  { x: 130, y: -135, radius: 8, type: 'mushroom' },
  { x: -215, y: 25, radius: 8, type: 'mushroom' },
  { x: 235, y: 25, radius: 8, type: 'mushroom' },
  { x: -45, y: 95, radius: 8, type: 'lamp' },
  { x: 45, y: 95, radius: 8, type: 'lamp' },
  { x: -105, y: -35, radius: 8, type: 'lamp' },
  { x: 105, y: -35, radius: 8, type: 'lamp' },
  { x: 0, y: -175, radius: 8, type: 'lamp' },
];

const NEBULA_LAGOON_PROPS: WorldPropDef[] = [
  // Bioluminescent Coral Trees
  { x: -140, y: -150, radius: 26, type: 'coral_tree' },
  { x: 140, y: -150, radius: 26, type: 'coral_tree' },
  { x: -170, y: 50, radius: 26, type: 'coral_tree' },
  { x: 180, y: 50, radius: 26, type: 'coral_tree' },
  { x: -70, y: 195, radius: 22, type: 'coral_tree' },
  { x: 70, y: 195, radius: 22, type: 'coral_tree' },
  // Giant Alien Mushrooms
  { x: -160, y: -65, radius: 22, type: 'alien_mushroom' },
  { x: 165, y: -65, radius: 22, type: 'alien_mushroom' },
  { x: -95, y: -130, radius: 22, type: 'alien_mushroom' },
  { x: 95, y: -130, radius: 22, type: 'alien_mushroom' },
  // Bioluminescent Spores & Coral Clusters
  { x: -240, y: -80, radius: 18, type: 'alien_mushroom' },
  { x: 240, y: -80, radius: 18, type: 'alien_mushroom' },
  { x: -80, y: -220, radius: 18, type: 'coral_tree' },
  { x: 80, y: -220, radius: 18, type: 'coral_tree' },
  // Luminous Cyan Crystal Spires
  { x: -225, y: 10, radius: 14, type: 'crystal' },
  { x: 225, y: 10, radius: 14, type: 'crystal' },
  { x: -110, y: 145, radius: 14, type: 'crystal' },
  { x: 110, y: 145, radius: 14, type: 'crystal' },
  // Bio-Lanterns & Spore Pods
  { x: -45, y: 95, radius: 8, type: 'bio_lamp' },
  { x: 45, y: 95, radius: 8, type: 'bio_lamp' },
  { x: -105, y: -35, radius: 8, type: 'bio_lamp' },
  { x: 105, y: -35, radius: 8, type: 'bio_lamp' },
  { x: 0, y: -175, radius: 8, type: 'bio_lamp' },
];

const COMET_FALLS_PROPS: WorldPropDef[] = [
  // Massive Meteor Crags
  { x: -140, y: -150, radius: 26, type: 'meteor_crag' },
  { x: 140, y: -150, radius: 26, type: 'meteor_crag' },
  { x: -170, y: 50, radius: 26, type: 'meteor_crag' },
  { x: 180, y: 50, radius: 26, type: 'meteor_crag' },
  { x: -70, y: 195, radius: 22, type: 'meteor_crag' },
  { x: 70, y: 195, radius: 22, type: 'meteor_crag' },
  // Rugged Alpine Pines
  { x: -160, y: -65, radius: 20, type: 'pine' },
  { x: 165, y: -65, radius: 20, type: 'pine' },
  { x: -95, y: -130, radius: 20, type: 'pine' },
  { x: 95, y: -130, radius: 20, type: 'pine' },
  { x: -240, y: -80, radius: 20, type: 'pine' },
  { x: 240, y: -80, radius: 20, type: 'pine' },
  // Comet Shard Crystals
  { x: -225, y: 10, radius: 16, type: 'crystal' },
  { x: 225, y: 10, radius: 16, type: 'crystal' },
  { x: -110, y: 145, radius: 16, type: 'crystal' },
  { x: 110, y: 145, radius: 16, type: 'crystal' },
  // Starlight Beacon Braziers
  { x: -45, y: 95, radius: 8, type: 'comet_lamp' },
  { x: 45, y: 95, radius: 8, type: 'comet_lamp' },
  { x: -105, y: -35, radius: 8, type: 'comet_lamp' },
  { x: 105, y: -35, radius: 8, type: 'comet_lamp' },
  { x: 0, y: -175, radius: 8, type: 'comet_lamp' },
];

const SATURN_RINGS_PROPS: WorldPropDef[] = [
  // Crystalline Ice Spires
  { x: -140, y: -150, radius: 26, type: 'ice_spire' },
  { x: 140, y: -150, radius: 26, type: 'ice_spire' },
  { x: -170, y: 50, radius: 26, type: 'ice_spire' },
  { x: 180, y: 50, radius: 26, type: 'ice_spire' },
  { x: -70, y: 195, radius: 22, type: 'ice_spire' },
  { x: 70, y: 195, radius: 22, type: 'ice_spire' },
  // Geometric Diamond Crystal Clusters
  { x: -160, y: -65, radius: 20, type: 'ice_cluster' },
  { x: 165, y: -65, radius: 20, type: 'ice_cluster' },
  { x: -95, y: -130, radius: 20, type: 'ice_cluster' },
  { x: 95, y: -130, radius: 20, type: 'ice_cluster' },
  { x: -240, y: -80, radius: 20, type: 'ice_spire' },
  { x: 240, y: -80, radius: 20, type: 'ice_spire' },
  // Prismatic Monoliths
  { x: -225, y: 10, radius: 16, type: 'ice_cluster' },
  { x: 225, y: 10, radius: 16, type: 'ice_cluster' },
  { x: -110, y: 145, radius: 16, type: 'ice_cluster' },
  { x: 110, y: 145, radius: 16, type: 'ice_cluster' },
  // Planetary Prism Lamps
  { x: -45, y: 95, radius: 8, type: 'frost_lamp' },
  { x: 45, y: 95, radius: 8, type: 'frost_lamp' },
  { x: -105, y: -35, radius: 8, type: 'frost_lamp' },
  { x: 105, y: -35, radius: 8, type: 'frost_lamp' },
  { x: 0, y: -175, radius: 8, type: 'frost_lamp' },
];

const AURORA_DEEP_PROPS: WorldPropDef[] = [
  // Ancient Abyssal Spires entwined with luminescent moss
  { x: -140, y: -150, radius: 26, type: 'abyssal_spire' },
  { x: 140, y: -150, radius: 26, type: 'abyssal_spire' },
  { x: -170, y: 50, radius: 26, type: 'abyssal_spire' },
  { x: 180, y: 50, radius: 26, type: 'abyssal_spire' },
  { x: -70, y: 195, radius: 22, type: 'abyssal_spire' },
  { x: 70, y: 195, radius: 22, type: 'abyssal_spire' },
  // Weeping Moss Willows
  { x: -160, y: -65, radius: 26, type: 'willow' },
  { x: 165, y: -65, radius: 26, type: 'willow' },
  { x: -95, y: -130, radius: 26, type: 'willow' },
  { x: 95, y: -130, radius: 26, type: 'willow' },
  // Giant Abyssal Glowing Cap Mushrooms
  { x: -240, y: -80, radius: 20, type: 'alien_mushroom' },
  { x: 240, y: -80, radius: 20, type: 'alien_mushroom' },
  { x: -225, y: 10, radius: 14, type: 'crystal' },
  { x: 225, y: 10, radius: 14, type: 'crystal' },
  // Spectral Emerald Soul Lamps
  { x: -45, y: 95, radius: 8, type: 'aurora_lamp' },
  { x: 45, y: 95, radius: 8, type: 'aurora_lamp' },
  { x: -105, y: -35, radius: 8, type: 'aurora_lamp' },
  { x: 105, y: -35, radius: 8, type: 'aurora_lamp' },
  { x: 0, y: -175, radius: 8, type: 'aurora_lamp' },
];

const ECLIPSE_WELL_PROPS: WorldPropDef[] = [
  // Monolithic Eclipse Ruin Pillars with golden runes
  { x: -140, y: -150, radius: 26, type: 'eclipse_pillar' },
  { x: 140, y: -150, radius: 26, type: 'eclipse_pillar' },
  { x: -170, y: 50, radius: 26, type: 'eclipse_pillar' },
  { x: 180, y: 50, radius: 26, type: 'eclipse_pillar' },
  { x: -70, y: 195, radius: 24, type: 'eclipse_pillar' },
  { x: 70, y: 195, radius: 24, type: 'eclipse_pillar' },
  // Void Monoliths
  { x: -160, y: -65, radius: 22, type: 'void_monolith' },
  { x: 165, y: -65, radius: 22, type: 'void_monolith' },
  { x: -95, y: -130, radius: 22, type: 'void_monolith' },
  { x: 95, y: -130, radius: 22, type: 'void_monolith' },
  { x: -240, y: -80, radius: 22, type: 'void_monolith' },
  { x: 240, y: -80, radius: 22, type: 'void_monolith' },
  // Ancient Gold Focus Crystals
  { x: -225, y: 10, radius: 16, type: 'crystal' },
  { x: 225, y: 10, radius: 16, type: 'crystal' },
  { x: -110, y: 145, radius: 16, type: 'crystal' },
  { x: 110, y: 145, radius: 16, type: 'crystal' },
  // Solar Corona Braziers
  { x: -45, y: 95, radius: 8, type: 'eclipse_lamp' },
  { x: 45, y: 95, radius: 8, type: 'eclipse_lamp' },
  { x: -105, y: -35, radius: 8, type: 'eclipse_lamp' },
  { x: 105, y: -35, radius: 8, type: 'eclipse_lamp' },
  { x: 0, y: -175, radius: 8, type: 'eclipse_lamp' },
];

// -----------------------------------------------------------------------------
// Complete 6-World Registry
// -----------------------------------------------------------------------------

export const WORLD_ENVIRONMENTS: Record<string, WorldEnvironmentData> = {
  // ===========================================================================
  // 0. MOONPOOL COVE (Starter Sanctuary)
  // ===========================================================================
  region_moonpool: {
    id: 'region_moonpool',
    name: 'Moonpool Cove',
    subtitle: 'Celestial Sanctuary',
    palette: {
      spaceBgTop: '#060412',
      spaceBgBottom: '#0e0b24',
      nebulaPrimary: 'rgba(99, 102, 241, 0.16)',
      nebulaSecondary: 'rgba(14, 165, 233, 0.14)',
      starColors: ['#fef08a', '#e0f2fe', '#ffffff', '#f472b6'],
      cliffDrop: '#05030c',
      cliffMid: '#1c1733',
      cliffHighlight: '#29224d',
      turfOuter: '#1a2254',
      turfMain: '#263174',
      turfInner: '#2e3d8c',
      pathColors: ['#3b3658', '#4b456e', '#595282', '#322d4d'],
      grassColors: ['#2563eb', '#3b82f6', '#1d4ed8'],
      flowerColors: ['#f59e0b', '#f43f5e', '#38bdf8', '#c084fc'],
      lightingColor: 'rgba(251, 191, 36, 0.28)',
      lightingPulseColor: 'rgba(254, 240, 138, 0.18)',
    },
    water: {
      bedColor: '#06111f',
      gradientStops: ['#13355e', '#0d2545', '#091b33', '#061224', '#030a14'],
      cliffRgb: [22, 18, 46],
      reflectionHalo: 'rgba(30, 64, 175, 0.25)',
      reflectionMid: 'rgba(2, 132, 199, 0.30)',
      reflectionCore: 'rgba(56, 189, 248, 0.35)',
      glintColors: ['#38bdf8', '#fef08a', '#ffffff'],
      shorelineColors: [
        { color: '#383256', highlight: '#5b5088', wet: '#1e1a33' },
        { color: '#443c68', highlight: '#685d9c', wet: '#24203e' },
        { color: '#2d2747', highlight: '#4b4074', wet: '#18152b' },
      ],
      debrisType: 'sakura',
      debrisColors: ['#f472b6', '#fbcfe8', '#fda4af', '#e879f9', '#f9a8d4'],
      padStyle: 'lotus',
    },
    celestial: {
      type: 'moon',
      title: 'CRESCENT MOON',
      subtitle: 'Drifting Starlight & Serene Galactic Tides',
    },
    props: MOONPOOL_PROPS,
    particles: {
      type: 'petals',
      colors: ['#f472b6', '#e879f9', '#fbcfe8'],
      count: 28,
      speedY: 14,
      speedX: 10,
      sway: 10,
    },
    creatures: [
      { type: 'koi', depth: 0.88, speed: 0.30, baseWidth: 26, baseHeight: 16, orbitRxRatio: 0.48, orbitRyRatio: 0.46, name: 'Celestial Koi' },
      { type: 'koi', depth: 0.58, speed: 0.26, baseWidth: 24, baseHeight: 15, orbitRxRatio: 0.42, orbitRyRatio: 0.40, name: 'Starlight Koi' },
      { type: 'deep', depth: 0.22, speed: 0.16, baseWidth: 32, baseHeight: 14, orbitRxRatio: 0.32, orbitRyRatio: 0.28, name: 'Abyssal Stargazer' },
      { type: 'deep', depth: 0.45, speed: 0.34, baseWidth: 20, baseHeight: 10, orbitRxRatio: 0.62, orbitRyRatio: 0.52, name: 'Agile Minnow' },
    ],
  },

  // ===========================================================================
  // 1. NEBULA LAGOON (Cosmic Ocean)
  // ===========================================================================
  region_nebula_lagoon: {
    id: 'region_nebula_lagoon',
    name: 'Nebula Lagoon',
    subtitle: 'Vibrant Cosmic Ocean',
    palette: {
      spaceBgTop: '#080214',
      spaceBgBottom: '#180633',
      nebulaPrimary: 'rgba(217, 70, 239, 0.28)', // Luminous magenta-violet
      nebulaSecondary: 'rgba(6, 182, 212, 0.25)', // Luminous cyan
      starColors: ['#67e8f9', '#f0abfc', '#a78bfa', '#38bdf8'],
      cliffDrop: '#06020f',
      cliffMid: '#1a0833',
      cliffHighlight: '#2e0f59',
      turfOuter: '#0c2738', // Deep aquatic abyss
      turfMain: '#10415a', // Rich cyan-indigo oceanic turf
      turfInner: '#17597a', // Bioluminescent turf highlight
      pathColors: ['#2e1065', '#3b0764', '#581c87', '#1e1b4b'],
      grassColors: ['#06b6d4', '#0891b2', '#0284c7'],
      flowerColors: ['#e879f9', '#f43f5e', '#22d3ee', '#a855f7'],
      lightingColor: 'rgba(34, 211, 238, 0.32)',
      lightingPulseColor: 'rgba(232, 121, 249, 0.22)',
    },
    water: {
      bedColor: '#05111c',
      gradientStops: ['#1e40af', '#1d4ed8', '#0e7490', '#083344', '#021824'], // Radiant glowing alien cyan-violet
      cliffRgb: [18, 12, 45],
      reflectionHalo: 'rgba(168, 85, 247, 0.30)',
      reflectionMid: 'rgba(6, 182, 212, 0.38)',
      reflectionCore: 'rgba(103, 232, 249, 0.45)',
      glintColors: ['#67e8f9', '#f0abfc', '#a5f3fc'],
      shorelineColors: [
        { color: '#2e1065', highlight: '#701a75', wet: '#1b063d' },
        { color: '#164e63', highlight: '#0891b2', wet: '#0e3344' },
        { color: '#3b0764', highlight: '#86198f', wet: '#24043d' },
      ],
      debrisType: 'spores',
      debrisColors: ['#67e8f9', '#f472b6', '#c084fc', '#38bdf8'],
      padStyle: 'coral',
    },
    celestial: {
      type: 'nebula_lagoon',
      title: 'DUAL-CORE PLANETARY NEBULA',
      subtitle: 'Swirling Interstellar Plasma & Bioluminescent Void',
    },
    props: NEBULA_LAGOON_PROPS,
    particles: {
      type: 'spores',
      colors: ['#38bdf8', '#c084fc', '#f472b6', '#67e8f9'],
      count: 36,
      speedY: -16, // Gently rising bioluminescent spores
      speedX: 6,
      sway: 14,
    },
    creatures: [
      { type: 'jellyfish', depth: 0.90, speed: 0.22, baseWidth: 22, baseHeight: 20, orbitRxRatio: 0.50, orbitRyRatio: 0.48, name: 'Luminous Jellyfish' },
      { type: 'koi', depth: 0.65, speed: 0.32, baseWidth: 24, baseHeight: 14, orbitRxRatio: 0.44, orbitRyRatio: 0.42, name: 'Bioluminescent Angler' },
      { type: 'deep', depth: 0.25, speed: 0.18, baseWidth: 34, baseHeight: 16, orbitRxRatio: 0.34, orbitRyRatio: 0.30, name: 'Void Manta' },
      { type: 'jellyfish', depth: 0.45, speed: 0.26, baseWidth: 18, baseHeight: 16, orbitRxRatio: 0.65, orbitRyRatio: 0.55, name: 'Prismatic Medusa' },
    ],
  },

  // ===========================================================================
  // 2. COMET FALLS (Cosmic Waterfall & Asteroids)
  // ===========================================================================
  region_comet_falls: {
    id: 'region_comet_falls',
    name: 'Comet Falls',
    subtitle: 'Cascading Starlight Rivers',
    palette: {
      spaceBgTop: '#040b17',
      spaceBgBottom: '#0a1a33',
      nebulaPrimary: 'rgba(56, 189, 248, 0.24)', // Starlight cyan cascade
      nebulaSecondary: 'rgba(251, 146, 60, 0.22)', // Warm comet ember
      starColors: ['#fde047', '#fed7aa', '#38bdf8', '#ffffff'],
      cliffDrop: '#030812',
      cliffMid: '#0f172a',
      cliffHighlight: '#1e293b',
      turfOuter: '#0f2338', // Dark meteor-shard bedrock
      turfMain: '#173656', // Starlight-dusted crag terrain
      turfInner: '#1f4873', // Radiant waterfall spray turf
      pathColors: ['#1e293b', '#334155', '#475569', '#0f172a'],
      grassColors: ['#38bdf8', '#0284c7', '#0369a1'],
      flowerColors: ['#fbbf24', '#f97316', '#38bdf8', '#ef4444'],
      lightingColor: 'rgba(251, 146, 60, 0.34)',
      lightingPulseColor: 'rgba(254, 240, 138, 0.24)',
    },
    water: {
      bedColor: '#030d1a',
      gradientStops: ['#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'],
      cliffRgb: [15, 25, 45],
      reflectionHalo: 'rgba(14, 165, 233, 0.30)',
      reflectionMid: 'rgba(245, 158, 11, 0.32)',
      reflectionCore: 'rgba(253, 224, 71, 0.40)',
      glintColors: ['#fde047', '#38bdf8', '#ffffff'],
      shorelineColors: [
        { color: '#1e293b', highlight: '#475569', wet: '#0f172a' },
        { color: '#334155', highlight: '#64748b', wet: '#1e293b' },
        { color: '#0f172a', highlight: '#334155', wet: '#020617' },
      ],
      debrisType: 'comet_sparks',
      debrisColors: ['#fbbf24', '#f97316', '#38bdf8', '#fef08a'],
      padStyle: 'lotus',
    },
    celestial: {
      type: 'comet_falls',
      title: 'RUSHING STARLIGHT WATERFALL',
      subtitle: 'Comet Streamers & Cascading Asteroid Rivers',
    },
    props: COMET_FALLS_PROPS,
    particles: {
      type: 'comet_sparks',
      colors: ['#fde047', '#f97316', '#38bdf8', '#ffffff'],
      count: 42,
      speedY: 38, // Fast downward rush matching the celestial waterfall!
      speedX: 20,
      sway: 6,
    },
    creatures: [
      { type: 'comet_dart', depth: 0.85, speed: 0.50, baseWidth: 26, baseHeight: 12, orbitRxRatio: 0.55, orbitRyRatio: 0.45, name: 'Comet Salmon' },
      { type: 'comet_dart', depth: 0.60, speed: 0.56, baseWidth: 20, baseHeight: 10, orbitRxRatio: 0.42, orbitRyRatio: 0.38, name: 'Meteor Dart' },
      { type: 'deep', depth: 0.20, speed: 0.20, baseWidth: 32, baseHeight: 15, orbitRxRatio: 0.30, orbitRyRatio: 0.26, name: 'Stardust Leviathan' },
      { type: 'comet_dart', depth: 0.40, speed: 0.46, baseWidth: 18, baseHeight: 8, orbitRxRatio: 0.68, orbitRyRatio: 0.56, name: 'Rapid Spark Minnow' },
    ],
  },

  // ===========================================================================
  // 3. SATURN'S RINGWATER (Planetary Rings)
  // ===========================================================================
  region_saturn_rings: {
    id: 'region_saturn_rings',
    name: "Saturn's Ringwater",
    subtitle: 'Crystalline Planetary Rings',
    palette: {
      spaceBgTop: '#0a0814',
      spaceBgBottom: '#1a1306',
      nebulaPrimary: 'rgba(234, 179, 8, 0.22)', // Golden ring sheen
      nebulaSecondary: 'rgba(147, 51, 234, 0.18)', // Cool ring shadow
      starColors: ['#fef08a', '#e2e8f0', '#fed7aa', '#93c5fd'],
      cliffDrop: '#08060f',
      cliffMid: '#1e1c2e',
      cliffHighlight: '#332f4a',
      turfOuter: '#181b30', // Crystalline permafrost bedrock
      turfMain: '#232947', // Shimmering ice-dusted turf
      turfInner: '#313a63', // Crystalline reflection center
      pathColors: ['#334155', '#475569', '#64748b', '#1e293b'],
      grassColors: ['#93c5fd', '#60a5fa', '#3b82f6'],
      flowerColors: ['#facc15', '#38bdf8', '#c084fc', '#fef08a'],
      lightingColor: 'rgba(250, 204, 21, 0.30)',
      lightingPulseColor: 'rgba(147, 197, 253, 0.24)',
    },
    water: {
      bedColor: '#080c17',
      gradientStops: ['#1e3a8a', '#172554', '#1e293b', '#0f172a', '#020617'], // Glassy crystalline ice mirror
      cliffRgb: [28, 25, 46],
      reflectionHalo: 'rgba(250, 204, 21, 0.24)',
      reflectionMid: 'rgba(96, 165, 250, 0.32)',
      reflectionCore: 'rgba(224, 242, 254, 0.42)',
      glintColors: ['#fef08a', '#93c5fd', '#ffffff'],
      shorelineColors: [
        { color: '#334155', highlight: '#94a3b8', wet: '#1e293b' },
        { color: '#475569', highlight: '#cbd5e1', wet: '#334155' },
        { color: '#1e293b', highlight: '#64748b', wet: '#0f172a' },
      ],
      debrisType: 'ice_floes',
      debrisColors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#fef08a'],
      padStyle: 'ice',
    },
    celestial: {
      type: 'saturn_rings',
      title: "SATURN'S PLANETARY RINGS",
      subtitle: 'Majestic Ring Horizon & Orbiting Moonlets',
    },
    props: SATURN_RINGS_PROPS,
    particles: {
      type: 'diamond_dust',
      colors: ['#e0f2fe', '#fef08a', '#bfdbfe', '#ffffff'],
      count: 32,
      speedY: 4, // Gentle low-gravity orbital drift
      speedX: 8,
      sway: 12,
    },
    creatures: [
      { type: 'koi', depth: 0.88, speed: 0.28, baseWidth: 26, baseHeight: 16, orbitRxRatio: 0.48, orbitRyRatio: 0.46, name: 'Crystalline Ice Koi' },
      { type: 'deep', depth: 0.55, speed: 0.24, baseWidth: 24, baseHeight: 14, orbitRxRatio: 0.42, orbitRyRatio: 0.40, name: 'Prism Fin' },
      { type: 'deep', depth: 0.22, speed: 0.15, baseWidth: 32, baseHeight: 14, orbitRxRatio: 0.32, orbitRyRatio: 0.28, name: 'Glacial Stargazer' },
      { type: 'koi', depth: 0.45, speed: 0.32, baseWidth: 20, baseHeight: 10, orbitRxRatio: 0.62, orbitRyRatio: 0.52, name: 'Diamond Minnow' },
    ],
  },

  // ===========================================================================
  // 4. AURORA DEEP (Abyss & Shifting Auroras)
  // ===========================================================================
  region_aurora_deep: {
    id: 'region_aurora_deep',
    name: 'Aurora Deep',
    subtitle: 'Abyss of Shifting Curtains',
    palette: {
      spaceBgTop: '#020e0d',
      spaceBgBottom: '#041f1a',
      nebulaPrimary: 'rgba(16, 185, 129, 0.30)', // Emerald aurora curtain
      nebulaSecondary: 'rgba(139, 92, 246, 0.24)', // Violet aurora wave
      starColors: ['#6ee7b7', '#a7f3d0', '#c4b5fd', '#ffffff'],
      cliffDrop: '#020a07',
      cliffMid: '#06241a',
      cliffHighlight: '#0a3d2c',
      turfOuter: '#08261c', // Abyssal moss basalt
      turfMain: '#0c3829', // Dark emerald turf
      turfInner: '#124d39', // Luminescent jade center
      pathColors: ['#0f382a', '#144d39', '#196147', '#0a261c'],
      grassColors: ['#10b981', '#34d399', '#059669'],
      flowerColors: ['#a7f3d0', '#c084fc', '#38bdf8', '#34d399'],
      lightingColor: 'rgba(52, 211, 153, 0.32)',
      lightingPulseColor: 'rgba(168, 85, 247, 0.24)',
    },
    water: {
      bedColor: '#02120e',
      gradientStops: ['#065f46', '#047857', '#0f766e', '#134e4a', '#042f2e'], // Concentrated luminous emerald-teal pool
      cliffRgb: [8, 36, 26],
      reflectionHalo: 'rgba(16, 185, 129, 0.32)',
      reflectionMid: 'rgba(45, 212, 191, 0.38)',
      reflectionCore: 'rgba(167, 243, 208, 0.44)',
      glintColors: ['#6ee7b7', '#a7f3d0', '#c4b5fd'],
      shorelineColors: [
        { color: '#064e3b', highlight: '#059669', wet: '#022c22' },
        { color: '#0f766e', highlight: '#14b8a6', wet: '#042f2e' },
        { color: '#062c22', highlight: '#047857', wet: '#011913' },
      ],
      debrisType: 'spirit_lilies',
      debrisColors: ['#a7f3d0', '#6ee7b7', '#c4b5fd', '#fbcfe8'],
      padStyle: 'phantom',
    },
    celestial: {
      type: 'aurora_deep',
      title: 'SHIFTING AURORAL CURTAINS',
      subtitle: 'Dancing Sheets of Emerald, Violet & Teal Cosmic Energy',
    },
    props: AURORA_DEEP_PROPS,
    particles: {
      type: 'aurora_mist',
      colors: ['#34d399', '#6ee7b7', '#a78bfa', '#2dd4bf'],
      count: 38,
      speedY: -12, // Rising spectral auroral mist
      speedX: 8,
      sway: 16,
    },
    creatures: [
      { type: 'ghost', depth: 0.88, speed: 0.26, baseWidth: 26, baseHeight: 16, orbitRxRatio: 0.48, orbitRyRatio: 0.46, name: 'Aurora Ghost Koi' },
      { type: 'ghost', depth: 0.60, speed: 0.22, baseWidth: 24, baseHeight: 14, orbitRxRatio: 0.42, orbitRyRatio: 0.40, name: 'Phantom Manta' },
      { type: 'deep', depth: 0.22, speed: 0.16, baseWidth: 34, baseHeight: 16, orbitRxRatio: 0.32, orbitRyRatio: 0.28, name: 'Abyssal Specter' },
      { type: 'ghost', depth: 0.45, speed: 0.30, baseWidth: 20, baseHeight: 10, orbitRxRatio: 0.62, orbitRyRatio: 0.52, name: 'Emerald Dart' },
    ],
  },

  // ===========================================================================
  // 5. ECLIPSE WELL (Total Solar Eclipse Singularity)
  // ===========================================================================
  region_eclipse_well: {
    id: 'region_eclipse_well',
    name: 'Eclipse Well',
    subtitle: 'Ancient Celestial Singularity',
    palette: {
      spaceBgTop: '#030206',
      spaceBgBottom: '#0a0614',
      nebulaPrimary: 'rgba(245, 158, 11, 0.28)', // Radiant golden solar corona
      nebulaSecondary: 'rgba(126, 34, 206, 0.24)', // Void purple accretion ring
      starColors: ['#fef08a', '#fde047', '#fed7aa', '#e9d5ff'],
      cliffDrop: '#030206',
      cliffMid: '#120d1f',
      cliffHighlight: '#22193b',
      turfOuter: '#120b24', // Ancient obsidian ruin bedrock
      turfMain: '#1c1238', // Deep violet-black consecrated ground
      turfInner: '#291b52', // Inlaid sacred gold runic turf
      pathColors: ['#2e1065', '#3b0764', '#581c87', '#1e1b4b'],
      grassColors: ['#7c3aed', '#6d28d9', '#5b21b6'],
      flowerColors: ['#fbbf24', '#f59e0b', '#fef08a', '#c084fc'],
      lightingColor: 'rgba(251, 191, 36, 0.36)', // Blazing golden corona
      lightingPulseColor: 'rgba(192, 132, 252, 0.26)',
    },
    water: {
      bedColor: '#05020a',
      gradientStops: ['#3b0764', '#2e1065', '#1e1b4b', '#0f0728', '#03010a'], // Abyssal singularity reflecting solar corona
      cliffRgb: [18, 12, 32],
      reflectionHalo: 'rgba(245, 158, 11, 0.34)',
      reflectionMid: 'rgba(251, 191, 36, 0.40)',
      reflectionCore: 'rgba(254, 240, 138, 0.48)',
      glintColors: ['#fef08a', '#fbbf24', '#ffffff'],
      shorelineColors: [
        { color: '#2e1065', highlight: '#d97706', wet: '#170638' },
        { color: '#3b0764', highlight: '#f59e0b', wet: '#1f0438' },
        { color: '#170638', highlight: '#b45309', wet: '#0c021f' },
      ],
      debrisType: 'solar_embers',
      debrisColors: ['#fbbf24', '#fef08a', '#f97316', '#c084fc'],
      padStyle: 'ancient_gold',
    },
    celestial: {
      type: 'eclipse_well',
      title: 'TOTAL SOLAR ECLIPSE',
      subtitle: 'Radiant Golden Corona, Solar Prominences & Gravitational Singularity',
    },
    props: ECLIPSE_WELL_PROPS,
    particles: {
      type: 'void_embers',
      colors: ['#fbbf24', '#fef08a', '#c084fc', '#f97316'],
      count: 40,
      speedY: 8,
      speedX: -6,
      sway: 14,
    },
    creatures: [
      { type: 'dragon', depth: 0.90, speed: 0.34, baseWidth: 32, baseHeight: 18, orbitRxRatio: 0.50, orbitRyRatio: 0.48, name: 'Solar Corona Dragon Koi' },
      { type: 'koi', depth: 0.65, speed: 0.28, baseWidth: 26, baseHeight: 15, orbitRxRatio: 0.42, orbitRyRatio: 0.40, name: 'Golden Sun Koi' },
      { type: 'deep', depth: 0.20, speed: 0.16, baseWidth: 36, baseHeight: 18, orbitRxRatio: 0.30, orbitRyRatio: 0.26, name: 'Ancient Void Serpent' },
      { type: 'dragon', depth: 0.42, speed: 0.38, baseWidth: 22, baseHeight: 12, orbitRxRatio: 0.65, orbitRyRatio: 0.55, name: 'Coronal Spark Minnow' },
    ],
  },
};
