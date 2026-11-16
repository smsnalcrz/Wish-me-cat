import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState } from '../../types/game';
import { PixelFishingRodIcon, PixelStardustIcon } from './PixelIcons';

interface MobileControlsProps {
  gameState: GameState;
  interactionPrompt: string | null;
  onInteract: () => void;
  onMinigameAction: () => void;
  onMoveVector: (vector: { x: number; y: number }, isRunning: boolean) => void;
  isVisible: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  gameState,
  interactionPrompt,
  onInteract,
  onMinigameAction,
  onMoveVector,
  isVisible
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const maxRadius = 50;

  const isExploring = gameState === 'exploring';
  const isFishingMinigame = gameState === 'bite' || gameState === 'minigame';

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchIdRef.current !== null || !joystickBaseRef.current) return;

    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = joystickBaseRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    updateKnob(touch.clientX, touch.clientY);
    setIsJoystickActive(true);
  };

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;

    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;

    onMoveVector({ x: normX, y: normY }, isRunning);
  }, [isRunning, onMoveVector]);

  const handleJoystickTouchMove = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  }, [updateKnob]);

  const handleJoystickTouchEnd = useCallback((e: TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        setIsJoystickActive(false);
        onMoveVector({ x: 0, y: 0 }, isRunning);
        break;
      }
    }
  }, [isRunning, onMoveVector]);

  useEffect(() => {
    window.addEventListener('touchmove', handleJoystickTouchMove, { passive: false });
    window.addEventListener('touchend', handleJoystickTouchEnd);
    window.addEventListener('touchcancel', handleJoystickTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleJoystickTouchMove);
      window.removeEventListener('touchend', handleJoystickTouchEnd);
      window.removeEventListener('touchcancel', handleJoystickTouchEnd);
    };
  }, [handleJoystickTouchMove, handleJoystickTouchEnd]);

  if (!isVisible) return null;

  return (
    <div className="mobile-controls-layer">
      {/* 1. Stepped Pixel D-Pad / Joystick (Bottom Left) */}
      {isExploring && (
        <div
          ref={joystickBaseRef}
          className="mobile-joystick-base"
          onTouchStart={handleJoystickTouchStart}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '30px',
            width: '120px',
            height: '120px',
            background: '#09081a',
            border: '2px solid #281f4a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              position: 'absolute',
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              width: '44px',
              height: '44px',
              background: isJoystickActive ? '#38bdf8' : '#1e1b4b',
              boxShadow: isJoystickActive
                ? '0 -2px 0 0 #7dd3fc, 0 2px 0 0 #0284c7, -2px 0 0 0 #7dd3fc, 2px 0 0 0 #0284c7'
                : '0 -2px 0 0 #312e81, 0 2px 0 0 #0f172a, -2px 0 0 0 #312e81, 2px 0 0 0 #0f172a'
            }}
          />
        </div>
      )}

      {/* 2. Floating Pixel Action Buttons (Bottom Right) */}
      <div
        className="pointer-events-auto"
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}
      >
        {/* Primary Interact / Cast Button */}
        {isExploring && interactionPrompt && (
          <button
            className="cosmic-button"
            onTouchStart={(e) => { e.stopPropagation(); onInteract(); }}
            onClick={(e) => { e.stopPropagation(); onInteract(); }}
            style={{ padding: '12px 18px', background: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PixelFishingRodIcon size={18} />
            <span>{interactionPrompt.includes('Fish') ? 'CAST ROD' : 'INTERACT'}</span>
          </button>
        )}

        {/* Reeling Minigame Action Button */}
        {isFishingMinigame && (
          <button
            className="cosmic-button"
            onTouchStart={(e) => { e.stopPropagation(); onMinigameAction(); }}
            onClick={(e) => { e.stopPropagation(); onMinigameAction(); }}
            style={{ padding: '14px 22px', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PixelStardustIcon size={20} color="#000" />
            <span>✦ REEL IN! ✦</span>
          </button>
        )}
      </div>
    </div>
  );
};
