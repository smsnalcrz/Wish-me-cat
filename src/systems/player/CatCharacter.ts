import * as THREE from 'three';
import { CatBreed } from '../../types/game';

export type CatAnimState = 'idle' | 'walk' | 'run' | 'fishing_aim' | 'fishing_wait' | 'fishing_reel' | 'celebration';

interface ReelAssembly {
  group: THREE.Group;
  crankGroup: THREE.Group;
  spoolMesh: THREE.Mesh;
  bailMesh: THREE.Mesh;
}

export class CatCharacter {
  public group: THREE.Group;
  public currentBreed: CatBreed = 'celestial';
  public currentRodTier: number = 1;

  // Major Body Transform Groups
  private body: THREE.Group;
  private headGroup: THREE.Group;
  private neckMesh: THREE.Mesh;
  private leftEarGroup: THREE.Group;
  private rightEarGroup: THREE.Group;
  private frontLeftLeg: THREE.Group;
  private frontRightLeg: THREE.Group;
  private backLeftLeg: THREE.Group;
  private backRightLeg: THREE.Group;
  private tailBase: THREE.Group;
  private tailSegments: THREE.Group[] = [];

  // Eyelids for natural dynamic blinking
  private leftEyelid: THREE.Mesh;
  private rightEyelid: THREE.Mesh;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private blinkDuration: number = 0.16;

  // Dual Rod Mounts (Back Holster for walking, Paw Grip for fishing)
  private backRodMount: THREE.Group;
  private pawRodMount: THREE.Group;
  private backRodMesh: THREE.Group;
  private pawRodMesh: THREE.Group;
  private backReel!: ReelAssembly;
  private pawReel!: ReelAssembly;
  private pawRodTip: THREE.Object3D;
  private backRodTip: THREE.Object3D;
  private pawRodBlank: THREE.Group;

  // Animation cycle states
  private animState: CatAnimState = 'idle';
  private animTimer: number = 0;
  private celebrationTimer: number = 0;

  // Material Slots for dynamic breed customization
  private furMat: THREE.MeshStandardMaterial;
  private whiteMat: THREE.MeshStandardMaterial;
  private pinkMat: THREE.MeshStandardMaterial;
  private leftEyeMat: THREE.MeshStandardMaterial;
  private rightEyeMat: THREE.MeshStandardMaterial;
  private pupilMat: THREE.MeshBasicMaterial;
  private catchlightMat: THREE.MeshBasicMaterial;
  private collarMat: THREE.MeshStandardMaterial;
  private charmMat: THREE.MeshStandardMaterial;
  private patchMatPeach: THREE.MeshStandardMaterial;
  private patchMatCharcoal: THREE.MeshStandardMaterial;

  // Equipment Material Slots (for dynamic tier styling)
  private rodBlankMat: THREE.MeshStandardMaterial;
  private rodGripMat: THREE.MeshStandardMaterial;
  private rodMetalMat: THREE.MeshStandardMaterial;
  private reelBodyMat: THREE.MeshStandardMaterial;
  private reelSpoolMat: THREE.MeshStandardMaterial;
  private lineMat: THREE.MeshStandardMaterial;
  private tipCrystalMat: THREE.MeshStandardMaterial;

  // Dynamic Breed Accent Meshes
  private calicoPatches: THREE.Object3D[] = [];
  private fluffyRuffs: THREE.Object3D[] = [];
  private charmMesh!: THREE.Mesh;

