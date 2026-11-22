import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight, ShieldCheck, Zap, Globe, Music, Smartphone, Eye, LogOut } from 'lucide-react';
import { ThemeType } from '../themes';
import { TemplatePreviewModal } from '../components/TemplatePreviewModal';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';

interface LandingPageProps {
  onSelectTemplate: (template: ThemeType) => void;
  onNavigateLogin: () => void;
  onNavigateDashboard: () => void;
  onLogout?: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectTemplate,
  onNavigateLogin,
  onNavigateDashboard,
  onLogout,
  isLoggedIn,
}) => {
  const [previewTheme, setPreviewTheme] = useState<ThemeType | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const templateCards: {
    id: ThemeType;
    title: string;
    description: string;
    tag: string;
    badgeBg: string;
    coverImg: string;
    palette: string[];
  }[] = [
    {
      id: 'minimalist',
      title: 'Minimalist Warm',
      description: 'Dominan putih dan krem hangat dengan tipografi serif klasik yang lapang, elegan, dan estetik.',
      tag: 'Paling Populer',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      coverImg: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80',
      palette: ['#faf8f5', '#9c7b4c', '#292524'],
    },
    {
      id: 'floral',
      title: 'Soft Floral Sage',
      description: 'Nuansa botanical sage green dan ornamen floral dedaunan lembut yang asri dan romantis.',
      tag: 'Trending',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      coverImg: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
      palette: ['#f0f4f1', '#4d7159', '#1e2d23'],
    },
    {
      id: 'dark-luxury',
      title: 'Dark Luxury & Gold',
      description: 'Latar belakang hitam & charcoal malam dengan kilau emas mewah (*gold accent*) berkelas istimewa.',
      tag: 'Eksklusif',
      badgeBg: 'bg-stone-800 text-gold-300 border-gold-500/40',
      coverImg: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80',
      palette: ['#0d0d0f', '#d4a853', '#fafaf9'],
    },
    {
      id: 'royal-vintage',
      title: 'Royal Vintage Burgundy',
      description: 'Nuansa tirai beludru maroon burgundy, chandelier mewah, dan ornamen vintage klasik ala kerajaan.',
      tag: 'New Release',
      badgeBg: 'bg-[#5c131f] text-[#faede7] border-[#912033]',
      coverImg: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=700&q=80',
      palette: ['#540c17', '#b88e63', '#f4efe8'],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-stone-900 tracking-tight">GoUndangan</span>
              <span className="text-[10px] block text-stone-400 -mt-1 font-medium">Auto-Deploy Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateDashboard}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium rounded-full transition-all shadow-sm cursor-pointer"
                >
                  Buka Dashboard
                </button>
                {onLogout && (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="p-2 text-stone-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onNavigateLogin}
                  className="px-4 py-2 text-stone-700 hover:text-stone-900 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  onClick={onNavigateLogin}
                  className="px-5 py-2 bg-gold-600 hover:bg-gold-500 text-stone-950 text-xs sm:text-sm font-semibold rounded-full transition-all shadow-md cursor-pointer"
                >
                  Daftar Gratis
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-800 text-xs font-semibold uppercase tracking-wider animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Undangan Digital Instan & Modern</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-tight">
            Buat Undangan Pernikahan Elegan, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-gold-500 to-amber-700">
              Langsung Jadi & Siap Sebar
            </span>
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Pilih tema favorit Anda, lengkapi profil mempelai dan detail acara, lalu dapatkan domain resmi 
            <span className="font-mono text-gold-700 font-medium"> .vercel.app</span> otomatis hanya dengan satu kali klik.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#katalog"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-stone-950 font-semibold text-sm sm:text-base rounded-full shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Pilih Template Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            {isLoggedIn && (
              <button
                onClick={onNavigateDashboard}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-sm font-medium rounded-full transition-all cursor-pointer shadow-sm"
              >
                Kelola Undangan Saya
              </button>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-8 border-t border-stone-200/60 text-center">
          <div className="p-4 space-y-1">
            <Globe className="w-5 h-5 text-gold-600 mx-auto mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-800">Domain Vercel Gratis</h4>
            <p className="text-[11px] text-stone-500">Auto-deployment otomatis ke cloud</p>
          </div>
          <div className="p-4 space-y-1">
            <Music className="w-5 h-5 text-gold-600 mx-auto mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-800">Autoplay Background Music</h4>
            <p className="text-[11px] text-stone-500">Floating audio player berputar</p>
          </div>
          <div className="p-4 space-y-1">
            <Smartphone className="w-5 h-5 text-gold-600 mx-auto mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-800">Nama Tamu Otomatis</h4>
            <p className="text-[11px] text-stone-500">Generator link URL khusus WhatsApp</p>
          </div>
          <div className="p-4 space-y-1">
            <ShieldCheck className="w-5 h-5 text-gold-600 mx-auto mb-2" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-800">RSVP & Amplop Digital</h4>
            <p className="text-[11px] text-stone-500">Salin rekening & ucapan doa real-time</p>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="katalog" className="py-16 px-6 bg-stone-100/70 border-t border-stone-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold">
              Koleksi Desain Eksklusif
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
              Pilih Tema Sesuai Karakter Cinta Anda
            </h2>
            <div className="w-16 h-0.5 bg-gold-400 mx-auto" />
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto">
              Semua tema telah dirancang responsif *mobile-first* dengan 8 bagian konten lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templateCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={card.coverImg}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm ${card.badgeBg}`}>
                      {card.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-stone-900/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    {card.palette.map((color, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-stone-900">{card.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">{card.description}</p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectTemplate(card.id)}
                      className="w-full py-2.5 px-4 bg-stone-900 hover:bg-gold-700 text-white text-xs sm:text-sm font-semibold rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Zap className="w-4 h-4 text-gold-400" />
                      <span>Gunakan Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(card.id)}
                      className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-200"
                    >
                      <Eye className="w-4 h-4 text-stone-500" />
                      <span>Lihat Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-10 px-6 text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-serif italic text-sm text-stone-300">
            "Momen istimewa Anda pantas dirayakan dengan keindahan yang abadi."
          </p>
          <p>© {new Date().getFullYear()} GoUndangan Platform. Powered by React, Vite, Tailwind CSS, & Vercel API.</p>
        </div>
      </footer>

      {/* Modal Preview Template */}
      {previewTheme && (
        <TemplatePreviewModal
          theme={previewTheme}
          onClose={() => setPreviewTheme(null)}
          onSelect={(selectedTheme) => {
            setPreviewTheme(null);
            onSelectTemplate(selectedTheme);
          }}
        />
      )}
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          onLogout?.();
        }}
      />
    </div>
  );
};
