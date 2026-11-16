import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState } from '../../types/game';
import { Zap, Sparkles } from 'lucide-react';

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
  const maxRadius = 55; // pixels max deflection

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

    // Normalized vector: -1 to 1 (Y: negative is forward)
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

  const toggleSprint = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(prev => {
      const next = !prev;
      // Re-trigger movement with new sprint speed
      if (knobPos.x !== 0 || knobPos.y !== 0) {
        onMoveVector({ x: knobPos.x / maxRadius, y: knobPos.y / maxRadius }, next);
      }
      return next;
    });
  };

  if (!isVisible) return null;

  return (
    <div className="mobile-controls-layer pointer-events-none">
      {/* 1. Virtual Analog Joystick (Bottom Left) */}
      {isExploring && (
        <div
          ref={joystickBaseRef}
          className={`virtual-joystick-base pointer-events-auto ${isJoystickActive ? 'active' : ''}`}
          onTouchStart={handleJoystickTouchStart}
        >
          {/* Inner Glowing Knob */}
          <div
            className="virtual-joystick-knob"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
            }}
          >
            <div className="knob-crest">🐾</div>
          </div>
        </div>
      )}

      {/* 2. Floating Action Buttons (Bottom Right) */}
      <div className="mobile-actions-container pointer-events-auto">
        {/* Sprint Toggle Button */}
        {isExploring && (
          <button
            className={`mobile-action-btn sprint-btn ${isRunning ? 'sprint-active' : ''}`}
            onTouchStart={toggleSprint}
            onClick={toggleSprint}
            title="Toggle Sprint"
          >
            <Zap size={22} fill={isRunning ? "#facc15" : "none"} />
            <span className="mobile-btn-label">{isRunning ? 'SPRINT' : 'WALK'}</span>
          </button>
        )}

        {/* Primary Interact / Cast Button */}
        {isExploring && interactionPrompt && (
          <button
            className="mobile-action-btn interact-primary-btn"
            onTouchStart={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            title={interactionPrompt}
          >
            <span style={{ fontSize: '24px' }}>🎣</span>
            <span className="mobile-btn-label">
              {interactionPrompt.includes('Fish') ? 'CAST ROD' : 'INTERACT'}
            </span>
          </button>
        )}

        {/* Reeling Minigame Action Button */}
        {isFishingMinigame && (
          <button
            className="mobile-action-btn reel-pulse-btn"
            onTouchStart={(e) => {
              e.stopPropagation();
              onMinigameAction();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onMinigameAction();
            }}
            title="Reel In!"
          >
            <Sparkles size={28} />
            <span className="mobile-btn-label" style={{ fontWeight: 800, fontSize: '13px' }}>
              REEL IN!
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
