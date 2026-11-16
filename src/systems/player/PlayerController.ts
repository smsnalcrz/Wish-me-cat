import * as THREE from 'three';
import { CatCharacter } from './CatCharacter';
import { WORLD_LAYOUT, FishingAnchor } from '../../data/worldLayout';
import { HubInteractable } from '../world/WorldScene';

export class PlayerController {
  public cat: CatCharacter;
  private position: THREE.Vector3 = new THREE.Vector3().copy(WORLD_LAYOUT.island.playerSpawn);
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotationAngle: number = 0;

  // Speeds & Accelerations
  private walkSpeed: number = 4.2;
  private runSpeed: number = 8.0;
  private acceleration: number = 18.0;
  private deceleration: number = 20.0;

  // Physical Dimensions
  private playerRadius: number = 0.45;
  private groundY: number = 0.22;

  // State
  private isMovementLocked: boolean = false;
  private isShiftLock: boolean = false;
  private isSprintToggled: boolean = false;
  private keys: Record<string, boolean> = {};
  private virtualJoystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private virtualIsRunning: boolean = false;

  constructor(cat: CatCharacter) {
    this.cat = cat;
    this.position.y = this.groundY;
    this.cat.group.position.copy(this.position);

    this.setupKeyListeners();
  }

  private setupKeyListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Reset pressed keys on window blur or pointer lock change to prevent stuck keys
    window.addEventListener('blur', () => {
      this.keys = {};
    });

