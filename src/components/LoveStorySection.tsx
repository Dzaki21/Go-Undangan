import React from 'react';
import { Heart } from 'lucide-react';
import { LoveStoryItem } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface LoveStorySectionProps {
  loveStory?: LoveStoryItem[];
  themeConfig: ThemeConfig;
}

export const LoveStorySection: React.FC<LoveStorySectionProps> = ({ loveStory, themeConfig }) => {
  if (!loveStory || loveStory.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 px-6 relative ${themeConfig.subtleBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Kisah Kasih
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            Perjalanan Cerita Kami
          </h2>
          <div className={`w-16 h-0.5 mx-auto mt-2 ${themeConfig.dividerColor}`} />
        </div>

        {/* Timeline Container */}
        <div className={`relative border-l-2 ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8 border-current ${themeConfig.accentText} opacity-90`}>
          {loveStory.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white/80 ${
                  themeConfig.id === 'dark-luxury'
                    ? 'bg-gold-500'
                    : themeConfig.id === 'floral'
                    ? 'bg-[#3b5943]'
                    : 'bg-stone-800'
                }`}
              >
                <Heart className="w-3 h-3 fill-white" />
              </div>

              {/* Story Card */}
              <div
                className={`rounded-2xl p-5 sm:p-6 border shadow-sm transition-all duration-300 group-hover:shadow-md ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
              >
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${themeConfig.badgeBg} ${themeConfig.badgeText}`}
                >
                  {item.yearOrDate}
                </span>
                <h3 className={`font-serif text-lg sm:text-xl font-bold mb-2 ${themeConfig.titleColor}`}>
                  {item.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed font-light ${themeConfig.bodyText}`}>
                  {item.story}
                </p>

                {item.photoUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden aspect-video max-h-52 w-full">
                    <img
                      src={item.photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
