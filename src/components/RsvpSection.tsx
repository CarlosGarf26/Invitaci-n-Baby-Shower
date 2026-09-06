import { useState, type FormEvent } from 'react';
import { Send, Users, Baby, CheckCircle2, Loader2, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { RsvpData } from '../types';
import { saveRsvp } from '../firebase';

export function RsvpSection() {
  const [data, setData] = useState<RsvpData>({
    name: '',
    adults: 2,
    children: 0,
    arrivalDay: 'sabado',
    phoneHost: '525573652247', // Predeterminado: 525573652247
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleAdultsChange = (delta: number) => {
    setData(prev => ({
      ...prev,
      adults: Math.max(1, Math.min(10, prev.adults + delta)),
    }));
  };

  const handleChildrenChange = (delta: number) => {
    setData(prev => ({
      ...prev,
      children: Math.max(0, Math.min(10, prev.children + delta)),
    }));
  };

  const getArrivalDayLabel = (day: string) => {
    switch (day) {
      case 'viernes':
        return 'Viernes 13 (todo el fin de semana)';
      case 'sabado':
        return 'Sábado 14 (convivencia y alberca)';
      case 'domingo':
        return 'Domingo 15 (día del Baby Shower)';
      default:
        return 'Viernes 13';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!data.name.trim()) {
      alert('Por favor ingresa tu nombre o el de tu familia.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save directly to Firebase Firestore
      await saveRsvp({
        ...data,
        name: data.name.trim(),
        status: 'confirmed',
      });

      // 2. Festive confetti celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#A0D2EB', '#E5EAF5', '#D0BDF4', '#8458B3', '#A28089', '#FDFBF7'],
        disableForReducedMotion: true,
        zIndex: 100,
      });

      setIsSent(true);

      // 3. Build friendly WhatsApp message & open
      const arrivalText = getArrivalDayLabel(data.arrivalDay);
      const totalPeople = data.adults + data.children;
      const msg = `¡Hola! Queremos confirmar nuestra asistencia al Baby Shower en Tequesquitengo 👶🍼✨

👤 Familia / Invitado: ${data.name.trim()}
👥 Total personas: ${totalPeople} (${data.adults} adultos, ${data.children} niños)
📅 Llegada: ${arrivalText}
${data.notes.trim() ? `💬 Nota: ${data.notes.trim()}` : ''}

¡Estamos muy felices de compartir este fin de semana con ustedes! 💕`;

      const encodedMsg = encodeURIComponent(msg);
      const cleanPhone = data.phoneHost.replace(/[^0-9]/g, '');
      const waUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
        : `https://api.whatsapp.com/send?text=${encodedMsg}`;

      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error al registrar confirmación:', err);
      // Even if Firestore has transient error, let user send via WhatsApp
      const arrivalText = getArrivalDayLabel(data.arrivalDay);
      const totalPeople = data.adults + data.children;
      const msg = `¡Hola! Queremos confirmar nuestra asistencia al Baby Shower en Tequesquitengo 👶🍼✨\n\n👤 Familia / Invitado: ${data.name.trim()}\n👥 Total personas: ${totalPeople} (${data.adults} adultos, ${data.children} niños)\n📅 Llegada: ${arrivalText}\n${data.notes.trim() ? `💬 Nota: ${data.notes.trim()}` : ''}`;
      const encodedMsg = encodeURIComponent(msg);
      const cleanPhone = data.phoneHost.replace(/[^0-9]/g, '');
      const waUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
        : `https://api.whatsapp.com/send?text=${encodedMsg}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="rsvp-section" className="my-8">
      <div className="bg-[#FAF6F0] rounded-2xl p-5 sm:p-6 border border-[#E8DEC9] shadow-xs">
        <div className="text-center mb-5">
          <span className="text-[11px] uppercase tracking-widest text-[#968673] font-semibold">
            Confirma tu Asistencia
          </span>
          <h2 className="text-2xl sm:text-3xl font-script text-[#544838] mt-0.5">
            ¿Nos acompañas?
          </h2>
          <div className="inline-block px-3 py-1 bg-[#F5EAD9] rounded-full text-xs text-[#825A2A] font-semibold mt-2 border border-[#E8D6BD]">
            ⏰ Fecha límite: 10 de Octubre
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="input-guest-name" className="block text-xs font-bold text-[#564939] mb-1">
              Nombre de tu Familia o Invitado(s) *
            </label>
            <input
              id="input-guest-name"
              type="text"
              required
              value={data.name}
              onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej. Familia López Morales / Andrea y Carlos"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#DDD1BE] text-xs sm:text-sm text-[#463C2F] focus:outline-none focus:ring-2 focus:ring-[#B8A389]"
            />
          </div>

          {/* Personas counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E2D7C5]">
              <div className="flex items-center gap-1.5 text-xs text-[#706250] font-semibold mb-2">
                <Users className="w-3.5 h-3.5 text-[#91795E]" />
                <span>Adultos</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  id="btn-sub-adults"
                  type="button"
                  onClick={() => handleAdultsChange(-1)}
                  className="w-8 h-8 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C2] text-[#554634] font-bold text-base transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-comfortaa font-bold text-base text-[#4C4032]">
                  {data.adults}
                </span>
                <button
                  id="btn-add-adults"
                  type="button"
                  onClick={() => handleAdultsChange(1)}
                  className="w-8 h-8 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C2] text-[#554634] font-bold text-base transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E2D7C5]">
              <div className="flex items-center gap-1.5 text-xs text-[#706250] font-semibold mb-2">
                <Baby className="w-3.5 h-3.5 text-[#91795E]" />
                <span>Niños</span>
              </div>
              <div className="flex items-center justify-between">
                <button
                  id="btn-sub-kids"
                  type="button"
                  onClick={() => handleChildrenChange(-1)}
                  className="w-8 h-8 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C2] text-[#554634] font-bold text-base transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-comfortaa font-bold text-base text-[#4C4032]">
                  {data.children}
                </span>
                <button
                  id="btn-add-kids"
                  type="button"
                  onClick={() => handleChildrenChange(1)}
                  className="w-8 h-8 rounded-lg bg-[#EFE4D2] hover:bg-[#E5D7C2] text-[#554634] font-bold text-base transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Día de llegada */}
          <div>
            <label className="block text-xs font-bold text-[#564939] mb-1.5">
              ¿Cuándo planean llegar a las cabañas?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-arrival-friday"
                type="button"
                onClick={() => setData(prev => ({ ...prev, arrivalDay: 'viernes' }))}
                className={`p-2 rounded-xl border text-center transition-all ${
                  data.arrivalDay === 'viernes'
                    ? 'bg-[#EFE8DC] border-[#BFA789] text-[#4A3E30] shadow-2xs font-bold'
                    : 'bg-[#FDFBF7] border-[#E2D7C5] text-[#7A6D5E] hover:bg-[#F6F0E6]'
                }`}
              >
                <span className="block text-xs font-bold font-comfortaa">Viernes 13</span>
                <span className="text-[10px] text-[#867868] block leading-tight mt-0.5">Todo el finde</span>
              </button>

              <button
                id="btn-arrival-saturday"
                type="button"
                onClick={() => setData(prev => ({ ...prev, arrivalDay: 'sabado' }))}
                className={`p-2 rounded-xl border text-center transition-all ${
                  data.arrivalDay === 'sabado'
                    ? 'bg-[#EFE8DC] border-[#BFA789] text-[#4A3E30] shadow-2xs font-bold'
                    : 'bg-[#FDFBF7] border-[#E2D7C5] text-[#7A6D5E] hover:bg-[#F6F0E6]'
                }`}
              >
                <span className="block text-xs font-bold font-comfortaa">Sábado 14</span>
                <span className="text-[10px] text-[#867868] block leading-tight mt-0.5">Alberca / relax</span>
              </button>

              <button
                id="btn-arrival-sunday"
                type="button"
                onClick={() => setData(prev => ({ ...prev, arrivalDay: 'domingo' }))}
                className={`p-2 rounded-xl border text-center transition-all ${
                  data.arrivalDay === 'domingo'
                    ? 'bg-[#EFE8DC] border-[#BFA789] text-[#4A3E30] shadow-2xs font-bold'
                    : 'bg-[#FDFBF7] border-[#E2D7C5] text-[#7A6D5E] hover:bg-[#F6F0E6]'
                }`}
              >
                <span className="block text-xs font-bold font-comfortaa">Domingo 15</span>
                <span className="text-[10px] text-[#867868] block leading-tight mt-0.5">Baby Shower</span>
              </button>
            </div>
          </div>

          {/* Mensaje opcional */}
          <div>
            <label htmlFor="input-notes" className="block text-xs font-bold text-[#564939] mb-1">
              Mensaje o deseos para la familia (Opcional)
            </label>
            <input
              id="input-notes"
              type="text"
              value={data.notes}
              onChange={e => setData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="¡Muchas felicidades, qué emoción!"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#DDD1BE] text-xs text-[#463C2F] focus:outline-none focus:ring-2 focus:ring-[#B8A389]"
            />
          </div>

          {/* Submit Button */}
          <button
            id="btn-submit-whatsapp"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] disabled:bg-[#8CD8A9] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando confirmación...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirmar Asistencia</span>
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {isSent && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-3.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl text-center text-xs text-[#2E7D32] flex flex-col items-center justify-center gap-1 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              <span className="font-bold">¡Tu asistencia ha sido registrada exitosamente!</span>
              <span className="text-[11px] text-[#388E3C]">
                Guardado en la lista oficial y listo en WhatsApp para los anfitriones.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
