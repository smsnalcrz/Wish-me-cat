/**
 * GameEngine2D.ts
 * Main Pure 2D Game Engine Loop for Wish Me Cat.
 * Coordinates pixel rendering, camera, input, physics, fishing, and station interactions.
 */

import { Camera2D } from './Camera2D';
import { InputManager2D } from './InputManager2D';
import { IslandMap2D } from '../world/IslandMap2D';
import { PixelCat } from '../entities/PixelCat';
import { Bobber2D } from '../entities/Bobber2D';
import { FishingSystem2D, MinigameState2D } from '../fishing/FishingSystem2D';
import { InteractiveStation2D } from '../world/Station2D';
import { GameState, CatchResult, CatBreed } from '../../types/game';
import { getEquippedRod } from '../../data/equipment';
import { SaveManager } from '../../systems/save/SaveManager';

export interface GameEngine2DCallbacks {
  onStateChange: (state: GameState) => void;
  onPromptChange: (prompt: string | null) => void;
  onMinigameUpdate: (mg: MinigameState2D) => void;
  onCatchSuccess: (result: CatchResult) => void;
  onNotification: (title: string, msg: string) => void;
}

export class GameEngine2D {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public camera: Camera2D;
  public input: InputManager2D;
  public map: IslandMap2D;
  public cat: PixelCat;
  public bobber: Bobber2D;
  public fishing: FishingSystem2D;

  private isRunning: boolean = false;
  private lastTime: number = 0;
  private lastTouchTime: number = 0;
  private animFrameId: number | null = null;
  private callbacks: GameEngine2DCallbacks;

