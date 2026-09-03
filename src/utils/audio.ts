/**
 * Dragon Ball GT Audio Player
 * Plays "Mi Corazón Encantado" (Piano Cover Instrumental)
 * Loop range: From second 45 (0:45) to 3 minutes 2 seconds (3:02 / 182s)
 */

const AUDIO_SRC =
  'https://raw.githubusercontent.com/CarlosGarf26/Invitaci-n-Baby-Shower/a125865a68c89f3ecfb8560f594eab468e5408e5/MI%20CORAZ%C3%93N%20ENCANTADO%20-%20Dragon%20ball%20GT%20piano%20%20Fernanfloo.mp3';

const START_OFFSET_SECONDS = 45; // 0:45
const END_OFFSET_SECONDS = 182;   // 3:02 (3 * 60 + 2)

class DragonBallAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private hasInitializedStartTime = false;

  private initAudio() {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio(AUDIO_SRC);
      this.audio.volume = 0.45;

      const applyStartTime = () => {
        if (this.audio && !this.hasInitializedStartTime) {
          try {
            this.audio.currentTime = START_OFFSET_SECONDS;
            this.hasInitializedStartTime = true;
          } catch {
            // Ignored until media buffer is ready for seek
          }
        }
      };

      this.audio.addEventListener('loadedmetadata', applyStartTime);
      this.audio.addEventListener('canplay', applyStartTime);

      // Loop precisely when reaching 3:02 (182s), cutting before ending voices
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && this.audio.currentTime >= END_OFFSET_SECONDS) {
          try {
            this.audio.currentTime = START_OFFSET_SECONDS;
          } catch {
            // ignore
          }
        }
      });

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      // Loop back to second 45 if track reaches the end unexpectedly
      this.audio.addEventListener('ended', () => {
        if (this.audio) {
          try {
            this.audio.currentTime = START_OFFSET_SECONDS;
            this.audio.play().catch(() => {});
          } catch {
            // ignore
          }
        }
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

    if (
      !this.hasInitializedStartTime ||
      this.audio.currentTime < START_OFFSET_SECONDS ||
      this.audio.currentTime >= END_OFFSET_SECONDS
    ) {
      try {
        this.audio.currentTime = START_OFFSET_SECONDS;
        this.hasInitializedStartTime = true;
      } catch {
        // Will be applied once metadata/buffer is ready
      }
    }

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
