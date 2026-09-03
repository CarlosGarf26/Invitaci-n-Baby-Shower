/**
 * Dragon Ball GT Audio Player
 * Plays "Mi Corazón Encantado" (Piano Cover Instrumental)
 */

const AUDIO_SRC =
  'https://raw.githubusercontent.com/CarlosGarf26/Invitaci-n-Baby-Shower/a125865a68c89f3ecfb8560f594eab468e5408e5/MI%20CORAZ%C3%93N%20ENCANTADO%20-%20Dragon%20ball%20GT%20piano%20%20Fernanfloo.mp3';

class DragonBallAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  private initAudio() {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio(AUDIO_SRC);
      this.audio.loop = true;
      // Gentle background volume (45%)
      this.audio.volume = 0.45;

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
      });
    }
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
    this.initAudio();
    if (!this.audio) return;

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(() => {
        // Autoplay policy waiting for user interaction
        this.isPlaying = false;
      });
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const musicBox = new DragonBallAudioPlayer();