    document.addEventListener('pointerlockchange', () => {
      this.keys = {};
    });
  }

  public setShiftLock(enabled: boolean): void {
    this.isShiftLock = enabled;
  }

  public getShiftLock(): boolean {
    return this.isShiftLock;
  }

  public toggleSprint(): boolean {
    this.isSprintToggled = !this.isSprintToggled;
    return this.isSprintToggled;
  }

  public setMovementLocked(locked: boolean): void {
    this.isMovementLocked = locked;
    if (locked) {
      this.velocity.set(0, 0, 0);
    }
  }

  public setVirtualJoystick(vector: { x: number; y: number }, isRunning: boolean): void {
    this.virtualJoystickVector = vector;
    this.virtualIsRunning = isRunning;
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getRotationAngle(): number {
    return this.rotationAngle;
  }

  public setPosition(pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.position.y = this.groundY;
    this.cat.group.position.copy(this.position);
  }

  public facePoint(target: THREE.Vector3): void {
    const dir = target.clone().sub(this.position);
    dir.y = 0;
    if (dir.lengthSq() > 0.001) {
      this.rotationAngle = Math.atan2(dir.x, dir.z);
      this.cat.group.rotation.y = this.rotationAngle;
    }
  }

  public alignToAnchor(anchor: FishingAnchor): void {
    this.position.copy(anchor.position);
    this.position.y = this.groundY;
    this.cat.group.position.copy(this.position);

    const dir = anchor.direction;
    this.rotationAngle = Math.atan2(dir.x, dir.z);
    this.cat.group.rotation.y = this.rotationAngle;
  }

  public checkInteractables(interactables: HubInteractable[]): HubInteractable | null {
    let closest: HubInteractable | null = null;
    let closestDist = Infinity;

    for (const item of interactables) {
      const dist = this.position.distanceTo(item.position);
      if (dist <= item.radius && dist < closestDist) {
        closest = item;
        closestDist = dist;
      }
    }

    return closest;
  }

  public findNearestFishingAnchor(): FishingAnchor | null {
    let nearest: FishingAnchor | null = null;
    let nearestDist = Infinity;

    for (const anchor of WORLD_LAYOUT.fishingAnchors) {
      const dist = this.position.distanceTo(anchor.position);
      if (dist < nearestDist) {
        nearest = anchor;
        nearestDist = dist;
      }
    }

    // Only return if player is within interactive proximity of the pier
    return (nearest && nearestDist <= nearest.interactionRadius) ? nearest : null;
  }

  public update(delta: number, cameraYaw: number): { isMoving: boolean; isRunning: boolean } {
    if (this.isMovementLocked) {
      this.cat.update(delta, false, false);
      return { isMoving: false, isRunning: false };
    }

    // 1. Gather directional input (Keyboard and/or Virtual Mobile Joystick)
    let forward = 0;
    let strafe = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafe -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafe += 1;

    // Apply Virtual Joystick if active (Vector Y: -1 is forward, +1 is backward)
    const joyLen = Math.hypot(this.virtualJoystickVector.x, this.virtualJoystickVector.y);
    if (joyLen > 0.05) {
      forward = -this.virtualJoystickVector.y;
      strafe = this.virtualJoystickVector.x;
    }

    const isRunning = (!!this.keys['ControlLeft'] || !!this.keys['ControlRight'] || !!this.keys['KeyQ']) || this.virtualIsRunning || this.isSprintToggled;
    const targetSpeed = isRunning ? this.runSpeed : this.walkSpeed;

    const inputLen = Math.hypot(forward, strafe);
    const targetVel = new THREE.Vector3();

    if (this.isShiftLock) {
      // In Roblox Shift Lock mode: Cat always faces away from camera into the crosshair!
      this.rotationAngle = cameraYaw + Math.PI;
      this.cat.group.rotation.y = this.rotationAngle;

      if (inputLen > 0.05) {
        const normF = forward / inputLen;
        const normS = strafe / inputLen;

        // Camera-relative movements (Forward = into crosshair, Strafe = left/right)
        const moveX = -normF * Math.sin(cameraYaw) - normS * Math.cos(cameraYaw);
        const moveZ = -normF * Math.cos(cameraYaw) + normS * Math.sin(cameraYaw);

        targetVel.set(moveX * targetSpeed, 0, moveZ * targetSpeed);
      }
    } else {
      // Free mode: Cat faces in the direction of movement
      if (inputLen > 0.05) {
        const normF = forward / inputLen;
        const normS = strafe / inputLen;

        const moveX = -normF * Math.sin(cameraYaw) - normS * Math.cos(cameraYaw);
        const moveZ = -normF * Math.cos(cameraYaw) + normS * Math.sin(cameraYaw);

        targetVel.set(moveX * targetSpeed, 0, moveZ * targetSpeed);

        const desiredAngle = Math.atan2(moveX, moveZ);
        const angleDiff = Math.atan2(Math.sin(desiredAngle - this.rotationAngle), Math.cos(desiredAngle - this.rotationAngle));
        this.rotationAngle += angleDiff * Math.min(1.0, delta * 15.0);
        this.cat.group.rotation.y = this.rotationAngle;
      }
    }

    // 2. Acceleration / Deceleration
    const rate = inputLen > 0.05 ? this.acceleration : this.deceleration;
    this.velocity.lerp(targetVel, Math.min(1.0, delta * rate));

    // 3. Move candidate position
    const nextPos = this.position.clone().addScaledVector(this.velocity, delta);
    nextPos.y = this.groundY;

    // 4. Collision with World Structures & Obstacles
    for (const col of WORLD_LAYOUT.colliders) {
      if (col.type === 'cylinder') {
        const radius = (col.radius || 1.5) + this.playerRadius;
        const dx = nextPos.x - col.position.x;
        const dz = nextPos.z - col.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          nextPos.x += (dx / dist) * push;
          nextPos.z += (dz / dist) * push;
        }
      } else if (col.type === 'box' && col.halfExtents) {
        const hx = col.halfExtents.x + this.playerRadius;
        const hz = col.halfExtents.z + this.playerRadius;
        const dx = nextPos.x - col.position.x;
        const dz = nextPos.z - col.position.z;

        if (Math.abs(dx) < hx && Math.abs(dz) < hz) {
          const penX = hx - Math.abs(dx);
          const penZ = hz - Math.abs(dz);
          if (penX < penZ) {
            nextPos.x += Math.sign(dx) * penX;
          } else {
            nextPos.z += Math.sign(dz) * penZ;
          }
        }
      }
    }

    // 5. Lake Rim & Island Outer Perimeter Clamping
    const distFromCenter = Math.hypot(nextPos.x, nextPos.z);

    // Safe shoreline distance: Inner lake radius (6.6) + cat radius (0.45) + edge buffer (0.35) = 7.40m
    // Ensures the cat's body NEVER overlaps into the pond or clips into the shoreline edge!
    const safeShoreRadius = WORLD_LAYOUT.island.innerPoolRadius + this.playerRadius + 0.35;

    // Check if player is on one of the dedicated fishing piers
    let onPier = false;
    let activePierAnchor: FishingAnchor | null = null;
    for (const anchor of WORLD_LAYOUT.fishingAnchors) {
      if (nextPos.distanceTo(anchor.position) < 2.6) {
        onPier = true;
        activePierAnchor = anchor;
        break;
      }
    }

    if (onPier && activePierAnchor) {
      // Standing solidly on wooden pier planks
      nextPos.y = 0.25;

      // Prevent walking past the front tip of the wooden pier
      if (distFromCenter < 4.8) {
        const angle = Math.atan2(nextPos.z, nextPos.x);
        nextPos.x = Math.cos(angle) * 4.8;
        nextPos.z = Math.sin(angle) * 4.8;
      }
    } else {
      // Standing on island ground
      nextPos.y = this.groundY;

      // Inner shoreline boundary clamp (cat stops safely at bank with zero overlap!)
      if (distFromCenter < safeShoreRadius) {
        const angle = Math.atan2(nextPos.z, nextPos.x);
        nextPos.x = Math.cos(angle) * safeShoreRadius;
        nextPos.z = Math.sin(angle) * safeShoreRadius;
      }
    }

    // Outer island edge boundary
    if (distFromCenter > WORLD_LAYOUT.island.outerRadius) {
      const angle = Math.atan2(nextPos.z, nextPos.x);
      nextPos.x = Math.cos(angle) * WORLD_LAYOUT.island.outerRadius;
      nextPos.z = Math.sin(angle) * WORLD_LAYOUT.island.outerRadius;
    }

    // Commit updated position
    this.position.copy(nextPos);
    this.cat.group.position.copy(this.position);

    const isMoving = this.velocity.lengthSq() > 0.05;
    this.cat.update(delta, isMoving, isRunning);

    return { isMoving, isRunning };
  }
}
