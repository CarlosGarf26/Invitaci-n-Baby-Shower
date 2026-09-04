/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Mail, Star, Lock } from 'lucide-react';
import { EnvelopeModal } from './components/EnvelopeModal';
import { MusicPlayer } from './components/MusicPlayer';
import { Countdown } from './components/Countdown';
import { TimelineSection } from './components/TimelineSection';
import { LocationCard } from './components/LocationCard';
import { InfoCards } from './components/InfoCards';
import { GenderPoll } from './components/GenderPoll';
import { RsvpSection } from './components/RsvpSection';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A4337] relative overflow-x-hidden selection:bg-[#EBDDC3]">
      {/* Floating Background Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-6 text-[#E4D7C2] opacity-40 animate-float">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute top-44 right-8 text-[#E4D7C2] opacity-35 animate-float-slow">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute top-1/3 left-4 text-[#DECDB6] opacity-30 animate-float">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute bottom-40 right-6 text-[#DECDB6] opacity-30 animate-float-slow">
          <Heart className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* Interactive Envelope Intro Modal */}
      <EnvelopeModal
        isOpen={showEnvelope}
        onOpenInvitation={() => setShowEnvelope(false)}
      />

      {/* Host Admin Modal */}
      <AdminModal
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
      />

      {/* Floating Music Player */}
      <MusicPlayer />

      {/* Main Container - Mobile First Card Style */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-8 sm:py-12">
        
        {/* Top Floating Badge, Envelope Re-open & Admin access */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE7D8] text-[#7A6B56] text-[11px] font-semibold tracking-wider uppercase border border-[#E3D7C3]">
            <Sparkles className="w-3.5 h-3.5 text-[#B8986B]" />
            <span>Baby Shower Escapada</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-admin-top"
              type="button"
              onClick={() => setShowAdmin(true)}
              title="Panel de Anfitriones"
              className="inline-flex items-center gap-1 text-xs text-[#8A7965] hover:text-[#4A3E2F] py-1 px-2.5 rounded-full bg-[#FAF3E8] border border-[#E6D9C5] transition-colors"
            >
              <Lock className="w-3 h-3 text-[#B8986B]" />
              <span className="hidden sm:inline">Anfitriones</span>
            </button>

            <button
              id="btn-reopen-envelope"
              type="button"
              onClick={() => setShowEnvelope(true)}
              className="inline-flex items-center gap-1 text-xs text-[#8A7965] hover:text-[#4A3E2F] py-1 px-2.5 rounded-full bg-[#FAF3E8] border border-[#E6D9C5] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Ver Sobre</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <header className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#E8DEC9] shadow-xs text-center relative overflow-hidden">
          {/* Custom background image container (watermark) */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: 'url("https://raw.githubusercontent.com/CarlosGarf26/bot-telegram-assets/f3a34a65b141a01bb674f440d342afc23bfe5a31/Code_Generated_Image.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
            }}
          />
          {/* Subtle top pastel aura overlay */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#F5EAD7]/60 to-transparent pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="text-[11px] uppercase tracking-widest text-[#938370] font-semibold block mb-1">
              ¡Una nueva aventura comienza!
            </span>

            <h1 className="text-4xl sm:text-5xl font-script text-[#4E4130] my-2 leading-tight">
              Baby Shower
            </h1>

            <div className="w-16 h-0.5 bg-[#D5C4AC] mx-auto my-3" />

            <p className="text-xs sm:text-sm text-[#6C5E4C] leading-relaxed max-w-sm mx-auto font-medium">
              Como Bulma y Vegeta, estamos listos para recibir a nuestro Bebé Sajayin. ¡Acompáñanos a celebrar en esta escapada tan especial!
            </p>

            {/* Event highlights pill */}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1 bg-[#EBE0CF] rounded-full text-[#5B4C38] font-bold">
                📅 Sábado 21 de Noviembre
              </span>
              <span className="px-3 py-1 bg-[#E6EADB] rounded-full text-[#4E5C46] font-semibold">
                🏡 Cabañas Tequesquitengo
              </span>
            </div>

            {/* Countdown Component */}
            <div className="mt-6 pt-5 border-t border-[#EDE2D1]">
              <Countdown />
            </div>
          </motion.div>
        </header>

        {/* Section 1: Timeline / Weekend Itinerary */}
        <TimelineSection />

        {/* Section 2: Location Card */}
        <LocationCard />

        {/* Section 3: Interactive Gender Poll Game */}
        <GenderPoll />

        {/* Section 4: Details of Stay (Food, Lodging, Gifts, Deadline) */}
        <InfoCards />

        {/* Section 5: RSVP to WhatsApp */}
        <RsvpSection />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-[#E8DEC9] mt-10 space-y-3">
          <Heart className="w-6 h-6 text-[#C79D73] mx-auto mb-2 fill-[#C79D73]/30" />
          <p className="font-script text-2xl sm:text-3xl text-[#534635]">
            ¡Esperamos contar contigo para compartir esta gran alegría!
          </p>
          <p className="text-xs text-[#8F816F]">
            Con todo nuestro cariño y emoción ✨
          </p>

          <div className="pt-3">
            <button
              id="btn-open-admin-footer"
              type="button"
              onClick={() => setShowAdmin(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFE6D8] hover:bg-[#E4D7C3] text-[#786650] hover:text-[#4B3D2C] text-xs font-semibold border border-[#DDD0BC] transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Panel de Anfitriones (Admin)</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
