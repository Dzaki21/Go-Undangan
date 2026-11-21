import React from 'react';
import { Quote as QuoteIcon, Heart } from 'lucide-react';
import { InvitationData } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface GreetingQuoteSectionProps {
  quote: InvitationData['quote'];
  themeConfig: ThemeConfig;
}

export const GreetingQuoteSection: React.FC<GreetingQuoteSectionProps> = ({
  quote,
  themeConfig,
}) => {
  return (
    <section className={`relative py-16 px-6 text-center overflow-hidden ${themeConfig.containerBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-4">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        {/* Decorative Top Heart / Ornament */}
        <div className="flex items-center justify-center gap-3">
          <div className={`h-[1px] w-12 ${themeConfig.dividerColor} opacity-50`} />
          <Heart className={`w-5 h-5 fill-current ${themeConfig.ornamentColor} animate-pulse-subtle`} />
          <div className={`h-[1px] w-12 ${themeConfig.dividerColor} opacity-50`} />
        </div>

        {/* Greeting Message */}
        <div className="space-y-2">
          <p className={`font-serif italic text-lg sm:text-xl font-medium ${themeConfig.titleColor}`}>
            Assalamu’alaikum Warahmatullahi Wabarakatuh
          </p>
          <p className={`text-xs sm:text-sm leading-relaxed font-light ${themeConfig.mutedText}`}>
            Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami.
          </p>
        </div>

        {/* Quote Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border shadow-sm relative mt-6 ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
        >
          <QuoteIcon className={`w-8 h-8 mx-auto mb-3 rotate-180 opacity-40 ${themeConfig.accentText}`} />
          <blockquote className={`font-serif italic text-sm sm:text-base leading-relaxed ${themeConfig.bodyText}`}>
            "{quote.text}"
          </blockquote>
          <p className={`mt-4 text-xs font-semibold uppercase tracking-wider ${themeConfig.accentText}`}>
            — {quote.source}
          </p>
        </div>
      </div>

      {themeConfig.showFloralDecor && (
        <div className="mt-8">
          <FloralDecor position="bottom" />
        </div>
      )}
    </section>
  );
};
