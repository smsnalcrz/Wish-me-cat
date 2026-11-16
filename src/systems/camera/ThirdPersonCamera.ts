import * as THREE from 'three';
import { WORLD_LAYOUT } from '../../data/worldLayout';

export type CameraMode = 'exploration' | 'fishing' | 'menu';

export class ThirdPersonCamera {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private domElement: HTMLElement;

  // Camera Mode
  private mode: CameraMode = 'exploration';

  // Spherical Coordinates
  private yaw: number = Math.PI; // Start behind the cat looking forward at the Starpond
  private pitch: number = 0.28; // radians
  private targetDistance: number = 4.8;
  private currentDistance: number = 4.8;

  // Configurable Constraints
  private minPitch: number = 0.08;  // Above ground, no underground clipping
  private maxPitch: number = 1.25;  // High top-down view
  private minDistance: number = 2.0;
  private maxDistance: number = 7.5;

  // Smoothing
  private currentFocus: THREE.Vector3 = new THREE.Vector3();
  private currentCamPos: THREE.Vector3 = new THREE.Vector3();
  private normalHeightOffset: number = 0.65;
  private fishingHeightOffset: number = 1.1;

  // Fishing specific framing
  private targetFishingYaw: number = 0;
  private targetFishingPitch: number = 0.32;
  private targetFishingDistance: number = 4.2;

  // Controls & Pointer Lock / Shift Lock (Roblox Style)
  private sensitivity: number = 0.0022;
  public isPointerLocked: boolean = false;
  public isShiftLock: boolean = false;
  public onShiftLockChange?: (isActive: boolean) => void;
  private isRightMouseDown: boolean = false;
  private shoulderOffset: number = 0.42; // Over-the-shoulder right offset in shift lock

  // Touch Orbit & Pinch Zoom for Mobile
  private activeCameraTouchId: number | null = null;
  private lastTouchPos: { x: number; y: number } = { x: 0, y: 0 };
  private initialPinchDist: number | null = null;

  // Raycaster for obstacle collision
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private collisionMeshes: THREE.Object3D[] = [];

  constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D, domElement: HTMLElement) {
    this.camera = camera;
    this.target = target;
    this.domElement = domElement;

    // Initialize positions
    const initialFocus = this.target.position.clone().add(new THREE.Vector3(0, this.normalHeightOffset, 0));
    this.currentFocus.copy(initialFocus);

    const initX = initialFocus.x + this.currentDistance * Math.sin(this.yaw) * Math.cos(this.pitch);
    const initY = initialFocus.y + this.currentDistance * Math.sin(this.pitch);
    const initZ = initialFocus.z + this.currentDistance * Math.cos(this.yaw) * Math.cos(this.pitch);
    this.currentCamPos.set(initX, initY, initZ);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentFocus);

    this.setupEventListeners();
  }

  public setCollisionMeshes(meshes: THREE.Object3D[]): void {
    this.collisionMeshes = meshes;
  }

  private setupEventListeners(): void {
    // Prevent browser context menu on right-click so right-drag camera orbit is silky smooth
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Right-click drag orbit (Roblox default camera standard)
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
    });

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'menu') return;

      const canOrbit = (this.isShiftLock && this.isPointerLocked) || this.isRightMouseDown;
      if (canOrbit) {
        if (this.mode === 'exploration') {
          this.yaw -= e.movementX * this.sensitivity;
          this.pitch += e.movementY * this.sensitivity;
          this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
        } else if (this.mode === 'fishing') {
          // Very gentle subtle tilt during fishing, never losing lock on the bobber
          this.targetFishingYaw -= e.movementX * (this.sensitivity * 0.25);
          this.targetFishingPitch = THREE.MathUtils.clamp(
            this.targetFishingPitch + e.movementY * (this.sensitivity * 0.25),
            0.15,
            0.65
          );
        }
      }
    });

    // Zoom wheel
    this.domElement.addEventListener('wheel', (e) => {
      if (this.mode === 'menu') return;
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0025;
      this.targetDistance = THREE.MathUtils.clamp(
        this.targetDistance + zoomDelta,
        this.minDistance,
        this.maxDistance
      );
    }, { passive: false });

    // Pointer lock listener
    document.addEventListener('pointerlockchange', () => {
      const hasLock = (document.pointerLockElement === this.domElement);
      this.isPointerLocked = hasLock;
      if (!hasLock && this.isShiftLock) {
        this.isShiftLock = false;
        this.onShiftLockChange?.(false);
      }
    });

    // Mobile Touch Orbit & Pinch Zoom
    this.domElement.addEventListener('touchstart', (e) => {
      if (this.mode === 'menu') return;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        // Only trigger camera orbit if touch is on right 65% of screen (leaves left 35% for joystick!)
        if (touch.clientX > window.innerWidth * 0.35) {
          this.activeCameraTouchId = touch.identifier;
          this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        // Pinch start
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (this.mode === 'menu') return;

      if (e.touches.length === 1 && this.activeCameraTouchId !== null) {
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          if (touch.identifier === this.activeCameraTouchId) {
            const dx = touch.clientX - this.lastTouchPos.x;
            const dy = touch.clientY - this.lastTouchPos.y;
            this.lastTouchPos = { x: touch.clientX, y: touch.clientY };

            const touchSens = this.sensitivity * 2.2;
            if (this.mode === 'exploration') {
              this.yaw -= dx * touchSens;
              this.pitch += dy * touchSens;
              this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
            } else if (this.mode === 'fishing') {
              this.targetFishingYaw -= dx * (touchSens * 0.3);
              this.targetFishingPitch = THREE.MathUtils.clamp(
                this.targetFishingPitch + dy * (touchSens * 0.3),
                0.15,
                0.65
              );
            }
            break;
          }
        }
      } else if (e.touches.length === 2 && this.initialPinchDist !== null) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const diff = (this.initialPinchDist - currentDist) * 0.015;
        this.initialPinchDist = currentDist;

        this.targetDistance = THREE.MathUtils.clamp(
          this.targetDistance + diff,
          this.minDistance,
          this.maxDistance
        );
      }
    }, { passive: true });

    const handleTouchEnd = (e: TouchEvent) => {
      if (this.activeCameraTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.activeCameraTouchId) {
            this.activeCameraTouchId = null;
            break;
          }
        }
      }
      if (e.touches.length < 2) {
        this.initialPinchDist = null;
      }
    };

    this.domElement.addEventListener('touchend', handleTouchEnd);
    this.domElement.addEventListener('touchcancel', handleTouchEnd);
  }

  public requestLock(): void {
    if (this.mode === 'menu') return;
    if (!this.isPointerLocked && document.pointerLockElement !== this.domElement) {
      this.domElement.requestPointerLock().catch(() => {});
    }
  }

  public exitLock(): void {
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
    this.isPointerLocked = false;
  }

  public toggleShiftLock(targetState?: boolean): boolean {
    if (this.mode !== 'exploration') {
      this.isShiftLock = false;
      this.onShiftLockChange?.(false);
      return false;
    }

    const nextState = (targetState !== undefined) ? targetState : !this.isShiftLock;
    this.isShiftLock = nextState;

    if (nextState) {
      if (document.pointerLockElement !== this.domElement) {
        this.domElement.requestPointerLock().catch(() => {});
      }
    } else {
      if (document.pointerLockElement === this.domElement) {
        document.exitPointerLock();
      }
    }

    this.onShiftLockChange?.(this.isShiftLock);
    return this.isShiftLock;
  }

  public setMode(newMode: CameraMode, fishingDirection?: THREE.Vector3): void {
    this.mode = newMode;

    if (newMode === 'menu' || newMode === 'fishing') {
      if (this.isShiftLock) {
        this.isShiftLock = false;
        this.onShiftLockChange?.(false);
      }
      this.exitLock();
    }
    
    if (newMode === 'fishing' && fishingDirection) {
      // Calculate framing angle directly behind the cat looking toward the fishing spot
      const dir = fishingDirection.clone().normalize();
      this.targetFishingYaw = Math.atan2(dir.x, dir.z) + Math.PI;
      this.targetFishingPitch = 0.35;
      this.targetFishingDistance = 4.2;
    }
  }

  public setSensitivity(val: number): void {
    this.sensitivity = 0.0018 * THREE.MathUtils.clamp(val, 0.2, 3.0);
  }

  public getYaw(): number {
    return this.mode === 'fishing' ? this.targetFishingYaw : this.yaw;
  }

  public update(delta: number): void {
    const isFishing = (this.mode === 'fishing');

    // 1. Target Focus Point
    const heightOffset = isFishing ? this.fishingHeightOffset : this.normalHeightOffset;
    const targetFocus = this.target.position.clone().add(new THREE.Vector3(0, heightOffset, 0));

    // Over-the-shoulder right offset when in Roblox Shift Lock mode
    if (this.isShiftLock && !isFishing) {
      const rightDir = new THREE.Vector3(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
      targetFocus.addScaledVector(rightDir, this.shoulderOffset);
    }

    this.currentFocus.lerp(targetFocus, Math.min(1.0, delta * 12.0));

    // 2. Active angles and desired distance
    let activeYaw = this.yaw;
    let activePitch = this.pitch;
    let desiredDist = this.targetDistance;

    if (isFishing) {
      // Smoothly interpolate towards ideal fishing framing
      this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetFishingYaw, Math.min(1.0, delta * 4.5));
      this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetFishingPitch, Math.min(1.0, delta * 4.5));
      activeYaw = this.yaw;
      activePitch = this.pitch;
      desiredDist = this.targetFishingDistance;
    }

    // 3. Obstacle Collision Detection (Raycasting from focus point towards camera)
    const rayDir = new THREE.Vector3(
      Math.sin(activeYaw) * Math.cos(activePitch),
      Math.sin(activePitch),
      Math.cos(activeYaw) * Math.cos(activePitch)
    ).normalize();

    let safeDist = desiredDist;

    // Check collision against world colliders (cylinders/boxes from WORLD_LAYOUT)
    for (const col of WORLD_LAYOUT.colliders) {
      const colPos = col.position;
      const radius = (col.radius || 1.5) + 0.5; // Include camera bounding radius

      // Vector from focus to collider center
      const toCol = colPos.clone().sub(this.currentFocus);
      toCol.y = 0; // Horizontal check
      const proj = toCol.dot(new THREE.Vector3(rayDir.x, 0, rayDir.z).normalize());

      if (proj > 0.5 && proj < safeDist) {
        // Perpendicular distance to ray
        const perpSq = toCol.lengthSq() - proj * proj;
        if (perpSq < radius * radius) {
          const hitDist = Math.max(this.minDistance, proj - radius);
          if (hitDist < safeDist) {
            safeDist = hitDist;
          }
        }
      }
    }

    // Check collision against 3D environment meshes if assigned
    if (this.collisionMeshes.length > 0) {
      this.raycaster.set(this.currentFocus, rayDir);
      this.raycaster.far = desiredDist;
      const hits = this.raycaster.intersectObjects(this.collisionMeshes, true);
      if (hits.length > 0 && hits[0].distance < safeDist) {
        safeDist = Math.max(this.minDistance, hits[0].distance - 0.4);
      }
    }

    // Fast pull-in when blocked, smooth push-out when clear
    const lerpSpeed = (safeDist < this.currentDistance) ? 18.0 : 6.0;
    this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, safeDist, Math.min(1.0, delta * lerpSpeed));

    // 4. Compute Final Camera Position
    const desiredX = this.currentFocus.x + this.currentDistance * Math.sin(activeYaw) * Math.cos(activePitch);
    const desiredY = Math.max(0.4, this.currentFocus.y + this.currentDistance * Math.sin(activePitch));
    const desiredZ = this.currentFocus.z + this.currentDistance * Math.cos(activeYaw) * Math.cos(activePitch);

    const targetCamPos = new THREE.Vector3(desiredX, desiredY, desiredZ);
    this.currentCamPos.lerp(targetCamPos, Math.min(1.0, delta * 12.0));

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentFocus);
  }
}
