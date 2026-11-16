/**
 * InputManager2D.ts
 * Unified 2D Input controller supporting Keyboard (WASD/Arrows), Virtual Joystick, and Touch.
 */

export class InputManager2D {
  private keys: Record<string, boolean> = {};
  private virtualJoystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private virtualIsRunning: boolean = false;
  private isMovementLocked: boolean = false;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Reset keys on window blur to prevent sticky movement
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  public setMovementLocked(locked: boolean): void {
    this.isMovementLocked = locked;
  }

  public setVirtualJoystick(vector: { x: number; y: number }, isRunning: boolean): void {
    this.virtualJoystickVector = vector;
    this.virtualIsRunning = isRunning;
  }

  public getMovementVector(): { dx: number; dy: number; isRunning: boolean } {
    if (this.isMovementLocked) {
      return { dx: 0, dy: 0, isRunning: false };
    }

    let dx = 0;
    let dy = 0;

    // Keyboard Input
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Normalize diagonal keyboard speed
    const len = Math.hypot(dx, dy);
    if (len > 0.05) {
      dx /= len;
      dy /= len;
    }

    // Blend with Virtual Mobile Joystick if active
    const joyLen = Math.hypot(this.virtualJoystickVector.x, this.virtualJoystickVector.y);
    if (joyLen > 0.05) {
      dx = this.virtualJoystickVector.x;
      dy = this.virtualJoystickVector.y;
    }

    const isRunning = (!!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'] || !!this.keys['KeyQ']) || this.virtualIsRunning;

    return { dx, dy, isRunning };
  }

  public isActionPressed(): boolean {
    return !!this.keys['Space'] || !!this.keys['KeyE'];
  }
}
