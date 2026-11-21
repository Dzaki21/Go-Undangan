import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { ThemeConfig } from '../themes';
import { FloralDecor } from './FloralDecor';

interface GallerySectionProps {
  gallery?: string[];
  themeConfig: ThemeConfig;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery, themeConfig }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!gallery || gallery.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 px-6 relative ${themeConfig.containerBg}`}>
      {themeConfig.showFloralDecor && (
        <div className="mb-6">
          <FloralDecor position="top" />
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className={`text-xs uppercase tracking-widest font-semibold ${themeConfig.sectionSubtitleColor}`}>
            Momen Bahagia
          </span>
          <h2 className={`font-serif text-3xl sm:text-4xl ${themeConfig.titleColor}`}>
            Galeri Foto Pre-Wedding
          </h2>
          <div className={`w-16 h-0.5 mx-auto mt-2 ${themeConfig.dividerColor}`} />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {gallery.map((photoUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhoto(photoUrl)}
              className={`aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative border ${themeConfig.cardBorder}`}
            >
              <img
                src={photoUrl}
                alt={`Prewedding ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-900 shadow">
                  <Image className="w-5 h-5 text-stone-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 sm:-right-4 text-white hover:text-gold-400 p-2 rounded-full focus:outline-none cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={selectedPhoto}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl mx-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
};
