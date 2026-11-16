# Purrseids: The Starpond
### 3D Cosmic Fishing & Progression Adventure (Browser Web Game)

**Purrseids: The Starpond** is a third-person cozy cosmic fishing game where you play as an adorable cat fishing for living stars and celestial entities in magical pools of galaxies and outer space.

---

## Technology Stack

- **Framework:** React 18 & TypeScript
- **3D Graphics Engine:** Three.js (WebGL)
- **Build Tool:** Vite 5
- **Audio:** Web Audio API (procedural synthesis) + HTML5 Audio (CC0 ambient loops)
- **UI:** CSS3 with responsive cosmic glassmorphism design
- **Data Persistence:** LocalStorage auto-save with backup & reset support

---

## Key Gameplay Systems & Highlights

1. **Third-Person Cat Character & Procedural Locomotion:**
   - Articulated 3D cat character hierarchy (body, head, expressive ears, luminous eyes, snout, golden bell collar, paws, segmented tail, and crystal-tipped rod).
   - Procedural quadruped walk & run cycles with natural phase offsets, breathing idle bob, dynamic tail sway, sitting fishing pose, casting arc, reeling tension, and celebratory victory hops.
   - Smooth WASD movement relative to camera look angle with island boundary constraints.

2. **Cosmic Environment & Floating Starting Island (Moonpool Cove):**
   - Floating celestial island with ambient rock crags, glowing crystals, and deep-space starfield.
   - Central Starpond: custom GLSL shader simulating a galaxy vortex with scrolling nebulae, moving starlight ripples, glowing particle emissions, and subsurface swimming stars.
   - Interactive Hub Stations:
     - **Equipment Upgrade Shop** (terminal console)
     - **Quest Board** (celestial observatory board)
     - **Constellation Restoration Altar** (ancient star altar)
     - **Star Almanac** (collection book pedestal)
     - **Region Gateway Portal** (cosmic gate to unlockable worlds)

3. **Core Fishing System:**
   - **Casting:** Approach the pool, press **[E]** to interact. Cat faces the pond, sits, and casts the star bobber in a smooth parabolic arc.
   - **Line Physics:** Dynamic line connecting rod tip to the bobber with realistic catenary sag and reeling tension.
   - **Bite Mechanics:** Randomized bite delay reduced by equipped bait. Features organic nibble dips followed by a dramatic bite plunge, water splash, and audio alert.
   - **Reeling Minigame:** Cosmic horizontal timing meter with moving safe zone and player cursor. Safe zone scales with equipment upgrades and creature difficulty. Press **[Space]** or **[LMB]** to reel.
   - **Catch Presentation:** High-impact showcase modal showing creature 3D model, rarity tier, variant tag (`Golden`, `Shiny`, `Rainbow`, `Ancient`), weight, Stardust earned, and EXP earned.

4. **Celestial Creatures & Data-Driven Catalogue:**
   - 6 Distinct celestial species:
     1. **Flicker Star** (Common)
     2. **Moonchip** (Uncommon)
     3. **Comet Koi** (Rare)
     4. **Nebula Jelly** (Epic)
     5. **Aurora Crown** (Legendary)
     6. **Prism Eternal** (Mythic)
   - 5 Special variants: Normal (1x), Golden (3x), Shiny (2x), Rainbow (5x), and Ancient (10x).

5. **Equipment Upgrade Shop:**
   - 4 Upgrade categories with visible gameplay effects:
     - **Fishing Rod:** Increases reeling bar size & catch power.
     - **Fishing Line:** Expands minigame safe zone width (forgiving timing).
     - **Cosmic Bait:** Decreases bite waiting time and increases rare star attraction.
     - **Star Bobber:** Extends bite reaction window and provides extra miss allowances.

6. **Regional Progression:**
   - Multi-region cosmic architecture:
     1. **Moonpool Cove** (Starting Area - Level 1)
     2. **Nebula Lagoon** (Unlocks at Level 5 - 250 Stardust)
     3. **Comet Falls** (Level 10)
     4. **Saturn's Ringwater** (Level 15)
     5. **Aurora Deep** (Level 22)
     6. **Eclipse Well** (Level 30)

7. **Star Almanac & Constellation Restoration:**
   - Collection Almanac tracks discovered creatures, catch counts, record weights, and variants found.
   - Constellation Restoration (**Felis Major - The Great Cosmic Cat**): Collecting required stars unlocks permanent bonuses (+20% Stardust, +15% Rare Attraction, +25% Minigame Zone).

8. **Data Persistence:**
   - LocalStorage save management with automatic background saving, manual save button, and full reset option.

---

## Controls

| Key / Input | Action |
| :--- | :--- |
| **W, A, S, D** | Move Cat Character (Camera-relative) |
| **Left Shift (Hold)** | Run / Gallop |
| **Mouse Move** | Orbit Third-Person Camera |
| **Mouse Scroll** | Zoom Camera In / Out |
| **E** | Interact (Start Fishing / Open Shop / Open Quests / etc.) |
| **Space** or **Left Mouse Click** | Cast Rod / Reeling Minigame Action |
| **Escape (ESC)** | Close Modal Menu / Pause Game |

---

## How to Run & Play

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in any modern desktop web browser.

### Production Build
```bash
npm run build
npm run preview
```
All static assets and compiled bundles are output to the `dist/` folder, ready for deployment to any static hosting provider (e.g. Vercel, Netlify, GitHub Pages).
