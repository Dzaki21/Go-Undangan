import React from 'react';
import { Heart } from 'lucide-react';
import { PersonProfile } from '../types/invitation';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface CoupleProfileSectionProps {
  groom: PersonProfile;
  bride: PersonProfile;
  themeConfig: ThemeConfig;
}

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const ProfileCard: React.FC<{
  profile: PersonProfile;
  role: 'Mempelai Pria' | 'Mempelai Wanita';
  themeConfig: ThemeConfig;
}> = ({ profile, role, themeConfig }) => {
  return (
    <div
      className={`flex flex-col items-center text-center p-6 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-md max-w-sm w-full mx-auto ${themeConfig.cardBg} ${themeConfig.cardBorder}`}
    >
      {/* Photo Frame */}
      <div className="relative mb-6">
        <div
          className={`w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden p-1.5 border-2 shadow-inner ${
            themeConfig.id === 'dark-luxury'
              ? 'border-gold-400/70'
              : themeConfig.id === 'floral'
              ? 'border-emerald-400/70'
              : themeConfig.id === 'royal-vintage'
              ? 'border-[#912033] ring-4 ring-[#b88e63]/60 shadow-xl'
              : 'border-stone-300'
          }`}
        >
          <img
            src={profile.photoUrl}
            alt={profile.fullName}
            className="w-full h-full object-cover rounded-full filter contrast-105"
          />
        </div>
        <div
          className={`absolute -bottom-2 right-2 text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full shadow-md ${themeConfig.badgeBg} ${themeConfig.badgeText}`}
        >
          {role}
        </div>
      </div>

      {/* Name and Parents */}
      <h3 className={`font-serif text-xl sm:text-2xl font-bold mb-1 ${themeConfig.titleColor}`}>
        {profile.fullName}
      </h3>
      <p className={`text-xs sm:text-sm font-light mt-1 mb-4 leading-relaxed px-2 ${themeConfig.mutedText}`}>
        {profile.parents}
      </p>

      {/* Instagram Button */}
      {profile.instagramUrl && (
        <a
          href={profile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 ${themeConfig.secondaryBtn}`}
        >
          <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
          <span>@{profile.instagramUsername || 'Instagram'}</span>
        </a>
      )}
    </div>
  );
};

export const CoupleProfileSection: React.FC<CoupleProfileSectionProps> = ({
  groom,
  bride,
  themeConfig,
}) => {
  return (
    <section className={`py-16 px-6 relative ${themeConfig.subtleBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Mempelai
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            Dua Insan Satu Cinta
          </h2>
          <div className={`w-16 h-0.5 mx-auto mt-2 ${themeConfig.dividerColor}`} />
        </div>

        <div className="flex flex-col items-center justify-center gap-8 relative">
          <ProfileCard profile={groom} role="Mempelai Pria" themeConfig={themeConfig} />

          {/* Center Divider Heart */}
          <div className="flex flex-col items-center justify-center z-10 -my-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                themeConfig.id === 'dark-luxury'
                  ? 'bg-gold-500 text-stone-950'
                  : themeConfig.id === 'floral'
                  ? 'bg-[#3b5943] text-white'
                  : themeConfig.id === 'royal-vintage'
                  ? 'bg-[#6e1322] text-[#f5e9e2] border-2 border-[#b88e63]'
                  : 'bg-stone-900 text-white'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>

          <ProfileCard profile={bride} role="Mempelai Wanita" themeConfig={themeConfig} />
        </div>
      </div>
    </section>
  );
};
