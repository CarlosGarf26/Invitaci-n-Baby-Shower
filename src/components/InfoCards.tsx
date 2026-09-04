import { useState, type MouseEvent } from 'react';
import { Ticket, Gift, UtensilsCrossed, AlertTriangle, ChevronDown, Copy, Check } from 'lucide-react';

export function InfoCards() {
  const [expandedId, setExpandedId] = useState<string | null>('confirmacion');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleCopyAccount = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('722969010522604555');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  return (
    <section id="details-section" className="my-8">
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-widest text-[#968673] font-semibold">
          Información Importante
        </span>
        <h2 className="text-2xl sm:text-3xl font-script text-[#544838] mt-1">
          Detalles de la estancia
        </h2>
        <p className="text-xs text-[#7A6E5E] max-w-xs mx-auto mt-1">
          Todo lo que necesitas saber para disfrutar de esta gran escapada.
        </p>
      </div>

      <div className="space-y-3">
        {/* 1. Confirmación Importante */}
        <div
          id="card-confirmacion"
          className="rounded-2xl border border-[#DEC4A7] bg-[#FFF8EE] shadow-2xs overflow-hidden transition-all"
        >
          <button
            type="button"
            onClick={() => toggleExpand('confirmacion')}
            className="w-full text-left p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F6DEBC] text-[#86592B] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A26D35]">
                  ¡Muy Importante!
                </span>
                <h3 className="text-sm font-bold font-comfortaa text-[#573919]">
                  Confirmar antes del 16 de Octubre
                </h3>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#9F7A4C] transition-transform duration-200 ${
                expandedId === 'confirmacion' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedId === 'confirmacion' && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#6C5338] space-y-2 border-t border-[#F1E0CA]">
              <p>
                Por favor, confírmanos tu asistencia a más tardar el{' '}
                <strong className="text-[#884D19]">16 de octubre</strong>, indicando el número total
                de personas que te acompañarán (adultos y niños).
              </p>
              <div className="p-2.5 rounded-xl bg-[#FCEFDC] border border-[#F3DFC1] text-[11px] leading-relaxed">
                <strong>Nota sobre el hospedaje:</strong> Después de esta fecha será sumamente
                complicado asegurar lugares adicionales en las cabañas y el costo del hospedaje
                cambiaría según las tarifas de la administración.
              </div>
            </div>
          )}
        </div>

        {/* 2. Cooperación */}
        <div
          id="card-cooperacion"
          className="rounded-2xl border border-[#E7DEC9] bg-[#FAF6F0] shadow-2xs overflow-hidden transition-all"
        >
          <button
            type="button"
            onClick={() => toggleExpand('cooperacion')}
            className="w-full text-left p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBE0CD] text-[#78644A] flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7558]">
                  Hospedaje Completo
                </span>
                <h3 className="text-sm font-bold font-comfortaa text-[#4A3F31]">
                  Cooperación: $60 por persona
                </h3>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#8A7A66] transition-transform duration-200 ${
                expandedId === 'cooperacion' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedId === 'cooperacion' && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#6B5E4D] border-t border-[#EFE5D4]">
              <p className="mb-3">
                Para cubrir la reservación de las cabañas durante todo el fin de semana (viernes a lunes),
                solicitamos una cooperación simbólica de <strong>$60 pesos por persona</strong>.
              </p>
              <div className="bg-[#F6EFE5] p-3 rounded-xl border border-[#E8DEC9]">
                <p className="text-[10px] uppercase tracking-widest text-[#8A7558] font-bold mb-1">Datos de transferencia</p>
                <p className="font-medium text-[#4A3F31] mb-0.5"><strong>Banco:</strong> Mercado Pago</p>
                <p className="font-medium text-[#4A3F31] mb-0.5"><strong>A nombre de:</strong> Alma Blanca Hernandez</p>
                <div className="flex items-center justify-between mt-2 bg-white px-2.5 py-2 rounded-lg border border-[#D5C7B2]">
                  <span className="font-comfortaa font-bold text-[#574A39]">722969010522604555</span>
                  <button 
                    onClick={handleCopyAccount} 
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide text-[#7A6D5C] hover:text-[#453B2F] transition-colors bg-[#F6F0E5] px-2 py-1 rounded"
                  >
                    {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedAccount ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Comidas durante la estancia */}
        <div
          id="card-comidas"
          className="rounded-2xl border border-[#E7DEC9] bg-[#FAF6F0] shadow-2xs overflow-hidden transition-all"
        >
          <button
            type="button"
            onClick={() => toggleExpand('comidas')}
            className="w-full text-left p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBE0CD] text-[#78644A] flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7558]">
                  Alimentos y Bebidas
                </span>
                <h3 className="text-sm font-bold font-comfortaa text-[#4A3F31]">
                  Comidas y cocina en cabañas
                </h3>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#8A7A66] transition-transform duration-200 ${
                expandedId === 'comidas' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedId === 'comidas' && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#6B5E4D] space-y-2 border-t border-[#EFE5D4]">
              <p>
                🍲 <strong>Sábado:</strong> Consentiremos a todos los invitados con la deliciosa comida del
                evento para festejar juntos.
              </p>
              <p>
                🧺 <strong>Resto de los días:</strong> Cada quien podrá organizar sus alimentos a su gusto.
                Las cabañas cuentan con <strong>su propia cocina y refrigerador independiente</strong>, así
                que pueden llevar todo lo necesario para sentirse como en casa.
              </p>
            </div>
          )}
        </div>

        {/* 4. Detalle de Regalos */}
        <div
          id="card-regalos"
          className="rounded-2xl border border-[#E7DEC9] bg-[#FAF6F0] shadow-2xs overflow-hidden transition-all"
        >
          <button
            type="button"
            onClick={() => toggleExpand('regalos')}
            className="w-full text-left p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBE0CD] text-[#78644A] flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7558]">
                  Detalle Especial
                </span>
                <h3 className="text-sm font-bold font-comfortaa text-[#4A3F31]">
                  Regalos: Nuestro Bebé Saiyajin
                </h3>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#8A7A66] transition-transform duration-200 ${
                expandedId === 'regalos' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedId === 'regalos' && (
            <div className="px-4 pb-4 pt-1 text-xs text-[#6B5E4D] space-y-1.5 border-t border-[#EFE5D4]">
              <p>
                El sexo y el nombre de nuestro Bebé Saiyajin serán una sorpresa total hasta el día de su nacimiento.
              </p>
              <p className="text-[11px] text-[#7C6F5E] italic">
                Te pedimos considerarlo para cualquier detalle o regalito (se sugieren colores neutros
                como blanco, beige, menta o amarillo, artículos esenciales).
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
