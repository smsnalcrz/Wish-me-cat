import React, { useState, useEffect, useRef } from 'react';
import { GameViewport2D } from './components/game/GameViewport2D';
import { HUD } from './components/ui/HUD';
import { MinigameOverlay } from './components/ui/MinigameOverlay';
import { CatchModal } from './components/ui/CatchModal';
import { ToastNotification } from './components/ui/ToastNotification';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { MobileControls } from './components/ui/MobileControls';
import { ShopModal } from './components/menus/ShopModal';
import { CollectionModal } from './components/menus/CollectionModal';
import { QuestModal } from './components/menus/QuestModal';
import { ConstellationModal } from './components/menus/ConstellationModal';
import { RegionModal } from './components/menus/RegionModal';
import { PauseModal } from './components/menus/PauseModal';
import { CatWardrobeModal } from './components/menus/CatWardrobeModal';
import { SaveManager, DEFAULT_SAVE } from './systems/save/SaveManager';
import { AudioManager } from './systems/audio/AudioManager';
import { FishingSystem2D, MinigameState2D } from './game2d/fishing/FishingSystem2D';
import { GameEngine2D } from './game2d/core/GameEngine2D';
import { detectDevice, DeviceInfo } from './utils/deviceDetection';
import { GameState, CatchResult, SaveData, RegionData, CatBreed } from './types/game';
import './styles/game.css';

