import * as THREE from 'three';
import { WORLD_LAYOUT, FishingAnchor } from '../../data/worldLayout';

export interface HubInteractable {
  id: string;
  name: string;
  prompt: string;
  position: THREE.Vector3;
  radius: number;
}

interface KoiFish {
  group: THREE.Group;
  tailGroup: THREE.Group;
  angle: number;
  speed: number;
  radius: number;
  heightOffset: number;
}

interface FloatingLilyPad {
  group: THREE.Group;
  baseY: number;
  phase: number;
  bobSpeed: number;
}

export class WorldScene {
  public scene: THREE.Scene;
  public islandGroup: THREE.Group;
  public waterMesh!: THREE.Mesh;
  public interactables: HubInteractable[] = [];
  public obstacleMeshes: THREE.Object3D[] = [];

  // Animated elements
  private skyParticles!: THREE.Points;
  private ambientParticles!: THREE.Points;
  private waterParticles!: THREE.Points;
  private fallingPetals!: THREE.Points;
  private subsurfaceStars: { group: THREE.Group; angle: number; speed: number; radius: number; heightOffset: number }[] = [];
  private koiFishPair: KoiFish[] = [];
  private lilyPads: FloatingLilyPad[] = [];
  private waterMaterial!: THREE.ShaderMaterial;
  private hoverTimer: number = 0;
  private rotatingArtifacts: { obj: THREE.Object3D; rotAxis: THREE.Vector3; speed: number }[] = [];

  // Environmental Colors
  private activeSkyColor: THREE.Color = new THREE.Color(0x070614);
  private activePoolColor: THREE.Color = new THREE.Color(0x0e1b42);

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = this.activeSkyColor;
    this.scene.fog = new THREE.FogExp2(0x09071c, 0.013);

    this.islandGroup = new THREE.Group();
    this.scene.add(this.islandGroup);

