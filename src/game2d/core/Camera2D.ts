/**
 * Camera2D.ts
 * Pure 2D Top-Down Orthographic Camera for Wish Me Cat 2D.
 * Smoothly tracks the player cat with boundary clamping and screen shake.
 */

export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 2.5; // Pixel integer zoom ratio for crisp pixel art

  // Viewport dimensions
  public viewportWidth: number = 800;
  public viewportHeight: number = 600;

  // Smoothing
  public lerpSpeed: number = 6.0;

  // Clamping Bounds (Island Map Coordinates)
  public minX: number = -600;
  public maxX: number = 600;
  public minY: number = -500;
  public maxY: number = 500;

  // Screen Shake
  private shakeDuration: number = 0;
  private shakeIntensity: number = 0;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;

    // Adapt zoom based on screen size (keeps pixel art scale consistent on desktop and mobile)
    if (width < 600 || height < 500) {
      this.zoom = 2.0;
    } else if (width > 1600) {
      this.zoom = 3.0;
    } else {
      this.zoom = 2.5;
    }
  }

  public setBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public shake(duration: number, intensity: number): void {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  public update(targetX: number, targetY: number, delta: number, lookaheadX: number = 0, lookaheadY: number = 0): void {
    // Smooth exponential damping follow (framerate-independent, buttery-smooth lerp)
    const t = 1.0 - Math.exp(-this.lerpSpeed * delta);
    const destX = targetX + lookaheadX;
    const destY = targetY + lookaheadY;
    this.x += (destX - this.x) * t;
    this.y += (destY - this.y) * t;

    // Clamp to map boundaries
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
    this.y = Math.max(this.minY, Math.min(this.maxY, this.y));

    // Handle screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= delta;
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  // World to Screen transformation
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const screenX = (worldX - this.x + this.shakeOffsetX) * this.zoom + this.viewportWidth / 2;
    const screenY = (worldY - this.y + this.shakeOffsetY) * this.zoom + this.viewportHeight / 2;
    return { x: Math.floor(screenX), y: Math.floor(screenY) };
  }

  // Screen to World transformation (e.g. mouse click or touch to world coordinates)
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const worldX = (screenX - this.viewportWidth / 2) / this.zoom + this.x;
    const worldY = (screenY - this.viewportHeight / 2) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }
}
