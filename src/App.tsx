import React, { useState, useEffect, useRef } from 'react';
import { getInvitationData } from './invitationData';
import { getAuthToken } from './lib/api';
import { ThemeType, themes } from './themes';

// ─── Platform Pages ───
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { FormBuilderPage } from './pages/FormBuilderPage';
import { DeployProgressModal } from './pages/DeployProgressModal';
import { DashboardPage } from './pages/DashboardPage';

// ─── Invitation Template Components ───
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

// ─── Routing Pages ───
type AppPage =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'builder'
  | 'invitation-preview'; // Template mode (served via VITE_INVITATION_DATA)

/**
 * Mode Detection:
 * - Jika VITE_INVITATION_DATA terisi & bukan platform builder → render sebagai undangan final.
 * - Jika kosong → jalankan sebagai platform/builder UI.
 */
const isInvitationMode = (): boolean => {
  const envRaw = import.meta.env.VITE_INVITATION_DATA;
  return !!(envRaw && typeof envRaw === 'string' && envRaw.trim().length > 2);
};

// ═══════════════════════════════════════════════════
// ─── INVITATION TEMPLATE VIEW (produksi .vercel.app) ─
// ═══════════════════════════════════════════════════
const InvitationView: React.FC = () => {
  const data = getInvitationData();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeType>(data.theme || 'minimalist');
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
// ─── PLATFORM BUILDER APP (router utama) ──────────
// ═══════════════════════════════════════════════════
const PlatformApp: React.FC = () => {
  const [page, setPage] = useState<AppPage>(() => {
    return getAuthToken() ? 'dashboard' : 'landing';
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeType>('minimalist');
  const [editInvitationId, setEditInvitationId] = useState<string | null>(null);
  const [deployInvitationId, setDeployInvitationId] = useState<string | null>(null);

  const isLoggedIn = !!getAuthToken();

  const handleSelectTemplate = (template: ThemeType) => {
    setSelectedTemplate(template);
    if (isLoggedIn) {
      setEditInvitationId(null);
      setPage('builder');
    } else {
      setPage('auth');
    }
  };

  const handleAuthSuccess = () => {
    setEditInvitationId(null);
    setPage('builder');
  };

  const handlePublished = (invitationId: string) => {
    setDeployInvitationId(invitationId);
  };

  const handleEditInvitation = (id: string) => {
    setEditInvitationId(id);
    setPage('builder');
  };

  return (
    <>
      {page === 'landing' && (
        <LandingPage
          onSelectTemplate={handleSelectTemplate}
          onNavigateLogin={() => setPage('auth')}
          onNavigateDashboard={() => setPage('dashboard')}
          isLoggedIn={isLoggedIn}
        />
      )}

      {page === 'auth' && (
        <AuthPage
          onSuccess={handleAuthSuccess}
          onBack={() => setPage('landing')}
        />
      )}

      {page === 'dashboard' && (
        <DashboardPage
          onNavigateLanding={() => setPage('landing')}
          onCreateNew={() => { setEditInvitationId(null); setPage('builder'); }}
          onEditInvitation={handleEditInvitation}
        />
      )}

      {page === 'builder' && (
        <FormBuilderPage
          initialTemplate={selectedTemplate}
          editInvitationId={editInvitationId || undefined}
          onBack={() => setPage(isLoggedIn ? 'dashboard' : 'landing')}
          onPublished={handlePublished}
          onSaved={() => { /* Toast / notif bisa ditambah di sini */ }}
        />
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

// ═══════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────
// ═══════════════════════════════════════════════════
export const App: React.FC = () => {
  if (isInvitationMode()) {
    return <InvitationView />;
  }
  return <PlatformApp />;
};

export default App;
