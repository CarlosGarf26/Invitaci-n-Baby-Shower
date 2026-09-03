/**
 * Gentle Web Audio Synthesizer playing a soft lullaby / music box melody
 */
class LullabyMusicBox {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noteTimer: number | null = null;
  private currentNoteIndex = 0;

  // Lullaby notes (frequency in Hz) and duration in 16th notes
  private readonly melody: { freq: number; dur: number }[] = [
    { freq: 261.63, dur: 3 }, // C4
    { freq: 261.63, dur: 1 },
    { freq: 392.00, dur: 4 }, // G4
    { freq: 392.00, dur: 4 },
    { freq: 440.00, dur: 4 }, // A4
    { freq: 392.00, dur: 8 },
    { freq: 349.23, dur: 4 }, // F4
    { freq: 329.63, dur: 4 }, // E4
    { freq: 293.66, dur: 4 }, // D4
    { freq: 261.63, dur: 8 }, // C4
    { freq: 392.00, dur: 4 }, // G4
    { freq: 349.23, dur: 4 }, // F4
    { freq: 329.63, dur: 4 }, // E4
    { freq: 293.66, dur: 8 }, // D4
    { freq: 392.00, dur: 4 }, // G4
    { freq: 349.23, dur: 4 }, // F4
    { freq: 329.63, dur: 4 }, // E4
    { freq: 293.66, dur: 8 }, // D4
    { freq: 261.63, dur: 3 }, // C4
    { freq: 261.63, dur: 1 },
    { freq: 392.00, dur: 4 }, // G4
    { freq: 392.00, dur: 4 },
    { freq: 440.00, dur: 4 }, // A4
    { freq: 392.00, dur: 8 },
    { freq: 349.23, dur: 4 }, // F4
    { freq: 329.63, dur: 4 }, // E4
    { freq: 293.66, dur: 4 }, // D4
    { freq: 261.63, dur: 10 } // C4
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, durationSec: number) {
    if (!this.ctx) return;
    
    // Create oscillator and gain for delicate music box bell tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime); // delicate octave shimmer

    // Bell envelope: instant soft attack, gentle exponential decay
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec * 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + durationSec * 1.3);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    this.isPlaying = true;
    this.stepMelody();
  }

  private stepMelody = () => {
    if (!this.isPlaying || !this.ctx) return;

    const note = this.melody[this.currentNoteIndex];
    const durationSec = (note.dur * 0.16);

    this.playTone(note.freq, durationSec);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    this.noteTimer = window.setTimeout(this.stepMelody, durationSec * 1000);
  };

  public stop() {
    this.isPlaying = false;
    if (this.noteTimer) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const musicBox = new LullabyMusicBox();
