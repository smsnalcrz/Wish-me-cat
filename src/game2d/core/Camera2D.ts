/**
 * Camera2D.ts
 * Pure 2D Top-Down Orthographic Camera for Wish Me Cat 2D.
 * Smoothly tracks the player cat with boundary clamping and screen shake.
 */

export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 2.0; // Pixel integer zoom ratio for crisp pixel art

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
    this.resize(viewportWidth, viewportHeight);
  }

  public resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;

    // Integer zoom ratio ensures 100% pixel-perfect edges on all mobile and desktop screens.
    // Eliminates fractional (2.5x) scaling that causes jagged pixel shimmering on Retina/OLED displays.
    if (width < 1350 || height < 750) {
      this.zoom = 2.0; // Clean 2x integer scale for mobile phones, tablets, and small laptops
    } else {
      this.zoom = 3.0; // Clean 3x integer scale for large desktop / 4K displays
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

  // World to Screen transformation with integer-aligned viewport center to prevent sub-pixel jitter
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const halfW = Math.floor(this.viewportWidth / 2);
    const halfH = Math.floor(this.viewportHeight / 2);
    const screenX = Math.round((worldX - this.x + this.shakeOffsetX) * this.zoom) + halfW;
    const screenY = Math.round((worldY - this.y + this.shakeOffsetY) * this.zoom) + halfH;
    return { x: screenX, y: screenY };
  }

  // Screen to World transformation (e.g. mouse click or touch to world coordinates)
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const halfW = Math.floor(this.viewportWidth / 2);
    const halfH = Math.floor(this.viewportHeight / 2);
    const worldX = (screenX - halfW) / this.zoom + this.x;
    const worldY = (screenY - halfH) / this.zoom + this.y;
    return { x: worldX, y: worldY };
  }
}
