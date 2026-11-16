/**
 * GameViewport2D.tsx
 * Pure 2D Pixel-Art Game Viewport replacing the Three.js 3D Viewport.
 * Renders the top-down celestial island, cat character, starpond, and fishing line.
 */

import React, { useEffect, useRef } from 'react';
import { GameEngine2D } from '../../game2d/core/GameEngine2D';
import { FishingSystem2D, MinigameState2D } from '../../game2d/fishing/FishingSystem2D';
import { GameState, CatchResult, CatBreed } from '../../types/game';

interface GameViewport2DProps {
  gameState: GameState;
  onStateChange: (state: GameState) => void;
  onPromptChange: (prompt: string | null) => void;
  onMinigameUpdate: (mg: MinigameState2D) => void;
  onCatchSuccess: (result: CatchResult) => void;
  onNotification: (title: string, msg: string) => void;
  registerFishingSystem: (fs: FishingSystem2D) => void;
  registerEngine?: (engine: GameEngine2D) => void;
  currentRegionId: string;
  catBreed?: CatBreed;
  rodLevel?: number;
}

export const GameViewport2D: React.FC<GameViewport2DProps> = ({
  gameState,
  onStateChange,
  onPromptChange,
  onMinigameUpdate,
  onCatchSuccess,
  onNotification,
  registerFishingSystem,
  registerEngine,
  currentRegionId,
  catBreed = 'celestial',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine2D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine2D(
      canvasRef.current,
      {
        onStateChange,
        onPromptChange,
        onMinigameUpdate,
        onCatchSuccess,
        onNotification,
      },
      catBreed,
      currentRegionId
    );

    engineRef.current = engine;
    registerFishingSystem(engine.fishing);
    registerEngine?.(engine);

    engine.start();

    return () => {
      engine.destroy();
    };
  }, []);

  // Update breed in real-time when changed
  useEffect(() => {
    if (engineRef.current && catBreed) {
      engineRef.current.setCatBreed(catBreed);
    }
  }, [catBreed]);

  // Update region in real-time when changed
  useEffect(() => {
    if (engineRef.current && currentRegionId) {
      engineRef.current.setRegion(currentRegionId);
    }
  }, [currentRegionId]);

  return (
    <div className="game-viewport-2d">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