  // Active Interactive Station Prompt
  public currentPromptStation: InteractiveStation2D | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngine2DCallbacks, initialBreed: CatBreed = 'celestial', initialRegion: string = 'region_moonpool') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = callbacks;

    // Viewport & Camera
    this.camera = new Camera2D(canvas.clientWidth || 800, canvas.clientHeight || 600);
    this.input = new InputManager2D();
    this.map = new IslandMap2D();
    this.map.setRegion(initialRegion);

    // Entities
    const initialSave = SaveManager.getData();
    const initialRod = getEquippedRod(initialSave);
    this.cat = new PixelCat(initialBreed, 0, 180, initialRod.rodColor);
    this.bobber = new Bobber2D();
    this.fishing = new FishingSystem2D(this.cat, this.bobber, this.map.water);

    // Wire Callbacks
    this.fishing.onStateChange = callbacks.onStateChange;
    this.fishing.onMinigameUpdate = callbacks.onMinigameUpdate;
    this.fishing.onCatchSuccess = callbacks.onCatchSuccess;
    this.fishing.onNotification = callbacks.onNotification;

    this.setupListeners();
    this.resize();
  }

  private setupListeners(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);

    // Click and touch handler for interactions, cat petting, and minigames
    const handlePointerAction = (clientX: number, clientY: number) => {
      if (this.fishing.state === 'minigame') {
        this.fishing.handleActionInput();
      } else if (this.fishing.state === 'exploring') {
        // Check if user clicked/tapped directly on the cat to pet it!
        const rect = this.canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        const distToCat = Math.hypot(worldPos.x - this.cat.x, worldPos.y - (this.cat.y - 8));

        if (distToCat <= 24) {
          this.cat.triggerPet();
          return;
        }

        if (this.currentPromptStation) {
          this.triggerCurrentInteraction();
        }
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      // Suppress simulated compatibility mousedown events fired by mobile browsers after touchstart
      if (performance.now() - this.lastTouchTime < 500) return;
      if (e.button === 0) {
        handlePointerAction(e.clientX, e.clientY);
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.lastTouchTime = performance.now();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerAction(touch.clientX, touch.clientY);
      }
    }, { passive: true });
  }

  private handleResize = (): void => {
    this.resize();
  };

  public resize(): void {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement?.getBoundingClientRect() || this.canvas.getBoundingClientRect();
    const width = Math.floor(rect.width || window.innerWidth);
    const height = Math.floor(rect.height || window.innerHeight);

    // Use device pixel ratio supporting up to 3x Retina Super XDR displays (iPhone 12/13/14/15/16 Pro)
    // Eliminates 1.5x fractional GPU upscaling blur and jagged stair-stepping
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(Math.max(rawDpr, 1), 3);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = false;

    this.camera.resize(width, height);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
  }

  public setCatBreed(breed: CatBreed): void {
    this.cat.setBreed(breed);
  }

  public setRegion(regionId: string): void {
    this.map.setRegion(regionId);
  }

  public triggerCurrentInteraction(): void {
    const station = this.currentPromptStation;
    if (!station) return;

    if (station.type === 'pier') {
      this.fishing.startFishing(station);
    } else if (station.id === 'station_shop') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'shop' }));
    } else if (station.id === 'station_quests') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'quests' }));
    } else if (station.id === 'station_constellations') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'constellations' }));
    } else if (station.id === 'station_collection') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'collection' }));
    } else if (station.id === 'station_portal') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'regions' }));
    } else if (station.id === 'station_wishing') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'wishing' }));
    }
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(delta, currentTime / 1000);
    this.render(currentTime / 1000);

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(delta: number, time: number): void {
    // 1. Gather player movement input
    const isExploring = this.fishing.state === 'exploring';
    const moveInput = isExploring ? this.input.getMovementVector() : { dx: 0, dy: 0, isRunning: false };

    // 2. Update Cat & resolve map collisions
    this.cat.update(delta, moveInput);
    if (isExploring) {
      this.map.resolveCollision(this.cat);
    }

    // 3. Update Camera (with gentle directional lookahead smoothing)
    let lookX = 0;
    let lookY = 0;
    if (Math.abs(this.cat.vx) > 8) {
      lookX = Math.sign(this.cat.vx) * 16;
    }
    if (Math.abs(this.cat.vy) > 8) {
      lookY = Math.sign(this.cat.vy) * 14;
    }
    this.camera.update(this.cat.x, this.cat.y, delta, lookX, lookY);

    // 4. Update Map & Water effects
    this.map.update(delta);

    // 5. Update Fishing system
    this.fishing.update(delta);

    // 6. Proximity to Stations & Piers
    if (isExploring) {
      const nearest = this.map.stationManager.getNearestStation(this.cat.x, this.cat.y);
      this.currentPromptStation = nearest;
      this.callbacks.onPromptChange(nearest ? nearest.prompt : null);
    } else {
      this.currentPromptStation = null;
      this.callbacks.onPromptChange(null);
    }
  }

  private render(time: number): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // Enforce crisp pixel art nearest-neighbor rendering on every frame (prevents iOS Safari reset)
    if (this.ctx.imageSmoothingEnabled) {
      this.ctx.imageSmoothingEnabled = false;
    }

    this.ctx.clearRect(0, 0, width, height);

    // 1. Render Background & Base Island Terrain
    this.map.renderBase(this.ctx, this.camera, time);

    // 2. Render Fishing Line (under entities if casting)
    if (this.bobber.isVisible) {
      const curSave = SaveManager.getData();
      const equippedRod = getEquippedRod(curSave);
      const tip = this.cat.getRodTipWorldPos();
      this.bobber.renderLine(this.ctx, this.camera, tip.x, tip.y, equippedRod.lineColor);
      this.bobber.renderBobber(this.ctx, this.camera);
    }

    // 3. Render Y-Sorted Entities (Cat, Stations, Props)
    this.map.renderYSorted(this.ctx, this.camera, this.cat, this.currentPromptStation, time);

    // 4. Render Dynamic Ambient Night Lighting Overlay
    this.map.renderLightingOverlay(this.ctx, this.camera, time);
  }

  public updateEquippedGear(): void {
    const curSave = SaveManager.getData();
    const equippedRod = getEquippedRod(curSave);
    this.cat.setEquippedRodColor(equippedRod.rodColor);
  }
}
