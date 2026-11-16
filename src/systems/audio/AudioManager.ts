import { SaveManager } from '../save/SaveManager';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private masterVol: number = 1.0;
  private bgmVol: number = 0.7;
  private sfxVol: number = 0.9;

  private constructor() {
    const data = SaveManager.getData();
    this.masterVol = data.masterVolume ?? 1.0;
    this.bgmVol = data.bgmVolume ?? 0.7;
    this.sfxVol = data.sfxVolume ?? 0.9;
  }

  public static getInstance(): AudioManager {
    if (!this.instance) {
      this.instance = new AudioManager();
    }
    return this.instance;
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startBGM(): void {
    this.initContext();
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/assets/audio/bgm/cosmic_ambient_loop.ogg');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.masterVol * this.bgmVol;
      this.bgmAudio.play().catch(() => {
        // Autoplay may be blocked until user gesture, which is normal
      });
    } else if (this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  public setVolumes(master: number, bgm: number, sfx: number): void {
    this.masterVol = master;
    this.bgmVol = bgm;
    this.sfxVol = sfx;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVol * this.bgmVol;
    }
  }

  // --- Procedural Web Audio API sound synthesis ---

  public playClick(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(0.2 * this.masterVol * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playSplash(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Filtered bubble pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.4 * this.masterVol * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playBiteAlert(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Bright double celestial bell
    [880, 1320, 1760].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.35 * this.masterVol * this.sfxVol, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  public playMinigameHit(isPerfect: boolean = false): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const baseFreq = isPerfect ? 1046.5 : 783.99; // C6 or G5
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.3 * this.masterVol * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playMinigameMiss(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

    gain.gain.setValueAtTime(0.25 * this.masterVol * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playCoin(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.25 * this.masterVol * this.sfxVol, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.3);
    });
  }

  public playCatchCelebration(rarity: string): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Ascending arpeggio chord
    const notes = rarity === 'mythic' ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98] :
                  rarity === 'legendary' ? [523.25, 659.25, 783.99, 1046.5, 1318.51] :
                  rarity === 'epic' ? [523.25, 659.25, 783.99, 1046.5] :
                  [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.35 * this.masterVol * this.sfxVol, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.65);
    });
  }

  public playLevelUp(): void {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.3 * this.masterVol * this.sfxVol, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.8);
    });
  }
}