    this.setupLighting();
    this.setupSkyStars();
    this.setupDistantCosmos();
    this.createFloatingIsland();
    this.createPathways();
    this.createFishingPiers();
    this.createCosmicWater();
    this.createFloatingLilyPads();
    this.createCelestialKoiPair();
    this.createHubStations();
    this.createVegetationAndCrystals();
    this.createSatelliteIslands();
    this.setupAmbientDust();
    this.setupFallingPetals();
  }

  // ---------------------------------------------------------------------------
  // 1. LIGHTING
  // ---------------------------------------------------------------------------
  private setupLighting(): void {
    // Ambient Light with soft cosmic violet hue
    const ambient = new THREE.AmbientLight(0x312758, 1.4);
    this.scene.add(ambient);

    // Directional Celestial Starlight
    const dirLight = new THREE.DirectionalLight(0xdbeafe, 1.8);
    dirLight.position.set(22, 38, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 24;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Subtle Purple Rim Light for silhouette edge illumination
    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.85);
    rimLight.position.set(-20, 16, -22);
    this.scene.add(rimLight);

    // Central Starpond Upward Starlight Core
    const pondCoreLight = new THREE.PointLight(0x38bdf8, 2.2, 22, 1.1);
    pondCoreLight.position.set(0, 0.6, 0);
    this.islandGroup.add(pondCoreLight);

    // Soft Lavender Underwater Ambient
    const waterGlowLight = new THREE.PointLight(0xd946ef, 1.2, 16, 1.3);
    waterGlowLight.position.set(0, -0.8, 0);
    this.islandGroup.add(waterGlowLight);
  }

  // ---------------------------------------------------------------------------
  // 2. CELESTIAL BACKGROUND STARFIELD
  // ---------------------------------------------------------------------------
  private setupSkyStars(): void {
    const starCount = 2400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 70 + Math.random() * 110;

      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);

      const roll = Math.random();
      const col = roll > 0.75 ? new THREE.Color(0xfde047) :
                  roll > 0.50 ? new THREE.Color(0x67e8f9) :
                  roll > 0.30 ? new THREE.Color(0xf472b6) :
                  new THREE.Color(0xffffff);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 1.0 + Math.random() * 2.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    this.skyParticles = new THREE.Points(geometry, material);
    this.scene.add(this.skyParticles);
  }

  // ---------------------------------------------------------------------------
  // 3. DISTANT PLANETS & NEBULAE
  // ---------------------------------------------------------------------------
  private setupDistantCosmos(): void {
    // 1. Giant Ringed Celestial Planet
    const planetGroup = new THREE.Group();
    planetGroup.position.set(-65, 38, -85);

    const planetGeo = new THREE.SphereGeometry(14, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x4338ca,
      emissive: 0x1e1b4b,
      roughness: 0.7
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Planetary Rings
    const ringGeo = new THREE.RingGeometry(18, 28, 36);
    ringGeo.rotateX(Math.PI * 0.42);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xa5b4fc,
      emissive: 0x312e81,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    planetGroup.add(ring);
    this.scene.add(planetGroup);

    // 2. Luminous Crescent Moon
    const moonGeo = new THREE.SphereGeometry(7, 18, 18);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 0.45,
      roughness: 0.4
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(75, 45, 60);
    this.scene.add(moon);
  }

  // ---------------------------------------------------------------------------
  // 4. FLOATING ISLAND TERRAIN, HOLLOW CRATER & 3D RIVER STONE RIM
  // ---------------------------------------------------------------------------
  private createFloatingIsland(): void {
    const outerR = WORLD_LAYOUT.island.outerRadius;      // 18.2
    const innerR = WORLD_LAYOUT.island.innerPoolRadius;  // 6.6

    // A. 3D Island Base Rock Hull Underneath (Hollow tapered shell with open top!)
    const baseGeo = new THREE.CylinderGeometry(outerR, outerR * 0.72, 6.0, 48, 1, true);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1e1836,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const islandBase = new THREE.Mesh(baseGeo, islandMat);
    islandBase.position.y = -3.0;
    islandBase.receiveShadow = true;
    this.islandGroup.add(islandBase);

    // B. Main Island Turf Layer (HOLLOW ANNULAR 3D PLATE with Crater Hole in Center!)
    // Using THREE.Shape with an inner hole so the center is physically empty!
    const turfShape = new THREE.Shape();
    turfShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
    const turfHole = new THREE.Path();
    turfHole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
    turfShape.holes.push(turfHole);

    const turfGeo = new THREE.ExtrudeGeometry(turfShape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.20,
      bevelThickness: 0.10,
      curveSegments: 64
    });
    turfGeo.rotateX(Math.PI / 2); // Lay flat on XZ plane

    // Rich, lush celestial turf material (Distinct teal-indigo meadow tone)
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x18425d, // Distinct celestial teal-emerald turf (Clear contrast with water & stone!)
      emissive: 0x0c2538,
      emissiveIntensity: 0.28,
      roughness: 0.65,
      metalness: 0.08
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.y = 0.22; // Ground height where the cat walks!
    turf.receiveShadow = true;
    this.islandGroup.add(turf);

    // C. The Sunken Cosmic Basin (Concave 3D Bowl underneath the water)
    // Curves from r = 6.6 at y = 0.10 down to y = -2.6 at the deep center!
    const basinGeo = new THREE.CylinderGeometry(innerR, 1.2, 2.6, 48, 4, true);
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0x08061a,
      emissive: 0x060e28,
      emissiveIntensity: 0.6,
      roughness: 0.95,
      side: THREE.BackSide
    });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = -1.2;
    basin.receiveShadow = true;
    this.islandGroup.add(basin);

    // D. Outer Pond Bank (Gradual sloping shoreline transition)
    const bankGeo = new THREE.RingGeometry(innerR - 0.25, innerR + 0.85, 64);
    bankGeo.rotateX(-Math.PI / 2);
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x223652, // Soft mossy shoreline transition
      emissive: 0x0e1b2e,
      emissiveIntensity: 0.2,
      roughness: 0.8
    });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.y = 0.14;
    bank.receiveShadow = true;
    this.islandGroup.add(bank);

    // E. 3D River Cobblestone Shoreline Rim (Signature smooth stones from the concept art!)
    this.createShorelineCobblestones();

    // F. Overhanging Cosmic Sakura / Cherry Blossom Branches (From the concept art!)
    this.createSakuraOverhang();

    // G. Lower Hanging Crags & Stalactites underneath the floating island
    const crags = [
      { r: 9, h: 9.5, a: 0.3 },
      { r: 12, h: 14.0, a: 1.2 },
      { r: 7, h: 8.0, a: 2.1 },
      { r: 13, h: 12.5, a: 3.4 },
      { r: 8, h: 11.0, a: 4.5 },
      { r: 11, h: 15.0, a: 5.4 }
    ];

    crags.forEach(c => {
      const cragGeo = new THREE.ConeGeometry(2.8, c.h, 6);
      cragGeo.rotateX(Math.PI);
      const crag = new THREE.Mesh(cragGeo, islandMat);
      crag.position.set(Math.cos(c.a) * c.r, -6.0 - c.h * 0.45, Math.sin(c.a) * c.r);
      this.islandGroup.add(crag);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. 3D RIVER COBBLESTONE SHORELINE RIM (Matching Concept Art)
  // ---------------------------------------------------------------------------
  private createShorelineCobblestones(): void {
    const stoneMats = [
      new THREE.MeshStandardMaterial({ color: 0x5a6978, roughness: 0.75, metalness: 0.1 }), // Slate grey
      new THREE.MeshStandardMaterial({ color: 0x485868, roughness: 0.80, metalness: 0.08 }), // Deep river stone
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.70, metalness: 0.15 }), // Cool slate
      new THREE.MeshStandardMaterial({ color: 0x3d5060, roughness: 0.85, metalness: 0.05 }), // Mossy dark slate
      new THREE.MeshStandardMaterial({ color: 0x718096, roughness: 0.65, metalness: 0.12 })  // Pale river pebble
    ];

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    // 84 Smooth River Stones placed in 2 organic layered rings around the pond perimeter
    const totalStones = 84;
    const innerR = WORLD_LAYOUT.island.innerPoolRadius; // 6.6

    for (let i = 0; i < totalStones; i++) {
      const angle = (i / totalStones) * Math.PI * 2;

      // Skip gaps where the 4 dedicated wooden fishing piers are placed (South: -PI/2, East: 0, North: PI/2, West: PI)
      let nearPier = false;
      for (const anchor of WORLD_LAYOUT.fishingAnchors) {
        const pAngle = Math.atan2(anchor.position.z, anchor.position.x);
        let diff = Math.abs(angle - pAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < 0.24) {
          nearPier = true;
          break;
        }
      }
      if (nearPier) continue;

      // Dual-tier ring: inner tier close to water, outer tier nestled on bank
      const tier = i % 2;
      const baseDist = tier === 0 ? innerR + 0.05 : innerR + 0.45;
      const stoneDist = baseDist + (Math.sin(i * 3.7) * 0.12);

      // Smooth river cobblestone geometry (subtly flattened sphere/dodecahedron)
      const sRadius = 0.30 + ((i * 13) % 7) * 0.05; // 0.30m to 0.60m
      const stoneGeo = new THREE.DodecahedronGeometry(sRadius, 1);
      const mat = stoneMats[i % stoneMats.length];
      const stone = new THREE.Mesh(stoneGeo, mat);

      // Natural flattened river-pebble scaling
      stone.scale.set(
        1.0 + Math.sin(i * 1.5) * 0.25,
        0.58 + Math.cos(i * 2.1) * 0.15,
        0.95 + Math.sin(i * 2.8) * 0.20
      );

      stone.rotation.set(
        Math.sin(i) * 0.3,
        angle + Math.PI / 2 + Math.cos(i) * 0.4,
        Math.cos(i * 1.7) * 0.25
      );

      const px = Math.cos(angle) * stoneDist;
      const pz = Math.sin(angle) * stoneDist;
      const py = 0.16 + (tier * 0.05);

      stone.position.set(px, py, pz);
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.islandGroup.add(stone);

      // Occasionally add tiny glowing starlight crystals nestled between stones
      if (i % 7 === 0) {
        const cGeo = new THREE.ConeGeometry(0.12, 0.45, 5);
        const cry = new THREE.Mesh(cGeo, crystalMat);
        cry.position.set(px + 0.15, py + 0.22, pz + 0.15);
        cry.rotation.set(0.2, angle, -0.3);
        this.islandGroup.add(cry);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. OVERHANGING COSMIC SAKURA / CHERRY BLOSSOMS (From Concept Art)
  // ---------------------------------------------------------------------------
  private createSakuraOverhang(): void {
    const branchMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a1a, // Dark rich cherry bark
      roughness: 0.9,
      metalness: 0.05
    });

    const blossomMatPink = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      emissive: 0xf472b6,
      emissiveIntensity: 0.45,
      roughness: 0.4
    });

    const blossomMatLavender = new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 0.40,
      roughness: 0.4
    });

    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xdb2777,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide
    });

    // 4 Corner Overhanging Cherry Blossom Trees (diagonal quadrants between the 4 piers)
    const corners = [
      { angle: Math.PI * 0.25, r: 8.4 },
      { angle: Math.PI * 0.75, r: 8.4 },
      { angle: Math.PI * 1.25, r: 8.4 },
      { angle: Math.PI * 1.75, r: 8.4 }
    ];

    corners.forEach(c => {
      const treeGroup = new THREE.Group();
      const px = Math.cos(c.angle) * c.r;
      const pz = Math.sin(c.angle) * c.r;
      treeGroup.position.set(px, 0.22, pz);

      // Facing towards the pond center
      const toCenter = Math.atan2(-pz, -px);
      treeGroup.rotation.y = toCenter;

      // Gnarled Trunk leaning gently towards the pond
      const trunkGeo = new THREE.CylinderGeometry(0.25, 0.38, 2.6, 7);
      const trunk = new THREE.Mesh(trunkGeo, branchMat);
      trunk.position.set(0, 1.2, 0);
      trunk.rotation.z = -0.25; // Lean toward pond
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Main Overhanging Bough stretching out over the cobblestones
      const boughGeo = new THREE.CylinderGeometry(0.14, 0.22, 2.8, 6);
      const bough = new THREE.Mesh(boughGeo, branchMat);
      bough.position.set(1.1, 2.1, 0);
      bough.rotation.z = -1.15; // Reaching out over water
      bough.castShadow = true;
      treeGroup.add(bough);

      // Secondary twig branching
      const twigGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.6, 5);
      const twig = new THREE.Mesh(twigGeo, branchMat);
      twig.position.set(1.9, 1.8, 0.4);
      twig.rotation.set(0.3, 0.4, -1.35);
      treeGroup.add(twig);

      // Blossom Clusters on the overhanging branches (Like the artwork!)
      const blossomPositions = [
        new THREE.Vector3(1.2, 2.2, 0.2),
        new THREE.Vector3(1.7, 2.0, -0.3),
        new THREE.Vector3(2.2, 1.7, 0.1),
        new THREE.Vector3(2.6, 1.4, 0.3),
        new THREE.Vector3(2.1, 1.6, 0.5)
      ];

      blossomPositions.forEach((bPos, idx) => {
        const cluster = new THREE.Group();
        cluster.position.copy(bPos);

        const bMat = idx % 2 === 0 ? blossomMatPink : blossomMatLavender;
        // 5-lobed blossom cluster
        for (let p = 0; p < 5; p++) {
          const petalGeo = new THREE.SphereGeometry(0.18, 6, 6);
          const petal = new THREE.Mesh(petalGeo, bMat);
          const pAng = (p / 5) * Math.PI * 2;
          petal.position.set(Math.cos(pAng) * 0.22, Math.sin(pAng) * 0.22, 0);
          petal.scale.set(1.0, 0.6, 0.35);
          cluster.add(petal);
        }

        // Golden glowing flower core
        const coreGeo = new THREE.SphereGeometry(0.09, 6, 6);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xeab308, emissiveIntensity: 0.8 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        cluster.add(core);

        treeGroup.add(cluster);
      });

      // Fallen petals scattered on the stones below
      for (let f = 0; f < 6; f++) {
        const fPetal = new THREE.Mesh(new THREE.CircleGeometry(0.09, 5), petalMat);
        fPetal.rotation.x = -Math.PI / 2;
        fPetal.position.set(1.5 + Math.random() * 1.2, 0.02, (Math.random() - 0.5) * 1.2);
        treeGroup.add(fPetal);
      }

      this.obstacleMeshes.push(trunk);
      this.islandGroup.add(treeGroup);
    });
  }

  // ---------------------------------------------------------------------------
  // 7. STONE PATHWAYS
  // ---------------------------------------------------------------------------
  private createPathways(): void {
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x2e2348,
      roughness: 0.8,
      metalness: 0.05
    });

    const runeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });

    // Ring path around the central lake
    const ringPathGeo = new THREE.RingGeometry(7.6, 9.4, 36);
    ringPathGeo.rotateX(-Math.PI / 2);
    const ringPath = new THREE.Mesh(ringPathGeo, pathMat);
    ringPath.position.y = 0.23;
    ringPath.receiveShadow = true;
    this.islandGroup.add(ringPath);

    // Radial pathway branches connecting to the stations
    const destinations = [
      new THREE.Vector3(10.5, 0.23, 5.2),   // Shop
      new THREE.Vector3(-10.5, 0.23, 5.2),  // Quests
      new THREE.Vector3(0, 0.23, 13.5),     // Altar
      new THREE.Vector3(-8.5, 0.23, -7.5),  // Almanac
      new THREE.Vector3(13.8, 0.23, -4.5),  // Portal
    ];

    destinations.forEach(dest => {
      const dist = Math.hypot(dest.x, dest.z);
      const pathGeo = new THREE.PlaneGeometry(1.6, dist - 8.5);
      pathGeo.rotateX(-Math.PI / 2);
      const path = new THREE.Mesh(pathGeo, pathMat);

      const angle = Math.atan2(dest.x, dest.z);
      path.rotation.y = angle;
      const mid = 8.5 + (dist - 8.5) * 0.5;
      path.position.set(Math.sin(angle) * mid, 0.23, Math.cos(angle) * mid);
      path.receiveShadow = true;
      this.islandGroup.add(path);

      // Embedded starlight rune stones along the path
      const runeGeo = new THREE.BoxGeometry(0.35, 0.03, 0.35);
      const rune = new THREE.Mesh(runeGeo, runeMat);
      rune.position.set(Math.sin(angle) * (mid + 0.8), 0.24, Math.cos(angle) * (mid + 0.8));
      this.islandGroup.add(rune);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. DEDICATED FISHING PIERS (South, East, North, West)
  // ---------------------------------------------------------------------------
  private createFishingPiers(): void {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3e21, // Warm rustic dock timber
      roughness: 0.85,
      metalness: 0.05
    });

    const postMat = new THREE.MeshStandardMaterial({
      color: 0x422a16,
      roughness: 0.9
    });

    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });

    WORLD_LAYOUT.fishingAnchors.forEach((anchor: FishingAnchor) => {
      const pierGroup = new THREE.Group();
      pierGroup.position.copy(anchor.position);
      pierGroup.position.y = 0.22; // Level with island turf!

      const angle = Math.atan2(anchor.direction.x, anchor.direction.z);
      pierGroup.rotation.y = angle;

      // Pier Wooden Deck Planks (Wide 2.4m, extends from shore cleanly out over galaxy pond)
      const deckGeo = new THREE.BoxGeometry(2.4, 0.12, 3.4);
      const deck = new THREE.Mesh(deckGeo, woodMat);
      deck.position.set(0, 0, 0.7);
      deck.castShadow = true;
      deck.receiveShadow = true;
      pierGroup.add(deck);

      // Wooden pilings / support posts under water at outer corners
      const pylonGeo = new THREE.CylinderGeometry(0.11, 0.11, 2.2, 8);
      [
        [-1.05, 2.1],
        [1.05, 2.1],
        [-1.05, -0.6],
        [1.05, -0.6]
      ].forEach(([px, pz]) => {
        const pylon = new THREE.Mesh(pylonGeo, postMat);
        pylon.position.set(px, -1.0, pz);
        pylon.castShadow = true;
        pierGroup.add(pylon);
      });

      // Lantern Posts strictly on outer front corners (no clipping with cat!)
      [-1.05, 1.05].forEach(lx => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), postMat);
        pole.position.set(lx, 0.7, 2.1);
        pole.castShadow = true;
        pierGroup.add(pole);

        // Hanging lantern
        const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), lanternMat);
        lantern.position.set(lx, 1.35, 2.1);
        pierGroup.add(lantern);

        // Cozy amber light
        const pLight = new THREE.PointLight(0xf59e0b, 0.9, 4.5);
        pLight.position.set(lx, 1.35, 2.1);
        pierGroup.add(pLight);
      });

      // Interactable fishing prompt for this pier
      this.interactables.push({
        id: anchor.id,
        name: anchor.name,
        prompt: anchor.prompt,
        position: anchor.position.clone(),
        radius: anchor.interactionRadius
      });

      this.islandGroup.add(pierGroup);
    });
  }

  // ---------------------------------------------------------------------------
  // 9. GALAXY WATER & SHADER (Real Outer Space Galaxy With Twinkling Stars)
  // ---------------------------------------------------------------------------
  private createCosmicWater(): void {
    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        poolColor: { value: this.activePoolColor },
        glowColor: { value: new THREE.Color(0x38bdf8) },
        nebulaColor: { value: new THREE.Color(0xd946ef) },
        rippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
        rippleTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        uniform float time;
        void main() {
          vUv = uv;
          vec3 pos = position;
          // Gentle sinusoidal water swell
          pos.y += sin(pos.x * 0.8 + time * 1.6) * cos(pos.z * 0.8 + time * 1.6) * 0.035;
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        uniform float time;
        uniform vec3 poolColor;
        uniform vec3 glowColor;
        uniform vec3 nebulaColor;
        uniform vec2 rippleCenter;
        uniform float rippleTime;

        // Hash function for pseudo-random star distribution
        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);

          // Smooth edge falloff at shoreline rim
          float edgeAlpha = smoothstep(1.02, 0.95, r);

          float theta = atan(p.y, p.x);

          // 1. DYNAMIC LOGARITHMIC SPIRAL GALAXY ARMS (Like Whirlpool Galaxy!)
          float armAngle1 = theta - 3.2 * log(r + 0.12) - time * 0.35;
          float armAngle2 = armAngle1 + 3.14159265;
          
          // Safe squaring to eliminate GLSL pow(negative, 2.0) NaN bug!
          float s1 = sin(armAngle1 * 0.5);
          float s2 = sin(armAngle2 * 0.5);
          float spiral1 = exp(-(s1 * s1) * 7.5);
          float spiral2 = exp(-(s2 * s2) * 7.5);
          float galaxyArms = spiral1 + spiral2;

          // 2. BRILLIANT GLOWING GALACTIC CORE
          float coreGlow = exp(-r * 3.4) * 2.4;
          float outerCore = exp(-r * 1.6) * 0.9;

          // 3. SWIRLING NEBULA GAS CLOUDS (Domain warped watercolor turbulence)
          float n1 = sin(p.x * 4.2 + sin(p.y * 3.8 + time * 0.32) * 2.0);
          float n2 = cos(p.y * 5.2 + cos(p.x * 4.2 - time * 0.22) * 2.0);
          float cosmicGas = (n1 + n2) * 0.25 + 0.5;

          // 4. DENSE MULTI-LAYER STARFIELD (Thousands of Outer Space Stars!)
          // Layer A: Micro Stardust (tiny glittering pinpricks)
          vec2 sUv1 = vUv * 260.0;
          vec2 sId1 = floor(sUv1);
          float sSeed1 = hash21(sId1);
          float microStars = step(0.960, sSeed1) * (0.5 + 0.5 * sin(time * 3.5 + sSeed1 * 25.0));

          // Layer B: Medium Twinkling Stars
          vec2 sUv2 = vUv * 85.0;
          vec2 sId2 = floor(sUv2);
          float sSeed2 = hash21(sId2);
          float medStars = step(0.974, sSeed2) * (0.6 + 0.4 * cos(time * 2.5 + sSeed2 * 35.0));

          // Layer C: Bright 4-Point Cross Sparkle Stars (Space telescope diffraction spikes)
          vec2 sUv3 = vUv * 20.0;
          vec2 sId3 = floor(sUv3);
          vec2 sFract3 = fract(sUv3) - 0.5;
          float sSeed3 = hash21(sId3);
          float crossStars = 0.0;
          if (sSeed3 > 0.86) {
            float cross = max(0.0, 1.0 - abs(sFract3.x) * 12.0) * max(0.0, 1.0 - abs(sFract3.y) * 3.2)
                        + max(0.0, 1.0 - abs(sFract3.y) * 12.0) * max(0.0, 1.0 - abs(sFract3.x) * 3.2);
            float starGlow = max(0.0, 1.0 - length(sFract3) * 5.0);
            float twinkle = 0.6 + 0.4 * sin(time * 4.5 + sSeed3 * 45.0);
            crossStars = (cross * 1.8 + starGlow * 1.2) * twinkle;
          }

          // 5. COLOR PALETTE (From the User's Concept Art!)
          vec3 spaceVoid = vec3(0.04, 0.06, 0.16);         // Deep indigo space void
          vec3 pastelPink = vec3(0.95, 0.48, 0.72);        // Soft sakura pink nebula
          vec3 pastelLavender = vec3(0.68, 0.52, 0.95);    // Dreamy cosmic lavender
          vec3 turquoiseShallows = vec3(0.12, 0.82, 0.92); // Glowing turquoise shallows
          vec3 coreGold = vec3(1.0, 0.94, 0.68);           // Warm celestial gold
          vec3 whiteStar = vec3(1.0, 1.0, 1.0);            // Diamond white starlight

          // Composite nebula colors
          vec3 col = spaceVoid;
          col += mix(pastelLavender, pastelPink, cosmicGas) * (galaxyArms * 0.90 + outerCore * 0.7);
          col += turquoiseShallows * (galaxyArms * 0.55 + cosmicGas * 0.35);

          // Add glowing galactic core
          col += mix(turquoiseShallows, coreGold, clamp(coreGlow, 0.0, 1.0)) * coreGlow * 1.5;

          // Add dense starfield
          col += turquoiseShallows * microStars * 1.4;
          col += whiteStar * medStars * 2.0;
          col += mix(coreGold, whiteStar, 0.5) * crossStars * 2.6;

          // 6. DYNAMIC CONCENTRIC STARRY WATER RIPPLES
          if (rippleTime > 0.0) {
            float dR = length(vUv - rippleCenter);
            float wave = sin((dR * 40.0) - rippleTime * 9.0);
            float fade = max(0.0, 1.0 - dR * 2.8) * max(0.0, 1.0 - rippleTime * 0.4);
            col += turquoiseShallows * wave * fade * 0.85;
          }

          // 7. SHALLOW TURQUOISE SHORELINE FRINGE (Matching Concept Art!)
          float rimShallows = smoothstep(0.68, 0.96, r);
          col += turquoiseShallows * rimShallows * 1.6;

          // Subtle overall galactic pulsation
          col *= (1.0 + 0.04 * sin(time * 1.8));

          gl_FragColor = vec4(col, edgeAlpha * 0.96);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const waterGeo = new THREE.CircleGeometry(WORLD_LAYOUT.island.innerPoolRadius + 0.02, 64);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
    this.waterMesh.position.set(0, 0.10, 0); // Positioned inside the sunken basin!
    this.islandGroup.add(this.waterMesh);

    // 3D Floating Glittering Starlight Field Inside the Pond (140 Twinkling Points)
    const starCount = 140;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * (WORLD_LAYOUT.island.innerPoolRadius - 0.7);
      starPos[i * 3] = Math.cos(ang) * dist;
      starPos[i * 3 + 1] = 0.05 + Math.random() * 0.08;
      starPos[i * 3 + 2] = Math.sin(ang) * dist;

      const pick = Math.random();
      const c = pick > 0.65 ? new THREE.Color(0xfde047) :
                pick > 0.35 ? new THREE.Color(0x67e8f9) :
                pick > 0.15 ? new THREE.Color(0xf472b6) :
                new THREE.Color(0xffffff);
      starCols[i * 3] = c.r;
      starCols[i * 3 + 1] = c.g;
      starCols[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.30,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.waterParticles = new THREE.Points(starGeo, starMat);
    this.islandGroup.add(this.waterParticles);
  }

  // ---------------------------------------------------------------------------
  // 10. BIOLUMINESCENT LILY PADS & LOTUS BLOSSOMS (From Concept Art)
  // ---------------------------------------------------------------------------
  private createFloatingLilyPads(): void {
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });

    const lotusLavender = new THREE.MeshStandardMaterial({
      color: 0xe9d5ff,
      emissive: 0xc084fc,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      side: THREE.DoubleSide
    });

    const lotusCyan = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      side: THREE.DoubleSide
    });

    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    // 8 Lily Pads matching the layout in the user's reference image
    const padConfigs = [
      { r: 4.8, angle: 0.2, scale: 1.15 },
      { r: 4.5, angle: 1.0, scale: 0.95 },
      { r: 4.9, angle: 1.8, scale: 1.25 },
      { r: 4.2, angle: 2.6, scale: 0.85 },
      { r: 4.7, angle: 3.4, scale: 1.10 },
      { r: 4.4, angle: 4.2, scale: 0.90 },
      { r: 5.0, angle: 5.0, scale: 1.20 },
      { r: 4.3, angle: 5.8, scale: 0.80 }
    ];

    padConfigs.forEach((cfg, idx) => {
      const padGroup = new THREE.Group();
      const px = Math.cos(cfg.angle) * cfg.r;
      const pz = Math.sin(cfg.angle) * cfg.r;
      const py = 0.11; // Floating on the water surface

      padGroup.position.set(px, py, pz);

      // Lily Pad with authentic V-notch cutout!
      const padGeo = new THREE.CircleGeometry(0.65 * cfg.scale, 32, 0.25, Math.PI * 1.84);
      padGeo.rotateX(-Math.PI / 2);
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.receiveShadow = true;
      padGroup.add(padMesh);

      // Layered Lotus Blossom in center of lily pad (Like concept art!)
      const flowerGroup = new THREE.Group();
      flowerGroup.position.set(0, 0.03, 0);

      // Outer Petals Tier (Lavender)
      for (let p = 0; p < 7; p++) {
        const petalGeo = new THREE.ConeGeometry(0.12 * cfg.scale, 0.32 * cfg.scale, 4);
        petalGeo.rotateX(Math.PI / 3);
        const petal = new THREE.Mesh(petalGeo, lotusLavender);
        const pAng = (p / 7) * Math.PI * 2;
        petal.position.set(Math.cos(pAng) * 0.18 * cfg.scale, 0.05, Math.sin(pAng) * 0.18 * cfg.scale);
        petal.rotation.y = -pAng;
        flowerGroup.add(petal);
      }

      // Inner Petals Tier (Soft Cyan)
      for (let p = 0; p < 5; p++) {
        const petalGeo = new THREE.ConeGeometry(0.09 * cfg.scale, 0.24 * cfg.scale, 4);
        petalGeo.rotateX(Math.PI / 4);
        const petal = new THREE.Mesh(petalGeo, lotusCyan);
        const pAng = (p / 5) * Math.PI * 2 + 0.3;
        petal.position.set(Math.cos(pAng) * 0.10 * cfg.scale, 0.08, Math.sin(pAng) * 0.10 * cfg.scale);
        petal.rotation.y = -pAng;
        flowerGroup.add(petal);
      }

      // Golden Glowing Stamen Center
      const stamenGeo = new THREE.SphereGeometry(0.08 * cfg.scale, 8, 8);
      const stamen = new THREE.Mesh(stamenGeo, stamenMat);
      stamen.position.y = 0.12 * cfg.scale;
      flowerGroup.add(stamen);

      // Tiny localized starlight point on alternate lily pads
      if (idx % 2 === 0) {
        const lotusLight = new THREE.PointLight(0x38bdf8, 0.6, 2.5);
        lotusLight.position.y = 0.25;
        padGroup.add(lotusLight);
      }

      padGroup.add(flowerGroup);
      this.islandGroup.add(padGroup);

      this.lilyPads.push({
        group: padGroup,
        baseY: py,
        phase: idx * 0.8,
        bobSpeed: 1.4 + (idx % 3) * 0.2
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 11. YIN-YANG CELESTIAL KOI PAIR (From Concept Art)
  // ---------------------------------------------------------------------------
  private createCelestialKoiPair(): void {
    // Koi 1: Golden-Orange Calico Celestial Koi
    const koi1Mat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xea580c,
      emissiveIntensity: 0.65,
      roughness: 0.3
    });

    // Koi 2: Luminous Moonlit Cyan Celestial Koi
    const koi2Mat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      roughness: 0.3
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xfde047,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.80,
      side: THREE.DoubleSide
    });

    const koiConfigs = [
      { mat: koi1Mat, lightCol: 0xfbbf24, startAngle: 0 },
      { mat: koi2Mat, lightCol: 0x38bdf8, startAngle: Math.PI } // 180 deg offset (Yin-Yang!)
    ];

    koiConfigs.forEach(cfg => {
      const koiGroup = new THREE.Group();

      // Main Torpedo/Ellipsoid Fish Body
      const bodyGeo = new THREE.SphereGeometry(0.24, 12, 10);
      bodyGeo.scale(1.0, 0.55, 2.2);
      const body = new THREE.Mesh(bodyGeo, cfg.mat);
      koiGroup.add(body);

      // Graceful Dorsal Fin
      const dorsalGeo = new THREE.PlaneGeometry(0.18, 0.55);
      dorsalGeo.rotateY(Math.PI / 2);
      const dorsal = new THREE.Mesh(dorsalGeo, finMat);
      dorsal.position.set(0, 0.16, -0.1);
      koiGroup.add(dorsal);

      // Pectoral Fins (Left & Right)
      [-1, 1].forEach(side => {
        const pecGeo = new THREE.PlaneGeometry(0.32, 0.22);
        const pec = new THREE.Mesh(pecGeo, finMat);
        pec.position.set(side * 0.24, -0.04, 0.25);
        pec.rotation.set(0.2, 0, side * 0.45);
        koiGroup.add(pec);
      });

      // Articulated Sweeping Tail Fin Group
      const tailGroup = new THREE.Group();
      tailGroup.position.set(0, 0, -0.52);

      const caudalGeo = new THREE.ConeGeometry(0.22, 0.65, 4);
      caudalGeo.rotateX(-Math.PI / 2);
      caudalGeo.scale(0.15, 1.0, 1.0);
      const caudal = new THREE.Mesh(caudalGeo, finMat);
      caudal.position.set(0, 0, -0.28);
      tailGroup.add(caudal);
      koiGroup.add(tailGroup);

      // Glowing Aura PointLight on Koi
      const kLight = new THREE.PointLight(cfg.lightCol, 0.85, 3.5);
      koiGroup.add(kLight);

      this.islandGroup.add(koiGroup);

      this.koiFishPair.push({
        group: koiGroup,
        tailGroup: tailGroup,
        angle: cfg.startAngle,
        speed: 0.52,
        radius: 2.3, // Swimming in orbital ring inside the galaxy pool
        heightOffset: 0.02
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 12. HUB STATIONS (Detailed 3D Themed Structures)
  // ---------------------------------------------------------------------------
  private createHubStations(): void {
    const s = WORLD_LAYOUT.stations;

    this.createShopKiosk(s.shop.position, s.shop.rotationY);
    this.interactables.push({
      id: s.shop.id,
      name: s.shop.name,
      prompt: s.shop.prompt,
      position: s.shop.position.clone(),
      radius: s.shop.interactionRadius
    });

    this.createQuestBoard(s.quests.position, s.quests.rotationY);
    this.interactables.push({
      id: s.quests.id,
      name: s.quests.name,
      prompt: s.quests.prompt,
      position: s.quests.position.clone(),
      radius: s.quests.interactionRadius
    });

    this.createConstellationAltar(s.constellations.position, s.constellations.rotationY);
    this.interactables.push({
      id: s.constellations.id,
      name: s.constellations.name,
      prompt: s.constellations.prompt,
      position: s.constellations.position.clone(),
      radius: s.constellations.interactionRadius
    });

    this.createAlmanacPedestal(s.collection.position, s.collection.rotationY);
    this.interactables.push({
      id: s.collection.id,
      name: s.collection.name,
      prompt: s.collection.prompt,
      position: s.collection.position.clone(),
      radius: s.collection.interactionRadius
    });

    this.createPortalGateway(s.portal.position, s.portal.rotationY);
    this.interactables.push({
      id: s.portal.id,
      name: s.portal.name,
      prompt: s.portal.prompt,
      position: s.portal.position.clone(),
      radius: s.portal.interactionRadius
    });
  }

  // A. Cosmic Shop Kiosk
  private createShopKiosk(pos: THREE.Vector3, rotY: number): void {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.22;
    group.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3319, roughness: 0.8 });
    const awningMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.6 });

    // Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.9), woodMat);
    counter.position.set(0, 0.45, 0);
    counter.castShadow = true;
    group.add(counter);

    // Awning Support Posts
    [-1.1, 1.1].forEach(px => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), woodMat);
      post.position.set(px, 1.1, 0.4);
      post.castShadow = true;
      group.add(post);
    });

    // Canopy Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 1.4), awningMat);
    awning.position.set(0, 2.1, 0.2);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    group.add(awning);

    // Signboard
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.08), woodMat);
    sign.position.set(0, 2.4, 0.4);
    group.add(sign);

    const starIcon = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), goldMat);
    starIcon.position.set(0, 2.4, 0.46);
    group.add(starIcon);

    // Shop Potion / Bobber displays on counter
    const flaskGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const flaskMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    });
    const flask = new THREE.Mesh(flaskGeo, flaskMat);
    flask.position.set(-0.6, 0.98, 0.1);
    group.add(flask);

    // Warm shop lantern
    const lantern = new THREE.PointLight(0xf59e0b, 1.1, 5.0);
    lantern.position.set(0, 1.8, 0.4);
    group.add(lantern);

    this.obstacleMeshes.push(counter);
    this.islandGroup.add(group);
  }

  // B. Quest Observatory Board
  private createQuestBoard(pos: THREE.Vector3, rotY: number): void {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.22;
    group.rotation.y = rotY;

    const timberMat = new THREE.MeshStandardMaterial({ color: 0x3e2916, roughness: 0.85 });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x78563a, roughness: 0.7 });
    const scrollMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });

    // Twin support posts
    [-1.0, 1.0].forEach(x => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.2), timberMat);
      post.position.set(x, 1.2, 0);
      post.castShadow = true;
      group.add(post);
    });

    // Bulletin Board Panel
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 0.12), boardMat);
    board.position.set(0, 1.4, 0);
    board.castShadow = true;
    group.add(board);

    // Nailed parchment scrolls
    [-0.5, 0.4].forEach((sx, idx) => {
      const scroll = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.6), scrollMat);
      scroll.position.set(sx, 1.4 + (idx % 2 === 0 ? 0.1 : -0.1), 0.08);
      scroll.rotation.z = (idx - 0.5) * 0.15;
      group.add(scroll);
    });

    // Golden Star Pin atop Board
    const pin = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.7 })
    );
    pin.position.set(0, 2.25, 0.05);
    group.add(pin);

    // Amber lantern light
    const qLight = new THREE.PointLight(0xfacc15, 0.9, 4.5);
    qLight.position.set(0, 2.2, 0.4);
    group.add(qLight);

    this.obstacleMeshes.push(board);
    this.islandGroup.add(group);
  }

  // C. Constellation Altar
  private createConstellationAltar(pos: THREE.Vector3, rotY: number): void {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.22;
    group.rotation.y = rotY;

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x271e3d, roughness: 0.7 });
    const runeMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.7 });

    // Stepped Circular Dais (Tier 1 & Tier 2)
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.3, 16), stoneMat);
    dais1.position.y = 0.15;
    dais1.receiveShadow = true;
    group.add(dais1);

    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16), stoneMat);
    dais2.position.y = 0.45;
    dais2.receiveShadow = true;
    group.add(dais2);

    // Central Pillar
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.2, 8), stoneMat);
    pillar.position.y = 1.05;
    pillar.castShadow = true;
    group.add(pillar);

    // 4 Surrounding Runestone Monoliths
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const monolith = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 0.35), stoneMat);
      monolith.position.set(Math.cos(ang) * 1.9, 0.9, Math.sin(ang) * 1.9);
      monolith.rotation.y = -ang;
      monolith.castShadow = true;
      group.add(monolith);

      // Glowing rune embedded on pillar
      const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.7), runeMat);
      rune.position.set(Math.cos(ang) * 1.71, 0.9, Math.sin(ang) * 1.71);
      rune.rotation.y = ang + Math.PI;
      group.add(rune);
    }

    // Floating Rotating Armillary Sphere / Star Relic atop Altar
    const relicGroup = new THREE.Group();
    relicGroup.position.set(0, 2.05, 0);

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.04, 8, 24), goldMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 24), runeMat);
    ring2.rotation.x = Math.PI / 2;

    const coreStar = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18),
      new THREE.MeshStandardMaterial({ color: 0xe879f9, emissive: 0xc026d3, emissiveIntensity: 0.9 })
    );

    relicGroup.add(ring1);
    relicGroup.add(ring2);
    relicGroup.add(coreStar);
    group.add(relicGroup);

    // Altar Violet Starlight Glow
    const aLight = new THREE.PointLight(0xc084fc, 1.2, 5.5);
    aLight.position.set(0, 2.2, 0);
    group.add(aLight);

    this.rotatingArtifacts.push({ obj: relicGroup, rotAxis: new THREE.Vector3(0.5, 1, 0.2).normalize(), speed: 0.8 });
    this.obstacleMeshes.push(dais1);
    this.obstacleMeshes.push(pillar);
    this.islandGroup.add(group);
  }

  // D. Star Almanac Pedestal
  private createAlmanacPedestal(pos: THREE.Vector3, rotY: number): void {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.22;
    group.rotation.y = rotY;

    const marbleMat = new THREE.MeshStandardMaterial({ color: 0x372954, roughness: 0.5 });
    const bookCoverMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xeab308, emissiveIntensity: 0.4 });

    // Octagonal Pedestal Base & Shaft
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.35, 8), marbleMat);
    base.position.y = 0.175;
    base.receiveShadow = true;
    group.add(base);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.1, 8), marbleMat);
    shaft.position.y = 0.8;
    shaft.castShadow = true;
    group.add(shaft);

    const tabletop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.75, 0.18, 8), marbleMat);
    tabletop.position.y = 1.4;
    tabletop.castShadow = true;
    group.add(tabletop);

    // Floating Ancient Celestial Grimoire
    const bookGroup = new THREE.Group();
    bookGroup.position.set(0, 1.8, 0);
    bookGroup.rotation.x = 0.35;

    const bookBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.65), bookCoverMat);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.58), pageMat);
    pages.position.y = 0.08;
    bookGroup.add(bookBase);
    bookGroup.add(pages);
    group.add(bookGroup);

    // Almanac Emerald Knowledge Glow
    const pLight = new THREE.PointLight(0x4ade80, 0.95, 4.5);
    pLight.position.set(0, 1.9, 0.2);
    group.add(pLight);

    this.rotatingArtifacts.push({ obj: bookGroup, rotAxis: new THREE.Vector3(0, 1, 0), speed: 0.4 });
    this.obstacleMeshes.push(tabletop);
    this.islandGroup.add(group);
  }

  // E. Astral Portal Gateway
  private createPortalGateway(pos: THREE.Vector3, rotY: number): void {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.position.y = 0.22;
    group.rotation.y = rotY;

    const archMat = new THREE.MeshStandardMaterial({ color: 0x2b2247, roughness: 0.7 });
    const runeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 });

    // Left & Right Portal Pillars
    [-1.2, 1.2].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), archMat);
      pillar.position.set(px, 1.6, 0);
      pillar.castShadow = true;
      group.add(pillar);

      // Embedded Glowing Runes on Pillars
      for (let r = 0; r < 3; r++) {
        const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.45), runeMat);
        rune.position.set(px, 0.8 + r * 0.9, 0.29);
        group.add(rune);
      }
    });

    // Archway Lintel Beam
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.6, 0.65), archMat);
    lintel.position.set(0, 3.3, 0);
    lintel.castShadow = true;
    group.add(lintel);

    // Swirling Portal Event Horizon (Vortex Disk)
    const portalGeo = new THREE.CircleGeometry(1.3, 32);
    const portalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 1.7, 0);
    group.add(portalMesh);

    // Cyan Portal Energy Light
    const pLight = new THREE.PointLight(0x06b6d4, 1.4, 6.0);
    pLight.position.set(0, 1.7, 0.3);
    group.add(pLight);

    this.rotatingArtifacts.push({ obj: portalMesh, rotAxis: new THREE.Vector3(0, 0, 1), speed: 1.2 });
    this.obstacleMeshes.push(lintel);
    this.islandGroup.add(group);
  }

  // ---------------------------------------------------------------------------
  // 13. VEGETATION, FLORA & GLOWING CRYSTALS
  // ---------------------------------------------------------------------------
  private createVegetationAndCrystals(): void {
    const crystalMatCyan = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.4
    });

    const crystalMatPink = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xdb2777,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.4
    });

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x281e42, roughness: 0.85 });

    // Major Crystal Clusters at perimeter
    const clusters = [
      { pos: new THREE.Vector3(12.0, 0.22, 10.5), mat: crystalMatCyan },
      { pos: new THREE.Vector3(-12.0, 0.22, 10.5), mat: crystalMatPink },
      { pos: new THREE.Vector3(-12.5, 0.22, -5.5), mat: crystalMatCyan }
    ];

    clusters.forEach(c => {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.copy(c.pos);

      // Base rock
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9), rockMat);
      rock.position.y = 0.4;
      rock.castShadow = true;
      clusterGroup.add(rock);

      // Sprouting Crystals
      [-0.4, 0, 0.4].forEach((cx, idx) => {
        const h = 1.2 + idx * 0.4;
        const cryGeo = new THREE.ConeGeometry(0.24, h, 5);
        const cry = new THREE.Mesh(cryGeo, c.mat);
        cry.position.set(cx, 0.5 + h * 0.5, (idx % 2 === 0 ? 0.2 : -0.2));
        cry.rotation.z = (idx - 1) * 0.25;
        cry.castShadow = true;
        clusterGroup.add(cry);
      });

      this.obstacleMeshes.push(rock);
      this.islandGroup.add(clusterGroup);
    });
  }

  // ---------------------------------------------------------------------------
  // 14. FLOATING SATELLITE MINI-ISLANDS (Visual depth)
  // ---------------------------------------------------------------------------
  private createSatelliteIslands(): void {
    const satelliteIslandMat = new THREE.MeshStandardMaterial({ color: 0x18132e, roughness: 0.8 });
    const turfMat = new THREE.MeshStandardMaterial({ color: 0x143152, roughness: 0.7 });

    const satellites = [
      { pos: new THREE.Vector3(38, 12, -45), r: 4.2 },
      { pos: new THREE.Vector3(-42, 8, -38), r: 3.5 },
      { pos: new THREE.Vector3(-36, 15, 42), r: 4.8 }
    ];

    satellites.forEach(s => {
      const satGroup = new THREE.Group();
      satGroup.position.copy(s.pos);

      const base = new THREE.Mesh(new THREE.ConeGeometry(s.r, s.r * 1.5, 7), satelliteIslandMat);
      base.rotation.x = Math.PI;
      satGroup.add(base);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r * 0.9, 0.3, 12), turfMat);
      top.position.y = 0.15;
      satGroup.add(top);

      // Tiny glowing crystal spire on satellite
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.8),
        new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0284c7, emissiveIntensity: 0.8 })
      );
      crystal.position.y = 1.6;
      satGroup.add(crystal);

      this.scene.add(satGroup);
    });
  }

  // ---------------------------------------------------------------------------
  // 15. AMBIENT DUST & DRIFTING SAKURA PETALS
  // ---------------------------------------------------------------------------
  private setupAmbientDust(): void {
    const count = 350;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.2 + Math.random() * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.45,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    this.ambientParticles = new THREE.Points(geo, mat);
    this.islandGroup.add(this.ambientParticles);
  }

  private setupFallingPetals(): void {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 4.0 + Math.random() * 8.0;
      positions[i * 3] = Math.cos(ang) * dist;
      positions[i * 3 + 1] = 0.8 + Math.random() * 3.5;
      positions[i * 3 + 2] = Math.sin(ang) * dist;

      const isLavender = Math.random() > 0.5;
      const col = isLavender ? new THREE.Color(0xe9d5ff) : new THREE.Color(0xfbcfe8);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.fallingPetals = new THREE.Points(geo, mat);
    this.islandGroup.add(this.fallingPetals);
  }

  // ---------------------------------------------------------------------------
  // 16. DYNAMIC ENVIRONMENT ADJUSTMENTS
  // ---------------------------------------------------------------------------
  public setEnvironmentColors(skyHex: string | number, poolHex: string | number, fogHex: string | number, fogDensity: number): void {
    this.activeSkyColor.set(skyHex as any);
    this.activePoolColor.set(poolHex as any);
    this.scene.background = this.activeSkyColor;
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.set(fogHex as any);
      (this.scene.fog as THREE.FogExp2).density = fogDensity;
    }
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.poolColor.value.set(poolHex as any);
    }
  }

  public triggerWaterRipple(pos: THREE.Vector3): void {
    if (this.waterMaterial) {
      // Map world coords to UV [-0.5, 0.5] -> [0, 1]
      const u = (pos.x / (WORLD_LAYOUT.island.innerPoolRadius * 2)) + 0.5;
      const v = (pos.z / (WORLD_LAYOUT.island.innerPoolRadius * 2)) + 0.5;
      this.waterMaterial.uniforms.rippleCenter.value.set(u, v);
      this.waterMaterial.uniforms.rippleTime.value = 0.001;
    }
  }

  // ---------------------------------------------------------------------------
  // 17. ANIMATION TICK UPDATE
  // ---------------------------------------------------------------------------
  public update(delta: number): void {
    this.hoverTimer += delta;

    // Island gentle floating bob
    this.islandGroup.position.y = Math.sin(this.hoverTimer * 0.8) * 0.08;

    // Update galaxy pool shader
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.time.value += delta;
      if (this.waterMaterial.uniforms.rippleTime.value > 0) {
        this.waterMaterial.uniforms.rippleTime.value += delta;
        if (this.waterMaterial.uniforms.rippleTime.value > 2.5) {
          this.waterMaterial.uniforms.rippleTime.value = 0;
        }
      }
    }

    // Lily pads organic wave bobbing
    this.lilyPads.forEach(pad => {
      pad.group.position.y = pad.baseY + Math.sin(this.hoverTimer * pad.bobSpeed + pad.phase) * 0.025;
      pad.group.rotation.y = Math.sin(this.hoverTimer * 0.5 + pad.phase) * 0.06;
    });

    // Yin-Yang Celestial Koi Pair orbital swimming & tail swishing
    this.koiFishPair.forEach(koi => {
      koi.angle += delta * koi.speed;
      koi.group.position.x = Math.cos(koi.angle) * koi.radius;
      koi.group.position.z = Math.sin(koi.angle) * koi.radius;
      koi.group.position.y = koi.heightOffset + Math.sin(this.hoverTimer * 2.2 + koi.angle) * 0.02;

      // Rotate koi facing tangent velocity along the circular orbit
      koi.group.rotation.y = -koi.angle + Math.PI / 2;

      // Realistic swimming tail fin swish
      koi.tailGroup.rotation.y = Math.sin(this.hoverTimer * 5.5 + koi.angle * 2) * 0.35;
    });

    // Rotating artifacts (Armillary sphere, Grimoire, Portal vortex)
    this.rotatingArtifacts.forEach(item => {
      item.obj.rotateOnAxis(item.rotAxis, delta * item.speed);
    });

    // Ambient floating dust particles gentle drift
    if (this.ambientParticles) {
      const pos = this.ambientParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += Math.sin(this.hoverTimer + i) * 0.003;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Drifting cherry blossom petals
    if (this.fallingPetals) {
      const pos = this.fallingPetals.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= delta * 0.28; // fall downward
        pos[i] += Math.sin(this.hoverTimer * 1.5 + i) * 0.005; // flutter drift
        pos[i + 2] += Math.cos(this.hoverTimer * 1.2 + i) * 0.005;

        // Reset if fallen below ground
        if (pos[i + 1] < 0.12) {
          pos[i + 1] = 2.8 + Math.random() * 1.2;
        }
      }
      this.fallingPetals.geometry.attributes.position.needsUpdate = true;
    }

    // Swirl floating 3D water starfield with the galaxy
    if (this.waterParticles) {
      this.waterParticles.rotation.y += delta * 0.14;
    }
  }
}
