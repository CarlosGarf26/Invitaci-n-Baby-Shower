import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { musicBox } from '../utils/audio';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsPlaying(musicBox.getStatus());
  }, []);

  const handleToggle = () => {
    const active = musicBox.toggle();
    setIsPlaying(active);
  };

  return (
    <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40">
      <button
        id="btn-music-toggle"
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música de fondo'}
        className={`flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full backdrop-blur-md transition-all shadow-sm border ${
          isPlaying
            ? 'bg-[#F2ECE1]/90 border-[#D4C4AE] text-[#5A4E3D]'
            : 'bg-[#FAF7F2]/80 border-[#E8DFC0] text-[#8C7F6E] hover:bg-[#F2ECE1]'
        }`}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B89B72] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9E8158]" />
            </span>
            <Volume2 className="w-4 h-4 sm:w-4 sm:h-4 text-[#8A6F49]" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wide">Música</span>
          </>
        ) : (
          <>
            <Music className="hidden sm:block w-4 h-4 text-[#A89A86]" />
            <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#B8AA96]" />
            <span className="hidden sm:inline text-xs text-[#8A7E6E]">Música</span>
          </>
        )}
      </button>
    </div>
  );
}
