import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PollState } from '../types';

export function GenderPoll() {
  const [poll, setPoll] = useState<PollState>(() => {
    const saved = localStorage.getItem('baby_shower_poll_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      boyVotes: 14,
      girlVotes: 16,
      localBoyVotes: 0,
      localGirlVotes: 0,
    };
  });

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('baby_shower_poll_v1', JSON.stringify(poll));
  }, [poll]);

  const total = poll.boyVotes + poll.girlVotes;
  const boyPercent = Math.round((poll.boyVotes / total) * 100);
  const girlPercent = 100 - boyPercent;

  const handleVote = (gender: 'boy' | 'girl') => {
    if (gender === 'boy') {
      confetti({
        particleCount: 60,
        spread: 60,
        colors: ['#A7C7E7', '#C1D3FE', '#E2ECE9', '#F0E6D2'],
      });
      setPoll(prev => ({
        ...prev,
        boyVotes: prev.boyVotes + 1,
        localBoyVotes: (prev.localBoyVotes || 0) + 1,
      }));
      showToast('¡Voto registrado para Team Niño! 💙');
    } else {
      confetti({
        particleCount: 60,
        spread: 60,
        colors: ['#F8C8DC', '#FDE2E4', '#F5E6CC', '#FFF3B0'],
      });
      setPoll(prev => ({
        ...prev,
        girlVotes: prev.girlVotes + 1,
        localGirlVotes: (prev.localGirlVotes || 0) + 1,
      }));
      showToast('¡Voto registrado para Team Niña! 💖');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  return (
    <section id="gender-poll-section" className="my-8 relative">
      <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E8DEC9] shadow-xs text-center">
        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#EFE3D0] text-[#7A6750] text-[10px] uppercase font-bold tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-[#A88C64]" />
          <span>Dinámica Sorpresa</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-script text-[#504434]">
          ¿Qué crees que será?
        </h3>
        <p className="text-xs text-[#7A6D5D] mt-0.5 mb-4 max-w-xs mx-auto">
          ¡El sexo de nuestro Bebé Saiyajin se sabrá hasta el nacimiento! Vota por tu corazonada:
        </p>

        {/* Voting Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            id="btn-vote-boy"
            type="button"
            onClick={() => handleVote('boy')}
            className={`py-3 px-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
              (poll.localBoyVotes || 0) > 0
                ? 'bg-[#E3EDF7] border-[#BCD4EC]'
                : 'bg-[#EFF5FA] border-[#D6E6F2] hover:bg-[#E2EDF7]'
            }`}
          >
            <span className="text-2xl">🍼</span>
            <span className="text-xs font-bold text-[#43658B]">Team Niño</span>
            {(poll.localBoyVotes || 0) > 0 && (
              <span className="text-[10px] bg-[#BCD4EC] text-[#2C4A6B] font-bold px-2 py-0.5 rounded-full mt-1">
                Tu familia: {poll.localBoyVotes}
              </span>
            )}
          </button>

          <button
            id="btn-vote-girl"
            type="button"
            onClick={() => handleVote('girl')}
            className={`py-3 px-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 hover:scale-[1.02] ${
              (poll.localGirlVotes || 0) > 0
                ? 'bg-[#FCECF0] border-[#F7C6D2]'
                : 'bg-[#FAF0F3] border-[#F3DAE2] hover:bg-[#FCECF0]'
            }`}
          >
            <span className="text-2xl">🎀</span>
            <span className="text-xs font-bold text-[#9E4D68]">Team Niña</span>
            {(poll.localGirlVotes || 0) > 0 && (
              <span className="text-[10px] bg-[#F7C6D2] text-[#7A364E] font-bold px-2 py-0.5 rounded-full mt-1">
                Tu familia: {poll.localGirlVotes}
              </span>
            )}
          </button>
        </div>

        {/* Results Bar */}
        <div className="space-y-1 text-left">
          <div className="flex justify-between text-[11px] font-semibold text-[#736655] px-1">
            <span>Niño: {boyPercent}%</span>
            <span>Niña: {girlPercent}%</span>
          </div>

          <div className="h-2.5 w-full bg-[#EAE0D1] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${boyPercent}%` }}
              className="bg-[#9ABDD9] h-full transition-all duration-500"
            />
            <div
              style={{ width: `${girlPercent}%` }}
              className="bg-[#E7A6B8] h-full transition-all duration-500"
            />
          </div>

          <p className="text-center text-[10px] text-[#968979] pt-1">
            {(poll.localBoyVotes || 0) > 0 || (poll.localGirlVotes || 0) > 0
              ? '¡Sigan votando por cada integrante de la familia! ✨'
              : 'Toca tu opción favorita para votar'}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FDFBF7] border border-[#E8DEC9] text-[#6E6354] px-4 py-2 rounded-full shadow-md text-xs font-bold flex items-center gap-2 z-10"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
