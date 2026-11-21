import React from 'react';
import { MailOpen, Calendar } from 'lucide-react';
import { InvitationData } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface CoverSectionProps {
  data: InvitationData;
  guestName: string;
  isOpen: boolean;
  themeConfig: ThemeConfig;
  onOpenInvitation: () => void;
}

export const CoverSection: React.FC<CoverSectionProps> = ({
  data,
  guestName,
  isOpen,
  themeConfig,
  onOpenInvitation,
}) => {
  return (
    <section
      id="cover"
      className={`fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-stone-900 text-stone-100 transition-all duration-1000 ease-in-out ${
        isOpen
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Background Image with Dynamic Theme Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.gallery?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'}
          alt="Wedding Background"
          className="w-full h-full object-cover object-center filter brightness-[0.4] scale-105 transition-transform duration-1000"
        />
        <div className={`absolute inset-0 ${themeConfig.coverOverlay} backdrop-blur-[2px]`} />
      </div>

      {/* Decorative Ornaments */}
      {themeConfig.id === 'floral' ? (
        <>
          <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
            <FloralDecor position="top" className="scale-125 opacity-90" />
          </div>
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <FloralDecor position="bottom" className="scale-125 opacity-90" />
          </div>
        </>
      ) : themeConfig.id === 'dark-luxury' ? (
        <>
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-gold-400/50 pointer-events-none rounded-tl-xl" />
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-gold-400/50 pointer-events-none rounded-br-xl" />
        </>
      ) : (
        <>
          <div className="absolute top-8 left-8 right-8 bottom-8 border border-white/20 pointer-events-none rounded-3xl" />
        </>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg px-6 py-10 mx-auto text-center flex flex-col items-center justify-between min-h-screen max-h-[860px]">
        {/* Top Header */}
        <div className="pt-8 space-y-2 animate-fade-in">
          <p className="tracking-[0.35em] uppercase text-xs sm:text-sm text-stone-200 font-medium">
            The Wedding Of
          </p>
          <div className={`w-12 h-[1px] mx-auto my-2 ${themeConfig.dividerColor}`} />
        </div>

        {/* Couple Names */}
        <div className="space-y-4 my-auto py-6">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-white drop-shadow-md">
            <span>{data.groom.nickName}</span>
            <span className="font-script text-4xl sm:text-6xl block my-1 text-gold-300">
              &
            </span>
            <span>{data.bride.nickName}</span>
          </h1>

          <div className="flex items-center justify-center gap-2 text-stone-200 text-xs sm:text-sm font-light tracking-widest pt-2">
            <Calendar className="w-4 h-4 text-gold-300" />
            <span>{data.events.akad.dateFormatted}</span>
          </div>
        </div>

        {/* Guest Greeting & CTA Button */}
        <div className="w-full pb-10 space-y-5">
          <div className={`rounded-2xl p-4 sm:p-5 ${themeConfig.coverGreetingBox}`}>
            <p className="text-[11px] uppercase tracking-widest opacity-70 mb-1">
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <h2 className="text-lg sm:text-xl font-bold tracking-wide break-words">
              {guestName}
            </h2>
            <p className="text-[11px] opacity-60 italic mt-1">
              *Mohon maaf bila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          <button
            onClick={onOpenInvitation}
            className={`w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mx-auto cursor-pointer ${themeConfig.coverButton}`}
          >
            <MailOpen className="w-4 h-4 stroke-[2.2]" />
            <span>Buka Undangan</span>
          </button>
        </div>
      </div>
    </section>
  );
};
