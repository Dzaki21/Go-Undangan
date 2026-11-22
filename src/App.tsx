import React, { useState, useEffect, useRef } from 'react';
import { getInvitationData } from './invitationData';
import { ThemeType, themes } from './themes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Role } from './types/api';

// ─── Platform Pages ───
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { DeployProgressModal } from './pages/DeployProgressModal';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// ─── Invitation Template Components (untuk live deployment .vercel.app) ───
import { CoverSection } from './components/CoverSection';
import { GreetingQuoteSection } from './components/GreetingQuoteSection';
import { CoupleProfileSection } from './components/CoupleProfileSection';
import { EventScheduleSection } from './components/EventScheduleSection';
import { LoveStorySection } from './components/LoveStorySection';
import { GallerySection } from './components/GallerySection';
import { WeddingGiftSection } from './components/WeddingGiftSection';
import { RsvpSection } from './components/RsvpSection';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { DevThemeSwitcher } from './components/DevThemeSwitcher';

type AppPage =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'admin-dashboard'
  | 'builder';

const isInvitationMode = (): boolean => {
  const envRaw = import.meta.env.VITE_INVITATION_DATA;
  return !!(envRaw && typeof envRaw === 'string' && envRaw.trim().length > 2);
};

// ═══════════════════════════════════════════════════
// ─── INVITATION TEMPLATE VIEW (produksi .vercel.app) ─
// ═══════════════════════════════════════════════════
const InvitationView: React.FC = () => {
  const initialData = getInvitationData();
  const [data, setData] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeType>(data.theme || 'minimalist');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ambil data terbaru secara dinamis dari API server jika tersedia
  useEffect(() => {
    const slug = initialData.slug || (typeof window !== 'undefined' ? window.location.hostname.replace('undangan-', '').replace('.vercel.app', '') : null);
    const apiBase = initialData.apiBaseUrl || 'https://go-undangan-api.up.railway.app' || 'http://localhost:5000';

    if (slug) {
      fetch(`${apiBase}/api/public/wishes/invitation/${slug}`)
        .then(r => r.json())
        .then(res => {
          if (res.success && res.data) {
            setData(prev => ({
              ...prev,
              ...res.data,
              quote: { ...prev.quote, ...(res.data.quote || {}) },
              groom: { ...prev.groom, ...(res.data.groom || {}) },
              bride: { ...prev.bride, ...(res.data.bride || {}) },
              events: {
                akad: { ...prev.events.akad, ...(res.data.events?.akad || {}) },
                resepsi: res.data.events?.resepsi
                  ? { ...prev.events.resepsi, ...res.data.events.resepsi }
                  : prev.events.resepsi,
              },
              gifts: {
                accounts: res.data.gifts?.accounts ?? prev.gifts?.accounts ?? [],
                physicalGift: res.data.gifts?.physicalGift ?? prev.gifts?.physicalGift,
              },
            }));
            if (res.data.theme && themes[res.data.theme as ThemeType]) {
              setActiveTheme(res.data.theme as ThemeType);
            }
          }
        })
        .catch(() => {
          // Fallback ke data bundel jika offline
        });
    }
  }, []);

  const currentThemeConfig = themes[activeTheme] || themes.minimalist;

  useEffect(() => {
    if (data.theme && themes[data.theme]) setActiveTheme(data.theme);
  }, [data.theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    if (toParam && toParam.trim() !== '') setGuestName(toParam.trim());
    if (data.meta?.title) document.title = data.meta.title;
  }, [data.meta?.title]);

  useEffect(() => {
    if (!isOpen) { document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); }
    else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${currentThemeConfig.pageBg}`}>
      {data.music?.audioUrl && <audio ref={audioRef} src={data.music.audioUrl} loop preload="auto" onEnded={() => setIsPlaying(false)} />}
      <CoverSection data={data} guestName={guestName} isOpen={isOpen} themeConfig={currentThemeConfig} onOpenInvitation={handleOpenInvitation} />
      <main className={`w-full max-w-xl mx-auto shadow-2xl overflow-hidden border-x transition-colors duration-500 ${currentThemeConfig.containerBg} ${currentThemeConfig.containerBorder}`}>
        <GreetingQuoteSection quote={data.quote} themeConfig={currentThemeConfig} />
        <CoupleProfileSection groom={data.groom} bride={data.bride} themeConfig={currentThemeConfig} />
        <EventScheduleSection eventDateIso={data.eventDateIso} akad={data.events.akad} resepsi={data.events.resepsi} themeConfig={currentThemeConfig} />
        <LoveStorySection loveStory={data.loveStory} themeConfig={currentThemeConfig} />
        <GallerySection gallery={data.gallery} themeConfig={currentThemeConfig} />
        <WeddingGiftSection gifts={data.gifts} themeConfig={currentThemeConfig} />
        <RsvpSection defaultComments={data.defaultComments} groomNick={data.groom.nickName} brideNick={data.bride.nickName} themeConfig={currentThemeConfig} />
      </main>
      {isOpen && data.music?.audioUrl && <FloatingMusicPlayer audioRef={audioRef} isPlaying={isPlaying} themeConfig={currentThemeConfig} onTogglePlay={handleTogglePlay} />}
      <DevThemeSwitcher currentTheme={activeTheme} onThemeChange={setActiveTheme} />
    </div>
  );
};

// ═══════════════════════════════════════════════════
// ─── PLATFORM BUILDER APP (Router + Role Handler) ──
// ═══════════════════════════════════════════════════
const PlatformApp: React.FC = () => {
  const { role, isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState<AppPage>('landing');
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeType>('minimalist');
  const [editInvitationId, setEditInvitationId] = useState<string | null>(null);
  const [deployInvitationId, setDeployInvitationId] = useState<string | null>(null);

  // Saat pertama kali load atau saat auth status berubah: arahkan ke dashboard yang sesuai
  useEffect(() => {
    if (isAuthenticated && role) {
      if (page === 'auth') {
        if (role === 'ADMIN') {
          setPage('admin-dashboard');
        } else {
          setPage('dashboard');
        }
      }
    }
  }, [isAuthenticated, role]);

  const handleSelectTemplate = (template: ThemeType) => {
    setSelectedTemplate(template);
    if (isAuthenticated) {
      setEditInvitationId(null);
      setPage('builder');
    } else {
      setPage('auth');
    }
  };

  const handleAuthSuccess = (loggedRole: Role) => {
    if (loggedRole === 'ADMIN') {
      setPage('admin-dashboard');
    } else {
      setPage('dashboard');
    }
  };

  const handlePublished = (invitationId: string) => {
    setDeployInvitationId(invitationId);
  };

  const handleEditInvitation = (id: string) => {
    setEditInvitationId(id);
    setPage('builder');
  };

  const handleLogout = () => {
    logout();
    setPage('landing');
  };

  return (
    <>
      {page === 'landing' && (
        <LandingPage
          onSelectTemplate={handleSelectTemplate}
          onNavigateLogin={() => setPage('auth')}
          onNavigateDashboard={() => {
            if (role === 'ADMIN') setPage('admin-dashboard');
            else setPage('dashboard');
          }}
          isLoggedIn={isAuthenticated}
        />
      )}

      {page === 'auth' && (
        <AuthPage
          onSuccess={handleAuthSuccess}
          onBack={() => setPage('landing')}
        />
      )}

      {/* USER DASHBOARD (/dashboard) */}
      {page === 'dashboard' && (
        <ProtectedRoute
          allowedRole="USER"
          onRedirectToLogin={() => setPage('auth')}
          onRedirectToDashboard={() => setPage('dashboard')}
          onRedirectToAdminDashboard={() => setPage('admin-dashboard')}
        >
          <DashboardPage
            onNavigateLanding={() => setPage('landing')}
            onCreateNew={() => { setEditInvitationId(null); setPage('builder'); }}
            onEditInvitation={handleEditInvitation}
            onDeployInvitation={(id) => setDeployInvitationId(id)}
          />
        </ProtectedRoute>
      )}

      {/* ADMIN DASHBOARD (/admin/dashboard) */}
      {page === 'admin-dashboard' && (
        <ProtectedRoute
          allowedRole="ADMIN"
          onRedirectToLogin={() => setPage('auth')}
          onRedirectToDashboard={() => setPage('dashboard')}
          onRedirectToAdminDashboard={() => setPage('admin-dashboard')}
        >
          <AdminDashboardPage
            onLogout={handleLogout}
            onNavigateHome={() => setPage('landing')}
          />
        </ProtectedRoute>
      )}

      {/* FORM BUILDER (/builder) */}
      {page === 'builder' && (
        <ProtectedRoute
          allowedRole="USER"
          onRedirectToLogin={() => setPage('auth')}
          onRedirectToDashboard={() => setPage('dashboard')}
          onRedirectToAdminDashboard={() => setPage('admin-dashboard')}
        >
          <FormBuilderPage
            initialTemplate={selectedTemplate}
            editInvitationId={editInvitationId || undefined}
            onBack={() => setPage('dashboard')}
            onPublished={handlePublished}
            onSaved={() => {}}
          />
        </ProtectedRoute>
      )}

      {/* Deploy Progress Modal (overlay) */}
      {deployInvitationId && (
        <DeployProgressModal
          invitationId={deployInvitationId}
          onClose={() => setDeployInvitationId(null)}
          onDone={() => { setDeployInvitationId(null); setPage('dashboard'); }}
        />
      )}
    </>
  );
};

export const App: React.FC = () => {
  if (isInvitationMode()) {
    return <InvitationView />;
  }
  return (
    <AuthProvider>
      <PlatformApp />
    </AuthProvider>
  );
};

export default App;