  constructor(initialBreed: CatBreed = 'celestial', initialRodTier: number = 1) {
    this.currentBreed = initialBreed;
    this.currentRodTier = initialRodTier;
    this.group = new THREE.Group();
    this.group.name = 'CosmicCatMascot';

    // 1. Initialize Character Materials
    this.furMat = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.05 });
    this.whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
    this.pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.45 });
    this.leftEyeMat = new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.25 });
    this.rightEyeMat = new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.25 });
    this.pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0f1d });
    this.catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.collarMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.3 });
    this.charmMat = new THREE.MeshStandardMaterial({ roughness: 0.20, metalness: 0.85 });
    this.patchMatPeach = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.65 });
    this.patchMatCharcoal = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    // 2. Initialize Equipment Materials
    this.rodBlankMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 });
    this.rodGripMat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.1 });
    this.rodMetalMat = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.8 });
    this.reelBodyMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.75 });
    this.reelSpoolMat = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.85 });
    this.lineMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x38bdf8, emissiveIntensity: 0.6, roughness: 0.2 });
    this.tipCrystalMat = new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.3 });

    // Apply Tier 1 colors initially
    this.updateRodTierMaterials(initialRodTier);

    // 3. Build Torso & Anatomical Body
    this.body = new THREE.Group();
    this.body.position.y = 0.42;
    this.group.add(this.body);

    // Sculpted Feline Torso (Fuller chest, gentle waist taper, soft spine arch)
    const chestGeo = new THREE.SphereGeometry(0.35, 24, 20);
    chestGeo.scale(0.96, 0.94, 1.05);
    const chest = new THREE.Mesh(chestGeo, this.furMat);
    chest.position.set(0, 0.04, 0.10);
    chest.castShadow = true;
    chest.receiveShadow = true;
    this.body.add(chest);

    const bellyGeo = new THREE.SphereGeometry(0.33, 24, 20);
    bellyGeo.scale(0.92, 0.90, 1.15);
    const belly = new THREE.Mesh(bellyGeo, this.furMat);
    belly.position.set(0, -0.02, -0.12);
    belly.castShadow = true;
    belly.receiveShadow = true;
    this.body.add(belly);

    // Fluffy Chest Bib & Creamy Belly Underside
    const bibGeo = new THREE.SphereGeometry(0.25, 18, 14);
    bibGeo.scale(0.85, 0.95, 0.75);
    const bib = new THREE.Mesh(bibGeo, this.whiteMat);
    bib.position.set(0, 0.06, 0.25);
    this.body.add(bib);

    const underbellyGeo = new THREE.SphereGeometry(0.28, 16, 16);
    underbellyGeo.scale(0.80, 0.70, 1.10);
    const underbelly = new THREE.Mesh(underbellyGeo, this.whiteMat);
    underbelly.position.set(0, -0.08, 0.04);
    this.body.add(underbelly);

    // Distinct Neck Transition
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.16, 16);
    this.neckMesh = new THREE.Mesh(neckGeo, this.furMat);
    this.neckMesh.position.set(0, 0.20, 0.22);
    this.neckMesh.rotation.x = 0.35; // angled gracefully forward
    this.neckMesh.castShadow = true;
    this.body.add(this.neckMesh);

    // 4. Sculpted Mascot Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.32, 0.36);
    this.body.add(this.headGroup);

    // Head Base (Chibi mascot proportions with soft curved jawline)
    const headGeo = new THREE.SphereGeometry(0.30, 24, 20);
    headGeo.scale(1.15, 0.95, 1.05);
    const head = new THREE.Mesh(headGeo, this.furMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Smooth Chubby Cheeks (Left & Right)
    [-0.17, 0.17].forEach(cx => {
      const cheekGeo = new THREE.SphereGeometry(0.12, 16, 14);
      cheekGeo.scale(1.0, 0.85, 0.9);
      const cheek = new THREE.Mesh(cheekGeo, this.furMat);
      cheek.position.set(cx, -0.06, 0.14);
      this.headGroup.add(cheek);
    });

    // Whisker Pads (Muzzle forming sweet :3 feline smile)
    [-0.065, 0.065].forEach(mx => {
      const padGeo = new THREE.SphereGeometry(0.085, 16, 12);
      padGeo.scale(1.0, 0.75, 0.8);
      const pad = new THREE.Mesh(padGeo, this.whiteMat);
      pad.position.set(mx, -0.08, 0.27);
      this.headGroup.add(pad);
    });

    // Delicate Pink Heart/Button Nose
    const noseGeo = new THREE.ConeGeometry(0.032, 0.042, 4);
    noseGeo.rotateX(Math.PI);
    const nose = new THREE.Mesh(noseGeo, this.pinkMat);
    nose.position.set(0, -0.048, 0.33);
    this.headGroup.add(nose);

    // Delicate Curled Whiskers (3 on each cheek)
    [-1, 1].forEach(side => {
      for (let w = 0; w < 3; w++) {
        const wGeo = new THREE.CylinderGeometry(0.0025, 0.001, 0.18, 4);
        wGeo.rotateZ(Math.PI / 2);
        const whisker = new THREE.Mesh(wGeo, this.whiteMat);
        const wPitch = (w - 1) * 0.12;
        whisker.position.set(side * 0.18, -0.07 + (w - 1) * 0.025, 0.23);
        whisker.rotation.set(wPitch, side * 0.32, side * wPitch * 0.45);
        this.headGroup.add(whisker);
      }
    });

    // 5. Expressive Anime Eyes with Blinking Eyelids
    const eyeL = this.createAnimeEye(-0.135, true);
    const eyeR = this.createAnimeEye(0.135, false);
    this.leftEyelid = eyeL.eyelid;
    this.rightEyelid = eyeR.eyelid;

    // 6. Sculpted Feline Ears (Not primitive cones!)
    this.leftEarGroup = this.createSculptedEar(-1);
    this.leftEarGroup.position.set(-0.19, 0.27, 0.03);
    this.leftEarGroup.rotation.set(0.08, 0.12, 0.24);
    this.headGroup.add(this.leftEarGroup);

    this.rightEarGroup = this.createSculptedEar(1);
    this.rightEarGroup.position.set(0.19, 0.27, 0.03);
    this.rightEarGroup.rotation.set(0.08, -0.12, -0.24);
    this.headGroup.add(this.rightEarGroup);

    // 7. Fitted Collar & Celestial Charm
    const collarGeo = new THREE.TorusGeometry(0.20, 0.022, 10, 26);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, this.collarMat);
    collar.position.set(0, -0.15, 0.08);
    this.headGroup.add(collar);

    // Hanging Bell / Charm under chin
    const charmHolder = new THREE.Group();
    charmHolder.position.set(0, -0.21, 0.23);

    const charmGeo = new THREE.SphereGeometry(0.052, 12, 10);
    this.charmMesh = new THREE.Mesh(charmGeo, this.charmMat);
    charmHolder.add(this.charmMesh);

    const ringGeo = new THREE.TorusGeometry(0.024, 0.006, 6, 12);
    const ring = new THREE.Mesh(ringGeo, this.charmMat);
    ring.position.y = 0.045;
    charmHolder.add(ring);
    this.headGroup.add(charmHolder);

    // 8. Articulated Legs, Feline Thighs & Paws with Pink Beans
    this.frontLeftLeg = this.createForeleg(-0.16, 0.22);
    this.frontRightLeg = this.createForeleg(0.16, 0.22);
    this.backLeftLeg = this.createHindleg(-0.18, -0.22);
    this.backRightLeg = this.createHindleg(0.18, -0.22);

    this.body.add(this.frontLeftLeg);
    this.body.add(this.frontRightLeg);
    this.body.add(this.backLeftLeg);
    this.body.add(this.backRightLeg);

    // 9. Smooth 7-Jointed S-Curved Feline Tail
    this.tailBase = new THREE.Group();
    this.tailBase.position.set(0, 0.08, -0.38);
    this.body.add(this.tailBase);

    let parentJoint: THREE.Group = this.tailBase;
    const segCount = 7;
    for (let i = 0; i < segCount; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, 0.045, -0.055);

      const rTop = 0.044 * (1.0 - i * 0.10);
      const rBot = 0.046 * (1.0 - (i - 1) * 0.10);
      const segMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, 0.085, 10),
        this.furMat
      );
      segMesh.position.y = 0.042;
      segMesh.castShadow = true;
      segGroup.add(segMesh);

      // Rounded tip on the last segment
      if (i === segCount - 1) {
        const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(rTop * 1.05, 10, 10), this.whiteMat);
        tipMesh.position.y = 0.085;
        segGroup.add(tipMesh);
      }

      parentJoint.add(segGroup);
      this.tailSegments.push(segGroup);
      parentJoint = segGroup;
    }

    // 10. DUAL FISHING ROD MOUNTS (BACK HOLSTER & PAW GRIP)
    // Mount A: Back Holster (Used during exploring / walking / running)
    this.backRodMount = new THREE.Group();
    this.backRodMount.position.set(0.12, 0.20, -0.10);
    this.body.add(this.backRodMount);

    // Holster harness strap across torso
    const strapGeo = new THREE.TorusGeometry(0.38, 0.016, 6, 24);
    strapGeo.rotateX(Math.PI / 4);
    const strap = new THREE.Mesh(strapGeo, this.rodGripMat);
    this.backRodMount.add(strap);

    const backAssembly = this.createMasterFishingRodAssembly();
    this.backRodMesh = backAssembly.rodGroup;
    this.backReel = backAssembly.reel;
    // Angle upward and backward over shoulder safely clear of head!
    this.backRodMesh.rotation.set(-0.72, 0.24, -0.38);
    this.backRodMount.add(this.backRodMesh);
    this.backRodTip = this.backRodMesh.getObjectByName('rodTip')!;

    // Mount B: Paw Grip Mount (Used during active fishing / aiming / reeling)
    this.pawRodMount = new THREE.Group();
    this.pawRodMount.position.set(0, -0.22, 0.08);
    this.frontRightLeg.add(this.pawRodMount);

    const pawAssembly = this.createMasterFishingRodAssembly();
    this.pawRodMesh = pawAssembly.rodGroup;
    this.pawReel = pawAssembly.reel;
    this.pawRodBlank = pawAssembly.blankGroup;
    this.pawRodMesh.rotation.set(0.48, 0, 0);
    this.pawRodMount.add(this.pawRodMesh);
    this.pawRodTip = this.pawRodMesh.getObjectByName('rodTip')!;

    // Initial state: Holstered neatly on back!
    this.backRodMesh.visible = true;
    this.pawRodMesh.visible = false;

    // 11. Apply initial breed configuration
    this.setBreed(initialBreed);
  }

  // ---------------------------------------------------------------------------
  // HELPER: CREATE EXPRESSIVE ANIME EYE WITH DYNAMIC BLINKING EYELID
  // ---------------------------------------------------------------------------
  private createAnimeEye(x: number, isLeft: boolean): { group: THREE.Group; eyelid: THREE.Mesh } {
    const eyeHolder = new THREE.Group();
    eyeHolder.position.set(x, 0.065, 0.25);
    eyeHolder.rotation.y = isLeft ? -0.15 : 0.15;

    // Sclera (Glossy White Dome)
    const scleraGeo = new THREE.SphereGeometry(0.082, 16, 14);
    scleraGeo.scale(0.95, 1.25, 0.42);
    const sclera = new THREE.Mesh(scleraGeo, this.whiteMat);
    eyeHolder.add(sclera);

    // Luminous Iris Disc
    const eyeMat = isLeft ? this.leftEyeMat : this.rightEyeMat;
    const irisGeo = new THREE.CircleGeometry(0.064, 18);
    const iris = new THREE.Mesh(irisGeo, eyeMat);
    iris.position.set(0, 0, 0.038);
    eyeHolder.add(iris);

    // Dark Vertical Cat Pupil
    const pupilGeo = new THREE.CircleGeometry(0.032, 14);
    pupilGeo.scale(0.60, 0.96, 1.0);
    const pupil = new THREE.Mesh(pupilGeo, this.pupilMat);
    pupil.position.set(0, 0, 0.041);
    eyeHolder.add(pupil);

    // Dual Sparkle Catchlights (Anime Glints)
    const primaryGlint = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10), this.catchlightMat);
    primaryGlint.position.set(isLeft ? -0.022 : -0.016, 0.025, 0.043);
    eyeHolder.add(primaryGlint);

    const secGlint = new THREE.Mesh(new THREE.CircleGeometry(0.009, 8), this.catchlightMat);
    secGlint.position.set(isLeft ? 0.020 : 0.018, -0.022, 0.043);
    eyeHolder.add(secGlint);

    // Soft Upper Eyelash Line Arch
    const lashGeo = new THREE.TorusGeometry(0.076, 0.012, 6, 16, Math.PI * 0.75);
    lashGeo.rotateZ(isLeft ? -Math.PI * 0.88 : Math.PI * 0.12);
    const lash = new THREE.Mesh(lashGeo, this.pupilMat);
    lash.position.set(0, 0.045, 0.035);
    eyeHolder.add(lash);

    // Dynamic Blinking Eyelid (Curved visor that slides over the eye)
    const eyelidGeo = new THREE.SphereGeometry(0.086, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    eyelidGeo.scale(0.96, 1.26, 0.44);
    const eyelid = new THREE.Mesh(eyelidGeo, this.furMat);
    eyelid.position.set(0, 0.04, 0.005);
    eyelid.scale.set(1, 0.01, 1); // Start open
    eyeHolder.add(eyelid);

    this.headGroup.add(eyeHolder);
    return { group: eyeHolder, eyelid };
  }

  // ---------------------------------------------------------------------------
  // HELPER: CREATE SCULPTED FELINE EAR (Organic contour, not primitive cone)
  // ---------------------------------------------------------------------------
  private createSculptedEar(side: number): THREE.Group {
    const ear = new THREE.Group();

    // Outer Ear Shell: Beveled tapered shell
    const outerGeo = new THREE.CylinderGeometry(0.02, 0.14, 0.24, 6);
    outerGeo.scale(1.0, 1.0, 0.65);
    outerGeo.rotateY(side * 0.35);
    const outer = new THREE.Mesh(outerGeo, this.furMat);
    outer.position.y = 0.11;
    outer.castShadow = true;
    ear.add(outer);

    // Inner Ear Hollow (Recessed soft pink cavity)
    const innerGeo = new THREE.CylinderGeometry(0.015, 0.10, 0.18, 5);
    innerGeo.scale(0.9, 1.0, 0.45);
    innerGeo.rotateY(side * 0.35);
    const inner = new THREE.Mesh(innerGeo, this.pinkMat);
    inner.position.set(0, 0.09, 0.035);
    ear.add(inner);

    // Fluffy Ear Tuft at Base of Canal
    const tuftGeo = new THREE.SphereGeometry(0.05, 8, 8);
    tuftGeo.scale(1.0, 0.6, 0.7);
    const tuft = new THREE.Mesh(tuftGeo, this.whiteMat);
    tuft.position.set(0, 0.02, 0.04);
    ear.add(tuft);

    return ear;
  }

  // ---------------------------------------------------------------------------
  // HELPER: CREATE FORELEG WITH ROUNDED PAWS & PINK PAW BEANS
  // ---------------------------------------------------------------------------
  private createForeleg(x: number, z: number): THREE.Group {
    const legGroup = new THREE.Group();
    legGroup.position.set(x, -0.14, z);

    // Shoulder Bulge
    const shoulderGeo = new THREE.SphereGeometry(0.08, 12, 10);
    const shoulder = new THREE.Mesh(shoulderGeo, this.furMat);
    shoulder.position.set(0, 0.06, 0);
    legGroup.add(shoulder);

    // Slender Limb
    const upperGeo = new THREE.CylinderGeometry(0.070, 0.058, 0.25, 10);
    const upper = new THREE.Mesh(upperGeo, this.furMat);
    upper.position.y = -0.11;
    upper.castShadow = true;
    legGroup.add(upper);

    // Rounded Front Paw with Defined Toe Indentations
    const pawGroup = new THREE.Group();
    pawGroup.position.set(0, -0.22, 0.04);

    const pawGeo = new THREE.SphereGeometry(0.082, 14, 10);
    pawGeo.scale(1.0, 0.65, 1.25);
    const paw = new THREE.Mesh(pawGeo, this.whiteMat);
    pawGroup.add(paw);

    // Pink Paw Beans (Pads) Underneath Paw!
    const palmGeo = new THREE.CircleGeometry(0.028, 10);
    palmGeo.rotateX(Math.PI / 2);
    const palm = new THREE.Mesh(palmGeo, this.pinkMat);
    palm.position.set(0, -0.052, 0.01);
    pawGroup.add(palm);

    [-0.032, 0, 0.032].forEach((tx, idx) => {
      const toeGeo = new THREE.CircleGeometry(0.014, 8);
      toeGeo.rotateX(Math.PI / 2);
      const toe = new THREE.Mesh(toeGeo, this.pinkMat);
      toe.position.set(tx, -0.052, idx === 1 ? 0.052 : 0.045);
      pawGroup.add(toe);
    });

    legGroup.add(pawGroup);
    return legGroup;
  }

  // ---------------------------------------------------------------------------
  // HELPER: CREATE HINDLEG WITH CURVED FELINE HAUNCHES & PAWS
  // ---------------------------------------------------------------------------
  private createHindleg(x: number, z: number): THREE.Group {
    const legGroup = new THREE.Group();
    legGroup.position.set(x, -0.14, z);

    // Curved Feline Thigh / Haunch (Signature cat sitting silhouette!)
    const thighGeo = new THREE.SphereGeometry(0.14, 14, 12);
    thighGeo.scale(0.85, 1.25, 1.10);
    const thigh = new THREE.Mesh(thighGeo, this.furMat);
    thigh.position.set(0, 0.04, 0);
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Lower Hock Limb
    const hockGeo = new THREE.CylinderGeometry(0.058, 0.052, 0.22, 10);
    const hock = new THREE.Mesh(hockGeo, this.furMat);
    hock.position.set(0, -0.11, -0.02);
    hock.castShadow = true;
    legGroup.add(hock);

    // Rear Paw with Pink Beans
    const pawGroup = new THREE.Group();
    pawGroup.position.set(0, -0.22, 0.04);

    const pawGeo = new THREE.SphereGeometry(0.080, 14, 10);
    pawGeo.scale(1.0, 0.65, 1.20);
    const paw = new THREE.Mesh(pawGeo, this.whiteMat);
    pawGroup.add(paw);

    const palmGeo = new THREE.CircleGeometry(0.026, 10);
    palmGeo.rotateX(Math.PI / 2);
    const palm = new THREE.Mesh(palmGeo, this.pinkMat);
    palm.position.set(0, -0.052, 0.01);
    pawGroup.add(palm);

    [-0.030, 0, 0.030].forEach((tx, idx) => {
      const toeGeo = new THREE.CircleGeometry(0.013, 8);
      toeGeo.rotateX(Math.PI / 2);
      const toe = new THREE.Mesh(toeGeo, this.pinkMat);
      toe.position.set(tx, -0.052, idx === 1 ? 0.050 : 0.042);
      pawGroup.add(toe);
    });

    legGroup.add(pawGroup);
    return legGroup;
  }

  // ---------------------------------------------------------------------------
  // MASTER FISHING EQUIPMENT: STYLIZED ROD & MECHANICAL SPINNING REEL
  // ---------------------------------------------------------------------------
  private createMasterFishingRodAssembly(): { rodGroup: THREE.Group; blankGroup: THREE.Group; reel: ReelAssembly } {
    const rodGroup = new THREE.Group();

    // 1. Contoured Grip Handle (Butt Cap + Cork Grip + Foregrip)
    const buttCap = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.05, 12), this.rodMetalMat);
    buttCap.position.y = 0.025;
    rodGroup.add(buttCap);

    // Contoured Ergonomic Handle
    const gripGeo = new THREE.CylinderGeometry(0.025, 0.026, 0.24, 12);
    const grip = new THREE.Mesh(gripGeo, this.rodGripMat);
    grip.position.y = 0.17;
    grip.castShadow = true;
    rodGroup.add(grip);

    // Machined Reel Seat with Dual Locking Rings
    const seatGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.12, 12);
    const seat = new THREE.Mesh(seatGeo, this.rodMetalMat);
    seat.position.y = 0.35;
    rodGroup.add(seat);

    // Upper Foregrip
    const foregripGeo = new THREE.CylinderGeometry(0.022, 0.027, 0.09, 12);
    const foregrip = new THREE.Mesh(foregripGeo, this.rodGripMat);
    foregrip.position.y = 0.455;
    rodGroup.add(foregrip);

    // 2. Tapered Starlight Rod Blank (Smooth multi-stage blank with arc flex)
    const blankGroup = new THREE.Group();
    blankGroup.position.y = 0.50;
    rodGroup.add(blankGroup);

    const blankGeo = new THREE.CylinderGeometry(0.007, 0.020, 1.45, 10);
    const blank = new THREE.Mesh(blankGeo, this.rodBlankMat);
    blank.position.y = 0.725;
    blank.castShadow = true;
    blankGroup.add(blank);

    // 4 Chrome Guide Eyelets with Ceramic Ring Liners
    [0.25, 0.60, 0.98, 1.35].forEach((gy, idx) => {
      const guideSize = 0.028 * (1.0 - idx * 0.18);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(guideSize, 0.004, 6, 14), this.rodMetalMat);
      ring.position.set(0.016 + idx * 0.002, gy, 0);
      ring.rotation.y = Math.PI / 2;
      blankGroup.add(ring);
    });

    // Glowing Starlight Crystal Tip Top Guide (The anchor for the fishing line!)
    const tipTopHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8), this.rodMetalMat);
    tipTopHolder.position.y = 1.47;
    blankGroup.add(tipTopHolder);

    const tipCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.052), this.tipCrystalMat);
    tipCrystal.name = 'rodTip';
    tipCrystal.position.y = 1.50;
    blankGroup.add(tipCrystal);

    // 3. AUTHENTIC MECHANICAL SPINNING REEL (Phase 7 Requirement!)
    const reelGroup = new THREE.Group();
    reelGroup.position.set(0.048, 0.35, 0); // Mounted cleanly on reel seat
    rodGroup.add(reelGroup);

    // Reel Mounting Stem & Foot
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08, 0.024), this.rodMetalMat);
    foot.position.set(-0.012, 0, 0);
    reelGroup.add(foot);

    const stemGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.07, 8);
    const stem = new THREE.Mesh(stemGeo, this.rodMetalMat);
    stem.position.set(0.015, -0.02, 0);
    stem.rotation.z = -0.4;
    reelGroup.add(stem);

    // Gearbox Main Housing Body (Teardrop mechanical shape)
    const gearboxGeo = new THREE.SphereGeometry(0.048, 14, 12);
    gearboxGeo.scale(1.2, 0.9, 0.75);
    const gearbox = new THREE.Mesh(gearboxGeo, this.reelBodyMat);
    gearbox.position.set(0.042, -0.045, 0);
    gearbox.castShadow = true;
    reelGroup.add(gearbox);

    // Rear Drag Adjustment Knob
    const dragKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.022, 10), this.rodMetalMat);
    dragKnob.position.set(0.042, -0.085, 0);
    reelGroup.add(dragKnob);

    // U-Shaped Rotor & Semicircular Bail Wire
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.04, 12), this.reelBodyMat);
    rotor.position.set(0.042, -0.015, 0);
    reelGroup.add(rotor);

    const bailGeo = new THREE.TorusGeometry(0.046, 0.004, 6, 16, Math.PI);
    const bail = new THREE.Mesh(bailGeo, this.rodMetalMat);
    bail.position.set(0.042, -0.005, 0);
    bail.rotation.x = Math.PI / 2;
    reelGroup.add(bail);

    // Two-Tier Spool Wrapped with Luminous Celestial Line
    const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.040, 0.05, 12), this.reelSpoolMat);
    spool.position.set(0.042, 0.025, 0);
    reelGroup.add(spool);

    // Wound Fishing Line Band around Spool
    const lineWound = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.032, 12), this.lineMat);
    lineWound.position.set(0.042, 0.025, 0);
    reelGroup.add(lineWound);

    // Offset Crank Handle Assembly (Cranks during active reeling minigame!)
    const crankGroup = new THREE.Group();
    crankGroup.position.set(0.042, -0.045, 0.045); // Left-side crank spindle
    reelGroup.add(crankGroup);

    // Crank Spindle Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8), this.rodMetalMat);
    hub.rotation.x = Math.PI / 2;
    crankGroup.add(hub);

    // Offset Crank Arm
    const armGeo = new THREE.BoxGeometry(0.012, 0.085, 0.008);
    const arm = new THREE.Mesh(armGeo, this.rodMetalMat);
    arm.position.set(0, 0.035, 0.014);
    crankGroup.add(arm);

    // Contoured Ergonomic Grip Knob
    const knobGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.038, 10);
    const knob = new THREE.Mesh(knobGeo, this.rodGripMat);
    knob.position.set(0, 0.070, 0.030);
    knob.rotation.x = Math.PI / 2;
    crankGroup.add(knob);

    return {
      rodGroup,
      blankGroup,
      reel: {
        group: reelGroup,
        crankGroup,
        spoolMesh: spool,
        bailMesh: bail
      }
    };
  }

  // ---------------------------------------------------------------------------
  // EQUIPMENT UPGRADES ENGINE: DYNAMIC TIERS (Level 1 to Level 5)
  // ---------------------------------------------------------------------------
  public setRodTier(level: number): void {
    this.currentRodTier = level;
    this.updateRodTierMaterials(level);
  }

  private updateRodTierMaterials(level: number): void {
    if (level === 1) {
      // Tier 1: Starlight Timber (Rustic walnut, brushed brass, sapphire crystal)
      this.rodBlankMat.color.setHex(0x3b240f);
      this.rodGripMat.color.setHex(0x5c3a21);
      this.rodMetalMat.color.setHex(0xd4af37); // Brass
      this.reelBodyMat.color.setHex(0xb48a28);
      this.reelSpoolMat.color.setHex(0xe5c158);
      this.tipCrystalMat.color.setHex(0x38bdf8);
      this.tipCrystalMat.emissive.setHex(0x0284c7);
      this.tipCrystalMat.emissiveIntensity = 0.8;
    } else if (level === 2) {
      // Tier 2: Moonlit Silver (Pearl grip, polished chrome/silver, aquamarine crystal)
      this.rodBlankMat.color.setHex(0x1e293b);
      this.rodGripMat.color.setHex(0x475569);
      this.rodMetalMat.color.setHex(0xe2e8f0); // Silver
      this.reelBodyMat.color.setHex(0x94a3b8);
      this.reelSpoolMat.color.setHex(0xcbd5e1);
      this.tipCrystalMat.color.setHex(0x67e8f9);
      this.tipCrystalMat.emissive.setHex(0x06b6d4);
      this.tipCrystalMat.emissiveIntensity = 0.9;
    } else if (level === 3) {
      // Tier 3: Nebula Amethyst (Indigo blank, royal purple/gold reel, radiant magenta crystal)
      this.rodBlankMat.color.setHex(0x2e1065);
      this.rodGripMat.color.setHex(0x3b0764);
      this.rodMetalMat.color.setHex(0xfbbf24); // Gold accents
      this.reelBodyMat.color.setHex(0x7e22ce); // Amethyst
      this.reelSpoolMat.color.setHex(0xa855f7);
      this.tipCrystalMat.color.setHex(0xf472b6);
      this.tipCrystalMat.emissive.setHex(0xdb2777);
      this.tipCrystalMat.emissiveIntensity = 1.0;
    } else if (level === 4) {
      // Tier 4: Comet Ember (Solar obsidian blank, pure celestial gold reel, sunburst crystal)
      this.rodBlankMat.color.setHex(0x09090b);
      this.rodGripMat.color.setHex(0x713f12);
      this.rodMetalMat.color.setHex(0xf59e0b);
      this.reelBodyMat.color.setHex(0xfbbf24); // Celestial Gold
      this.reelSpoolMat.color.setHex(0xfde047);
      this.tipCrystalMat.color.setHex(0xfacc15);
      this.tipCrystalMat.emissive.setHex(0xd97706);
      this.tipCrystalMat.emissiveIntensity = 1.1;
    } else {
      // Tier 5: Celestial Prism (Astral white, iridescent prism rainbow, diamond prism crystal)
      this.rodBlankMat.color.setHex(0xf8fafc);
      this.rodGripMat.color.setHex(0x38bdf8);
      this.rodMetalMat.color.setHex(0xe0e7ff);
      this.reelBodyMat.color.setHex(0xc084fc);
      this.reelSpoolMat.color.setHex(0x38bdf8);
      this.tipCrystalMat.color.setHex(0xffffff);
      this.tipCrystalMat.emissive.setHex(0x38bdf8);
      this.tipCrystalMat.emissiveIntensity = 1.3;
    }
  }

  // ---------------------------------------------------------------------------
  // BREED CUSTOMIZATION ENGINE
  // ---------------------------------------------------------------------------
  public setBreed(breed: CatBreed): void {
    this.currentBreed = breed;

    this.calicoPatches.forEach(p => p.parent?.remove(p));
    this.calicoPatches = [];

    this.fluffyRuffs.forEach(f => f.parent?.remove(f));
    this.fluffyRuffs = [];

    if (breed === 'celestial') {
      // 1. Purrseid Celestial (Soft cosmic lilac, luminous cyan eyes, gold star bell)
      this.furMat.color.setHex(0xa59ad8);
      this.furMat.emissive.setHex(0x1e1642);
      this.furMat.emissiveIntensity = 0.25;

      this.whiteMat.color.setHex(0xf5f3ff);
      this.pinkMat.color.setHex(0xf472b6);

      this.leftEyeMat.color.setHex(0x38bdf8);
      this.leftEyeMat.emissive.setHex(0x0284c7);
      this.leftEyeMat.emissiveIntensity = 0.65;

      this.rightEyeMat.color.setHex(0x38bdf8);
      this.rightEyeMat.emissive.setHex(0x0284c7);
      this.rightEyeMat.emissiveIntensity = 0.65;

      this.collarMat.color.setHex(0xfbbf24);
      this.charmMat.color.setHex(0xfde047);
      this.charmMesh.geometry = new THREE.OctahedronGeometry(0.055); // Star Medallion
    } else if (breed === 'calico') {
      // 2. Nebula Calico (Warm porcelain white body with peach and charcoal patches)
      this.furMat.color.setHex(0xfcfaf7);
      this.furMat.emissive.setHex(0x000000);
      this.furMat.emissiveIntensity = 0.0;

      this.whiteMat.color.setHex(0xffffff);
      this.pinkMat.color.setHex(0xfb7185);

      this.leftEyeMat.color.setHex(0xf59e0b);
      this.leftEyeMat.emissive.setHex(0xb45309);
      this.leftEyeMat.emissiveIntensity = 0.45;

      this.rightEyeMat.color.setHex(0xf59e0b);
      this.rightEyeMat.emissive.setHex(0xb45309);
      this.rightEyeMat.emissiveIntensity = 0.45;

      this.collarMat.color.setHex(0xef4444); // Crimson red Japanese ribbon!
      this.charmMat.color.setHex(0xfacc15); // Golden Suzu Bell
      this.charmMesh.geometry = new THREE.SphereGeometry(0.055, 12, 10);

      // Distinct Calico Coat Patches
      const patch1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), this.patchMatPeach);
      patch1.position.set(0.14, 0.12, 0.12);
      patch1.scale.set(1.0, 0.8, 0.9);
      this.headGroup.add(patch1);
      this.calicoPatches.push(patch1);

      const patch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.145, 0.245, 6), this.patchMatCharcoal);
      patch2.scale.set(1.0, 1.0, 0.65);
      patch2.position.set(-0.19, 0.27, 0.03);
      patch2.rotation.set(0.08, 0.12, 0.24);
      this.headGroup.add(patch2);
      this.calicoPatches.push(patch2);

      const patch3 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), this.patchMatCharcoal);
      patch3.position.set(-0.18, 0.08, -0.16);
      this.body.add(patch3);
      this.calicoPatches.push(patch3);

      const patch4 = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 10), this.patchMatPeach);
      patch4.position.set(0.12, 0.15, 0.05);
      this.body.add(patch4);
      this.calicoPatches.push(patch4);
    } else if (breed === 'kuro') {
      // 3. Moonlit Kuro (Velvety void black, white socks, emerald eyes, silver moon charm)
      this.furMat.color.setHex(0x1a1829);
      this.furMat.emissive.setHex(0x0e0c1a);
      this.furMat.emissiveIntensity = 0.2;

      this.whiteMat.color.setHex(0xffffff); // Crisp white socks!
      this.pinkMat.color.setHex(0xa855f7);

      this.leftEyeMat.color.setHex(0x10b981); // Emerald jewel eyes
      this.leftEyeMat.emissive.setHex(0x059669);
      this.leftEyeMat.emissiveIntensity = 0.7;

      this.rightEyeMat.color.setHex(0x10b981);
      this.rightEyeMat.emissive.setHex(0x059669);
      this.rightEyeMat.emissiveIntensity = 0.7;

      this.collarMat.color.setHex(0xa855f7); // Royal lavender collar
      this.charmMat.color.setHex(0xe0e7ff); // Silver crescent moon
      this.charmMesh.geometry = new THREE.TorusGeometry(0.05, 0.015, 6, 16, Math.PI * 1.3);
    } else if (breed === 'cloud') {
      // 4. Fluffy Cloud (Cloud marshmallow white, heterochromia eyes: blue & gold!)
      this.furMat.color.setHex(0xfffaf0);
      this.furMat.emissive.setHex(0x1f1a10);
      this.furMat.emissiveIntensity = 0.12;

      this.whiteMat.color.setHex(0xffffff);
      this.pinkMat.color.setHex(0xfbcfe8);

      // Heterochromia: Left Eye is Sapphire Blue, Right Eye is Celestial Gold!
      this.leftEyeMat.color.setHex(0x2563eb);
      this.leftEyeMat.emissive.setHex(0x1d4ed8);
      this.leftEyeMat.emissiveIntensity = 0.7;

      this.rightEyeMat.color.setHex(0xf59e0b);
      this.rightEyeMat.emissive.setHex(0xd97706);
      this.rightEyeMat.emissiveIntensity = 0.7;

      this.collarMat.color.setHex(0xf472b6); // Pastel pink velvet
      this.charmMat.color.setHex(0xfde047);
      this.charmMesh.geometry = new THREE.OctahedronGeometry(0.055);

      // Extra Fluffy Cheek Ruffs
      [-0.22, 0.22].forEach(fx => {
        const ruffGeo = new THREE.DodecahedronGeometry(0.12, 1);
        ruffGeo.scale(0.8, 1.2, 0.8);
        const ruff = new THREE.Mesh(ruffGeo, this.furMat);
        ruff.position.set(fx, -0.06, 0.08);
        this.headGroup.add(ruff);
        this.fluffyRuffs.push(ruff);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  public setAnimState(state: CatAnimState): void {
    if (this.animState !== state) {
      this.animState = state;
      if (state === 'celebration') {
        this.celebrationTimer = 0;
      }

      // Automatically swap rod visibility between Back Holster and Paw Grip!
      const isFishing = (state === 'fishing_aim' || state === 'fishing_wait' || state === 'fishing_reel');
      this.backRodMesh.visible = !isFishing;
      this.pawRodMesh.visible = isFishing;
    }
  }

  public getRodTipWorldPosition(): THREE.Vector3 {
    this.group.updateMatrixWorld(true);
    const activeTip = this.pawRodMesh.visible ? this.pawRodTip : this.backRodTip;
    const worldPos = new THREE.Vector3();
    activeTip.getWorldPosition(worldPos);
    return worldPos;
  }

  // ---------------------------------------------------------------------------
  // PROCEDURAL ANIMATION LOOPS & REEL CRANKING
  // ---------------------------------------------------------------------------
  public update(delta: number, isMoving: boolean, isRunning: boolean): void {
    this.animTimer += delta;

    // 1. Dynamic Natural Blinking (Smoothly closes & opens every 3.5 to 5.0 seconds)
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.8) {
      this.isBlinking = true;
      const bProgress = (this.blinkTimer - 3.8) / this.blinkDuration;
      if (bProgress <= 0.5) {
        // Closing
        const scaleY = THREE.MathUtils.lerp(0.01, 1.0, bProgress * 2.0);
        this.leftEyelid.scale.y = scaleY;
        this.rightEyelid.scale.y = scaleY;
      } else if (bProgress <= 1.0) {
        // Opening
        const scaleY = THREE.MathUtils.lerp(1.0, 0.01, (bProgress - 0.5) * 2.0);
        this.leftEyelid.scale.y = scaleY;
        this.rightEyelid.scale.y = scaleY;
      } else {
        this.leftEyelid.scale.y = 0.01;
        this.rightEyelid.scale.y = 0.01;
        this.isBlinking = false;
        this.blinkTimer = (Math.random() - 0.5) * 1.5; // randomize next blink interval
      }
    }

    // 2. State-Specific Animation
    if (this.animState === 'celebration') {
      this.animateCelebration(delta);
      return;
    }

    if (this.animState === 'fishing_aim') {
      this.animateFishingAim(delta);
      return;
    }

    if (this.animState === 'fishing_wait') {
      this.animateFishingWait(delta);
      return;
    }

    if (this.animState === 'fishing_reel') {
      this.animateFishingReel(delta);
      return;
    }

    // Default: Locomotion
    if (isMoving) {
      this.animateWalkRun(delta, isRunning);
    } else {
      this.animateIdle(delta);
    }
  }

  private animateIdle(delta: number): void {
    const t = this.animTimer;

    // Gentle breathing body oscillation
    const breath = Math.sin(t * 2.2) * 0.014;
    this.body.position.y = 0.42 + breath;
    this.body.rotation.set(0, 0, 0);

    // Cute head tilt and curious look
    this.headGroup.rotation.x = Math.sin(t * 1.4) * 0.04;
    this.headGroup.rotation.y = Math.cos(t * 0.7) * 0.07;
    this.headGroup.rotation.z = Math.sin(t * 0.9) * 0.03;

    // Alert ear twitches
    const twitch = Math.sin(t * 1.1) > 0.96 ? Math.sin(t * 35) * 0.14 : 0;
    this.leftEarGroup.rotation.z = 0.24 + twitch;
    this.rightEarGroup.rotation.z = -0.24 - twitch;

    // Smooth continuous S-curve tail wave
    const tailWag = Math.sin(t * 2.8) * 0.28;
    this.tailBase.rotation.y = tailWag;
    this.tailBase.rotation.x = 0.15;

    this.tailSegments.forEach((seg, i) => {
      seg.rotation.y = tailWag * (0.42 + i * 0.08);
      seg.rotation.x = -0.10 + Math.sin(t * 2.4 - i * 0.35) * 0.08;
    });

    // Reset legs to solid ground stance
    const damp = delta * 8;
    this.frontLeftLeg.rotation.x = THREE.MathUtils.lerp(this.frontLeftLeg.rotation.x, 0, damp);
    this.frontRightLeg.rotation.x = THREE.MathUtils.lerp(this.frontRightLeg.rotation.x, 0, damp);
    this.backLeftLeg.rotation.x = THREE.MathUtils.lerp(this.backLeftLeg.rotation.x, 0, damp);
    this.backRightLeg.rotation.x = THREE.MathUtils.lerp(this.backRightLeg.rotation.x, 0, damp);
  }

  private animateWalkRun(delta: number, isRunning: boolean): void {
    const freq = isRunning ? 15.0 : 8.5;
    const legAngle = isRunning ? 0.70 : 0.42;
    const cycle = this.animTimer * freq;

    // Quadruped diagonal gait (FL with BR, FR with BL)
    const s1 = Math.sin(cycle) * legAngle;
    const s2 = Math.sin(cycle + Math.PI) * legAngle;

    this.frontLeftLeg.rotation.x = s1;
    this.frontRightLeg.rotation.x = s2;
    this.backLeftLeg.rotation.x = s2 * 0.88;
    this.backRightLeg.rotation.x = s1 * 0.88;

    // Natural body bobbing and weight shift
    const bob = Math.abs(Math.sin(cycle)) * (isRunning ? 0.07 : 0.035);
    this.body.position.y = 0.42 + bob;
    this.body.rotation.z = Math.sin(cycle * 0.5) * 0.035;
    this.body.rotation.x = isRunning ? 0.10 : 0.04;

    // Dynamic tail stream while running
    this.tailBase.rotation.x = isRunning ? 0.45 : 0.22;
    this.tailBase.rotation.y = Math.sin(cycle * 0.5) * 0.25;

    // Head stabilization
    this.headGroup.rotation.x = -this.body.rotation.x * 0.5;
  }

  private animateFishingAim(delta: number): void {
    const damp = delta * 8;
    // Cat sits gracefully on haunches
    this.body.position.y = THREE.MathUtils.lerp(this.body.position.y, 0.35, damp);
    this.body.rotation.x = THREE.MathUtils.lerp(this.body.rotation.x, -0.32, damp);

    // Front right paw raises the rod forward towards the water!
    this.frontRightLeg.rotation.x = THREE.MathUtils.lerp(this.frontRightLeg.rotation.x, -0.65, damp);
    this.pawRodMount.rotation.x = THREE.MathUtils.lerp(this.pawRodMount.rotation.x, -0.55, damp);
    this.pawRodMount.rotation.y = THREE.MathUtils.lerp(this.pawRodMount.rotation.y, 0.12, damp);

    this.tailBase.rotation.x = THREE.MathUtils.lerp(this.tailBase.rotation.x, -0.35, damp);
  }

  private animateFishingWait(delta: number): void {
    const t = this.animTimer;
    this.body.position.y = 0.34;
    this.body.rotation.x = -0.34;

    // Ears alertly perked forward towards the Starpond
    this.leftEarGroup.rotation.x = 0.22;
    this.rightEarGroup.rotation.x = 0.22;

    // Holding rod angled towards galaxy pool with gentle starlight breathing oscillation
    this.frontRightLeg.rotation.x = -0.60;
    this.pawRodMount.rotation.x = -0.48 + Math.sin(t * 1.5) * 0.03;

    // Gentle tail flick against the ground
    this.tailBase.rotation.y = Math.sin(t * 1.6) * 0.22;

    // Reel handle rests stationary
    this.pawReel.crankGroup.rotation.x = 0;
  }

  private animateFishingReel(delta: number): void {
    const t = this.animTimer * 16.0;
    const bend = Math.sin(t) * 0.14;

    // Tense reeling posture: rod bends back and forth!
    this.body.position.y = 0.35 + Math.sin(t * 0.5) * 0.015;
    this.body.rotation.x = -0.38;

    this.frontRightLeg.rotation.x = -0.70 + Math.sin(t) * 0.25;
    this.pawRodMount.rotation.x = 0.25 + bend;
    this.pawRodMount.rotation.z = Math.cos(t) * 0.08;

    // Left paw interacts with the reel crank!
    this.frontLeftLeg.rotation.x = -0.55 + Math.sin(t * 1.5) * 0.20;

    // HIGH PRIORITY: Mechanical Spinning Reel actively cranks and spool oscillates!
    this.pawReel.crankGroup.rotation.x += delta * 24.0;
    this.pawReel.spoolMesh.position.y = 0.025 + Math.sin(this.animTimer * 12.0) * 0.012; // reciprocating line stroke!
    
    // Dynamic rod blank tip flex under fish tension!
    this.pawRodBlank.rotation.x = -0.15 + Math.sin(t) * 0.06;
  }

  private animateCelebration(delta: number): void {
    this.celebrationTimer += delta;
    const t = this.celebrationTimer;

    // Joyous victory leaps!
    const jump = Math.abs(Math.sin(t * 6.0)) * 0.42;
    this.body.position.y = 0.42 + jump;

    // Front paws raised high in happy cheer!
    this.frontLeftLeg.rotation.x = -1.2;
    this.frontRightLeg.rotation.x = -1.2;

    // Happy tail whirl
    this.tailBase.rotation.y = t * 14.0;

    if (t > 2.8) {
      this.setAnimState('idle');
    }
  }
}
