# Wish Me Cat — 2D Pixel Art Character Pack

## 1. Overview & Contents
This package contains the complete 2D pixel-art character sprite sheets, individual animation frames, directional character portraits, HUD icon, and expression sheet for **Wish Me Cat**.

### Directory Structure
```
WishMeCat_Pixel_Character_Pack/
├── SpriteSheets/
│   ├── idle.png              (1024 x 128 px, 8 frames)
│   ├── walk.png              (1024 x 128 px, 8 frames)
│   ├── run.png               (1024 x 128 px, 8 frames)
│   ├── sit.png               (768 x 128 px,  6 frames)
│   ├── sleep.png             (1024 x 128 px, 8 frames)
│   ├── happy.png             (1024 x 128 px, 8 frames)
│   ├── petting.png           (1024 x 128 px, 8 frames)
│   ├── fishing.png           (1024 x 128 px, 8 frames)
│   ├── fishing_reaction.png  (1024 x 128 px, 8 frames)
│   └── jump.png              (1024 x 128 px, 8 frames)
├── IndividualFrames/
│   ├── idle/                 (idle_01.png .. idle_08.png)
│   ├── walk/                 (walk_01.png .. walk_08.png)
│   ├── run/                  (run_01.png .. run_08.png)
│   ├── sit/                  (sit_01.png .. sit_06.png)
│   ├── sleep/                (sleep_01.png .. sleep_08.png)
│   ├── happy/                (happy_01.png .. happy_08.png)
│   ├── petting/              (petting_01.png .. petting_08.png)
│   ├── fishing/              (fishing_01.png .. fishing_08.png)
│   ├── fishing_reaction/     (fishing_reaction_01.png .. fishing_reaction_08.png)
│   └── jump/                 (jump_01.png .. jump_08.png)
├── CharacterPortraits/
│   ├── front.png             (128 x 128 px)
│   ├── side.png              (128 x 128 px)
│   ├── back.png              (128 x 128 px)
│   └── icon.png              (128 x 128 px)
├── Expressions/
│   └── expressions.png       (768 x 128 px, 6 frames: Happy, Sleepy, Curious, Surprised, Sad, Excited)
└── Documentation/
    ├── README.md
    └── sprite_metadata.json
```

## 2. Technical Specifications
- **File Format:** 32-bit RGBA PNG (`RGBA8888`)
- **Background:** Fully transparent `(0, 0, 0, 0)` with zero anti-aliasing or background halos
- **Individual Frame Resolution:** `128 x 128` pixels (authored on a `64 x 64` logical grid and upscaled 2x using crisp Nearest-Neighbor interpolation)
- **Ground Baseline:** `y = 108` px from the top of the frame (`20` px margin below the paws)
- **Horizontal Center Pivot:** `x = 64` px

## 3. How to Extract & Slice Individual Frames
- **Pre-Extracted Frames:** Ready-to-use individual PNG frames are located in `IndividualFrames/<animation_name>/`.
- **Sprite Sheet Grid Slicing:** To slice the horizontal strips inside `SpriteSheets/` in Unity, Godot, GameMaker, or Aseprite:
  - **Cell Size:** `128 x 128` px
  - **Offset / Margin:** `0` px
  - **Padding / Spacing:** `0` px
  - **Pivot / Anchor Point:** Bottom-Center `(64, 108)` px (or normalized `(0.5, 0.84375)`)
  - **Texture Filter Mode:** `Point (no filter)` / `Nearest` (disable mipmaps and lossy compression)

## 4. Recommended Animation Playback FPS & Looping
| Animation | File | Frames | Sheet Size | FPS | Looping |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Idle | `idle.png` | 8 | 1024 x 128 | 8 | Yes |
| Walk | `walk.png` | 8 | 1024 x 128 | 10 | Yes |
| Run | `run.png` | 8 | 1024 x 128 | 14 | Yes |
| Sit | `sit.png` | 6 | 768 x 128 | 8 | No (hold Frame 6 while seated) |
| Sleep | `sleep.png` | 8 | 1024 x 128 | 6 | Yes |
| Happy | `happy.png` | 8 | 1024 x 128 | 10 | Yes |
| Petting | `petting.png` | 8 | 1024 x 128 | 8 | Yes |
| Fishing | `fishing.png` | 8 | 1024 x 128 | 8 | Yes |
| Fishing Reaction | `fishing_reaction.png` | 8 | 1024 x 128 | 12 | No (transition to minigame/reel) |
| Jump | `jump.png` | 8 | 1024 x 128 | 12 | No |
