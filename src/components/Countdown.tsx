import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    // Target: November 15, 13:00 (1:00 PM)
    const now = new Date();
    let targetYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed, 10 is Nov
    const currentDay = now.getDate();

    if (currentMonth > 10 || (currentMonth === 10 && currentDay > 15)) {
      targetYear += 1;
    }

    const eventDate = new Date(targetYear, 10, 15, 13, 0, 0).getTime();

    const updateCountdown = () => {
      const currentTime = new Date().getTime();
      const difference = eventDate - currentTime;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="countdown-container" className="w-full max-w-md mx-auto py-2">
      <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-[#8C7E6D] font-semibold mb-3">
        <Clock className="w-3.5 h-3.5 text-[#B5966F]" />
        <span>Faltan muy poquitos días</span>
      </div>

      {timeLeft.isExpired ? (
        <div className="text-center py-4 px-6 bg-[#F3ECE0] rounded-2xl border border-[#E4D9C8]">
          <p className="font-script text-2xl text-[#584D3E]">
            ¡El gran día ha llegado! 🎉
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-[#FAF6F0] rounded-xl p-2.5 sm:p-3 border border-[#E9DFCF] shadow-xs">
            <span className="block text-xl sm:text-2xl font-bold font-comfortaa text-[#584C3C]">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8F8271]">
              Días
            </span>
          </div>

          <div className="bg-[#FAF6F0] rounded-xl p-2.5 sm:p-3 border border-[#E9DFCF] shadow-xs">
            <span className="block text-xl sm:text-2xl font-bold font-comfortaa text-[#584C3C]">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8F8271]">
              Horas
            </span>
          </div>

          <div className="bg-[#FAF6F0] rounded-xl p-2.5 sm:p-3 border border-[#E9DFCF] shadow-xs">
            <span className="block text-xl sm:text-2xl font-bold font-comfortaa text-[#584C3C]">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8F8271]">
              Min
            </span>
          </div>

          <div className="bg-[#FAF6F0] rounded-xl p-2.5 sm:p-3 border border-[#E9DFCF] shadow-xs">
            <span className="block text-xl sm:text-2xl font-bold font-comfortaa text-[#584C3C]">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#8F8271]">
              Seg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
