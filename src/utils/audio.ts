/**
 * Dragon Ball Z Instrumental Audio Player
 * Plays "Cha-La Head-Cha-La" (HQ Instrumental, Sin coros)
 */

const AUDIO_SRC =
  'https://raw.githubusercontent.com/CarlosGarf26/Invitaci-n-Baby-Shower/982dfafa44262685c356050f9354f8da75edab5f/Dragon%20Ball%20Z%20-%20IntroOpening%20Cha%20La%20Head%20Cha%20La%20(Instrumental)%20%5BSin%20coros%20%20No%20chorus%5D%20%20HQ.mp3';

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
