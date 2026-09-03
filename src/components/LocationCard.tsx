import { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Copy, Check } from 'lucide-react';

export function LocationCard() {
  const [copied, setCopied] = useState(false);
  const addressText = 'Villas Florines 33, IMSS Tequesquitengo, Morelos';
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Villas+Florines+33+IMSS+Tequesquitengo';
  const wazeUrl = 'https://waze.com/ul?q=Villas+Florines+33+IMSS+Tequesquitengo';

  const handleCopy = () => {
    navigator.clipboard.writeText(addressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="location-section" className="my-8">
      <div className="bg-[#FAF6F0] rounded-2xl p-5 sm:p-6 border border-[#E8DEC9] shadow-xs">
        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-full bg-[#EFE4D2] text-[#7E694E] flex items-center justify-center mx-auto mb-2 border border-[#DFD1BD]">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#948370] font-semibold">
            ¿Dónde nos vemos?
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-comfortaa text-[#4A4032] mt-0.5">
            Villas Florines 33
          </h3>
          <p className="text-xs sm:text-sm text-[#746755] font-medium">
            IMSS Tequesquitengo, Morelos 🏡
          </p>
        </div>

        {/* Decorative Map Card Badge */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#E7DECf] via-[#E2D5C3] to-[#D5C6B1] p-4 text-center border border-[#D8C7B0] mb-4">
          <div className="text-xs text-[#594B39] font-medium">
            Hermosas cabañas con alberca y jardines para compartir un fin de semana lleno de amor y alegría.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <a
            id="btn-google-maps"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#596B57] hover:bg-[#4D5E4B] text-[#FFFDF8] text-xs font-semibold shadow-xs transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Abrir en Google Maps</span>
          </a>

          <a
            id="btn-waze"
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F0E6D6] hover:bg-[#E6DAC7] text-[#554737] text-xs font-semibold border border-[#DACBB7] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#88745C]" />
            <span>Abrir en Waze</span>
          </a>
        </div>

        <div className="mt-3 text-center">
          <button
            id="btn-copy-address"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#7A6D5C] hover:text-[#453B2F] font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">¡Dirección copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar dirección para GPS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
