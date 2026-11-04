import { Storage } from '../core/storage';

export type SoundEffect =
  | 'click'
  | 'slide'
  | 'merge'
  | 'pour'
  | 'place'
  | 'clear'
  | 'combo'
  | 'victory'
  | 'gameover'
  | 'invalid'
  | 'hint';

class SoundManagerService {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicIntervalId: number | null = null;
  private userInteracted = false;

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        const settings = Storage.getData().settings;
        this.musicGain.gain.value = settings.musicEnabled ? settings.musicVolume * 0.25 : 0;
        this.sfxGain.gain.value = settings.sfxEnabled ? settings.sfxVolume * 0.4 : 0;

        this.musicGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public registerUserInteraction(): void {
    this.userInteracted = true;
    this.initContext();
    const settings = Storage.getData().settings;
    if (settings.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public setSfxVolume(vol: number): void {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(vol * 0.4, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number): void {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(vol * 0.25, this.ctx.currentTime);
    }
  }

  public setSfxEnabled(enabled: boolean): void {
    const settings = Storage.getData().settings;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? settings.sfxVolume * 0.4 : 0, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    if (enabled) {
      if (this.userInteracted) {
        this.startMusic();
      }
    } else {
      this.stopMusic();
    }
  }

  public play(sfx: SoundEffect): void {
    const settings = Storage.getData().settings;
    if (!settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      switch (sfx) {
        case 'click':
          this.playClick(now);
          break;
        case 'slide':
          this.playSlide(now);
          break;
        case 'merge':
          this.playMerge(now);
          break;
        case 'pour':
          this.playPour(now);
          break;
        case 'place':
          this.playPlace(now);
          break;
        case 'clear':
          this.playClear(now);
          break;
        case 'combo':
          this.playCombo(now);
          break;
        case 'victory':
          this.playVictory(now);
          break;
        case 'gameover':
          this.playGameOver(now);
          break;
        case 'invalid':
          this.playInvalid(now);
          break;
        case 'hint':
          this.playHint(now);
          break;
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  private playClick(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playSlide(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  private playMerge(now: number): void {
    const notes = [440, 660, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      gain.gain.setValueAtTime(0.35, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.12);
    });
  }

  private playPour(now: number): void {
    // White noise water splash + gentle bubble tone
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  private playPlace(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  private playClear(now: number): void {
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.05);

      gain.gain.setValueAtTime(0.3, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.2);
    });
  }

  private playCombo(now: number): void {
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);

      gain.gain.setValueAtTime(0.35, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.25);
    });
  }

  private playVictory(now: number): void {
    const melody = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.35 }  // C6
    ];
    let offset = 0;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + offset);

      gain.gain.setValueAtTime(0.4, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + offset);
      osc.stop(now + offset + note.d);
      offset += note.d * 0.8;
    });
  }

  private playGameOver(now: number): void {
    const notes = [392.0, 369.99, 349.23, 311.13]; // G4, F#4, F4, Eb4
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.2, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.14 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.18);
    });
  }

  private playInvalid(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  private playHint(now: number): void {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(1318.51, now + 0.15); // A5 -> E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public startMusic(): void {
    const settings = Storage.getData().settings;
    if (!settings.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGain || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.musicGain.gain.setValueAtTime(settings.musicVolume * 0.2, this.ctx.currentTime);

    // Calm procedural ambient chord progression: Cmaj7 - Am7 - Fmaj7 - G
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E
      [196.00, 246.94, 293.66, 349.23]  // G, B, D, F
    ];
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + noteIdx * 0.08);

        noteGain.gain.setValueAtTime(0.001, now + noteIdx * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.08, now + noteIdx * 0.08 + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain!);
        osc.start(now + noteIdx * 0.08);
        osc.stop(now + 2.9);
      });
    };

    playChordStep();
    this.musicIntervalId = window.setInterval(playChordStep, 3000);
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const SoundManager = new SoundManagerService();
