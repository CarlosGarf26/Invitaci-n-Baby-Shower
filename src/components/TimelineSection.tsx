import { useState } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Download } from 'lucide-react';

export function TimelineSection() {
  const [activeDay, setActiveDay] = useState<number>(2); // default to Sunday (Day 2, main event)

  const days = [
    {
      day: 'Viernes 13 Nov',
      title: 'Hospedaje libre & Llegada',
      subtitle: 'Inicio de la escapada',
      badge: 'Cabañas Abiertas',
      desc: 'Las cabañas estarán disponibles desde este día. Puedes llegar con calma desde el viernes para instalarte, desconectarte y disfrutar de las instalaciones.',
      iconText: '13',
    },
    {
      day: 'Sábado 14 Nov',
      title: 'Convivencia & Relajación',
      subtitle: 'Alberca y descanso previo',
      badge: 'Día Libre',
      desc: 'Día para disfrutar del sol, la alberca y compartir en familia preparándonos para la gran fiesta del domingo.',
      iconText: '14',
    },
    {
      day: 'Domingo 15 Nov',
      title: '¡Gran Baby Shower!',
      subtitle: 'Evento Principal & Festejo',
      badge: 'Comida Incluida',
      desc: '¡El momento cumbre! Consentiremos a todos los invitados con la comida especial del evento para celebrar y brindar juntos por la llegada del bebé.',
      iconText: '15',
      isPrimary: true,
    },
    {
      day: 'Lunes 16 Nov',
      title: 'Despedida & Salida',
      subtitle: 'Fin de la estancia',
      badge: 'Check-out',
      desc: 'Desayuno ligero, últimos momentos de alberca y despedida de las cabañas.',
      iconText: '16',
    },
  ];

  const handleAddToCalendar = () => {
    // Google Calendar URL for Sunday Nov 15
    const title = encodeURIComponent('Baby Shower en Villas Florines Tequesquitengo 👶');
    const details = encodeURIComponent(
      'Celebración del Baby Shower de nuestro bebé. Fin de semana de cabañas del 13 al 16 de Noviembre. Evento principal: Domingo 15.'
    );
    const location = encodeURIComponent('Villas Florines 33 IMSS Tequesquitengo, Morelos');
    // November 15th 13:00 to 20:00 UTC-6 (19:00 to 02:00Z)
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261115T130000/20261115T210000&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="itinerary-section" className="my-8">
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-widest text-[#968673] font-semibold">
          Fin de Semana Inolvidable
        </span>
        <h2 className="text-2xl sm:text-3xl font-script text-[#544838] mt-1">
          ¿Cuándo y cómo será?
        </h2>
        <p className="text-xs text-[#7A6E5E] max-w-xs mx-auto mt-1">
          Organizamos una escapada para disfrutar juntos del viernes 13 al lunes 16 de noviembre. Evento principal: Domingo 15.
        </p>
      </div>

      {/* Tabs / Day Selector */}
      <div className="flex gap-1.5 p-1 bg-[#F1E9DC] rounded-xl mb-5">
        {days.map((item, idx) => (
          <button
            key={item.day}
            id={`tab-day-${idx}`}
            type="button"
            onClick={() => setActiveDay(idx)}
            className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
              activeDay === idx
                ? 'bg-[#FDFBF7] text-[#4E4434] shadow-xs'
                : 'text-[#847868] hover:text-[#524738]'
            }`}
          >
            {item.day}
          </button>
        ))}
      </div>

      {/* Selected Day Card */}
      <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E8DEC9] shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#E5D7C3] text-[#63533E] mb-1.5">
              {days[activeDay].badge}
            </span>
            <h3 className="text-lg font-bold text-[#4B4031] font-comfortaa">
              {days[activeDay].title}
            </h3>
            <span className="text-xs text-[#827563] font-medium block">
              {days[activeDay].subtitle}
            </span>
          </div>

          <div className="w-11 h-11 rounded-xl bg-[#EFE6D8] border border-[#DFCFC0] flex items-center justify-center text-[#746452] font-bold text-xs">
            {days[activeDay].iconText}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6A5F4F] leading-relaxed mt-2 pt-2 border-t border-[#EFE5D4]">
          {days[activeDay].desc}
        </p>
      </div>

      {/* Calendar reminder button */}
      <div className="mt-4 text-center">
        <button
          id="btn-add-calendar"
          type="button"
          onClick={handleAddToCalendar}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0E6D5] hover:bg-[#E7DAC6] text-[#55493A] text-xs font-semibold transition-colors border border-[#DDD0BC] shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-[#8F7757]" />
          <span>Agendar en Google Calendar</span>
        </button>
      </div>
    </section>
  );
}
