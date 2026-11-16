import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WorldScene, HubInteractable } from '../../systems/world/WorldScene';
import { CatCharacter } from '../../systems/player/CatCharacter';
import { PlayerController } from '../../systems/player/PlayerController';
import { ThirdPersonCamera } from '../../systems/camera/ThirdPersonCamera';
import { FishingSystem, MinigameState } from '../../systems/fishing/FishingSystem';
import { WORLD_LAYOUT } from '../../data/worldLayout';
import { GameState, CatchResult, CatBreed } from '../../types/game';
import { REGIONS } from '../../data/regions';

interface GameViewportProps {
  gameState: GameState;
  onStateChange: (state: GameState) => void;
  onPromptChange: (prompt: string | null) => void;
  onMinigameUpdate: (mg: MinigameState) => void;
  onCatchSuccess: (result: CatchResult) => void;
  onNotification: (title: string, msg: string) => void;
  registerFishingSystem: (fs: FishingSystem) => void;
  currentRegionId: string;
  catBreed?: CatBreed;
  rodLevel?: number;
  registerPlayerController?: (pc: PlayerController) => void;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  gameState,
  onStateChange,
  onPromptChange,
  onMinigameUpdate,
  onCatchSuccess,
  onNotification,
  registerFishingSystem,
  registerPlayerController,
  currentRegionId,
  catBreed = 'celestial',
  rodLevel = 1
}) => {
  const [isShiftLock, setIsShiftLock] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<WorldScene | null>(null);
  const cameraCtrlRef = useRef<ThirdPersonCamera | null>(null);
  const fishingRef = useRef<FishingSystem | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const catRef = useRef<CatCharacter | null>(null);
  const currentPromptRef = useRef<HubInteractable | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Three.js High-Performance Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Camera & World
    const camera = new THREE.PerspectiveCamera(54, container.clientWidth / container.clientHeight, 0.1, 450);
    const world = new WorldScene();
    worldRef.current = world;

    // 3. Cat Character & Controller
    const cat = new CatCharacter(catBreed, rodLevel);
    catRef.current = cat;
    world.islandGroup.add(cat.group);

    const player = new PlayerController(cat);
    playerRef.current = player;
    registerPlayerController?.(player);

    const tpCamera = new ThirdPersonCamera(camera, cat.group, container);
    tpCamera.setCollisionMeshes(world.obstacleMeshes);
    cameraCtrlRef.current = tpCamera;

    // Connect Roblox Shift Lock change listener
    tpCamera.onShiftLockChange = (active) => {
      setIsShiftLock(active);
      player.setShiftLock(active);
      window.dispatchEvent(new CustomEvent('shift-lock-changed', { detail: active }));
    };

    // 4. Fishing System
    const fishing = new FishingSystem(
      world.scene,
      cat,
      player,
      (pos) => world.triggerWaterRipple(pos),
      tpCamera
    );
    fishingRef.current = fishing;
    registerFishingSystem(fishing);

    fishing.onStateChange = onStateChange;
    fishing.onMinigameUpdate = onMinigameUpdate;
    fishing.onCatchSuccess = onCatchSuccess;
    fishing.onNotification = onNotification;

    // Initial regional sky & pool colors
    const reg = REGIONS.find(r => r.id === currentRegionId) || REGIONS[0];
    world.setEnvironmentColors(reg.skyColor, reg.poolColor, reg.fogColor, reg.fogDensity);

    // Click handler for minigame actions (does not trap mouse during exploration!)
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        if (fishing.state === 'bite' || fishing.state === 'minigame') {
          fishing.handleActionInput();
        }
      }
    };
    container.addEventListener('mousedown', handlePointerDown);

    // Global Shift Lock event toggle (from HUD or Mobile button)
    const handleShiftLockToggleEvent = () => {
      if (fishing.state === 'exploring') {
        tpCamera.toggleShiftLock();
      }
    };
    window.addEventListener('toggle-shift-lock', handleShiftLockToggleEvent);

    // Keyboard Shift key listener to toggle Shift Lock (like Roblox!)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (fishing.state === 'exploring') {
          tpCamera.toggleShiftLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Responsive window resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Tick Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const animate = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update world (island bob, water shader, swimming star koi)
      world.update(delta);

      // Update player movement (camera-relative)
      const yaw = tpCamera.getYaw();
      player.update(delta, yaw);

      // Check proximity to interactables
      if (fishing.state === 'exploring') {
        const closest = player.checkInteractables(world.interactables);
        currentPromptRef.current = closest;
        onPromptChange(closest ? closest.prompt : null);
      } else {
        currentPromptRef.current = null;
        onPromptChange(null);
      }

      // Update fishing system
      fishing.update(delta);

      // Update camera follow & collision raymarching
      tpCamera.update(delta);

      renderer.render(world.scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-shift-lock', handleShiftLockToggleEvent);
      container.removeEventListener('mousedown', handlePointerDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update region atmosphere if region changes
  useEffect(() => {
    if (worldRef.current) {
      const reg = REGIONS.find(r => r.id === currentRegionId) || REGIONS[0];
      worldRef.current.setEnvironmentColors(reg.skyColor, reg.poolColor, reg.fogColor, reg.fogDensity);
    }
  }, [currentRegionId]);

  // Update cat breed in real-time
  useEffect(() => {
    if (catRef.current && catBreed) {
      catRef.current.setBreed(catBreed);
    }
  }, [catBreed]);

  // Update rod tier in real-time
  useEffect(() => {
    if (catRef.current && rodLevel) {
      catRef.current.setRodTier(rodLevel);
    }
  }, [rodLevel]);

  // Sync camera mode with game state
  useEffect(() => {
    if (!cameraCtrlRef.current) return;
    if (gameState === 'modal_open' || gameState === 'paused') {
      cameraCtrlRef.current.setMode('menu');
    } else if (gameState === 'exploring') {
      cameraCtrlRef.current.setMode('exploration');
    }
  }, [gameState]);

  const handleInteractionTrigger = () => {
    const promptItem = currentPromptRef.current;
    if (!promptItem || !fishingRef.current) return;

    // Check if it's one of the dedicated fishing piers or general pond
    if (promptItem.id.startsWith('pier_') || promptItem.id === 'station_pond') {
      const anchor = WORLD_LAYOUT.fishingAnchors.find(a => a.id === promptItem.id);
      fishingRef.current.startFishing(anchor);
    } else if (promptItem.id === 'station_shop') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'shop' }));
    } else if (promptItem.id === 'station_quests') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'quests' }));
    } else if (promptItem.id === 'station_constellations') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'constellations' }));
    } else if (promptItem.id === 'station_collection') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'collection' }));
    } else if (promptItem.id === 'station_portal') {
      window.dispatchEvent(new CustomEvent('open-modal', { detail: 'regions' }));
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        className="game-viewport"
        tabIndex={0}
      />
      {isShiftLock && (
        <div className="shift-lock-reticle">
          <div className="reticle-core" />
        </div>
      )}
    </div>
  );
};
