import React from 'react';
import { Palette } from 'lucide-react';
import { ThemeType } from '../themes';

interface DevThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const DevThemeSwitcher: React.FC<DevThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  // Hanya tampil saat mode development Vite (import.meta.env.DEV)
  if (!import.meta.env.DEV) {
    return null;
  }

  const themeList: { key: ThemeType; label: string; dotColor: string }[] = [
    { key: 'minimalist', label: 'Minimalist', dotColor: 'bg-amber-100 border-stone-400' },
    { key: 'floral', label: 'Floral Sage', dotColor: 'bg-emerald-400 border-emerald-700' },
    { key: 'dark-luxury', label: 'Dark Luxury', dotColor: 'bg-stone-900 border-gold-400' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="bg-stone-950/90 backdrop-blur-md text-stone-200 border border-stone-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-gold-400 uppercase tracking-wider border-b border-stone-800">
          <Palette className="w-3.5 h-3.5" />
          <span>Dev Theme Switcher</span>
        </div>

        <div className="flex flex-col gap-1 pt-0.5">
          {themeList.map((item) => (
            <button
              key={item.key}
              onClick={() => onThemeChange(item.key)}
              className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                currentTheme === item.key
                  ? 'bg-stone-800 text-white font-medium shadow-sm'
                  : 'hover:bg-stone-800/60 text-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full border ${item.dotColor}`} />
                <span>{item.label}</span>
              </div>
              {currentTheme === item.key && (
                <span className="text-[10px] text-gold-400 font-bold">ACTIVE</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