export const App: React.FC = () => {
  const [saveData, setSaveData] = useState<SaveData>(DEFAULT_SAVE);
  const [gameState, setGameState] = useState<GameState>('exploring');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [minigameState, setMinigameState] = useState<MinigameState2D | null>(null);
  const [catchResult, setCatchResult] = useState<CatchResult | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnteredGame, setHasEnteredGame] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice);

  const fishingSystemRef = useRef<FishingSystem2D | null>(null);
  const gameEngineRef = useRef<GameEngine2D | null>(null);
  const audio = AudioManager.getInstance();

  useEffect(() => {
    // 1. Load initial game save
    const loaded = SaveManager.load();
    setSaveData({ ...loaded });

    // 2. Track device/orientation updates
    const handleDeviceUpdate = () => {
      setDeviceInfo(detectDevice());
    };
    window.addEventListener('resize', handleDeviceUpdate);
    window.addEventListener('orientationchange', handleDeviceUpdate);

    // 3. Listen to modal open events from 3D world stations
    const handleOpenModal = (e: Event) => {
      const modalName = (e as CustomEvent).detail;
      setActiveModal(modalName);
      audio.playClick();
    };
    window.addEventListener('open-modal', handleOpenModal);

    // 4. Global keyboard shortcuts
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        // If pointer lock / Shift Lock is active, let Esc release pointer lock without opening pause menu!
        if (document.pointerLockElement) {
          document.exitPointerLock();
          return;
        }
        if (catchResult) {
          setCatchResult(null);
          fishingSystemRef.current?.cancelFishing();
        } else if (activeModal) {
          setActiveModal(null);
        } else if (gameState === 'exploring') {
          setActiveModal('pause');
        } else {
          fishingSystemRef.current?.cancelFishing();
        }
      } else if (e.code === 'KeyE') {
        // Trigger interaction prompt if exploring
        if (gameState === 'exploring' && interactionPrompt && !activeModal) {
          handlePromptAction();
        }
      } else if (e.code === 'Space') {
        // Spacebar action for fishing bite reaction and minigame timing!
        if (gameState === 'bite' || gameState === 'minigame') {
          e.preventDefault();
          fishingSystemRef.current?.handleActionInput();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('resize', handleDeviceUpdate);
      window.removeEventListener('orientationchange', handleDeviceUpdate);
      window.removeEventListener('open-modal', handleOpenModal);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState, interactionPrompt, activeModal, catchResult]);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const handleStartGame = () => {
    audio.startBGM();
    setHasEnteredGame(true);
  };

  const handleResetSave = () => {
    const reset = SaveManager.reset();
    setSaveData({ ...reset });
    showToast('✦ SAVE RESET', 'Started a fresh star journey!');
  };

  const handlePromptAction = () => {
    if (gameEngineRef.current?.currentPromptStation) {
      gameEngineRef.current.triggerCurrentInteraction();
      return;
    }
    if (!interactionPrompt || !fishingSystemRef.current) return;
    if (interactionPrompt.includes('Fish')) {
      fishingSystemRef.current.startFishing();
    } else if (interactionPrompt.includes('Shop')) {
      setActiveModal('shop');
    } else if (interactionPrompt.includes('Quest')) {
      setActiveModal('quests');
    } else if (interactionPrompt.includes('Constellation')) {
      setActiveModal('constellations');
    } else if (interactionPrompt.includes('Almanac')) {
      setActiveModal('collection');
    } else if (interactionPrompt.includes('Gateway')) {
      setActiveModal('regions');
    }
  };

  const handleMinigameAction = () => {
    fishingSystemRef.current?.handleActionInput();
  };

  const handleCatchClose = () => {
    setCatchResult(null);
    fishingSystemRef.current?.cancelFishing();
  };

  const handleTravelToRegion = (region: RegionData) => {
    showToast('TRAVELED TO REGION', `Welcome to ${region.name}!`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audio.setVolumes(isMuted ? 1.0 : 0, isMuted ? 0.7 : 0, isMuted ? 0.9 : 0);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Pure 2D Pixel-Art Game Viewport */}
      <GameViewport2D
        gameState={gameState}
        onStateChange={setGameState}
        onPromptChange={setInteractionPrompt}
        onMinigameUpdate={setMinigameState}
        onCatchSuccess={setCatchResult}
        onNotification={showToast}
        registerFishingSystem={(fs) => { fishingSystemRef.current = fs; }}
        registerEngine={(eng) => { gameEngineRef.current = eng; }}
        currentRegionId={saveData.currentRegionId}
        catBreed={saveData.catBreed || 'celestial'}
        rodLevel={saveData.rodLevel}
      />

      {/* Main Game HUD (Active once inside game) */}
      {hasEnteredGame && (
        <HUD
          saveData={saveData}
          interactionPrompt={!activeModal && !catchResult ? interactionPrompt : null}
          onInteract={handlePromptAction}
          onOpenShop={() => setActiveModal('shop')}
          onOpenCollection={() => setActiveModal('collection')}
          onOpenQuests={() => setActiveModal('quests')}
          onOpenConstellations={() => setActiveModal('constellations')}
          onOpenRegions={() => setActiveModal('regions')}
          onOpenWardrobe={() => setActiveModal('wardrobe')}
          onOpenPause={() => setActiveModal('pause')}
          onToggleMute={toggleMute}
          isMuted={isMuted}
        />
      )}

      {/* Mobile Touch Controls Layer */}
      <MobileControls
        gameState={gameState}
        interactionPrompt={!activeModal && !catchResult ? interactionPrompt : null}
        onInteract={handlePromptAction}
        onMinigameAction={handleMinigameAction}
        onMoveVector={(vector, isRunning) => {
          gameEngineRef.current?.input.setVirtualJoystick(vector, isRunning);
        }}
        isVisible={hasEnteredGame && (deviceInfo.isTouch || deviceInfo.isMobile)}
      />

      {/* Welcome & Title Screen Overlay */}
      {!hasEnteredGame && (
        <WelcomeScreen
          deviceInfo={deviceInfo}
          saveData={saveData}
          onStartGame={handleStartGame}
          onResetSave={handleResetSave}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Reeling Minigame Overlay */}
      {gameState === 'minigame' && minigameState && (
        <MinigameOverlay
          minigame={minigameState}
          onActionClick={handleMinigameAction}
        />
      )}

      {/* Catch Showcase Modal */}
      {catchResult && (
        <CatchModal
          result={catchResult}
          onClose={handleCatchClose}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          title={toast.title}
          message={toast.message}
        />
      )}

      {/* Modals */}
      {activeModal === 'shop' && (
        <ShopModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
          onUpdateSave={setSaveData}
        />
      )}

      {activeModal === 'collection' && (
        <CollectionModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'quests' && (
        <QuestModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
          onUpdateSave={setSaveData}
        />
      )}

      {activeModal === 'constellations' && (
        <ConstellationModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'regions' && (
        <RegionModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
          onUpdateSave={setSaveData}
          onTravel={handleTravelToRegion}
        />
      )}

      {activeModal === 'wardrobe' && (
        <CatWardrobeModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
          onUpdateSave={setSaveData}
          onSelectBreed={(breed) => {
            showToast('🐱 Cat Model Switched!', `You are now exploring as ${breed.toUpperCase()}!`);
          }}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          saveData={saveData}
          onClose={() => setActiveModal(null)}
          onUpdateSave={setSaveData}
          onNotify={showToast}
        />
      )}
    </div>
  );
};

export default App;

