import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart } from 'lucide-react';
import { musicBox } from '../utils/audio';

interface EnvelopeModalProps {
  isOpen: boolean;
  onOpenInvitation: () => void;
}

export function EnvelopeModal({ isOpen, onOpenInvitation }: EnvelopeModalProps) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsOpening(false);
    }
  }, [isOpen]);

  const handleSealClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Soft pastel confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DCE7D6', '#F5E6CC', '#FDE2E4', '#E2ECE9', '#FFF3B0'],
    });

    // Start music smoothly if not yet playing
    try {
      if (!musicBox.getStatus()) {
        musicBox.start();
      }
    } catch {
      // Audio context policy
    }

    setTimeout(() => {
      onOpenInvitation();
    }, 1100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="envelope-modal-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2]/95 backdrop-blur-md"
      >
        <div className="relative w-full max-w-sm sm:max-w-md flex flex-col items-center">
          
          {/* Header teaser */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE2D7] text-[#6D6356] text-sm tracking-wider uppercase font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#B89B72]" />
              Baby Shower Sajayin
            </div>
            <h1 className="text-2xl sm:text-3xl font-script text-[#5C5346]">
              ¡Tenemos algo lindo que contarte!
            </h1>
            <p className="text-[11px] sm:text-xs text-[#82786B] mt-1.5">
              Toca el sello para abrir tu invitación
            </p>
          </motion.div>

          {/* Envelope Body */}
          <motion.div
            id="envelope-card-container"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSealClick}
            className="cursor-pointer relative w-full min-h-[310px] max-w-[360px] bg-[#F2ECE1] rounded-2xl shadow-xl border border-[#E3D9C9] overflow-hidden flex items-center justify-center p-6 group"
          >
            {/* Flap fold background decoration */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#E7DDCF] to-transparent opacity-60 pointer-events-none" />

            {/* Corner floral / tender details */}
            <div className="absolute top-3 left-3 text-[#B8A690] opacity-40 text-xs font-script">
              ✦ ✦
            </div>
            <div className="absolute top-3 right-3 text-[#B8A690] opacity-40 text-xs font-script">
              ✦ ✦
            </div>

            {/* Simulated letter inside peaking out */}
            <motion.div
              animate={isOpening ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full bg-[#FDFBF7] rounded-xl pt-5 pb-6 px-5 shadow-sm border border-[#EDE4D5] text-center"
            >
              <span className="text-[11px] uppercase tracking-widest text-[#9C8F7E] font-semibold">
                Para: Familia y Amigos
              </span>
              
              {/* Espacio reservado para que el sello no tape el texto */}
              <div className="h-20 sm:h-24" />
              
              <div className="w-10 h-0.5 bg-[#D7C9B6] mx-auto mb-2.5" />
              <p className="text-[14px] sm:text-base font-semibold text-[#6E6354] italic">
                La llegada de nuestro Bebé Sajayin
              </p>
            </motion.div>

            {/* Wax Seal Button */}
            <motion.div
              id="envelope-wax-seal"
              animate={isOpening ? { scale: [1, 1.3, 0], rotate: 45 } : { scale: [1, 1.05, 1] }}
              transition={isOpening ? { duration: 0.6 } : { repeat: Infinity, duration: 2.5 }}
              className="absolute z-20 flex flex-col items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#E2B98E] via-[#C99C6A] to-[#A37B4C] text-[#FFFDF8] shadow-lg border-2 border-[#FFF4E4] -translate-y-5 sm:-translate-y-6"
            >
              <Heart className="w-6 h-6 fill-current text-[#FFF3E3] drop-shadow-sm" />
              <span className="text-[9px] uppercase font-bold tracking-tight text-[#FFF8ED] mt-0.5">
                Abrir
              </span>
            </motion.div>

            {/* Delicate border glow */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#D8C7B0]/40 group-hover:border-[#C4AD91] transition-colors pointer-events-none" />
          </motion.div>

          {/* Interactive instruction tip */}
          <motion.button
            id="btn-open-direct"
            type="button"
            onClick={handleSealClick}
            className="mt-6 text-xs text-[#7C7161] hover:text-[#4F4638] underline underline-offset-4 font-medium transition-colors"
          >
            {isOpening ? 'Abriendo invitación...' : 'Haz clic aquí para abrir directamente'}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
