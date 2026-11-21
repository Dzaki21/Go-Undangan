import React from 'react';
import { Disc3, VolumeX } from 'lucide-react';
import { ThemeConfig } from '../themes';

interface FloatingMusicPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  themeConfig: ThemeConfig;
  onTogglePlay: () => void;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  isPlaying,
  themeConfig,
  onTogglePlay,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onTogglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 backdrop-blur-md cursor-pointer ${
          themeConfig.musicBtnBg
        } ${themeConfig.musicBtnBorder} ${
          isPlaying
            ? 'animate-spin-slow'
            : 'hover:scale-105 opacity-80 hover:opacity-100'
        }`}
        title={isPlaying ? 'Pause Musik' : 'Putar Musik'}
        aria-label="Kontrol Musik Latar"
      >
        {isPlaying ? (
          <Disc3 className={`w-6 h-6 ${themeConfig.musicBtnIcon}`} />
        ) : (
          <VolumeX className={`w-5 h-5 ${themeConfig.musicBtnIcon}`} />
        )}
      </button>
    </div>
  );
};
