import React, { useState } from 'react';
import { X, Smartphone, Monitor, Check } from 'lucide-react';
import { ThemeType, themes } from '../themes';
import { fallbackInvitationData } from '../invitationData';
import { CoverSection } from './CoverSection';
import { GreetingQuoteSection } from './GreetingQuoteSection';
import { CoupleProfileSection } from './CoupleProfileSection';
import { EventScheduleSection } from './EventScheduleSection';
import { LoveStorySection } from './LoveStorySection';
import { GallerySection } from './GallerySection';
import { WeddingGiftSection } from './WeddingGiftSection';
import { RsvpSection } from './RsvpSection';

interface TemplatePreviewModalProps {
  theme: ThemeType;
  onClose: () => void;
  onSelect: (theme: ThemeType) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  theme,
  onClose,
  onSelect,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isOpen, setIsOpen] = useState(false);

  const themeConfig = themes[theme] || themes.minimalist;
  const mockData = {
    ...fallbackInvitationData,
    theme,
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-900 rounded-3xl border border-stone-700/60 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 text-white z-20">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-base text-gold-400">
              Pratinjau: {themeConfig.name}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 hidden sm:inline">
              Mode Demo Interaktif
            </span>
          </div>

          {/* Device View Toggler */}
          <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceMode === 'mobile' ? 'bg-gold-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
              }`}
              title="Tampilan Smartphone (Mobile)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceMode === 'desktop' ? 'bg-gold-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
              }`}
              title="Tampilan Desktop"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(theme)}
              className="px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 text-xs sm:text-sm font-semibold rounded-full shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Gunakan Tema Ini</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
              title="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview Frame */}
        <div className="flex-1 bg-stone-950 flex items-center justify-center overflow-hidden p-2 sm:p-4">
          <div
            className={`transition-all duration-300 relative bg-stone-50 overflow-hidden shadow-2xl flex flex-col ${
              deviceMode === 'mobile'
                ? 'w-full max-w-[420px] h-full rounded-[2.5rem] border-[6px] border-stone-800'
                : 'w-full h-full rounded-2xl border border-stone-800'
            }`}
          >
            {/* Scrollable Container */}
            <div className={`w-full h-full overflow-y-auto ${themeConfig.pageBg}`}>
              {/* Cover */}
              <CoverSection
                data={mockData}
                guestName="Bapak/Ibu/Saudara/i"
                isOpen={isOpen}
                themeConfig={themeConfig}
                onOpenInvitation={handleOpenInvitation}
              />

              {/* Main Content Sections */}
              <main className={`w-full max-w-xl mx-auto shadow-2xl overflow-hidden border-x ${themeConfig.containerBg} ${themeConfig.containerBorder}`}>
                <GreetingQuoteSection quote={mockData.quote} themeConfig={themeConfig} />
                <CoupleProfileSection groom={mockData.groom} bride={mockData.bride} themeConfig={themeConfig} />
                <EventScheduleSection eventDateIso={mockData.eventDateIso} akad={mockData.events.akad} resepsi={mockData.events.resepsi} themeConfig={themeConfig} />
                <LoveStorySection loveStory={mockData.loveStory} themeConfig={themeConfig} />
                <GallerySection gallery={mockData.gallery} themeConfig={themeConfig} />
                <WeddingGiftSection gifts={mockData.gifts} themeConfig={themeConfig} />
                <RsvpSection defaultComments={mockData.defaultComments} groomNick={mockData.groom.nickName} brideNick={mockData.bride.nickName} themeConfig={themeConfig} />
              </main>

              {/* Reset view cover pill for testing */}
              {isOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="fixed bottom-6 left-6 z-50 px-3 py-1.5 bg-stone-900/80 backdrop-blur-md text-stone-200 text-xs rounded-full border border-stone-700 hover:bg-stone-900 shadow-lg cursor-pointer"
                >
                  ↩ Ulangi Buka Sampul
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
