import { CatBreed } from '../types/game';

export interface CatBreedData {
  id: CatBreed;
  name: string;
  title: string;
  tagline: string;
  lore: string;
  badge: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  eyeColorHex: string;
  collarColorHex: string;
  charmType: 'star' | 'suzu' | 'moon' | 'gem';
  features: string[];
}

export const CAT_BREEDS: CatBreedData[] = [
  {
    id: 'celestial',
    name: 'Purrseid Celestial',
    title: 'The Cosmic Dreamer',
    tagline: 'Born from the dust of shooting stars and nebula tides.',
    lore: 'An ancient starlight feline native to the floating Starpond islands. Its ethereal lilac fur radiates soft cosmic energy, and its cyan eyes mirror distant galaxies.',
    badge: '★ COSMIC ORIGINAL',
    primaryColorHex: '#a59ad8',
    secondaryColorHex: '#f5f3ff',
    eyeColorHex: '#38bdf8',
    collarColorHex: '#fbbf24',
    charmType: 'star',
    features: ['Pastel Cosmic Lilac Fur', 'Luminous Cyan Starlight Eyes', 'Golden Star Medallion Bell', 'Ethereal Star Dust Aura']
  },
  {
    id: 'calico',
    name: 'Nebula Calico',
    title: 'The Lucky Starpond Mi-Ke',
    tagline: 'Traditional Japanese tricolor cat blessed with celestial luck.',
    lore: 'Beloved by star-voyagers across the universe. Its warm white body is dotted with peach and obsidian galaxy spots. Legend says a Calico cat near a fishing pond brings extraordinary luck with rare celestial fish.',
    badge: '🍀 EXTRA LUCKY',
    primaryColorHex: '#fcfaf7',
    secondaryColorHex: '#f97316',
    eyeColorHex: '#f59e0b',
    collarColorHex: '#ef4444',
    charmType: 'suzu',
    features: ['Lucky Tricolor Calico Coat', 'Warm Amber Anime Eyes', 'Crimson Japanese Ribbon & Suzu', 'Sweet Pink Paw Beans']
  },
  {
    id: 'kuro',
    name: 'Moonlit Kuro',
    title: 'The Midnight Shadow Void',
    tagline: 'Silent as the cosmic void, swift as a shooting comet.',
    lore: 'A sleek, velvety black cat that walks between starlight and shadow. It wears pristine snow-white socks and gazes into magical pools with brilliant emerald eyes that see celestial creatures before they bite.',
    badge: '🌙 VOID MYSTIC',
    primaryColorHex: '#1e1c2e',
    secondaryColorHex: '#ffffff',
    eyeColorHex: '#10b981',
    collarColorHex: '#a855f7',
    charmType: 'moon',
    features: ['Velvety Void Black Fur', 'Glowing Emerald Green Eyes', 'Crisp White Sock Paws', 'Silver Crescent Moon Charm']
  },
  {
    id: 'cloud',
    name: 'Fluffy Cloud',
    title: 'The Dreamy Angora Persian',
    tagline: 'Soft as interstellar nebula clouds with rare heterochromia eyes.',
    lore: 'A supremely fluffy, cloud-white Persian cat with enchanting gemstone heterochromia: one eye shines like sapphire starlight, the other like radiant golden sunbeams. Features extra plush cheek ruffs and a grand plume tail.',
    badge: '💎 HETEROCHROMIA',
    primaryColorHex: '#ffffff',
    secondaryColorHex: '#fbcfe8',
    eyeColorHex: '#2563eb', // Left: sapphire, Right: golden
    collarColorHex: '#f472b6',
    charmType: 'gem',
    features: ['Plush Marshmallow Cloud Fur', 'Heterochromia Eyes (Blue & Gold)', 'Fluffy Cheek Ruffs & Plume Tail', 'Pastel Pink Ribbon & Star Gem']
  }
];
