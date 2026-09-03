/**
 * Gentle Web Audio Synthesizer playing an acoustic music box medley:
 * 1. "Romance te puedo dar" (Romantic & tender Dragon Ball Ending)
 * 2. "Tapion's Theme" (Hero's Flute / Ocarina, mysterious & dreamy)
 */

interface MelodyNote {
  freq: number;
  dur: number; // in sixteenth-note units
  isRest?: boolean;
}

// Standard Pitch Frequencies (Hz)
const NOTE = {
  REST: 0,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.00,
  Ab4: 415.30,
  A4: 440.00,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  Fs5: 739.99,
  G5: 783.99,
  Ab5: 830.61,
  A5: 880.00,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.50,
  D6: 1174.66,
};

/**
 * Melody 1: "Romance te puedo dar" (Romantikku Ageru yo)
 * Tender, sweet lullaby intro & iconic chorus motif
 */
const ROMANCE_MELODY: MelodyNote[] = [
  // "Te daré el romance..."
  { freq: NOTE.E4, dur: 3 },
  { freq: NOTE.G4, dur: 3 },
  { freq: NOTE.A4, dur: 4 },
  { freq: NOTE.B4, dur: 3 },
  { freq: NOTE.C5, dur: 5 },

  // "Te daré el romance..."
  { freq: NOTE.B4, dur: 3 },
  { freq: NOTE.A4, dur: 3 },
  { freq: NOTE.G4, dur: 4 },
  { freq: NOTE.E4, dur: 6 },

  // "Siempre resplandeciente..."
  { freq: NOTE.E4, dur: 3 },
  { freq: NOTE.G4, dur: 3 },
  { freq: NOTE.A4, dur: 3 },
  { freq: NOTE.B4, dur: 3 },
  { freq: NOTE.D5, dur: 5 },
  { freq: NOTE.C5, dur: 7 },

  // Melodic transition
  { freq: NOTE.A4, dur: 3 },
  { freq: NOTE.B4, dur: 3 },
  { freq: NOTE.C5, dur: 4 },
  { freq: NOTE.B4, dur: 4 },
  { freq: NOTE.A4, dur: 4 },
  { freq: NOTE.G4, dur: 6 },
  { freq: NOTE.REST, dur: 4 },
];

/**
 * Melody 2: "Tapion's Theme" (Hero's Flute / La melodía de Tapion)
 * Soft, dreamy, enchanting lullaby motif
 */
const TAPION_MELODY: MelodyNote[] = [
  // Opening phrase
  { freq: NOTE.B4, dur: 4 },
  { freq: NOTE.E5, dur: 6 },
  { freq: NOTE.D5, dur: 2 },
  { freq: NOTE.C5, dur: 4 },
  { freq: NOTE.B4, dur: 4 },

  // Second phrase
  { freq: NOTE.A4, dur: 4 },
  { freq: NOTE.C5, dur: 4 },
  { freq: NOTE.B4, dur: 6 },
  { freq: NOTE.G4, dur: 2 },
  { freq: NOTE.A4, dur: 6 },

  // Climbing motif
  { freq: NOTE.B4, dur: 4 },
  { freq: NOTE.E5, dur: 6 },
  { freq: NOTE.Fs5, dur: 2 },
  { freq: NOTE.G5, dur: 4 },
  { freq: NOTE.Fs5, dur: 4 },

  // Sweet resolution
  { freq: NOTE.E5, dur: 4 },
  { freq: NOTE.D5, dur: 4 },
  { freq: NOTE.E5, dur: 8 },
  { freq: NOTE.REST, dur: 6 },
];

class DragonBallLullabyBox {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noteTimer: number | null = null;
  private currentNoteIndex = 0;

  // Complete continuous sequence: Romance -> Tapion -> loop
  private readonly fullScore: MelodyNote[] = [
    ...ROMANCE_MELODY,
    ...TAPION_MELODY,
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, durationSec: number) {
    if (!this.ctx || freq <= 0) return;

    // Harmonic bell layers: primary bell + soft octave overtone
    const fundamental = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const mainGain = this.ctx.createGain();
    const overtoneGain = this.ctx.createGain();

    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm celeste / music box bell character
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

    const now = this.ctx.currentTime;

    // Fundamental envelope
    mainGain.gain.setValueAtTime(0.0001, now);
    mainGain.gain.linearRampToValueAtTime(0.14, now + 0.035);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.25);

    // Subtle overtone envelope
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.85);

    fundamental.connect(mainGain);
    overtone.connect(overtoneGain);

    mainGain.connect(this.ctx.destination);
    overtoneGain.connect(this.ctx.destination);

    fundamental.start(now);
    overtone.start(now);

    fundamental.stop(now + durationSec * 1.3);
    overtone.stop(now + durationSec * 1.3);
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

    const note = this.fullScore[this.currentNoteIndex];
    // Slower, soothing tempo (~85 BPM sixteenths)
    const durationSec = note.dur * 0.145;

    if (note.freq > 0) {
      this.playTone(note.freq, durationSec);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.fullScore.length;
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

export const musicBox = new DragonBallLullabyBox();
