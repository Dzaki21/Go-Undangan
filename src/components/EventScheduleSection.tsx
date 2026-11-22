import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, CalendarCheck } from 'lucide-react';
import { EventDetail } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface EventScheduleSectionProps {
  eventDateIso: string;
  akad: EventDetail;
  resepsi?: EventDetail & { enabled: boolean };
  themeConfig: ThemeConfig;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const EventScheduleSection: React.FC<EventScheduleSectionProps> = ({
  eventDateIso,
  akad,
  resepsi,
  themeConfig,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(eventDateIso).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [eventDateIso]);

  const renderEventCard = (event: EventDetail, subtitle: string) => (
    <div
      className={`rounded-3xl p-6 sm:p-8 border shadow-sm text-center flex flex-col items-center justify-between transition-all duration-300 hover:shadow-md flex-1 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
    >
      <div className="w-full space-y-4">
        <div
          className={`inline-block px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider ${themeConfig.badgeBg} ${themeConfig.badgeText}`}
        >
          {subtitle}
        </div>
        <h3 className={`font-serif text-2xl font-bold ${themeConfig.titleColor}`}>{event.title}</h3>

        <div className={`space-y-2.5 pt-2 text-sm ${themeConfig.bodyText}`}>
          <div className="flex items-center justify-center gap-2">
            <Calendar className={`w-4 h-4 flex-shrink-0 ${themeConfig.accentText}`} />
            <span className="font-medium">{event.dayName}, {event.dateFormatted}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className={`w-4 h-4 flex-shrink-0 ${themeConfig.accentText}`} />
            <span>{event.timeFormatted}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200/20 space-y-1">
          <div className={`flex items-start justify-center gap-2 font-medium ${themeConfig.titleColor}`}>
            <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${themeConfig.accentText}`} />
            <span>{event.locationName}</span>
          </div>
          <p className={`text-xs font-light max-w-xs mx-auto leading-relaxed ${themeConfig.mutedText}`}>
            {event.address}
          </p>
        </div>
      </div>

      <div className="w-full pt-6 mt-4">
        <a
          href={event.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 shadow-sm ${themeConfig.primaryBtn}`}
        >
          <span>Buka Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section className={`py-16 px-6 relative ${themeConfig.containerBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Countdown Header */}
        <div className="text-center space-y-3">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Menuju Hari Bahagia
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            Waktu & Lokasi Acara
          </h2>
          <div className={`w-16 h-0.5 mx-auto ${themeConfig.dividerColor}`} />
        </div>

        {/* Countdown Box */}
        <div
          className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto border ${
            themeConfig.id === 'dark-luxury'
              ? 'bg-[#18181d] border-gold-500/30 text-white'
              : themeConfig.id === 'floral'
              ? 'bg-[#324b39] border-emerald-700 text-emerald-50'
              : 'bg-stone-900 border-stone-800 text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-widest mb-6 opacity-85">
            <CalendarCheck className="w-4 h-4" />
            <span>Hitung Mundur Acara</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {[
              { val: timeLeft.days, label: 'Hari' },
              { val: timeLeft.hours, label: 'Jam' },
              { val: timeLeft.minutes, label: 'Menit' },
              { val: timeLeft.seconds, label: 'Detik' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-black/25 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/10"
              >
                <span
                  className={`block font-serif text-2xl sm:text-4xl font-bold ${
                    themeConfig.id === 'dark-luxury'
                      ? 'text-gold-400'
                      : themeConfig.id === 'floral'
                      ? 'text-emerald-200'
                      : 'text-amber-200'
                  }`}
                >
                  {item.val}
                </span>
                <span className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="flex flex-col gap-6 max-w-xl mx-auto">
          {renderEventCard(akad, 'Sesi Sakral')}
          {resepsi && resepsi.enabled && renderEventCard(resepsi, 'Sesi Perayaan')}
        </div>
      </div>
    </section>
  );
};
