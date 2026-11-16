import { RegionData } from '../types/game';

export const REGIONS: RegionData[] = [
  {
    id: 'region_moonpool',
    name: 'Moonpool Cove',
    description: 'The starting celestial sanctuary surrounded by tranquil galactic tides and soft drifting starlight.',
    requiredLevel: 1,
    stardustCost: 0,
    skyColor: '#0a081a',
    poolColor: '#101f4e',
    fogColor: '#0e0b24',
    fogDensity: 0.015
  },
  {
    id: 'region_nebula_lagoon',
    name: 'Nebula Lagoon',
    description: 'A vibrant cosmic lagoon swirling with radiant interstellar gases and luminescent deep-space creatures.',
    requiredLevel: 5,
    stardustCost: 250,
    skyColor: '#120524',
    poolColor: '#2b0c47',
    fogColor: '#1a0833',
    fogDensity: 0.018
  },
  {
    id: 'region_comet_falls',
    name: 'Comet Falls',
    description: 'Cascading starlight rivers where rapid comet species swim against the cosmic current.',
    requiredLevel: 10,
    stardustCost: 600,
    skyColor: '#061324',
    poolColor: '#0c2e47',
    fogColor: '#091c33',
    fogDensity: 0.016
  },
  {
    id: 'region_saturn_rings',
    name: "Saturn's Ringwater",
    description: 'A shimmering expanse trapped within crystallized planetary rings and orbital ice fragments.',
    requiredLevel: 15,
    stardustCost: 1200,
    skyColor: '#1f1604',
    poolColor: '#473a0c',
    fogColor: '#2b1f09',
    fogDensity: 0.015
  },
  {
    id: 'region_aurora_deep',
    name: 'Aurora Deep',
    description: 'Deep-space polar waters bathed in shifting emerald and violet auroral curtains.',
    requiredLevel: 22,
    stardustCost: 2500,
    skyColor: '#041f1a',
    poolColor: '#0c4738',
    fogColor: '#092b23',
    fogDensity: 0.017
  },
  {
    id: 'region_eclipse_well',
    name: 'Eclipse Well',
    description: 'An abyssal singularity where ancient mythic stars gather under total cosmic eclipse.',
    requiredLevel: 30,
    stardustCost: 5000,
    skyColor: '#050508',
    poolColor: '#1f0418',
    fogColor: '#0a0a0f',
    fogDensity: 0.02
  }
];
